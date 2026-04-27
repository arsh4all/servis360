'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Star } from 'lucide-react';

// ── Main Categories (top row) ────────────────────────────────────────────────
const MAIN_CATEGORIES = [
  {
    name: 'Cleaning',
    slug: 'cleaning',
    workers: 42,
    rating: 4.8,
    bg: 'bg-blue-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257281/ChatGPT_Image_Apr_15_2026_04_45_40_PM_t2lbik.png',
  },
  {
    name: 'Electrician',
    slug: 'electrician',
    workers: 28,
    rating: 4.7,
    bg: 'bg-yellow-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257291/ChatGPT_Image_Apr_15_2026_04_45_46_PM_ms94zh.png',
  },
  {
    name: 'Plumbing',
    slug: 'plumbing',
    workers: 31,
    rating: 4.6,
    bg: 'bg-cyan-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257298/ChatGPT_Image_Apr_15_2026_04_47_22_PM_pdb7uh.png',
  },
  {
    name: 'CCTV Installation',
    slug: 'cctv-installation',
    workers: 19,
    rating: 4.9,
    bg: 'bg-slate-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257322/ChatGPT_Image_Apr_15_2026_04_48_23_PM_rw97hd.png',
  },
  {
    name: 'Nanny',
    slug: 'nanny',
    workers: 24,
    rating: 4.8,
    bg: 'bg-purple-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257367/ChatGPT_Image_Apr_15_2026_04_49_20_PM_tscd1u.png',
  },
  {
    name: 'Elderly Care',
    slug: 'elderly-care',
    workers: 17,
    rating: 4.7,
    bg: 'bg-rose-50',
    image: 'https://res.cloudinary.com/df6bzlw3l/image/upload/v1776257439/ChatGPT_Image_Apr_15_2026_04_50_30_PM_gahpor.png',
  },
];

// ── Expandable Section Groups ────────────────────────────────────────────────
const SERVICE_SECTIONS = [
  {
    title: 'Home Help',
    slug: 'home-help',
    icon: '🏠',
    subtitle: 'Ironing, laundry & errands',
    containerBg: 'bg-orange-50',
    containerBorder: 'border-orange-100',
    iconBg: 'bg-orange-100',
    viewAllColor: 'text-orange-500 hover:text-orange-700',
    services: [
      {
        name: 'Ironing Clothes',
        slug: 'ironing',
        workers: 18,
        rating: 4.8,
        bg: 'bg-amber-50',
        icon: '👔',
        image: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400&q=80&auto=format&fit=crop',
      },
      {
        name: 'Laundry Service',
        slug: 'laundry',
        workers: 21,
        rating: 4.7,
        bg: 'bg-sky-50',
        icon: '🧺',
        image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80&auto=format&fit=crop',
      },
      {
        name: 'Errand & Assistance',
        slug: 'errand',
        workers: 16,
        rating: 4.6,
        bg: 'bg-green-50',
        icon: '🛍️',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    title: 'Handyman',
    slug: 'handyman',
    icon: '🔧',
    subtitle: 'Repairs & installations',
    containerBg: 'bg-emerald-50',
    containerBorder: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    viewAllColor: 'text-emerald-600 hover:text-emerald-800',
    services: [
      {
        name: 'Small Repairs',
        slug: 'repairs',
        workers: 23,
        rating: 4.7,
        bg: 'bg-slate-50',
        icon: '🔨',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80&auto=format&fit=crop',
      },
      {
        name: 'Furniture Assembly',
        slug: 'furniture-assembly',
        workers: 27,
        rating: 4.8,
        bg: 'bg-amber-50',
        icon: '🪑',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&auto=format&fit=crop',
      },
      {
        name: 'Wall Mounting',
        slug: 'wall-mounting',
        workers: 20,
        rating: 4.6,
        bg: 'bg-blue-50',
        icon: '📺',
        image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80&auto=format&fit=crop',
      },
    ],
  },
];

// ── Popular Tasks ─────────────────────────────────────────────────────────────
const POPULAR_TASKS = [
  { label: 'Ironing Clothes', query: 'ironing', icon: '👔' },
  { label: 'Gardening / Yard', query: 'gardening', icon: '🌿' },
  { label: 'Sofa Cleaning', query: 'sofa cleaning', icon: '🛋️' },
  { label: 'AC Servicing', query: 'ac servicing', icon: '❄️' },
  { label: 'Car Wash at Home', query: 'car wash', icon: '🚗' },
  { label: 'Furniture Assembly', query: 'furniture assembly', icon: '🪑' },
];

// ── Sub-service card ───────────────────────────────────────────────────────────
function SubCard({
  name,
  slug,
  workers,
  rating,
  bg,
  icon,
  image,
}: {
  name: string;
  slug: string;
  workers: number;
  rating: number;
  bg: string;
  icon: string;
  image: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/services?q=${encodeURIComponent(slug)}`}
      className={`group relative ${bg} rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm
        hover:shadow-lg hover:scale-[1.04] hover:border-[#FACC15]/60 transition-all duration-250 ease-out`}
    >
      {/* Rating */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
        <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
        <span className="text-[10px] font-bold text-[#0F172A]">{rating}</span>
      </div>

      {/* Image / Icon fallback */}
      <div className={`overflow-hidden aspect-[4/3] w-full ${bg}`}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${bg}`}>
            <span className="text-4xl">{icon}</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-3">
        <p className="font-bold text-[#0F172A] text-sm leading-tight mb-0.5">{name}</p>
        <p className="text-xs text-[#64748B]">{workers} workers</p>
      </div>
    </Link>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function PopularServices({
  title = 'Popular Services',
  subtitle = 'Book from our wide range of professional home services — all vetted and insured.',
}: {
  title?: string;
  subtitle?: string;
} = {}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/services?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[#FACC15] font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">{title}</h2>
            <p className="text-[#64748B] mt-2 max-w-md">{subtitle}</p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#FACC15] transition-colors shrink-0"
          >
            View all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need help with? (e.g. ironing, gardening, plumbing)"
              className="w-full pl-12 pr-28 py-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#1E293B] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* ── 6 Main Categories (one row) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {MAIN_CATEGORIES.map((service) => (
            <Link
              key={service.slug}
              href={`/services?category=${service.slug}`}
              className={`group relative ${service.bg} rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out`}
            >
              {/* Rating badge */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
                <span className="text-[10px] font-bold text-[#0F172A]">{service.rating}</span>
              </div>

              {/* Image */}
              <div className="overflow-hidden aspect-[4/3] w-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 ease-out"
                />
                {/* Book Now on hover */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out px-2 pb-2">
                  <div className="bg-[#0F172A] text-white text-[10px] font-bold text-center py-1.5 rounded-lg">
                    Book Now
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="p-3 pb-4">
                <p className="font-bold text-[#0F172A] text-sm leading-tight mb-1">{service.name}</p>
                <p className="text-xs text-[#64748B]">{service.workers} workers</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Expandable Section Groups ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-14">
          {SERVICE_SECTIONS.map((section) => (
            <div
              key={section.slug}
              className={`${section.containerBg} border ${section.containerBorder} rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${section.iconBg} w-9 h-9 rounded-xl flex items-center justify-center text-lg`}>
                    {section.icon}
                  </div>
                  <div>
                    <p className="font-black text-[#0F172A] text-base leading-tight">{section.title}</p>
                    <p className="text-xs text-[#64748B]">{section.subtitle}</p>
                  </div>
                </div>
                <Link
                  href={`/services?category=${section.slug}`}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${section.viewAllColor} transition-colors shrink-0`}
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Sub-service cards */}
              <div className="grid grid-cols-3 gap-3">
                {section.services.map((sub) => (
                  <SubCard key={sub.slug} {...sub} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Popular Tasks Near You ── */}
        <div>
          <div className="mb-5">
            <h3 className="text-lg font-black text-[#0F172A]">Popular Tasks Near You</h3>
            <p className="text-sm text-[#64748B] mt-0.5">Quick bookings for everyday needs</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {POPULAR_TASKS.map((task) => (
              <Link
                key={task.query}
                href={`/services?q=${encodeURIComponent(task.query)}`}
                className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FACC15] transition-all duration-200 group"
              >
                <span className="text-xl">{task.icon}</span>
                <span className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">{task.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
