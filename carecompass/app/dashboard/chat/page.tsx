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
import { FaCopy, FaRedo } from "react-icons/fa";

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

  const [expandedMessages, setExpandedMessages] = useState<
    Record<number, boolean>
  >({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
    sessionId: string,
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
          content: "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const regenerateAnswer = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    setInput(lastUser.content);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800/70 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
          🤖 CareCompass AI Health Chat
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Memory-enabled clinical assistant for reports, symptoms,
          prescriptions, and general health queries.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex h-[75vh] rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl shadow-2xl">
        {/* SIDEBAR */}
        {sidebarOpen && (
          <div className="w-72 border-r border-gray-200/70 dark:border-gray-800/70 p-4 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
            <button
              onClick={handleNewChat}
              className="mb-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
            >
              + New Health Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadMessages(session.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    activeSession === session.id
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900 shadow-sm"
                      : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
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

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              ☰
            </button>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              AI Health Assistant
            </h2>

            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold shadow-sm">
              Memory Enabled • Non-Diagnostic
            </span>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => {
              const isLong = msg.content.length > 700;
              const expanded = expandedMessages[index];

              const displayText =
                isLong && !expanded
                  ? msg.content.slice(0, 700) + "..."
                  : msg.content;

              return (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`group max-w-[75%] px-5 py-4 rounded-2xl text-sm whitespace-pre-wrap break-words transition ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 backdrop-blur-xl shadow-sm"
                    }`}
                  >
                    {/* AI badge */}
                    {msg.role === "assistant" && (
                      <div className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        CareCompass AI
                      </div>
                    )}

                    <div
                      className="
                    prose prose-sm sm:prose-base dark:prose-invert max-w-none
                    prose-headings:font-semibold
                    prose-headings:text-blue-600
                    dark:prose-headings:text-blue-400
                    prose-strong:text-purple-600
                    dark:prose-strong:text-purple-400
                    prose-li:marker:text-blue-500
                    prose-p:text-gray-700
                    dark:prose-p:text-gray-300
                    prose-pre:bg-gray-900
                    prose-pre:text-white
                    prose-pre:rounded-xl
                    prose-pre:p-4
                    prose-code:text-pink-500
                    prose-code:font-semibold
                    "
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayText}
                      </ReactMarkdown>
                    </div>

                    {isLong && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-xs mt-2 text-blue-500 hover:underline"
                      >
                        {expanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    {msg.role === "assistant" && (
                      <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition text-xs">
                        <button
                          onClick={() => copyMessage(msg.content, index)}
                          className="flex items-center gap-1 hover:text-blue-500 transition"
                        >
                          <FaCopy />
                          {copiedIndex === index ? "Copied" : "Copy"}
                        </button>

                        <button
                          onClick={regenerateAnswer}
                          className="flex items-center gap-1 hover:text-purple-500 transition"
                        >
                          <FaRedo />
                          Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
                <span className="text-sm">CareCompass AI is thinking...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-gray-200/70 dark:border-gray-800/70 flex gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about reports, symptoms, prescriptions..."
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !activeSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
