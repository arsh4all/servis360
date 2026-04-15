'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Save, Loader2, CheckCircle, MapPin, Clock, Briefcase, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

type Profile = {
  bio: string;
  location: string;
  experienceYears: number;
  isAvailable: boolean;
  responseTime: string;
  user: { name: string; email: string; avatarUrl: string | null };
};

const inp = "w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white";

export default function WorkerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    experienceYears: 0,
    isAvailable: true,
    responseTime: '',
  });

  useEffect(() => {
    fetch('/api/worker/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p: Profile = d.data;
          setProfile(p);
          setAvatarPreview(p.user.avatarUrl || null);
          setForm({
            name: p.user.name || '',
            bio: p.bio || '',
            location: p.location || '',
            experienceYears: p.experienceYears || 0,
            isAvailable: p.isAvailable ?? true,
            responseTime: p.responseTime || 'Usually within 1 hour',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Image upload not configured. Contact admin.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'servis360/workers');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Save to profile immediately
      const saveRes = await fetch('/api/worker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: data.secure_url }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        setAvatarPreview(data.secure_url);
        toast.success('Profile photo updated!');
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      toast.error('Failed to upload photo. Try again.');
      setAvatarPreview(profile?.user.avatarUrl || null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/worker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          location: form.location,
          experienceYears: Number(form.experienceYears),
          isAvailable: form.isAvailable,
          responseTime: form.responseTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile saved!');
        setProfile((p) => p ? { ...p, ...data.data, user: { ...p.user, name: form.name } } : p);
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <h1 className="text-xl font-black text-[#0F172A]">Profile Settings</h1>
        <p className="text-sm text-[#64748B]">Update your public profile — customers see this when booking you</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Photo Upload Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="text-sm font-bold text-[#0F172A] mb-5">Profile Photo</h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#E2E8F0] bg-[#F1F5F9]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FACC15] text-[#0F172A] text-2xl font-black">
                    {initials || '?'}
                  </div>
                )}
              </div>
              {/* Overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploading
                  ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                  : <Camera className="w-6 h-6 text-white" />
                }
              </button>
            </div>

            {/* Upload info */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F172A] mb-1">Upload a clear face photo</p>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                A professional photo builds trust with customers. Use a clear, well-lit photo where your face is clearly visible. JPG or PNG, max 5MB.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] text-sm font-semibold text-[#475569] hover:text-[#0F172A] rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Camera className="w-4 h-4" /> Choose Photo</>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Trust note */}
          <div className="mt-5 flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              Workers with a real profile photo get <strong>3x more bookings</strong>. Customers trust verified professionals with clear photos.
            </p>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="text-sm font-bold text-[#0F172A] mb-5">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
              <input
                className={inp}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
              </label>
              <input
                className={inp}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Port Louis, Mauritius"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Years of Experience</span>
                </label>
                <input
                  className={inp}
                  type="number"
                  min="0"
                  max="50"
                  value={form.experienceYears}
                  onChange={(e) => setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Response Time</span>
                </label>
                <select
                  className={inp}
                  value={form.responseTime}
                  onChange={(e) => setForm((f) => ({ ...f, responseTime: e.target.value }))}
                >
                  <option value="Usually within 1 hour">Within 1 hour</option>
                  <option value="Usually within 2 hours">Within 2 hours</option>
                  <option value="Usually within a few hours">Within a few hours</option>
                  <option value="Usually within a day">Within a day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Bio / About You</label>
              <textarea
                className={`${inp} resize-none`}
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell customers about your skills, experience, and what makes you stand out..."
              />
              <p className="text-xs text-[#94A3B8] mt-1">{form.bio.length}/1000 characters</p>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Available for bookings</p>
                <p className="text-xs text-[#64748B]">Turn off to pause new booking requests</p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                className="flex items-center gap-2 transition-colors"
              >
                {form.isAvailable ? (
                  <><ToggleRight className="w-8 h-8 text-emerald-500" /><span className="text-sm font-semibold text-emerald-600">Open</span></>
                ) : (
                  <><ToggleLeft className="w-8 h-8 text-[#94A3B8]" /><span className="text-sm font-semibold text-[#94A3B8]">Paused</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FACC15] text-[#0F172A] font-black text-sm rounded-2xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50 shadow-md"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Profile</>
          )}
        </button>

        {/* Email (read-only) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Account Email</p>
          <p className="text-sm text-[#0F172A] font-semibold">{profile?.user.email}</p>
          <p className="text-xs text-[#94A3B8] mt-1">Contact support to change your email address</p>
        </div>

      </div>
    </div>
  );
}
