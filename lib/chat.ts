import { apiFetch } from "./api";
import { ChatMessage } from "./types";

interface ChatResponse {
    answer: string;
    references?: string[];
    latencyMs?: number;
}

/** Ask a question against the repository's Cognee memory via the backend. */
export async function askRepository(repoId: string, question: string): Promise<ChatMessage> {
    const data = await apiFetch<ChatResponse>(`/repositories/${repoId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question }),
    });

    return {
        id: `a${Date.now()}`,
        role: "assistant",
        content: data.answer || "I couldn't find anything about that in this repository's memory.",
        references: data.references?.length ? data.references : undefined,
        latencyMs: data.latencyMs,
        createdAt: Date.now(),
    };
}