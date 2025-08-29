import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Simple database initialization - create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "businessName" TEXT NOT NULL,
        "businessType" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "ingredients" TEXT NOT NULL,
        "benefits" TEXT NOT NULL,
        "targetAudience" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "products_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ideal_client_profiles" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "demographics" TEXT NOT NULL,
        "painPoints" TEXT NOT NULL,
        "motivations" TEXT NOT NULL,
        "preferredTone" TEXT NOT NULL,
        "generatedAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "ideal_client_profiles_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "training_materials" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "duration" INTEGER NOT NULL,
        "generatedAt" TIMESTAMP(3) NOT NULL,
        "version" INTEGER NOT NULL DEFAULT 1,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "targetIcpId" TEXT,
        
        CONSTRAINT "training_materials_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "upload_sessions" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "filename" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UPLOADING',
        "extractedData" TEXT,
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "upload_sessions_pkey" PRIMARY KEY ("id")
      );
    `;

    // Test the connection and tables
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database initialized successfully',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}