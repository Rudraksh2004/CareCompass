"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, FileSearch, Pill, MessageSquare, LogOut, HeartPulse } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Simplify Report', href: '/simplify', icon: FileSearch },
  { name: 'Medications', href: '/meds', icon: Pill },
  { name: 'AI Health Chat', href: '/chat', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 hidden md:flex flex-col z-50">
      <div className="flex items-center gap-3 text-blue-600 mb-10 px-2">
        <HeartPulse size={30} fill="currentColor" />
        <span className="text-xl font-bold text-slate-900 tracking-tight">CareCompass</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                isActive 
                ? 'bg-blue-50 text-blue-600 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => signOut(auth)}
        className="mt-auto flex items-center gap-3 px-4 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}