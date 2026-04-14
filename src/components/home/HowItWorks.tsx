import Link from 'next/link';
import { Search, UserCheck, CalendarCheck, Wrench, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Search a Service',
    description:
      'Browse our six service categories or search by name. Filter by rating, price, and availability to find the perfect match.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    step: '02',
    icon: UserCheck,
    title: 'Choose a Worker',
    description:
      'View detailed profiles, read authentic reviews, and compare prices. Every worker is verified and background-checked.',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Book & Confirm',
    description:
      'Select your date, time slot, and address. The worker receives your request and confirms the booking.',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    step: '04',
    icon: Wrench,
    title: 'Get the Job Done',
    description:
      'Your professional arrives on time and completes the work to our quality standards. Track the status in real time.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    step: '05',
    icon: Star,
    title: 'Rate & Review',
    description:
      'Once the job is done, share your experience. Your review helps other customers make informed decisions.',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[#FACC15] font-semibold text-sm uppercase tracking-wider mb-2">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4">
            How It Works
          </h2>
          <p className="text-[#64748B] text-lg">
            Book a trusted professional in under 3 minutes. Here's how simple it is.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#E2E8F0] via-[#FACC15] to-[#E2E8F0]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex flex-col items-center text-center relative">
                  {/* Step Number + Icon */}
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${step.color} border-2 flex items-center justify-center z-10 relative bg-white shadow-card`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center">
                      <span className="text-[#FACC15] text-xs font-black">{index + 1}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-[#0F172A] mb-2">{step.title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/register">
            <Button variant="accent" size="lg" className="px-10">
              Get Started — It's Free
            </Button>
          </Link>
          <p className="text-[#64748B] text-sm mt-3">
            No subscription required. Pay only for the services you book.
          </p>
        </div>
      </div>
    </section>
  );
}
