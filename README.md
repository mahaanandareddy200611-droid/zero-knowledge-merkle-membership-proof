# Anonymous Merkle Membership Using Zero-Knowledge Proofs

## 1. Project Overview

This project implements privacy-preserving membership verification using zero-knowledge proofs.

A registered member can prove that they belong to an approved group without revealing their private secret or Merkle authentication path.

The system also uses event-specific nullifiers to prevent duplicate claims.

## 2. Problem Statement

Traditional membership verification may require users to disclose their identity or registration credentials.

This project demonstrates how a user can establish membership using a cryptographic proof while keeping their private witness hidden.

## 3. Objectives

- Implement Poseidon-based member commitments.
- Construct a Merkle tree of registered commitments.
- Generate private Merkle membership witnesses.
- Implement a zero-knowledge membership circuit.
- Generate and independently verify proofs.
- Generate event-specific nullifiers.
- Prevent repeated claims.
- Test valid and malicious scenarios.

## 4. Technology Stack

- JavaScript / Node.js
- o1js
- Poseidon hash
- Merkle trees
- Node.js built-in test runner

## 5. System Architecture

Registration Authority
|
v
Member Commitments
|
v
Merkle Tree
|
v
Public Merkle Root
|
v
Private Member Witness
|
v
Zero-Knowledge Prover
|
v
Cryptographic Proof
|
v
Independent Verifier
|
v
Trusted Root + Event Validation
|
v
Nullifier Ledger
|
v
Accept / Reject

## 6. Mathematical Formulation

Member commitment:

C = Poseidon(1, secret, randomness)

Membership condition:

CalculatedRoot = MerkleRoot(C, witness)

Circuit constraint:

CalculatedRoot = PublicRoot

Nullifier:

N = Poseidon(2, secret, eventID)

The circuit proves knowledge of private values satisfying
the commitment, membership and nullifier relationships.

## 7. Public and Private Information

Public:

- Merkle root
- Event identifier
- Cryptographic proof
- Nullifier

Private:

- Member secret
- Commitment randomness
- Merkle authentication path

## 8. Implementation

The system contains five main responsibilities:

1. Registration: Generates member commitments and the Merkle root.
2. Merkle construction: Stores commitments and generates authentication paths.
3. Prover: Uses private inputs to generate a proof.
4. Verifier: Independently validates the proof and trusted public inputs.
5. Claim policy: Checks nullifier reuse and determines whether an action is permitted.

## 9. Experimental Results

- Genuine membership proof successfully verified.
- Incorrect secret rejected.
- Incorrect membership path rejected.
- Incorrect root rejected.
- Untrusted attacker-created root rejected by application authorization.
- Repeated nullifier rejected.
- Different event identifiers produce different nullifier values.
- Automated tests: 15 passed, 0 failed.

## 10. Security Properties

Completeness:
An honest member with valid inputs can generate an accepted proof.

Soundness:
A malicious prover should not be able to prove a false membership statement, subject to the proof system's security assumptions.

Zero Knowledge:
The verifier receives a proof without receiving the private witness.

Replay prevention:
Previously used event-specific nullifiers are rejected.

## 11. Limitations

- Registration and credentials use local JSON files.
- Credentials are not encrypted at rest.
- Trusted roots are not authenticated using authority signatures.
- Nullifier storage is not concurrency-safe.
- No formal third-party security audit has been performed.
- The current implementation demonstrates a prototype, not a production identity system.

## 12. Future Improvements

- Secure client-side credential generation and storage.
- Signed, versioned Merkle roots.
- Database-backed atomic nullifier storage.
- Credential revocation.
- Integration with an actual backend.
- Comprehensive security and privacy testing.

## 13. Conclusion

The project demonstrates how zero-knowledge proofs, Poseidon commitments, Merkle trees and nullifiers can be combined to build a privacy-preserving membership verification system.
