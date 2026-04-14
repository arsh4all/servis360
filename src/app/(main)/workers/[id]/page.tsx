'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Clock, CheckCircle, Star, Award, Calendar,
  MessageSquare, ArrowLeft, Shield, Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay, StarRating } from '@/components/ui/StarRating';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWorker(d.data);
      })
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
        <Link href="/services"><Button variant="outline">Back to Services</Button></Link>
      </div>
    );
  }

  const totalRatingCount = Object.values(worker.ratingDistribution as Record<string, number>).reduce(
    (sum, n) => sum + n, 0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Back */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative shrink-0">
                  <Avatar name={worker.name} src={worker.avatarUrl} size="xl" />
                  {worker.isAvailable && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h1 className="text-2xl font-black text-[#0F172A]">{worker.name}</h1>
                    {worker.isVerified && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                    {worker.isFeatured && (
                      <Badge variant="accent">
                        <Star className="w-3 h-3 mr-1" /> Top Rated
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-[#64748B] mb-3">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {worker.location}
                    </span>
                    {worker.experienceYears > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {worker.experienceYears} yrs experience
                      </span>
                    )}
                    {worker.responseTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {worker.responseTime}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Member since {formatDate(worker.memberSince)}
                    </span>
                  </div>

                  <RatingDisplay rating={worker.ratingAvg} count={worker.totalReviews} size="md" />
                </div>
              </div>
            </div>

            {/* About */}
            {worker.bio && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="font-bold text-[#0F172A] text-lg mb-3">About</h2>
                <p className="text-[#64748B] leading-relaxed">{worker.bio}</p>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="font-bold text-[#0F172A] text-lg mb-4">Services Offered</h2>
              <div className="space-y-3">
                {worker.services.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <ServiceIcon icon={s.service.icon} size="sm" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A] text-sm">{s.service.name}</p>
                      {s.description && (
                        <p className="text-xs text-[#64748B] mt-0.5">{s.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#0F172A]">
                        Rs {Number(s.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {s.pricingType === 'HOURLY' ? 'per hour' : 'per session'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings Breakdown */}
            {worker.totalReviews > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="font-bold text-[#0F172A] text-lg mb-5">Ratings & Reviews</h2>

                <div className="flex gap-8 mb-6">
                  {/* Score */}
                  <div className="text-center">
                    <p className="text-5xl font-black text-[#0F172A]">
                      {worker.ratingAvg.toFixed(1)}
                    </p>
                    <StarRating rating={worker.ratingAvg} size="md" className="justify-center my-1" />
                    <p className="text-sm text-[#64748B]">{worker.totalReviews} reviews</p>
                  </div>

                  {/* Distribution */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (worker.ratingDistribution[star] as number) || 0;
                      const pct = totalRatingCount > 0 ? (count / totalRatingCount) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-[#64748B] w-2">{star}</span>
                          <Star className="w-3 h-3 text-[#FACC15] shrink-0" fill="#FACC15" />
                          <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FACC15] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#64748B] w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {worker.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-[#E2E8F0] last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar name={review.customer.name} src={review.customer.avatarUrl} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-[#0F172A]">
                              {review.customer.name}
                            </p>
                            <span className="text-xs text-[#64748B]">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <StarRating rating={review.rating} size="sm" className="mb-2" />
                          {review.comment && (
                            <p className="text-sm text-[#64748B] leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                          {review.reply && (
                            <div className="mt-2 pl-3 border-l-2 border-[#FACC15]">
                              <p className="text-xs font-semibold text-[#0F172A] mb-0.5">
                                Worker's Reply:
                              </p>
                              <p className="text-xs text-[#64748B]">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Booking CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24">
              <div className="text-center mb-5">
                {worker.services.length > 0 && (
                  <>
                    <p className="text-sm text-[#64748B] mb-1">Starting from</p>
                    <p className="text-3xl font-black text-[#0F172A]">
                      Rs {Math.min(...worker.services.map((s: any) => Number(s.price))).toLocaleString()}
                    </p>
                    <p className="text-xs text-[#64748B]">per session</p>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[#0F172A]">
                    {worker.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#0F172A] shrink-0" />
                  <span className="text-[#0F172A]">Identity & skills verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-[#0F172A] shrink-0" />
                  <span className="text-[#0F172A]">{worker.totalBookings} jobs completed</span>
                </div>
              </div>

              <Link href={`/booking/${worker.id}`} className="block">
                <Button variant="accent" size="lg" className="w-full" disabled={!worker.isAvailable}>
                  {worker.isAvailable ? 'Request to Book' : 'Currently Unavailable'}
                </Button>
              </Link>

              <p className="text-xs text-[#64748B] text-center mt-3">
                No payment until job is confirmed
              </p>

              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <p className="text-xs text-[#94A3B8] text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Contact info hidden for privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
