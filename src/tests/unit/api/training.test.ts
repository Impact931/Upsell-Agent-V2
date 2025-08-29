import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/training/route';

// Mock dependencies
vi.mock('@/lib/database', () => ({
  prisma: {
    trainingMaterial: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(() => ({ userId: 'test-user-id' })),
}));

describe('/api/training', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return training materials for authenticated user', async () => {
      const mockTrainingMaterials = [
        {
          id: 'tm-1',
          productId: 'product-1',
          userId: 'test-user-id',
          title: 'Test Product - Sales Script',
          content: 'Mock content',
          type: 'SCRIPT',
          duration: 5,
          generatedAt: new Date(),
          version: 1,
          status: 'DRAFT',
          product: {
            id: 'product-1',
            name: 'Test Product',
            category: 'Skincare',
            price: 99.99,
          },
        },
      ];

      const { prisma } = await import('@/lib/database');
      (prisma.trainingMaterial.findMany as any).mockResolvedValue(mockTrainingMaterials);
      (prisma.trainingMaterial.count as any).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/training', {
        headers: {
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trainingMaterials).toHaveLength(1);
      expect(data.trainingMaterials[0].type).toBe('script');
      expect(data.trainingMaterials[0].status).toBe('draft');
      expect(data.pagination.total).toBe(1);
    });

    it('should filter by product ID', async () => {
      const { prisma } = await import('@/lib/database');
      (prisma.trainingMaterial.findMany as any).mockResolvedValue([]);
      (prisma.trainingMaterial.count as any).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/training?productId=product-123', {
        headers: {
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
      });

      await GET(request);

      expect(prisma.trainingMaterial.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', productId: 'product-123' },
        include: expect.any(Object),
        orderBy: { generatedAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter by material type', async () => {
      const { prisma } = await import('@/lib/database');
      (prisma.trainingMaterial.findMany as any).mockResolvedValue([]);
      (prisma.trainingMaterial.count as any).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/training?type=script', {
        headers: {
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
      });

      await GET(request);

      expect(prisma.trainingMaterial.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', type: 'SCRIPT' },
        include: expect.any(Object),
        orderBy: { generatedAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should handle pagination', async () => {
      const { prisma } = await import('@/lib/database');
      (prisma.trainingMaterial.findMany as any).mockResolvedValue([]);
      (prisma.trainingMaterial.count as any).mockResolvedValue(100);

      const request = new NextRequest('http://localhost:3000/api/training?limit=10&offset=20', {
        headers: {
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(prisma.trainingMaterial.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        include: expect.any(Object),
        orderBy: { generatedAt: 'desc' },
        take: 10,
        skip: 20,
      });

      expect(data.pagination.hasMore).toBe(true);
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/training');

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = await import('@/lib/database');
      (prisma.trainingMaterial.findMany as any).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/training', {
        headers: {
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});