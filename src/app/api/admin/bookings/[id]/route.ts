import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ['ADMIN']);
    const { status, workerId, declineReason } = await req.json();

    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!booking) return apiError('Booking not found', 404);

    const updateData: any = {};
    if (status) updateData.status = status;
    if (workerId) updateData.workerId = workerId;
    if (declineReason) updateData.declineReason = declineReason;
    if (status === 'ACCEPTED') updateData.confirmedAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true } },
        worker: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: updated.customerId,
        title: `Booking ${status?.toLowerCase() || 'updated'}`,
        body: status === 'ACCEPTED'
          ? `Your booking for ${updated.service.name} has been accepted.`
          : status === 'DECLINED'
          ? `Your booking has been declined. ${declineReason || ''}`
          : `Your booking status has been updated to ${status}.`,
        type: 'booking_update',
        actionUrl: '/dashboard',
      },
    });

    return apiSuccess(updated, 'Booking updated');
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to update booking', 500);
  }
}
