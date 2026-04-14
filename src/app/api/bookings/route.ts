import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiSuccess, apiError, calculateFees } from '@/lib/utils';

const createBookingSchema = z.object({
  workerId: z.string().uuid('Invalid worker ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  addressNotes: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().positive('Price must be positive'),
});

// GET: List bookings for current user
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    let where: any = {};

    if (authUser.role === 'CUSTOMER') {
      where.customerId = authUser.userId;
    } else if (authUser.role === 'WORKER') {
      where.workerId = authUser.userId;
    }
    // Admin sees all

    if (status) where.status = status;

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, avatarUrl: true } },
          worker: { select: { id: true, name: true, avatarUrl: true } },
          service: true,
          review: { select: { id: true, rating: true, comment: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return apiSuccess({
      items: bookings.map((b) => ({
        ...b,
        totalPrice: Number(b.totalPrice),
        platformFee: Number(b.platformFee),
        workerEarning: Number(b.workerEarning),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to fetch bookings', 500);
  }
}

// POST: Create new booking
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireRole(req, ['CUSTOMER']);
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
    }

    const { workerId, serviceId, date, timeSlot, address, addressNotes, notes, totalPrice } =
      parsed.data;

    // Verify worker exists and is approved
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { id: workerId },
      include: { workerServices: { where: { serviceId } } },
    });

    if (!workerProfile || !workerProfile.isApproved) {
      return apiError('Worker not found or not available', 404);
    }

    if (workerProfile.workerServices.length === 0) {
      return apiError('Worker does not offer this service', 400);
    }

    // Prevent double-booking on same date+time
    const conflict = await prisma.booking.findFirst({
      where: {
        workerId: workerProfile.userId,
        date: new Date(date),
        timeSlot,
        status: { in: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (conflict) {
      return apiError('This time slot is already booked. Please choose another.', 409);
    }

    const fees = calculateFees(totalPrice);

    const booking = await prisma.booking.create({
      data: {
        customerId: authUser.userId,
        workerId: workerProfile.userId,
        serviceId,
        date: new Date(date),
        timeSlot,
        address,
        addressNotes,
        notes,
        status: 'PENDING',
        totalPrice: fees.totalPrice,
        platformFee: fees.platformFee,
        workerEarning: fees.workerEarning,
      },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        worker: { select: { id: true, name: true, avatarUrl: true } },
        service: true,
      },
    });

    // Create notification for worker
    await prisma.notification.create({
      data: {
        userId: workerProfile.userId,
        title: 'New Booking Request',
        body: `You have a new booking request from ${booking.customer.name}`,
        type: 'booking_update',
        actionUrl: `/worker/bookings/${booking.id}`,
      },
    });

    return apiSuccess(
      {
        ...booking,
        totalPrice: Number(booking.totalPrice),
        platformFee: Number(booking.platformFee),
        workerEarning: Number(booking.workerEarning),
      },
      201
    );
  } catch (error: any) {
    console.error('Booking create error:', error);
    if (error.statusCode) return apiError(error.message, error.statusCode);
    return apiError('Failed to create booking', 500);
  }
}
