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

  await sleep(300);

  const node2Health = await fetch("http://localhost:3002/health").then((r) =>
    r.json()
  );

  const newProofMessage = await postJson("http://localhost:3002/create-message", {
    type: "NEW_PROOF",
    payload: {
      proof: {
        proofId: "proof-1",
        problemFile: "testProblem.p",
        proofFile: "proof.s",
        prover: "E",
        status: "PENDING",
        createdAt: Date.now(),
      },
    },
  });

  await postJson("http://localhost:3001/messages", newProofMessage);

  await sleep(500);

  const node1 = await fetch("http://localhost:3001/health").then((r) => r.json());
  const node2 = await fetch("http://localhost:3002/health").then((r) => r.json());

  console.log("node-1 proofs:", node1.proofs);
  console.log("node-2 proofs:", node2.proofs);
}

main().catch(console.error);