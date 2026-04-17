'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Star, CheckCircle, ArrowLeft,
  Phone, MessageCircle, Briefcase, Clock,
  ShieldCheck, CalendarDays, Award, Zap,
  Eye, ImageIcon, X, ChevronLeft, ChevronRight,
  Play, Send, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  // Direct mp4 / other
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return url;
  return null;
}

// ── Review star picker ────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${n <= (hover || value) ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#CBD5E1]'}`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: any[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
      >
        <X className="w-6 h-6" />
      </button>
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 text-white/70 hover:text-white p-3 bg-black/40 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 text-white/70 hover:text-white p-3 bg-black/40 rounded-full"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[85vh] px-4">
        <img
          src={photos[index]?.url}
          alt={photos[index]?.caption || `Photo ${index + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        {photos[index]?.caption && (
          <p className="text-center text-white/70 text-sm mt-3">{photos[index].caption}</p>
        )}
        <p className="text-center text-white/40 text-xs mt-1">{index + 1} / {photos.length}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Contact reveal
  const [waRevealed, setWaRevealed] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // Gallery lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', name: '', phone: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setWorker(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!reviewForm.rating) return alert('Please select a star rating');
    if (reviewForm.comment.length < 10) return alert('Please write at least 10 characters');
    if (!reviewForm.name.trim()) return alert('Please enter your name');
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/workers/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: reviewForm.name.trim(),
          reviewerPhone: reviewForm.phone.trim(),
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewDone(true);
        setWorker((w: any) => w ? {
          ...w,
          reviews: [
            {
              id: data.data.id,
              rating: reviewForm.rating,
              comment: reviewForm.comment,
              reply: null,
              createdAt: new Date().toISOString(),
              isVerifiedPurchase: false,
              customer: { name: reviewForm.name, avatarUrl: null },
            },
            ...(w.reviews || []),
          ],
        } : w);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const rawPhone = worker.phone || '';
  const waNumber = rawPhone.replace(/\s+/g, '').replace(/^0/, '230').replace(/^\+/, '');
  const waMessage = encodeURIComponent(
    `Hi ${worker.name}, I found your profile on Servis360.mu and I'd like to request your services.`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

  const totalRatings = Object.values(worker.ratingDistribution as Record<string, number>).reduce((s: number, n: any) => s + n, 0);
  const memberYear = worker.memberSince ? new Date(worker.memberSince).getFullYear() : null;
  const lowestPrice = worker.services.length > 0
    ? Math.min(...worker.services.map((s: any) => Number(s.price)))
    : null;

  const uniqueServices = Array.from(new Set(worker.services.map((s: any) => s.service.name))) as string[];
  const embedUrl = worker.videoUrl ? getEmbedUrl(worker.videoUrl) : null;
  const visiblePhotos = showAllPhotos ? worker.photos : (worker.photos || []).slice(0, 9);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Sticky back bar ── */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {worker.isAvailable && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available now
            </span>
          )}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative">
        <div className="h-56 sm:h-72 w-full overflow-hidden">
          {worker.coverImageUrl ? (
            <img src={worker.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#0F172A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-8">
          <div className="max-w-5xl mx-auto flex items-end gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden bg-[#FACC15] shadow-xl">
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

            <div className="pb-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{worker.name}</h1>
                {worker.isFeatured && (
                  <span className="flex items-center gap-1 bg-[#FACC15] text-[#0F172A] text-xs font-black px-2.5 py-1 rounded-full">
                    <Award className="w-3 h-3" /> Top Pro
                  </span>
                )}
                {worker.isVerified && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              {worker.tagline && (
                <p className="text-white/80 text-sm font-medium italic mb-1">"{worker.tagline}"</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
                {worker.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{worker.location}</span>
                )}
                {worker.totalReviews > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                    {worker.ratingAvg.toFixed(1)} ({worker.totalReviews} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* ── 3 CTA buttons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {rawPhone ? (
            waRevealed ? (
              <a
                href={waLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-2xl transition-colors shadow-md text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {rawPhone}
              </a>
            ) : (
              <button
                onClick={() => setWaRevealed(true)}
                className="flex items-center justify-center gap-2 py-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1a9e4d] border-2 border-[#25D366]/30 font-bold rounded-2xl transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Show WhatsApp
              </button>
            )
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 bg-[#F1F5F9] text-[#94A3B8] rounded-2xl text-sm font-semibold">
              <MessageCircle className="w-4 h-4" /> WhatsApp N/A
            </div>
          )}

          {rawPhone ? (
            phoneRevealed ? (
              <a
                href={`tel:${rawPhone}`}
                className="flex items-center justify-center gap-2 py-4 bg-[#0F172A] text-white font-bold rounded-2xl text-sm"
              >
                <Phone className="w-4 h-4" /> {rawPhone}
              </a>
            ) : (
              <button
                onClick={() => setPhoneRevealed(true)}
                className="flex items-center justify-center gap-2 py-4 bg-[#0F172A]/10 hover:bg-[#0F172A]/20 text-[#0F172A] border-2 border-[#0F172A]/20 font-bold rounded-2xl transition-colors text-sm"
              >
                <Eye className="w-4 h-4" /> Show Phone
              </button>
            )
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 bg-[#F1F5F9] text-[#94A3B8] rounded-2xl text-sm font-semibold">
              <Phone className="w-4 h-4" /> Phone N/A
            </div>
          )}

          <Link href={`/booking/${id}`} className="flex items-center justify-center gap-2 py-4 bg-[#FACC15] hover:bg-[#F59E0B] text-[#0F172A] font-black rounded-2xl transition-colors shadow-md text-sm">
            <CalendarDays className="w-4 h-4" /> Book Service
          </Link>
        </div>

        {/* ── Stats bar ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            {worker.totalReviews > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#0F172A]">{worker.ratingAvg.toFixed(1)}</span>
                <div>
                  <StarRating rating={worker.ratingAvg} size="sm" />
                  <p className="text-xs text-[#64748B] mt-0.5">{worker.totalReviews} reviews</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              {worker.totalBookings > 0 && (
                <div className="text-center">
                  <p className="text-xl font-black text-[#0F172A]">{worker.totalBookings}</p>
                  <p className="text-xs text-[#64748B]">Jobs done</p>
                </div>
              )}
              {worker.experienceYears > 0 && (
                <div className="text-center">
                  <p className="text-xl font-black text-[#0F172A]">{worker.experienceYears}+</p>
                  <p className="text-xs text-[#64748B]">Yrs experience</p>
                </div>
              )}
              {memberYear && (
                <div className="text-center">
                  <p className="text-xl font-black text-[#0F172A]">{memberYear}</p>
                  <p className="text-xs text-[#64748B]">Member since</p>
                </div>
              )}
              {worker.responseTime && (
                <div className="text-center">
                  <Zap className="w-4 h-4 text-[#FACC15] mx-auto mb-0.5" />
                  <p className="text-xs text-[#64748B]">{worker.responseTime}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Specialties ── */}
        {uniqueServices.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-bold text-[#0F172A] mb-3 text-sm uppercase tracking-wider">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueServices.map((name) => (
                <span key={name} className="bg-[#0F172A] text-[#FACC15] text-sm font-bold px-4 py-1.5 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── About ── */}
        {worker.bio && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-bold text-[#0F172A] mb-3">About {worker.name.split(' ')[0]}</h2>
            <p className="text-[#475569] text-sm leading-relaxed whitespace-pre-line">{worker.bio}</p>
          </div>
        )}

        {/* ── Video Presentation ── */}
        {embedUrl && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
              <h2 className="font-bold text-[#0F172A]">Video Presentation</h2>
            </div>
            {embedUrl.match(/\.(mp4|webm|ogg)/i) ? (
              <video
                src={embedUrl}
                controls
                className="w-full rounded-xl aspect-video bg-[#0F172A]"
              />
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title="Worker presentation video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Services & Rates ── */}
        {worker.services.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-bold text-[#0F172A] mb-1">Services & Rates</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Prices may vary based on requirements. Contact for a custom quote.</p>
            <div className="space-y-2">
              {worker.services.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{s.service.name}</p>
                    {s.description && <p className="text-xs text-[#94A3B8] mt-0.5">{s.description}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-black text-[#0F172A]">Rs {Number(s.price).toLocaleString()}</p>
                    <p className="text-xs text-[#94A3B8]">{s.pricingType === 'HOURLY' ? 'per hour' : 'per session'}</p>
                  </div>
                </div>
              ))}
            </div>
            {lowestPrice && (
              <div className="mt-4 flex items-center justify-between p-3 bg-[#FFFBEB] border border-[#FACC15]/50 rounded-xl">
                <span className="text-xs font-semibold text-[#92400E]">Starting from</span>
                <span className="font-black text-[#0F172A]">Rs {lowestPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Portfolio Gallery ── */}
        {worker.photos && worker.photos.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#64748B]" />
                <h2 className="font-bold text-[#0F172A]">Portfolio</h2>
                <span className="text-xs text-[#94A3B8]">{worker.photos.length} photos</span>
              </div>
              {worker.photos.length > 9 && (
                <button
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="text-xs font-semibold text-[#FACC15] hover:underline"
                >
                  {showAllPhotos ? 'Show less' : `See all ${worker.photos.length}`}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {visiblePhotos.map((photo: any, i: number) => {
                const realIndex = worker.photos.indexOf(photo);
                return (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl overflow-hidden bg-[#F1F5F9] cursor-pointer group relative"
                    onClick={() => setLightboxIndex(realIndex)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Trust badges ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h2 className="font-bold text-[#0F172A] mb-4">Why choose {worker.name.split(' ')[0]}?</h2>
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
            <div className="flex items-start gap-2.5 p-3 bg-[#F8FAFC] rounded-xl col-span-2">
              <CheckCircle className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Listed on Servis360.mu</p>
                <p className="text-xs text-[#64748B]">Vetted and verified by our team before listing</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#0F172A]">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold bg-[#FACC15] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#F59E0B] transition-colors"
            >
              Write a Review
            </button>
          </div>

          {worker.totalReviews > 0 && (
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
                  const labels = ['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'];
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-[#64748B] w-16 shrink-0 text-right">{labels[star]}</span>
                      <div className="flex-1 h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FACC15] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[#94A3B8] w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {worker.reviews.length > 0 ? (
            <div className="space-y-5">
              {worker.reviews.map((r: any) => (
                <div key={r.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-[#FACC15] font-bold text-sm shrink-0">
                    {r.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{r.customer.name}</p>
                        {r.isVerifiedPurchase && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold shrink-0">Verified</span>
                        )}
                      </div>
                      <span className="text-xs text-[#94A3B8] shrink-0">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating rating={r.rating} size="sm" className="mb-2" />
                    {r.comment && <p className="text-sm text-[#475569] leading-relaxed">{r.comment}</p>}
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
          ) : (
            <div className="text-center py-8">
              <Star className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">No reviews yet.</p>
              <p className="text-xs text-[#94A3B8] mt-1">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={worker.photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(worker.photos.length - 1, (i ?? 0) + 1))}
        />
      )}

      {/* ── Review Modal ── */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => { if (!reviewSubmitting) setShowReviewModal(false); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {reviewDone ? (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-[#0F172A] mb-2">Thank you!</h3>
                <p className="text-sm text-[#64748B]">Your review has been submitted and will appear shortly.</p>
                <button
                  onClick={() => { setShowReviewModal(false); setReviewDone(false); setReviewForm({ rating: 0, comment: '', name: '', phone: '' }); }}
                  className="mt-6 w-full py-3 bg-[#FACC15] text-[#0F172A] font-black rounded-2xl hover:bg-[#F59E0B]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-[#0F172A]">Write a Review</h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-[#94A3B8] hover:text-[#475569]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2">Your Rating *</label>
                    <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Your Experience *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your experience (min 10 characters)..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jean Paul"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Phone Number <span className="text-[#94A3B8] font-normal">(optional)</span></label>
                    <input
                      type="tel"
                      placeholder="e.g. 52 123 456"
                      value={reviewForm.phone}
                      onChange={(e) => setReviewForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>

                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FACC15] text-[#0F172A] font-black rounded-2xl hover:bg-[#F59E0B] disabled:opacity-50 transition-colors"
                  >
                    {reviewSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Review</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
