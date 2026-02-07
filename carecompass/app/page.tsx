import { FileText, Pill, Activity, MessageSquare } from "lucide-react";

export default function Home() {
  const features = [
    { title: "Simplify Report", icon: <FileText />, desc: "Understand your lab results", color: "bg-blue-500" },
    { title: "Medication", icon: <Pill />, desc: "Reminders & instructions", color: "bg-green-500" },
    { title: "Health Trends", icon: <Activity />, desc: "Track your vitals", color: "bg-purple-500" },
    { title: "AI Chat", icon: <MessageSquare />, desc: "Ask health questions", color: "bg-blue-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CareCompass</h1>
          <p className="text-slate-500 mt-2 text-lg">Your AI-powered health information companion.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`${f.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-xl">{f.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-blue-700 text-sm font-medium">
            ⚠️ CareCompass provides information for educational purposes only and is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </main>
  );
}