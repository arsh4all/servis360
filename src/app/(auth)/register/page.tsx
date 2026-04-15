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
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  Users, Briefcase, Camera, Loader2, CheckCircle, X,
  Sparkles, Zap, Droplets, Baby, Heart, Wrench,
  Scissors, Leaf, ShieldCheck, Hammer, Wind, type LucideProps,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Map Lucide icon names → actual icon components
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Sparkles, Zap, Droplets, Camera, Baby, Heart,
  Wrench, Scissors, Leaf, ShieldCheck, Hammer, Wind,
};

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <Wrench className={className} />;
  return <Icon className={className} />;
}

const registerSchema = z.object({
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

type RegisterForm = z.infer<typeof registerSchema>;
type ServiceOption = { id: string; name: string; icon: string; description: string | null };
type SelectedService = { serviceId: string; price: string; pricingType: 'FIXED' | 'HOURLY' };

export default function RegisterPage() {
  return <Suspense><RegisterPageInner /></Suspense>;
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  // Photo upload
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Service selection
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (searchParams.get('role') as 'CUSTOMER' | 'WORKER') || 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');
  const nameVal = watch('name');
  const initials = nameVal?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Fetch services when worker role is selected
  useEffect(() => {
    if (selectedRole === 'WORKER' && serviceOptions.length === 0) {
      fetch('/api/services')
        .then((r) => r.json())
        .then((d) => { if (d.success) setServiceOptions(d.data); });
    }
  }, [selectedRole]);

  const toggleService = (svc: ServiceOption) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.serviceId === svc.id);
      if (exists) return prev.filter((s) => s.serviceId !== svc.id);
      return [...prev, { serviceId: svc.id, price: '', pricingType: 'FIXED' }];
    });
  };

  const updateService = (serviceId: string, key: 'price' | 'pricingType', val: string) => {
    setSelectedServices((prev) =>
      prev.map((s) => s.serviceId === serviceId ? { ...s, [key]: val } : s)
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setAvatarPreview(URL.createObjectURL(file));

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      toast.error('Photo upload not configured — you can add it later in settings.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'servis360/workers');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvatarUrl(data.secure_url);
      setAvatarPreview(data.secure_url);
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Upload failed — you can add a photo later in settings.');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  async function onSubmit(data: RegisterForm) {
    const { confirmPassword, ...payload } = data;

    // Validate services have prices
    const services = selectedServices.filter((s) => s.price && Number(s.price) > 0);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...(avatarUrl ? { avatarUrl } : {}),
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <Image src="/logo.png" alt="Servis360.mu" width={220} height={80} className="h-20 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-black text-[#0F172A]">Create your account</h1>
          <p className="text-[#64748B] text-sm mt-1">Join Mauritius's trusted home service platform</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-card">
          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#0F172A] mb-3">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard role="CUSTOMER" selected={selectedRole === 'CUSTOMER'} onClick={() => setValue('role', 'CUSTOMER')} icon={<Users className="w-5 h-5" />} title="Book Services" desc="Find & hire professionals" />
              <RoleCard role="WORKER" selected={selectedRole === 'WORKER'} onClick={() => setValue('role', 'WORKER')} icon={<Briefcase className="w-5 h-5" />} title="Offer Services" desc="Start earning as a pro" />
            </div>
          </div>

          {/* ─── Worker-only sections ─── */}
          {selectedRole === 'WORKER' && (
            <>
              {/* Photo Upload */}
              <div className="mb-5 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Profile Photo</p>
                <div className="flex items-center gap-4">
                  <div
                    className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-[#E2E8F0] shrink-0 cursor-pointer bg-[#F1F5F9]"
                    onClick={() => !uploading && fileRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FACC15] text-[#0F172A] font-black text-lg">
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {avatarUrl ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold">Photo uploaded!</span>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-[#0F172A] mb-1">Add a profile photo</p>
                    )}
                    <p className="text-xs text-[#64748B] mb-2">Workers with photos get <strong>3x more bookings</strong>.</p>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs font-semibold text-[#FACC15] hover:text-[#F59E0B] underline disabled:opacity-50">
                      {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                    </button>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Service Selection */}
              <div className="mb-5 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Services You Offer</p>
                <p className="text-xs text-[#94A3B8] mb-3">Select all that apply — you can update this later</p>

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
                            isSelected
                              ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#0F172A]'
                              : 'border-[#E2E8F0] hover:border-[#FACC15]/50 text-[#475569]'
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            isSelected ? 'bg-[#FACC15]' : 'bg-[#F1F5F9]'
                          )}>
                            <ServiceIcon name={svc.icon} className={cn('w-3.5 h-3.5', isSelected ? 'text-[#0F172A]' : 'text-[#64748B]')} />
                          </div>
                          <span className="text-xs font-semibold leading-tight">{svc.name}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#FACC15] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Price inputs for selected services */}
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
                              type="number"
                              min="1"
                              placeholder="Price"
                              value={sel.price}
                              onChange={(e) => updateService(sel.serviceId, 'price', e.target.value)}
                              className="w-20 border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
                            />
                            <select
                              value={sel.pricingType}
                              onChange={(e) => updateService(sel.serviceId, 'pricingType', e.target.value)}
                              className="border border-[#E2E8F0] rounded-lg px-1.5 py-1 text-xs text-[#475569] focus:outline-none focus:ring-1 focus:ring-[#FACC15] bg-white"
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
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {selectedRole === 'WORKER' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Note:</strong> Worker profiles require admin approval before you can receive bookings. You'll be notified within 24 hours.
              </div>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full" loading={isSubmitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>

            <p className="text-xs text-center text-[#94A3B8]">
              By signing up you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#0F172A]">Terms</Link> and <Link href="/privacy" className="underline hover:text-[#0F172A]">Privacy Policy</Link>
            </p>
          </form>
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
