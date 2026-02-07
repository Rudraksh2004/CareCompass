"use client";
import { useState } from "react";
import { analyzeMedicalReport } from "@/lib/actions";
import { Loader2, FileText, CheckCircle, ShieldAlert } from "lucide-react";

export default function SimplifyPage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleForm(formData: FormData) {
    setLoading(true);
    try {
      const analysis = await analyzeMedicalReport(formData);
      setResult(analysis);
    } catch (err) {
      setResult("Error: Could not process the file. Please try a clear image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Report Simplifier</h1>
        <p className="text-slate-500">Upload blood work or lab results for a plain-English explanation.</p>
      </header>
      
      <form action={handleForm} className="mb-10">
        <div className="border-2 border-dashed border-blue-200 p-12 rounded-[2rem] text-center bg-white hover:border-blue-400 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            name="file" 
            accept="image/*,application/pdf" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            required 
          />
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-4">
              <FileText size={32} />
            </div>
            <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-400 text-sm">PDF, PNG, or JPG (max 10MB)</p>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Simplify My Report"}
        </button>
      </form>

      {result && (
        <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 prose prose-slate max-w-none">
          <div className="flex items-center gap-2 text-green-600 mb-6 font-bold bg-green-50 w-fit px-4 py-2 rounded-full text-sm">
            <CheckCircle size={18} /> Analysis Ready
          </div>
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{result}</div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3 text-slate-400 italic text-sm">
            <ShieldAlert size={20} className="shrink-0 text-amber-500" />
            <p>CareCompass is an educational tool. This summary is not a diagnosis. Always share these findings with your doctor.</p>
          </div>
        </div>
      )}
    </div>
  );
}