'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const FIELDS = [
  {
    section: 'Hero Section',
    fields: [
      { key: 'hero_title', label: 'Hero Title', multiline: false, placeholder: 'Find trusted help for your home & family' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', multiline: true, placeholder: 'Book verified cleaning, electrical, plumbing...' },
      { key: 'hero_badge', label: 'Hero Badge Text', multiline: false, placeholder: 'Trusted by 5,000+ homeowners in Mauritius' },
    ],
  },
  {
    section: 'Popular Services Section',
    fields: [
      { key: 'services_title', label: 'Section Title', multiline: false, placeholder: 'Popular Services' },
      { key: 'services_subtitle', label: 'Section Subtitle', multiline: true, placeholder: 'Book from our wide range of professional home services...' },
    ],
  },
  {
    section: 'Top Workers Section',
    fields: [
      { key: 'workers_title', label: 'Section Title', multiline: false, placeholder: 'Top Rated Workers' },
      { key: 'workers_subtitle', label: 'Section Subtitle', multiline: true, placeholder: 'Hand-picked professionals with the highest ratings...' },
    ],
  },
  {
    section: 'Why Choose Us Section',
    fields: [
      { key: 'why_title', label: 'Section Title', multiline: false, placeholder: 'Why Choose Us' },
    ],
  },
  {
    section: 'Footer',
    fields: [
      { key: 'footer_tagline', label: 'Footer Tagline', multiline: true, placeholder: "Mauritius's trusted platform connecting homeowners..." },
    ],
  },
];

const inp = "w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent";

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/content');
    const data = await res.json();
    if (data.success) {
      setContent(data.data);
      setOriginal(data.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = JSON.stringify(content) !== JSON.stringify(original);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Content saved successfully!');
        setOriginal(content);
      } else {
        toast.error(data.message || 'Failed to save content');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(original);
    toast('Changes discarded');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Site Content</h1>
            <p className="text-sm text-[#64748B]">Edit homepage text without touching any code</p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Discard
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 px-5 py-2 bg-[#FACC15] text-[#0F172A] text-sm font-bold rounded-xl hover:bg-[#F59E0B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        {isDirty && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-semibold">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {FIELDS.map(({ section, fields }) => (
              <div key={section} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <h2 className="text-sm font-bold text-[#0F172A]">{section}</h2>
                </div>
                <div className="p-6 space-y-5">
                  {fields.map(({ key, label, multiline, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                        {label}
                        <span className="ml-2 text-[#94A3B8] font-normal font-mono">{key}</span>
                      </label>
                      {multiline ? (
                        <textarea
                          className={`${inp} resize-none`}
                          rows={3}
                          value={content[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                        />
                      ) : (
                        <input
                          className={inp}
                          value={content[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Live Preview Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              <strong>Note:</strong> Changes saved here will be reflected on the homepage immediately.
              Visit <a href="/" target="_blank" className="underline font-semibold">the homepage</a> to preview after saving.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
