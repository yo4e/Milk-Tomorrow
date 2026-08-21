import assert from "node:assert/strict";
import test from "node:test";
import {
  attemptClaim,
  completeRequest,
  createOrReuseRequest,
  reopenIfSnoozeExpired,
  snoozeRequest,
} from "../../src/domain/coordination.ts";

test("two claim attempts produce exactly one winner", () => {
  const request = createOrReuseRequest(null, "milk", "request-1", 2);
  const first = attemptClaim(request, "aki", "Aki", "2026-08-20T22:00:00.000Z");
  const second = attemptClaim(first.request, "ken", "Ken", "2026-08-20T22:00:00.001Z");

  assert.equal(first.won, true);
  assert.equal(second.won, false);
  assert.equal(second.request.claimedByMemberId, "aki");
});

test("forecast reruns reuse an existing active request", () => {
  const existing = createOrReuseRequest(null, "milk", "request-1", 2);
  const rerun = createOrReuseRequest(existing, "milk", "request-2", 3);
  assert.equal(rerun, existing);
});

test("only the claimant can complete the purchase", () => {
  const open = createOrReuseRequest(null, "milk", "request-1", 2);
  const claimed = attemptClaim(open, "aki", "Aki", "2026-08-20T22:00:00.000Z").request;
  const wrongMember = completeRequest(claimed, "ken", "2026-08-21T02:00:00.000Z");
  const claimant = completeRequest(claimed, "aki", "2026-08-21T02:00:00.000Z");

  assert.equal(wrongMember.completed, false);
  assert.equal(claimant.completed, true);
  assert.equal(claimant.request.status, "completed");
});

test("still-available feedback snoozes and later reopens the request", () => {
  const open = createOrReuseRequest(null, "milk", "request-1", 2);
  const snoozed = snoozeRequest(open, "2026-08-21T16:00:00.000Z");

  assert.equal(snoozed.status, "snoozed");
  assert.equal(
    reopenIfSnoozeExpired(snoozed, "2026-08-21T15:59:59.000Z").status,
    "snoozed",
  );
  assert.equal(
    reopenIfSnoozeExpired(snoozed, "2026-08-21T16:00:00.000Z").status,
    "open",
  );
});
