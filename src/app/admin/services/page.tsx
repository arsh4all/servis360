'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

type Service = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  _count: { workerServices: number; bookings: number };
};

const emptyForm = { name: '', slug: '', icon: '⚙️', description: '', imageUrl: '', sortOrder: '0' };

const inp = "w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475569] mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    if (data.success) setServices(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (s: Service) => {
    setSelected(s);
    setForm({ name: s.name, slug: s.slug, icon: s.icon, description: s.description || '', imageUrl: s.imageUrl || '', sortOrder: String(s.sortOrder) });
    setModal('edit');
  };
  const openDelete = (s: Service) => { setSelected(s); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
        });
        const data = await res.json();
        if (data.success) { toast.success('Service created!'); closeModal(); fetchServices(); }
        else toast.error(data.message || 'Failed to create');
      } else if (modal === 'edit' && selected) {
        const res = await fetch(`/api/admin/services/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
        });
        const data = await res.json();
        if (data.success) { toast.success('Service updated!'); closeModal(); fetchServices(); }
        else toast.error(data.message || 'Failed to update');
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${selected.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Service deleted'); closeModal(); fetchServices(); }
      else toast.error(data.message || 'Failed to delete');
    } finally { setSaving(false); }
  };

  const toggleActive = async (s: Service) => {
    const res = await fetch(`/api/admin/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(s.isActive ? 'Service deactivated' : 'Service activated');
      setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
    } else toast.error('Failed to update');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Services</h1>
            <p className="text-sm text-[#64748B]">{services.length} services configured</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
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
                    {['Service', 'Slug', 'Workers', 'Bookings', 'Order', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {services.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#94A3B8]">No services found</td></tr>
                  ) : services.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.icon}</span>
                          <div>
                            <p className="font-semibold text-sm text-[#0F172A]">{s.name}</p>
                            {s.description && <p className="text-xs text-[#94A3B8] truncate max-w-[180px]">{s.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B] font-mono">{s.slug}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{s._count.workerServices}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{s._count.bookings}</td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{s.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(s)} className="flex items-center gap-1.5 text-xs font-semibold transition-colors">
                          {s.isActive
                            ? <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Active</span></>
                            : <><ToggleLeft className="w-5 h-5 text-[#94A3B8]" /><span className="text-[#94A3B8]">Inactive</span></>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#0F172A]">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[#94A3B8] hover:text-red-500">
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

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add New Service' : 'Edit Service'} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <Field label="Icon (emoji)">
                <input className={inp} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="⚙️" />
              </Field>
              <div className="col-span-3">
                <Field label="Service Name *">
                  <input
                    className={inp}
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({ ...f, name, slug: modal === 'create' ? slugify(name) : f.slug }));
                    }}
                    placeholder="House Cleaning"
                  />
                </Field>
              </div>
            </div>
            <Field label="Slug *">
              <input className={inp} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="house-cleaning" />
            </Field>
            <Field label="Description">
              <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of the service..." />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Image URL">
                  <input className={inp} value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
                </Field>
              </div>
              <Field label="Sort Order">
                <input className={inp} type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="0" />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : modal === 'create' ? 'Create Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete Service" onClose={closeModal}>
          <p className="text-sm text-[#475569] mb-6">
            Are you sure you want to delete <strong>{selected.name}</strong>?
            {selected._count.bookings > 0 && <span className="text-red-500"> This service has {selected._count.bookings} booking(s) associated with it.</span>}
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Delete Service'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
