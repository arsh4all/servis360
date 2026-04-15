'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Star, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTilt } from '@/hooks/useTilt';

const POPULAR_SEARCHES = ['Cleaning', 'Electrician', 'Plumbing', 'Nanny', 'CCTV'];

export function HeroSection({
  badge = 'Trusted by 5,000+ homeowners in Mauritius',
  title = 'Find trusted help for your home & family',
  subtitle = 'Book verified cleaning, electrical, plumbing, childcare, and elderly care services. Rated workers, secure payments — peace of mind guaranteed.',
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
} = {}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Independent tilt instance for each hero card
  const mainCard  = useTilt({ maxTilt: 6,  scale: 1.02, gloss: true,  perspective: 900 });
  const badgeCard = useTilt({ maxTilt: 10, scale: 1.06, gloss: false, perspective: 600 });
  const confirmCard = useTilt({ maxTilt: 8, scale: 1.05, gloss: true,  perspective: 700 });
  const kevinCard = useTilt({ maxTilt: 8,  scale: 1.05, gloss: true,  perspective: 700 });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/services?search=${encodeURIComponent(query)}`);
    } else {
      router.push('/services');
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden min-h-[92vh] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FACC15]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-white">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-[#FACC15]" />
              <span className="text-[#FACC15] text-sm font-medium">{badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              {title}
            </h1>

            <p className="text-[#94A3B8] text-lg leading-relaxed mb-8 max-w-lg">
              {subtitle}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-soft max-w-xl">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-[#64748B] shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-[#0F172A] placeholder:text-[#94A3B8] outline-none text-sm bg-transparent"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-1 px-3 border-l border-[#E2E8F0]">
                  <MapPin className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm text-[#64748B]">Mauritius</span>
                </div>
                <Button type="submit" variant="accent" size="md" className="shrink-0">
                  Search
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 mb-10">
              <span className="text-[#64748B] text-sm">Popular:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => router.push(`/services?search=${s}`)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#0F172A] text-white text-xs font-medium transition-colors border border-white/20"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6">
              <TrustStat icon={<Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />} label="4.9/5 avg rating" />
              <TrustStat icon={<Shield className="w-4 h-4 text-[#FACC15]" />} label="Verified workers" />
              <TrustStat icon={<CheckCircle className="w-4 h-4 text-[#FACC15]" />} label="Secure booking" />
            </div>
          </div>

          {/* Right: Visual Cards */}
          <div className="relative hidden lg:block">

            {/* ── Main Amina Rashid card ── */}
            <div
              ref={mainCard.ref}
              style={mainCard.cardStyle}
              className="relative bg-white rounded-3xl p-6 shadow-soft max-w-sm mx-auto overflow-hidden cursor-default"
            >
              {/* Gloss overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 rounded-3xl pointer-events-none select-none"
                style={mainCard.glossStyle}
              />
              {/* Card content */}
              <div className="relative z-0" style={mainCard.innerStyle}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center shrink-0"
                    style={{ transform: 'translateZ(8px)' }}
                  >
                    <span className="text-[#FACC15] text-lg">✨</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A]">Amina Rashid</p>
                    <p className="text-sm text-[#64748B]">Professional Cleaner</p>
                  </div>
                  <div
                    className="ml-auto bg-[#FACC15] text-[#0F172A] rounded-full px-2 py-0.5 text-xs font-bold shrink-0"
                    style={{ transform: 'translateZ(6px)' }}
                  >
                    ✓ Verified
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                  ))}
                  <span className="text-sm font-bold text-[#0F172A] ml-1">5.0</span>
                  <span className="text-xs text-[#64748B]">(47 reviews)</span>
                </div>

                <p className="text-sm text-[#64748B] mb-4">
                  "Exceptional service! House was spotless and she was very professional."
                </p>

                <div className="flex items-center justify-between">
                  <div style={{ transform: 'translateZ(4px)' }}>
                    <span className="text-2xl font-black text-[#0F172A]">Rs 350</span>
                    <span className="text-sm text-[#64748B]">/session</span>
                  </div>
                  <button
                    className="bg-[#0F172A] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1E293B] transition-colors"
                    style={{ transform: 'translateZ(10px)' }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            {/* ── 200+ Workers badge (top-right) ── */}
            <div
              ref={badgeCard.ref}
              style={{
                ...badgeCard.cardStyle,
                // Override the dynamic shadow with a yellow-tinted one
                boxShadow: badgeCard.tilt.isHovered
                  ? `${badgeCard.tilt.rotateY * 1.5}px ${-badgeCard.tilt.rotateX * 1.5}px 24px rgba(250,204,21,0.4), 0 4px 16px rgba(250,204,21,0.25)`
                  : '0 2px 8px rgba(250,204,21,0.25)',
              }}
              className="absolute -top-4 -right-4 bg-[#FACC15] rounded-2xl p-3 cursor-default overflow-hidden"
            >
              <div className="relative z-0" style={badgeCard.innerStyle}>
                <p className="text-[#0F172A] font-black text-lg leading-none">200+</p>
                <p className="text-[#0F172A]/70 text-xs font-medium">Workers</p>
              </div>
            </div>

            {/* ── Booking Confirmed (bottom-left) ── */}
            <div
              ref={confirmCard.ref}
              style={confirmCard.cardStyle}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 overflow-hidden cursor-default"
            >
              {/* Gloss overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 rounded-2xl pointer-events-none select-none"
                style={confirmCard.glossStyle}
              />
              <div className="relative z-0 flex items-center gap-2" style={confirmCard.innerStyle}>
                <div
                  className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0"
                  style={{ transform: 'translateZ(6px)' }}
                >
                  <CheckCircle className="w-4 h-4 text-[#FACC15]" />
                </div>
                <div>
                  <p className="text-[#0F172A] font-bold text-sm leading-none">Booking Confirmed</p>
                  <p className="text-[#64748B] text-xs">Today, 9:00 AM</p>
                </div>
              </div>
            </div>

            {/* ── Kevin Lee mini-card (left) ── */}
            <div
              ref={kevinCard.ref}
              style={kevinCard.cardStyle}
              className="absolute top-1/2 -left-8 -translate-y-1/2 bg-white rounded-2xl p-3 overflow-hidden cursor-default"
            >
              {/* Gloss overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 rounded-2xl pointer-events-none select-none"
                style={kevinCard.glossStyle}
              />
              <div className="relative z-0 flex items-center gap-2" style={kevinCard.innerStyle}>
                <div
                  className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-[#FACC15] text-xs font-bold shrink-0"
                  style={{ transform: 'translateZ(6px)' }}
                >
                  KL
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Kevin Lee</p>
                  <p className="text-xs text-[#64748B]">CCTV Expert</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-[#CBD5E1]">{label}</span>
    </div>
  );
}
