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
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">
          CareCompass
        </h1>

        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>

          <Link href="/dashboard/report" className="hover:text-blue-600">
            Report Explainer
          </Link>

          <Link href="/dashboard/reminders" className="hover:text-blue-600">
            Medicine Reminders
          </Link>

          <Link href="/dashboard/chat" className="hover:text-blue-600">
            AI Health Chat
          </Link>
        </nav>

        <div className="mt-auto">
          <p className="text-sm text-gray-500 mb-2">
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
}
