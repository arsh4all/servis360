import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { workerServices: { where: { worker: { isApproved: true } } } },
        },
      },
    });

    return apiSuccess(
      services.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        description: s.description,
        workerCount: s._count.workerServices,
      }))
    );
  } catch (error) {
    return apiError('Failed to fetch services', 500);
  }
}
