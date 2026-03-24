"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
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
  ChevronRight,
  History,
  Stethoscope,
  Paperclip,
  Microscope,
  Pill,
  Clock
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const latest = data[0].id as string;
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
      await updateChatTitle(user.uid as string, sessionId as string, title as string);
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
    if (!messageToSend.trim() || !user || loading) return;

    const uid = user.uid as string;

    let sessionId = activeSession;
    if (!sessionId) {
      sessionId = await createChatSession(user.uid);
      setActiveSession(sessionId);
      await fetchSessions();
    }

    const userMessage = messageToSend.trim();
    const isFirstMessage = messages.length === 0;
    setSuggestions([]);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      await saveMessage(uid, sessionId, "user", userMessage);
      if (isFirstMessage) generateSmartTitle(userMessage, sessionId);

      const chatRes = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, uid: uid, sessionId: sessionId }),
      });
      const chatData = await chatRes.json();
      const aiReply = (chatData.reply as string) || "I'm here to help with your health questions.";
      await typeMessage(aiReply);
      await saveMessage(uid, sessionId, "assistant", aiReply);

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

  useEffect(() => {
    const context = searchParams.get("context");
    const specialist = searchParams.get("specialist");
    if (context === "briefing" && specialist && user && !initializing && messages.length === 0) {
      sendMessage(`I was just recommended to consult a ${specialist} based on my disease prediction. Can you explain why this specialist is appropriate and what kind of questions I should prepare for our consultation?`);
    }
  }, [user, initializing, searchParams, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000 pb-12">
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
            <div className="px-8 py-5 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Diagnostic AI Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 IMPERATIVE CHAT INTERFACE */}
      <div className="flex h-[85vh] rounded-[3.5rem] overflow-hidden border border-white/80 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[80px] shadow-2xl relative">
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
                    <span className="text-xs font-black truncate text-inherit">
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
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  CareCompass Bio-Core
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </h2>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Active Clinical Logic Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
             
             {messages.length === 0 && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40 grayscale pointer-events-none z-10 relative">
                  <div className="w-24 h-24 rounded-full border border-indigo-400/20 flex items-center justify-center bg-indigo-500/5">
                     <Bot size={48} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Neurological Core Idle</h3>
                    <p className="text-sm font-bold text-gray-500">Initiate high-fidelity consultation below</p>
                  </div>
               </div>
             )}

            {messages.map((msg, index) => {
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const userIconColor = "bg-gradient-to-br from-indigo-500 to-purple-600";
              
              return (
              <div
                key={index}
                className={`flex w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10 relative ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`flex gap-5 max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative group/avatar overflow-hidden ${
                     msg.role === "user" ? userIconColor : "bg-white dark:bg-[#0f172a] border border-indigo-500/20"
                   }`}>
                      {msg.role === "user" ? (
                        <UserIcon size={24} className="text-white relative z-10" />
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <Bot size={24} className="text-indigo-600 dark:text-indigo-400 relative z-10 animate-pulse" />
                          <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-ping scale-150" />
                        </div>
                      )}
                   </div>

                   <div
                    className={`relative p-7 rounded-[2.5rem] text-base leading-relaxed break-words shadow-2xl group transition-all duration-500 border overflow-hidden ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border-white/10 rounded-tr-none hover:shadow-indigo-500/20"
                        : "bg-white/95 dark:bg-[#0f172a]/80 border-white/60 dark:border-white/[0.05] text-gray-800 dark:text-gray-100 backdrop-blur-3xl rounded-tl-none shadow-indigo-500/5 hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="prose dark:prose-invert max-w-none prose-li:font-bold prose-p:font-bold prose-p:leading-relaxed text-[16px] relative z-10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    <div className={`mt-4 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all duration-500 relative z-10`}>
                      <div className="flex items-center gap-3">
                         {msg.role === "assistant" && msg.content && (
                           <>
                            <button
                              onClick={() => copyMessage(msg.content, index)}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors"
                            >
                              {copiedIndex === index ? <Sparkles size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              {copiedIndex === index ? "Synced" : "Sync"}
                            </button>
                            <button
                              onClick={() => {
                                const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
                                if (lastUserMsg) sendMessage(lastUserMsg.content);
                              }}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-purple-600 transition-colors"
                            >
                              <RefreshCcw size={12} />
                              Re-Syn
                            </button>
                           </>
                         )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-tighter">
                         <Clock size={10} /> {timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );})}

            {loading && (
              <div className="flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-500 z-10 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center text-indigo-600">
                   <Bot size={20} className="animate-pulse" />
                </div>
                <div className="px-8 py-5 bg-white/90 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] rounded-[2rem] rounded-tl-none backdrop-blur-md flex items-center gap-3">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" />
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce delay-150" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce delay-300" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Bio-Core Thinking</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>

          {/* SUGGESTIONS PILLS */}
          {suggestions.length > 0 && (
            <div className="px-10 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 z-20 relative">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">
                <Sparkles size={12} className="text-amber-500" /> Neural Context Shortcuts
              </div>

              <div className="flex flex-wrap gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="group relative px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/[0.05] text-xs font-black text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-md"
                  >
                    <span className="truncate max-w-[200px]">{s}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FLOATING INPUT BAR */}
          <div className="p-10 pb-12 z-40 relative">
             <div className="relative group max-w-6xl mx-auto">
                {/* 🛡️ Premium Neural Forcefield */}
                <div className={`absolute -inset-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-[3.5rem] blur-3xl transition-all duration-1000 ${input.trim() ? "opacity-30 scale-105" : "opacity-0 scale-100"}`} />
                
                <div className="relative flex items-center gap-4 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-[60px] px-6 py-4 rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] shadow-[0_40px_80px_rgba(0,0,0,0.2)] transition-all group-focus-within:border-indigo-500/50">
                   
                   {/* ➕ Attachment & Utility */}
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-14 h-14 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-indigo-500 hover:scale-110 transition-all flex items-center justify-center flex-shrink-0"
                   >
                     <Plus size={24} />
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" />

                   <div className="flex-1 min-h-[50px] flex items-center">
                     <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a clinical inquiry..."
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 font-bold placeholder:text-gray-400/50 text-xl resize-none py-3 custom-scrollbar overflow-hidden"
                        rows={1}
                        onInput={(e) => {
                           const target = e.target as HTMLTextAreaElement;
                           target.style.height = 'auto';
                           target.style.height = (target.scrollHeight > 200 ? 200 : target.scrollHeight) + 'px';
                        }}
                     />
                   </div>

                   <div className="flex items-center gap-4 pr-2">
                     <button className="hidden sm:flex w-12 h-12 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition-all items-center justify-center">
                        <History size={20} />
                     </button>
                     
                     <div className="relative">
                        <button
                          onClick={() => sendMessage()}
                          disabled={loading || !input.trim()}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                            input.trim() 
                             ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-x-0" 
                             : "bg-gray-100 dark:bg-white/5 text-gray-400 scale-90 translate-x-2 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <Send size={24} className={input.trim() ? "translate-x-0.5" : ""} />
                        </button>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
