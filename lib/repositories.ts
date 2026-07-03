import { apiFetch } from "./api";
import { Repository } from "./types";

/** Raw row shape returned by GET /repositories (Supabase columns). */
interface RepositoryRow {
  id: string;
  name: string;
  github_owner: string;
  github_repo: string;
  branch: string;
  status: string;
  cognee_dataset: string;
  updated_at: string;
}

/** All repositories registered by the signed-in user via `cliper init`. */
export async function getRepositories(): Promise<Repository[]> {
  const rows = await apiFetch<RepositoryRow[]>("/repositories");
  return rows.map(toRepository);
}

/** Single repository by id. Falls back on the list endpoint if not needed server-side yet. */
export async function getRepository(id: string): Promise<Repository | undefined> {
  const all = await getRepositories();
  return all.find((r) => r.id === id);
}

function toRepository(row: RepositoryRow): Repository {
  return {
    id: row.id,
    name: row.name,
    github_owner: row.github_owner,
    github_repo: row.github_repo,
    branch: row.branch,
    status: row.status,
    cognee_dataset: row.cognee_dataset,
    updated_at: row.updated_at,
  };
}
