import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: authUser.userId, isRead: false },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch notifications', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    await prisma.notification.updateMany({
      where: { userId: authUser.userId, isRead: false },
      data: { isRead: true },
    });

    return apiSuccess({ message: 'All notifications marked as read' });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update notifications', 500);
  }
}
