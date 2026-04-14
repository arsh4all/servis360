import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['WORKER', 'ADMIN']);

    const workerId = authUser.userId;

    const [
      totalBookings,
      pendingRequests,
      completedBookings,
      earnings,
      profile,
    ] = await Promise.all([
      prisma.booking.count({ where: { workerId } }),
      prisma.booking.count({ where: { workerId, status: 'PENDING' } }),
      prisma.booking.count({ where: { workerId, status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        where: { workerId, status: 'COMPLETED' },
        _sum: { workerEarning: true },
      }),
      prisma.workerProfile.findUnique({
        where: { userId: workerId },
        select: { ratingAvg: true, totalReviews: true },
      }),
    ]);

    return apiSuccess({
      totalBookings,
      pendingRequests,
      completedBookings,
      totalEarnings: Number(earnings._sum.workerEarning || 0),
      ratingAvg: profile?.ratingAvg || 0,
      totalReviews: profile?.totalReviews || 0,
    });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch worker stats', 500);
  }
}
