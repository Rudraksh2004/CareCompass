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

  const gradient =
    variant === "trend"
      ? "from-purple-900/40 to-indigo-900/40 border-purple-500/30"
      : "from-blue-900/40 to-cyan-900/40 border-blue-500/30";

  return (
    <div className={`mt-6 rounded-2xl border bg-gradient-to-br ${gradient} backdrop-blur-md shadow-xl`}>
      {/* Header (Collapsible) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer p-5"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {variant === "trend" ? "🧠" : "📊"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {title}
            </h3>
            <div className="mt-1">{getRiskBadge()}</div>
          </div>
        </div>

        <div className="text-gray-300 text-lg">
          {isOpen ? "▲" : "▼"}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6">
          <div
            className="
            prose prose-invert max-w-none
            prose-headings:text-white
            prose-h3:text-blue-400
            prose-h4:text-purple-400
            prose-strong:text-blue-300
            prose-p:text-gray-200
            prose-li:text-gray-300
            leading-relaxed
          "
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Safety Footer */}
          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
            <p className="text-xs text-gray-400">
              🛡️ CareCompass AI provides non-diagnostic insights for educational
              purposes only. Always consult a healthcare professional for
              medical decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
