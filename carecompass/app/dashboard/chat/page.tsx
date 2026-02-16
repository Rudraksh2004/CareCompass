"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createChatSession,
  getChatSessions,
  getMessages,
  saveMessage,
  deleteChatSession,
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

  // Load chat sessions
  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    const data = await getChatSessions(user.uid);
    setSessions(data);

    if (data.length > 0 && !activeSession) {
      loadMessages(data[0].id);
      setActiveSession(data[0].id);
    }
  };

  const loadMessages = async (sessionId: string) => {
    if (!user) return;

    const data = await getMessages(user.uid, sessionId);
    setMessages(data as Message[]);
    setActiveSession(sessionId);
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = async () => {
    if (!user) return;

    const sessionId = await createChatSession(user.uid);
    setMessages([]);
    setActiveSession(sessionId);
    loadSessions();
  };

  const handleDeleteChat = async (sessionId: string) => {
    if (!user) return;

    await deleteChatSession(user.uid, sessionId);

    if (activeSession === sessionId) {
      setMessages([]);
      setActiveSession(null);
    }

    loadSessions();
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

      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user || !activeSession) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      await saveMessage(user.uid, activeSession, "user", userMessage);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const aiReply = data.reply || "No response.";

      await typeMessage(aiReply);

      await saveMessage(user.uid, activeSession, "assistant", aiReply);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-[88vh] max-w-7xl mx-auto rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl">
      {/* 🧾 SIDEBAR */}
      {sidebarOpen && (
        <div className="w-72 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col bg-white/80 dark:bg-gray-900/80">
          <button
            onClick={handleNewChat}
            className="mb-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90 transition"
          >
            + New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                  activeSession === session.id
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => loadMessages(session.id)}
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

      {/* 💬 CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
            >
              ☰
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Health Assistant
            </h1>
          </div>

          <span className="text-xs text-gray-500">
            Non-diagnostic AI
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-gray-500">
              <div className="text-5xl mb-4">🧠</div>
              <p className="font-semibold">
                Start a new medical conversation
              </p>
              <p className="text-sm">
                Ask about reports, prescriptions, symptoms, or health trends.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm shadow ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-500 animate-pulse">
              CareCompass AI is analyzing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !activeSession}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
