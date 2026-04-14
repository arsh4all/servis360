'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MapPin,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
  Briefcase,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface NavUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface NavbarProps {
  user?: NavUser | null;
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/become-worker', label: 'Become a Worker' },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  function getDashboardHref() {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'WORKER') return '/worker';
    return '/dashboard';
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-soft border-b border-[#E2E8F0]'
          : 'bg-white border-b border-[#E2E8F0]'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <span className="text-[#FACC15] font-black text-xs">S3</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-[#0F172A] text-lg leading-none">Servis360</span>
              <span className="font-black text-[#FACC15] text-lg leading-none">.mu</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Location */}
            <div className="hidden md:flex items-center gap-1 text-sm text-[#64748B]">
              <MapPin className="w-4 h-4 text-[#FACC15]" />
              <span>Mauritius</span>
            </div>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
                >
                  <Bell className="w-5 h-5 text-[#0F172A]" />
                </Link>

                {/* User Dropdown */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
                  >
                    <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-[#0F172A] max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[#64748B] transition-transform',
                        dropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-[#E2E8F0] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#E2E8F0] mb-1">
                        <p className="font-semibold text-[#0F172A] text-sm truncate">{user.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                      </div>

                      <DropdownItem
                        href={getDashboardHref()}
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Dashboard"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <DropdownItem
                        href="/profile"
                        icon={<User className="w-4 h-4" />}
                        label="My Profile"
                        onClick={() => setDropdownOpen(false)}
                      />
                      {user.role === 'ADMIN' && (
                        <DropdownItem
                          href="/admin"
                          icon={<Shield className="w-4 h-4" />}
                          label="Admin Panel"
                          onClick={() => setDropdownOpen(false)}
                        />
                      )}

                      <div className="border-t border-[#E2E8F0] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="accent" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-[#F1F5F9]"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E2E8F0] shadow-soft">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                )}
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="accent" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F1F5F9] transition-colors mx-1 rounded-lg"
    >
      <span className="text-[#64748B]">{icon}</span>
      {label}
    </Link>
  );
}
