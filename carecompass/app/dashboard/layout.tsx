"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const linkClasses = (path: string) =>
    `transition px-3 py-2 rounded-lg ${
      pathname === path
        ? "bg-blue-100 text-blue-600 font-medium"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8 text-blue-600">
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
        <div className="mt-auto pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4 truncate">
            {user?.email}
          </p>

          <Link
            href="/dashboard/profile"
            className={`${linkClasses("/dashboard/profile")} block mb-2`}
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="text-red-500 text-sm hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">{children}</div>
    </div>
  );
}
