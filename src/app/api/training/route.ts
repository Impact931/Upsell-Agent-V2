import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build where clause
  const where: any = { userId };
  
  if (productId) {
    where.productId = productId;
  }
  
  if (type) {
    where.type = type.toUpperCase().replace('-', '_');
  }
  
  if (status) {
    where.status = status.toUpperCase();
  }

  // Get training materials with ICPs
  const [trainingMaterials, totalCount] = await Promise.all([
    prisma.trainingMaterial.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
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
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.trainingMaterial.count({ where }),
  ]);

    return NextResponse.json({
      trainingMaterials: trainingMaterials.map((material) => ({
        ...material,
        type: material.type.toLowerCase().replace('_', '-'),
        status: material.status.toLowerCase(),
        product: material.product ? {
          ...material.product,
          idealClientProfiles: material.product.idealClientProfiles?.map(icp => ({
            ...icp,
            demographics: typeof icp.demographics === 'string' ? JSON.parse(icp.demographics) : icp.demographics,
            painPoints: typeof icp.painPoints === 'string' ? JSON.parse(icp.painPoints) : icp.painPoints,
            motivations: typeof icp.motivations === 'string' ? JSON.parse(icp.motivations) : icp.motivations,
          })) || []
        } : undefined,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Training materials error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}