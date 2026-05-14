import type { PeerInfo } from "../../types/peer.js";

export async function fetchPeerInfo(
  host: string,
  port: number
): Promise<PeerInfo> {
  const response = await fetch(`http://${host}:${port}/identity`);

  if (!response.ok) {
    throw new Error("PEER_FETCH_FAILED");
  }

  return response.json();
}