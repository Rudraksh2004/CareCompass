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
} from "recharts";

export default function HealthPage() {
  const { user } = useAuth();

  const [type, setType] = useState("weight");
  const [value, setValue] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  const loadLogs = async () => {
    if (user) {
      const data = await getHealthLogs(user.uid, type);
      setLogs(
        data.map((log: any, index: number) => ({
          name: index + 1,
          value: parseFloat(log.value),
        }))
      );
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user, type]);

  const handleAdd = async () => {
    if (!user) return;

    await addHealthLog(user.uid, type, value);
    setValue("");
    loadLogs();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Health Tracking
      </h1>

      {/* Input Section */}
      <div className="mb-6 space-y-3">
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="weight">Weight (kg)</option>
          <option value="blood_sugar">Blood Sugar</option>
        </select>

        <input
          className="border p-2 rounded ml-2"
          placeholder="Enter value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
        >
          Add Log
        </button>
      </div>

      {/* Chart */}
      <LineChart width={600} height={300} data={logs}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#2563eb" />
      </LineChart>
    </div>
  );
}
