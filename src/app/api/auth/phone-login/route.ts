import { NextRequest } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/utils';

const schema = z.object({
  idToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError('Invalid request', 400);

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(parsed.data.idToken);
    } catch {
      return apiError('Invalid or expired verification code', 401);
    }

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) return apiError('No phone number in token', 400);

    // Look up user by phone number
    const user = await prisma.user.findFirst({
      where: { phone: phoneNumber },
    });

    if (!user) {
      return apiError(
        'No account found with this phone number. Please register first or add your phone number in Settings.',
        404
      );
    }

    if (!user.isActive) return apiError('Account is deactivated', 403);

    // Issue our own JWT tokens
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

    const response = apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    });

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
    console.error('Phone login error:', error);
    return apiError('Internal server error', 500);
  }
}
