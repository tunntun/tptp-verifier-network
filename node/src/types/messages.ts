import type { PeerInfo, NodeId } from "./peer.js";
import type { ProofRecord } from "./proof.js";
import type { VerificationResult } from "./verification.js";

export type VerificationResultPayload = VerificationResult;

export type MessageType =
  | "NEW_PEER"
  | "PEER_LIST"
  | "NEW_PROOF"
  | "NEW_VERIFICATION_RESULT"
  | "NEW_BLOCK"
  | "CHAIN_REQUEST"
  | "CHAIN_RESPONSE";

export interface BaseMessage<TPayload = unknown> {
  messageId: string;
  type: MessageType;
  senderNodeId: NodeId;
  timestamp: number;
  ttl: number;
  payload: TPayload;
  signature?: string;
}

export interface NewPeerPayload {
  peer: PeerInfo;
}

export interface PeerListPayload {
  peers: PeerInfo[];
}

export interface NewProofPayload {
  proof: ProofRecord;
}


export interface NewBlockPayload {
  blockHash: string;
  blockHeight: number;
}

export interface ChainRequestPayload {
  fromHeight?: number;
}

export interface ChainResponsePayload {
  blocks: unknown[];
}

export type PayloadByMessageType = {
  NEW_PEER: NewPeerPayload;
  PEER_LIST: PeerListPayload;
  NEW_PROOF: NewProofPayload;
  NEW_VERIFICATION_RESULT: VerificationResultPayload;
  NEW_BLOCK: NewBlockPayload;
  CHAIN_REQUEST: ChainRequestPayload;
  CHAIN_RESPONSE: ChainResponsePayload;
};

export type NetworkMessageOf<T extends MessageType> =
  BaseMessage<PayloadByMessageType[T]> & {
    type: T;
  };

export type NetworkMessage = {
  [T in MessageType]: NetworkMessageOf<T>;
}[MessageType];