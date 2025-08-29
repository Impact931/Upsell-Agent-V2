import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { parseAndValidateBody } from '@/lib/validation';
import { RegisterSchema } from '@/lib/validation';
import { ValidationError, AuthenticationError } from '@/lib/errors';

async function registerHandler(request: NextRequest) {
  // Parse and validate request body
  const { email, password, businessName, businessType, role } = await parseAndValidateBody(
    request,
    RegisterSchema
  );

  // Validate password strength
  const passwordValidation = authService.validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password does not meet requirements', {
      issues: passwordValidation.issues,
    });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AuthenticationError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await authService.hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName,
      businessType: businessType.toUpperCase(),
      role: role.toUpperCase(),
    },
    select: {
      id: true,
      email: true,
      businessName: true,
      businessType: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = authService.generateToken({
    id: user.id,
    email: user.email,
    role: user.role.toLowerCase() as 'manager' | 'staff',
  });

  return NextResponse.json({
    message: 'User registered successfully',
    token,
    user: {
      ...user,
      businessType: user.businessType.toLowerCase() as 'spa' | 'salon' | 'wellness',
      role: user.role.toLowerCase() as 'manager' | 'staff',
    },
    expiresIn: '7d',
  }, { status: 201 });
}

export const POST = handleAsyncRoute(registerHandler);