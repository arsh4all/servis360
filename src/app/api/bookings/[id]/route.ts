import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']),
  reason: z.string().optional(),
});

// GET: Single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        worker: { select: { id: true, name: true, avatarUrl: true } },
        service: true,
        review: {
          include: {
            customer: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!booking) return apiError('Booking not found', 404);

    // Only involved parties or admin can view
    const canView =
      authUser.role === 'ADMIN' ||
      booking.customerId === authUser.userId ||
      booking.workerId === authUser.userId;

    if (!canView) return apiError('Forbidden', 403);

    return apiSuccess({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      platformFee: Number(booking.platformFee),
      workerEarning: Number(booking.workerEarning),
    });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch booking', 500);
  }
}

// PATCH: Update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
    }

    const { status, reason } = parsed.data;

    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!booking) return apiError('Booking not found', 404);

    // Permission checks
    if (status === 'ACCEPTED' || status === 'DECLINED') {
      if (authUser.role !== 'WORKER' || booking.workerId !== authUser.userId) {
        return apiError('Only the assigned worker can accept or decline', 403);
      }
      if (booking.status !== 'PENDING') {
        return apiError('Can only accept/decline pending bookings', 400);
      }
    }

    if (status === 'COMPLETED') {
      if (authUser.role !== 'WORKER' || booking.workerId !== authUser.userId) {
        return apiError('Only the assigned worker can mark as complete', 403);
      }
      if (booking.status !== 'ACCEPTED' && booking.status !== 'IN_PROGRESS') {
        return apiError('Can only complete accepted bookings', 400);
      }
    }

    if (status === 'CANCELLED') {
      const canCancel =
        (authUser.role === 'CUSTOMER' && booking.customerId === authUser.userId) ||
        authUser.role === 'ADMIN';
      if (!canCancel) return apiError('Not authorized to cancel this booking', 403);
    }

    const updateData: any = { status };
    if (status === 'DECLINED') updateData.declineReason = reason;
    if (status === 'CANCELLED') updateData.cancelReason = reason;
    if (status === 'ACCEPTED') updateData.confirmedAt = new Date();
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      // Update worker stats
      await prisma.workerProfile.update({
        where: { userId: booking.workerId },
        data: { totalBookings: { increment: 1 } },
      });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        worker: { select: { id: true, name: true, avatarUrl: true } },
        service: true,
      },
    });

    // Notify the other party
    const notifyUserId =
      authUser.role === 'WORKER' ? booking.customerId : booking.workerId;

    const statusMessages: Record<string, string> = {
      ACCEPTED: 'Your booking has been accepted!',
      DECLINED: 'Your booking request was declined.',
      COMPLETED: 'Your booking has been completed.',
      CANCELLED: 'A booking has been cancelled.',
    };

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        title: `Booking ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        body: statusMessages[status] || 'Booking updated',
        type: 'booking_update',
        actionUrl: `/dashboard/bookings/${params.id}`,
      },
    });

    return apiSuccess({
      ...updated,
      totalPrice: Number(updated.totalPrice),
      platformFee: Number(updated.platformFee),
      workerEarning: Number(updated.workerEarning),
    });
  } catch (error: any) {
    console.error('Booking update error:', error);
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update booking', 500);
  }
}
