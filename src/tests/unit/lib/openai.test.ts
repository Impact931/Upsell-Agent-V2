import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIService } from '@/lib/openai';
import { mockOpenAIResponse, mockOpenAIError, mockOpenAIQuotaError } from '../../mocks/openai';
import OpenAI from 'openai';

// Mock the OpenAI module
vi.mock('openai');
const mockOpenAI = vi.mocked(OpenAI);

describe('OpenAIService', () => {
  let openaiService: OpenAIService;
  let mockCreateCompletion: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockCreateCompletion = vi.fn();
    mockOpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreateCompletion
        }
      }
    } as any));

    openaiService = OpenAIService.getInstance();
  });

  describe('generateTrainingMaterial', () => {
    const mockContext = {
      product: {
        id: 'test-product-id',
        userId: 'test-user-id',
        name: 'Premium Facial Serum',
        description: 'Advanced anti-aging serum with vitamin C',
        price: 89.99,
        category: 'Skincare',
        ingredients: ['vitamin C', 'hyaluronic acid'],
        benefits: ['anti-aging', 'hydrating'],
        targetAudience: 'Adult women',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      businessType: 'spa',
      targetAudience: 'Adult women seeking anti-aging solutions',
      tone: 'professional',
      includeTypes: ['script', 'guide', 'faq', 'objection-handling'] as const,
    };

    it('should generate sales script successfully', async () => {
      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const result = await openaiService.generateTrainingMaterial(mockContext, 'script');

      expect(result).toContain('Sales Script');
      expect(result).toContain('Premium Facial Serum');
      expect(result).toContain('**Disclaimer**');
      expect(mockCreateCompletion).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        max_tokens: 2000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });
    });

    it('should generate product guide successfully', async () => {
      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const result = await openaiService.generateTrainingMaterial(mockContext, 'guide');

      expect(result).toBeDefined();
      expect(result).toContain('**Disclaimer**');
      expect(mockCreateCompletion).toHaveBeenCalled();
    });

    it('should handle rate limit errors', async () => {
      mockCreateCompletion.mockRejectedValue(mockOpenAIError);

      await expect(
        openaiService.generateTrainingMaterial(mockContext, 'script')
      ).rejects.toThrow('Rate limit exceeded. Please try again in a moment.');
    });

    it('should handle quota exceeded errors', async () => {
      mockCreateCompletion.mockRejectedValue(mockOpenAIQuotaError);

      await expect(
        openaiService.generateTrainingMaterial(mockContext, 'script')
      ).rejects.toThrow('OpenAI API quota exceeded. Please check your billing.');
    });

    it('should handle empty content response', async () => {
      mockCreateCompletion.mockResolvedValue({
        choices: [{ message: { content: null } }]
      });

      await expect(
        openaiService.generateTrainingMaterial(mockContext, 'script')
      ).rejects.toThrow('No content generated from OpenAI');
    });
  });

  describe('generateAllTrainingMaterials', () => {
    const mockContext = {
      product: {
        id: 'test-product-id',
        userId: 'test-user-id',
        name: 'Premium Facial Serum',
        description: 'Advanced anti-aging serum with vitamin C',
        price: 89.99,
        category: 'Skincare',
        ingredients: ['vitamin C', 'hyaluronic acid'],
        benefits: ['anti-aging', 'hydrating'],
        targetAudience: 'Adult women',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      businessType: 'spa',
      targetAudience: 'Adult women seeking anti-aging solutions',
      tone: 'professional',
      includeTypes: ['script', 'guide'] as const,
    };

    it('should generate all requested training materials', async () => {
      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const results = await openaiService.generateAllTrainingMaterials(mockContext);

      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('script');
      expect(results[1].type).toBe('guide');
      expect(results[0].title).toContain('Premium Facial Serum');
      expect(results[0].duration).toBeGreaterThan(0);
      expect(mockCreateCompletion).toHaveBeenCalledTimes(2);
    });

    it('should generate materials with proper metadata', async () => {
      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const results = await openaiService.generateAllTrainingMaterials(mockContext);

      results.forEach(material => {
        expect(material.id).toMatch(/^tm_\d+_[a-z0-9]+$/);
        expect(material.productId).toBe('test-product-id');
        expect(material.userId).toBe('test-user-id');
        expect(material.generatedAt).toBeInstanceOf(Date);
        expect(material.version).toBe(1);
        expect(material.status).toBe('draft');
      });
    });
  });

  describe('extractProductInfo', () => {
    it('should extract product information from text', async () => {
      const mockProductData = {
        name: 'Anti-Aging Cream',
        description: 'Premium skincare product',
        price: 79.99,
        category: 'Skincare',
        ingredients: ['retinol', 'hyaluronic acid'],
        benefits: ['reduces wrinkles', 'improves skin texture']
      };

      mockCreateCompletion.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockProductData)
          }
        }]
      });

      const result = await openaiService.extractProductInfo('Product brochure text here...');

      expect(result).toEqual(mockProductData);
      expect(mockCreateCompletion).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        max_tokens: 1000,
        temperature: 0.1,
      });
    });

    it('should handle malformed JSON response', async () => {
      mockCreateCompletion.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      });

      const result = await openaiService.extractProductInfo('Product text here...');

      expect(result).toEqual({
        name: 'Unknown Product',
        description: expect.stringContaining('Product text here')
      });
    });
  });

  describe('Performance Tests', () => {
    it('should generate training material within time limit', async () => {
      const mockContext = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Adult women',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const startTime = Date.now();
      await openaiService.generateTrainingMaterial(mockContext, 'script');
      const endTime = Date.now();

      // Should complete within 30 seconds for a single material
      expect(endTime - startTime).toBeLessThan(30000);
    }, 60000);

    it('should generate all materials within 5 minute target', async () => {
      const mockContext = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Adult women',
        tone: 'professional',
        includeTypes: ['script', 'guide', 'faq', 'objection-handling'] as const,
      };

      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const startTime = Date.now();
      await openaiService.generateAllTrainingMaterials(mockContext);
      const endTime = Date.now();

      // Should complete within 5 minutes (300,000 ms)
      expect(endTime - startTime).toBeLessThan(300000);
    }, 360000);
  });

  describe('Content Quality Tests', () => {
    it('should include appropriate spa/salon disclaimers', async () => {
      const mockContext = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Adult women',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const result = await openaiService.generateTrainingMaterial(mockContext, 'script');

      expect(result).toContain('**Disclaimer**');
      expect(result).toContain('wellness purposes only');
      expect(result).toContain('does not constitute medical advice');
    });

    it('should tailor content to business type', async () => {
      const spaContext = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Adult women',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      const salonContext = {
        ...spaContext,
        businessType: 'salon',
      };

      mockCreateCompletion.mockResolvedValue(mockOpenAIResponse);

      const spaResult = await openaiService.generateTrainingMaterial(spaContext, 'script');
      const salonResult = await openaiService.generateTrainingMaterial(salonContext, 'script');

      expect(spaResult).toContain('spa services');
      expect(salonResult).toContain('salon services');
    });
  });
});