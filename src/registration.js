import fs from 'node:fs';
import { Field } from 'o1js';

import { TREE_HEIGHT } from './circuit.js';
import {
  createCommitment,
  buildTreeFromCommitments
} from './tree.js';

async function register() {
  if (fs.existsSync('artifacts/registry.json')) {
    throw new Error(
      'Registry already exists. Do not regenerate member identities.'
    );
  }

  fs.mkdirSync('artifacts', { recursive: true });
  fs.mkdirSync('credentials', { recursive: true });

  const commitments = [];

  for (let i = 0; i < 4; i++) {

    // Simulated worker-side credential generation.
    const secret = Field.random();
    const randomness = Field.random();

    const commitment = createCommitment(
      secret,
      randomness
    );

    // Authority receives only the commitment.
    commitments.push(commitment.toString());

    // Simulated worker's private credential storage.
    fs.writeFileSync(
      `credentials/worker-${i + 1}.json`,
      JSON.stringify({
        workerId: `W${i + 1}`,
        index: i,
        secret: secret.toString(),
        randomness: randomness.toString()
      }, null, 2),
      { flag: 'wx' }
    );
  }

  // Authority builds tree using public commitments.
  const tree = buildTreeFromCommitments(
    commitments,
    TREE_HEIGHT
  );

  const root = tree.getRoot();

  // Public registration data.
  fs.writeFileSync(
    'artifacts/registry.json',
    JSON.stringify({
      version: 1,
      treeHeight: TREE_HEIGHT,
      leaves: commitments
    }, null, 2)
  );

  // Previously established trusted public root.
  fs.writeFileSync(
    'artifacts/trusted-root.json',
    JSON.stringify({
      program: 'anonymous-membership',
      root: root.toString(),
      eventId: '1001',
      treeHeight: TREE_HEIGHT
    }, null, 2)
  );

  console.log('Registration completed.');
  console.log('Members registered:', commitments.length);
  console.log('Merkle root:', root.toString());
}

register().catch(error => {
  console.error('Registration failed:', error);
  process.exitCode = 1;
});