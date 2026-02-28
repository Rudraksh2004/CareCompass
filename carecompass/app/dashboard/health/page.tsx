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

  // 🔽 DROPDOWN METRIC TYPE
  const [type, setType] = useState("weight");

  // Standard value
  const [value, setValue] = useState("");

  // 🔥 CUSTOM METRIC (NAME FIRST → THEN VALUE)
  const [customMetricName, setCustomMetricName] = useState("");

  // 🩺 BLOOD PRESSURE (MEDICAL FORMAT)
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  const [logs, setLogs] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [insight, setInsight] = useState("");
  const [trendAnalysis, setTrendAnalysis] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  // 🧠 Chart value handler (BP safe)
  const getChartValue = (log: any) => {
    if (log.type === "blood_pressure" && typeof log.value === "string") {
      const [sys] = log.value.split("/");
      return Number(sys) || 0;
    }
    return Number(log.value);
  };

  const loadLogs = async () => {
    if (!user) return;

    const data = await getHealthLogs(user.uid, type);
    setRawLogs(data);

    setLogs(
      data.map((log: any, index: number) => ({
        name: `#${index + 1}`,
        value: getChartValue(log),
      }))
    );
  };

  useEffect(() => {
    if (user) {
      loadLogs();
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user, type]);

  // ➕ ADD LOG (NON-BREAKING)
  const handleAdd = async () => {
    if (!user) return;

    let finalType = type;
    let finalValue = value;

    // 🩺 Blood Pressure (120/80)
    if (type === "blood_pressure") {
      if (!systolic || !diastolic) return;
      finalValue = `${systolic}/${diastolic}`;
    }

    // 🧪 Custom Metric (NAME → VALUE)
    if (type === "custom") {
      if (!customMetricName.trim() || !value) return;
      finalType = customMetricName
        .toLowerCase()
        .replace(/\s+/g, "_");
    }

    if (!finalValue) return;

    await addHealthLog(user.uid, finalType, finalValue);

    setValue("");
    setSystolic("");
    setDiastolic("");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: rawLogs, type, profile }),
      });

      const data = await res.json();
      setTrendAnalysis(data.analysis || "No trend analysis generated.");
    } catch (error) {
      console.error(error);
      setTrendAnalysis("Trend detection failed.");
    }

    setLoadingTrend(false);
  };

  // 📊 Premium AI-aware chart data
  const processedChartData = useMemo(() => {
    if (!logs.length) return [];

    return logs.map((point, index) => {
      if (index === 0) return { ...point, status: "normal" };

      const prev = logs[index - 1].value;
      const current = point.value;
      const percentChange = (Math.abs(current - prev) / prev) * 100;

      let status = "normal";
      if (percentChange >= 8) status = "abnormal";
      else if (percentChange >= 4) status = "warning";

      return { ...point, status };
    });
  }, [logs]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
          🧠 AI Health Tracking & Trend Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Track weight, BP, sugar, or any custom health metric with AI analysis.
        </p>
      </div>

      {/* 🧾 Add Log Card (UPDATED UX) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Add Health Log</h2>

        {/* 🔽 DROPDOWN SELECTOR */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
        >
          <option value="weight">Weight (kg)</option>
          <option value="blood_sugar">Blood Sugar (mg/dL)</option>
          <option value="blood_pressure">Blood Pressure (mmHg)</option>
          <option value="heart_rate">Heart Rate (BPM)</option>
          <option value="temperature">Body Temperature (°C)</option>
          <option value="custom">Custom Metric</option>
        </select>

        {/* 🧪 CUSTOM METRIC FLOW (NAME FIRST) */}
        {type === "custom" && (
          <>
            <input
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
              placeholder="Enter metric name (e.g., Cholesterol, BMI)"
              value={customMetricName}
              onChange={(e) =>
                setCustomMetricName(e.target.value)
              }
            />
            <input
              type="number"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
              placeholder="Enter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </>
        )}

        {/* 🩺 BLOOD PRESSURE MEDICAL INPUT */}
        {type === "blood_pressure" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Systolic (e.g., 120)"
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
            />
            <input
              type="number"
              placeholder="Diastolic (e.g., 80)"
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
            />
          </div>
        )}

        {/* 📊 STANDARD INPUT */}
        {type !== "custom" && type !== "blood_pressure" && (
          <input
            type="number"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}

        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
        >
          + Add Health Log
        </button>
      </div>

      {/* 📊 Chart (UNCHANGED LOGIC, PREMIUM LOOK) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          AI Clinical Trend Chart
        </h2>

        {logs.length === 0 ? (
          <p className="text-gray-500">No data available yet.</p>
        ) : (
          <div ref={chartRef} className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AI Buttons */}
      <div className="flex gap-4">
        <button
          onClick={generateInsight}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          Generate AI Insight
        </button>

        <button
          onClick={detectTrend}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Detect AI Trend
        </button>
      </div>

      <AIReportCard title="AI Health Insight" content={insight} />
      <AIReportCard
        title="AI Trend Detection"
        content={trendAnalysis}
        variant="trend"
      />
    </div>
  );
}