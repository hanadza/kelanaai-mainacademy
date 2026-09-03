import { getAuthHeaders } from "./authService";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  timestamp?: string;
}

export interface UserDocument {
  name: string;
  content: string;
}

export interface ConversationResponse {
  id: string;
  conversation_id?: number;
  title: string;
  user_id?: number | null;
  created_at: string;
  updated_at?: string;
  messages_count?: number;
  messages?: ChatMessage[];
}

export interface AskResponse {
  conversation_id: string;
  question: string;
  answer: string;
  source?: string;
  history?: ChatMessage[];
}

/**
 * GET /api/v1/conversations
 * Fetch all chat conversations from DB backend.
 */
export async function getConversations(): Promise<ConversationResponse[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch conversations (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * POST /api/v1/conversations
 * Create a new chat session in DB backend.
 */
export async function createConversation(title: string = "Obrolan Baru"): Promise<ConversationResponse> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create conversation (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * GET /api/v1/conversations/:id
 * Get a specific conversation and all its persisted messages.
 */
export async function getConversationDetail(conversationId: string): Promise<ConversationResponse> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch conversation details (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * DELETE /api/v1/conversations/:id
 * Delete a conversation from DB backend.
 */
export async function deleteConversationApi(conversationId: string): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete conversation (HTTP ${res.status}).`);
  }
}

/**
 * PATCH /api/v1/conversations/:id (Bonus Challenge: Rename Conversation)
 * Rename a conversation session in DB backend.
 */
export async function renameConversationApi(
  conversationId: string,
  newTitle: string
): Promise<ConversationResponse> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title: newTitle }),
  });
  if (!res.ok) {
    throw new Error(`Failed to rename conversation (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * POST /api/v1/ask
 * Query Bedrock Knowledge Base RAG with persistent database conversation memory.
 */
export async function askKnowledgeBase(
  question: string,
  conversation_id?: string,
  history?: ChatMessage[],
  user_documents?: UserDocument[]
): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      question,
      conversation_id: conversation_id ? parseInt(conversation_id, 10) : undefined,
      history,
      user_documents,
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.detail || `Failed to query Knowledge Base (HTTP ${res.status}).`
    );
  }

  return body;
}
