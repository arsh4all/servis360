'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft,
  Users, Briefcase, Camera, Loader2, CheckCircle, X,
  Sparkles, Zap, Droplets, Baby, Heart, Wrench,
  Scissors, Leaf, ShieldCheck, Hammer, Wind,
  MapPin, Phone, Quote, Clock, Video, ImageIcon, Plus, Trash2,
  type LucideProps,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { MAURITIUS_DISTRICTS } from '@/lib/districts';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Sparkles, Zap, Droplets, Camera, Baby, Heart,
  Wrench, Scissors, Leaf, ShieldCheck, Hammer, Wind,
};

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <Wrench className={className} />;
  return <Icon className={className} />;
}

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'WORKER']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AccountForm = z.infer<typeof accountSchema>;
type ServiceOption = { id: string; name: string; icon: string; description: string | null };
type SelectedService = { serviceId: string; price: string; pricingType: 'FIXED' | 'HOURLY' };

const inp = "w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white placeholder:text-[#94A3B8]";

export default function RegisterPage() {
  return <Suspense><RegisterPageInner /></Suspense>;
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1=Account, 2=Profile, 3=Services

  // Step 1 form
  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      role: (searchParams.get('role') as 'CUSTOMER' | 'WORKER') || 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');
  const nameVal = watch('name');
  const initials = nameVal?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Step 2 – profile fields
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    tagline: '',
    bio: '',
    location: '',
    experienceYears: '',
    responseTime: 'Usually within 1 hour',
    videoUrl: '',
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Step 3 – services + portfolio
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (selectedRole === 'WORKER' && serviceOptions.length === 0) {
      fetch('/api/services')
        .then((r) => r.json())
        .then((d) => { if (d.success) setServiceOptions(d.data); });
    }
  }, [selectedRole]);

  // ── Upload helpers ──────────────────────────────────────────────────────────

  async function uploadToCloudinary(file: File, folder: string): Promise<string | null> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.secure_url as string;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'servis360/workers');
      if (url) { setAvatarUrl(url); setAvatarPreview(url); toast.success('Photo uploaded!'); }
      else toast.error('Upload failed — you can add a photo later in settings.');
    } finally { setAvatarUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'servis360/covers');
      if (url) { setCoverUrl(url); setCoverPreview(url); toast.success('Cover uploaded!'); }
      else toast.error('Upload failed — you can add it later in settings.');
    } finally { setCoverUploading(false); if (coverRef.current) coverRef.current.value = ''; }
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPortfolioUploading(true);
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} over 5MB, skipped`); continue; }
      if (portfolioPhotos.length + added >= 10) break;
      const url = await uploadToCloudinary(file, 'servis360/portfolio');
      if (url) { setPortfolioPhotos((p) => [...p, url]); added++; }
    }
    if (added > 0) toast.success(`${added} photo${added > 1 ? 's' : ''} added`);
    setPortfolioUploading(false);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  // ── Service toggles ─────────────────────────────────────────────────────────

  const toggleService = (svc: ServiceOption) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.serviceId === svc.id);
      if (exists) return prev.filter((s) => s.serviceId !== svc.id);
      return [...prev, { serviceId: svc.id, price: '', pricingType: 'FIXED' }];
    });
  };

  const updateService = (serviceId: string, key: 'price' | 'pricingType', val: string) => {
    setSelectedServices((prev) => prev.map((s) => s.serviceId === serviceId ? { ...s, [key]: val } : s));
  };

  // ── Step navigation ─────────────────────────────────────────────────────────

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'email', 'password', 'confirmPassword']);
    if (!valid) return;
    if (selectedRole === 'CUSTOMER') {
      handleSubmit(onSubmit)();
    } else {
      setStep(2);
    }
  };

  const goToStep3 = () => setStep(3);

  // ── Final submit ────────────────────────────────────────────────────────────

  async function onSubmit(data: AccountForm) {
    const { confirmPassword, ...payload } = data;
    const services = selectedServices.filter((s) => s.price && Number(s.price) > 0);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(coverUrl ? { coverImageUrl: coverUrl } : {}),
        ...(profileForm.phone ? { phone: profileForm.phone } : {}),
        ...(profileForm.tagline ? { tagline: profileForm.tagline } : {}),
        ...(profileForm.bio ? { bio: profileForm.bio } : {}),
        ...(profileForm.location ? { location: profileForm.location } : {}),
        ...(profileForm.experienceYears ? { experienceYears: Number(profileForm.experienceYears) } : {}),
        responseTime: profileForm.responseTime,
        ...(profileForm.videoUrl ? { videoUrl: profileForm.videoUrl } : {}),
        ...(portfolioPhotos.length > 0 ? { photos: portfolioPhotos } : {}),
        ...(services.length > 0 ? {
          services: services.map((s) => ({
            serviceId: s.serviceId,
            price: Number(s.price),
            pricingType: s.pricingType,
          }))
        } : {}),
      }),
    });

    const result = await res.json();
    if (result.success) {
      toast.success(`Welcome to Servis360.mu, ${result.data.user.name.split(' ')[0]}!`);
      router.push(result.data.user.role === 'WORKER' ? '/worker' : '/dashboard');
      router.refresh();
    } else {
      toast.error(result.message || 'Registration failed');
    }
  }

  const isWorker = selectedRole === 'WORKER';
  const totalSteps = isWorker ? 3 : 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center mb-4">
            <Image src="/logo.png" alt="Servis360.mu" width={200} height={72} className="h-16 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-black text-[#0F172A]">Create your account</h1>
          <p className="text-[#64748B] text-sm mt-1">Join Mauritius's trusted home service platform</p>
        </div>

        {/* Step indicator (worker only) */}
        {isWorker && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['Account', 'Profile', 'Services'].map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors',
                      done ? 'bg-emerald-500 text-white' : active ? 'bg-[#FACC15] text-[#0F172A]' : 'bg-[#E2E8F0] text-[#94A3B8]'
                    )}>
                      {done ? <CheckCircle className="w-4 h-4" /> : n}
                    </div>
                    <span className={cn('text-xs font-semibold hidden sm:block', active ? 'text-[#0F172A]' : 'text-[#94A3B8]')}>{label}</span>
                  </div>
                  {i < 2 && <div className={cn('w-8 h-0.5', step > n ? 'bg-emerald-400' : 'bg-[#E2E8F0]')} />}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-card">

          {/* ═══════════════════════════════════ STEP 1: ACCOUNT ═══════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Role Selection */}
              <div>
                <p className="text-sm font-medium text-[#0F172A] mb-3">I want to...</p>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard role="CUSTOMER" selected={selectedRole === 'CUSTOMER'} onClick={() => setValue('role', 'CUSTOMER')} icon={<Users className="w-5 h-5" />} title="Book Services" desc="Find & hire professionals" />
                  <RoleCard role="WORKER" selected={selectedRole === 'WORKER'} onClick={() => setValue('role', 'WORKER')} icon={<Briefcase className="w-5 h-5" />} title="Offer Services" desc="Start earning as a pro" />
                </div>
              </div>

              <Input label="Full Name" placeholder="Jean-Paul Dupont" autoComplete="name" error={errors.name?.message} leftIcon={<User className="w-4 h-4" />} {...register('name')} />
              <Input label="Email Address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} leftIcon={<Mail className="w-4 h-4" />} {...register('email')} />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                error={errors.password?.message}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={<button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                {...register('password')}
              />
              <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Repeat your password" error={errors.confirmPassword?.message} leftIcon={<Lock className="w-4 h-4" />} {...register('confirmPassword')} />

              {isWorker && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>Note:</strong> Worker profiles require admin approval before receiving bookings. You'll be notified within 24 hours.
                </div>
              )}

              <Button type="button" variant="accent" size="lg" className="w-full" onClick={goToStep2} rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isWorker ? 'Next — Build Your Profile' : 'Create Account'}
              </Button>

              <p className="text-xs text-center text-[#94A3B8]">
                By signing up you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#0F172A]">Terms</Link> and <Link href="/privacy" className="underline hover:text-[#0F172A]">Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════ STEP 2: PROFILE ═══════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-[#0F172A] text-lg">Build your profile</h2>
                <p className="text-sm text-[#64748B]">This is what customers see when they find you</p>
              </div>

              {/* Avatar + Cover */}
              <div className="relative">
                {/* Cover banner */}
                <div
                  className="h-28 rounded-2xl overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1E293B] cursor-pointer group relative"
                  onClick={() => !coverUploading && coverRef.current?.click()}
                >
                  {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    {coverUploading
                      ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                      : <><ImageIcon className="w-5 h-5 text-white/70 mb-1" /><span className="text-white/70 text-xs">Click to add cover photo</span></>
                    }
                  </div>
                </div>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

                {/* Avatar overlaid */}
                <div className="absolute -bottom-8 left-4">
                  <div
                    className="relative group w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-[#FACC15] cursor-pointer shadow-lg"
                    onClick={() => !avatarUploading && fileRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#0F172A] font-black text-xl">{initials}</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {avatarUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>

              <div className="pt-10 space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> WhatsApp / Phone Number</label>
                  <input className={inp} type="tel" placeholder="e.g. 52 123 456" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                  <p className="text-xs text-[#94A3B8] mt-1">Customers will see a direct WhatsApp button on your profile.</p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><Quote className="w-3.5 h-3.5" /> Tagline <span className="font-normal text-[#94A3B8]">(optional)</span></label>
                  <input className={inp} placeholder='e.g. "Your vision, our commitment!"' value={profileForm.tagline} maxLength={150} onChange={(e) => setProfileForm((f) => ({ ...f, tagline: e.target.value }))} />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">About You</label>
                  <textarea className={`${inp} resize-none`} rows={3} placeholder="Tell customers about your skills, experience and what makes you stand out..." value={profileForm.bio} maxLength={1000} onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))} />
                  <p className="text-xs text-[#94A3B8] mt-1">{profileForm.bio.length}/1000</p>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Your District</label>
                  <select className={inp} value={profileForm.location} onChange={(e) => setProfileForm((f) => ({ ...f, location: e.target.value }))}>
                    <option value="">Select your district...</option>
                    {MAURITIUS_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Experience + Response time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Years Experience</label>
                    <input className={inp} type="number" min="0" max="50" placeholder="0" value={profileForm.experienceYears} onChange={(e) => setProfileForm((f) => ({ ...f, experienceYears: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Response Time</label>
                    <select className={inp} value={profileForm.responseTime} onChange={(e) => setProfileForm((f) => ({ ...f, responseTime: e.target.value }))}>
                      <option value="Usually within 1 hour">Within 1 hour</option>
                      <option value="Usually within 2 hours">Within 2 hours</option>
                      <option value="Usually within a few hours">Within a few hours</option>
                      <option value="Usually within a day">Within a day</option>
                    </select>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Presentation Video <span className="font-normal text-[#94A3B8]">(optional)</span></label>
                  <input className={inp} type="url" placeholder="https://www.youtube.com/watch?v=..." value={profileForm.videoUrl} onChange={(e) => setProfileForm((f) => ({ ...f, videoUrl: e.target.value }))} />
                  <p className="text-xs text-[#94A3B8] mt-1">Paste a YouTube or Vimeo link to showcase your work.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-xl">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={goToStep3} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FACC15] text-[#0F172A] font-black rounded-xl hover:bg-[#F59E0B] transition-colors text-sm">
                  Next — Your Services <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ STEP 3: SERVICES ═══════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-[#0F172A] text-lg">Your services & portfolio</h2>
                <p className="text-sm text-[#64748B]">Select what you offer and upload work photos to stand out</p>
              </div>

              {/* Service selection */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Services You Offer</p>
                <p className="text-xs text-[#94A3B8] mb-3">Select all that apply — you can update this anytime</p>

                {serviceOptions.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {serviceOptions.map((svc) => {
                      const isSelected = selectedServices.some((s) => s.serviceId === svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => toggleService(svc)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
                            isSelected ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#0F172A]' : 'border-[#E2E8F0] hover:border-[#FACC15]/50 text-[#475569]'
                          )}
                        >
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', isSelected ? 'bg-[#FACC15]' : 'bg-[#F1F5F9]')}>
                            <ServiceIcon name={svc.icon} className={cn('w-3.5 h-3.5', isSelected ? 'text-[#0F172A]' : 'text-[#64748B]')} />
                          </div>
                          <span className="text-xs font-semibold leading-tight">{svc.name}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#FACC15] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-[#475569]">Set your rates</p>
                    {selectedServices.map((sel) => {
                      const svc = serviceOptions.find((s) => s.id === sel.serviceId);
                      if (!svc) return null;
                      return (
                        <div key={sel.serviceId} className="flex items-center gap-2 bg-white rounded-xl border border-[#E2E8F0] p-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#F1F5F9] flex items-center justify-center shrink-0">
                            <ServiceIcon name={svc.icon} className="w-3.5 h-3.5 text-[#475569]" />
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A] flex-1 min-w-0 truncate">{svc.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-[#94A3B8]">Rs</span>
                            <input
                              type="number" min="1" placeholder="Price" value={sel.price}
                              onChange={(e) => updateService(sel.serviceId, 'price', e.target.value)}
                              className="w-20 border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
                            />
                            <select
                              value={sel.pricingType}
                              onChange={(e) => updateService(sel.serviceId, 'pricingType', e.target.value)}
                              className="border border-[#E2E8F0] rounded-lg px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FACC15] bg-white"
                            >
                              <option value="FIXED">Fixed</option>
                              <option value="HOURLY">/hr</option>
                            </select>
                            <button type="button" onClick={() => toggleService(svc)} className="p-1 text-[#94A3B8] hover:text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Portfolio photos */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Portfolio Photos</p>
                  <span className="text-xs text-[#94A3B8]">{portfolioPhotos.length}/10 <span className="font-normal text-[#94A3B8]">optional</span></span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-3">Show your past work — before & after, completed projects</p>

                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioChange} />

                {portfolioPhotos.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    disabled={portfolioUploading}
                    className="w-full border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] rounded-xl p-6 text-center transition-colors disabled:opacity-50"
                  >
                    {portfolioUploading
                      ? <Loader2 className="w-6 h-6 text-[#94A3B8] mx-auto animate-spin" />
                      : <><ImageIcon className="w-6 h-6 text-[#CBD5E1] mx-auto mb-1" /><span className="text-xs text-[#94A3B8]">Upload work photos</span></>
                    }
                  </button>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {portfolioPhotos.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-[#F1F5F9]">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPortfolioPhotos((p) => p.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {portfolioPhotos.length < 10 && (
                      <button
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        disabled={portfolioUploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#E2E8F0] hover:border-[#FACC15] flex items-center justify-center disabled:opacity-50"
                      >
                        {portfolioUploading ? <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" /> : <Plus className="w-4 h-4 text-[#94A3B8]" />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-xl">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FACC15] text-[#0F172A] font-black rounded-xl hover:bg-[#F59E0B] transition-colors disabled:opacity-50 text-sm"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                    : <><CheckCircle className="w-4 h-4" /> Create My Account</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0F172A] font-semibold hover:text-[#FACC15] transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({ role, selected, onClick, icon, title, desc }: {
  role: string; selected: boolean; onClick: () => void;
  icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
        selected ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-card' : 'border-[#E2E8F0] hover:border-[#0F172A]/30 text-[#64748B]'
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', selected ? 'bg-[#FACC15]' : 'bg-[#F1F5F9]')}>
        <span className={selected ? 'text-[#0F172A]' : 'text-[#64748B]'}>{icon}</span>
      </div>
      <p className="font-bold text-sm">{title}</p>
      <p className={cn('text-xs', selected ? 'text-white/70' : 'text-[#94A3B8]')}>{desc}</p>
    </button>
  );
}
