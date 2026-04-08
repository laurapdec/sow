import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const prompt = process.argv[2] ?? "Describe the files in the current directory";

  for await (const message of query({
    prompt,
    options: {
      cwd: process.cwd(),
      allowedTools: ["Read", "Glob", "Grep"],
    },
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}

main().catch(console.error);
