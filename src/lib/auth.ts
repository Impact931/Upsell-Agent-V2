import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError, AuthorizationError } from './errors';
import { User } from '@/types';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  // Verify and decode JWT token
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      }
      throw new AuthenticationError('Authentication failed');
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader: string | null): string {
    if (!authHeader) {
      throw new AuthenticationError('Authorization header is missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format. Use: Bearer <token>');
    }

    return parts[1];
  }

  // Middleware helper for request authentication
  async authenticateRequest(request: Request): Promise<TokenPayload> {
    const authHeader = request.headers.get('authorization');
    const token = this.extractTokenFromHeader(authHeader);
    return this.verifyToken(token);
  }

  // Check if user has required role
  checkRole(userRole: string, requiredRole: string | string[]): boolean {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  }

  // Authorize request with role check
  async authorizeRequest(
    request: Request,
    requiredRole?: string | string[]
  ): Promise<TokenPayload> {
    const tokenPayload = await this.authenticateRequest(request);

    if (requiredRole && !this.checkRole(tokenPayload.role, requiredRole)) {
      throw new AuthorizationError(
        `Insufficient permissions. Required role: ${
          Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole
        }`
      );
    }

    return tokenPayload;
  }

  // Generate a secure random session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  // Generate API key for external integrations (future use)
  generateApiKey(): string {
    return `ua_${Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64url')}`;
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // Generate password reset token (for future implementation)
  generateResetToken(): string {
    return jwt.sign(
      { type: 'password_reset', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  // Verify password reset token (for future implementation)
  verifyResetToken(token: string): boolean {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return decoded.type === 'password_reset';
    } catch {
      return false;
    }
  }

  // Rate limiting helper - generate rate limit key
  getRateLimitKey(ip: string, endpoint: string): string {
    return `rate_limit:${ip}:${endpoint}`;
  }

  // Security headers helper
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()'
    };
  }
}

export const authService = AuthService.getInstance();

// Utility function for route protection
export function withAuth(handler: Function, requiredRole?: string | string[]) {
  return async (request: Request, context?: any) => {
    try {
      const tokenPayload = await authService.authorizeRequest(request, requiredRole);
      
      // Add user info to request context (if context is provided)
      if (context) {
        context.user = tokenPayload;
      }
      
      return handler(request, context);
    } catch (error) {
      throw error; // Let error middleware handle it
    }
  };
}