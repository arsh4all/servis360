'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TiltCard } from '@/components/ui/TiltCard';

type Worker = {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string;
  ratingAvg: number;
  totalReviews: number;
  isVerified: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  services: { id: string; price: number; pricingType: string; service: { name: string } }[];
};

export function TopWorkers({
  title = 'Top Rated Workers',
  subtitle = 'Hand-picked professionals with the highest ratings and reviews from our community.',
}: {
  title?: string;
  subtitle?: string;
} = {}) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workers?pageSize=6')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWorkers(d.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

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
            Browse all workers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Workers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 animate-pulse h-52" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#64748B] text-sm">No workers available yet.</p>
            <Link href="/register" className="mt-3 inline-block text-sm font-semibold text-[#FACC15] underline">
              Become the first professional
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WorkerCard({ worker }: { worker: Worker }) {
  const initials = worker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const minPrice = worker.services.length > 0
    ? Math.min(...worker.services.map((s) => s.price))
    : null;

  const primaryService = worker.services[0]?.service.name ?? null;
  const pricingType = worker.services[0]?.pricingType ?? 'FIXED';

  return (
    <TiltCard className="p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-[#0F172A] flex items-center justify-center"
          style={{ transform: 'translateZ(8px)' }}
        >
          {worker.avatarUrl ? (
            <img src={worker.avatarUrl} alt={worker.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#FACC15] font-bold text-sm">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-bold text-[#0F172A] truncate">{worker.name}</p>
            {worker.isVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>
          {primaryService && (
            <p className="text-sm text-[#64748B]">{primaryService}</p>
          )}
        </div>

        {worker.isFeatured && (
          <Badge
            variant="accent"
            size="sm"
            className="shrink-0"
            style={{ transform: 'translateZ(4px)' }}
          >
            Top
          </Badge>
        )}
      </div>

      {/* Rating */}
      {worker.totalReviews > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
          <span className="font-bold text-[#0F172A] text-sm">{worker.ratingAvg.toFixed(1)}</span>
          <span className="text-xs text-[#64748B]">({worker.totalReviews} reviews)</span>
        </div>
      )}

      {/* Location + availability */}
      <div className="flex items-center gap-3 mb-4">
        {worker.location && (
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <MapPin className="w-3.5 h-3.5" />
            {worker.location}
          </div>
        )}
        {worker.isAvailable && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        )}
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <div style={{ transform: 'translateZ(4px)' }}>
          {minPrice !== null ? (
            <>
              <span className="text-xs text-[#64748B]">From </span>
              <span className="font-black text-lg text-[#0F172A]">Rs {minPrice.toLocaleString()}</span>
              <span className="text-xs text-[#64748B] ml-1">{pricingType === 'HOURLY' ? '/hr' : ''}</span>
            </>
          ) : (
            <span className="text-sm text-[#64748B]">Price on request</span>
          )}
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
