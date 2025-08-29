import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/process/route';

// Mock dependencies
vi.mock('@/lib/database', () => ({
  prisma: {
    uploadSession: {
      findFirst: vi.fn(),
    },
    product: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    trainingMaterial: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/openai', () => ({
  openaiService: {
    generateAllTrainingMaterials: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(() => ({ userId: 'test-user-id' })),
}));

describe('/api/process', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    const mockRequestBody = {
      sessionId: 'session-123',
      productData: {
        name: 'Premium Face Cream',
        description: 'Anti-aging face cream',
        price: 89.99,
        category: 'Skincare',
      },
      trainingOptions: {
        includeScript: true,
        includeGuide: true,
        includeFAQ: false,
        includeObjectionHandling: true,
        targetAudience: 'Women 30-50',
        tone: 'professional',
      },
    };

    it('should process training materials successfully', async () => {
      const mockUploadSession = {
        id: 'session-123',
        userId: 'test-user-id',
        status: 'COMPLETED',
        extractedData: {
          text: 'Product information extracted from file',
          extractedProduct: {
            name: 'Face Cream',
            description: 'Moisturizing cream',
          },
          userProvidedData: {},
        },
      };

      const mockCreatedProduct = {
        id: 'product-456',
        userId: 'test-user-id',
        name: 'Premium Face Cream',
        description: 'Anti-aging face cream',
        price: 89.99,
        category: 'Skincare',
        ingredients: [],
        benefits: [],
        targetAudience: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'test-user-id',
        businessType: 'SPA',
      };

      const mockTrainingMaterials = [
        {
          id: 'tm-1',
          productId: 'product-456',
          userId: 'test-user-id',
          title: 'Premium Face Cream - Sales Script',
          content: 'Mock sales script content',
          type: 'script',
          duration: 3,
          generatedAt: new Date(),
          version: 1,
          status: 'draft',
        },
      ];

      const mockSavedMaterial = {
        ...mockTrainingMaterials[0],
        type: 'SCRIPT',
        status: 'DRAFT',
      };

      const { prisma } = await import('@/lib/database');
      const { openaiService } = await import('@/lib/openai');

      (prisma.uploadSession.findFirst as any).mockResolvedValue(mockUploadSession);
      (prisma.product.create as any).mockResolvedValue(mockCreatedProduct);
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.trainingMaterial.create as any).mockResolvedValue(mockSavedMaterial);
      (openaiService.generateAllTrainingMaterials as any).mockResolvedValue(mockTrainingMaterials);

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Training materials generated successfully');
      expect(data.product.id).toBe('product-456');
      expect(data.trainingMaterials).toHaveLength(1);
      expect(data.trainingMaterials[0].type).toBe('script');
      expect(data.estimatedDuration).toBeGreaterThan(0);

      // Verify OpenAI service was called with correct context
      expect(openaiService.generateAllTrainingMaterials).toHaveBeenCalledWith({
        product: expect.objectContaining({
          id: 'product-456',
          name: 'Premium Face Cream',
        }),
        businessType: 'spa',
        targetAudience: 'Women 30-50',
        tone: 'professional',
        includeTypes: ['script', 'guide', 'objection-handling'],
      });
    });

    it('should require completed upload session', async () => {
      const { prisma } = await import('@/lib/database');
      (prisma.uploadSession.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
    });

    it('should handle missing extracted data', async () => {
      const mockUploadSession = {
        id: 'session-123',
        userId: 'test-user-id',
        status: 'COMPLETED',
        extractedData: null,
      };

      const { prisma } = await import('@/lib/database');
      (prisma.uploadSession.findFirst as any).mockResolvedValue(mockUploadSession);

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(422);
    });

    it('should handle OpenAI service failures', async () => {
      const mockUploadSession = {
        id: 'session-123',
        userId: 'test-user-id',
        status: 'COMPLETED',
        extractedData: {
          text: 'Product information',
          extractedProduct: {},
          userProvidedData: {},
        },
      };

      const mockUser = {
        id: 'test-user-id',
        businessType: 'SPA',
      };

      const mockCreatedProduct = {
        id: 'product-456',
        userId: 'test-user-id',
        name: 'Premium Face Cream',
        description: 'Anti-aging face cream',
        price: 89.99,
        category: 'Skincare',
        ingredients: [],
        benefits: [],
        targetAudience: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('@/lib/database');
      const { openaiService } = await import('@/lib/openai');

      (prisma.uploadSession.findFirst as any).mockResolvedValue(mockUploadSession);
      (prisma.product.create as any).mockResolvedValue(mockCreatedProduct);
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (openaiService.generateAllTrainingMaterials as any).mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      );

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(422);
    });

    it('should validate request body', async () => {
      const invalidRequestBody = {
        sessionId: '', // Invalid empty session ID
        productData: {},
        trainingOptions: {},
      };

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});