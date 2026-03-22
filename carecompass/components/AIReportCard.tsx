"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  title: string;
  content: string;
  variant?: "default" | "trend";
};

export default function AIReportCard({
  title,
  content,
  variant = "default",
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  // 🔍 AI Risk Detection (Smart Parsing)
  const riskLevel = useMemo(() => {
    if (!content) return "none";

    const text = content.toLowerCase();

    if (
      text.includes("abnormal") ||
      text.includes("rapid drop") ||
      text.includes("spike") ||
      text.includes("risk") ||
      text.includes("significant variance")
    ) {
      return "high";
    }

    if (
      text.includes("fluctuating") ||
      text.includes("zig-zag") ||
      text.includes("variance") ||
      text.includes("unstable")
    ) {
      return "moderate";
    }

    if (
      text.includes("stable") ||
      text.includes("consistent") ||
      text.includes("normal range")
    ) {
      return "low";
    }

    return "moderate";
  }, [content]);

  const getRiskBadge = () => {
    switch (riskLevel) {
      case "high":
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500 px-3 py-1 rounded-full text-xs font-semibold">
            ⚠️ High Variability Detected
          </span>
        );
      case "moderate":
        return (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500 px-3 py-1 rounded-full text-xs font-semibold">
            ⚠️ Fluctuating Trend
          </span>
        );
      case "low":
        return (
          <span className="bg-green-500/20 text-green-400 border border-green-500 px-3 py-1 rounded-full text-xs font-semibold">
            🟢 Stable Pattern
          </span>
        );
      default:
        return null;
    }
  };

  if (!content) return null;

  if (!content) return null;

  const liquidTheme =
    variant === "trend"
      ? "border-t-purple-400/50 border-l-purple-500/30 dark:border-t-purple-500/30 dark:border-l-purple-400/20 shadow-[0_8px_30px_rgba(168,85,247,0.15)] bg-white/[0.65] dark:bg-[#030712]/60"
      : "border-t-blue-400/50 border-l-blue-500/30 dark:border-t-blue-500/30 dark:border-l-blue-400/20 shadow-[0_8px_30px_rgba(59,130,246,0.15)] bg-white/[0.65] dark:bg-[#030712]/60";

  const gradientBg =
    variant === "trend"
      ? "bg-gradient-to-br from-purple-500/10 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/5"
      : "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/5";

  return (
    <div className={`mt-8 relative border border-white/80 dark:border-white/[0.05] ${liquidTheme} backdrop-blur-[40px] backdrop-saturate-[2] rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`absolute inset-0 ${gradientBg} rounded-3xl pointer-events-none`} />

      {/* Header (Collapsible) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 flex items-center justify-between cursor-pointer p-6 border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl drop-shadow-sm">
            {variant === "trend" ? "🧠" : "📊"}
          </div>
          <div>
            <h3 className={`text-xl font-black drop-shadow-sm ${variant === "trend" ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"}`}>
              {title}
            </h3>
            <div className="mt-2">{getRiskBadge()}</div>
          </div>
        </div>

        <div className={`text-xl font-black ${variant === "trend" ? "text-purple-400" : "text-blue-400"} transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          ▼
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`relative z-10 transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-8">
          <div
            className={`
            prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:font-medium prose-p:text-gray-700 dark:prose-p:text-gray-300
            ${variant === "trend" ? "prose-strong:text-purple-700 dark:prose-strong:text-purple-300 marker:text-purple-500" : "prose-strong:text-blue-700 dark:prose-strong:text-blue-300 marker:text-blue-500"}
            leading-relaxed
          `}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Safety Footer */}
          <div className="mt-8 p-5 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/[0.05] shadow-inner">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed flex items-start gap-2">
              <span className="text-base">🛡️</span> CareCompass AI provides predictive insights for educational
              purposes only. Always consult a certified healthcare professional for formal medical diagnosis and decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
