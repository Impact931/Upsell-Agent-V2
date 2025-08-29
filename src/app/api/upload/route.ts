import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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

    // Check if this is a JSON request (text-only submission) or FormData (file upload)
    const contentType = request.headers.get('content-type') || '';
    let text: string;
    let filename: string;
    let fileSize: number;
    let extractedData: any;

    if (contentType.includes('application/json')) {
      // Handle JSON text-only submissions
      const jsonData = await request.json();
      filename = jsonData.filename;
      fileSize = jsonData.fileSize;
      extractedData = jsonData.extractedData;
      text = extractedData.text;
      
      // Validate text submission
      if (!text || text.trim().length === 0) {
        return NextResponse.json({ error: 'No content provided' }, { status: 400 });
      }
    } else {
      // Handle FormData file uploads
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB
        return NextResponse.json({ error: 'File too large' }, { status: 400 });
      }

      filename = file.name;
      fileSize = file.size;

      // Extract metadata from FormData
      const productName = formData.get('productName') as string;
      const productDescription = formData.get('productDescription') as string;
      const recommendedPrice = formData.get('recommendedPrice') as string;


      // Read file content (handle different file types)
      if (file.type === 'application/pdf') {
        text = `PDF document: ${file.name}. Content parsing will be implemented with proper PDF library.`;
      } else {
        text = await file.text();
      }

      // Create extracted data for file uploads with user-provided metadata
      extractedData = {
        text,
        confidence: 0.9,
        processingTime: 500,
        userProvidedData: {
          name: productName || filename.replace(/\.[^/.]+$/, ''),
          description: productDescription || text.substring(0, 500),
          price: recommendedPrice ? parseFloat(recommendedPrice) || 0.01 : 0.01,
          category: 'General'
        }
      };
    }
    
    // Create Product record (use extracted data if available from text submissions)
    const productData = extractedData.extractedProduct || extractedData.userProvidedData;
    const productName = productData?.name || filename.replace(/\.[^/.]+$/, '') || 'New Product';
    
    
    // Check for duplicate product names
    const existingProduct = await prisma.product.findFirst({
      where: {
        userId,
        name: productName,
      },
    });

    if (existingProduct) {
      return NextResponse.json({
        error: 'Duplicate Product Found',
        message: `A product named "${productName}" already exists. Please use a different name or update the existing product.`,
        existingProductId: existingProduct.id,
      }, { status: 409 }); // 409 Conflict
    }
    const product = await prisma.product.create({
      data: {
        userId,
        name: productName,
        description: productData?.description || text.substring(0, 500) || 'Product extracted from uploaded content',
        category: productData?.category || 'General',
        price: productData?.price || 0.00,
        ingredients: JSON.stringify(productData?.ingredients || []),
        benefits: JSON.stringify(productData?.benefits || []),
        targetAudience: productData?.targetAudience || 'Target audience to be determined',
        imageUrl: productData?.imageUrl || null,
      },
    });

    // Generate enhanced training materials with ICPs
    const { idealClientProfiles, trainingMaterials } = await createEnhancedTrainingMaterials(userId, product.id, text);
    
    // Create upload session
    const uploadSession = await prisma.uploadSession.create({
      data: {
        userId,
        filename,
        fileType: contentType.includes('application/json') ? 'TEXT' : getFileType(contentType),
        fileSize,
        status: 'COMPLETED',
        extractedData: JSON.stringify(extractedData),
      },
    });

    return NextResponse.json({
      sessionId: uploadSession.id,
      productId: product.id,
      idealClientProfilesCount: idealClientProfiles.length,
      trainingMaterialsCount: trainingMaterials.length,
      status: 'completed',
      message: 'File processed successfully, ICPs generated, and enhanced training materials created',
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function createEnhancedTrainingMaterials(userId: string, productId: string, text: string) {
  const { openaiService } = await import('@/lib/openai');
  
  console.log('Starting enhanced AI workflow...');
  
  // Step 1: Generate Ideal Client Profiles first
  console.log('Step 1: Generating Ideal Client Profiles...');
  const idealClientProfiles = await openaiService.generateIdealClientProfiles(text, { id: productId, userId });
  
  // Step 2: Store ICPs in database
  const storedICPs = [];
  for (const icp of idealClientProfiles) {
    try {
      const storedICP = await prisma.idealClientProfile.create({
        data: {
          userId,
          productId,
          title: icp.title,
          demographics: JSON.stringify(icp.demographics),
          painPoints: JSON.stringify(icp.painPoints),
          motivations: JSON.stringify(icp.motivations),
          preferredTone: icp.preferredTone,
          generatedAt: icp.generatedAt,
        },
      });
      storedICPs.push({
        ...icp,
        id: storedICP.id,
        demographics: icp.demographics,
        painPoints: icp.painPoints,
        motivations: icp.motivations,
      });
      console.log(`Stored ICP: ${icp.title}`);
    } catch (error) {
      console.error(`Failed to store ICP ${icp.title}:`, error);
    }
  }
  
  // Step 3: Generate enhanced training materials using ICPs
  console.log('Step 2: Generating ICP-enhanced training materials...');
  const trainingTypes = [
    {
      type: 'SCRIPT', 
      title: 'ICP-Enhanced Sales Script',
      isICPAware: true,
    },
    {
      type: 'GUIDE', 
      title: 'Product Guide with ICPs',
      isICPAware: true,
    },
    {
      type: 'FAQ', 
      title: 'ICP-Targeted FAQ Guide',
      isICPAware: true,
    },
    {
      type: 'OBJECTION_HANDLING', 
      title: 'ICP-Specific Objection Handling',
      isICPAware: true,
    }
  ];

  const trainingMaterials = [];

  // Create a generation context with ICPs
  const context = {
    product: {
      id: productId,
      userId,
      name: 'Product from uploaded content',
      description: text.substring(0, 500),
      price: 0,
      category: 'General',
      benefits: [],
      ingredients: [],
      targetAudience: 'General wellness clients',
      imageUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    businessType: 'spa',
    targetAudience: 'Wellness clients',
    tone: 'professional',
    includeTypes: ['script', 'guide', 'faq', 'objection-handling'],
    idealClientProfiles: storedICPs, // Include generated ICPs
  };

  for (const trainingType of trainingTypes) {
    try {
      console.log(`Generating enhanced ${trainingType.type} content...`);
      
      // Map training types to the format expected by openaiService
      const typeMapping = {
        'SCRIPT': 'script',
        'GUIDE': 'guide', 
        'FAQ': 'faq',
        'OBJECTION_HANDLING': 'objection-handling'
      };
      
      const mappedType = typeMapping[trainingType.type as keyof typeof typeMapping];
      const aiContent = await openaiService.generateTrainingMaterial(context, mappedType as any);
      
      const material = await prisma.trainingMaterial.create({
        data: {
          userId,
          productId,
          title: trainingType.title,
          type: trainingType.type,
          content: aiContent,
          duration: Math.ceil(aiContent.length / 200), // Estimate reading time
          generatedAt: new Date(),
          status: 'PUBLISHED',
        },
      });
      
      trainingMaterials.push(material);
      console.log(`Successfully created enhanced ${trainingType.type}`);
    } catch (error) {
      console.error(`Failed to create enhanced ${trainingType.type}:`, error);
      // Create fallback content if AI fails
      const fallbackMaterial = await prisma.trainingMaterial.create({
        data: {
          userId,
          productId,
          title: trainingType.title,
          type: trainingType.type,
          content: `Enhanced ${trainingType.title} content will be generated. This training material will incorporate the generated Ideal Client Profiles for more targeted content. Please contact support if this persists.`,
          duration: 5,
          generatedAt: new Date(),
          status: 'PUBLISHED',
        },
      });
      trainingMaterials.push(fallbackMaterial);
    }
  }

  console.log(`Enhanced AI workflow completed: ${storedICPs.length} ICPs, ${trainingMaterials.length} training materials`);
  
  return {
    idealClientProfiles: storedICPs,
    trainingMaterials
  };
}

function getFileType(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType === 'text/plain') return 'TEXT';
  return 'OTHER';
}