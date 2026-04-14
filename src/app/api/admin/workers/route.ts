import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);
    const { searchParams } = req.nextUrl;
    const approved = searchParams.get('approved');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (approved === 'false') where.isApproved = false;
    if (approved === 'true') where.isApproved = true;

    const [profiles, total] = await prisma.$transaction([
      prisma.workerProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
          },
          workerServices: { include: { service: true } },
        },
      }),
      prisma.workerProfile.count({ where }),
    ]);

    return apiSuccess({
      items: profiles.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        avatarUrl: p.user.avatarUrl,
        location: p.location,
        isApproved: p.isApproved,
        isVerified: p.isVerified,
        ratingAvg: p.ratingAvg,
        totalReviews: p.totalReviews,
        createdAt: p.user.createdAt,
        services: p.workerServices.map((ws) => ws.service.name),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch workers', 500);
  }
}
