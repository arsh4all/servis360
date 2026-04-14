import { NextRequest } from 'next/server';
import { verifyAccessToken, getTokenFromHeader, type TokenPayload } from './jwt';
import { cookies } from 'next/headers';

export type AuthUser = TokenPayload;

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Try Authorization header first
    const authHeader = req.headers.get('authorization');
    let token = getTokenFromHeader(authHeader);

    // Fallback to cookie
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('access_token')?.value || null;
    }

    if (!token) return null;

    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  return user;
}

export async function requireRole(
  req: NextRequest,
  roles: Array<'CUSTOMER' | 'WORKER' | 'ADMIN'>
): Promise<AuthUser> {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return user;
}

// Custom error classes
export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  statusCode = 422;
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
