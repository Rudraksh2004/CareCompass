"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  saveHistory,
  getHistory,
  clearHistory,
} from "@/services/historyService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;

      const data = await getHistory(user.uid, "chats");

      const formatted: {
        role: "user" | "assistant";
        content: string;
      }[] = [];

      data.reverse().forEach((item: any) => {
        formatted.push({
          role: "user",
          content: item.userMessage,
        });
        formatted.push({
          role: "assistant",
          content: item.aiResponse,
        });
      });

      setMessages(formatted);
    };

    loadChatHistory();
  }, [user]);

  // Stable auto-scroll (UNCHANGED logic)
  useEffect(() => {
    if (!bottomRef.current) return;

    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length]);

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

      await new Promise((resolve) => setTimeout(resolve, 12));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const aiReply = data.reply || "No response.";

      await typeMessage(aiReply);

      if (user) {
        await saveHistory(user.uid, "chats", {
          userMessage,
          aiResponse: aiReply,
        });
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleClearChat = async () => {
    if (!user) return;

    setClearing(true);
    await clearHistory(user.uid, "chats");
    setMessages([]);
    setClearing(false);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[88vh] text-gray-900 dark:text-gray-100">
      {/* Premium Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Health Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Non-diagnostic medical AI for reports, symptoms & health insights
          </p>
        </div>

        <button
          onClick={handleClearChat}
          disabled={clearing || messages.length === 0}
          className="px-4 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-800 transition text-sm font-medium disabled:opacity-50"
        >
          {clearing ? "Clearing..." : "Clear Chat"}
        </button>
      </div>

      {/* Chat Container - Premium Glass */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">🧠</div>
              <h2 className="text-lg font-semibold mb-2">
                Welcome to CareCompass AI
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Ask about medical reports, prescriptions, symptoms,
                lifestyle, or health trends. Your AI health companion
                is ready to help.
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
                className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm transition ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-md text-sm animate-pulse">
                CareCompass AI is analyzing your query...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area - Sticky Premium */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about reports, symptoms, medicines, or health trends..."
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition text-white px-6 py-3 rounded-xl font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          {/* Medical Disclaimer */}
          <p className="text-xs text-gray-400 text-center mt-3">
            CareCompass AI provides informational, non-diagnostic health assistance only. 
            Always consult a medical professional for clinical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
