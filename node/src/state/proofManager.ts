import type { ProofRecord } from "../types/proof.js";

export class ProofManager {
  private proofs = new Map<string, ProofRecord>();

  addProof(proof: ProofRecord): void {
    this.proofs.set(proof.proofId, proof);
  }

  hasProof(proofId: string): boolean {
    return this.proofs.has(proofId);
  }

  getProof(proofId: string): ProofRecord | undefined {
    return this.proofs.get(proofId);
  }

  getAllProofs(): ProofRecord[] {
    return Array.from(this.proofs.values());
  }
}