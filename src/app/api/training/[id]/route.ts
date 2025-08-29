import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { NotFoundError, AuthorizationError } from '@/lib/errors';

async function getTrainingMaterialHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trainingMaterialId = params.id;

  // Get user from auth context
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  // Find training material
  const trainingMaterial = await prisma.trainingMaterial.findUnique({
    where: { id: trainingMaterialId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
        },
        include: {
          idealClientProfiles: {
            select: {
              id: true,
              title: true,
              demographics: true,
              painPoints: true,
              motivations: true,
              preferredTone: true,
              generatedAt: true,
            },
          },
        },
      },
      user: {
        select: {
          businessName: true,
          businessType: true,
        },
      },
    },
  });

  if (!trainingMaterial) {
    throw new NotFoundError('Training material not found');
  }

  // Check ownership
  if (trainingMaterial.userId !== userId) {
    throw new AuthorizationError('Access denied to this training material');
  }

  return NextResponse.json({
    ...trainingMaterial,
    type: trainingMaterial.type.toLowerCase().replace('_', '-'),
    status: trainingMaterial.status.toLowerCase(),
    user: {
      ...trainingMaterial.user,
      businessType: trainingMaterial.user.businessType.toLowerCase(),
    },
  });
}

async function updateTrainingMaterialHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trainingMaterialId = params.id;
  const body = await request.json();

  // Get user from auth context
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  // Find and check ownership
  const existingMaterial = await prisma.trainingMaterial.findUnique({
    where: { id: trainingMaterialId },
  });

  if (!existingMaterial) {
    throw new NotFoundError('Training material not found');
  }

  if (existingMaterial.userId !== userId) {
    throw new AuthorizationError('Access denied to this training material');
  }

  // Update material
  const updatedMaterial = await prisma.trainingMaterial.update({
    where: { id: trainingMaterialId },
    data: {
      title: body.title || existingMaterial.title,
      content: body.content || existingMaterial.content,
      status: body.status ? body.status.toUpperCase() : existingMaterial.status,
      version: existingMaterial.version + 1,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json({
    message: 'Training material updated successfully',
    ...updatedMaterial,
    type: updatedMaterial.type.toLowerCase().replace('_', '-'),
    status: updatedMaterial.status.toLowerCase(),
  });
}

async function deleteTrainingMaterialHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trainingMaterialId = params.id;

  // Get user from auth context
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  // Find and check ownership
  const existingMaterial = await prisma.trainingMaterial.findUnique({
    where: { id: trainingMaterialId },
  });

  if (!existingMaterial) {
    throw new NotFoundError('Training material not found');
  }

  if (existingMaterial.userId !== userId) {
    throw new AuthorizationError('Access denied to this training material');
  }

  // Delete material
  await prisma.trainingMaterial.delete({
    where: { id: trainingMaterialId },
  });

  return NextResponse.json({
    message: 'Training material deleted successfully',
  });
}

export const GET = handleAsyncRoute(withAuth(getTrainingMaterialHandler));
export const PUT = handleAsyncRoute(withAuth(updateTrainingMaterialHandler));
export const DELETE = handleAsyncRoute(withAuth(deleteTrainingMaterialHandler));