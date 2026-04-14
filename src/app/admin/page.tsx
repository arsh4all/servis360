'use client';

import { useEffect, useState } from 'react';
import {
  Users, Briefcase, Calendar, TrendingUp,
  Clock, CheckCircle, DollarSign, AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <h1 className="text-xl font-black text-[#0F172A]">Platform Overview</h1>
        <p className="text-sm text-[#64748B]">Real-time statistics for Servis360.mu</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" label="Loading stats..." />
          </div>
        ) : stats ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AdminStat
                label="Total Users"
                value={stats.totalUsers}
                icon={<Users className="w-5 h-5" />}
                color="bg-blue-50 text-blue-600"
                sub={`${stats.totalCustomers} customers · ${stats.totalWorkers} workers`}
              />
              <AdminStat
                label="Pending Approvals"
                value={stats.pendingApprovals}
                icon={<AlertCircle className="w-5 h-5" />}
                color={stats.pendingApprovals > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
                highlight={stats.pendingApprovals > 0}
                sub={stats.pendingApprovals > 0 ? 'Workers awaiting approval' : 'All clear'}
              />
              <AdminStat
                label="Total Bookings"
                value={stats.totalBookings}
                icon={<Calendar className="w-5 h-5" />}
                color="bg-purple-50 text-purple-600"
                sub={`${stats.activeBookings} active`}
              />
              <AdminStat
                label="Total Revenue"
                value={`Rs ${stats.totalRevenue.toLocaleString()}`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="bg-emerald-50 text-emerald-600"
                sub={`Rs ${stats.monthlyRevenue.toLocaleString()} this month`}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <QuickAction
                href="/admin/workers?approved=false"
                title="Review Workers"
                desc={`${stats.pendingApprovals} pending worker applications`}
                icon={<Briefcase className="w-5 h-5 text-amber-600" />}
                bg="bg-amber-50 border-amber-200"
              />
              <QuickAction
                href="/admin/bookings"
                title="Active Bookings"
                desc={`${stats.activeBookings} bookings in progress`}
                icon={<Clock className="w-5 h-5 text-blue-600" />}
                bg="bg-blue-50 border-blue-200"
              />
              <QuickAction
                href="/admin/users"
                title="All Users"
                desc={`${stats.totalUsers} registered users`}
                icon={<Users className="w-5 h-5 text-purple-600" />}
                bg="bg-purple-50 border-purple-200"
              />
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="font-bold text-[#0F172A] mb-4">Revenue Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-sm text-[#64748B] mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-black text-[#0F172A]">
                    Rs {stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Platform fees (10%)</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-sm text-[#64748B] mb-1">All-Time Revenue</p>
                  <p className="text-2xl font-black text-[#0F172A]">
                    Rs {stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">From {stats.totalBookings} bookings</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-[#64748B]">Failed to load stats</div>
        )}
      </div>
    </div>
  );
}

function AdminStat({ label, value, icon, color, sub, highlight = false }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 ${highlight ? 'border-amber-400 shadow-amber-100 shadow-md' : 'border-[#E2E8F0]'}`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-[#0F172A]">{value}</p>
      <p className="text-sm text-[#64748B] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#94A3B8] mt-1">{sub}</p>}
    </div>
  );
}

function QuickAction({ href, title, desc, icon, bg }: {
  href: string; title: string; desc: string; icon: React.ReactNode; bg: string;
}) {
  return (
    <a
      href={href}
      className={`${bg} border rounded-2xl p-5 hover:shadow-card transition-all block`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-bold text-[#0F172A] text-sm">{title}</p>
          <p className="text-xs text-[#64748B]">{desc}</p>
        </div>
      </div>
    </a>
  );
}
