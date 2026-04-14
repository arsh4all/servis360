import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

const SERVICES = [
  { label: 'Cleaning', href: '/services?category=cleaning' },
  { label: 'Electrician', href: '/services?category=electrician' },
  { label: 'Plumbing', href: '/services?category=plumbing' },
  { label: 'CCTV Installation', href: '/services?category=cctv-installation' },
  { label: 'Nanny', href: '/services?category=nanny' },
  { label: 'Elderly Care', href: '/services?category=elderly-care' },
];

const COMPANY = [
  { label: 'About Us', href: '/about' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Become a Worker', href: '/become-worker' },
  { label: 'Premium Plan', href: '/premium' },
  { label: 'Blog', href: '/blog' },
];

const SUPPORT = [
  { label: 'Help Center', href: '/help' },
  { label: 'Safety', href: '/safety' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Us', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Image src="/logo.png" alt="Servis360.mu" width={160} height={57} className="h-12 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-xs">
              Mauritius's trusted platform connecting homeowners with verified service professionals.
              Book with confidence — every worker is vetted and reviewed.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <MapPin className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span>Port Louis, Mauritius</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <Mail className="w-4 h-4 text-[#FACC15] shrink-0" />
                <a href="mailto:hello@servis360.mu" className="hover:text-white transition-colors">
                  hello@servis360.mu
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: '#' },
                { icon: <Instagram className="w-4 h-4" />, href: '#' },
                { icon: <Twitter className="w-4 h-4" />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#FACC15] hover:text-[#0F172A] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#FACC15] mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              {SERVICES.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#FACC15] mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {COMPANY.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#FACC15] mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {SUPPORT.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} Servis360.mu. All rights reserved.
          </p>
          <p className="text-xs text-[#64748B]">
            Made with ♥ in Mauritius
          </p>
        </div>
      </div>
    </footer>
  );
}
