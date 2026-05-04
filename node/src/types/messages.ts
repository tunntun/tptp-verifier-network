import type { PeerInfo, NodeId } from "./peer";
import type { ProofRecord } from "./proof";

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

export interface VerificationResultPayload {
  proofId: string;
  verifierNodeId: NodeId;
  verified: boolean;
  szsStatus: string | null;
  gdvOutputHash: string;
  verifiedAt: number;
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

export type NewPeerMessage = BaseMessage<NewPeerPayload> & {
  type: "NEW_PEER";
};

export type PeerListMessage = BaseMessage<PeerListPayload> & {
  type: "PEER_LIST";
};

export type NewProofMessage = BaseMessage<NewProofPayload> & {
  type: "NEW_PROOF";
};

export type VerificationResultMessage =
  BaseMessage<VerificationResultPayload> & {
    type: "NEW_VERIFICATION_RESULT";
  };

export type NewBlockMessage = BaseMessage<NewBlockPayload> & {
  type: "NEW_BLOCK";
};

export type ChainRequestMessage = BaseMessage<ChainRequestPayload> & {
  type: "CHAIN_REQUEST";
};

export type ChainResponseMessage = BaseMessage<ChainResponsePayload> & {
  type: "CHAIN_RESPONSE";
};

export type NetworkMessage =
  | NewPeerMessage
  | PeerListMessage
  | NewProofMessage
  | VerificationResultMessage
  | NewBlockMessage
  | ChainRequestMessage
  | ChainResponseMessage;