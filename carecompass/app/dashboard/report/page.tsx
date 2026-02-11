"use client";

import { useState } from "react";

export default function ReportPage() {
  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const explainReport = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data.explanation);
      }
    } catch (err) {
      setError("Failed to connect to AI service");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Explain Medical Report
      </h1>

      <textarea
        rows={8}
        className="w-full border p-3 rounded mb-4"
        placeholder="Paste medical report text here..."
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
      />

      <button
        onClick={explainReport}
        disabled={loading || !reportText}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Explain Report"}
      </button>

      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-6 p-4 bg-black-100 rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
