const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

async function main() {
  await postJson("http://localhost:3001/peers", {
    nodeId: "node-2",
    host: "localhost",
    port: 3002,
  });

  await postJson("http://localhost:3002/peers", {
    nodeId: "node-3",
    host: "localhost",
    port: 3003,
  });

  await postJson("http://localhost:3001/messages", {
    messageId: "ttl-test-script-1",
    type: "NEW_PEER",
    senderNodeId: "external-node",
    timestamp: Date.now(),
    ttl: 1,
    payload: {
      peer: {
        nodeId: "node-x",
        host: "localhost",
        port: 9999,
      },
    },
  });

  await sleep(500);

  const node1 = await fetch("http://localhost:3001/health").then((r) => r.json());
  const node2 = await fetch("http://localhost:3002/health").then((r) => r.json());
  const node3 = await fetch("http://localhost:3003/health").then((r) => r.json());

  console.log("node-1:", node1);
  console.log("node-2:", node2);
  console.log("node-3:", node3);
}

main().catch(console.error);