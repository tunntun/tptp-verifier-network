import { generateKeyPairSync } from "crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

const publicKeyPEM = publicKey.export({
  type: "spki",
  format: "pem",
});

export const nodeKeys = {
  publicKey,
  privateKey,
  publicKeyPEM,
};