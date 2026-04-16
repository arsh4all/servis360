'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, CheckCircle, Clock, DollarSign,
  Star, TrendingUp, ArrowRight, Check, X as XIcon, Eye, Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay } from '@/components/ui/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/worker/stats').then((r) => r.json()),
      fetch('/api/bookings?pageSize=10').then((r) => r.json()),
      fetch('/api/worker/profile').then((r) => r.json()),
    ]).then(([statsData, allData, profileData]) => {
      if (statsData.success) setStats(statsData.data);
      if (allData.success) setBookings(allData.data.items);
      if (profileData.success) {
        setProfileId(profileData.data.id);
        setIsApproved(profileData.data.isApproved);
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleStatus(bookingId: string, status: 'ACCEPTED' | 'DECLINED') {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(status === 'ACCEPTED' ? 'Booking accepted!' : 'Booking declined');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      if (stats) {
        setStats((s: any) => ({
          ...s,
          pendingRequests: Math.max(0, s.pendingRequests - 1),
        }));
      }
    } else {
      toast.error(data.message || 'Failed to update booking');
    }
  }

  async function handleComplete(bookingId: string) {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Job marked as completed!');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'COMPLETED' } : b))
      );
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const acceptedBookings = bookings.filter((b) => b.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Worker Dashboard</h1>
            <p className="text-sm text-[#64748B]">Manage your bookings and earnings</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/worker/settings">
              <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                Edit Profile
              </Button>
            </Link>
            {profileId && isApproved ? (
              <Link href={`/workers/${profileId}`} target="_blank">
                <Button variant="accent" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                  View My Profile
                </Button>
              </Link>
            ) : (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-semibold">
                Pending approval
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <WorkerStat label="Total Bookings" value={stats.totalBookings} icon={<Calendar className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
            <WorkerStat label="Pending" value={stats.pendingRequests} icon={<Clock className="w-5 h-5" />} color="bg-amber-50 text-amber-600" highlight={stats.pendingRequests > 0} />
            <WorkerStat label="Completed" value={stats.completedBookings} icon={<CheckCircle className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
            <WorkerStat
              label="Earnings"
              value={`Rs ${stats.totalEarnings.toLocaleString()}`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="bg-purple-50 text-purple-600"
            />
            <WorkerStat
              label="Avg Rating"
              value={stats.ratingAvg.toFixed(1)}
              icon={<Star className="w-5 h-5" />}
              color="bg-yellow-50 text-yellow-600"
            />
            <WorkerStat label="Reviews" value={stats.totalReviews} icon={<Star className="w-5 h-5" />} color="bg-pink-50 text-pink-600" />
          </div>
        )}

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-[#0F172A]">Pending Requests</h2>
              <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingBookings.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border-2 border-amber-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar name={b.customer?.name || 'C'} src={b.customer?.avatarUrl} size="md" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-[#0F172A]">{b.service?.name}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-sm text-[#64748B]">from {b.customer?.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#64748B]">
                        <span>{formatDate(b.date)}</span>
                        <span>{b.timeSlot}</span>
                        <span className="font-semibold text-[#0F172A]">
                          Rs {Number(b.workerEarning).toLocaleString()} earning
                        </span>
                      </div>
                      {b.notes && (
                        <p className="text-xs text-[#64748B] mt-1 bg-[#F8FAFC] rounded-lg p-2">
                          "{b.notes}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatus(b.id, 'DECLINED')}
                        leftIcon={<XIcon className="w-4 h-4" />}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleStatus(b.id, 'ACCEPTED')}
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Bookings (to complete) */}
        {acceptedBookings.length > 0 && (
          <div>
            <h2 className="font-bold text-[#0F172A] mb-3">Upcoming Jobs</h2>
            <div className="space-y-3">
              {acceptedBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar name={b.customer?.name || 'C'} src={b.customer?.avatarUrl} size="md" className="shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#0F172A]">{b.service?.name}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-sm text-[#64748B]">{b.customer?.name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-[#64748B]">
                        <span>{formatDate(b.date)} · {b.timeSlot}</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleComplete(b.id)}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="font-bold text-[#0F172A] mb-3">All Bookings</h2>
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
              {bookings.length === 0 ? (
                <div className="py-10 text-center text-[#64748B] text-sm">
                  No bookings yet
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-4">
                    <Avatar name={b.customer?.name || 'C'} src={b.customer?.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0F172A] truncate">{b.service?.name}</p>
                      <p className="text-xs text-[#64748B]">{b.customer?.name} · {formatDate(b.date)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                    <p className="text-sm font-black text-[#0F172A] shrink-0">
                      Rs {Number(b.workerEarning).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkerStat({ label, value, icon, color, highlight = false }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 ${highlight ? 'border-amber-300 shadow-amber-100 shadow-md' : 'border-[#E2E8F0]'}`}>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-black text-[#0F172A]">{value}</p>
      <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
    </div>
  );
}
