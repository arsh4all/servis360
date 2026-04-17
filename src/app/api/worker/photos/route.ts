import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

const addPhotoSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(200).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['WORKER']);

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    });
    if (!profile) return apiError('Worker profile not found', 404);

    const photos = await prisma.workerPhoto.findMany({
      where: { workerId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    return apiSuccess(photos);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch photos', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['WORKER']);
    const body = await req.json();
    const parsed = addPhotoSchema.safeParse(body);
    if (!parsed.success) return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    });
    if (!profile) return apiError('Worker profile not found', 404);

    // Count existing photos — cap at 20
    const count = await prisma.workerPhoto.count({ where: { workerId: profile.id } });
    if (count >= 20) return apiError('Maximum 20 photos allowed', 400);

    const photo = await prisma.workerPhoto.create({
      data: {
        workerId: profile.id,
        url: parsed.data.url,
        caption: parsed.data.caption || null,
        sortOrder: parsed.data.sortOrder ?? count,
      },
    });

    return apiSuccess(photo, 201);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to add photo', 500);
  }
}
