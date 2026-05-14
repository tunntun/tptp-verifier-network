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
    host: "localhost",
    port: 3002,
  });

  await postJson("http://localhost:3001/peers", {
    host: "localhost",
    port: 3003,
  });

  await postJson("http://localhost:3002/peers", {
    host: "localhost",
    port: 3001,
  });

  await postJson("http://localhost:3002/peers", {
    host: "localhost",
    port: 3003,
  });

  await postJson("http://localhost:3003/peers", {
    host: "localhost",
    port: 3001,
  });

  await postJson("http://localhost:3003/peers", {
    host: "localhost",
    port: 3002,
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