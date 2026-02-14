"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addHealthLog, getHealthLogs } from "@/services/healthService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function HealthPage() {
  const { user } = useAuth();

  const [type, setType] = useState("weight");
  const [value, setValue] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Load logs from Firestore (NO LOGIC CHANGE)
  const loadLogs = async () => {
    if (!user) return;

    const data = await getHealthLogs(user.uid, type);

    setRawLogs(data);

    setLogs(
      data.map((log: any, index: number) => ({
        name: `#${index + 1}`,
        value: Number(log.value),
      }))
    );
  };

  useEffect(() => {
    loadLogs();
  }, [user, type]);

  // Add new log (NO LOGIC CHANGE)
  const handleAdd = async () => {
    if (!user || !value) return;

    await addHealthLog(user.uid, type, value);
    setValue("");
    loadLogs();
  };

  // Generate AI Insight (NO LOGIC CHANGE)
  const generateInsight = async () => {
    if (rawLogs.length === 0) return;

    setLoadingInsight(true);
    setInsight("");

    const res = await fetch("/api/ai/health-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logs: rawLogs,
        type,
      }),
    });

    const data = await res.json();
    setInsight(data.insight || "No insight generated.");
    setLoadingInsight(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Health Tracking
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your health metrics and get AI-powered insights.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-lg font-semibold mb-4">
          Add Health Log
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-gray-100"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="weight">Weight (kg)</option>
            <option value="blood_sugar">Blood Sugar</option>
          </select>

          <input
            type="number"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-gray-100"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg font-medium shadow-sm"
          >
            Add Log
          </button>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Trend Chart
        </h2>

        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No data available yet. Start by adding your first health log.
          </p>
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AI Insight Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            AI Health Insight
          </h2>

          <button
            onClick={generateInsight}
            disabled={loadingInsight || rawLogs.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loadingInsight ? "Analyzing..." : "Generate Insight"}
          </button>
        </div>

        {insight ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
            {insight}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Generate AI insights based on your health trends.
          </p>
        )}
      </div>
    </div>
  );
}
