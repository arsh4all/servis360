'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>;
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success(`Welcome back, ${result.data.user.name.split(' ')[0]}!`);
      const role = result.data.user.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'WORKER') router.push('/worker');
      else router.push(callbackUrl);
      router.refresh();
    } else {
      toast.error(result.message || 'Login failed');
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
          <h1 className="text-2xl font-black text-[#0F172A]">Welcome back</h1>
          <p className="text-[#64748B] text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Your password"
              autoComplete="current-password"
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-[#0F172A]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[#64748B] hover:text-[#0F172A]">Forgot password?</Link>
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">Demo accounts</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Demo credentials */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 text-xs text-[#64748B] space-y-1">
            <p><span className="font-medium">Customer:</span> jean.paul@example.mu / Customer@123</p>
            <p><span className="font-medium">Worker:</span> amina.rashid@worker.mu / Worker@123</p>
            <p><span className="font-medium">Admin:</span> admin@servis360.mu / Admin@S3MU2024</p>
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#0F172A] font-semibold hover:text-[#FACC15]">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
