'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function AdminWorkersPage() {
  const searchParams = useSearchParams();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('approved') || '');
  const [search, setSearch] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== '') params.set('approved', filter);
    const res = await fetch(`/api/admin/workers?${params}`);
    const data = await res.json();
    if (data.success) setWorkers(data.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchWorkers(); }, [filter]);

  async function approveWorker(id: string, approved: boolean) {
    const res = await fetch(`/api/admin/workers/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, verified: approved }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(approved ? 'Worker approved!' : 'Worker rejected');
      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isApproved: approved } : w))
      );
    } else {
      toast.error('Failed to update worker status');
    }
  }

  const filtered = search
    ? workers.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase())
      )
    : workers;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Workers</h1>
            <p className="text-sm text-[#64748B]">Manage worker applications and approvals</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'false' },
              { label: 'Approved', value: 'true' },
            ].map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 max-w-xs">
          <Input
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    {['Worker', 'Location', 'Services', 'Rating', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#64748B] text-sm">
                        No workers found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={w.name} src={w.avatarUrl} size="sm" />
                            <div>
                              <p className="font-semibold text-sm text-[#0F172A]">{w.name}</p>
                              <p className="text-xs text-[#64748B]">{w.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{w.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {w.services.slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="default" size="sm">{s}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                          {w.ratingAvg > 0 ? `${w.ratingAvg.toFixed(1)} ★` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={w.isApproved ? 'success' : 'warning'}>
                            {w.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {formatDate(w.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!w.isApproved ? (
                              <Button
                                variant="accent"
                                size="sm"
                                onClick={() => approveWorker(w.id, true)}
                                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                              >
                                Approve
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => approveWorker(w.id, false)}
                                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
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
