import express from "express";
import { randomUUID , generateKeyPairSync, createPublicKey} from "crypto";
import { PeerManager } from "./gossip/peerManager.js";
import { GossipService } from "./gossip/gossipService.js";
import { MessageStore } from "./gossip/messageStore.js";
import { signMessage, verifyMessage } from "./crypto/signature.js";
import { fetchPeerInfo } from "./gossip/utils/fetchPeerInfo.js";
import { nodeState } from "./state/nodeState.js";

import type { MessageType, BaseMessage, PayloadByMessageType, NetworkMessageOf, NewPeerPayload, NetworkMessage} from "./types/messages.js";
import type { PeerInfo } from "./types/peer.js";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3001);
const NODE_ID = process.env.NODE_ID ?? "node-1";
const HOST = process.env.HOST ?? "localhost";
const MAX_TTL = 5;

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

const PUBLIC_KEY_PEM = publicKey.export({
  type: "spki",
  format: "pem",
});

const peerManager = nodeState.peers;
const messageStore = nodeState.messages;

const gossipService = new GossipService(() => peerManager.getAllPeers());

function createMessage<T extends MessageType>(
  type: T,
  payload: PayloadByMessageType[T]
): NetworkMessageOf<T> {
  const message = {
    messageId: randomUUID(),
    type,
    senderNodeId: NODE_ID,
    timestamp: Date.now(),
    ttl: MAX_TTL,
    payload,
  } as NetworkMessageOf<T>;

  message.signature = signMessage(message, privateKey);

  return message;
}
app.post("/create-message", (req, res) => { // DEV
  const { type, payload } = req.body;

  const message = createMessage(type, payload);

  return res.json(message);
});

app.get("/health", (_req, res) => {
  res.json({
    nodeId: NODE_ID,
    host: HOST,
    port: PORT,
    publicKey: PUBLIC_KEY_PEM,
    status: "running",
    peers: peerManager.getAllPeers(),
    proofs: nodeState.proofs.getAllProofs(),
    verifications: nodeState.verifications.getAllResults(),
  });
});

app.post("/peers", async (req, res) => {
  const peer = await fetchPeerInfo(req.body.host, req.body.port);

  if (!peer.nodeId || !peer.host || !peer.port) {
    return res.status(400).json({
      error: "nodeId, host, and port are required.",
    });
  }

  if (peer.nodeId === NODE_ID) {
    return res.status(400).json({
      error: "Node cannot add itself as a peer.",
    });
  }

  peerManager.addPeer(peer);
  const newPeerMessage = createMessage("NEW_PEER", { peer, });

  await gossipService.broadcast(newPeerMessage);

  const response = createMessage("PEER_LIST", {
  peers: peerManager.getAllPeers(),
  });

  return res.json(response);
});

app.post("/messages", async (req, res) => {
  const message = req.body as NetworkMessage;

  if (!message.messageId || !message.type || !message.senderNodeId) {
    return res.status(400).json({
      error: "BAD_REQUEST",
    });
  }

  if (messageStore.hasSeen(message.messageId)) {
    return res.json({
      received: true,
      duplicate: true,
      nodeId: NODE_ID,
      messageType: message.type,
    });
  }

  const senderPeer = peerManager.getPeer(message.senderNodeId);

  if (!senderPeer?.publicKey) {
    return res.status(400).json({
      error: "UNKNOWN_SENDER_PUBLIC_KEY",
    });
  }

  const publicKey = createPublicKey(senderPeer.publicKey);

  if (!verifyMessage(message, publicKey)) {
    return res.status(400).json({
      error: "INVALID_SIGNATURE",
    });
  }

  if (message.ttl <= 0) {
    return res.json({
      received: true,
      dropped: true,
      reason: "TTL_EXPIRED",
      nodeId: NODE_ID,
      messageType: message.type,
    });
  }

  messageStore.markSeen(message.messageId);

  // if (message.senderNodeId !== NODE_ID && !peerManager.hasPeer(message.senderNodeId)) {
  //   peerManager.addPeer({
  //     nodeId: message.senderNodeId,
  //     host: req.hostname,
  //     port: Number(req.socket.remotePort),
  //   });
  // }

  if (message.type === "NEW_PEER") {
    const payload = message.payload;

    if (payload.peer.nodeId !== NODE_ID) {
      peerManager.addPeer(payload.peer);
    }
  }

  if (message.type === "NEW_PROOF") {
    const payload = message.payload;

    const proof = payload.proof;

    if (!nodeState.proofs.hasProof(proof.proofId)) {
      nodeState.proofs.addProof(proof);
    }
  }

  if (message.type === "NEW_VERIFICATION_RESULT") {
  const result = message.payload;

  if (!nodeState.verifications.hasResult(result.proofId, result.verifierNodeId)) {
    nodeState.verifications.addResult(result);
  }
}

  const messageToForward: NetworkMessage = {
    ...message,
    ttl: message.ttl - 1,
  };

  await gossipService.broadcast(messageToForward, message.senderNodeId);

  return res.json({
    received: true,
    nodeId: NODE_ID,
    messageType: message.type,
  });
});

app.listen(PORT, () => {
  console.log(`${NODE_ID} running on http://${HOST}:${PORT}`);
});