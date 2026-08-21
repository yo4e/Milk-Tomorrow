export type RequestStatus = "open" | "claimed" | "completed" | "snoozed";

export type ReplenishmentRequest = {
  id: string;
  itemId: string;
  status: RequestStatus;
  recommendedPackages: number;
  claimedByMemberId: string | null;
  claimedByName: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  snoozedUntil: string | null;
  revision: number;
};

export type ClaimOutcome = {
  request: ReplenishmentRequest;
  won: boolean;
};

export function createOrReuseRequest(
  existing: ReplenishmentRequest | null,
  itemId: string,
  id: string,
  recommendedPackages: number,
) {
  if (
    existing &&
    existing.itemId === itemId &&
    existing.status !== "completed"
  ) {
    return existing;
  }

  return {
    id,
    itemId,
    status: "open" as const,
    recommendedPackages,
    claimedByMemberId: null,
    claimedByName: null,
    claimedAt: null,
    completedAt: null,
    snoozedUntil: null,
    revision: 0,
  };
}

export function attemptClaim(
  request: ReplenishmentRequest,
  memberId: string,
  memberName: string,
  claimedAt: string,
): ClaimOutcome {
  if (request.status !== "open") {
    return { request, won: false };
  }

  return {
    won: true,
    request: {
      ...request,
      status: "claimed",
      claimedByMemberId: memberId,
      claimedByName: memberName,
      claimedAt,
      revision: request.revision + 1,
    },
  };
}

export function completeRequest(
  request: ReplenishmentRequest,
  memberId: string,
  completedAt: string,
) {
  if (
    request.status !== "claimed" ||
    request.claimedByMemberId !== memberId
  ) {
    return { request, completed: false };
  }

  return {
    completed: true,
    request: {
      ...request,
      status: "completed" as const,
      completedAt,
      revision: request.revision + 1,
    },
  };
}

export function snoozeRequest(
  request: ReplenishmentRequest,
  snoozedUntil: string,
) {
  if (request.status !== "open") return request;

  return {
    ...request,
    status: "snoozed" as const,
    snoozedUntil,
    revision: request.revision + 1,
  };
}

export function reopenIfSnoozeExpired(
  request: ReplenishmentRequest,
  now: string,
) {
  if (
    request.status !== "snoozed" ||
    !request.snoozedUntil ||
    Date.parse(request.snoozedUntil) > Date.parse(now)
  ) {
    return request;
  }

  return {
    ...request,
    status: "open" as const,
    snoozedUntil: null,
    revision: request.revision + 1,
  };
}
