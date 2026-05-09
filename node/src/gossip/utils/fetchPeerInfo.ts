import type { PeerInfo } from "../../types/peer.js";

export async function fetchPeerInfo(
  host: string,
  port: number
): Promise<PeerInfo> {
  const response = await fetch(`http://${host}:${port}/health`);

  if (!response.ok) {
    throw new Error("Failed to fetch peer info");
  }

  return response.json();
}