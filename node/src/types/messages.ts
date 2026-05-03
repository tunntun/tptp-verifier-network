export type MessageType =
    "NEW_PROOF"
  | "NEW_PEER"
  | "PEER_LIST"
  | "NEW_BLOCK";

export interface BaseMessage <TPayload> {
  messageId: string;
  type: MessageType;
  payload: TPayload;
}