import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

type CommandResult = {
  stdout: string;
  stderr: string;
  code: number | null;
};

type Certificate = {
  problemFile: string;
  rawProofFile: string;
  cleanedProofFile: string;
  gdvPath: string;
  eproverCommand: string[];
  gdvCommand: string[];
  verified: boolean;
  szsStatus: string | null;
  hashes: {
    problemSha256: string;
    rawProofSha256: string;
    cleanedProofSha256: string;
  };
  outputs: {
    eproverStdout: string;
    eproverStderr: string;
    gdvStdout: string;
    gdvStderr: string;
  };
};

function runCommand(
  cmd: string,
  args: string[],
  cwd?: string
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });
  });
}

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function extractSZS(output: string): string | null {
  const match = output.match(/SZS status\s+([A-Za-z]+)/);
  if (match) return match[1];

  if (output.includes("SUCCESS: Verified")) return "Verified";
  if (output.includes("NotVerified")) return "NotVerified";

  return null;
}

function cleanProof(raw: string): string {
  const lines = raw.split("\n");
  const kept: string[] = [];
  let insideProof = false;

  for (const originalLine of lines) {
    const line = originalLine.trim();

    if (line.includes("SZS output start")) {
      insideProof = true;
      continue;
    }

    if (line.includes("SZS output end")) {
      insideProof = false;
      continue;
    }

    if (insideProof && line.startsWith("cnf(")) {
      kept.push(line);
    }
  }

  return kept.join("\n") + "\n";
}
async function main() {
  const gdvPath = process.argv[2];
  const problemFile = process.argv[3];

  if (!gdvPath || !problemFile) {
    console.error("Usage: npx tsx verifyProof.ts <path-to-GDV> <problem.p>");
    process.exit(1);
  }

  const certificateDir = path.resolve("certificate-output");
  await fs.mkdir(certificateDir, { recursive: true });

  const rawProofFile = path.join(certificateDir, "raw-proof.s");
  const cleanedProofFile = path.join(certificateDir, "clean-proof.s");

  const eproverArgs = [
    "--tstp-format",
    "--proof-object",
    problemFile,
  ];

  const eproverResult = await runCommand("eprover", eproverArgs);

  const rawProof = eproverResult.stdout + "\n" + eproverResult.stderr;
  await fs.writeFile(rawProofFile, rawProof);

  const cleanedProof = cleanProof(rawProof);
  await fs.writeFile(cleanedProofFile, cleanedProof);

  const gdvArgs = [
    "-d",
    "-l",
    "-p",
    problemFile,
    cleanedProofFile,
  ];

  const gdvResult = await runCommand(gdvPath, gdvArgs);

  const gdvOutput = gdvResult.stdout + "\n" + gdvResult.stderr;
  const szsStatus = extractSZS(gdvOutput);
  const verified = szsStatus === "Verified";

  const problemContent = await fs.readFile(problemFile, "utf-8");

  const certificate: Certificate = {
    problemFile,
    rawProofFile,
    cleanedProofFile,
    gdvPath,
    eproverCommand: ["eprover", ...eproverArgs],
    gdvCommand: [gdvPath, ...gdvArgs],
    verified,
    szsStatus,
    hashes: {
      problemSha256: sha256(problemContent),
      rawProofSha256: sha256(rawProof),
      cleanedProofSha256: sha256(cleanedProof),
    },
    outputs: {
      eproverStdout: eproverResult.stdout,
      eproverStderr: eproverResult.stderr,
      gdvStdout: gdvResult.stdout,
      gdvStderr: gdvResult.stderr,
    },
  };

  await fs.writeFile(
    path.join(certificateDir, "certificate.json"),
    JSON.stringify(certificate, null, 2)
  );

  await fs.copyFile(
    problemFile,
    path.join(certificateDir, path.basename(problemFile))
  );

  console.log("Verification finished.");
  console.log(`SZS status: ${szsStatus}`);
  console.log(`Verified: ${verified}`);
  console.log(`Certificate directory: ${certificateDir}`);

  if (!verified) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});