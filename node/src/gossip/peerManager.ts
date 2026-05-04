import type { PeerInfo, NodeId } from "../types/peer";

export class PeerManager {
  private peers = new Map<NodeId, PeerInfo>();

  addPeer(peer: PeerInfo): void {
    this.peers.set(peer.nodeId, {
      ...peer,
      lastSeen: Date.now(),
    });
  }

  getPeer(nodeId: NodeId): PeerInfo | undefined {
    return this.peers.get(nodeId);
  }

  getAllPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  hasPeer(nodeId: NodeId): boolean {
    return this.peers.has(nodeId);
  }
}