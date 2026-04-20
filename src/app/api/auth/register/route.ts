import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  role: z.enum(['CUSTOMER', 'WORKER']),
  avatarUrl: z.string().url().optional(),
  // Worker profile fields
  phone: z.string().max(20).optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  tagline: z.string().max(150).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  responseTime: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  photos: z.array(z.string().url()).optional(),
  services: z.array(z.object({
    serviceId: z.string(),
    price: z.number().positive(),
    pricingType: z.enum(['FIXED', 'HOURLY']),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
    }

    const {
      name, email, password, role, avatarUrl,
      phone, coverImageUrl, tagline, bio, location,
      experienceYears, responseTime, videoUrl, photos, services,
    } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError('An account with this email already exists', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone: phone || null,
        avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=FACC15&size=200`,
      },
    });

    if (role === 'WORKER') {
      const profile = await prisma.workerProfile.create({
        data: {
          userId: user.id,
          location: location || 'Mauritius',
          bio: bio || null,
          tagline: tagline || null,
          coverImageUrl: coverImageUrl || null,
          videoUrl: videoUrl || null,
          experienceYears: experienceYears ?? 0,
          responseTime: responseTime || 'Usually within 1 hour',
          isApproved: false,
          isVerified: false,
        },
      });

      if (services && services.length > 0) {
        await prisma.workerService.createMany({
          data: services.map((s) => ({
            workerId: profile.id,
            serviceId: s.serviceId,
            price: s.price,
            pricingType: s.pricingType,
          })),
          skipDuplicates: true,
        });
      }

      if (photos && photos.length > 0) {
        await prisma.workerPhoto.createMany({
          data: photos.map((url, i) => ({
            workerId: profile.id,
            url,
            sortOrder: i,
          })),
        });
      }
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, name: user.name };
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const response = apiSuccess(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
        accessToken,
        refreshToken,
      },
      201
    );

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Internal server error', 500);
  }
}
