"use client";

import { useState } from "react";

export default function PrescriptionPage() {
  const [prescriptionText, setPrescriptionText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const simplifyPrescription = async () => {
    if (!prescriptionText.trim()) return;

    setLoading(true);
    setResult("");

    const res = await fetch(
      "/api/ai/simplify-prescription",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionText }),
      }
    );

    const data = await res.json();
    setResult(data.simplified || "No response");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Simplify Prescription
      </h1>

      <textarea
        rows={8}
        className="w-full border p-3 rounded mb-4"
        placeholder="Paste prescription here..."
        value={prescriptionText}
        onChange={(e) =>
          setPrescriptionText(e.target.value)
        }
      />

      <button
        onClick={simplifyPrescription}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Simplifying..." : "Simplify"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
