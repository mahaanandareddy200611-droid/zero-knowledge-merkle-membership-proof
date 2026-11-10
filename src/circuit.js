import {
  Field,
  Poseidon,
  MerkleWitness,
  ZkProgram,
  Struct
} from 'o1js';

export const TREE_HEIGHT = 3;

// Public information given to the verifier.
export class MembershipPublicInput extends Struct({
  root: Field,
  eventId: Field
}) {}

export class MembershipWitness extends MerkleWitness(TREE_HEIGHT) {}

export const MembershipProgram = ZkProgram({
  name: 'anonymous-membership',

  publicInput: MembershipPublicInput,

  // Nullifier becomes a public output.
  publicOutput: Field,

  methods: {
    proveMembership: {
      privateInputs: [
        Field, // secret
        Field, // randomness
        MembershipWitness
      ],

      async method(publicInput, secret, randomness, witness) {

        // Constraint 1: Generate the correct membership commitment.
        const leaf = Poseidon.hash([
          Field(1),
          secret,
          randomness
        ]);

        // Constraint 2: Prove membership under the public root.
        const calculatedRoot = witness.calculateRoot(leaf);

        calculatedRoot.assertEquals(publicInput.root);

        // Constraint 3: Derive event-specific nullifier.
        const nullifier = Poseidon.hash([
          Field(2),
          secret,
          publicInput.eventId
        ]);

        return {
          publicOutput: nullifier
        };
      }
    }
  }
});