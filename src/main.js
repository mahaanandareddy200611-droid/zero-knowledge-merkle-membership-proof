import fs from 'node:fs';
import { Field } from 'o1js';

import {
  MembershipProgram,
  MembershipWitness,
  MembershipPublicInput,
  TREE_HEIGHT
} from './circuit.js';

import {
  createCommitment,
  buildTreeFromCommitments
} from './tree.js';

async function main() {

  console.log('\n=== ZK PROVER ===');

  // 1. Read public registration information.
  const registry = JSON.parse(
    fs.readFileSync('artifacts/registry.json', 'utf8')
  );

  // 2. Read the authority's previously established root.
  const authority = JSON.parse(
    fs.readFileSync('artifacts/trusted-root.json', 'utf8')
  );

  // 3. Load the worker's local credential.
  const credential = JSON.parse(
    fs.readFileSync('credentials/worker-3.json', 'utf8')
  );

  if (registry.treeHeight !== TREE_HEIGHT ||
      authority.treeHeight !== TREE_HEIGHT) {
    throw new Error('Tree configuration mismatch');
  }

  // 4. Reconstruct the Merkle tree.
  const tree = buildTreeFromCommitments(
    registry.leaves,
    registry.treeHeight
  );

  const reconstructedRoot = tree.getRoot();

  // 5. Ensure the reconstructed root matches authority data.
  if (reconstructedRoot.toString() !== authority.root) {
    throw new Error('Registration root mismatch');
  }

  // 6. Restore private worker credentials.
  const secret = Field(BigInt(credential.secret));
  const randomness = Field(BigInt(credential.randomness));

  const index = BigInt(credential.index);

  // 7. Check the worker's commitment against its registered leaf.
  const commitment = createCommitment(secret, randomness);

  if (
    commitment.toString() !==
    registry.leaves[Number(index)]
  ) {
    throw new Error('Worker credential does not match registry');
  }

  // 8. Obtain private Merkle witness.
  const witness = new MembershipWitness(
    tree.getWitness(index)
  );

  // 9. Create public inputs.
  const publicInput = new MembershipPublicInput({
    root: Field(BigInt(authority.root)),
    eventId: Field(BigInt(authority.eventId))
  });

  // 10. Compile and generate proof.
  console.log('Compiling...');
  await MembershipProgram.compile();

  console.log('Generating proof...');

  const { proof } = await MembershipProgram.proveMembership(
    publicInput,
    secret,
    randomness,
    witness
  );

  // 11. Save public proof.
  fs.writeFileSync(
    'artifacts/membership-proof.json',
    JSON.stringify(proof.toJSON(), null, 2)
  );

  console.log('Proof generated.');
  console.log('Public root:', proof.publicInput.root.toString());
  console.log('Event:', proof.publicInput.eventId.toString());
  console.log('Nullifier:', proof.publicOutput.toString());

  console.log(
    'Proof valid:',
    await MembershipProgram.verify(proof)
  );
}

main().catch(error => {
  console.error('Prover error:', error);
  process.exitCode = 1;
});