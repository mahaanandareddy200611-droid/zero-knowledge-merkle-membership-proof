import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateClaim } from '../src/claims/claim-policy.js';

const base = {
  proofValid: true,
  proofRoot: 'ROOT_A',
  trustedRoot: 'ROOT_A',
  proofEventId: '1001',
  trustedEventId: '1001',
  nullifier: 'NULL_1',
  usedClaims: new Set()
};

test('Accept valid new claim', () => {
  assert.equal(evaluateClaim(base).accepted, true);
});

test('Reject invalid cryptographic proof', () => {
  assert.equal(
    evaluateClaim({ ...base, proofValid: false }).reason,
    'INVALID_PROOF'
  );
});

test('Reject untrusted root', () => {
  assert.equal(
    evaluateClaim({ ...base, proofRoot: 'ROOT_B' }).reason,
    'UNTRUSTED_ROOT'
  );
});

test('Reject incorrect event', () => {
  assert.equal(
    evaluateClaim({ ...base, proofEventId: '2001' }).reason,
    'INVALID_EVENT'
  );
});

test('Reject duplicate claim', () => {
  const usedClaims = new Set(['1001:NULL_1']);

  assert.equal(
    evaluateClaim({ ...base, usedClaims }).reason,
    'DUPLICATE_CLAIM'
  );
});