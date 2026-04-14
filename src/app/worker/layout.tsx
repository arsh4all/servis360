import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Calendar, Star, Settings, LogOut, Bell } from 'lucide-react';
import { verifyAccessToken } from '@/lib/jwt';

async function getWorkerUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'WORKER') return null;
    return { id: payload.userId, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getWorkerUser();
  if (!user) redirect('/login?callbackUrl=/worker');

  const NAV = [
    { href: '/worker', label: 'Overview', icon: LayoutDashboard },
    { href: '/worker/bookings', label: 'Bookings', icon: Calendar },
    { href: '/worker/reviews', label: 'Reviews', icon: Star },
    { href: '/worker/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Servis360.mu" width={120} height={43} className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-[#64748B] text-xs truncate">{user.email}</p>
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

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/10">
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

      {/* Main */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#0F172A] px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
              <span className="text-[#0F172A] font-black text-xs">LK</span>
            </div>
            <span className="text-white font-bold text-sm">Worker Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            {NAV.map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="p-2 text-[#94A3B8] hover:text-white">
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
