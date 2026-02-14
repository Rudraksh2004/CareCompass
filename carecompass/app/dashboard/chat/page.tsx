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

  // Stable auto-scroll (fixed earlier)
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
    <div className="max-w-3xl mx-auto flex flex-col h-[85vh] text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          AI Health Assistant
        </h1>

        <button
          onClick={handleClearChat}
          disabled={clearing || messages.length === 0}
          className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 transition disabled:opacity-50"
        >
          {clearing ? "Clearing..." : "Clear Chat"}
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-colors">
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Ask anything about your health, reports, medicines, or lifestyle.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            }`}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-3 rounded-xl w-fit text-sm">
            AI is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a health question..."
          className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
