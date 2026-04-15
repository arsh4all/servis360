'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    name: 'Cleaning',
    slug: 'cleaning',
    workers: 42,
    bg: 'bg-blue-50',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=480&q=80',
  },
  {
    name: 'Electrician',
    slug: 'electrician',
    workers: 28,
    bg: 'bg-yellow-50',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=480&q=80',
  },
  {
    name: 'Plumbing',
    slug: 'plumbing',
    workers: 31,
    bg: 'bg-cyan-50',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=480&q=80',
  },
  {
    name: 'CCTV Installation',
    slug: 'cctv-installation',
    workers: 19,
    bg: 'bg-slate-50',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=480&q=80',
  },
  {
    name: 'Nanny',
    slug: 'nanny',
    workers: 24,
    bg: 'bg-purple-50',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=480&q=80',
  },
  {
    name: 'Elderly Care',
    slug: 'elderly-care',
    workers: 17,
    bg: 'bg-rose-50',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=480&q=80',
  },
];

export function PopularServices({
  title = 'Popular Services',
  subtitle = 'Book from our wide range of professional home services — all vetted and insured.',
}: {
  title?: string;
  subtitle?: string;
} = {}) {
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
              {title}
            </h2>
            <p className="text-[#64748B] mt-2 max-w-md">
              {subtitle}
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
              className={`group ${service.bg} rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out`}
            >
              {/* Image */}
              <div className="overflow-hidden aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 ease-out"
                />
              </div>

              {/* Text */}
              <div className="p-3 pb-4">
                <p className="font-bold text-[#0F172A] text-sm leading-tight mb-1">{service.name}</p>
                <p className="text-xs text-[#64748B]">{service.workers} workers</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
