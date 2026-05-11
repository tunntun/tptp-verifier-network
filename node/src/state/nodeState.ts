import { PeerManager } from "../gossip/peerManager.js";
import { MessageStore } from "../gossip/messageStore.js";

export class NodeState {
  public readonly peers = new PeerManager();
  public readonly messages = new MessageStore();
}

export const nodeState = new NodeState();