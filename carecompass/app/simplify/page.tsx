"use client";
import { useState } from 'react';
import { analyzeMedicalReport } from '@/lib/actions';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

export default function SimplifyPage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleForm(formData: FormData) {
    setLoading(true);
    const analysis = await analyzeMedicalReport(formData);
    setResult(analysis);
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Report Simplifier</h1>
      
      <form action={handleForm} className="mb-10">
        <div className="border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center bg-white">
          <input type="file" name="file" accept="image/*,application/pdf" className="mb-4" required />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Analyze Report"}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm prose max-w-none">
          <div className="flex items-center gap-2 text-green-600 mb-4 font-bold">
            <CheckCircle size={20} /> Analysis Complete
          </div>
          {/* We use a simple div here; in production, use a markdown library like 'react-markdown' */}
          <div className="whitespace-pre-wrap text-slate-700">{result}</div>
        </div>
      )}
    </div>
  );
}