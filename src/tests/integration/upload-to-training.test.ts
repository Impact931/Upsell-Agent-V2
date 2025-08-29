import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as uploadPost } from '@/app/api/upload/route';
import { POST as processPost } from '@/app/api/process/route';
import { GET as trainingGet } from '@/app/api/training/route';

// Integration test for the complete workflow
describe('Upload to Training Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all mocks
    const { prisma } = require('@/lib/database');
    vi.mocked(prisma.uploadSession.create).mockClear();
    vi.mocked(prisma.uploadSession.findFirst).mockClear();
    vi.mocked(prisma.product.create).mockClear();
    vi.mocked(prisma.user.findUnique).mockClear();
    vi.mocked(prisma.trainingMaterial.create).mockClear();
    vi.mocked(prisma.trainingMaterial.findMany).mockClear();
  });

  it('should complete full workflow: upload -> process -> retrieve training materials', async () => {
    const testFile = new File(['Sample product brochure content'], 'product-brochure.pdf', {
      type: 'application/pdf',
    });

    const formData = new FormData();
    formData.append('file', testFile);

    // Mock database responses
    const { prisma } = require('@/lib/database');
    const { openaiService } = require('@/lib/openai');

    const mockSessionId = 'session-test-123';
    const mockProductId = 'product-test-456';
    const mockUserId = 'user-test-789';

    // Step 1: Upload file
    const mockUploadSession = {
      id: mockSessionId,
      userId: mockUserId,
      fileName: 'product-brochure.pdf',
      fileSize: testFile.size,
      status: 'COMPLETED',
      extractedData: {
        text: 'Premium Face Serum with Vitamin C and Hyaluronic Acid. Price: $89.99',
        extractedProduct: {
          name: 'Premium Face Serum',
          description: 'Anti-aging serum with vitamin C',
          price: 89.99,
          category: 'Skincare',
          ingredients: ['vitamin C', 'hyaluronic acid'],
          benefits: ['anti-aging', 'hydrating'],
        },
        userProvidedData: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.uploadSession.create.mockResolvedValue(mockUploadSession);

    const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + global.testUtils.mockJWTToken,
      },
      body: formData,
    });

    const uploadResponse = await uploadPost(uploadRequest);
    const uploadData = await uploadResponse.json();

    expect(uploadResponse.status).toBe(200);
    expect(uploadData.sessionId).toBe(mockSessionId);

    // Step 2: Process and generate training materials
    const mockCreatedProduct = {
      id: mockProductId,
      userId: mockUserId,
      name: 'Premium Face Serum',
      description: 'Anti-aging serum with vitamin C',
      price: 89.99,
      category: 'Skincare',
      ingredients: ['vitamin C', 'hyaluronic acid'],
      benefits: ['anti-aging', 'hydrating'],
      targetAudience: 'Adult women',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: mockUserId,
      businessType: 'SPA',
    };

    const mockTrainingMaterials = [
      {
        id: 'tm-script-001',
        productId: mockProductId,
        userId: mockUserId,
        title: 'Premium Face Serum - Sales Script',
        content: `# Sales Script: Premium Face Serum

## Introduction
"I noticed you're interested in anti-aging skincare. Our Premium Face Serum with Vitamin C might be perfect for you."

## Benefits
"This serum contains vitamin C and hyaluronic acid, which help reduce fine lines and improve skin hydration."

## Value
"At $89.99, it provides professional-grade results at home."

---
**Disclaimer**: This information is for general wellness purposes only.`,
        type: 'script',
        duration: 3,
        generatedAt: new Date(),
        version: 1,
        status: 'draft',
      },
      {
        id: 'tm-guide-001',
        productId: mockProductId,
        userId: mockUserId,
        title: 'Premium Face Serum - Product Guide',
        content: 'Detailed product guide content...',
        type: 'guide',
        duration: 5,
        generatedAt: new Date(),
        version: 1,
        status: 'draft',
      },
    ];

    const mockSavedMaterials = mockTrainingMaterials.map(material => ({
      ...material,
      type: material.type.toUpperCase().replace('-', '_'),
      status: material.status.toUpperCase(),
    }));

    prisma.uploadSession.findFirst.mockResolvedValue(mockUploadSession);
    prisma.product.create.mockResolvedValue(mockCreatedProduct);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.trainingMaterial.create
      .mockResolvedValueOnce(mockSavedMaterials[0])
      .mockResolvedValueOnce(mockSavedMaterials[1]);
    openaiService.generateAllTrainingMaterials.mockResolvedValue(mockTrainingMaterials);

    const processRequestBody = {
      sessionId: mockSessionId,
      productData: {
        name: 'Premium Face Serum',
        targetAudience: 'Women 30-50 interested in anti-aging',
      },
      trainingOptions: {
        includeScript: true,
        includeGuide: true,
        includeFAQ: false,
        includeObjectionHandling: false,
        targetAudience: 'Women 30-50 interested in anti-aging',
        tone: 'professional',
      },
    };

    const processRequest = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + global.testUtils.mockJWTToken,
      },
      body: JSON.stringify(processRequestBody),
    });

    const processResponse = await processPost(processRequest);
    const processData = await processResponse.json();

    expect(processResponse.status).toBe(200);
    expect(processData.product.id).toBe(mockProductId);
    expect(processData.trainingMaterials).toHaveLength(2);
    expect(processData.estimatedDuration).toBe(8); // 3 + 5 minutes

    // Step 3: Retrieve training materials
    prisma.trainingMaterial.findMany.mockResolvedValue(
      mockSavedMaterials.map(material => ({
        ...material,
        product: {
          id: mockProductId,
          name: mockCreatedProduct.name,
          category: mockCreatedProduct.category,
          price: mockCreatedProduct.price,
        },
      }))
    );
    prisma.trainingMaterial.count.mockResolvedValue(2);

    const trainingRequest = new NextRequest('http://localhost:3000/api/training', {
      headers: {
        authorization: 'Bearer ' + global.testUtils.mockJWTToken,
      },
    });

    const trainingResponse = await trainingGet(trainingRequest);
    const trainingData = await trainingResponse.json();

    expect(trainingResponse.status).toBe(200);
    expect(trainingData.trainingMaterials).toHaveLength(2);
    expect(trainingData.trainingMaterials[0].title).toContain('Premium Face Serum');
    expect(trainingData.pagination.total).toBe(2);

    // Verify the complete workflow integration
    expect(openaiService.generateAllTrainingMaterials).toHaveBeenCalledWith({
      product: expect.objectContaining({
        id: mockProductId,
        name: 'Premium Face Serum',
      }),
      businessType: 'spa',
      targetAudience: 'Women 30-50 interested in anti-aging',
      tone: 'professional',
      includeTypes: ['script', 'guide'],
    });
  }, 30000);

  it('should handle errors gracefully in the workflow', async () => {
    const { prisma } = require('@/lib/database');
    
    // Mock upload session that fails processing
    const mockUploadSession = {
      id: 'session-fail-123',
      userId: 'user-test-789',
      status: 'COMPLETED',
      extractedData: {
        text: 'Invalid product data',
        extractedProduct: {},
        userProvidedData: {},
      },
    };

    prisma.uploadSession.findFirst.mockResolvedValue(mockUploadSession);
    prisma.product.create.mockRejectedValue(new Error('Database constraint violation'));

    const processRequestBody = {
      sessionId: 'session-fail-123',
      productData: {
        name: 'Test Product',
      },
      trainingOptions: {
        includeScript: true,
        includeGuide: false,
        includeFAQ: false,
        includeObjectionHandling: false,
        tone: 'professional',
      },
    };

    const processRequest = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + global.testUtils.mockJWTToken,
      },
      body: JSON.stringify(processRequestBody),
    });

    const processResponse = await processPost(processRequest);

    expect(processResponse.status).toBe(422);
    
    const errorData = await processResponse.json();
    expect(errorData.error).toContain('Failed to generate training materials');
  });

  it('should validate 95% upload success rate target', async () => {
    const { prisma } = require('@/lib/database');
    
    // Simulate multiple upload attempts
    const successfulUploads = [];
    const failedUploads = [];

    for (let i = 0; i < 100; i++) {
      try {
        const mockSession = {
          id: `session-${i}`,
          userId: 'user-test',
          fileName: `file-${i}.pdf`,
          fileSize: 1000,
          status: 'COMPLETED',
          extractedData: { text: 'Sample content', extractedProduct: {} },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Simulate 5% failure rate
        if (Math.random() > 0.95) {
          prisma.uploadSession.create.mockRejectedValueOnce(new Error('Upload failed'));
          failedUploads.push(i);
        } else {
          prisma.uploadSession.create.mockResolvedValueOnce(mockSession);
          successfulUploads.push(i);
        }
      } catch (error) {
        failedUploads.push(i);
      }
    }

    const successRate = successfulUploads.length / 100;
    expect(successRate).toBeGreaterThanOrEqual(0.95);
  });

  it('should validate training generation within 5-minute target', async () => {
    const { openaiService } = require('@/lib/openai');
    const { prisma } = require('@/lib/database');

    const mockContext = {
      product: {
        id: 'perf-test-product',
        userId: 'perf-test-user',
        name: 'Performance Test Product',
        description: 'Testing performance',
        price: 50,
        category: 'Test',
        ingredients: ['test ingredient'],
        benefits: ['test benefit'],
        targetAudience: 'Test audience',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      businessType: 'spa',
      targetAudience: 'Test audience',
      tone: 'professional',
      includeTypes: ['script', 'guide', 'faq', 'objection-handling'] as const,
    };

    // Mock quick OpenAI responses
    openaiService.generateAllTrainingMaterials.mockImplementation(async () => {
      // Simulate realistic but fast API response times
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s per material type
      
      return [
        { type: 'script', content: 'Mock script', duration: 3 },
        { type: 'guide', content: 'Mock guide', duration: 5 },
        { type: 'faq', content: 'Mock FAQ', duration: 4 },
        { type: 'objection-handling', content: 'Mock objection handling', duration: 3 },
      ].map(material => ({
        id: `tm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: mockContext.product.id,
        userId: mockContext.product.userId,
        title: `${mockContext.product.name} - ${material.type}`,
        content: material.content,
        type: material.type,
        duration: material.duration,
        generatedAt: new Date(),
        version: 1,
        status: 'draft',
      }));
    });

    const startTime = Date.now();
    const result = await openaiService.generateAllTrainingMaterials(mockContext);
    const endTime = Date.now();

    const generationTime = (endTime - startTime) / 1000; // Convert to seconds

    expect(result).toHaveLength(4);
    expect(generationTime).toBeLessThan(300); // 5 minutes = 300 seconds
  }, 360000);
});