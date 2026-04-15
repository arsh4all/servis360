'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

type Worker = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  location: string;
  isApproved: boolean;
  isVerified: boolean;
  ratingAvg: number;
  totalReviews: number;
  createdAt: string;
  services: string[];
};

type ServiceOption = { id: string; name: string };

const emptyForm = {
  name: '', email: '', password: '', phone: '', avatarUrl: '',
  bio: '', location: '', experienceYears: '', services: [] as { serviceId: string; price: string; pricingType: string }[],
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#0F172A]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475569] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent";

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: '100' });
    if (filter !== '') params.set('approved', filter);
    const res = await fetch(`/api/admin/workers?${params}`);
    const data = await res.json();
    if (data.success) setWorkers(data.data.items);
    setLoading(false);
  };

  const fetchServices = async () => {
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    if (data.success) setServiceOptions(data.data.map((s: any) => ({ id: s.id, name: s.name })));
  };

  useEffect(() => { fetchWorkers(); }, [filter]);
  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (w: Worker) => {
    setSelected(w);
    setForm({ name: w.name, email: w.email, password: '', phone: '', avatarUrl: w.avatarUrl || '', bio: '', location: w.location, experienceYears: '', services: [] });
    setModal('edit');
  };
  const openDelete = (w: Worker) => { setSelected(w); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        const res = await fetch('/api/admin/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears) || 0 }),
        });
        const data = await res.json();
        if (data.success) { toast.success('Worker created!'); closeModal(); fetchWorkers(); }
        else toast.error(data.message || 'Failed to create worker');
      } else if (modal === 'edit' && selected) {
        const res = await fetch(`/api/admin/workers/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, phone: form.phone, avatarUrl: form.avatarUrl, bio: form.bio, location: form.location, experienceYears: Number(form.experienceYears) || undefined }),
        });
        const data = await res.json();
        if (data.success) { toast.success('Worker updated!'); closeModal(); fetchWorkers(); }
        else toast.error(data.message || 'Failed to update worker');
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/workers/${selected.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Worker deleted'); closeModal(); fetchWorkers(); }
      else toast.error(data.message || 'Failed to delete worker');
    } finally { setSaving(false); }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    const res = await fetch(`/api/admin/workers/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, verified: approved }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(approved ? 'Worker approved!' : 'Worker revoked');
      setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, isApproved: approved } : w));
    } else toast.error('Failed to update status');
  };

  const addServiceRow = () => setForm((f) => ({ ...f, services: [...f.services, { serviceId: '', price: '', pricingType: 'FIXED' }] }));
  const removeServiceRow = (i: number) => setForm((f) => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));
  const updateServiceRow = (i: number, key: string, val: string) =>
    setForm((f) => ({ ...f, services: f.services.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));

  const filtered = workers.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Workers</h1>
            <p className="text-sm text-[#64748B]">{workers.length} total workers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {[{ label: 'All', value: '' }, { label: 'Pending', value: 'false' }, { label: 'Approved', value: 'true' }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f.value ? 'bg-[#FACC15] text-[#0F172A]' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
                >{f.label}</button>
              ))}
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Worker
            </button>
          </div>
        </div>
        <div className="mt-4 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                    {['Worker', 'Location', 'Services', 'Rating', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[#94A3B8]">No workers found</td></tr>
                  ) : filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FACC15] rounded-full flex items-center justify-center text-[#0F172A] font-bold text-sm flex-shrink-0">
                            {w.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#0F172A]">{w.name}</p>
                            <p className="text-xs text-[#64748B]">{w.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{w.location || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {w.services.slice(0, 2).map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] text-xs rounded-full">{s}</span>
                          ))}
                          {w.services.length > 2 && <span className="text-xs text-[#94A3B8]">+{w.services.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                        {w.ratingAvg > 0 ? `${w.ratingAvg.toFixed(1)} ★` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${w.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {w.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!w.isApproved ? (
                            <button onClick={() => handleApprove(w.id, true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          ) : (
                            <button onClick={() => handleApprove(w.id, false)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors">
                              <XCircle className="w-3.5 h-3.5" /> Revoke
                            </button>
                          )}
                          <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#0F172A]">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openDelete(w)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[#94A3B8] hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add New Worker' : 'Edit Worker'} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *">
                <input className={inp} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" />
              </Field>
              <Field label="Email *">
                <input className={inp} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jean@email.com" disabled={modal === 'edit'} />
              </Field>
            </div>
            {modal === 'create' && (
              <Field label="Password (default: Worker@123)">
                <input className={inp} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank for default" />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input className={inp} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+230 5XXX XXXX" />
              </Field>
              <Field label="Location">
                <input className={inp} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Port Louis" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (years)">
                <input className={inp} type="number" min="0" value={form.experienceYears} onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))} placeholder="3" />
              </Field>
              <Field label="Avatar URL">
                <input className={inp} value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
              </Field>
            </div>
            <Field label="Bio">
              <textarea className={`${inp} resize-none`} rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Brief description..." />
            </Field>

            {modal === 'create' && serviceOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#475569]">Services & Pricing</label>
                  <button onClick={addServiceRow} className="text-xs text-[#FACC15] font-semibold hover:underline">+ Add service</button>
                </div>
                {form.services.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select className={`${inp} flex-1`} value={s.serviceId} onChange={(e) => updateServiceRow(i, 'serviceId', e.target.value)}>
                      <option value="">Select service</option>
                      {serviceOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <input className={`${inp} w-24`} placeholder="Price" type="number" value={s.price} onChange={(e) => updateServiceRow(i, 'price', e.target.value)} />
                    <select className={`${inp} w-24`} value={s.pricingType} onChange={(e) => updateServiceRow(i, 'pricingType', e.target.value)}>
                      <option value="FIXED">Fixed</option>
                      <option value="HOURLY">Hourly</option>
                    </select>
                    <button onClick={() => removeServiceRow(i)} className="p-1.5 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : modal === 'create' ? 'Create Worker' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <Modal title="Delete Worker" onClose={closeModal}>
          <p className="text-sm text-[#475569] mb-6">
            Are you sure you want to delete <strong>{selected.name}</strong>? This will remove their account and all associated data. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Delete Worker'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
