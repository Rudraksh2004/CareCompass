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
      {/* Premium Header */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600/10 via-blue-600/10 to-emerald-600/10 p-8 shadow-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
          📊 AI Health Tracking & Clinical Trends
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          Track multiple health metrics with AI-powered insights and trend analysis.
        </p>
      </div>

      {/* Add Log Card (Upgraded UI Only) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6">Add Health Log</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {METRIC_OPTIONS.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>

          {type === "custom" && (
            <input
              type="text"
              placeholder="Enter custom metric (e.g., Oxygen Level)"
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
              value={customMetric}
              onChange={(e) => setCustomMetric(e.target.value)}
            />
          )}

          <input
            type="number"
            placeholder="Enter value"
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <button
          onClick={handleAdd}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90"
        >
          + Add Health Log
        </button>
      </div>

      {/* PREMIUM CHART (Upgraded Only - Logic SAME) */}
      <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6">
          📈 AI-Aware Trend Chart
        </h2>

        {logs.length === 0 ? (
          <p className="text-gray-500">No data available yet.</p>
        ) : (
          <div ref={chartRef} className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedChartData}>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={4}
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
                        r={7}
                        fill={color}
                        stroke="#1f2937"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 🔥 RESTORED AI BUTTONS (UNCHANGED LOGIC) */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generateInsight}
          disabled={loadingInsight || rawLogs.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold shadow disabled:opacity-50"
        >
          {loadingInsight ? "Analyzing..." : "Generate AI Insight"}
        </button>

        <button
          onClick={detectTrend}
          disabled={loadingTrend || rawLogs.length < 2}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold shadow disabled:opacity-50"
        >
          {loadingTrend ? "Detecting Trend..." : "Detect AI Trend"}
        </button>

        <button
          onClick={downloadFullAIReport}
          disabled={exportingPDF || rawLogs.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow disabled:opacity-50"
        >
          {exportingPDF
            ? "Generating Clinical Report..."
            : "Download Full AI Health Report (PDF)"}
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