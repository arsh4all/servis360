'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

const SERVICES = [
  { name: 'Cleaning', slug: 'cleaning', icon: 'Sparkles', workers: 42, color: 'from-blue-50 to-blue-100/50' },
  { name: 'Electrician', slug: 'electrician', icon: 'Zap', workers: 28, color: 'from-yellow-50 to-yellow-100/50' },
  { name: 'Plumbing', slug: 'plumbing', icon: 'Droplets', workers: 31, color: 'from-cyan-50 to-cyan-100/50' },
  { name: 'CCTV Installation', slug: 'cctv-installation', icon: 'Camera', workers: 19, color: 'from-slate-50 to-slate-100/50' },
  { name: 'Nanny', slug: 'nanny', icon: 'Baby', workers: 24, color: 'from-pink-50 to-pink-100/50' },
  { name: 'Elderly Care', slug: 'elderly-care', icon: 'Heart', workers: 17, color: 'from-red-50 to-red-100/50' },
];

export function PopularServices() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[#FACC15] font-semibold text-sm uppercase tracking-wider mb-2">
              What We Offer
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
              Popular Services
            </h2>
            <p className="text-[#64748B] mt-2 max-w-md">
              Book from our wide range of professional home services — all vetted and insured.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#FACC15] transition-colors shrink-0"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services?category=${service.slug}`}
              className={`group bg-gradient-to-br ${service.color} rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200`}
            >
              <ServiceIcon icon={service.icon} size="md" containerClassName="mb-4 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-[#0F172A] text-sm mb-1">{service.name}</p>
              <p className="text-xs text-[#64748B]">{service.workers} workers</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
