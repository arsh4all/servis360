import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalWorkers,
      totalCustomers,
      pendingApprovals,
      totalBookings,
      activeBookings,
      monthlyRevenue,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'WORKER', isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      prisma.workerProfile.count({ where: { isApproved: false } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: { in: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] } },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
    ]);

    return apiSuccess({
      totalUsers,
      totalWorkers,
      totalCustomers,
      pendingApprovals,
      totalBookings,
      activeBookings,
      monthlyRevenue: Number(monthlyRevenue._sum.platformFee || 0),
      totalRevenue: Number(totalRevenue._sum.platformFee || 0),
    });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch admin stats', 500);
  }
}
