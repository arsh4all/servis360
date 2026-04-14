import Link from 'next/link';
import { CheckCircle, ArrowRight, Star, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BecomeWorkerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#0F172A] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-4 h-4 text-[#FACC15]" />
            <span className="text-[#FACC15] text-sm font-medium">Join 200+ Professionals</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Turn Your Skills Into
            <span className="text-[#FACC15]"> Consistent Income</span>
          </h1>
          <p className="text-[#94A3B8] text-xl mb-8 max-w-2xl mx-auto">
            Join Servis360.mu and connect with thousands of homeowners in Mauritius looking for
            exactly what you do best.
          </p>
          <Link href="/register?role=WORKER">
            <Button variant="accent" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Apply as a Worker
            </Button>
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-[#0F172A] text-center mb-12">Why Join Servis360.mu?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
              title: 'More Bookings',
              desc: 'Get discovered by customers actively searching for your services in Mauritius.',
              color: 'bg-emerald-50',
            },
            {
              icon: <Shield className="w-6 h-6 text-blue-600" />,
              title: 'Secure Payments',
              desc: 'Get paid safely through our platform. No chasing clients for payment.',
              color: 'bg-blue-50',
            },
            {
              icon: <Star className="w-6 h-6 text-yellow-600" />,
              title: 'Build Your Reputation',
              desc: 'Collect real reviews that help you grow and attract more clients.',
              color: 'bg-yellow-50',
            },
          ].map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center mb-4`}>
                {b.icon}
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">{b.title}</h3>
              <p className="text-[#64748B] text-sm">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-16 bg-[#0F172A] rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-black mb-8 text-center">Getting Started Is Simple</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and fill in your skills, experience, and service rates.' },
              { step: '02', title: 'Get Approved', desc: 'Our team reviews your application within 24 hours.' },
              { step: '03', title: 'Start Earning', desc: 'Accept bookings, complete jobs, and grow your income.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-[#0F172A] font-black flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-[#94A3B8] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/register">
              <Button variant="accent" size="lg">Apply Now — It's Free</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
