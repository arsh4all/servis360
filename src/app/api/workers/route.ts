import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const serviceSlug = searchParams.get('service');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '99999');
    const available = searchParams.get('available');
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';
    const district = searchParams.get('district') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    const skip = (page - 1) * pageSize;

    const where: any = {
      isApproved: true,
      ratingAvg: { gte: minRating },
    };

    if (available === 'true') where.isAvailable = true;
    if (featured) where.isFeatured = true;
    if (district) where.location = { contains: district, mode: 'insensitive' };

    if (serviceSlug) {
      where.workerServices = {
        some: {
          service: { slug: serviceSlug },
          isActive: true,
          price: { lte: maxPrice },
        },
      };
    }

    const [profiles, total] = await prisma.$transaction([
      prisma.workerProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isFeatured: 'desc' }, { ratingAvg: 'desc' }, { totalReviews: 'desc' }],
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true },
          },
          workerServices: {
            where: { isActive: true },
            include: { service: true },
            orderBy: { price: 'asc' },
          },
        },
      }),
      prisma.workerProfile.count({ where }),
    ]);

    // Filter by search after fetching (for simplicity)
    const filtered = search
      ? profiles.filter(
          (p) =>
            p.user.name.toLowerCase().includes(search.toLowerCase()) ||
            p.location.toLowerCase().includes(search.toLowerCase()) ||
            p.bio?.toLowerCase().includes(search.toLowerCase())
        )
      : profiles;

    return apiSuccess({
      items: filtered.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl,
        bio: p.bio,
        location: p.location,
        experienceYears: p.experienceYears,
        ratingAvg: p.ratingAvg,
        totalReviews: p.totalReviews,
        isVerified: p.isVerified,
        isFeatured: p.isFeatured,
        isAvailable: p.isAvailable,
        responseTime: p.responseTime,
        services: p.workerServices.map((ws) => ({
          id: ws.id,
          price: Number(ws.price),
          pricingType: ws.pricingType,
          service: ws.service,
        })),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Workers fetch error:', error);
    return apiError('Failed to fetch workers', 500);
  }
}
