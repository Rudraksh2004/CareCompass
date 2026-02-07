"use client";
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import './globals.css';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Show sidebar only if user is logged in and not on login page */}
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
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}