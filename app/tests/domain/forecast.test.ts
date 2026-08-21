import assert from "node:assert/strict";
import test from "node:test";
import {
  dayKindAt,
  demoForecastBase,
  estimateStockAfterHours,
  packagesForNeed,
  runForecast,
  simulateExpectedPath,
  type ForecastInput,
} from "../../src/domain/forecast.ts";

const demoNow = Date.parse("2026-08-20T22:00:00.000Z");

test("the seeded demo produces the judge-facing 89% / two-bottle forecast", () => {
  const first = runForecast({
    ...demoForecastBase,
    now: demoNow,
    stockMl: 1200,
    horizonHours: 26,
  });
  const second = runForecast({
    ...demoForecastBase,
    now: demoNow,
    stockMl: 1200,
    horizonHours: 26,
  });

  assert.equal(first.riskPercent, 89);
  assert.equal(first.recommendedPackages, 2);
  assert.deepEqual(first, second);
});

test("a purchase moves the near-term shortage risk later", () => {
  const before = runForecast({
    ...demoForecastBase,
    now: demoNow,
    stockMl: 1200,
    horizonHours: 26,
  });
  const after = runForecast({
    ...demoForecastBase,
    now: demoNow,
    stockMl: 3200,
    horizonHours: 26,
  });

  assert.ok(before.riskPercent > 80);
  assert.ok(after.riskPercent < 5);
  assert.ok(after.riskPercent < before.riskPercent);
});

test("demo time travel ages estimated stock before rerunning a forecast", () => {
  const input = {
    ...demoForecastBase,
    now: demoNow,
    stockMl: 1200,
    horizonHours: 12,
  };

  assert.equal(estimateStockAfterHours(input, 0), 1200);
  assert.ok(estimateStockAfterHours(input, 12) < 1200);
  assert.ok(estimateStockAfterHours(input, 12) > 0);
});

test("weekend presence measurably increases shortage risk", () => {
  const result = runForecast({
    ...demoForecastBase,
    now: demoNow,
    stockMl: 1200,
    horizonHours: 26,
  });

  assert.ok(result.weekendLiftPoints > 0);
});

test("the deterministic expected path crosses a reserve before literal zero", () => {
  const base: ForecastInput = {
    now: Date.parse("2026-08-23T22:00:00.000Z"),
    timezone: "Asia/Tokyo",
    stockMl: 100,
    safetyReserveMl: 0,
    packageSizeMl: 100,
    members: [
      {
        id: "one",
        name: "One",
        weekdayProbability: 1,
        weekendProbability: 1,
        meanPortionMl: 100,
        portionVariation: 0,
      },
    ],
    horizonHours: 24,
    coverageHours: 24,
    trials: 100,
    seed: 1,
  };
  const literalZero = simulateExpectedPath(base);
  const reserve = simulateExpectedPath({ ...base, safetyReserveMl: 30 });

  assert.equal(literalZero.firstThresholdHour, 14);
  assert.ok((reserve.firstThresholdHour ?? 99) < (literalZero.firstThresholdHour ?? 99));
});

test("purchase recommendations round up to whole packages", () => {
  assert.equal(packagesForNeed(0, 1000), 0);
  assert.equal(packagesForNeed(1000, 1000), 1);
  assert.equal(packagesForNeed(1001, 1000), 2);
});

test("weekday/weekend logic respects the household timezone", () => {
  const fridayUtcSaturdayTokyo = Date.parse("2026-08-21T15:30:00.000Z");
  assert.equal(dayKindAt(fridayUtcSaturdayTokyo, "UTC"), "weekday");
  assert.equal(dayKindAt(fridayUtcSaturdayTokyo, "Asia/Tokyo"), "weekend");
});
