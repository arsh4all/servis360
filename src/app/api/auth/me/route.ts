import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        workerProfile: true,
        subscription: true,
      },
    });

    if (!user) return apiError('User not found', 404);

    return apiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      workerProfile: user.workerProfile,
      subscription: user.subscription,
    });
  } catch (error: any) {
    if (error.statusCode === 401) return apiError(error.message, 401);
    return apiError('Internal server error', 500);
  }
}
