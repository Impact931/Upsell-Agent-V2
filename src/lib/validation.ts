import { z } from 'zod';
import { ValidationError } from './errors';

// Enhanced password validation
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .refine(password => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
  .refine(password => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
  .refine(password => /\d/.test(password), 'Password must contain at least one number')
  .refine(password => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), 'Password must contain at least one special character');

// Email validation with additional security checks
const EmailSchema = z.string()
  .email('Invalid email address')
  .max(254, 'Email address too long')
  .transform(email => email.toLowerCase().trim())
  .refine(email => !email.includes('..'), 'Invalid email format')
  .refine(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Invalid email format');

// User validation schemas
export const AuthSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

// String sanitization helper
const SanitizedStringSchema = (minLength: number = 1, maxLength: number = 255) => 
  z.string()
    .trim()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be less than ${maxLength} characters`)
    .refine(str => !/[<>\"'&]/.test(str), 'Invalid characters detected');

export const RegisterSchema = AuthSchema.extend({
  businessName: SanitizedStringSchema(2, 100),
  businessType: z.enum(['spa', 'salon', 'wellness'], {
    errorMap: () => ({ message: 'Business type must be spa, salon, or wellness' }),
  }),
  role: z.enum(['manager', 'staff'], {
    errorMap: () => ({ message: 'Role must be manager or staff' }),
  }),
});

// Product validation schemas
export const ProductSchema = z.object({
  name: SanitizedStringSchema(1, 200),
  description: SanitizedStringSchema(10, 2000),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
  category: SanitizedStringSchema(1, 100),
  ingredients: z.array(SanitizedStringSchema(1, 100)).max(50, 'Too many ingredients').optional(),
  benefits: z.array(SanitizedStringSchema(1, 200)).max(20, 'Too many benefits').optional(),
  targetAudience: SanitizedStringSchema(1, 500).optional(),
  imageUrl: z.string().url('Invalid URL').max(2000, 'URL too long').optional(),
});

// File upload validation schemas
export const UploadSchema = z.object({
  productName: z.string().optional(),
  category: z.string().optional(),
});

export const FileValidationSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  fileType: z.enum(['pdf', 'image', 'text']),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB
});

// Training generation validation schemas
export const TrainingOptionsSchema = z.object({
  includeScript: z.boolean(),
  includeGuide: z.boolean(),
  includeFAQ: z.boolean(),
  includeObjectionHandling: z.boolean(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'casual']).default('professional'),
});

export const ProcessingSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  productData: ProductSchema.partial().optional(),
  trainingOptions: TrainingOptionsSchema,
});

// File type and size constraints
export const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
} as const;

// Validation helper functions
export function validateFileType(file: File): boolean {
  return FILE_CONSTRAINTS.allowedTypes.includes(file.type);
}

export function validateFileSize(file: File): boolean {
  return file.size <= FILE_CONSTRAINTS.maxSize;
}

export function validateFile(file: File): void {
  if (!validateFileType(file)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${FILE_CONSTRAINTS.allowedTypes.join(', ')}`,
      { fileType: file.type, allowedTypes: FILE_CONSTRAINTS.allowedTypes }
    );
  }

  if (!validateFileSize(file)) {
    throw new ValidationError(
      `File size too large. Maximum size: ${FILE_CONSTRAINTS.maxSize / (1024 * 1024)}MB`,
      { fileSize: file.size, maxSize: FILE_CONSTRAINTS.maxSize }
    );
  }
}

// Generic validation helper
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Validation failed', {
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    throw error;
  }
}

// Request validation middleware helpers
export async function parseAndValidateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return validateSchema(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body');
    }
    throw error;
  }
}

export function parseAndValidateQuery<T>(
  url: URL,
  schema: z.ZodSchema<T>
): T {
  const queryParams: Record<string, string> = {};
  
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value;
  }
  
  return validateSchema(schema, queryParams);
}

// Input sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255)
    .trim();
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Rate limiting validation
export const RateLimitSchema = z.object({
  ip: z.string().ip({ version: 'v4' }).or(z.string().ip({ version: 'v6' })),
  endpoint: z.string().min(1).max(200),
  windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000)
});

// SQL injection prevention - detect common patterns
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
    /(--|\/\*|\*\/)/,
    /(\b1\s*=\s*1\b)/i,
    /('|"|;|\||<|>)/
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}