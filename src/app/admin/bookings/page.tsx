'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, UserPlus, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

type Booking = {
  id: string;
  service?: { name: string };
  customer?: { name: string; email: string };
  worker?: { name: string; email: string } | null;
  date: string;
  timeSlot?: string;
  totalPrice: number;
  platformFee: number;
  status: string;
  declineReason?: string;
  address?: string;
};

type Worker = { id: string; name: string; services: string[] };

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
  DECLINED: 'bg-red-100 text-red-600',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9]">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [actionModal, setActionModal] = useState<{ type: 'decline' | 'assign'; booking: Booking } | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: '100' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/bookings?${params}`);
    const data = await res.json();
    if (data.success) setBookings(data.data.items);
    setLoading(false);
  };

  const fetchWorkers = async () => {
    const res = await fetch('/api/admin/workers?pageSize=100&approved=true');
    const data = await res.json();
    if (data.success) setWorkers(data.data.items);
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);
  useEffect(() => { fetchWorkers(); }, []);

  const updateBooking = async (id: string, updates: object) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Booking updated');
        setActionModal(null);
        fetchBookings();
      } else toast.error(data.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleAccept = (b: Booking) => updateBooking(b.id, { status: 'ACCEPTED' });
  const handleDecline = () => {
    if (!actionModal) return;
    updateBooking(actionModal.booking.id, { status: 'DECLINED', declineReason });
  };
  const handleComplete = (b: Booking) => updateBooking(b.id, { status: 'COMPLETED' });
  const handleAssign = () => {
    if (!actionModal || !assignWorkerId) { toast.error('Select a worker'); return; }
    updateBooking(actionModal.booking.id, { workerId: assignWorkerId });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statuses = ['', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'DECLINED'];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">All Bookings</h1>
            <p className="text-sm text-[#64748B]">{bookings.length} bookings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#FACC15] text-[#0F172A]' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    {['Service', 'Customer', 'Worker', 'Date', 'Total', 'Fee', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-sm text-[#94A3B8]">No bookings found</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{b.service?.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#0F172A]">{b.customer?.name}</p>
                        <p className="text-xs text-[#94A3B8]">{b.customer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">
                        {b.worker?.name || <span className="text-[#94A3B8] italic">Unassigned</span>}
                      </td>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[b.status] || 'bg-[#F1F5F9] text-[#64748B]'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAccept(b)}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => { setDeclineReason(''); setActionModal({ type: 'decline', booking: b }); }}
                                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          )}
                          {b.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleComplete(b)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Complete
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                            <button
                              onClick={() => { setAssignWorkerId(''); setActionModal({ type: 'assign', booking: b }); }}
                              className="flex items-center gap-1 px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs font-semibold rounded-lg hover:bg-[#E2E8F0] transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {actionModal?.type === 'decline' && (
        <Modal title="Decline Booking" onClose={() => setActionModal(null)}>
          <p className="text-sm text-[#475569] mb-4">
            Declining booking for <strong>{actionModal.booking.service?.name}</strong> by {actionModal.booking.customer?.name}.
          </p>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Reason (optional)</label>
          <textarea
            className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Explain why this booking is being declined..."
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setActionModal(null)} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
            <button
              onClick={handleDecline}
              disabled={saving}
              className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Declining...' : 'Decline Booking'}
            </button>
          </div>
        </Modal>
      )}

      {/* Assign Worker Modal */}
      {actionModal?.type === 'assign' && (
        <Modal title="Assign Worker" onClose={() => setActionModal(null)}>
          <p className="text-sm text-[#475569] mb-4">
            Assign a worker to the <strong>{actionModal.booking.service?.name}</strong> booking for {actionModal.booking.customer?.name}.
          </p>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Select Worker</label>
          <div className="relative">
            <select
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] appearance-none"
              value={assignWorkerId}
              onChange={(e) => setAssignWorkerId(e.target.value)}
            >
              <option value="">Choose a worker...</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {w.services.slice(0, 2).join(', ')}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setActionModal(null)} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
            <button
              onClick={handleAssign}
              disabled={saving || !assignWorkerId}
              className="px-5 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50"
            >
              {saving ? 'Assigning...' : 'Assign Worker'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
