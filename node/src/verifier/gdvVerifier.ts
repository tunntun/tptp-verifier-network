import { execFile } from "child_process";
import { createHash, randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

import type { NodeId } from "../types/peer.js";
import type { VerificationResult } from "../types/verification.js";

const execFileAsync = promisify(execFile);

export interface RunGDVInput {
  proofId: string;
  verifierNodeId: NodeId;
  problemContent: string;
  proofContent: string;
  tptpRoot: string;
  dockerImage: string;
}

function extractSZSStatus(output: string): string | null {
  const match = output.match(/SZS status\s+([A-Za-z_]+)/i);

  if (!match || !match[1]) {
    return null;
  }

  return match[1];
}

function normalizeTPTPIncludes(problemContent: string): string {
  return problemContent.replace(
    /include\('([^']+)'\)\./g,
    (_, includePath) => {
      if (includePath.startsWith("/"))
        return `include('${includePath}').`;

      return `include('/tptp/${includePath}').`;
    }
  );
}

export async function runGDV(input: RunGDVInput): Promise<VerificationResult> {
  const { proofId, verifierNodeId, problemContent, proofContent, tptpRoot, dockerImage } =
    input;

  const workDir = join(tmpdir(), `gdv-${proofId}-${randomUUID()}`);
  const problemFile = join(workDir, "problem.p");
  const proofFile = join(workDir, "proof.s");

  const cleanedProofContent = proofContent
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();

      return (
        trimmed.startsWith("fof(") ||
        trimmed.startsWith("cnf(") ||
        trimmed.startsWith("%")
      );
    })
    .join("\n");

  await mkdir(workDir, { recursive: true });

  try {
    const normalizedProblemContent = normalizeTPTPIncludes(problemContent);

    await writeFile(problemFile, normalizedProblemContent, "utf8");
    await writeFile(proofFile, cleanedProofContent, "utf8");
    const { stdout, stderr } = await execFileAsync("docker", [
      "run",
      "--rm",
      "--platform",
      "linux/amd64",
      "-v",
      `${workDir}:/work`,
      "-v",
      `${tptpRoot}:/tptp:ro`,
      dockerImage,
      "GDV",
      "-d",
      "-l",
      "-p",
      "/work/problem.p",
      "/work/proof.s",
    ]);

    const gdvOutput = `${stdout}\n${stderr}`;
    const szsStatus = extractSZSStatus(gdvOutput);
    const verified = gdvOutput.includes("SUCCESS") || szsStatus === "Verified";

    return {
      proofId,
      verifierNodeId,
      verified,
      szsStatus,
      gdvOutputHash: createHash("sha256").update(gdvOutput).digest("hex"),
      gdvRawOutput: gdvOutput,
      verifiedAt: Date.now(),
    };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };

    const gdvOutput = `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${
      err.message ?? ""
    }`;

    return {
      proofId,
      verifierNodeId,
      verified: false,
      szsStatus: extractSZSStatus(gdvOutput),
      gdvOutputHash: createHash("sha256").update(gdvOutput).digest("hex"),
      gdvRawOutput: gdvOutput,
      verifiedAt: Date.now(),
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}