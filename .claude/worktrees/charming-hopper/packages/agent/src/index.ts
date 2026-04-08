import { query, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { appendFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../..");
const LOG_FILE = join(__dirname, "../agent.log");

const logToolCall: HookCallback = async (input) => {
  const i = input as Record<string, any>;
  const tool: string = i["tool_name"] ?? "unknown";
  const detail: string =
    i["tool_input"]?.["file_path"] ??
    i["tool_input"]?.["pattern"] ??
    i["tool_input"]?.["query"] ??
    "";
  appendFileSync(LOG_FILE, `${new Date().toISOString()} ${tool} ${detail}\n`);
  return {};
};

const SYSTEM_PROMPT = `\
You are a feature-building agent for Teko — a cooperative community platform.
Turborepo monorepo, npm workspaces, TypeScript strict mode everywhere.

## Apps & packages
- apps/web              — Next.js (App Router). All pages live here.
- packages/db           — @teko/db. Supabase clients + queries. Never bypass this layer.
- packages/ui           — @repo/ui. Shared React components.

## packages/db exports
- createWebClient()         — browser Supabase client ('use client' components)
- createServerClient(cookieStore) — server Supabase client (Server Components, Route Handlers)
- createAdminClient()       — service role, bypasses RLS (Server Actions only, never client-side)
- types: Place, Profile, PlaceWithSubmitter, PlaceInsert, ProfileUpdate, PlaceCategory
- queries/places: getApprovedPlaces, getPlaceById, submitPlace, getPendingPlaces, updatePlaceStatus
- queries/profiles: getProfile, updateProfile

## Data model (Supabase)
profiles: id, username, display_name, bio, avatar_url, neighborhood, lat/lng, skills[], languages[],
          credit_balance, subscription_status, is_sustainer, is_admin
places:   id, name, description, address, lat/lng, category, ownership_types[], place_values[],
          is_cooperative, cooperative_type, website, instagram, photos[], hours, submitted_by,
          status (pending|approved|rejected), rejection_reason
Storage buckets: place-photos, avatars (both public read, authenticated write)

## Auth
Magic link (OTP) + Google OAuth via Supabase. No passwords.
Session managed by @supabase/ssr. Callback at /auth/callback.
middleware.ts protects all routes except /auth. /admin requires is_admin=true.

## Conventions
- CSS Modules for all styles (*.module.css next to the component)
- Server Components fetch data; Client Components handle interaction
- Dynamic import with ssr:false for any component that uses mapbox-gl
- Server Actions use createAdminClient() for writes that bypass RLS
- params in Next.js 15 are a Promise: await params before destructuring
- Internal imports within packages/db use .js extensions (NodeNext)
- Do not install new packages unless truly necessary
- Read similar existing files before writing anything new
- Minimal change: implement only what is asked, nothing more
`;

async function main() {
  const feature = process.argv.slice(2).join(" ");
  if (!feature) {
    console.error('Usage: npm run start -- "<feature description>"');
    process.exit(1);
  }

  console.log(`\nBuilding: ${feature}\n`);

  for await (const message of query({
    prompt: `Implement this feature in the teko monorepo:\n\n${feature}`,
    options: {
      cwd: REPO_ROOT,
      allowedTools: ["Read", "Glob", "Grep", "Write", "Edit"],
      permissionMode: "acceptEdits",
      maxTurns: 20,
      systemPrompt: SYSTEM_PROMPT,
      hooks: {
        PostToolUse: [{ matcher: ".*", hooks: [logToolCall] }],
      },
    },
  })) {
    if ("result" in message) {
      console.log("\n" + message.result);
    }
  }
}

main().catch(console.error);
