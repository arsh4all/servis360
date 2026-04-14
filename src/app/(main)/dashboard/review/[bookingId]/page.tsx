'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating is required').max(5),
  comment: z.string().max(1000).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({ resolver: zodResolver(reviewSchema) });

  const selectedRating = watch('rating') || 0;

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooking(d.data); })
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function onSubmit(data: ReviewFormData) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, ...data }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success('Review submitted! Thank you for your feedback.');
      router.push('/dashboard');
    } else {
      toast.error(result.message || 'Failed to submit review');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          <h1 className="text-2xl font-black text-[#0F172A] mb-2">Leave a Review</h1>
          <p className="text-[#64748B] text-sm mb-6">Share your experience to help others</p>

          {booking && (
            <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl mb-6">
              <Avatar name={booking.worker?.name || 'W'} src={booking.worker?.avatarUrl} size="md" />
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">{booking.worker?.name}</p>
                <p className="text-xs text-[#64748B]">{booking.service?.name}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-3">
                Overall Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setValue('rating', s, { shouldValidate: true })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        s <= (hoveredStar || selectedRating)
                          ? 'fill-[#FACC15] text-[#FACC15]'
                          : 'fill-none text-[#CBD5E1]'
                      }`}
                    />
                  </button>
                ))}
                {(hoveredStar || selectedRating) > 0 && (
                  <span className="ml-2 text-sm font-semibold text-[#0F172A]">
                    {LABELS[hoveredStar || selectedRating]}
                  </span>
                )}
              </div>
              {errors.rating && <p className="mt-1.5 text-xs text-red-500">{errors.rating.message}</p>}
            </div>

            <Textarea
              label="Your Review (optional)"
              placeholder="What did you like? How was the service quality, punctuality, and professionalism?"
              {...register('comment')}
            />

            <Button type="submit" variant="accent" size="lg" className="w-full" loading={isSubmitting}>
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
