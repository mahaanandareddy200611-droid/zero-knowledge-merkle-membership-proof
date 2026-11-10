import fs from 'node:fs';

import { MembershipProgram } from './circuit.js';
import { evaluateClaim } from './claims/claim-policy.js';

async function main() {
  const proofJSON = JSON.parse(
    fs.readFileSync('artifacts/membership-proof.json', 'utf8')
  );

  const authority = JSON.parse(
    fs.readFileSync('artifacts/trusted-root.json', 'utf8')
  );

  const ledgerPath = 'artifacts/used-nullifiers.json';

  await MembershipProgram.compile();

  const proof = await MembershipProgram.Proof.fromJSON(proofJSON);

  // Cryptographic proof verification.
  const proofValid = await MembershipProgram.verify(proof);

  // Read application state.
  const ledger = fs.existsSync(ledgerPath)
    ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
    : { used: [] };

  if (!Array.isArray(ledger.used)) {
    throw new Error('Invalid nullifier ledger');
  }

  // Evaluate all authorization conditions.
  const decision = evaluateClaim({
    proofValid,
    proofRoot: proof.publicInput.root.toString(),
    trustedRoot: authority.root,
    proofEventId: proof.publicInput.eventId.toString(),
    trustedEventId: authority.eventId,
    nullifier: proof.publicOutput.toString(),
    usedClaims: new Set(ledger.used)
  });

  console.log('\n=== FINAL CLAIM VERIFICATION ===');

  console.log('Proof:', proofValid ? 'VALID' : 'INVALID');
  console.log('Authorization:', decision.reason);

  if (!decision.accepted) {
    console.log('ACCESS DENIED');
    return;
  }

  // Record successful claim.
  ledger.used.push(decision.claimId);

  fs.writeFileSync(
    ledgerPath,
    JSON.stringify(ledger, null, 2)
  );

  console.log('ACCESS GRANTED');
}

main().catch(error => {
  console.error('Verification error:', error);
  process.exitCode = 1;
});