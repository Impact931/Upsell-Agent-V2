import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/database';

async function verifyHandler(request: NextRequest) {
  // Get token from Authorization header
  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { code: 'MISSING_TOKEN', message: 'Authorization token required' } },
      { status: 401 }
    );
  }

  const token = authorization.replace('Bearer ', '');

  try {
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        businessName: true,
        businessType: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        ...user,
        businessType: user.businessType.toLowerCase(),
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
      { status: 401 }
    );
  }
}

export const GET = handleAsyncRoute(verifyHandler);