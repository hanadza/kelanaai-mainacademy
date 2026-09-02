const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserDocument {
  name: string;
  content: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  source?: string;
}

/**
 * POST /api/v1/ask
 * Query the Bedrock Knowledge Base travel assistant with optional chat history and user reference documents.
 */
export async function askKnowledgeBase(
  question: string,
  history?: ChatMessage[],
  user_documents?: UserDocument[]
): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, history, user_documents }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.detail || `Failed to query Knowledge Base (HTTP ${res.status}).`
    );
  }

  return body;
}
