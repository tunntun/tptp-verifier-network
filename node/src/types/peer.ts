export type NodeId = string;

export interface PeerInfo {
  nodeId: NodeId;
  host: string;
  port: number;
  publicKey: string;
  lastSeen?: number;
}