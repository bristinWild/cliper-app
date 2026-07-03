import { create } from "zustand";
import { clearSession, Session } from "./auth";
import { mockActivity, taskScript } from "./mock";
import { getRepositories } from "./repositories";
import { ActivityItem, Repository, Task, TaskEvent, User } from "./types";

interface CliperState {
  user: User | null;
  token: string | null;

  repositories: Repository[];
  reposLoading: boolean;
  reposError: string | null;

  activity: ActivityItem[];
  tasks: Task[];

  setSession: (session: Session) => void;
  signOut: () => void;
  fetchRepositories: () => Promise<void>;
  runTask: (repoId: string, prompt: string) => string; // returns taskId
}

let taskTimers: ReturnType<typeof setInterval>[] = [];

export const useCliper = create<CliperState>((set, get) => ({
  user: null,
  token: null,

  repositories: [],
  reposLoading: false,
  reposError: null,

  activity: mockActivity, // TODO: swap for GET /repositories/:id/activity when backend lands
  tasks: [],

  setSession: (session) => set({ user: session.user, token: session.token }),

  signOut: () => {
    taskTimers.forEach(clearInterval);
    taskTimers = [];
    void clearSession(); // wipe JWT from SecureStore
    set({ user: null, token: null, tasks: [], repositories: [], reposError: null });
  },

  fetchRepositories: async () => {
    set({ reposLoading: true, reposError: null });
    try {
      const repositories = await getRepositories();
      set({ repositories, reposLoading: false });
    } catch (err) {
      set({
        reposLoading: false,
        reposError: err instanceof Error ? err.message : "Couldn't load repositories",
      });
    }
  },

  // Simulated agent task stream — replace setInterval with the /ws subscription.
  runTask: (repoId, prompt) => {
    const taskId = `task-${Date.now()}`;
    const task: Task = { id: taskId, repoId, prompt, status: "queued", events: [] };
    set((s) => ({ tasks: [task, ...s.tasks] }));

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
