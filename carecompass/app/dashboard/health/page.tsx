"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { addHealthLog, getHealthLogs } from "@/services/healthService";
import { getUserProfile } from "@/services/userService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import AIReportCard from "@/components/AIReportCard";
import * as htmlToImage from "html-to-image";
import { exportMedicalPDF } from "@/utils/pdfExporter";
import { 
  Activity, 
  TrendingUp, 
  BrainCircuit, 
  Download, 
  Plus, 
  Search, 
  ChevronRight, 
  Heart, 
  Droplet, 
  Scale, 
  Zap,
  ShieldCheck,
  Stethoscope,
  BarChart4,
  Info,
  History
} from "lucide-react";

const METRIC_OPTIONS = [
  { value: "weight", label: "Weight", unit: "kg", icon: Scale, color: "blue" },
  { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", icon: Droplet, color: "red" },
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", icon: Activity, color: "emerald" },
  { value: "heart_rate", label: "Heart Rate", unit: "BPM", icon: Heart, color: "rose" },
  { value: "custom", label: "Custom Metric", unit: "", icon: Plus, color: "purple" },
];

export default function HealthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-500 font-black text-xl">SYNCING BIOMETRIC CORES...</div>}>
      <HealthContent />
    </Suspense>
  );
}

function HealthContent() {
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
  const currentMetric = METRIC_OPTIONS.find(m => m.value === type) || METRIC_OPTIONS[4];

  const loadLogs = async () => {
    if (!user || !effectiveType) return;
    const data = await getHealthLogs(user.uid, effectiveType);
    setRawLogs(data);
    setLogs(data.map((log: any, index: number) => ({
      name: `Entry ${index + 1}`,
      value: Number(log.value),
      date: log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleDateString() : `Entry ${index + 1}`
    })));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: rawLogs, type: effectiveType }),
      });
      const data = await res.json();
      setInsight(data.insight || "No insight generated.");
    } catch (error) {
      setInsight("Failed to generate insight.");
    }
    setLoadingInsight(false);
  };

  const detectTrend = async () => {
    if (rawLogs.length < 2) return;
    setLoadingTrend(true);
    setTrendAnalysis("");
    try {
      const res = await fetch("/api/ai/trend-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: rawLogs, type: effectiveType, profile }),
      });
      const data = await res.json();
      setTrendAnalysis(data.analysis || "No trend analysis generated.");
    } catch (error) {
      setTrendAnalysis("Trend detection failed.");
    }
    setLoadingTrend(false);
  };

  const downloadFullAIReport = async () => {
    if (!chartRef.current || rawLogs.length === 0) return;
    setExportingPDF(true);
    try {
      const isDark = document.documentElement.classList.contains("dark");
      const chartImage = await htmlToImage.toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: isDark ? "#030712" : "#ffffff",
        style: { borderRadius: "0px" },
      });
      const formattedLogs = rawLogs.map((log: any, index: number) => {
        const date = log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleDateString() : `Entry ${index + 1}`;
        return `Entry ${index + 1} (${date}): ${log.value}`;
      }).join("\n");
      const combinedAIReport = `AI Health Insight:\n${insight || "No insight generated."}\n\nAI Trend Detection:\n${trendAnalysis || "No trend analysis generated."}`;
      await exportMedicalPDF(`AI Health Trend Report (${effectiveType.toUpperCase()})`, formattedLogs, combinedAIReport, chartImage);
    } catch (error) {
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Clinical Power Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/20 to-emerald-500/10 blur-[130px] -mr-64 -mt-64 transition-all group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-emerald-500 text-white shadow-xl shadow-indigo-500/20">
                <Activity size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-400 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Biometric Lab
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              Clinical telemetry and behavioral trend synchronization. Analyze physiological variability through predictive AI modeling.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md flex flex-col items-center group/pill transition-all hover:bg-indigo-500/20 cursor-default">
                <Zap className="text-indigo-500 mb-2 group-hover/pill:scale-125 transition-transform" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Telemetry Sync</span>
                <span className="text-xl font-black mt-1">REAL-TIME</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* 📋 Telemetry Injection (Add Log) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative group overflow-hidden rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-8 shadow-xl transition-all">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-500" size={24} />
                <h2 className="text-2xl font-black tracking-tighter">Metric Ingress</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Modality Select</label>
                  <div className="grid grid-cols-2 gap-2">
                     {METRIC_OPTIONS.slice(0, 4).map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setType(m.value)}
                          className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${type === m.value ? "bg-indigo-600 text-white border-transparent shadow-lg" : "bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-gray-400 hover:bg-white dark:hover:bg-white/10"}`}
                        >
                           <m.icon size={20} />
                           <span className="text-[10px] font-black uppercase">{m.label}</span>
                        </button>
                     ))}
                  </div>
                  <button
                    onClick={() => setType("custom")}
                    className={`w-full mt-2 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${type === "custom" ? "bg-purple-600 text-white border-transparent outline-none" : "bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-gray-400 hover:bg-white dark:hover:bg-white/10"}`}
                  >
                    + Custom Modality
                  </button>
                </div>

                {type === "custom" && (
                  <div className="space-y-2 animate-in slide-in-from-top-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Custom Label</label>
                    <input
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 px-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-purple-500/10 transition-all text-sm"
                      placeholder="e.g., Blood Oxygen..."
                      value={customMetric}
                      onChange={(e) => setCustomMetric(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Value ({currentMetric.unit})</label>
                  <div className="relative">
                    <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 pl-12 pr-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                      placeholder="0.00"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full bg-gray-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  COMMIT LOG <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 backdrop-blur-md">
             <div className="flex items-center gap-3 text-indigo-500 mb-4">
                <Info size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Protocol Tip</span>
             </div>
             <p className="text-xs font-bold text-gray-500 leading-relaxed italic">"Consistent daily logging at similar times reduces noise in AI trend detection."</p>
          </div>
        </div>

        {/* 📈 Visualization Central */}
        <div className="lg:col-span-3 space-y-12">
          {/* Chart Header */}
          <div className="flex items-center justify-between px-6">
             <div className="flex items-center gap-4">
                <BarChart4 className="text-indigo-600" size={24} />
                <h2 className="text-3xl font-black tracking-tighter">Variability Spectrum</h2>
             </div>
             <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
                <Stethoscope className="text-blue-500" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{currentMetric.label} Tracking</span>
             </div>
          </div>

          <div className="relative group rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.6] dark:bg-[#030712]/40 backdrop-blur-[60px] p-10 shadow-3xl overflow-hidden transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
            
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-40">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                   <TrendingUp size={48} />
                </div>
                <p className="font-bold text-xl italic max-w-xs">Waiting for telemetry data injection to map trend spectrum.</p>
              </div>
            ) : (
              <div ref={chartRef} className="w-full h-[450px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" opacity={0.05} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#64748b", fontWeight: "900", fontSize: 10 }} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#64748b", fontWeight: "900", fontSize: 10 }} 
                    />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const color = data.status === "abnormal" ? "text-red-500" : data.status === "warning" ? "text-amber-500" : "text-blue-500";
                          return (
                            <div className="px-6 py-4 rounded-3xl bg-white/90 dark:bg-[#030712]/90 backdrop-blur-2xl border border-white/20 shadow-2xl transform -translate-y-4 transition-all animate-in zoom-in-95">
                              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{data.date}</p>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-black ${color}`}>{data.value}</span>
                                <span className="text-xs font-black text-gray-500">{currentMetric.unit}</span>
                              </div>
                              <div className="mt-2 text-[10px] font-black uppercase flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${data.status === "abnormal" ? "bg-red-500" : data.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                 {data.status} Deviation
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={6}
                      fillOpacity={1}
                      fill="url(#metricGradient)"
                      animationDuration={2000}
                      dot={({ cx, cy, payload }: any) => {
                        const color = payload.status === "abnormal" ? "#ef4444" : payload.status === "warning" ? "#f59e0b" : "#4f46e5";
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={8} fill={color} stroke="white" strokeWidth={3} className="shadow-lg" />
                            {payload.status === "abnormal" && <circle cx={cx} cy={cy} r={12} fill="transparent" stroke={color} strokeWidth={2} className="animate-ping" />}
                          </g>
                        );
                      }}
                      activeDot={{ r: 10, stroke: "#ffffff", strokeWidth: 4, fill: "#4f46e5" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ⚡ AI Analytical Engine Pills */}
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={generateInsight}
              disabled={loadingInsight || rawLogs.length === 0}
              className="group relative overflow-hidden px-8 py-6 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-all hover:bg-emerald-500 hover:text-white disabled:opacity-50"
            >
               <div className="relative z-10 flex flex-col items-center gap-3">
                  {loadingInsight ? <Activity className="animate-spin" size={24} /> : <BrainCircuit size={24} />}
                  <span className="text-xs font-black uppercase tracking-widest">Generate Insights</span>
               </div>
               <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={detectTrend}
              disabled={loadingTrend || rawLogs.length < 2}
              className="group relative overflow-hidden px-8 py-6 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition-all hover:bg-indigo-500 hover:text-white disabled:opacity-50"
            >
               <div className="relative z-10 flex flex-col items-center gap-3">
                  {loadingTrend ? <Activity className="animate-spin" size={24} /> : <TrendingUp size={24} />}
                  <span className="text-xs font-black uppercase tracking-widest">Detect Trends</span>
               </div>
               <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={downloadFullAIReport}
              disabled={exportingPDF || rawLogs.length === 0}
              className="group relative overflow-hidden px-8 py-6 rounded-3xl bg-gray-900/10 dark:bg-white/5 border border-gray-900/20 dark:border-white/10 text-gray-900 dark:text-white transition-all hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
            >
               <div className="relative z-10 flex flex-col items-center gap-3">
                  {exportingPDF ? <Activity className="animate-spin" size={24} /> : <Download size={24} />}
                  <span className="text-xs font-black uppercase tracking-widest">Download PDF</span>
               </div>
            </button>
          </div>
        </div>
      </div>

      {/* 🧬 AI Report Intersection */}
      <div className="grid lg:grid-cols-2 gap-12 pt-8 border-t border-gray-100 dark:border-white/5">
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              <h3 className="text-xl font-black italic tracking-tight uppercase tracking-widest text-gray-500">Stability Analysis</h3>
           </div>
           <AIReportCard title="Laboratory Insight" content={insight} />
        </div>
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <History className="text-indigo-500" size={20} />
              <h3 className="text-xl font-black italic tracking-tight uppercase tracking-widest text-gray-500">Predictive Modeling</h3>
           </div>
           <AIReportCard
             title="Trend Detection Matrix"
             content={trendAnalysis}
             variant="trend"
           />
        </div>
      </div>
    </div>
  );
}