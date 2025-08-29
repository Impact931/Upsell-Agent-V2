import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { parseAndValidateBody } from '@/lib/validation';
import { AuthSchema } from '@/lib/validation';
import { AuthenticationError } from '@/lib/errors';

async function loginHandler(request: NextRequest) {
  // Parse and validate request body
  const { email, password } = await parseAndValidateBody(request, AuthSchema);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await authService.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate JWT token
  const token = authService.generateToken({
    id: user.id,
    email: user.email,
    role: user.role.toLowerCase() as 'manager' | 'staff',
  });

  // Update last login (optional - can be added to schema later)
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      businessType: user.businessType.toLowerCase() as 'spa' | 'salon' | 'wellness',
      role: user.role.toLowerCase() as 'manager' | 'staff',
      createdAt: user.createdAt,
    },
    expiresIn: '7d',
  });
}

export const POST = handleAsyncRoute(loginHandler);