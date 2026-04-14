'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RatingDisplay } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { TiltCard } from '@/components/ui/TiltCard';

const WORKERS = [
  {
    id: '1',
    name: 'Amina Rashid',
    role: 'Professional Cleaner',
    location: 'Port Louis',
    rating: 4.9,
    reviews: 47,
    price: 350,
    pricingType: 'FIXED',
    isVerified: true,
    initials: 'AR',
    services: ['Cleaning'],
  },
  {
    id: '2',
    name: 'Ravi Sharma',
    role: 'Certified Electrician',
    location: 'Curepipe',
    rating: 4.8,
    reviews: 63,
    price: 500,
    pricingType: 'HOURLY',
    isVerified: true,
    initials: 'RS',
    services: ['Electrician'],
  },
  {
    id: '3',
    name: 'Sarah Mootoosamy',
    role: 'Licensed Plumber',
    location: 'Quatre Bornes',
    rating: 4.7,
    reviews: 38,
    price: 450,
    pricingType: 'HOURLY',
    isVerified: true,
    initials: 'SM',
    services: ['Plumbing'],
  },
  {
    id: '4',
    name: 'Kevin Lee',
    role: 'CCTV Specialist',
    location: 'Rose Hill',
    rating: 4.9,
    reviews: 29,
    price: 2500,
    pricingType: 'FIXED',
    isVerified: true,
    initials: 'KL',
    services: ['CCTV Installation'],
  },
  {
    id: '5',
    name: 'Marie-Claire Labelle',
    role: 'Experienced Nanny',
    location: 'Beau Bassin',
    rating: 5.0,
    reviews: 52,
    price: 400,
    pricingType: 'FIXED',
    isVerified: true,
    initials: 'MC',
    services: ['Nanny'],
  },
  {
    id: '6',
    name: 'Devika Patel',
    role: 'Elderly Care Specialist',
    location: 'Vacoas',
    rating: 4.8,
    reviews: 71,
    price: 450,
    pricingType: 'FIXED',
    isVerified: true,
    initials: 'DP',
    services: ['Elderly Care'],
  },
];

export function TopWorkers() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[#FACC15] font-semibold text-sm uppercase tracking-wider mb-2">
              Top Professionals
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
              Top Rated Workers
            </h2>
            <p className="text-[#64748B] mt-2 max-w-md">
              Hand-picked professionals with the highest ratings and reviews from our community.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#FACC15] transition-colors shrink-0"
          >
            Browse all workers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Workers Scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKERS.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkerCard({ worker }: { worker: typeof WORKERS[0] }) {
  return (
    <TiltCard className="p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar — extra z-depth via translateZ so it "pops" toward viewer */}
        <div
          className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-[#FACC15] font-bold text-sm shrink-0"
          style={{ transform: 'translateZ(8px)' }}
        >
          {worker.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-bold text-[#0F172A] truncate">{worker.name}</p>
            {worker.isVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-[#64748B]">{worker.role}</p>
        </div>

        <Badge
          variant="accent"
          size="sm"
          className="shrink-0"
          style={{ transform: 'translateZ(4px)' }}
        >
          Featured
        </Badge>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <RatingDisplay rating={worker.rating} count={worker.reviews} size="sm" />
      </div>

      {/* Location & Service */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <MapPin className="w-3.5 h-3.5" />
          {worker.location}
        </div>
        <Badge variant="default" size="sm">{worker.services[0]}</Badge>
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <div style={{ transform: 'translateZ(4px)' }}>
          <span className="font-black text-lg text-[#0F172A]">
            Rs {worker.price.toLocaleString()}
          </span>
          <span className="text-xs text-[#64748B] ml-1">
            {worker.pricingType === 'HOURLY' ? '/hr' : '/session'}
          </span>
        </div>
        <Link href={`/workers/${worker.id}`} style={{ transform: 'translateZ(6px)' }}>
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </Link>
      </div>
    </TiltCard>
  );
}
