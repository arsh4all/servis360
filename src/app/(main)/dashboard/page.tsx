'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, CheckCircle, Clock, XCircle,
  Star, ArrowRight, MapPin, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, spent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
    ]).then(([bData]) => {
      if (bData.success) {
        const list: any[] = bData.data.items;
        setBookings(list);
        setStats({
          total: list.length,
          active: list.filter((b) =>
            ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
          ).length,
          completed: list.filter((b) => b.status === 'COMPLETED').length,
          spent: list
            .filter((b) => b.status === 'COMPLETED')
            .reduce((s, b) => s + Number(b.totalPrice), 0),
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'active') return ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">My Dashboard</h1>
          <p className="text-[#94A3B8]">Manage your bookings and history</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-5 h-5" />} label="Total Bookings" value={stats.total} color="bg-blue-50 text-blue-600" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Active" value={stats.active} color="bg-amber-50 text-amber-600" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats.completed} color="bg-emerald-50 text-emerald-600" />
          <StatCard
            icon={<span className="font-black text-sm">Rs</span>}
            label="Total Spent"
            value={`Rs ${stats.spent.toLocaleString()}`}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* CTA if no bookings */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center mb-8">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="font-bold text-[#0F172A] text-lg mb-2">No bookings yet</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Find a trusted professional and book your first service
            </p>
            <Link href="/services">
              <Button variant="accent">Browse Services</Button>
            </Link>
          </div>
        )}

        {/* Bookings Table */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#E2E8F0] px-4">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-[#0F172A] text-[#0F172A]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner label="Loading bookings..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-[#64748B] text-sm">
                No {activeTab === 'all' ? '' : activeTab} bookings
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {filtered.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-[#0F172A]">{value}</p>
      <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-[#F8FAFC] transition-colors">
      <Avatar name={booking.worker?.name || 'W'} src={booking.worker?.avatarUrl} size="md" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="font-semibold text-[#0F172A]">{booking.service?.name}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-[#64748B]">
          Worker: {booking.worker?.name}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(booking.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {booking.timeSlot}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {booking.address.substring(0, 30)}...
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-black text-[#0F172A]">Rs {Number(booking.totalPrice).toLocaleString()}</p>
        </div>
        {booking.status === 'COMPLETED' && !booking.review && (
          <Link href={`/dashboard/review/${booking.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Star className="w-3.5 h-3.5" />}>
              Review
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
