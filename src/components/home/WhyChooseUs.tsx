import { Shield, Star, Clock, CreditCard, HeartHandshake, BadgeCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Verified Professionals',
    description:
      'Every worker undergoes identity verification, background checks, and skills assessment before joining our platform.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Secure & Safe Booking',
    description:
      'Your personal contact info stays private. All communication happens through our secure in-app messaging system.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Star,
    title: 'Transparent Ratings',
    description:
      'Read genuine reviews from real customers. Detailed ratings help you choose the best professional for your needs.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description:
      'Book at your convenience. Choose from available time slots that fit your schedule — morning, afternoon, or evening.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Fair & Transparent Pricing',
    description:
      'No hidden fees. See the full price before you book. Workers set their own rates and you pay a small platform fee.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: HeartHandshake,
    title: 'Customer Support',
    description:
      'Our local support team in Mauritius is here to help with any issues. We stand behind every booking on our platform.',
    color: 'bg-orange-50 text-orange-600',
  },
];

export function WhyChooseUs({ title = 'The Smarter Way to Book Home Services' }: { title?: string } = {}) {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[#FACC15] font-semibold text-sm uppercase tracking-wider mb-2">
            Why Servis360.mu
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4">
            {title}
          </h2>
          <p className="text-[#64748B] text-lg">
            We take the stress out of finding reliable home service professionals in Mauritius.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-card-hover transition-all duration-200 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-2">{feature.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Banner */}
        <div className="mt-16 bg-[#0F172A] rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: 'Verified Workers' },
              { value: '5,000+', label: 'Happy Customers' },
              { value: '12,000+', label: 'Jobs Completed' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-black text-[#FACC15] mb-1">{stat.value}</p>
                <p className="text-[#94A3B8] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
