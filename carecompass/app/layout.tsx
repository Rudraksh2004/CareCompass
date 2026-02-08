"use client";
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import './globals.css';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {user && !isAuthPage && <Sidebar />}
      <main className={`flex-1 ${user && !isAuthPage ? 'md:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}