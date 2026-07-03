import { ActivityItem, ChatMessage, Repository, TaskEvent } from "./types";

const now = Date.now();
const min = 60_000;

export const mockRepositories: Repository[] = [
  {
    id: "swiftment",
    name: "swiftment",
    language: "TypeScript",
    framework: "React Native",
    githubUrl: "github.com/bristin/swiftment",
    lastCommit: "feat: onboarding polish",
    lastSync: "5 min ago",
    memoryCoverage: 0.92,
    memoryStatus: "fresh",
    agentStatus: "online",
  },
  {
    id: "ozon-core",
    name: "ozon-core",
    language: "Rust",
    framework: "Anchor",
    githubUrl: "github.com/bristin/ozon-core",
    lastCommit: "fix: restake epoch rounding",
    lastSync: "22 min ago",
    memoryCoverage: 0.78,
    memoryStatus: "fresh",
    agentStatus: "busy",
  },
  {
    id: "zk-notary",
    name: "zk-notary",
    language: "TypeScript",
    framework: "Next.js",
    githubUrl: "github.com/bristin/zk-notary",
    lastCommit: "chore: bump circom deps",
    lastSync: "2 h ago",
    memoryCoverage: 0.54,
    memoryStatus: "stale",
    agentStatus: "offline",
  },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", repoName: "swiftment", kind: "task", message: "Task completed · Refactor auth guard", at: now - 3 * min },
  { id: "a2", repoName: "swiftment", kind: "agent", message: "Claude connected", at: now - 6 * min },
  { id: "a3", repoName: "ozon-core", kind: "sync", message: "Memory synced · 412 files", at: now - 24 * min },
  { id: "a4", repoName: "ozon-core", kind: "push", message: "GitHub push detected · main", at: now - 51 * min },
  { id: "a5", repoName: "zk-notary", kind: "pr", message: "New PR analyzed · #148 proof batching", at: now - 118 * min },
  { id: "a6", repoName: "zk-notary", kind: "issue", message: "Issue imported · flaky verifier test", at: now - 190 * min },
];

export const seedMessages: ChatMessage[] = [
  {
    id: "m0",
    role: "assistant",
    content:
      "Hi! I have fresh memory of this repository. Ask me anything — architecture, flows, or where things live.",
    createdAt: now - 10 * min,
  },
];

export function fakeAnswer(question: string): ChatMessage {
  return {
    id: `m${Date.now()}`,
    role: "assistant",
    content:
      `Here's what I found for "${question.trim()}":\n\n` +
      "Authentication is handled in `src/auth/` using a JWT session issued by the backend after GitHub OAuth. The token is stored securely and attached by a request interceptor in `lib/api.ts`.\n\n" +
      "```ts\napi.interceptors.request.use(async (config) => {\n  const token = await SecureStore.getItemAsync(\"jwt\");\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});\n```\n\n" +
      "Refresh happens on 401 via `refreshSession()` — see `src/auth/session.ts`.",
    references: ["src/auth/session.ts", "lib/api.ts", "app/sign-in.tsx"],
    latencyMs: 840,
    confidence: 0.93,
    createdAt: Date.now(),
  };
}

export const taskScript: Omit<TaskEvent, "id" | "at">[] = [
  { kind: "queued", label: "Task queued" },
  { kind: "planning", label: "Planning" },
  { kind: "searching", label: "Searching files" },
  { kind: "editing", label: "Editing App.tsx" },
  { kind: "editing", label: "Editing auth.ts" },
  { kind: "testing", label: "Running tests" },
  { kind: "passed", label: "Tests passed" },
  { kind: "commit", label: "Creating commit" },
  { kind: "completed", label: "Completed" },
];
