'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Users, Briefcase } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const selectedRole = watch('role');

  async function onSubmit(data: RegisterForm) {
    const { confirmPassword, ...payload } = data;
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
