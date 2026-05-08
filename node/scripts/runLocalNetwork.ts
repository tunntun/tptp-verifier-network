import { spawn } from "child_process";

const nodes = [
  { nodeId: "node-1", port: "3001" },
  { nodeId: "node-2", port: "3002" },
  { nodeId: "node-3", port: "3003" },
];

for (const node of nodes) {
  const child = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ID: node.nodeId,
      PORT: node.port,
      HOST: "localhost",
    },
  });

  child.on("exit", (code) => {
    console.log(`${node.nodeId} exited with code ${code}`);
  });
}