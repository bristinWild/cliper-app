export type AgentStatus = "online" | "offline" | "busy";

export interface Repository {
  id: string;
  name: string;
  language: string;
  framework: string;
  githubUrl: string;
  lastCommit: string;
  lastSync: string;
  memoryCoverage: number; // 0..1
  memoryStatus: "fresh" | "stale" | "building";
  agentStatus: AgentStatus;
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
