'use client';

import { useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Users, Briefcase, Camera, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (searchParams.get('role') as 'CUSTOMER' | 'WORKER') || 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');

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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
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
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, ...(avatarUrl ? { avatarUrl } : {}) }),
    });

    const result = await res.json();

    if (result.success) {
      toast.success(`Welcome to Servis360.mu, ${result.data.user.name.split(' ')[0]}!`);
      const role = result.data.user.role;
      if (role === 'WORKER') router.push('/worker');
      else router.push('/dashboard');
      router.refresh();
    } else {
      toast.error(result.message || 'Registration failed');
    }
  }

  const nameVal = watch('name');
  const initials = nameVal?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

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
              <RoleCard
                role="CUSTOMER"
                selected={selectedRole === 'CUSTOMER'}
                onClick={() => setValue('role', 'CUSTOMER')}
                icon={<Users className="w-5 h-5" />}
                title="Book Services"
                desc="Find & hire professionals"
              />
              <RoleCard
                role="WORKER"
                selected={selectedRole === 'WORKER'}
                onClick={() => setValue('role', 'WORKER')}
                icon={<Briefcase className="w-5 h-5" />}
                title="Offer Services"
                desc="Start earning as a pro"
              />
            </div>
          </div>

          {/* Photo Upload — only for workers */}
          {selectedRole === 'WORKER' && (
            <div className="mb-6 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Profile Photo</p>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
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
                    {uploading
                      ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                      : <Camera className="w-5 h-5 text-white" />
                    }
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {avatarUrl ? (
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">Photo uploaded!</span>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-[#0F172A] mb-1">Add a profile photo</p>
                  )}
                  <p className="text-xs text-[#64748B] mb-2 leading-relaxed">
                    Workers with photos get <strong>3x more bookings</strong>. Optional — you can add it later.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-semibold text-[#FACC15] hover:text-[#F59E0B] underline disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jean-Paul Dupont"
              autoComplete="name"
              error={errors.name?.message}
              leftIcon={<User className="w-4 h-4" />}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('confirmPassword')}
            />

            {selectedRole === 'WORKER' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Note:</strong> Worker profiles require admin approval before you can receive bookings.
                You'll be notified within 24 hours.
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>

            <p className="text-xs text-center text-[#94A3B8]">
              By signing up you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#0F172A]">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-[#0F172A]">Privacy Policy</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0F172A] font-semibold hover:text-[#FACC15] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  role, selected, onClick, icon, title, desc,
}: {
  role: string; selected: boolean; onClick: () => void;
  icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
        selected
          ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-card'
          : 'border-[#E2E8F0] hover:border-[#0F172A]/30 text-[#64748B]'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        selected ? 'bg-[#FACC15]' : 'bg-[#F1F5F9]'
      )}>
        <span className={selected ? 'text-[#0F172A]' : 'text-[#64748B]'}>{icon}</span>
      </div>
      <p className="font-bold text-sm">{title}</p>
      <p className={cn('text-xs', selected ? 'text-white/70' : 'text-[#94A3B8]')}>{desc}</p>
    </button>
  );
}
