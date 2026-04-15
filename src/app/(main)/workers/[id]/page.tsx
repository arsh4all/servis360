'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Star, CheckCircle, ArrowLeft,
  Phone, MessageCircle, Briefcase, Clock,
  ShieldCheck, CalendarDays, Award, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setWorker(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#0F172A] font-bold text-xl">Worker not found</p>
        <Link href="/services" className="text-sm text-[#FACC15] font-semibold underline">Back to Services</Link>
      </div>
    );
  }

  // Phone → WhatsApp format
  const rawPhone = worker.phone || '';
  const waNumber = rawPhone.replace(/\s+/g, '').replace(/^0/, '230').replace(/^\+/, '');
  const waMessage = encodeURIComponent(
    `Hi ${worker.name}, I found your profile on Servis360.mu and I'd like to request your services.`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

  const totalRatings = Object.values(worker.ratingDistribution as Record<string, number>).reduce((s, n) => s + n, 0);

  const memberYear = worker.memberSince
    ? new Date(worker.memberSince).getFullYear()
    : null;

  const lowestPrice = worker.services.length > 0
    ? Math.min(...worker.services.map((s: any) => Number(s.price)))
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Back bar */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {worker.isAvailable && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available now
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A]" />

          <div className="px-5 pb-5">
            {/* Avatar + badges row */}
            <div className="relative -mt-14 mb-3 flex items-end justify-between">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-[#FACC15] shadow-lg">
                  {worker.avatarUrl ? (
                    <img src={worker.avatarUrl} alt={worker.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#0F172A] font-black text-3xl">
                      {worker.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {worker.isAvailable && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 mb-1">
                {worker.isFeatured && (
                  <span className="flex items-center gap-1 bg-[#FACC15] text-[#0F172A] text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    <Award className="w-3 h-3" /> Top Pro
                  </span>
                )}
                {worker.isVerified && (
                  <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black text-[#0F172A] leading-tight mb-1">{worker.name}</h1>

            {/* Service tags */}
            {worker.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[...new Set(worker.services.map((s: any) => s.service.name))].map((name: any) => (
                  <span key={name} className="text-xs font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#64748B] mb-3">
              {worker.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{worker.location}
                </span>
              )}
              {worker.experienceYears > 0 && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />{worker.experienceYears} yrs experience
                </span>
              )}
              {worker.responseTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />{worker.responseTime}
                </span>
              )}
            </div>

            {/* Rating */}
            {worker.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-black text-[#0F172A]">{worker.ratingAvg.toFixed(1)}</span>
                <StarRating rating={worker.ratingAvg} size="sm" />
                <span className="text-sm text-[#64748B]">({worker.totalReviews} reviews)</span>
              </div>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-[#F1F5F9] mb-4">
              <div className="text-center">
                <p className="text-xl font-black text-[#0F172A]">{worker.totalBookings ?? 0}</p>
                <p className="text-xs text-[#64748B] mt-0.5">Jobs done</p>
              </div>
              <div className="text-center border-x border-[#F1F5F9]">
                <p className="text-xl font-black text-[#0F172A]">{worker.totalReviews}</p>
                <p className="text-xs text-[#64748B] mt-0.5">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[#0F172A]">{memberYear ?? '—'}</p>
                <p className="text-xs text-[#64748B] mt-0.5">Member since</p>
              </div>
            </div>

            {/* Bio */}
            {worker.bio && (
              <p className="text-[#475569] text-sm leading-relaxed">{worker.bio}</p>
            )}
          </div>
        </div>

        {/* ── Pricing CTA banner ── */}
        {lowestPrice && (
          <div className="bg-[#0F172A] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94A3B8] mb-0.5">Starting from</p>
              <p className="text-2xl font-black text-[#FACC15]">Rs {lowestPrice.toLocaleString()}</p>
            </div>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book on WhatsApp
              </a>
            ) : (
              <div className="flex items-center gap-2 bg-[#1E293B] text-[#64748B] text-sm px-5 py-3 rounded-xl font-semibold">
                <MessageCircle className="w-4 h-4" /> Contact
              </div>
            )}
          </div>
        )}

        {/* ── Services & Rates ── */}
        {worker.services.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-bold text-[#0F172A] mb-1">Services & Rates</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Prices may vary based on your specific requirements.</p>
            <div className="space-y-2">
              {worker.services.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{s.service.name}</p>
                    {s.description && (
                      <p className="text-xs text-[#94A3B8] mt-0.5">{s.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-black text-[#0F172A]">Rs {Number(s.price).toLocaleString()}</p>
                    <p className="text-xs text-[#94A3B8]">{s.pricingType === 'HOURLY' ? 'per hour' : 'per session'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        {worker.reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#0F172A]">Customer Reviews</h2>
              <span className="text-sm text-[#64748B]">{worker.totalReviews} total</span>
            </div>

            {/* Summary row */}
            <div className="flex gap-5 mb-6 pb-5 border-b border-[#E2E8F0]">
              <div className="text-center shrink-0">
                <p className="text-5xl font-black text-[#0F172A]">{worker.ratingAvg.toFixed(1)}</p>
                <StarRating rating={worker.ratingAvg} size="sm" className="justify-center my-1.5" />
                <p className="text-xs text-[#64748B]">{worker.totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = (worker.ratingDistribution[star] as number) || 0;
                  const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-[#64748B] w-2 shrink-0">{star}</span>
                      <Star className="w-3 h-3 text-[#FACC15] shrink-0" fill="#FACC15" />
                      <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#94A3B8] w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-5">
              {worker.reviews.map((r: any) => (
                <div key={r.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-[#FACC15] font-bold text-sm shrink-0">
                    {r.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{r.customer.name}</p>
                      <span className="text-xs text-[#94A3B8] shrink-0">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating rating={r.rating} size="xs" className="mb-2" />
                    {r.comment && (
                      <p className="text-sm text-[#475569] leading-relaxed">{r.comment}</p>
                    )}
                    {r.reply && (
                      <div className="mt-3 pl-3 border-l-2 border-[#FACC15] bg-[#FFFBEB] rounded-r-xl py-2.5 pr-3">
                        <p className="text-xs font-bold text-[#0F172A] mb-0.5">{worker.name} replied:</p>
                        <p className="text-xs text-[#64748B] leading-relaxed">{r.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trust badges ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h2 className="font-bold text-[#0F172A] mb-4">Why book {worker.name.split(' ')[0]}?</h2>
          <div className="grid grid-cols-2 gap-3">
            {worker.isVerified && (
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Identity Verified</p>
                  <p className="text-xs text-[#64748B]">ID checked by Servis360</p>
                </div>
              </div>
            )}
            {worker.totalBookings > 0 && (
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-xl">
                <CalendarDays className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">{worker.totalBookings} Jobs Done</p>
                  <p className="text-xs text-[#64748B]">Proven track record</p>
                </div>
              </div>
            )}
            {worker.experienceYears > 0 && (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">{worker.experienceYears} Yrs Experience</p>
                  <p className="text-xs text-[#64748B]">Professional background</p>
                </div>
              </div>
            )}
            {worker.responseTime && (
              <div className="flex items-start gap-2.5 p-3 bg-purple-50 rounded-xl">
                <Zap className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Fast Response</p>
                  <p className="text-xs text-[#64748B]">{worker.responseTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h2 className="font-bold text-[#0F172A] mb-1">Get in Touch</h2>
          <p className="text-sm text-[#64748B] mb-5">
            {worker.isAvailable
              ? `${worker.name.split(' ')[0]} is available and ready to take on new clients.`
              : `${worker.name.split(' ')[0]} is currently unavailable for new bookings.`}
          </p>

          <div className="space-y-3">
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-2xl transition-colors shadow-md text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-4 bg-[#F1F5F9] text-[#94A3B8] font-semibold rounded-2xl text-sm">
                <MessageCircle className="w-5 h-5" />
                WhatsApp not available
              </div>
            )}

            {rawPhone && (
              <a
                href={`tel:${rawPhone}`}
                className="flex items-center justify-center gap-3 w-full py-3 border-2 border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A] font-semibold rounded-2xl transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call {rawPhone}
              </a>
            )}
          </div>

          <p className="text-xs text-[#94A3B8] text-center mt-4">
            Contact details are shared to help you connect directly with this professional.
          </p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
