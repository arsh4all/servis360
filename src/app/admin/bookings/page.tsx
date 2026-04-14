'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: '50' });
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBookings(d.data.items); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">All Bookings</h1>
            <p className="text-sm text-[#64748B]">{bookings.length} bookings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s || 'All'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    {['Service', 'Customer', 'Worker', 'Date', 'Total', 'Fee', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-[#64748B]">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                          {b.service?.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{b.customer?.name}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{b.worker?.name}</td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {formatDate(b.date)}<br />{b.timeSlot}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-[#0F172A]">
                          Rs {Number(b.totalPrice).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">
                          Rs {Number(b.platformFee).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
