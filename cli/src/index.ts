import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { runText2Sim } from "@agent-musaj/text2sim";

interface CliOptions {
  prompt: string;
  outDir: string;
}

function parseArgs(argv: string[]): CliOptions {
  const promptIndex = argv.indexOf("--prompt");
  const outIndex = argv.indexOf("--out");
  const prompt = promptIndex >= 0 ? argv[promptIndex + 1] : undefined;
  const outDir = outIndex >= 0 ? argv[outIndex + 1] : undefined;
  const positional = argv.filter((value) => !value.startsWith("--"));

  return {
    prompt: prompt ?? positional[0] ?? "Create a steel beam under a transverse load",
    outDir: outDir ?? positional[1] ?? "out"
  };
}

async function writeArtifacts(outDir: string, prompt: string) {
  const result = runText2Sim(prompt);
  const absoluteOutDir = resolve(process.cwd(), outDir);

  await mkdir(absoluteOutDir, { recursive: true });

  for (const artifact of result.artifacts) {
    await writeFile(resolve(absoluteOutDir, artifact.fileName), artifact.content, "utf8");
  }

  await writeFile(
    resolve(absoluteOutDir, "run-result.json"),
    JSON.stringify(
      {
        status: result.status,
        validation: result.validation,
        commands: result.commands,
        plan: result.plan
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Prompt: ${prompt}`);
  console.log(`Status: ${result.status}`);
  console.log(`Artifacts written to: ${absoluteOutDir}`);
  console.log("Commands:");
  for (const command of result.commands) {
    console.log(`  - ${command}`);
  }

  if (!result.validation.valid) {
    console.log("Validation issues:");
    for (const issue of result.validation.issues) {
      console.log(`  - [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
  }
}

const options = parseArgs(process.argv.slice(2));

writeArtifacts(options.outDir, options.prompt).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
