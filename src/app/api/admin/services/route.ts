import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { workerServices: true, bookings: true } } },
    });
    return apiSuccess(services);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch services', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ['ADMIN']);
    const { name, slug, icon, description, imageUrl, sortOrder } = await req.json();

    if (!name || !slug) return apiError('Name and slug are required', 400);

    const existing = await prisma.service.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) return apiError('Service with this name or slug already exists', 409);

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        icon: icon || '⚙️',
        description,
        imageUrl,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });
    return apiSuccess(service, 'Service created successfully');
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to create service', 500);
  }
}
