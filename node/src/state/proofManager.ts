import type { ProofRecord, ProofStatus } from "../types/proof.js";

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

  updateProofStatus(proofId: string, status: ProofStatus): void {
    const proof = this.proofs.get(proofId);

    if (!proof)
      return;

    proof.status = status;
  }

  getAllProofs(): ProofRecord[] {
    return Array.from(this.proofs.values());
  }
}