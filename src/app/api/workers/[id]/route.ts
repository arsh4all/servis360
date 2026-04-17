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
          select: { id: true, name: true, avatarUrl: true, role: true, createdAt: true, phone: true },
        },
        workerServices: {
          where: { isActive: true },
          include: { service: true },
        },
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!profile || !profile.isApproved) {
      return apiError('Worker not found', 404);
    }

    // Booking-based reviews (visible)
    const bookingReviews = await prisma.review.findMany({
      where: { workerId: profile.userId, isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        customer: { select: { name: true, avatarUrl: true } },
      },
    });

    // Guest reviews (visible)
    const guestReviews = await prisma.guestReview.findMany({
      where: { workerId: profile.userId, isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Combined reviews sorted by date
    const allReviews = [
      ...bookingReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply,
        createdAt: r.createdAt,
        isVerifiedPurchase: true,
        customer: { name: r.customer.name, avatarUrl: r.customer.avatarUrl },
      })),
      ...guestReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply,
        createdAt: r.createdAt,
        isVerifiedPurchase: false,
        customer: { name: r.reviewerName, avatarUrl: null },
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);

    // Rating distribution across all visible reviews
    const bookingDist = await prisma.review.groupBy({
      by: ['rating'],
      where: { workerId: profile.userId, isVisible: true },
      _count: true,
    });
    const guestDist = await prisma.guestReview.groupBy({
      by: ['rating'],
      where: { workerId: profile.userId, isVisible: true },
      _count: true,
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    bookingDist.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + r._count; });
    guestDist.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + r._count; });

    return apiSuccess({
      id: profile.id,
      userId: profile.userId,
      name: profile.user.name,
      avatarUrl: profile.user.avatarUrl,
      coverImageUrl: profile.coverImageUrl,
      videoUrl: profile.videoUrl,
      tagline: profile.tagline,
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
      phone: profile.user.phone,
      memberSince: profile.user.createdAt,
      photos: profile.photos,
      services: profile.workerServices.map((ws) => ({
        id: ws.id,
        price: Number(ws.price),
        pricingType: ws.pricingType,
        description: ws.description,
        service: ws.service,
      })),
      reviews: allReviews,
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error('Worker detail error:', error);
    return apiError('Failed to fetch worker profile', 500);
  }
}
