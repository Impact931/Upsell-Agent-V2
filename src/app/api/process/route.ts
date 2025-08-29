import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { withAuth } from '@/lib/auth';
import { openaiService } from '@/lib/openai';
import { prisma } from '@/lib/database';
import { parseAndValidateBody } from '@/lib/validation';
import { ProcessingSchema } from '@/lib/validation';
import { NotFoundError, FileProcessingError } from '@/lib/errors';

async function processHandler(request: NextRequest) {
  // Parse and validate request body
  const { sessionId, productData, trainingOptions } = await parseAndValidateBody(
    request,
    ProcessingSchema
  );

  // Get user from auth context
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  // Check if this is a text-only submission or a file-based submission
  let extractedData: any = null;
  let uploadSession: any = null;

  // Try to get upload session first
  if (sessionId) {
    uploadSession = await prisma.uploadSession.findFirst({
      where: {
        id: sessionId,
        userId,
        status: 'COMPLETED',
      },
    });
  }

  // If we have an upload session, use its extracted data
  if (uploadSession) {
    extractedData = uploadSession.extractedData as any;
    if (!extractedData) {
      throw new FileProcessingError('No extracted data available for processing');
    }
  } else {
    // For text-only submissions, create minimal extracted data structure
    if (!productData || !productData.name) {
      throw new Error('Product data is required for text-only submissions');
    }
    
    extractedData = {
      extractedProduct: {},
      userProvidedData: productData,
      text: productData.description || '',
    };
  }

  try {
    // Merge product data from extraction and user input
    const mergedProductData = {
      ...extractedData.extractedProduct,
      ...productData,
      ...extractedData.userProvidedData,
    };

    // Create product record
    const product = await prisma.product.create({
      data: {
        userId,
        name: mergedProductData.name || 'Untitled Product',
        description: mergedProductData.description || extractedData.text.substring(0, 500),
        price: mergedProductData.price || 0,
        category: mergedProductData.category || 'General',
        ingredients: JSON.stringify(mergedProductData.ingredients || []),
        benefits: JSON.stringify(mergedProductData.benefits || []),
        targetAudience: mergedProductData.targetAudience || null,
        imageUrl: mergedProductData.imageUrl || null,
      },
    });

    // Get user business info for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessType: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prepare training generation context
    const includeTypes = [];
    if (trainingOptions.includeScript) includeTypes.push('script');
    if (trainingOptions.includeGuide) includeTypes.push('guide');
    if (trainingOptions.includeFAQ) includeTypes.push('faq');
    if (trainingOptions.includeObjectionHandling) includeTypes.push('objection-handling');

    const generationContext = {
      product: {
        ...product,
        ingredients: typeof product.ingredients === 'string' 
          ? (product.ingredients ? JSON.parse(product.ingredients) : []) 
          : product.ingredients || [],
        benefits: typeof product.benefits === 'string' 
          ? (product.benefits ? JSON.parse(product.benefits) : []) 
          : product.benefits || [],
        targetAudience: product.targetAudience || undefined,
        imageUrl: product.imageUrl || undefined,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      businessType: user.businessType.toLowerCase(),
      targetAudience: trainingOptions.targetAudience || product.targetAudience || 'General wellness clients',
      tone: trainingOptions.tone || 'professional',
      includeTypes,
    };

    // Generate Ideal Client Profiles first
    const productText = mergedProductData.description || extractedData.text || '';
    
    // Prepare product data with arrays for ICP generation
    const productForICP = {
      ...product,
      targetAudience: product.targetAudience || undefined,
      imageUrl: product.imageUrl || undefined,
      ingredients: typeof product.ingredients === 'string' 
        ? (product.ingredients ? JSON.parse(product.ingredients) : []) 
        : product.ingredients || [],
      benefits: typeof product.benefits === 'string' 
        ? (product.benefits ? JSON.parse(product.benefits) : []) 
        : product.benefits || [],
    };
    
    const idealClientProfiles = await openaiService.generateIdealClientProfiles(productText, productForICP);
    
    // Save ICPs to database
    const savedICPs = await Promise.all(
      idealClientProfiles.map((icp) =>
        prisma.idealClientProfile.create({
          data: {
            productId: product.id,
            userId,
            title: icp.title,
            demographics: typeof icp.demographics === 'string' ? icp.demographics : JSON.stringify(icp.demographics),
            painPoints: typeof icp.painPoints === 'string' ? icp.painPoints : JSON.stringify(icp.painPoints),
            motivations: typeof icp.motivations === 'string' ? icp.motivations : JSON.stringify(icp.motivations),
            preferredTone: icp.preferredTone,
            generatedAt: icp.generatedAt,
          },
        })
      )
    );

    // Generate training materials with ICP context
    const trainingMaterials = await openaiService.generateAllTrainingMaterials({
      ...generationContext,
      idealClientProfiles: savedICPs,
    });

    // Save training materials to database
    const savedMaterials = await Promise.all(
      trainingMaterials.map((material) =>
        prisma.trainingMaterial.create({
          data: {
            productId: product.id,
            userId,
            title: material.title,
            content: material.content,
            type: material.type.toUpperCase().replace('-', '_') as any,
            duration: material.duration,
            generatedAt: material.generatedAt,
            version: material.version,
            status: 'PUBLISHED',
          },
        })
      )
    );

    // Calculate total estimated duration
    const totalDuration = savedMaterials.reduce((sum, material) => sum + material.duration, 0);

    return NextResponse.json({
      message: 'Training materials generated successfully',
      product: {
        ...product,
        businessType: user.businessType.toLowerCase(),
      },
      idealClientProfiles: savedICPs.map((icp) => ({
        ...icp,
        demographics: typeof icp.demographics === 'string' ? JSON.parse(icp.demographics) : icp.demographics,
        painPoints: typeof icp.painPoints === 'string' ? JSON.parse(icp.painPoints) : icp.painPoints,
        motivations: typeof icp.motivations === 'string' ? JSON.parse(icp.motivations) : icp.motivations,
      })),
      trainingMaterials: savedMaterials.map((material) => ({
        ...material,
        type: material.type.toLowerCase().replace('_', '-'),
        status: material.status.toLowerCase(),
      })),
      estimatedDuration: totalDuration,
      generatedAt: new Date(),
    });

  } catch (error: any) {
    throw new FileProcessingError(
      'Failed to generate training materials',
      {
        sessionId,
        originalError: error.message,
      }
    );
  }
}

export const POST = handleAsyncRoute(withAuth(processHandler));