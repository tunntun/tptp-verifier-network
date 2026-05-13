import type { VerificationResult } from "../types/verification.js";

export class VerificationManager {
  private results = new Map<string, VerificationResult[]>();

  addResult(result: VerificationResult): void {
    const existingResults = this.results.get(result.proofId) ?? [];

    this.results.set(result.proofId, [...existingResults, result]);
  }

  getResultsForProof(proofId: string): VerificationResult[] {
    return this.results.get(proofId) ?? [];
  }

  hasResult(proofId: string, verifierNodeId: string): boolean {
    const existingResults = this.results.get(proofId) ?? [];

    return existingResults.some(
      (result) => result.verifierNodeId === verifierNodeId
    );
  }

  getAllResults(): VerificationResult[] {
    return Array.from(this.results.values()).flat();
  }
}