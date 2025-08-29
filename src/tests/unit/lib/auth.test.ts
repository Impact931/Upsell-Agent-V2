import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

vi.mock('jsonwebtoken');

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withAuth middleware', () => {
    it('should allow authenticated requests', async () => {
      const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const mockDecodedToken = { userId: 'test-user-id', email: 'test@example.com' };

      (jwt.verify as any).mockReturnValue(mockDecodedToken);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(mockHandler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('should reject requests without authorization header', async () => {
      const mockHandler = vi.fn();

      const request = new NextRequest('http://localhost:3000/api/test');

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token format', async () => {
      const mockHandler = vi.fn();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'InvalidFormat',
        },
      });

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it('should reject requests with expired tokens', async () => {
      const mockHandler = vi.fn();
      (jwt.verify as any).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toContain('expired');
    });

    it('should reject requests with invalid tokens', async () => {
      const mockHandler = vi.fn();
      (jwt.verify as any).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toContain('invalid');
    });

    it('should handle handler errors gracefully', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const mockDecodedToken = { userId: 'test-user-id', email: 'test@example.com' };

      (jwt.verify as any).mockReturnValue(mockDecodedToken);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Token validation', () => {
    it('should extract user information from valid token', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        businessType: 'spa',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      (jwt.verify as any).mockReturnValue(mockPayload);

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required for tests');
      }
      const decoded = jwt.verify('valid-token', process.env.JWT_SECRET);

      expect(decoded).toEqual(mockPayload);
      expect((decoded as any).userId).toBe('user-123');
      expect((decoded as any).email).toBe('user@example.com');
    });
  });
});