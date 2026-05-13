export type ProofStatus =
  | "PENDING"
  | "VERIFYING"
  | "VERIFIED"
  | "FAILED"
  | "INCLUDED";

export interface ProofRecord {
  proofId: string;
  problemHash: string;
  proofHash: string;
  problemContent?: string;
  proofContent?: string;
  tptpVersion?: string;
  status: ProofStatus;
  submittedAt: number;
}