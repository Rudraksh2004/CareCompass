"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme(); // ONLY theme addition (no logic change)

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const linkClasses = (path: string) =>
    `transition px-3 py-2 rounded-lg ${
      pathname === path
        ? "bg-blue-100 text-blue-600 font-medium dark:bg-blue-900/40 dark:text-blue-300"
        : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md p-6 flex flex-col transition-colors">
        <h1 className="text-xl font-bold mb-8 text-blue-600 dark:text-blue-400">
          CareCompass
        </h1>

        {/* Main Nav */}
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className={linkClasses("/dashboard")}>
            Dashboard
          </Link>

          <Link
            href="/dashboard/report"
            className={linkClasses("/dashboard/report")}
          >
            Report Explainer
          </Link>

          <Link
            href="/dashboard/prescription"
            className={linkClasses("/dashboard/prescription")}
          >
            Simplify Prescription
          </Link>

          <Link
            href="/dashboard/health"
            className={linkClasses("/dashboard/health")}
          >
            Health Tracking
          </Link>

          <Link
            href="/dashboard/reminders"
            className={linkClasses("/dashboard/reminders")}
          >
            Medicine Reminders
          </Link>

          <Link
            href="/dashboard/chat"
            className={linkClasses("/dashboard/chat")}
          >
            AI Health Chat
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
          {/* Theme Toggle (UI only, no logic change to app flow) */}
          <button
            onClick={toggleTheme}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <Link
            href="/dashboard/profile"
            className={`${linkClasses("/dashboard/profile")} block mb-3`}
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="text-red-500 text-sm hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-gray-50 dark:bg-gray-900 transition-colors">
        {children}
      </div>
    </div>
  );
}
