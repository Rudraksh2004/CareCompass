"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-10 text-blue-600">
          CareCompass
        </h1>

        <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </Link>

          <Link href="/dashboard/report" className="hover:text-blue-600 transition">
            Report Explainer
          </Link>

          <Link href="/dashboard/prescription" className="hover:text-blue-600 transition">
            Simplify Prescription
          </Link>

          <Link href="/dashboard/health" className="hover:text-blue-600 transition">
            Health Tracking
          </Link>

          <Link href="/dashboard/reminders" className="hover:text-blue-600 transition">
            Medicine Reminders
          </Link>

          <Link href="/dashboard/chat" className="hover:text-blue-600 transition">
            AI Health Chat
          </Link>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3 break-words">
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
