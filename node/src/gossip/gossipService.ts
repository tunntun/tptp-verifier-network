import type { PeerInfo, NodeId } from "../types/peer.js";
import type { NetworkMessage } from "../types/messages.js";

export class GossipService {
  constructor(private readonly getPeers: () => PeerInfo[]) {}

  async broadcast( message: NetworkMessage, excludeNodeId?: NodeId): Promise<void> {
    const peers = this.getPeers();

    await Promise.all(
      peers
        .filter((peer) => peer.nodeId !== excludeNodeId)
        .map((peer) => this.sendMessage(peer, message))
    );
  }

  private async sendMessage( peer: PeerInfo, message: NetworkMessage): Promise<void> {
    try {
      const response = await fetch(
        `http://${peer.host}:${peer.port}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();

        console.error(
          `Failed to send message to ${peer.nodeId}: ${response.status} ${errorBody}`
        );
      }
    } catch (error) {
      console.error(`Failed to reach peer ${peer.nodeId}`);
    }
  }
}