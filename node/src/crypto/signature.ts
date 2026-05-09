import { sign, verify, type KeyObject } from "crypto";
import type { BaseMessage } from "../types/messages.js";

export function messageToSign(message: BaseMessage): string {
  const { signature, ...unsignedMessage } = message;
  return JSON.stringify(unsignedMessage);
}

export function signMessage(
  message: BaseMessage,
  privateKey: KeyObject
): string {
  return sign(null, Buffer.from(messageToSign(message)), privateKey).toString(
    "base64"
  );
}

export function verifyMessage(
  message: BaseMessage,
  publicKey: KeyObject
): boolean {
  if (!message.signature) {
    return false;
  }

  return verify(
    null,
    Buffer.from(messageToSign(message)),
    publicKey,
    Buffer.from(message.signature, "base64")
  );
}