import { readFileSync } from "fs";

const problemContent = readFileSync(
  "./problems/AGT001+1.p",
  "utf8"
);

const proofContent = readFileSync(
  "./proofs/AGT001+1.s",
  "utf8"
);

const response = await fetch("http://localhost:3001/proofs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    problemContent,
    proofContent,
    gdvPath: "/Users/hatun/Documents/GitHub/GDV/GDV",
  }),
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));