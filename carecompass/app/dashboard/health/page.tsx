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

export default function HealthPage() {
  const { user } = useAuth();

  const [type, setType] = useState("weight");
  const [value, setValue] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [insight, setInsight] = useState("");
  const [trendAnalysis, setTrendAnalysis] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // 🔥 Chart ref for PDF export (IMPORTANT)
  const chartRef = useRef<HTMLDivElement>(null);

  const loadLogs = async () => {
    if (!user) return;

    const data = await getHealthLogs(user.uid, type);
    setRawLogs(data);

    setLogs(
      data.map((log: any, index: number) => ({
        name: `#${index + 1}`,
        value: Number(log.value),
      })),
    );
  };

  useEffect(() => {
    if (user) {
      loadLogs();
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user, type]);

  const handleAdd = async () => {
    if (!user || !value) return;

    await addHealthLog(user.uid, type, value);
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
        body: JSON.stringify({ logs: rawLogs, type }),
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
          type,
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

  // 🔥 FULL AI HEALTH REPORT PDF (Chart + Insight + Trend)
  const formatHealthLogsForReport = () => {
    if (!rawLogs || rawLogs.length === 0) return "No health logs available.";

    const unit = type === "weight" ? "kg" : "mg/dL";

    return rawLogs
      .map((log: any, index: number) => {
        const date = log.createdAt?.seconds
          ? new Date(log.createdAt.seconds * 1000).toLocaleDateString()
          : `Entry ${index + 1}`;

        return `Entry ${index + 1} (${date}): ${log.value} ${unit}`;
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
        `AI Health Trend Report (${type.toUpperCase()})`,
        formattedLogs, // ✅ FIXED (no more JSON)
        combinedAIReport,
        chartImage,
      );
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF.");
    }

    setExportingPDF(false);
  };

  // 🧠 Smart Abnormal Detection (AI-style logic)
  const processedChartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    return logs.map((point, index) => {
      if (index === 0) {
        return { ...point, status: "normal" };
      }

      const prev = logs[index - 1].value;
      const current = point.value;

      const change = Math.abs(current - prev);
      const percentChange = (change / prev) * 100;

      let status = "normal";

      if (percentChange >= 8) {
        status = "abnormal"; // 🔴
      } else if (percentChange >= 4) {
        status = "warning"; // 🟡
      }

      return {
        ...point,
        status,
      };
    });
  }, [logs]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Health Tracking & Trend Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your metrics and generate AI-powered clinical health reports.
        </p>
      </div>

      {/* Add Log Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add Health Log</h2>

        <div className="flex flex-wrap gap-4">
          <select
            className="border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-lg"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="weight">Weight (kg)</option>
            <option value="blood_sugar">Blood Sugar</option>
          </select>

          <input
            type="number"
            className="border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-lg"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Add Log
          </button>
        </div>
      </div>

      {/* Chart with Ref (CRITICAL FOR PDF) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">AI-Aware Trend Chart</h2>

        {logs.length === 0 ? (
          <p className="text-gray-500">No data available yet.</p>
        ) : (
          <>
            {/* 🔥 REF ATTACHED HERE */}
            <div ref={chartRef} className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={({ cx, cy, payload }: any) => {
                      if (payload.status === "abnormal") {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={7}
                            fill="#ef4444"
                            stroke="#7f1d1d"
                            strokeWidth={2}
                          />
                        );
                      }

                      if (payload.status === "warning") {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#f59e0b"
                            stroke="#78350f"
                            strokeWidth={2}
                          />
                        );
                      }

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="#3b82f6"
                          stroke="#1e3a8a"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-500 dark:text-gray-400">Normal</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-500 dark:text-gray-400">
                  Moderate Fluctuation
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-500 dark:text-gray-400">
                  Abnormal Change (AI Detected)
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generateInsight}
          disabled={loadingInsight || rawLogs.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loadingInsight ? "Analyzing..." : "Generate AI Insight"}
        </button>

        <button
          onClick={detectTrend}
          disabled={loadingTrend || rawLogs.length < 2}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loadingTrend ? "Detecting Trend..." : "Detect AI Trend"}
        </button>

        {/* 🔥 NEW: FULL AI REPORT PDF */}
        <button
          onClick={downloadFullAIReport}
          disabled={exportingPDF || rawLogs.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {exportingPDF
            ? "Generating Clinical Report..."
            : "Download Full AI Health Report (PDF)"}
        </button>
      </div>

      {/* AI Insight */}
      <AIReportCard title="AI Health Insight" content={insight} />

      {/* Trend Analysis */}
      <AIReportCard
        title="AI Trend Detection"
        content={trendAnalysis}
        variant="trend"
      />
    </div>
  );
}
