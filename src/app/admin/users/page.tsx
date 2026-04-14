'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (data.success) setUsers(data.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const roleColors: Record<string, any> = {
    ADMIN: 'danger',
    WORKER: 'info',
    CUSTOMER: 'success',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Users</h1>
            <p className="text-sm text-[#64748B]">{users.length} registered users</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'All', value: '' },
              { label: 'Customers', value: 'CUSTOMER' },
              { label: 'Workers', value: 'WORKER' },
            ].map((f) => (
              <Button
                key={f.value}
                variant={roleFilter === f.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-3 max-w-sm">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button variant="primary" size="md" onClick={fetchUsers}>
            Search
          </Button>
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
                    {['User', 'Role', 'Bookings', 'Status', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-[#64748B]">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                            <div>
                              <p className="font-semibold text-sm text-[#0F172A]">{u.name}</p>
                              <p className="text-xs text-[#64748B]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleColors[u.role] || 'default'} size="sm">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">
                          {(u._count?.customerBookings || 0) + (u._count?.workerBookings || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {formatDate(u.createdAt)}
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
