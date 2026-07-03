export type AgentStatus = "online" | "offline" | "busy";

/** Repository record as registered by `cliper init` (Supabase `repositories` table). */
export interface Repository {
  id: string;
  name: string;
  github_owner: string;
  github_repo: string;
  branch: string;
  status: string; // e.g. "ready" | "indexing" | "error" — display-mapped, not enforced
  cognee_dataset: string;
  updated_at: string; // ISO timestamp
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[];
  latencyMs?: number;
  confidence?: number;
  createdAt: number;
}

export type TaskEventKind =
  | "planning"
  | "searching"
  | "editing"
  | "testing"
  | "passed"
  | "commit"
  | "completed"
  | "failed"
  | "queued";

export interface TaskEvent {
  id: string;
  kind: TaskEventKind;
  label: string;
  at: number;
}

export interface Task {
  id: string;
  repoId: string;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed";
  events: TaskEvent[];
}

export interface ActivityItem {
  id: string;
  repoName: string;
  kind: "sync" | "agent" | "task" | "push" | "pr" | "issue";
  message: string;
  at: number;
}

export interface User {
  username: string;
  avatarUrl: string;
}
