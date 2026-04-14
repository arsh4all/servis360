'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, Calendar, Clock, FileText,
  CheckCircle, Shield, CreditCard, Info,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay } from '@/components/ui/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TIME_SLOTS, formatCurrency } from '@/lib/utils';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  address: z.string().min(5, 'Please enter your full address'),
  addressNotes: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const { workerId } = useParams<{ workerId: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) });

  const watchedServiceId = watch('serviceId');

  useEffect(() => {
    fetch(`/api/workers/${workerId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setWorker(d.data); })
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    if (worker && watchedServiceId) {
      const svc = worker.services.find((s: any) => s.service.id === watchedServiceId);
      setSelectedService(svc || null);
    }
  }, [watchedServiceId, worker]);

  async function onSubmit(data: BookingFormData) {
    if (!selectedService) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          serviceId: selectedService.service.id,
          date: data.date,
          timeSlot: data.timeSlot,
          address: data.address,
          addressNotes: data.addressNotes,
          notes: data.notes,
          totalPrice: Number(selectedService.price),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Booking request sent! Waiting for worker confirmation.');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Failed to create booking');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-[#0F172A]">Worker not found</p>
        <Link href="/services"><Button variant="outline">Back to Services</Button></Link>
      </div>
    );
  }

  // Get min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Max date (60 days)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const platformFee = selectedService
    ? Math.round(Number(selectedService.price) * 0.1 * 100) / 100
    : 0;
  const workerEarning = selectedService
    ? Number(selectedService.price) - platformFee
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="font-black text-[#0F172A] text-lg">Request to Book</h1>
            <p className="text-sm text-[#64748B]">Fill in the details below</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
            {/* Worker Summary */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-4">
                <Avatar name={worker.name} src={worker.avatarUrl} size="lg" />
                <div>
                  <h3 className="font-bold text-[#0F172A]">{worker.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-[#64748B] mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {worker.location}
                  </div>
                  <RatingDisplay rating={worker.ratingAvg} count={worker.totalReviews} size="sm" />
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#FACC15]" />
                Select Service
              </h3>
              <div className="space-y-3">
                {worker.services.map((s: any) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      watchedServiceId === s.service.id
                        ? 'border-[#0F172A] bg-[#F8FAFC]'
                        : 'border-[#E2E8F0] hover:border-[#0F172A]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      value={s.service.id}
                      {...register('serviceId')}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A] text-sm">{s.service.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {s.pricingType === 'HOURLY' ? 'Hourly rate' : 'Fixed price'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#0F172A]">
                        Rs {Number(s.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {s.pricingType === 'HOURLY' ? '/hr' : '/session'}
                      </p>
                    </div>
                    {watchedServiceId === s.service.id && (
                      <CheckCircle className="w-5 h-5 text-[#0F172A] shrink-0" />
                    )}
                  </label>
                ))}
                {errors.serviceId && (
                  <p className="text-xs text-red-500">{errors.serviceId.message}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FACC15]" />
                Date & Time
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Preferred Date"
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  error={errors.date?.message}
                  {...register('date')}
                />
                <Select
                  label="Time Slot"
                  options={[
                    { value: '', label: 'Choose a time slot' },
                    ...TIME_SLOTS.map((t) => ({ value: t, label: t })),
                  ]}
                  error={errors.timeSlot?.message}
                  {...register('timeSlot')}
                />
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FACC15]" />
                Service Address
              </h3>
              <div className="space-y-4">
                <Input
                  label="Full Address"
                  placeholder="e.g. 12 Rue de la Paix, Port Louis"
                  error={errors.address?.message}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  {...register('address')}
                />
                <Input
                  label="Address Notes (optional)"
                  placeholder="e.g. Apartment 2B, ring the bell twice"
                  {...register('addressNotes')}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FACC15]" />
                Additional Notes
              </h3>
              <Textarea
                label="Notes for the worker (optional)"
                placeholder="e.g. Please bring eco-friendly products, focus on kitchen and bathrooms..."
                {...register('notes')}
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              loading={submitting}
              disabled={!worker.isAvailable}
            >
              {worker.isAvailable ? 'Confirm Booking Request' : 'Worker Unavailable'}
            </Button>

            <p className="text-xs text-[#64748B] text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Your contact information is never shared with workers
            </p>
          </form>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24">
              <h3 className="font-bold text-[#0F172A] mb-4">Order Summary</h3>

              {selectedService ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{selectedService.service.name}</span>
                    <span className="font-semibold text-[#0F172A]">
                      Rs {Number(selectedService.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B] flex items-center gap-1">
                      Platform fee
                      <Info className="w-3 h-3" />
                    </span>
                    <span className="text-[#64748B]">Rs {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3 flex justify-between">
                    <span className="font-bold text-[#0F172A]">Total</span>
                    <span className="font-black text-[#0F172A] text-lg">
                      Rs {Number(selectedService.price).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl p-3">
                    Worker earns <strong>Rs {workerEarning.toLocaleString()}</strong> — the 10%
                    platform fee helps us maintain and grow the service.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#64748B]">Select a service to see pricing</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  No payment until confirmed
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Shield className="w-3.5 h-3.5 text-[#0F172A]" />
                  Secure & private booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
