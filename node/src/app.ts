import express from "express";
import { randomUUID } from "crypto";
import { PeerManager } from "./gossip/peerManager";
import { GossipService } from "./gossip/gossipService";
import type { MessageType, BaseMessage, PayloadByMessageType, NetworkMessageOf, NewPeerPayload} from "./types/messages";
import type { PeerInfo } from "./types/peer";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3001);
const NODE_ID = process.env.NODE_ID ?? "node-1";
const HOST = process.env.HOST ?? "localhost";

const peerManager = new PeerManager();
const gossipService = new GossipService(() => peerManager.getAllPeers());

function createMessage<T extends MessageType>(
  type: T,
  payload: PayloadByMessageType[T]
): NetworkMessageOf<T> {
  return {
    messageId: randomUUID(),
    type,
    senderNodeId: NODE_ID,
    timestamp: Date.now(),
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

app.post("/messages", (req, res) => {
  const message = req.body as BaseMessage;

  if (!message.messageId || !message.type || !message.senderNodeId) {
    return res.status(400).json({
      error: "Invalid message format.",
    });
  }

  if (message.type === "NEW_PEER") {
    const payload = message.payload as NewPeerPayload;
    peerManager.addPeer(payload.peer);
  }

  return res.json({
    received: true,
    nodeId: NODE_ID,
    messageType: message.type,
  });
});

app.listen(PORT, () => {
  console.log(`${NODE_ID} running on http://${HOST}:${PORT}`);
});