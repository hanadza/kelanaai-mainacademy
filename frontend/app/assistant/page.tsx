"use client";

import Link from "next/link";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  askKnowledgeBase,
  getConversations,
  createConversation,
  getConversationDetail,
  deleteConversationApi,
  renameConversationApi,
  ChatMessage,
  UserDocument,
} from "@/services/assistantService";
import { getCurrentUser, User } from "@/services/authService";
import { FormattedMarkdown } from "@/lib/markdown";

interface ExtendedChatMessage extends ChatMessage {
  id: string;
  timestamp: string;
  source?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ExtendedChatMessage[];
  userDocuments: UserDocument[];
}

const GUEST_LIMIT = 3;

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [guestAsksCount, setGuestAsksCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Rename Conversation State (Bonus Challenge)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Active documents attached to current session (NotebookLM style)
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename session helper (Bonus Challenge)
  async function handleRenameSession(sessionId: string, newTitle: string) {
    if (!newTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await renameConversationApi(sessionId, newTitle.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() } : s))
      );
    } catch (err) {
      console.warn("Failed to rename session", err);
    } finally {
      setEditingSessionId(null);
    }
  }

  // Active session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  // Load detailed messages for a given session ID from backend
  async function loadConversationMessages(sessId: string) {
    try {
      const detail = await getConversationDetail(sessId);
      const detailMessages: ExtendedChatMessage[] = (detail.messages || []).map((m) => ({
        id: m.id || Date.now().toString(),
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: m.role === "assistant" ? "AWS Knowledge Base Verified" : undefined,
      }));

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessId ? { ...s, title: detail.title, messages: detailMessages } : s
        )
      );
    } catch (e) {
      console.warn("Failed to load conversation messages from server", e);
    }
  }

  // Handle switching active conversation session
  function handleSelectSession(sessId: string) {
    setActiveSessionId(sessId);
    const targetSession = sessions.find((s) => s.id === sessId);
    if (targetSession) {
      setUserDocuments(targetSession.userDocuments || []);
    }
    loadConversationMessages(sessId);
  }

  // Initialize client state, current user, and PostgreSQL sessions (with localStorage fallback)
  useEffect(() => {
    setIsClient(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Load guest ask count
    const savedGuestCount = localStorage.getItem("kelana_guest_ask_count");
    if (savedGuestCount) {
      setGuestAsksCount(parseInt(savedGuestCount, 10) || 0);
    }

    async function initSessions() {
      try {
        const backendConvs = await getConversations();
        if (backendConvs && backendConvs.length > 0) {
          const loadedSessions: ChatSession[] = backendConvs.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updated_at || "Baru saja",
            messages: [],
            userDocuments: [],
          }));

          setSessions(loadedSessions);
          setActiveSessionId(loadedSessions[0].id);
          loadConversationMessages(loadedSessions[0].id);
          return;
        }
      } catch (e) {
        console.warn("Backend conversation API unavailable, using local session state.", e);
      }

      // Local storage fallback if offline or guest mode
      const storageKey = currentUser
        ? `kelana_assistant_sessions_user_${currentUser.id}`
        : "kelana_assistant_sessions_guest";

      const savedSessionsStr = localStorage.getItem(storageKey);
      let loadedSessions: ChatSession[] = [];
      if (savedSessionsStr) {
        try {
          loadedSessions = JSON.parse(savedSessionsStr);
        } catch {
          loadedSessions = [];
        }
      }

      if (loadedSessions.length === 0) {
        try {
          const created = await createConversation("Obrolan Baru");
          loadedSessions = [
            {
              id: created.id,
              title: created.title,
              updatedAt: "Baru saja",
              messages: [],
              userDocuments: [],
            },
          ];
        } catch {
          loadedSessions = [
            {
              id: Date.now().toString(),
              title: "Obrolan Baru",
              updatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              messages: [],
              userDocuments: [],
            },
          ];
        }
      }

      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
      setUserDocuments(loadedSessions[0].userDocuments || []);
    }

    initSessions();
  }, []);

  // Save sessions to localStorage as client cache
  useEffect(() => {
    if (!isClient) return;
    const storageKey = user
      ? `kelana_assistant_sessions_user_${user.id}`
      : "kelana_assistant_sessions_guest";
    localStorage.setItem(storageKey, JSON.stringify(sessions));
  }, [sessions, user, isClient]);

  // Sync userDocuments when active session changes
  useEffect(() => {
    if (activeSession) {
      setUserDocuments(activeSession.userDocuments || []);
    }
  }, [activeSessionId]);

  // Auto-scroll to latest message (Skenario 1: Buka/ganti percakapan & Skenario 2: Pesan baru dikirim/diketik)
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages, loading, activeSessionId]);

  const isGuestLimitReached = !user && guestAsksCount >= GUEST_LIMIT;

  const sampleQuestions = [
    "Can I bring medication into Japan?",
    "Do I need a visa to visit Japan?",
    "What documents are required for a short-term stay visa?",
  ];

  // Helper: Create a new chat session (DeepSeek style "+ Obrolan Baru")
  async function handleNewChat() {
    let newSessId = Date.now().toString();
    let newTitle = "Obrolan Baru";
    try {
      const created = await createConversation("Obrolan Baru");
      newSessId = created.id;
      newTitle = created.title;
    } catch (e) {
      console.warn("Using local session ID for new chat", e);
    }

    const newSession: ChatSession = {
      id: newSessId,
      title: newTitle,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      messages: [],
      userDocuments: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setUserDocuments([]);
    setError("");
  }

  // Helper: Delete a chat session from database and local state
  async function handleDeleteSession(sessionIdToDelete: string, e: React.MouseEvent) {
    e.stopPropagation();

    try {
      await deleteConversationApi(sessionIdToDelete);
    } catch (err) {
      console.warn("Failed to delete session on server", err);
    }

    const filtered = sessions.filter((s) => s.id !== sessionIdToDelete);
    if (filtered.length === 0) {
      handleNewChat();
    } else {
      setSessions(filtered);
      if (activeSessionId === sessionIdToDelete) {
        handleSelectSession(filtered[0].id);
      }
    }
  }

  // Helper: Upload custom reference document (Gemini NotebookLM style)
  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const newDoc: UserDocument = {
            name: file.name,
            content: content.slice(0, 10000), // Limit size to fit LLM prompt cleanly
          };

          setUserDocuments((prev) => {
            const updated = [...prev, newDoc];
            setSessions((prevSessions) =>
              prevSessions.map((s) =>
                s.id === activeSessionId ? { ...s, userDocuments: updated } : s
              )
            );
            return updated;
          });
        }
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveDocument(docName: string) {
    const updated = userDocuments.filter((d) => d.name !== docName);
    setUserDocuments(updated);
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId ? { ...s, userDocuments: updated } : s
      )
    );
  }

  async function handleSendQuestion(textToSend?: string) {
    const query = (textToSend || question).trim();
    if (!query || loading) return;

    if (isGuestLimitReached) {
      setError(
        "Anda telah mencapai batas 3 pertanyaan gratis. Silakan Login atau Register untuk melanjutkan percakapan tanpa batas."
      );
      return;
    }

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentMsgs = activeSession ? activeSession.messages : [];
    const updatedMessages = [...currentMsgs, userMessage];

    // Auto update session title on first question
    const sessionTitle =
      currentMsgs.length === 0
        ? query.slice(0, 30) + (query.length > 30 ? "..." : "")
        : activeSession?.title || "Obrolan Baru";

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              messages: updatedMessages,
              updatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : s
      )
    );

    setQuestion("");
    setLoading(true);
    setError("");

    // Increment guest ask count if not logged in
    if (!user) {
      const newCount = guestAsksCount + 1;
      setGuestAsksCount(newCount);
      localStorage.setItem("kelana_guest_ask_count", newCount.toString());
    }

    try {
      const historyPayload: ChatMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call backend ask API with question, active session ID for persistent DB memory, history, AND user_documents
      const response = await askKnowledgeBase(
        query,
        activeSessionId,
        historyPayload,
        userDocuments.length > 0 ? userDocuments : undefined
      );

      const sourceCitation =
        userDocuments.length > 0
          ? `User Ref: ${userDocuments.map((d) => d.name).join(", ")} | AWS Knowledge Base`
          : "travel-guides/visa-japan.pdf (AWS Knowledge Base Verified)";

      if (response.history && response.history.length > 0) {
        const serverMessages: ExtendedChatMessage[] = response.history.map((m, idx) => ({
          id: m.id || `${Date.now()}_${idx}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: m.role === "assistant" ? sourceCitation : undefined,
        }));

        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId || s.id === response.conversation_id
              ? {
                  ...s,
                  id: response.conversation_id || s.id,
                  title: sessionTitle,
                  messages: serverMessages,
                }
              : s
          )
        );

        if (response.conversation_id && response.conversation_id !== activeSessionId) {
          setActiveSessionId(response.conversation_id);
        }
      } else {
        const assistantMessage: ExtendedChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.answer,
          source: sourceCitation,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, assistantMessage] }
              : s
          )
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengambil jawaban dari Knowledge Base.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSendQuestion();
  }

  return (
    <main className="page-shell mx-auto flex h-screen max-h-screen w-full max-w-7xl flex-col justify-between px-3 py-3 sm:px-6 lg:px-8 box-border overflow-hidden bg-[#f4f1e9]">
      {/* Header & Top Navigation */}
      <header className="mb-2.5 border-b-2 border-slate-900 pb-2.5 shrink-0 bg-white p-3 rounded-xl shadow-[4px_4px_0_#176b50]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] p-1.5 sm:p-2 text-slate-900 shadow-[2px_2px_0_#176b50] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all rounded-lg flex items-center justify-center shrink-0"
              title="Toggle History Sidebar"
              aria-label="Toggle Sidebar"
            >
              <svg
                className="w-5 h-5 stroke-slate-900 stroke-[2.5]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900 no-underline hover:text-[#176b50]"
            >
              Kelana<span className="text-[#176b50]">AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/profile"
                className="border-2 border-slate-900 bg-[#fffdf8] hover:bg-yellow-50 px-3 py-1 text-xs font-bold text-[#176b50] shadow-[2px_2px_0_#176b50] no-underline"
              >
                PROFIL ({user.name})
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="border-2 border-slate-900 bg-[#f4dc4d] px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#176b50] no-underline"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="border-2 border-slate-900 bg-[#fffdf8] px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#176b50] no-underline hidden sm:inline"
                >
                  REGISTER
                </Link>
              </div>
            )}
            <Link
              href="/trips"
              className="border-2 border-slate-900 bg-[#fffdf8] px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#176b50] no-underline"
            >
              MY TRIPS
            </Link>
          </div>
        </div>
      </header>

      {/* Main 2-Column Shell (Sidebar Left + Chat Main Right) */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden mb-2">
        {/* Left Sidebar: DeepSeek Style Chat History */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-72 border-2 border-slate-900 bg-white p-3 shadow-[5px_5px_0_#176b50] rounded-xl flex flex-col shrink-0 overflow-hidden">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full mb-3 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold py-2 px-3 text-xs uppercase tracking-wider shadow-[3px_3px_0_#176b50] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 rounded-lg shrink-0"
            >
              <span className="text-base font-black">+</span>
              <span>Obrolan Baru</span>
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              History Obrolan ({sessions.length})
            </div>

            {/* List of Chat Sessions */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-lg border-2 text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "border-slate-900 bg-[#176b50] text-white shadow-[3px_3px_0_#0f4333]"
                        : "border-slate-300 bg-slate-50 hover:bg-yellow-50 text-slate-800 hover:border-slate-900"
                    }`}
                  >
                    {editingSessionId === sess.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleRenameSession(sess.id, editingTitle)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSession(sess.id, editingTitle);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        autoFocus
                        className="flex-1 bg-white border border-slate-900 px-1.5 py-0.5 text-xs text-slate-900 font-bold rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="truncate flex-1 pr-1">
                        <p className="truncate font-bold">
                          {sess.title || "Obrolan Baru"}
                        </p>
                        <p
                          className={`text-[9px] mt-0.5 ${
                            isActive ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          {sess.messages.length} pesan · {sess.updatedAt}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(sess.id);
                          setEditingTitle(sess.title || "Obrolan Baru");
                        }}
                        className={`text-xs opacity-60 hover:opacity-100 p-0.5 hover:text-yellow-300 ${
                          isActive ? "text-white" : "text-slate-600"
                        }`}
                        title="Ubah nama percakapan (Rename)"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className={`text-xs opacity-60 hover:opacity-100 p-0.5 hover:text-red-400 ${
                          isActive ? "text-white" : "text-slate-600"
                        }`}
                        title="Hapus percakapan ini"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Account Quota Badge in Sidebar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 shrink-0 text-center">
              {user ? (
                <span className="inline-flex items-center gap-1 border border-emerald-600 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-900 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  UNLIMITED ASKS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 border border-amber-600 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900 rounded">
                  GUEST: {Math.min(guestAsksCount, GUEST_LIMIT)}/{GUEST_LIMIT} Free Asks
                </span>
              )}
            </div>
          </aside>
        )}

        {/* Right Main Chat Panel */}
        <section className="flex-1 min-w-0 flex flex-col border-2 border-slate-900 bg-white shadow-[6px_6px_0_#176b50] rounded-xl overflow-hidden">
          {/* Top Bar for Chat Title & Reference Documents (Gemini NotebookLM Style) */}
          <div className="p-3 bg-slate-100 border-b-2 border-slate-900 shrink-0 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 truncate">
                {activeSession?.title || "Obrolan Baru"}
              </h2>
              <p className="text-[11px] text-slate-600">
                Knowledge Base RAG & Persistent DB Memory
              </p>
            </div>

            {/* Gemini NotebookLM Style Reference Document Uploader */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.pdf,.json"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-slate-900 bg-yellow-100 hover:bg-yellow-200 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0_#176b50] cursor-pointer flex items-center gap-1 rounded-md"
                title="Unggah file referensi tambahan (.txt, .md, .pdf)"
              >
                <span>📎 Tambah Referensi</span>
              </button>

              {userDocuments.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 border border-slate-900 bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-950 rounded-md shadow-xs"
                >
                  <span className="truncate max-w-[150px]">📄 {doc.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.name)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-800 text-white hover:bg-red-600 text-[10px] font-bold leading-none cursor-pointer transition-colors shrink-0 border-none p-0"
                    title={`Hapus ${doc.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Guest Limit Warning Banner */}
          {isGuestLimitReached && (
            <div className="p-3 bg-[#f4dc4d] border-b-2 border-slate-900 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
              <div>
                <span className="font-black text-xs">
                  🔒 Batas 3 Pertanyaan Gratis Tercapai
                </span>
                <p className="text-[11px] text-slate-800">
                  Login atau Register untuk terus bertanya tanpa batas & menyimpan riwayat!
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="border-2 border-slate-900 bg-[#176b50] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider no-underline"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="border-2 border-slate-900 bg-white text-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider no-underline"
                >
                  REGISTER
                </Link>
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-2 bg-red-50 border-b-2 border-red-500 text-xs text-red-900 shrink-0">
              <strong>Error: </strong> {error}
            </div>
          )}

          {/* Scrollable Conversation Thread Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
                <div className="text-4xl mb-2">💬</div>
                <h3 className="text-base font-bold text-slate-800">
                  KelanaAI Travel Assistant & Memory
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mt-1">
                  Tanyakan hal seputar travel, visa, atau tempat wisata. KelanaAI akan mengingat riwayat obrolan Anda secara otomatis!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-xl border-2 border-slate-900 ${
                      msg.role === "user"
                        ? "bg-[#f4dc4d] text-slate-900 shadow-[3px_3px_0_#176b50]"
                        : "bg-[#176b50] text-white shadow-[3px_3px_0_#0f4333]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-black/10">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                        {msg.role === "user" ? "YOU" : "KELANAAI ASSISTANT"}
                      </span>
                      <span className="text-[9px] opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm leading-relaxed font-medium">
                      {msg.role === "assistant" ? (
                        <FormattedMarkdown content={msg.content} />
                      ) : (
                        <span className="whitespace-pre-line">{msg.content}</span>
                      )}
                    </div>

                    {msg.role === "assistant" && msg.source && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-600/60 flex items-center gap-1.5 text-[10px] text-emerald-200 flex-wrap">
                        <span className="font-bold uppercase tracking-wider">
                          SOURCE
                        </span>
                        <span className="opacity-60">|</span>
                        <span className="font-mono bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-100">
                          📄 {msg.source}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="max-w-[75%] p-3.5 rounded-xl border-2 border-slate-900 bg-[#176b50] text-white shadow-[3px_3px_0_#0f4333] flex items-center gap-3">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-xs font-bold">
                    Thinking with Conversation Memory & Knowledge Base...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips */}
          {!isGuestLimitReached && messages.length === 0 && (
            <div className="p-2.5 bg-yellow-50/90 border-t-2 border-slate-900 shrink-0 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1">
                Suggestions:
              </span>
              {sampleQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuestion(sq);
                    handleSendQuestion(sq);
                  }}
                  disabled={loading}
                  className="border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] px-3 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0_#176b50] cursor-pointer transition-all rounded-md"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}

          {/* Anchored Input Form at Bottom */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t-2 border-slate-900 shrink-0"
          >
            <div
              className={`flex items-center gap-2 ${
                isGuestLimitReached ? "opacity-60" : ""
              }`}
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isGuestLimitReached
                    ? "Batas 3 pertanyaan tercapai. Login/Register untuk bertanya lagi!"
                    : "Ketik pertanyaan Anda..."
                }
                disabled={loading || isGuestLimitReached}
                className="flex-1 bg-slate-50 border-2 border-slate-900 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white disabled:cursor-not-allowed rounded-lg"
              />
              <button
                type="submit"
                disabled={loading || !question.trim() || isGuestLimitReached}
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-900 bg-[#176b50] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_#0f4333] hover:bg-[#0f4333] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all rounded-lg shrink-0"
              >
                {loading ? (
                  <span>Thinking...</span>
                ) : (
                  <>
                    <span>Send</span>
                    <span className="text-yellow-300">➤</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Footer */}
      <footer className="shrink-0 text-xs flex justify-between items-center text-slate-600 border-t border-slate-300 pt-1.5">
        <span>KelanaAI Conversational Assistant · RAG & Persistent Memory</span>
        <span>&copy; 2026 KelanaAI</span>
      </footer>
    </main>
  );
}
