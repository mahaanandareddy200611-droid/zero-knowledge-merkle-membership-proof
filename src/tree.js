import { Field, MerkleTree, Poseidon } from 'o1js';
import { TREE_HEIGHT } from './circuit.js';

// Create a commitment from a private secret.
export function createCommitment(secret, randomness) {
  return Poseidon.hash([
    Field(1),
    secret,
    randomness
  ]);
}

export function buildTreeFromCommitments(
  commitments,
  height = TREE_HEIGHT
) {
  if (!Number.isInteger(height) || height < 1) {
    throw new Error('Invalid tree height');
  }

  if (
    !Array.isArray(commitments) ||
    commitments.length === 0 ||
    commitments.length > 2 ** height
  ) {
    throw new Error('Invalid commitment list');
  }

  const tree = new MerkleTree(height);

  commitments.forEach((commitment, index) => {
    tree.setLeaf(
      BigInt(index),
      Field(BigInt(commitment))
    );
  });

  return tree;
}
// Registration authority creates the Merkle tree.
export function buildTree() {
  const tree = new MerkleTree(TREE_HEIGHT);

const workers = [
  { id: 'W1', secret: Field.random(), randomness: Field.random() },
  { id: 'W2', secret: Field.random(), randomness: Field.random() },
  { id: 'W3', secret: Field.random(), randomness: Field.random() },
  { id: 'W4', secret: Field.random(), randomness: Field.random() }
];

  workers.forEach((worker, index) => {
    const leaf = createCommitment(
      worker.secret,
      worker.randomness
    );

    tree.setLeaf(BigInt(index), leaf);
  });

  return {
    tree,
    workers,
    root: tree.getRoot()
  };
}