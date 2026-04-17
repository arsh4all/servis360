'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera, Save, Loader2, CheckCircle, MapPin, Clock, Briefcase,
  ToggleLeft, ToggleRight, Phone, ImageIcon, Quote, Video,
  Plus, Trash2, GripVertical, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Profile = {
  id: string;
  bio: string;
  location: string;
  experienceYears: number;
  isAvailable: boolean;
  responseTime: string;
  tagline: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  user: { name: string; email: string; avatarUrl: string | null; phone: string | null };
};

type WorkerPhoto = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

const inp = "w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white";

export default function WorkerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Photos gallery
  const [photos, setPhotos] = useState<WorkerPhoto[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    tagline: '',
    bio: '',
    location: '',
    experienceYears: 0,
    isAvailable: true,
    responseTime: '',
    videoUrl: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, photosRes] = await Promise.all([
          fetch('/api/worker/profile'),
          fetch('/api/worker/photos'),
        ]);
        const profileData = await profileRes.json();
        const photosData = await photosRes.json();

        if (profileData.success) {
          const p: Profile = profileData.data;
          setProfile(p);
          setAvatarPreview(p.user.avatarUrl || null);
          setCoverPreview(p.coverImageUrl || null);
          setForm({
            name: p.user.name || '',
            phone: p.user.phone || '',
            tagline: p.tagline || '',
            bio: p.bio || '',
            location: p.location || '',
            experienceYears: p.experienceYears || 0,
            isAvailable: p.isAvailable ?? true,
            responseTime: p.responseTime || 'Usually within 1 hour',
            videoUrl: p.videoUrl || '',
          });
        }
        if (photosData.success) setPhotos(photosData.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setAvatarPreview(URL.createObjectURL(file));
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) { toast.error('Upload not configured.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'servis360/workers');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const saveRes = await fetch('/api/worker/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: data.secure_url }) });
      const saveData = await saveRes.json();
      if (saveData.success) { setAvatarPreview(data.secure_url); toast.success('Profile photo updated!'); }
      else throw new Error('Failed to save');
    } catch { toast.error('Failed to upload photo.'); setAvatarPreview(profile?.user.avatarUrl || null); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setCoverPreview(URL.createObjectURL(file));
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) { toast.error('Upload not configured.'); return; }

    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'servis360/covers');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const saveRes = await fetch('/api/worker/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coverImageUrl: data.secure_url }) });
      const saveData = await saveRes.json();
      if (saveData.success) { setCoverPreview(data.secure_url); toast.success('Cover photo updated!'); }
      else throw new Error('Failed to save');
    } catch { toast.error('Failed to upload cover.'); setCoverPreview(profile?.coverImageUrl || null); }
    finally { setCoverUploading(false); if (coverRef.current) coverRef.current.value = ''; }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) { toast.error('Upload not configured.'); return; }

    setPhotoUploading(true);
    let uploaded = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is over 5MB, skipped`); continue; }
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'servis360/portfolio');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        if (!res.ok) continue;
        const data = await res.json();
        const saveRes = await fetch('/api/worker/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: data.secure_url, sortOrder: photos.length + uploaded }),
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          setPhotos((prev) => [...prev, saveData.data]);
          uploaded++;
        }
      } catch { /* skip on error */ }
    }
    if (uploaded > 0) toast.success(`${uploaded} photo${uploaded > 1 ? 's' : ''} added to portfolio`);
    setPhotoUploading(false);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(`/api/worker/photos/${photoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        toast.success('Photo removed');
      } else toast.error('Failed to delete photo');
    } catch { toast.error('Failed to delete photo'); }
    finally { setDeletingPhotoId(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/worker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          tagline: form.tagline,
          bio: form.bio,
          location: form.location,
          experienceYears: Number(form.experienceYears),
          isAvailable: form.isAvailable,
          responseTime: form.responseTime,
          videoUrl: form.videoUrl,
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
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <h1 className="text-xl font-black text-[#0F172A]">Profile Settings</h1>
        <p className="text-sm text-[#64748B]">Update your public profile — customers see this when browsing services</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Profile Photo */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="text-sm font-bold text-[#0F172A] mb-5">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#E2E8F0] bg-[#F1F5F9]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FACC15] text-[#0F172A] text-2xl font-black">
                    {initials || '?'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F172A] mb-1">Upload a clear face photo</p>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">A professional photo builds trust. JPG or PNG, max 5MB.</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] text-sm font-semibold text-[#475569] hover:text-[#0F172A] rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Camera className="w-4 h-4" /> Choose Photo</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">Workers with a real profile photo get <strong>3x more bookings</strong>.</p>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-[#0F172A] to-[#1E293B] group cursor-pointer" onClick={() => coverRef.current?.click()}>
            {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {coverUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <><ImageIcon className="w-6 h-6 text-white mb-1" /><span className="text-white text-xs font-semibold">Click to change cover photo</span></>}
            </div>
            {!coverPreview && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/50 text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Add cover photo</span>
              </div>
            )}
          </div>
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">Wide banner shown at top of your profile (1200×400px recommended)</p>
            <button onClick={() => coverRef.current?.click()} disabled={coverUploading} className="text-xs font-semibold text-[#FACC15] hover:underline disabled:opacity-50">
              {coverUploading ? 'Uploading...' : 'Change'}
            </button>
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="text-sm font-bold text-[#0F172A] mb-5">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
              <input className={inp} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> WhatsApp / Phone Number</span>
              </label>
              <input className={inp} type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. 52 123 456" />
              <p className="text-xs text-[#94A3B8] mt-1">Used for WhatsApp contact on your public profile.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                <span className="flex items-center gap-1"><Quote className="w-3.5 h-3.5" /> Tagline</span>
              </label>
              <input className={inp} value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder='e.g. "Your vision, our commitment!"' maxLength={150} />
              <p className="text-xs text-[#94A3B8] mt-1">Short motto shown on your profile hero. Max 150 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
              </label>
              <input className={inp} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Port Louis, Mauritius" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Years of Experience</span>
                </label>
                <input className={inp} type="number" min="0" max="50" value={form.experienceYears} onChange={(e) => setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Response Time</span>
                </label>
                <select className={inp} value={form.responseTime} onChange={(e) => setForm((f) => ({ ...f, responseTime: e.target.value }))}>
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

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Available for bookings</p>
                <p className="text-xs text-[#64748B]">Turn off to pause new booking requests</p>
              </div>
              <button onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))} className="flex items-center gap-2 transition-colors">
                {form.isAvailable
                  ? <><ToggleRight className="w-8 h-8 text-emerald-500" /><span className="text-sm font-semibold text-emerald-600">Open</span></>
                  : <><ToggleLeft className="w-8 h-8 text-[#94A3B8]" /><span className="text-sm font-semibold text-[#94A3B8]">Paused</span></>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Video Presentation */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-4 h-4 text-[#64748B]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Video Presentation</h2>
            <span className="text-xs text-[#94A3B8] ml-auto">Optional</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">YouTube or Vimeo URL</label>
            <input
              className={inp}
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">Paste a YouTube or Vimeo link. Customers will see an embedded video on your profile.</p>
          </div>
          {form.videoUrl && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Video URL saved — click "Save Profile" below to apply
            </div>
          )}
        </div>

        {/* Portfolio Gallery */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#64748B]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Portfolio Gallery</h2>
              <span className="text-xs text-[#94A3B8]">{photos.length}/20 photos</span>
            </div>
            {photos.length < 20 && (
              <button
                onClick={() => galleryRef.current?.click()}
                disabled={photoUploading}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#FACC15] text-[#0F172A] px-3 py-1.5 rounded-xl hover:bg-[#F59E0B] disabled:opacity-50 transition-colors"
              >
                {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {photoUploading ? 'Uploading...' : 'Add Photos'}
              </button>
            )}
          </div>

          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />

          {photos.length === 0 ? (
            <button
              onClick={() => galleryRef.current?.click()}
              disabled={photoUploading}
              className="w-full border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] rounded-xl p-8 text-center transition-colors group disabled:opacity-50"
            >
              <ImageIcon className="w-8 h-8 text-[#CBD5E1] group-hover:text-[#FACC15] mx-auto mb-2 transition-colors" />
              <p className="text-sm font-semibold text-[#64748B]">Upload your work photos</p>
              <p className="text-xs text-[#94A3B8] mt-1">Show customers your past jobs — before & after, completed projects, your team at work</p>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-[#F1F5F9]">
                  <img src={photo.url} alt={photo.caption || 'Portfolio photo'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                    >
                      {deletingPhotoId === photo.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
              {photos.length < 20 && (
                <button
                  onClick={() => galleryRef.current?.click()}
                  disabled={photoUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {photoUploading ? <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" /> : <Plus className="w-5 h-5 text-[#94A3B8]" />}
                  <span className="text-xs text-[#94A3B8]">Add more</span>
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-[#94A3B8] mt-3">Hover over a photo and click the trash icon to remove it. Up to 20 photos.</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FACC15] text-[#0F172A] font-black text-sm rounded-2xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50 shadow-md"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>

        {/* Account email (read-only) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Account Email</p>
          <p className="text-sm text-[#0F172A] font-semibold">{profile?.user.email}</p>
          <p className="text-xs text-[#94A3B8] mt-1">Contact support to change your email address</p>
        </div>

      </div>
    </div>
  );
}
