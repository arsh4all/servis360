import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

// Default content seeded on first GET if missing
const DEFAULTS: Record<string, string> = {
  hero_title: 'Find trusted help for your home & family',
  hero_subtitle: 'Book verified cleaning, electrical, plumbing, childcare, and elderly care services. Rated workers, secure payments — peace of mind guaranteed.',
  hero_badge: 'Trusted by 5,000+ homeowners in Mauritius',
  services_title: 'Popular Services',
  services_subtitle: 'Book from our wide range of professional home services — all vetted and insured.',
  workers_title: 'Top Rated Workers',
  workers_subtitle: 'Hand-picked professionals with the highest ratings and reviews from our community.',
  why_title: 'Why Choose Us',
  footer_tagline: "Mauritius's trusted platform connecting homeowners with verified service professionals. Book with confidence — every worker is vetted and reviewed.",
};

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);

    const existing = await prisma.siteContent.findMany();
    const contentMap: Record<string, string> = {};
    existing.forEach((c) => { contentMap[c.key] = c.value; });

    // Seed any missing defaults
    const missing = Object.entries(DEFAULTS).filter(([k]) => !contentMap[k]);
    if (missing.length > 0) {
      await prisma.siteContent.createMany({
        data: missing.map(([key, value]) => ({ key, value })),
        skipDuplicates: true,
      });
      missing.forEach(([k, v]) => { contentMap[k] = v; });
    }

    return apiSuccess(contentMap);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch content', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);
    const updates: Record<string, string> = await req.json();

    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.siteContent.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return apiSuccess(null, 'Content saved successfully');
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to save content', 500);
  }
}
