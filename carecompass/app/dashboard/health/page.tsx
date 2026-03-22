"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { addHealthLog, getHealthLogs } from "@/services/healthService";
import { getUserProfile } from "@/services/userService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import AIReportCard from "@/components/AIReportCard";
import * as htmlToImage from "html-to-image";
import { exportMedicalPDF } from "@/utils/pdfExporter";

const METRIC_OPTIONS = [
  { value: "weight", label: "Weight (kg)" },
  { value: "blood_sugar", label: "Blood Sugar (mg/dL)" },
  { value: "blood_pressure", label: "Blood Pressure" },
  { value: "heart_rate", label: "Heart Rate (BPM)" },
  { value: "custom", label: "Custom Metric" },
];

export default function HealthPage() {
  const { user } = useAuth();

  const [type, setType] = useState("weight");
  const [customMetric, setCustomMetric] = useState("");
  const [value, setValue] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [insight, setInsight] = useState("");
  const [trendAnalysis, setTrendAnalysis] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  const effectiveType = type === "custom" ? customMetric : type;

  const loadLogs = async () => {
    if (!user || !effectiveType) return;

    const data = await getHealthLogs(user.uid, effectiveType);
    setRawLogs(data);

    setLogs(
      data.map((log: any, index: number) => ({
        name: `Entry ${index + 1}`,
        value: Number(log.value),
      }))
    );
  };

  useEffect(() => {
    if (user && effectiveType) {
      loadLogs();
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user, effectiveType]);

  const handleAdd = async () => {
    if (!user || !value || !effectiveType) return;

    await addHealthLog(user.uid, effectiveType, value);
    setValue("");
    loadLogs();
  };

  const generateInsight = async () => {
    if (rawLogs.length === 0) return;

    setLoadingInsight(true);
    setInsight("");

    try {
      const res = await fetch("/api/ai/health-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: rawLogs, type: effectiveType }),
      });

      const data = await res.json();
      setInsight(data.insight || "No insight generated.");
    } catch (error) {
      console.error(error);
      setInsight("Failed to generate insight.");
    }

    setLoadingInsight(false);
  };

  const detectTrend = async () => {
    if (rawLogs.length < 2) {
      alert("Add at least 2 logs for trend detection.");
      return;
    }

    setLoadingTrend(true);
    setTrendAnalysis("");

    try {
      const res = await fetch("/api/ai/trend-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logs: rawLogs,
          type: effectiveType,
          profile,
        }),
      });

      const data = await res.json();
      setTrendAnalysis(data.analysis || "No trend analysis generated.");
    } catch (error) {
      console.error(error);
      setTrendAnalysis("Trend detection failed.");
    }

    setLoadingTrend(false);
  };

  const formatHealthLogsForReport = () => {
    if (!rawLogs || rawLogs.length === 0) return "No health logs available.";

    return rawLogs
      .map((log: any, index: number) => {
        const date = log.createdAt?.seconds
          ? new Date(log.createdAt.seconds * 1000).toLocaleDateString()
          : `Entry ${index + 1}`;

        return `Entry ${index + 1} (${date}): ${log.value}`;
      })
      .join("\n");
  };

  const downloadFullAIReport = async () => {
    if (!chartRef.current || rawLogs.length === 0) return;

    setExportingPDF(true);

    try {
      const chartImage = await htmlToImage.toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const formattedLogs = formatHealthLogsForReport();

      const combinedAIReport = `
AI Health Insight:
${insight || "No insight generated."}

AI Trend Detection:
${trendAnalysis || "No trend analysis generated."}
      `;

      await exportMedicalPDF(
        `AI Health Trend Report (${effectiveType.toUpperCase()})`,
        formattedLogs,
        combinedAIReport,
        chartImage
      );
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF.");
    }

    setExportingPDF(false);
  };

  const processedChartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    return logs.map((point, index) => {
      if (index === 0) return { ...point, status: "normal" };

      const prev = logs[index - 1].value;
      const current = point.value;
      const change = Math.abs(current - prev);
      const percentChange = (change / prev) * 100;

      let status = "normal";
      if (percentChange >= 8) status = "abnormal";
      else if (percentChange >= 4) status = "warning";

      return { ...point, status };
    });
  }, [logs]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-emerald-600/10 dark:from-indigo-500/10 dark:via-blue-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            📊 AI Health Tracking & Clinical Trends
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 text-sm max-w-2xl leading-relaxed">
            Track multiple health metrics with predictive CareCompass AI insights and trend analysis.
          </p>
        </div>
      </div>

      {/* ➕ Add Log Card (Liquid Glass Style) */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm mb-6">Record New Metric</h2>

        <div className="grid md:grid-cols-3 gap-5">
          <select
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-black text-gray-800 dark:text-gray-200 shadow-inner appearance-none cursor-pointer"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {METRIC_OPTIONS.map((metric) => (
              <option key={metric.value} value={metric.value} className="text-gray-900 font-bold bg-white dark:bg-gray-800">
                {metric.label}
              </option>
            ))}
          </select>

          {type === "custom" && (
            <input
              type="text"
              placeholder="Enter custom metric"
              className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
              value={customMetric}
              onChange={(e) => setCustomMetric(e.target.value)}
            />
          )}

          <input
            type="number"
            placeholder="Enter value"
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        <button
          onClick={handleAdd}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition text-white px-8 py-3.5 rounded-2xl font-black shadow-lg"
        >
          ➕ Add Health Log
        </button>
      </div>

      {/* 📈 PREMIUM CHART */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            📈 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">AI-Aware Trend Graph</span>
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-2xl dark:border-gray-800">
            <p className="text-gray-500 font-bold">No health tracking data available yet. Add logs above.</p>
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-[360px] bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/[0.05]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" opacity={0.3} stroke="#9ca3af" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontWeight: 'bold' }} />
                <YAxis tick={{ fill: "#6b7280", fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(12px)",
                    fontWeight: 'bold',
                    color: '#1f2937',
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={5}
                  animationDuration={1500}
                  dot={({ cx, cy, payload }: any) => {
                    const color =
                      payload.status === "abnormal"
                        ? "#ef4444"
                        : payload.status === "warning"
                        ? "#f59e0b"
                        : "#6366f1";

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={3}
                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
                      />
                    );
                  }}
                  activeDot={{ r: 10, stroke: "#fff", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 🔥 AI ACTIONS (GLASS PILLS) */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generateInsight}
          disabled={loadingInsight || rawLogs.length === 0}
          className="bg-emerald-500/90 dark:bg-emerald-500/20 text-white dark:text-emerald-300 border border-emerald-400 dark:border-emerald-500/30 hover:bg-emerald-500 dark:hover:bg-emerald-500/40 backdrop-blur-md px-6 py-3.5 rounded-2xl font-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_24px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all hover:-translate-y-1"
        >
          {loadingInsight ? "Analyzing Engine..." : "🧠 Generate AI Insight"}
        </button>

        <button
          onClick={detectTrend}
          disabled={loadingTrend || rawLogs.length < 2}
          className="bg-indigo-500/90 dark:bg-indigo-500/20 text-white dark:text-indigo-300 border border-indigo-400 dark:border-indigo-500/30 hover:bg-indigo-500 dark:hover:bg-indigo-500/40 backdrop-blur-md px-6 py-3.5 rounded-2xl font-black shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all hover:-translate-y-1"
        >
          {loadingTrend ? "Scanning Series..." : "📈 Detect AI Trend"}
        </button>

        <button
          onClick={downloadFullAIReport}
          disabled={exportingPDF || rawLogs.length === 0}
          className="bg-gray-800/90 dark:bg-white/10 text-white border border-gray-600 dark:border-white/20 hover:bg-gray-900 dark:hover:bg-white/20 backdrop-blur-md px-6 py-3.5 rounded-2xl font-black shadow-[0_4px_16px_rgba(0,0,0,0.2)] disabled:opacity-50 transition-all hover:-translate-y-1"
        >
          {exportingPDF
            ? "Building Blueprint..."
            : "📥 Download Full PDF Blueprint"}
        </button>
      </div>

      {/* UNTOUCHED EXISTING COMPONENTS */}
      <AIReportCard title="AI Health Insight" content={insight} />
      <AIReportCard
        title="AI Trend Detection"
        content={trendAnalysis}
        variant="trend"
      />
    </div>
  );
}