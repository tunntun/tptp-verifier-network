import type { NodeId } from "./peer.js";

export interface VerificationResult {
  proofId: string;
  verifierNodeId: NodeId;
  verified: boolean;
  szsStatus: string | null;
  gdvOutputHash: string;
  gdvRawOutput: string;
  verifiedAt: number;
}
