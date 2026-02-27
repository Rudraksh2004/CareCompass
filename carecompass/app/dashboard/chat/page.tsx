"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createChatSession,
  getChatSessions,
  getMessages,
  saveMessage,
  deleteChatSession,
  updateChatTitle,
} from "@/services/chatService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!user) return;
    initializeChat();
  }, [user]);

  const initializeChat = async () => {
    if (!user) return;

    setInitializing(true);
    const data = await getChatSessions(user.uid);
    setSessions(data);

    if (data.length > 0) {
      const latest = data[0].id;
      setActiveSession(latest);
      await loadMessages(latest);
    } else {
      const newSessionId = await createChatSession(user.uid);
      setActiveSession(newSessionId);
      setMessages([]);
      const updated = await getChatSessions(user.uid);
      setSessions(updated);
    }

    setInitializing(false);
  };

  const fetchSessions = async () => {
    if (!user) return;
    const data = await getChatSessions(user.uid);
    setSessions(data);
  };

  const loadMessages = async (sessionId: string) => {
    if (!user) return;
    const msgs = await getMessages(user.uid, sessionId);
    setMessages(msgs as Message[]);
    setActiveSession(sessionId);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length, loading]);

  const handleNewChat = async () => {
    if (!user) return;

    const sessionId = await createChatSession(user.uid);
    setActiveSession(sessionId);
    setMessages([]);
    await fetchSessions();
  };

  const handleDeleteChat = async (sessionId: string) => {
    if (!user) return;

    await deleteChatSession(user.uid, sessionId);

    if (activeSession === sessionId) {
      setActiveSession(null);
      setMessages([]);
    }

    await fetchSessions();
  };

  const generateSmartTitle = async (
    firstMessage: string,
    sessionId: string
  ) => {
    if (!user) return;

    try {
      const res = await fetch("/api/ai/generate-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: firstMessage }),
      });

      const data = await res.json();
      const title = data.title || "Health Discussion";

      await updateChatTitle(user.uid, sessionId, title);
      await fetchSessions();
    } catch (err) {
      console.error("Title generation error:", err);
    }
  };

  const typeMessage = async (fullText: string) => {
    let currentText = "";

    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: currentText,
        };
        return updated;
      });

      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !activeSession || loading) return;

    const userMessage = input.trim();
    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      await saveMessage(user.uid, activeSession, "user", userMessage);

      if (isFirstMessage) {
        generateSmartTitle(userMessage, activeSession);
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          uid: user.uid,
          sessionId: activeSession,
        }),
      });

      const data = await res.json();
      const aiReply =
        data.reply || "I'm here to help with your health questions.";

      await typeMessage(aiReply);

      await saveMessage(user.uid, activeSession, "assistant", aiReply);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[88vh] max-w-7xl mx-auto rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl">
      {/* 🔷 SIDEBAR (UI POLISHED ONLY) */}
      {sidebarOpen && (
        <div className="w-72 border-r border-gray-200 dark:border-gray-800 p-5 flex flex-col bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-xl">
          <div className="mb-4">
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition"
            >
              + New Health Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadMessages(session.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSession === session.id
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-sm font-medium truncate">
                  {session.title || "New Chat"}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(session.id);
                  }}
                  className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🧠 CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* 🌟 PREMIUM HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:scale-[1.03] transition"
          >
            ☰
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CareCompass AI Health Assistant
            </h1>
            <p className="text-xs text-gray-500">
              Memory Enabled • Non-Diagnostic • Student Safe
            </p>
          </div>

          <div className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
            AI Active
          </div>
        </div>

        {/* 💬 MESSAGES (UI ENHANCED ONLY) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-gray-50/40 dark:to-black/20">
          {initializing ? (
            <div className="text-center mt-24 text-gray-500">
              <div className="text-5xl mb-4 animate-pulse">🧠</div>
              <p className="font-semibold">
                Initializing CareCompass AI...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center mt-24 text-gray-500">
              <div className="text-6xl mb-5">💬</div>
              <p className="font-semibold text-lg">
                Start your health conversation
              </p>
              <p className="text-sm mt-2">
                Ask about symptoms, reports, medicines, or health advice.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm shadow-lg transition ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
              <span className="text-lg">🧠</span>
              CareCompass AI is analyzing your health query...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ✍️ INPUT BAR (PREMIUM GLASS UX) */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about symptoms, reports, medicines, or health concerns..."
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !activeSession}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-7 py-3 rounded-2xl font-semibold shadow-lg disabled:opacity-50 hover:opacity-90 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}