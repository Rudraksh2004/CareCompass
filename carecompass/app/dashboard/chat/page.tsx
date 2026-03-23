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
import {
  Plus,
  Search,
  Trash2,
  Send,
  PanelLeft,
  Sparkles,
  Copy,
  RefreshCcw,
  Bot,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  History
} from "lucide-react";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
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
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(timeout);
  }, [messages.length, loading]);

  const handleNewChat = async () => {
    if (!user) return;
    const sessionId = await createChatSession(user.uid);
    setActiveSession(sessionId);
    setMessages([]);
    setSuggestions([]);
    await fetchSessions();
  };

  const handleDeleteChat = async (sessionId: string) => {
    if (!user) return;
    await deleteChatSession(user.uid, sessionId);
    if (activeSession === sessionId) {
      setActiveSession(null);
      setMessages([]);
      setSuggestions([]);
    }
    await fetchSessions();
  };

  const generateSmartTitle = async (firstMessage: string, sessionId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/ai/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        updated[updated.length - 1] = { role: "assistant", content: currentText };
        return updated;
      });
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  };

  const sendMessage = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || !user || !activeSession || loading) return;

    const userMessage = messageToSend.trim();
    const isFirstMessage = messages.length === 0;
    setSuggestions([]);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      await saveMessage(user.uid, activeSession, "user", userMessage);
      if (isFirstMessage) generateSmartTitle(userMessage, activeSession);

      const chatRes = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, uid: user.uid, sessionId: activeSession }),
      });
      const chatData = await chatRes.json();
      const aiReply = chatData.reply || "I'm here to help with your health questions.";
      await typeMessage(aiReply);
      await saveMessage(user.uid, activeSession, "assistant", aiReply);

      try {
        const suggestionRes = await fetch("/api/ai/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: aiReply }),
        });
        const suggestionData = await suggestionRes.json();
        setSuggestions(suggestionData.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: "Clinical connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
      {/* 🔮 Ultra-Premium Chat Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-10 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-500/20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                AI Health Chat
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              Your high-fidelity clinical assistant. Analyzing reports, patterns, and prescriptions with neural precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-4 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Diagnostic AI Online</span>
              </div>
            </div>
            <div className="px-6 py-4 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Privacy</p>
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck size={14} />
                <span className="text-sm font-black uppercase tracking-tighter">HIPAA Compliant Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 IMPERATIVE CHAT INTERFACE */}
      <div className="flex h-[80vh] rounded-[3rem] overflow-hidden border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] shadow-2xl relative">
        {/* SIDEBAR */}
        {sidebarOpen && (
          <div className="w-80 border-r border-white/60 dark:border-white/[0.05] flex flex-col bg-white/30 dark:bg-black/20 backdrop-blur-3xl animate-in slide-in-from-left duration-500">
            <div className="p-6 border-b border-white/60 dark:border-white/[0.05]">
              <button
                onClick={handleNewChat}
                className="w-full group relative overflow-hidden bg-gray-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <Plus size={20} className="transition-transform group-hover:rotate-90 duration-500" />
                New Consultation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <div className="flex items-center gap-2 px-2 pb-2">
                <MessageSquare size={14} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Diagnostic Ledger</span>
              </div>

              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadMessages(session.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    activeSession === session.id
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                      : "bg-white/40 dark:bg-white/[0.02] border-white/80 dark:border-white/[0.03] text-gray-700 dark:text-gray-300 hover:bg-white hover:border-indigo-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 truncate">
                    <History size={16} className={activeSession === session.id ? "text-indigo-200" : "text-gray-400"} />
                    <span className="text-xs font-black truncate">
                      {session.title || "Consultation Routine"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}
                    className={`p-2 rounded-lg transition-all ${activeSession === session.id ? "text-white/80 hover:bg-white/20" : "text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10"}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col relative">
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/60 dark:border-white/[0.05] bg-white/40 dark:bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <PanelLeft size={20} />
              </button>

              <div className="flex flex-col">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  CareCompass Bio-Core
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Clinical Logic</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
               <div className="px-5 py-2 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Encrypted Analysis
               </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative">
             {messages.length === 0 && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40 grayscale pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-gray-400/20 flex items-center justify-center">
                     <Bot size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Neurological Core Idle</h3>
                    <p className="text-sm font-bold">Initiate high-fidelity consultation below</p>
                  </div>
               </div>
             )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-md ${msg.role === "user" ? "bg-indigo-600 text-white border-indigo-500" : "bg-white dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-white dark:border-indigo-600/20"}`}>
                      {msg.role === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
                   </div>

                   <div
                    className={`relative p-6 rounded-[2rem] text-base leading-relaxed break-words shadow-xl group transition-all duration-300 border ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-500 rounded-tr-none"
                        : "bg-white/80 dark:bg-black/40 border-white dark:border-white/5 text-gray-800 dark:text-gray-100 backdrop-blur-2xl rounded-tl-none"
                    }`}
                  >
                    <div className="prose dark:prose-invert max-w-none
                      prose-li:font-bold prose-p:font-bold prose-p:leading-relaxed text-[15px]
                      prose-h1:text-indigo-600 dark:prose-h1:text-indigo-400 prose-h1:font-black
                      prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {msg.role === "assistant" && msg.content && (
                      <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => copyMessage(msg.content, index)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          {copiedIndex === index ? <Sparkles size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          {copiedIndex === index ? "Verified" : "Sync Data"}
                        </button>

                        <button
                          onClick={() => sendMessage(messages.reverse().find(m => m.role === "user")?.content)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          <RefreshCcw size={14} />
                          Re-Synthesize
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center text-indigo-600">
                   <Bot size={20} className="animate-pulse" />
                </div>
                <div className="px-8 py-5 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] rounded-[2rem] rounded-tl-none backdrop-blur-md flex items-center gap-3">
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-150" />
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-300" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Bio-Core Thinking</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>

          {/* SUGGESTIONS PILLS */}
          {suggestions.length > 0 && (
            <div className="px-10 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">
                <Sparkles size={12} className="text-amber-500" /> Neural Context Shortcuts
              </div>

              <div className="flex flex-wrap gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="group relative px-6 py-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/80 dark:border-white/[0.05] text-xs font-black text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {s}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FLOATING INPUT BAR */}
          <div className="p-8 pb-10">
             <div className="relative group max-w-5xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-700" />

                <div className="relative flex items-end gap-3 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-3xl px-6 py-4 rounded-[2rem] border border-white/80 dark:border-white/[0.05] shadow-2xl transition-all group-focus-within:border-indigo-500/50">
                   <div className="flex-1 min-h-[50px] flex items-center">
                     <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Neural medical context here (reports, symptoms, patterns)..."
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 font-bold placeholder:text-gray-400/60 placeholder:font-black text-base max-h-48 resize-none py-2 custom-scrollbar"
                        rows={1}
                        onInput={(e) => {
                           const target = e.target as HTMLTextAreaElement;
                           target.style.height = 'auto';
                           target.style.height = target.scrollHeight + 'px';
                        }}
                     />
                   </div>

                   <button
                    onClick={() => sendMessage()}
                    disabled={loading || !activeSession || !input.trim()}
                    className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-[1.1] active:scale-95 disabled:opacity-40 disabled:grayscale disabled:scale-100 shadow-xl shadow-indigo-600/20 group/btn"
                  >
                    <Send size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
             </div>

             <div className="mt-4 flex items-center justify-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2"><ShieldCheck size={12} /> Privacy Lock</div>
                <div className="flex items-center gap-2"><Sparkles size={12} /> AI Core Pro</div>
                <div className="flex items-center gap-2"><AlertCircle size={12} /> Non-Emergency Only</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
