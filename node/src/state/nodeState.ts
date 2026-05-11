import { PeerManager } from "../gossip/peerManager.js";
import { MessageStore } from "../gossip/messageStore.js";
import { ProofManager } from "./proofManager.js";
import { VerificationManager } from "./verificationManager.js";

export class NodeState {
  public readonly peers = new PeerManager();
  public readonly messages = new MessageStore();
  public readonly proofs = new ProofManager();
  public readonly verifications = new VerificationManager();
}

export const nodeState = new NodeState();