import Link from 'next/link';
import { Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PremiumBanner() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FACC15]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/40 rounded-full px-4 py-1.5 mb-6">
                <Crown className="w-4 h-4 text-[#FACC15]" />
                <span className="text-[#FACC15] text-sm font-semibold">Premium Plan</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Get More Bookings with{' '}
                <span className="text-[#FACC15]">Premium</span>
              </h2>
              <p className="text-[#94A3B8] text-lg mb-8">
                Upgrade to Premium and stand out from the crowd. Get priority placement, faster
                response tools, and featured listings — all for just Rs 100/month.
              </p>

              <Link href="/register?plan=premium">
                <Button variant="accent" size="lg" leftIcon={<Crown className="w-5 h-5" />}>
                  Upgrade to Premium
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-[#64748B] text-sm mt-3">
                Cancel anytime · No commitment required
              </p>
            </div>

            {/* Right */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Star className="w-5 h-5 text-[#FACC15]" />,
                  title: 'Priority Placement',
                  desc: 'Appear at the top of search results',
                },
                {
                  icon: <Zap className="w-5 h-5 text-[#FACC15]" />,
                  title: 'Faster Responses',
                  desc: 'Get notified instantly for new requests',
                },
                {
                  icon: <Crown className="w-5 h-5 text-[#FACC15]" />,
                  title: 'Featured Badge',
                  desc: 'Premium badge on your profile',
                },
                {
                  icon: (
                    <span className="text-[#FACC15] font-black text-lg leading-none">Rs</span>
                  ),
                  title: 'Only Rs 100/mo',
                  desc: 'Affordable subscription for workers',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FACC15]/20 flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-[#94A3B8] text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
