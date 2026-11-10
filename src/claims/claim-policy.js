export function evaluateClaim({
  proofValid,
  proofRoot,
  trustedRoot,
  proofEventId,
  trustedEventId,
  nullifier,
  usedClaims
}) {
  if (!proofValid) {
    return { accepted: false, reason: 'INVALID_PROOF' };
  }

  if (proofRoot !== trustedRoot) {
    return { accepted: false, reason: 'UNTRUSTED_ROOT' };
  }

  if (proofEventId !== trustedEventId) {
    return { accepted: false, reason: 'INVALID_EVENT' };
  }

  const claimId = `${trustedEventId}:${nullifier}`;

  if (usedClaims.has(claimId)) {
    return { accepted: false, reason: 'DUPLICATE_CLAIM' };
  }

  return {
    accepted: true,
    reason: 'NEW_CLAIM',
    claimId
  };
}