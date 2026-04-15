import prisma from '@/lib/prisma';

export const CONTENT_DEFAULTS: Record<string, string> = {
  hero_title: 'Find trusted help for your home & family',
  hero_subtitle: 'Book verified cleaning, electrical, plumbing, childcare, and elderly care services. Rated workers, secure payments — peace of mind guaranteed.',
  hero_badge: 'Trusted by 5,000+ homeowners in Mauritius',
  services_title: 'Popular Services',
  services_subtitle: 'Book from our wide range of professional home services — all vetted and insured.',
  workers_title: 'Top Rated Workers',
  workers_subtitle: 'Hand-picked professionals with the highest ratings and reviews from our community.',
  why_title: 'The Smarter Way to Book Home Services',
  footer_tagline: "Mauritius's trusted platform connecting homeowners with verified service professionals. Book with confidence — every worker is vetted and reviewed.",
};

export async function getSiteContent(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteContent.findMany();
    const map: Record<string, string> = { ...CONTENT_DEFAULTS };
    rows.forEach((r) => { map[r.key] = r.value; });
    return map;
  } catch {
    return { ...CONTENT_DEFAULTS };
  }
}
