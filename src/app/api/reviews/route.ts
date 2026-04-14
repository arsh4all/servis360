import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['CUSTOMER']);
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
    }

    const { bookingId, rating, comment } = parsed.data;

    // Verify booking belongs to customer and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) return apiError('Booking not found', 404);
    if (booking.customerId !== authUser.userId) return apiError('Forbidden', 403);
    if (booking.status !== 'COMPLETED') {
      return apiError('Can only review completed bookings', 400);
    }
    if (booking.review) {
      return apiError('You have already reviewed this booking', 409);
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: authUser.userId,
        workerId: booking.workerId,
        rating,
        comment,
      },
      include: {
        customer: { select: { name: true, avatarUrl: true } },
      },
    });

    // Update worker's average rating
    const workerReviews = await prisma.review.aggregate({
      where: { workerId: booking.workerId, isVisible: true },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.workerProfile.update({
      where: { userId: booking.workerId },
      data: {
        ratingAvg: workerReviews._avg.rating || 0,
        totalReviews: workerReviews._count,
      },
    });

    return apiSuccess(review, 201);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to submit review', 500);
  }
}
