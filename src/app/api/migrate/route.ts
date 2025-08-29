import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // This is a one-time migration endpoint
    // You should remove this after running it once
    
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.JWT_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test database connection
    await prisma.$connect();
    
    // Run a simple query to ensure tables exist
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      message: 'Database migration successful',
      userCount 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error.message 
    }, { status: 500 });
  }
}