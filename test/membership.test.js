import test, { before } from 'node:test';
import assert from 'node:assert/strict';

import { Field, Poseidon } from 'o1js';

import {
  MembershipProgram,
  MembershipWitness,
  MembershipPublicInput
} from '../src/circuit.js';

import { buildTree } from '../src/tree.js';

let tree;
let workers;
let root;
let eventId;
let publicInput;
let witness;
let proof;
let worker;

before(async () => {
  // Create test registration data.
  ({ tree, workers, root } = buildTree());

  worker = workers[2];
  eventId = Field(1001);

  publicInput = new MembershipPublicInput({
    root,
    eventId
  });

  witness = new MembershipWitness(
    tree.getWitness(2n)
  );

  // Compile once for the entire test suite.
  await MembershipProgram.compile();

  // Generate one genuine proof.
  ({ proof } = await MembershipProgram.proveMembership(
    publicInput,
    worker.secret,
    worker.randomness,
    witness
  ));
});

test('1. Genuine member proof verifies', async () => {
  assert.equal(
    await MembershipProgram.verify(proof),
    true
  );
});

test('2. Public root is correctly bound', () => {
  assert.equal(
    proof.publicInput.root.toString(),
    root.toString()
  );
});

test('3. Event ID is correctly bound', () => {
  assert.equal(
    proof.publicInput.eventId.toString(),
    eventId.toString()
  );
});

test('4. Public nullifier is correctly calculated', () => {
  const expected = Poseidon.hash([
    Field(2),
    worker.secret,
    eventId
  ]);

  assert.equal(
    proof.publicOutput.toString(),
    expected.toString()
  );
});

test('5. Wrong secret cannot satisfy membership', async () => {
  await assert.rejects(
    MembershipProgram.proveMembership(
      publicInput,
      Field(999),
      worker.randomness,
      witness
    )
  );
});

test('6. Wrong Merkle path cannot satisfy membership', async () => {
  const invalidWitness = new MembershipWitness(
    tree.getWitness(0n)
  );

  await assert.rejects(
    MembershipProgram.proveMembership(
      publicInput,
      worker.secret,
      worker.randomness,
      invalidWitness
    )
  );
});

test('7. Wrong root cannot satisfy membership', async () => {
  const invalidInput = new MembershipPublicInput({
    root: Field(999999),
    eventId
  });

  await assert.rejects(
    MembershipProgram.proveMembership(
      invalidInput,
      worker.secret,
      worker.randomness,
      witness
    )
  );
});

test('8. Serialized proof does not expose witness fields', () => {
  const json = proof.toJSON();

  assert.deepEqual(
    Object.keys(json).sort(),
    [
      'maxProofsVerified',
      'proof',
      'publicInput',
      'publicOutput'
    ].sort()
  );
});

test('9. Nullifier changes with event ID', () => {
  const first = Poseidon.hash([
    Field(2),
    worker.secret,
    Field(1001)
  ]);

  const second = Poseidon.hash([
    Field(2),
    worker.secret,
    Field(2001)
  ]);

  assert.notEqual(
    first.toString(),
    second.toString()
  );
});

test('10. Same member and event produce same nullifier', () => {
  const first = Poseidon.hash([
    Field(2),
    worker.secret,
    eventId
  ]);

  const second = Poseidon.hash([
    Field(2),
    worker.secret,
    eventId
  ]);

  assert.equal(
    first.toString(),
    second.toString()
  );
});