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

  // Load chat history
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

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

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

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Health Assistant</h1>

        <button
          onClick={handleClearChat}
          disabled={clearing || messages.length === 0}
          className="text-sm text-red-500 hover:text-red-600 transition disabled:opacity-50"
        >
          {clearing ? "Clearing..." : "Clear Chat"}
        </button>
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">
            Ask anything about your health, reports, or medicines.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 text-gray-700 p-3 rounded-xl w-fit text-sm">
            AI is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a health question..."
          className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
