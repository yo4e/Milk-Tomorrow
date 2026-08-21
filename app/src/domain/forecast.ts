export type DayKind = "weekday" | "weekend";

export type MemberConsumptionProfile = {
  id: string;
  name: string;
  weekdayProbability: number;
  weekendProbability: number;
  meanPortionMl: number;
  portionVariation: number;
};

export type ForecastInput = {
  now: number;
  timezone: string;
  stockMl: number;
  safetyReserveMl: number;
  packageSizeMl: number;
  members: MemberConsumptionProfile[];
  horizonHours: number;
  coverageHours: number;
  trials: number;
  seed: number;
  demandAdjustment?: number;
};

export type ForecastPoint = {
  hour: number;
  risk: number;
  riskPercent: number;
  p10RemainingMl: number;
  medianRemainingMl: number;
  p90RemainingMl: number;
};

export type ForecastResult = {
  points: ForecastPoint[];
  risk: number;
  riskPercent: number;
  riskLevel: "low" | "medium" | "high";
  medianRunoutHour: number | null;
  recommendedPackages: number;
  p90CoverageConsumptionMl: number;
  weekendLiftPoints: number;
  trialCount: number;
};

const HOUR_MS = 60 * 60 * 1000;

const hourlyConsumptionWeights = new Map<number, number>([
  [7, 0.36],
  [8, 0.34],
  [12, 0.08],
  [16, 0.05],
  [19, 0.12],
  [20, 0.05],
]);

const localClockCache = new Map<string, Intl.DateTimeFormat>();

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function localClock(timezone: string) {
  const cached = localClockCache.get(timezone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  });
  localClockCache.set(timezone, formatter);
  return formatter;
}

function localDayAndHour(timestamp: number, timezone: string) {
  const parts = localClock(timezone).formatToParts(timestamp);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  return {
    dayKind: weekday === "Sat" || weekday === "Sun" ? ("weekend" as const) : ("weekday" as const),
    hour,
  };
}

export function dayKindAt(timestamp: number, timezone: string): DayKind {
  return localDayAndHour(timestamp, timezone).dayKind;
}

export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleNormal(random: () => number) {
  const first = Math.max(Number.EPSILON, random());
  const second = Math.max(Number.EPSILON, random());
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function memberProbability(member: MemberConsumptionProfile, kind: DayKind) {
  return kind === "weekend" ? member.weekendProbability : member.weekdayProbability;
}

function expectedConsumptionForHour(
  input: ForecastInput,
  timestamp: number,
  memberOverride?: MemberConsumptionProfile[],
) {
  const { dayKind, hour } = localDayAndHour(timestamp, input.timezone);
  const hourWeight = hourlyConsumptionWeights.get(hour) ?? 0;
  const adjustment = input.demandAdjustment ?? 1;
  const members = memberOverride ?? input.members;

  return members.reduce(
    (total, member) =>
      total +
      memberProbability(member, dayKind) *
        hourWeight *
        member.meanPortionMl *
        adjustment,
    0,
  );
}

export function simulateExpectedPath(input: ForecastInput) {
  const points = [{ hour: 0, remainingMl: input.stockMl }];
  let remainingMl = input.stockMl;
  let firstThresholdHour: number | null =
    remainingMl <= input.safetyReserveMl ? 0 : null;

  for (let hour = 1; hour <= input.horizonHours; hour += 1) {
    const midpoint = input.now + (hour - 0.5) * HOUR_MS;
    remainingMl -= expectedConsumptionForHour(input, midpoint);
    points.push({ hour, remainingMl });

    if (firstThresholdHour === null && remainingMl <= input.safetyReserveMl) {
      firstThresholdHour = hour;
    }
  }

  return { points, firstThresholdHour };
}

export function estimateStockAfterHours(input: ForecastInput, hours: number) {
  const elapsedHours = Math.max(0, Math.round(hours));
  if (elapsedHours === 0) return Math.max(0, input.stockMl);

  const path = simulateExpectedPath({ ...input, horizonHours: elapsedHours });
  return Math.max(0, path.points.at(-1)?.remainingMl ?? input.stockMl);
}

function quantile(sorted: number[], probability: number) {
  if (sorted.length === 0) return 0;
  const index = clamp(probability, 0, 1) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

type TrialRun = {
  remainingByHour: number[][];
  runoutHours: Array<number | null>;
  coverageConsumption: number[];
};

function runTrials(
  input: ForecastInput,
  memberOverride: MemberConsumptionProfile[] | undefined,
  trials: number,
  seed: number,
): TrialRun {
  const maximumHour = Math.max(input.horizonHours, input.coverageHours);
  const remainingByHour = Array.from({ length: input.horizonHours + 1 }, () => [] as number[]);
  const runoutHours: Array<number | null> = [];
  const coverageConsumption: number[] = [];
  const members = memberOverride ?? input.members;
  const adjustment = input.demandAdjustment ?? 1;

  for (let trial = 0; trial < trials; trial += 1) {
    const random = mulberry32(seed + trial * 7919);
    let remainingMl = input.stockMl;
    let firstThresholdHour: number | null =
      remainingMl <= input.safetyReserveMl ? 0 : null;
    let consumedMl = 0;
    remainingByHour[0].push(remainingMl);

    for (let hour = 1; hour <= maximumHour; hour += 1) {
      const midpoint = input.now + (hour - 0.5) * HOUR_MS;
      const { dayKind, hour: localHour } = localDayAndHour(midpoint, input.timezone);
      const hourWeight = hourlyConsumptionWeights.get(localHour) ?? 0;

      if (hourWeight > 0) {
        for (const member of members) {
          const eventProbability = clamp(
            memberProbability(member, dayKind) * hourWeight,
            0,
            1,
          );

          if (random() <= eventProbability) {
            const portionScale = clamp(
              1 + sampleNormal(random) * member.portionVariation,
              0.55,
              1.6,
            );
            const portionMl = member.meanPortionMl * portionScale * adjustment;
            consumedMl += portionMl;
            remainingMl -= portionMl;
          }
        }
      }

      if (firstThresholdHour === null && remainingMl <= input.safetyReserveMl) {
        firstThresholdHour = hour;
      }

      if (hour <= input.horizonHours) {
        remainingByHour[hour].push(remainingMl);
      }
    }

    runoutHours.push(firstThresholdHour);
    coverageConsumption.push(consumedMl);
  }

  return { remainingByHour, runoutHours, coverageConsumption };
}

function pointsFromTrials(input: ForecastInput, trials: TrialRun): ForecastPoint[] {
  return trials.remainingByHour.map((remainingValues, hour) => {
    const sorted = [...remainingValues].sort((left, right) => left - right);
    const runoutCount = remainingValues.filter(
      (remaining) => remaining <= input.safetyReserveMl,
    ).length;
    const risk = runoutCount / remainingValues.length;

    return {
      hour,
      risk,
      riskPercent: Math.round(risk * 100),
      p10RemainingMl: Math.max(0, Math.round(quantile(sorted, 0.1))),
      medianRemainingMl: Math.max(0, Math.round(quantile(sorted, 0.5))),
      p90RemainingMl: Math.max(0, Math.round(quantile(sorted, 0.9))),
    };
  });
}

function riskFromTrialsAtHorizon(input: ForecastInput, trials: TrialRun) {
  const horizonValues = trials.remainingByHour[input.horizonHours] ?? [];
  return (
    horizonValues.filter((remaining) => remaining <= input.safetyReserveMl).length /
    Math.max(1, horizonValues.length)
  );
}

function counterfactualWeekendLift(input: ForecastInput, baselineRisk: number) {
  const weekdayOnlyMembers = input.members.map((member) => ({
    ...member,
    weekendProbability: member.weekdayProbability,
  }));
  const sampleCount = Math.min(500, input.trials);
  const counterfactualTrials = runTrials(
    input,
    weekdayOnlyMembers,
    sampleCount,
    input.seed + 4441,
  );
  const counterfactualRisk = riskFromTrialsAtHorizon(input, counterfactualTrials);
  return Math.max(0, Math.round((baselineRisk - counterfactualRisk) * 100));
}

export function packagesForNeed(neededMl: number, packageSizeMl: number) {
  if (packageSizeMl <= 0) throw new Error("packageSizeMl must be greater than zero");
  return Math.ceil(Math.max(0, neededMl) / packageSizeMl);
}

export function runForecast(input: ForecastInput): ForecastResult {
  const normalizedInput: ForecastInput = {
    ...input,
    horizonHours: Math.max(1, Math.round(input.horizonHours)),
    coverageHours: Math.max(input.horizonHours, Math.round(input.coverageHours)),
    trials: Math.max(100, Math.round(input.trials)),
  };
  const trials = runTrials(
    normalizedInput,
    undefined,
    normalizedInput.trials,
    normalizedInput.seed,
  );
  const points = pointsFromTrials(normalizedInput, trials);
  const risk = points.at(-1)?.risk ?? 0;
  const riskPercent = Math.round(risk * 100);
  const crossed = trials.runoutHours
    .filter((hour): hour is number => hour !== null)
    .sort((left, right) => left - right);
  const medianRunoutHour = crossed.length >= normalizedInput.trials / 2
    ? Math.round(quantile(crossed, 0.5))
    : null;
  const sortedCoverage = [...trials.coverageConsumption].sort((left, right) => left - right);
  const p90CoverageConsumptionMl = Math.round(quantile(sortedCoverage, 0.9));
  const neededMl = Math.max(
    0,
    p90CoverageConsumptionMl + normalizedInput.safetyReserveMl - normalizedInput.stockMl,
  );
  const recommendedPackages = packagesForNeed(neededMl, normalizedInput.packageSizeMl);

  return {
    points,
    risk,
    riskPercent,
    riskLevel: risk >= 0.7 ? "high" : risk >= 0.3 ? "medium" : "low",
    medianRunoutHour,
    recommendedPackages,
    p90CoverageConsumptionMl,
    weekendLiftPoints: counterfactualWeekendLift(normalizedInput, risk),
    trialCount: normalizedInput.trials,
  };
}

export const demoMembers: MemberConsumptionProfile[] = [
  {
    id: "aki",
    name: "Aki",
    weekdayProbability: 0.82,
    weekendProbability: 0.97,
    meanPortionMl: 210,
    portionVariation: 0.18,
  },
  {
    id: "ken",
    name: "Ken",
    weekdayProbability: 0.78,
    weekendProbability: 0.96,
    meanPortionMl: 185,
    portionVariation: 0.2,
  },
  {
    id: "ren",
    name: "Ren",
    weekdayProbability: 0.86,
    weekendProbability: 1,
    meanPortionMl: 235,
    portionVariation: 0.16,
  },
  {
    id: "hana",
    name: "Hana",
    weekdayProbability: 0.72,
    weekendProbability: 0.92,
    meanPortionMl: 165,
    portionVariation: 0.2,
  },
  {
    id: "yumi",
    name: "Yumi",
    weekdayProbability: 0.68,
    weekendProbability: 0.88,
    meanPortionMl: 150,
    portionVariation: 0.22,
  },
];

export const demoForecastBase: Omit<ForecastInput, "now" | "stockMl" | "horizonHours"> = {
  timezone: "Asia/Tokyo",
  safetyReserveMl: 340,
  packageSizeMl: 1000,
  members: demoMembers,
  coverageHours: 48,
  trials: 1000,
  seed: 260821,
};
