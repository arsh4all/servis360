import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// GET single worker
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ['ADMIN']);
    const profile = await prisma.workerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        workerServices: { include: { service: true } },
      },
    });
    if (!profile) return apiError('Worker not found', 404);
    return apiSuccess(profile);
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch worker', 500);
  }
}

// PUT update worker
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ['ADMIN']);
    const body = await req.json();
    const { name, email, phone, avatarUrl, bio, location, experienceYears, isAvailable, isFeatured, isApproved, isVerified, services } = body;

    const profile = await prisma.workerProfile.findUnique({ where: { id: params.id } });
    if (!profile) return apiError('Worker not found', 404);

    // Update user fields
    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    // Update profile fields
    await prisma.workerProfile.update({
      where: { id: params.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location && { location }),
        ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isApproved !== undefined && { isApproved }),
        ...(isVerified !== undefined && { isVerified }),
      },
    });

    // Update services if provided
    if (services && Array.isArray(services)) {
      // Remove existing worker services
      await prisma.workerService.deleteMany({ where: { workerId: params.id } });
      // Add new ones
      if (services.length > 0) {
        await prisma.workerService.createMany({
          data: services.map((s: any) => ({
            workerId: params.id,
            serviceId: s.serviceId,
            price: s.price,
            pricingType: s.pricingType || 'FIXED',
          })),
        });
      }
    }

    return apiSuccess({ id: params.id }, 'Worker updated successfully');
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update worker', 500);
  }
}

// DELETE worker
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ['ADMIN']);
    const profile = await prisma.workerProfile.findUnique({ where: { id: params.id } });
    if (!profile) return apiError('Worker not found', 404);
    // Deleting user cascades to profile
    await prisma.user.delete({ where: { id: profile.userId } });
    return apiSuccess(null, 'Worker deleted successfully');
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to delete worker', 500);
  }
}
