import type { VerificationResultPayload } from "../types/messages.js";

export class VerificationManager {
  private results = new Map<string, VerificationResultPayload[]>();

  addResult(result: VerificationResultPayload): void {
    const existingResults = this.results.get(result.proofId) ?? [];

    this.results.set(result.proofId, [...existingResults, result]);
  }

  getResultsForProof(proofId: string): VerificationResultPayload[] {
    return this.results.get(proofId) ?? [];
  }

  hasResult(proofId: string, verifierNodeId: string): boolean {
    const existingResults = this.results.get(proofId) ?? [];

    return existingResults.some(
      (result) => result.verifierNodeId === verifierNodeId
    );
  }

  getAllResults(): VerificationResultPayload[] {
    return Array.from(this.results.values()).flat();
  }
}