import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  attemptClaim,
  completeRequest,
  createOrReuseRequest,
  reopenIfSnoozeExpired,
  snoozeRequest,
  type ReplenishmentRequest,
} from "../domain/coordination";
import {
  demoForecastBase,
  demoMembers,
  estimateStockAfterHours,
  runForecast,
  type ForecastResult,
} from "../domain/forecast";

const STORAGE_KEY = "milk-tomorrow.demo.v3";
const CHANNEL_NAME = "milk-tomorrow-household";
const DEMO_START = "2026-08-20T22:00:00.000Z";
const FIRST_BREAKFAST = Date.parse("2026-08-22T00:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const OBSERVATION_SNOOZE_HOURS = 12;

export type ActivityEntry = {
  id: string;
  at: string;
  text: string;
  tone: "forecast" | "claim" | "purchase" | "observation";
};

export type StockObservation = {
  kind: "still_available";
  observedAt: string;
};

export type DemoHouseholdState = {
  version: 3;
  now: string;
  stockMl: number;
  demandAdjustment: number;
  request: ReplenishmentRequest;
  observations: StockObservation[];
  activity: ActivityEntry[];
};

type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

function initialRequest() {
  return createOrReuseRequest(null, "milk", "milk-friday-breakfast", 2);
}

export function createInitialDemoState(): DemoHouseholdState {
  return {
    version: 3,
    now: DEMO_START,
    stockMl: 1200,
    demandAdjustment: 1,
    request: initialRequest(),
    observations: [],
    activity: [
      {
        id: "forecast-start",
        at: DEMO_START,
        text: "Milk Tomorrow spotted a weekend shortage.",
        tone: "forecast",
      },
    ],
  };
}

function parseStoredState(raw: string | null): DemoHouseholdState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DemoHouseholdState>;
    return parsed.version === 3 ? (parsed as DemoHouseholdState) : null;
  } catch {
    return null;
  }
}

function readSharedState() {
  if (typeof window === "undefined") return createInitialDemoState();
  return parseStoredState(window.localStorage.getItem(STORAGE_KEY)) ?? createInitialDemoState();
}

function nextBreakfastAfter(now: number) {
  if (now < FIRST_BREAKFAST) return FIRST_BREAKFAST;
  const elapsedDays = Math.floor((now - FIRST_BREAKFAST) / DAY_MS) + 1;
  return FIRST_BREAKFAST + elapsedDays * DAY_MS;
}

function activityId(prefix: string, at: string) {
  return `${prefix}-${Date.parse(at)}-${Math.round(Math.random() * 1000)}`;
}

export function useDemoHousehold() {
  const [state, setState] = useState<DemoHouseholdState>(readSharedState);
  const [activeMemberId, setActiveMemberId] = useState("aki");
  const [lastMessage, setLastMessage] = useState(
    "Milk has an 89% chance of running short by Saturday breakfast.",
  );
  const stateRef = useRef(state);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<DemoHouseholdState>) => {
      if (event.data?.version !== 3) return;
      stateRef.current = event.data;
      setState(event.data);
      setLastMessage("Your household forecast just updated.");
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = parseStoredState(event.newValue);
      if (!next) return;
      stateRef.current = next;
      setState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback(
    async (reducer: (current: DemoHouseholdState) => DemoHouseholdState) => {
      const apply = async () => {
        const current = readSharedState();
        const next = reducer(current);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        stateRef.current = next;
        setState(next);
        channelRef.current?.postMessage(next);
        return next;
      };

      const lockManager = (navigator as Navigator & { locks?: LockManagerLike }).locks;
      return lockManager ? lockManager.request(STORAGE_KEY, apply) : apply();
    },
    [],
  );

  const nowMs = Date.parse(state.now);
  const breakfastDeadline = nextBreakfastAfter(nowMs);
  const horizonHours = Math.max(1, Math.round((breakfastDeadline - nowMs) / HOUR_MS));
  const forecast = useMemo<ForecastResult>(
    () =>
      runForecast({
        ...demoForecastBase,
        now: nowMs,
        stockMl: state.stockMl,
        horizonHours,
        demandAdjustment: state.demandAdjustment,
      }),
    [horizonHours, nowMs, state.demandAdjustment, state.stockMl],
  );

  const activeMember =
    demoMembers.find((member) => member.id === activeMemberId) ?? demoMembers[0];

  const claim = useCallback(async () => {
    let won = false;
    await commit((current) => {
      const outcome = attemptClaim(
        current.request,
        activeMember.id,
        activeMember.name,
        current.now,
      );
      won = outcome.won;
      if (!won) return current;

      return {
        ...current,
        request: outcome.request,
        activity: [
          {
            id: activityId("claim", current.now),
            at: current.now,
            text: `${activeMember.name} volunteered to bring home 2 bottles.`,
            tone: "claim",
          },
          ...current.activity,
        ],
      };
    });
    setLastMessage(
      won
        ? `Thank you. ${activeMember.name} has the milk covered.`
        : `${stateRef.current.request.claimedByName ?? "Someone"} already has it covered.`,
    );
    return won;
  }, [activeMember.id, activeMember.name, commit]);

  const markPurchased = useCallback(async () => {
    let completed = false;
    await commit((current) => {
      const outcome = completeRequest(current.request, activeMember.id, current.now);
      completed = outcome.completed;
      if (!completed) return current;
      const packages = Math.max(1, current.request.recommendedPackages);

      return {
        ...current,
        stockMl: current.stockMl + packages * demoForecastBase.packageSizeMl,
        request: outcome.request,
        activity: [
          {
            id: activityId("purchase", current.now),
            at: current.now,
            text: `${activeMember.name} added ${packages} bottles. The next forecast moved later.`,
            tone: "purchase",
          },
          ...current.activity,
        ],
      };
    });
    setLastMessage(
      completed
        ? "Purchase recorded. The shortage risk has moved safely into the future."
        : "Only the family member who claimed this can mark it purchased.",
    );
    return completed;
  }, [activeMember.id, activeMember.name, commit]);

  const reportStillAvailable = useCallback(async () => {
    await commit((current) => {
      const snoozedUntil = new Date(
        Date.parse(current.now) + OBSERVATION_SNOOZE_HOURS * HOUR_MS,
      ).toISOString();
      const request = snoozeRequest(current.request, snoozedUntil);
      if (request === current.request) return current;

      return {
        ...current,
        demandAdjustment: Math.max(0.82, current.demandAdjustment * 0.92),
        request,
        observations: [
          { kind: "still_available", observedAt: current.now },
          ...current.observations,
        ],
        activity: [
          {
            id: activityId("observation", current.now),
            at: current.now,
            text: `The family said some milk remains. Alerts are paused for ${OBSERVATION_SNOOZE_HOURS} hours.`,
            tone: "observation",
          },
          ...current.activity,
        ],
      };
    });
    setLastMessage("Got it. We will check again tonight instead of guessing the amount left.");
  }, [commit]);

  const advanceTime = useCallback(
    async (hours: number) => {
      await commit((current) => {
        const elapsedHours = Math.max(0, Math.round(hours));
        const expectedStockMl = estimateStockAfterHours(
          {
            ...demoForecastBase,
            now: Date.parse(current.now),
            stockMl: current.stockMl,
            horizonHours: elapsedHours || 1,
            demandAdjustment: current.demandAdjustment,
          },
          elapsedHours,
        );
        const now = new Date(
          Date.parse(current.now) + elapsedHours * HOUR_MS,
        ).toISOString();
        return {
          ...current,
          now,
          stockMl: Math.max(0, expectedStockMl),
          request: reopenIfSnoozeExpired(current.request, now),
        };
      });
      setLastMessage(`Demo time moved forward ${Math.max(0, Math.round(hours))} hours.`);
    },
    [commit],
  );

  const reset = useCallback(async () => {
    await commit(() => createInitialDemoState());
    setActiveMemberId("aki");
    setLastMessage("Demo reset to Friday morning.");
  }, [commit]);

  return {
    state,
    forecast,
    breakfastDeadline,
    horizonHours,
    activeMember,
    activeMemberId,
    setActiveMemberId,
    lastMessage,
    claim,
    markPurchased,
    reportStillAvailable,
    advanceTime,
    observationSnoozeHours: OBSERVATION_SNOOZE_HOURS,
    reset,
    members: demoMembers,
  };
}
