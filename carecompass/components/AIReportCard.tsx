"use client";

import ReactMarkdown from "react-markdown";

export default function AIReportCard({
  title,
  content,
  variant = "default",
}: {
  title: string;
  content: string;
  variant?: "default" | "trend";
}) {
  if (!content) return null;

  const variantStyles =
    variant === "trend"
      ? "border-purple-500 bg-gradient-to-br from-purple-900/30 to-indigo-900/30"
      : "border-blue-500 bg-gradient-to-br from-blue-900/30 to-cyan-900/30";

  return (
    <div
      className={`mt-6 rounded-2xl border ${variantStyles} p-6 shadow-lg backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">
          {variant === "trend" ? "🧠" : "📊"}
        </div>
        <h3 className="text-xl font-bold text-white">
          {title}
        </h3>
      </div>

      {/* AI Content */}
      <div className="prose prose-invert max-w-none
        prose-headings:text-white
        prose-strong:text-blue-300
        prose-li:text-gray-200
        prose-p:text-gray-200
        prose-h3:text-blue-400
        prose-h4:text-purple-400">
        
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
