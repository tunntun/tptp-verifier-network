import type { PeerInfo } from "../types/peer";
import type { NetworkMessage } from "../types/messages";

export class GossipService {
  constructor(private readonly getPeers: () => PeerInfo[]) {}

  async broadcast(message: NetworkMessage): Promise<void> {
    const peers = this.getPeers();

    await Promise.all(
      peers.map(async (peer) => {
        try {
          await this.sendMessage(peer, message);
        } catch (error) {
          console.error(
            `Failed to send ${message.type} to ${peer.nodeId}:`,
            error
          );
        }
      })
    );
  }

  async sendMessage(peer: PeerInfo, message: NetworkMessage): Promise<void> {
    const url = `http://${peer.host}:${peer.port}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Peer ${peer.nodeId} responded with ${response.status}`);
    }
  }
}