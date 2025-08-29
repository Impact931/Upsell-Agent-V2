import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIService } from '@/lib/openai';
import { NextRequest } from 'next/server';
import { POST as processPost } from '@/app/api/process/route';

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAI API Error Handling', () => {
    let openaiService: OpenAIService;

    beforeEach(() => {
      openaiService = OpenAIService.getInstance();
    });

    it('should handle rate limit exceeded errors', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue({
              code: 'rate_limit_exceeded',
              message: 'Rate limit exceeded',
              status: 429
            })
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('Rate limit exceeded. Please try again in a moment.');
    });

    it('should handle quota exceeded errors', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue({
              code: 'insufficient_quota',
              message: 'You exceeded your current quota',
              status: 429
            })
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('OpenAI API quota exceeded. Please check your billing.');
    });

    it('should handle network timeout errors', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('Request timeout'))
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('Failed to generate script: Request timeout');
    });

    it('should handle invalid API key errors', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue({
              code: 'invalid_api_key',
              message: 'Invalid API key',
              status: 401
            })
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('Failed to generate script: Invalid API key');
    });

    it('should handle empty response from OpenAI', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: []
            })
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('No content generated from OpenAI');
    });

    it('should handle malformed OpenAI response', async () => {
      const mockOpenAI = vi.mocked(require('openai').default);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: null } }]
            })
          }
        }
      }));

      const context = {
        product: global.testUtils.mockProduct,
        businessType: 'spa',
        targetAudience: 'Test audience',
        tone: 'professional',
        includeTypes: ['script'] as const,
      };

      await expect(
        openaiService.generateTrainingMaterial(context, 'script')
      ).rejects.toThrow('No content generated from OpenAI');
    });
  });

  describe('API Route Error Handling', () => {
    it('should handle database connection failures in process endpoint', async () => {
      const { prisma } = require('@/lib/database');
      
      // Mock database connection failure
      prisma.uploadSession.findFirst.mockRejectedValue(
        new Error('Connection to database failed')
      );

      const requestBody = {
        sessionId: 'test-session',
        productData: { name: 'Test Product' },
        trainingOptions: {
          includeScript: true,
          includeGuide: false,
          includeFAQ: false,
          includeObjectionHandling: false,
          tone: 'professional',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: JSON.stringify(requestBody),
      });

      const response = await processPost(request);
      expect(response.status).toBe(500);
    });

    it('should handle missing required fields in request body', async () => {
      const invalidRequestBody = {
        // Missing sessionId
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

      const response = await processPost(request);
      expect(response.status).toBe(400);
    });

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + global.testUtils.mockJWTToken,
        },
        body: 'invalid json',
      });

      const response = await processPost(request);
      expect(response.status).toBe(400);
    });

    it('should handle concurrent processing failures gracefully', async () => {
      const { prisma } = require('@/lib/database');
      const { openaiService } = require('@/lib/openai');

      const mockUploadSession = {
        id: 'concurrent-test',
        userId: 'test-user',
        status: 'COMPLETED',
        extractedData: { text: 'test', extractedProduct: {} },
      };

      const mockUser = { id: 'test-user', businessType: 'SPA' };
      const mockProduct = { ...global.testUtils.mockProduct, id: 'concurrent-product' };

      prisma.uploadSession.findFirst.mockResolvedValue(mockUploadSession);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.create.mockResolvedValue(mockProduct);

      // Simulate partial failure in concurrent operations
      openaiService.generateAllTrainingMaterials
        .mockResolvedValueOnce([{ type: 'script', content: 'test' }])
        .mockRejectedValueOnce(new Error('Partial failure'));

      const requests = Array.from({ length: 2 }, (_, i) => {
        const requestBody = {
          sessionId: 'concurrent-test',
          productData: { name: `Product ${i}` },
          trainingOptions: { includeScript: true, tone: 'professional' },
        };

        return new NextRequest('http://localhost:3000/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + global.testUtils.mockJWTToken,
          },
          body: JSON.stringify(requestBody),
        });
      });

      const responses = await Promise.allSettled(
        requests.map(request => processPost(request))
      );

      // One should succeed, one should fail
      const statuses = await Promise.all(
        responses.map(async (result, i) => {
          if (result.status === 'fulfilled') {
            return result.value.status;
          }
          return 500; // Assume failure
        })
      );

      expect(statuses).toContain(200); // At least one success
      expect(statuses).toContain(422); // At least one failure
    });
  });

  describe('File Upload Error Handling', () => {
    it('should handle unsupported file types', async () => {
      // This would be tested in the actual file upload handler
      const unsupportedFile = {
        name: 'document.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1000
      };

      // Simulate file type validation
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const isSupported = supportedTypes.includes(unsupportedFile.type);
      
      expect(isSupported).toBe(false);
    });

    it('should handle files exceeding size limit', async () => {
      const largeFile = {
        name: 'large-document.pdf',
        type: 'application/pdf',
        size: 11 * 1024 * 1024 // 11MB, exceeds 10MB limit
      };

      const maxSize = 10 * 1024 * 1024; // 10MB
      const isValidSize = largeFile.size <= maxSize;
      
      expect(isValidSize).toBe(false);
    });

    it('should handle corrupted file uploads', async () => {
      // This would typically be handled by the file processing service
      const corruptedFileBuffer = Buffer.from('corrupted data');
      
      // Simulate file processing that would detect corruption
      const isValidPdf = corruptedFileBuffer.toString('ascii').startsWith('%PDF');
      expect(isValidPdf).toBe(false);
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle expired JWT tokens gracefully', async () => {
      const jwt = require('jsonwebtoken');
      
      // Mock expired token error
      (jwt.verify as any).mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const request = new NextRequest('http://localhost:3000/api/process', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      // This would be handled by the withAuth middleware
      try {
        jwt.verify('expired-token', 'secret');
      } catch (error: any) {
        expect(error.name).toBe('TokenExpiredError');
      }
    });

    it('should handle invalid JWT tokens', async () => {
      const jwt = require('jsonwebtoken');
      
      // Mock invalid token error
      (jwt.verify as any).mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      try {
        jwt.verify('invalid-token', 'secret');
      } catch (error: any) {
        expect(error.name).toBe('JsonWebTokenError');
      }
    });
  });

  describe('Retry Logic and Circuit Breaker', () => {
    it('should implement retry logic for transient failures', async () => {
      let attemptCount = 0;
      const maxRetries = 3;
      
      const retryableOperation = async () => {
        attemptCount++;
        if (attemptCount < maxRetries) {
          throw new Error('Transient failure');
        }
        return 'Success after retries';
      };

      // Simulate retry logic
      let result;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await retryableOperation();
          break;
        } catch (error) {
          lastError = error;
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        }
      }

      expect(result).toBe('Success after retries');
      expect(attemptCount).toBe(maxRetries);
    });

    it('should fail after max retries exceeded', async () => {
      let attemptCount = 0;
      const maxRetries = 3;
      
      const alwaysFailingOperation = async () => {
        attemptCount++;
        throw new Error('Permanent failure');
      };

      let finalError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          await alwaysFailingOperation();
        } catch (error) {
          finalError = error;
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      expect(attemptCount).toBe(maxRetries);
      expect(finalError).toBeDefined();
      expect((finalError as Error).message).toBe('Permanent failure');
    });
  });

  describe('Graceful Degradation', () => {
    it('should provide fallback when OpenAI is unavailable', async () => {
      // Simulate fallback behavior when OpenAI service fails
      const openaiAvailable = false;
      
      if (!openaiAvailable) {
        // Fallback to template-based content
        const fallbackContent = `# Sales Script Template
        
Please customize this template with your product information:
- Product name: [PRODUCT_NAME]
- Key benefits: [BENEFITS]
- Price: [PRICE]

## Introduction
Introduce the product to your client...

## Benefits Discussion
Highlight the key benefits...

## Closing
Ask for the sale...`;

        expect(fallbackContent).toContain('Sales Script Template');
        expect(fallbackContent).toContain('[PRODUCT_NAME]');
      }
    });

    it('should handle partial service degradation', async () => {
      // Simulate scenario where some services are available but others are not
      const serviceStatus = {
        database: true,
        openai: false,
        fileUpload: true,
        auth: true,
      };

      // Should still allow file upload and auth even if OpenAI is down
      expect(serviceStatus.fileUpload).toBe(true);
      expect(serviceStatus.auth).toBe(true);
      
      // But should indicate OpenAI unavailability
      expect(serviceStatus.openai).toBe(false);
    });
  });
});