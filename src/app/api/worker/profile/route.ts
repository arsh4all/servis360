import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  tagline: z.string().max(150).optional().or(z.literal('')),
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  location: z.string().min(2).max(100).optional(),
  isAvailable: z.boolean().optional(),
  responseTime: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['WORKER']);

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authUser.userId },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, phone: true } },
        workerServices: { include: { service: true } },
      },
    });

    if (!profile) return apiError('Worker profile not found', 404);

    return apiSuccess(profile);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch worker profile', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['WORKER']);
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
    }

    const { name, avatarUrl, phone, ...profileData } = parsed.data;

    // Update user fields (name, avatarUrl, phone) if provided
    if (name !== undefined || avatarUrl !== undefined || phone !== undefined) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(avatarUrl !== undefined && avatarUrl !== '' && { avatarUrl }),
          ...(phone !== undefined && { phone: phone === '' ? null : phone }),
        },
      });
    }

    // Clean up empty string optionals for profile fields
    if (profileData.coverImageUrl === '') (profileData as any).coverImageUrl = null;
    if (profileData.videoUrl === '') (profileData as any).videoUrl = null;
    if (profileData.tagline === '') (profileData as any).tagline = null;

    const profile = await prisma.workerProfile.update({
      where: { userId: authUser.userId },
      data: profileData,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, phone: true } },
      },
    });

    return apiSuccess(profile);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update profile', 500);
  }
}
