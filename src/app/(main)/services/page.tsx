'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Star, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { MAURITIUS_DISTRICTS } from '@/lib/districts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay } from '@/components/ui/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TiltCard } from '@/components/ui/TiltCard';

const CATEGORIES = [
  { label: 'All Services', slug: '' },
  { label: 'Cleaning', slug: 'cleaning' },
  { label: 'Electrician', slug: 'electrician' },
  { label: 'Plumbing', slug: 'plumbing' },
  { label: 'CCTV Installation', slug: 'cctv-installation' },
  { label: 'Nanny', slug: 'nanny' },
  { label: 'Elderly Care', slug: 'elderly-care' },
];

export default function ServicesPage() {
  return (
    <Suspense>
      <ServicesPageInner />
    </Suspense>
  );
}

function ServicesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('service', category);
      if (district) params.set('district', district);
      if (minRating > 0) params.set('minRating', String(minRating));
      if (maxPrice < 99999) params.set('maxPrice', String(maxPrice));
      if (availableOnly) params.set('available', 'true');

      const res = await fetch(`/api/workers?${params}`);
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data.items);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, district, minRating, maxPrice, availableOnly]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Find a Professional
          </h1>
          <p className="text-[#94A3B8]">
            Browse {total} verified professionals across Mauritius
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search services or worker name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-[#FACC15] text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>
            <Button
              variant="accent"
              onClick={() => fetchWorkers()}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0F172A]">Filters</h3>
                <button
                  onClick={() => {
                    setCategory('');
                    setDistrict('');
                    setMinRating(0);
                    setMaxPrice(99999);
                    setAvailableOnly(false);
                  }}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#0F172A] mb-3">Service Category</p>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        category === cat.slug
                          ? 'bg-[#0F172A] text-white font-medium'
                          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> District
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setDistrict('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      district === ''
                        ? 'bg-[#0F172A] text-white font-medium'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    All Districts
                  </button>
                  {MAURITIUS_DISTRICTS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDistrict(d)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        district === d
                          ? 'bg-[#0F172A] text-white font-medium'
                          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Rating */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#0F172A] mb-3">Minimum Rating</p>
                <div className="space-y-1">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                        minRating === r
                          ? 'bg-[#0F172A] text-white'
                          : 'text-[#64748B] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      {r === 0 ? 'Any Rating' : `${r}+ stars`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Only */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setAvailableOnly((v) => !v)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      availableOnly ? 'bg-[#0F172A] border-[#0F172A]' : 'border-[#E2E8F0]'
                    }`}
                  >
                    {availableOnly && <CheckCircle className="w-3 h-3 text-[#FACC15]" />}
                  </div>
                  <span className="text-sm text-[#0F172A]">Available now only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Worker Grid */}
          <div className="flex-1">
            {/* Results count + active filter chips */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <p className="text-sm text-[#64748B]">
                {loading ? 'Searching...' : `${total} professional${total !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex flex-wrap gap-2">
                {category && (
                  <button
                    onClick={() => setCategory('')}
                    className="flex items-center gap-1 text-xs font-semibold bg-[#0F172A] text-white px-3 py-1.5 rounded-full hover:bg-[#1E293B]"
                  >
                    {CATEGORIES.find((c) => c.slug === category)?.label ?? category}
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                )}
                {district && (
                  <button
                    onClick={() => setDistrict('')}
                    className="flex items-center gap-1 text-xs font-semibold bg-[#FACC15] text-[#0F172A] px-3 py-1.5 rounded-full hover:bg-[#F59E0B]"
                  >
                    <MapPin className="w-3 h-3" />
                    {district}
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" label="Finding professionals..." />
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
                <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#64748B]" />
                </div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-2">No professionals found</h3>
                <p className="text-[#64748B] text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {workers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkerCard({ worker }: { worker: any }) {
  const minPrice = worker.services.length > 0
    ? Math.min(...worker.services.map((s: any) => s.price))
    : null;

  return (
    <TiltCard className="p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div style={{ transform: 'translateZ(10px)' }} className="shrink-0">
          <Avatar name={worker.name} src={worker.avatarUrl} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="font-bold text-[#0F172A]">{worker.name}</p>
            {worker.isVerified && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B] mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {worker.location}
          </div>
          <RatingDisplay rating={worker.ratingAvg} count={worker.totalReviews} size="sm" />
        </div>
        {worker.isFeatured && (
          <Badge variant="accent" size="sm" style={{ transform: 'translateZ(6px)' }}>
            Top
          </Badge>
        )}
      </div>

      {/* Bio */}
      {worker.bio && (
        <p className="text-sm text-[#64748B] mb-3 line-clamp-2">{worker.bio}</p>
      )}

      {/* Services */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {worker.services.slice(0, 3).map((s: any) => (
          <Badge key={s.id} variant="default" size="sm">
            {s.service.name}
          </Badge>
        ))}
        {worker.services.length > 3 && (
          <Badge variant="default" size="sm">+{worker.services.length - 3}</Badge>
        )}
      </div>

      {/* Experience */}
      {worker.experienceYears > 0 && (
        <p className="text-xs text-[#64748B] mb-4">
          {worker.experienceYears} yr{worker.experienceYears !== 1 ? 's' : ''} experience
        </p>
      )}

      {/* Price & CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <div style={{ transform: 'translateZ(4px)' }}>
          {minPrice !== null ? (
            <>
              <span className="text-xs text-[#64748B]">From </span>
              <span className="font-black text-[#0F172A]">Rs {minPrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-sm text-[#64748B]">Price on request</span>
          )}
        </div>
        <Link href={`/workers/${worker.id}`} style={{ transform: 'translateZ(8px)' }}>
          <Button variant="primary" size="sm">View Profile</Button>
        </Link>
      </div>
    </TiltCard>
  );
}
