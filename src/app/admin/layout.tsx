import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Users, Briefcase, Calendar,
  TrendingUp, LogOut, Shield, Wrench, FileText,
} from 'lucide-react';
import { verifyAccessToken } from '@/lib/jwt';

async function getAdminUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'ADMIN') return null;
    return { id: payload.userId, name: payload.name, email: payload.email };
  } catch {
    return null;
  }
}

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/workers', label: 'Workers', icon: Briefcase },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Site Content', icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Servis360.mu" width={120} height={43} className="h-8 w-auto object-contain brightness-0 invert" />
            <span className="text-[#64748B] text-xs">Admin</span>
          </Link>
        </div>

        {/* Admin info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-[#64748B] text-xs">Administrator</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            View Site
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        <header className="lg:hidden bg-[#0F172A] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FACC15] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#0F172A]" />
            </div>
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <div className="flex gap-1">
            {NAV.map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="p-2 text-[#94A3B8] hover:text-white">
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
