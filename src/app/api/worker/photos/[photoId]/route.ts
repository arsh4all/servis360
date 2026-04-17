import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const authUser = await requireRole(req, ['WORKER']);

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    });
    if (!profile) return apiError('Worker profile not found', 404);

    const photo = await prisma.workerPhoto.findFirst({
      where: { id: params.photoId, workerId: profile.id },
    });
    if (!photo) return apiError('Photo not found', 404);

    await prisma.workerPhoto.delete({ where: { id: params.photoId } });

    return apiSuccess({ deleted: true });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to delete photo', 500);
  }
}
