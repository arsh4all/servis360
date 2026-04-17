import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

const reviewSchema = z.object({
  reviewerName: z.string().min(2).max(100),
  reviewerPhone: z.string().max(20).optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find worker by profile id
    const profile = await prisma.workerProfile.findUnique({
      where: { id: params.id, isApproved: true },
      select: { userId: true },
    });
    if (!profile) return apiError('Worker not found', 404);

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);

    const review = await prisma.guestReview.create({
      data: {
        workerId: profile.userId,
        reviewerName: parsed.data.reviewerName,
        reviewerPhone: parsed.data.reviewerPhone || null,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    // Update worker rating stats
    const allReviews = await prisma.guestReview.aggregate({
      where: { workerId: profile.userId, isVisible: true },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.workerProfile.update({
      where: { userId: profile.userId },
      data: {
        ratingAvg: allReviews._avg.rating ?? 0,
        totalReviews: allReviews._count,
      },
    });

    return apiSuccess(review, 201);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to submit review', 500);
  }
}
