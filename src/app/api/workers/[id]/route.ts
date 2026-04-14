import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, role: true, createdAt: true },
        },
        workerServices: {
          where: { isActive: true },
          include: { service: true },
        },
      },
    });

    if (!profile || !profile.isApproved) {
      return apiError('Worker not found', 404);
    }

    // Fetch recent reviews (no phone numbers, no private data)
    const reviews = await prisma.review.findMany({
      where: { workerId: profile.userId, isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    // Rating distribution
    const ratingDist = await prisma.review.groupBy({
      by: ['rating'],
      where: { workerId: profile.userId, isVisible: true },
      _count: true,
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDist.forEach((r) => {
      distribution[r.rating] = r._count;
    });

    return apiSuccess({
      id: profile.id,
      userId: profile.userId,
      name: profile.user.name,
      avatarUrl: profile.user.avatarUrl,
      bio: profile.bio,
      location: profile.location,
      experienceYears: profile.experienceYears,
      ratingAvg: profile.ratingAvg,
      totalReviews: profile.totalReviews,
      totalBookings: profile.totalBookings,
      isVerified: profile.isVerified,
      isFeatured: profile.isFeatured,
      isAvailable: profile.isAvailable,
      responseTime: profile.responseTime,
      memberSince: profile.user.createdAt,
      services: profile.workerServices.map((ws) => ({
        id: ws.id,
        price: Number(ws.price),
        pricingType: ws.pricingType,
        description: ws.description,
        service: ws.service,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply,
        createdAt: r.createdAt,
        customer: {
          name: r.customer.name,
          avatarUrl: r.customer.avatarUrl,
        },
      })),
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error('Worker detail error:', error);
    return apiError('Failed to fetch worker profile', 500);
  }
}
