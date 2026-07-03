import { create } from "zustand";
import { clearSession, Session } from "./auth";
import { mockActivity, mockRepositories, taskScript } from "./mock";
import { ActivityItem, Repository, Task, TaskEvent, User } from "./types";

interface CliperState {
  user: User | null;
  token: string | null;
  repositories: Repository[];
  activity: ActivityItem[];
  tasks: Task[];
  setSession: (session: Session) => void;
  signOut: () => void;
  syncRepo: (id: string) => void;
  runTask: (repoId: string, prompt: string) => string; // returns taskId
}

let taskTimers: ReturnType<typeof setInterval>[] = [];

export const useCliper = create<CliperState>((set, get) => ({
  user: null,
  token: null,
  repositories: mockRepositories,
  activity: mockActivity,
  tasks: [],

  setSession: (session) => set({ user: session.user, token: session.token }),

  signOut: () => {
    taskTimers.forEach(clearInterval);
    taskTimers = [];
    void clearSession(); // wipe JWT from SecureStore
    set({ user: null, token: null, tasks: [] });
  },

  syncRepo: (id) => {
    // Optimistic: flip to "building", then settle as fresh.
    set((s) => ({
      repositories: s.repositories.map((r) =>
        r.id === id ? { ...r, memoryStatus: "building" } : r
      ),
    }));
    setTimeout(() => {
      set((s) => ({
        repositories: s.repositories.map((r) =>
          r.id === id
            ? {
                ...r,
                memoryStatus: "fresh",
                lastSync: "just now",
                memoryCoverage: Math.min(1, r.memoryCoverage + 0.04),
              }
            : r
        ),
        activity: [
          {
            id: `act-${Date.now()}`,
            repoName: id,
            kind: "sync",
            message: "Memory synced",
            at: Date.now(),
          },
          ...s.activity,
        ],
      }));
    }, 1400);
  },

  runTask: (repoId, prompt) => {
    const taskId = `task-${Date.now()}`;
    const task: Task = { id: taskId, repoId, prompt, status: "queued", events: [] };
    set((s) => ({ tasks: [task, ...s.tasks] }));

    // Simulated websocket stream: one event every ~1.2s.
    let i = 0;
    const timer = setInterval(() => {
      const step = taskScript[i];
      if (!step) {
        clearInterval(timer);
        return;
      }
      const ev: TaskEvent = { ...step, id: `${taskId}-${i}`, at: Date.now() };
      const done = step.kind === "completed";
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: done ? "completed" : i === 0 ? "queued" : "running",
                events: [...t.events, ev],
              }
            : t
        ),
        activity: done
          ? [
              {
                id: `act-${Date.now()}`,
                repoName: repoId,
                kind: "task" as const,
                message: `Task completed · ${prompt.slice(0, 42)}`,
                at: Date.now(),
              },
              ...s.activity,
            ]
          : s.activity,
      }));
      i += 1;
      if (done) clearInterval(timer);
    }, 1200);
    taskTimers.push(timer);
    return taskId;
  },
}));
