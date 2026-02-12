"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveHistory, getHistory } from "@/services/historyService";

export default function ChatPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load previous chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;

      const data = await getHistory(user.uid, "chats");

      // Convert stored history to message format
      const formattedMessages: {
        role: "user" | "assistant";
        content: string;
      }[] = [];

      data
        .reverse() // oldest first
        .forEach((item: any) => {
          formattedMessages.push({
            role: "user",
            content: item.userMessage,
          });

          formattedMessages.push({
            role: "assistant",
            content: item.aiResponse,
          });
        });

      setMessages(formattedMessages);
    };

    loadChatHistory();
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);

      // Save to Firestore
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
      <h1 className="text-2xl font-bold mb-6">
        AI Health Assistant
      </h1>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Start a conversation about your health.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto text-right"
                : "bg-gray-100"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 p-3 rounded-xl w-fit">
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask something about your health..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
