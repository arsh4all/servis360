'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

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
  const [tab, setTab] = useState<'email' | 'phone'>('email');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // Set up invisible reCAPTCHA when phone tab is active
  useEffect(() => {
    if (tab !== 'phone') return;
    const setupRecaptcha = async () => {
      try {
        const { firebaseAuth } = await import('@/lib/firebase-client');
        const { RecaptchaVerifier } = await import('firebase/auth');
        if (recaptchaVerifierRef.current) return;
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          firebaseAuth,
          'recaptcha-container',
          { size: 'invisible' }
        );
      } catch { /* Firebase not configured yet */ }
    };
    setupRecaptcha();
  }, [tab]);

  const handleSendOtp = async () => {
    if (!phone.trim()) { toast.error('Enter your phone number'); return; }
    const fullPhone = phone.startsWith('+') ? phone : `+230${phone.replace(/\s/g, '')}`;
    setSendingOtp(true);
    try {
      const { firebaseAuth } = await import('@/lib/firebase-client');
      const { signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          firebaseAuth,
          'recaptcha-container',
          { size: 'invisible' }
        );
      }

      const result = await signInWithPhoneNumber(firebaseAuth, fullPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success(`Code sent to ${fullPhone}`);
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number format'
        : err?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Failed to send code. Check your number and try again.';
      toast.error(msg);
      recaptchaVerifierRef.current = null;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) return;
    setVerifyingOtp(true);
    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}!`);
        const role = data.data.user.role;
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'WORKER') router.push('/worker');
        else router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(data.message || 'Login failed');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch {
      toast.error('Incorrect code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
    }
  };

  async function onEmailSubmit(data: LoginForm) {
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

          {/* Tab switcher */}
          <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('email'); setOtpSent(false); setOtp(['','','','','','']); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                tab === 'email' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              )}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setTab('phone')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                tab === 'phone' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              )}
            >
              <Phone className="w-4 h-4" /> Phone OTP
            </button>
          </div>

          {/* ── Email / Password ── */}
          {tab === 'email' && (
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
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
          )}

          {/* ── Phone OTP ── */}
          {tab === 'phone' && (
            <div className="space-y-5">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#475569] font-semibold shrink-0">
                        🇲🇺 +230
                      </div>
                      <input
                        type="tel"
                        placeholder="52 123 456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                        className="flex-1 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] text-[#0F172A] placeholder:text-[#94A3B8]"
                      />
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1.5">Enter the phone number linked to your account</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !phone.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] disabled:opacity-50 transition-colors text-sm"
                  >
                    {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : <><Phone className="w-4 h-4" /> Send Verification Code</>}
                  </button>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    A 6-digit code will be sent to your Mauritius phone number via SMS.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-[#0F172A]">Enter the 6-digit code</p>
                    <p className="text-sm text-[#64748B] mt-1">Sent to +230 {phone.replace(/\s/g, '')}</p>
                  </div>

                  {/* OTP boxes */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpInputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={cn(
                          'w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-colors',
                          digit ? 'border-[#FACC15] bg-[#FFFBEB] text-[#0F172A]' : 'border-[#E2E8F0] text-[#0F172A]',
                          'focus:border-[#FACC15]'
                        )}
                      />
                    ))}
                  </div>

                  {verifyingOtp && (
                    <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(['','','','','','']); recaptchaVerifierRef.current = null; }}
                    className="w-full text-xs text-[#64748B] hover:text-[#0F172A] text-center"
                  >
                    Wrong number? Go back
                  </button>
                </>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">OR</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Demo credentials */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 text-xs text-[#64748B] space-y-1">
            <p className="font-semibold text-[#0F172A] text-sm mb-2">Demo Accounts:</p>
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

      {/* Invisible reCAPTCHA container — required by Firebase */}
      <div id="recaptcha-container" />
    </div>
  );
}
