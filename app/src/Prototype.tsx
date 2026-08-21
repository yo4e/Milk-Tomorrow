import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import {
  BarChartIcon,
  CheckCircledIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  HomeIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { assetUrl } from "./assetUrl";
import { useDemoHousehold } from "./demo/useDemoHousehold";
import { BottomSheet, MobileScroll } from "./mobile";
import "./prototype.css";

// The protected mobile runtime remains available as a judge/debug preview, but
// the product URL behaves like a normal mobile-first responsive web app.
if (typeof document !== "undefined" && typeof window !== "undefined") {
  const previewMode = new URLSearchParams(window.location.search).get("preview");
  document.documentElement.dataset.milkTomorrowDisplay = previewMode === "phone" ? "phone" : "web";
}

function formatHeaderDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(Date.parse(iso));
}

function formatBreakfastDeadline(timestamp: number) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(timestamp);
  return `${weekday} breakfast`;
}

function formatActivityTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(Date.parse(iso));
}

function smoothSvgPath(nodes: Array<{ x: number; y: number }>) {
  if (nodes.length === 0) return "";
  return nodes.slice(1).reduce((path, node, index) => {
    const previous = nodes[index];
    const controlX = (previous.x + node.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${node.y}, ${node.x} ${node.y}`;
  }, `M ${nodes[0].x} ${nodes[0].y}`);
}

function ForecastChart({
  points,
  horizonHours,
  riskPercent,
  riskLevel,
  deadlineLabel,
}: {
  points: Array<{ hour: number; riskPercent: number }>;
  horizonHours: number;
  riskPercent: number;
  riskLevel: "low" | "medium" | "high";
  deadlineLabel: string;
}) {
  const chartData = useMemo(() => {
    const sampleHours = new Set([
      0,
      Math.round(horizonHours * 0.24),
      Math.round(horizonHours * 0.46),
      Math.round(horizonHours * 0.7),
      horizonHours,
    ]);
    return points
      .filter((point) => sampleHours.has(point.hour))
      .map((point) => ({ hour: point.hour, risk: point.riskPercent }));
  }, [horizonHours, points]);

  const plot = useMemo(() => {
    const width = 340;
    const height = 100;
    const nodes = chartData.map((point) => ({
      x: (point.hour / Math.max(1, horizonHours)) * width,
      y: 7 + (1 - point.risk / 100) * (height - 14),
    }));
    const linePath = smoothSvgPath(nodes);
    const first = nodes[0] ?? { x: 0, y: height };
    const last = nodes.at(-1) ?? first;
    return {
      areaPath: `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`,
      endpointY: last.y,
      linePath,
      width,
      height,
    };
  }, [chartData, horizonHours]);

  const tonightHour = Math.min(12, Math.max(5, Math.round(horizonHours * 0.34)));
  const morningHour = Math.min(
    horizonHours - 1,
    Math.max(tonightHour + 1, Math.round(horizonHours * 0.63)),
  );
  const shortHorizon = horizonHours <= 12;

  return (
    <figure className="forecast-figure" aria-label={`Shortage risk rises to ${riskPercent}% by ${deadlineLabel}`}>
      <div
        className={`risk-bubble risk-bubble--${riskLevel}`}
        style={{ top: `${7 + (1 - riskPercent / 100) * 79}%` }}
        aria-hidden="true"
      >
        {riskPercent}%
      </div>
      <div className="forecast-plot">
        <svg viewBox={`0 0 ${plot.width} ${plot.height}`} preserveAspectRatio="none" aria-hidden="true">
          <line
            className="forecast-guide"
            x1="0"
            y1={plot.endpointY}
            x2={plot.width}
            y2={plot.endpointY}
          />
          <path className="forecast-area" d={plot.areaPath} />
          <path className="forecast-line" d={plot.linePath} />
          <line
            className="forecast-tick"
            x1={(tonightHour / horizonHours) * plot.width}
            y1={plot.height - 6}
            x2={(tonightHour / horizonHours) * plot.width}
            y2={plot.height + 4}
          />
          <line
            className="forecast-tick"
            x1={(morningHour / horizonHours) * plot.width}
            y1={plot.height - 6}
            x2={(morningHour / horizonHours) * plot.width}
            y2={plot.height + 4}
          />
          <line
            className="forecast-deadline"
            x1={plot.width - 1}
            y1="0"
            x2={plot.width - 1}
            y2={plot.height}
          />
          <circle className="forecast-start" cx="1" cy={plot.height} r="4.5" />
          <circle
            className="forecast-endpoint"
            cx={plot.width - 1}
            cy={plot.endpointY}
            r="5"
          />
        </svg>
      </div>
      <div className="forecast-axis" aria-hidden="true">
        <span>Now</span>
        <span style={{ left: `${(tonightHour / horizonHours) * 100}%` }}>
          {shortHorizon ? "Later" : "Tonight"}
        </span>
        <span style={{ left: `${(morningHour / horizonHours) * 100}%` }}>
          {shortHorizon ? "Morning" : "Sat morning"}
        </span>
        <span>{deadlineLabel}</span>
      </div>
    </figure>
  );
}

function BottlePair() {
  return (
    <div className="bottle-pair" aria-hidden="true">
      <img src={assetUrl("assets/milk-tomorrow/milk-bottle.png")} alt="" draggable="false" />
      <img src={assetUrl("assets/milk-tomorrow/milk-bottle.png")} alt="" draggable="false" />
    </div>
  );
}

export default function Prototype() {
  const [labOpen, setLabOpen] = useState(false);
  const {
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
    observationSnoozeHours,
    reset,
    members,
  } = useDemoHousehold();

  const request = state.request;
  const deadlineLabel = formatBreakfastDeadline(breakfastDeadline);
  const isOpen = request.status === "open";
  const isClaimed = request.status === "claimed";
  const isMine = isClaimed && request.claimedByMemberId === activeMemberId;
  const isCompleted = request.status === "completed";
  const isSnoozed = request.status === "snoozed";
  const isLowRiskOpen = isOpen && forecast.riskLevel === "low";
  const packages = Math.max(1, forecast.recommendedPackages || request.recommendedPackages);

  const openHeadline = forecast.riskLevel === "high"
    ? { prefix: "Milk:", accent: "high", suffix: "chance of running out" }
    : forecast.riskLevel === "medium"
      ? { prefix: "Milk:", accent: "could run short", suffix: "before breakfast" }
      : { prefix: "Milk:", accent: "likely enough", suffix: "until breakfast" };

  const headline = isCompleted
    ? { prefix: "Milk:", accent: "safely stocked", suffix: "for the next few days" }
    : isClaimed
      ? {
          prefix: "Milk:",
          accent: `${request.claimedByName ?? "Someone"} has it`,
          suffix: "covered before breakfast",
        }
      : isSnoozed
        ? { prefix: "Milk:", accent: "check again", suffix: "tonight" }
        : openHeadline;

  const primaryLabel = isCompleted
    ? "Run the demo again"
    : isMine
      ? `Bought ${request.recommendedPackages} bottles`
      : isClaimed
        ? `${request.claimedByName} has it covered`
        : isSnoozed
          ? "Move to tonight"
          : isLowRiskOpen
            ? "See why it changed"
            : "I’ll get it";

  const handlePrimary = async () => {
    if (isCompleted) return reset();
    if (isMine) return markPurchased();
    if (isClaimed) return undefined;
    if (isSnoozed) return advanceTime(observationSnoozeHours);
    if (isLowRiskOpen) return setLabOpen(true);
    return claim();
  };

  return (
    <>
      <MobileScroll className="app-screen milk-app-screen">
        <main className="home-forecast" data-testid="home-forecast" aria-labelledby="app-title">
          <img
            className="forecast-clouds"
            src={assetUrl("assets/milk-tomorrow/forecast-clouds.png")}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <header className="app-heading">
            <h1 id="app-title">Milk Tomorrow</h1>
            <p>Home forecast · {formatHeaderDate(state.now)}</p>
          </header>

          <section
            className={`hero-forecast hero-forecast--${request.status} hero-forecast--risk-${forecast.riskLevel}`}
            aria-labelledby="forecast-title"
          >
            <img
              className="hero-bottle"
              src={assetUrl("assets/milk-tomorrow/milk-bottle.png")}
              alt="A glass bottle of milk"
              draggable="false"
            />
            <h2 id="forecast-title">
              <span>{headline.prefix}</span>{" "}
              <strong>{headline.accent}</strong>{" "}
              <span>{headline.suffix}</span>
            </h2>
          </section>

          <ForecastChart
            points={forecast.points}
            horizonHours={horizonHours}
            riskPercent={forecast.riskPercent}
            riskLevel={forecast.riskLevel}
            deadlineLabel={deadlineLabel}
          />

          <section className="recommendation" aria-label="Purchase recommendation">
            {isCompleted ? <CheckCircledIcon className="recommendation-check" aria-hidden="true" /> : <BottlePair />}
            <p>
              {isCompleted ? (
                <>Next check <strong>Monday</strong></>
              ) : isClaimed ? (
                <>Expected before <strong>breakfast</strong></>
              ) : isSnoozed ? (
                <>No new alert for <strong>{observationSnoozeHours} hours</strong></>
              ) : isLowRiskOpen ? (
                <>No urgent <strong>milk run</strong> right now</>
              ) : (
                <>Pick up <strong>{packages} bottles</strong> before breakfast</>
              )}
            </p>
          </section>

          <div className="forecast-actions">
            <button
              type="button"
              className={`primary-action primary-action--${request.status}`}
              onClick={handlePrimary}
              disabled={isClaimed && !isMine}
            >
              {isMine ? <CheckCircledIcon aria-hidden="true" /> : null}
              {isCompleted ? <ReloadIcon aria-hidden="true" /> : null}
              <span>{primaryLabel}</span>
            </button>
            {isOpen && !isLowRiskOpen ? (
              <button type="button" className="secondary-action" onClick={reportStillAvailable}>
                We still have some
              </button>
            ) : null}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {lastMessage}
          </p>

          <section className="forecast-facts" aria-label="Why this forecast changed">
            <div className="fact-row">
              <HomeIcon aria-hidden="true" />
              <span>Five people are home this weekend</span>
            </div>
            <button type="button" className="fact-row fact-row--button" onClick={() => setLabOpen(true)}>
              <BarChartIcon aria-hidden="true" />
              <span>See the 1,000 simulated futures</span>
              <ChevronRightIcon className="fact-chevron" aria-hidden="true" />
            </button>
          </section>

          <section className="family-status" aria-label="Household coordination">
            <img
              src={assetUrl("assets/milk-tomorrow/family-avatars.png")}
              alt="The five members of the Sakura household"
              draggable="false"
            />
            <p>
              {isCompleted
                ? "Milk is back in the fridge"
                : isClaimed
                  ? `${request.claimedByName} is getting the milk`
                  : isSnoozed
                    ? "The forecast is listening"
                    : isLowRiskOpen
                      ? "No urgent trip needed"
                      : "No one has claimed this yet"}
            </p>
          </section>
        </main>
      </MobileScroll>

      <BottomSheet
        open={labOpen}
        onOpenChange={setLabOpen}
        title="1,000 simulated futures"
        description="Same household, tiny variations. The seed is fixed so the demo is reproducible."
        snap={0.84}
      >
        <div className="lab-content">
          <section className="lab-summary" aria-label="Forecast evidence">
            <div>
              <span>By {deadlineLabel}</span>
              <strong>{forecast.riskPercent}%</strong>
            </div>
            <div>
              <span>Weekend effect</span>
              <strong>+{forecast.weekendLiftPoints} pts</strong>
            </div>
            <div>
              <span>90% supply plan</span>
              <strong>{packages} bottles</strong>
            </div>
          </section>

          <p className="model-note">
            Each future samples who drinks milk, when they drink it, and a realistic serving-size variation.
            “Running short” means falling below 340 ml — about one family breakfast — not a promise that the bottle is empty.
          </p>

          <section className="lab-section" aria-labelledby="demo-clock-title">
            <div className="lab-section-heading">
              <ClockIcon aria-hidden="true" />
              <div>
                <h3 id="demo-clock-title">Demo clock</h3>
                <p>{formatHeaderDate(state.now)} · {formatActivityTime(state.now)}</p>
              </div>
            </div>
            <div className="control-grid">
              <button type="button" onClick={() => advanceTime(6)}>+6 hours</button>
              <button type="button" onClick={() => advanceTime(24)}>+1 day</button>
              <button type="button" onClick={reset}><ReloadIcon aria-hidden="true" /> Reset</button>
            </div>
          </section>

          <section className="lab-section" aria-labelledby="member-title">
            <div className="lab-section-heading">
              <HomeIcon aria-hidden="true" />
              <div>
                <h3 id="member-title">Who are you?</h3>
                <p>Open another tab as someone else to test coordination.</p>
              </div>
            </div>
            <div className="member-picker">
              {members.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  aria-pressed={activeMemberId === member.id}
                  onClick={() => setActiveMemberId(member.id)}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </section>

          <section className="lab-section activity-section" aria-labelledby="activity-title">
            <div className="lab-section-heading">
              <BarChartIcon aria-hidden="true" />
              <div>
                <h3 id="activity-title">Household activity</h3>
                <p>Shared instantly between tabs.</p>
              </div>
            </div>
            <ol>
              {state.activity.slice(0, 4).map((entry) => (
                <li key={entry.id}>
                  <time>{formatActivityTime(entry.at)}</time>
                  <span>{entry.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <button type="button" className="sheet-close" onClick={() => setLabOpen(false)}>
            Close the lab <ChevronDownIcon aria-hidden="true" />
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
