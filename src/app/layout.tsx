import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Servis360.mu — Find Trusted Home Service Professionals in Mauritius',
    template: '%s | Servis360.mu',
  },
  description:
    'Book verified cleaning, electrician, plumbing, CCTV installation, nanny, and elderly care professionals in Mauritius. Trusted by 5,000+ homeowners.',
  keywords: [
    'home services Mauritius',
    'cleaning Mauritius',
    'electrician Mauritius',
    'plumbing Mauritius',
    'nanny Mauritius',
    'elderly care Mauritius',
    'servis360',
  ],
  openGraph: {
    title: 'Servis360.mu — Trusted Home Services in Mauritius',
    description: 'Book verified professionals for cleaning, plumbing, CCTV, nanny & more.',
    type: 'website',
    locale: 'en_MU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              borderRadius: '0.75rem',
              border: '1px solid #1E293B',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#FACC15', secondary: '#0F172A' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
