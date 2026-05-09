import express from "express";
import { randomUUID } from "crypto";
import { PeerManager } from "./gossip/peerManager.js";
import { GossipService } from "./gossip/gossipService.js";
import { MessageStore } from "./gossip/messageStore.js";
import type { MessageType, BaseMessage, PayloadByMessageType, NetworkMessageOf, NewPeerPayload, NetworkMessage} from "./types/messages.js";
import type { PeerInfo } from "./types/peer.js";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3001);
const NODE_ID = process.env.NODE_ID ?? "node-1";
const HOST = process.env.HOST ?? "localhost";
const MAX_TTL = 5;

const peerManager = new PeerManager();
const gossipService = new GossipService(() => peerManager.getAllPeers());
const messageStore = new MessageStore();

function createMessage<T extends MessageType>(
  type: T,
  payload: PayloadByMessageType[T]
): NetworkMessageOf<T> {
  return {
    messageId: randomUUID(),
    type,
    senderNodeId: NODE_ID,
    timestamp: Date.now(),
    ttl: MAX_TTL,
    payload,
  };
}

app.get("/health", (_req, res) => {
  res.json({
    nodeId: NODE_ID,
    host: HOST,
    port: PORT,
    status: "running",
    peers: peerManager.getAllPeers(),
  });
});

app.post("/peers", async (req, res) => {
  const peer = req.body as PeerInfo;

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