import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

const schema = z.object({
  approved: z.boolean(),
  verified: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(req, ['ADMIN']);
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422);
    }

    const profile = await prisma.workerProfile.update({
      where: { id: params.id },
      data: {
        isApproved: parsed.data.approved,
        ...(parsed.data.verified !== undefined ? { isVerified: parsed.data.verified } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        title: parsed.data.approved ? 'Profile Approved!' : 'Profile Review Update',
        body: parsed.data.approved
          ? 'Congratulations! Your worker profile has been approved. You can now receive bookings.'
          : 'Your worker profile requires some updates. Please check your profile.',
        type: 'system',
        actionUrl: '/worker',
      },
    });

    return apiSuccess({ id: profile.id, isApproved: profile.isApproved });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update worker', 500);
  }
}
