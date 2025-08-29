import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test',
    OPENAI_API_KEY: 'test-api-key',
    JWT_SECRET: 'test-jwt-secret',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    NEXTAUTH_SECRET: 'test-auth-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    OPENAI_MODEL: 'gpt-4-turbo-preview',
    OPENAI_MAX_TOKENS: '2000',
  },
}));

// Mock Prisma client
vi.mock('@/lib/database', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    trainingMaterial: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    uploadSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock AI response content for training materials'
              }
            }]
          })
        }
      }
    }))
  };
});

// Mock file system operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  mkdir: vi.fn(),
  stat: vi.fn(),
}));

// Mock multer for file uploads
vi.mock('multer', () => ({
  default: vi.fn(() => ({
    single: vi.fn(() => vi.fn()),
    array: vi.fn(() => vi.fn()),
    fields: vi.fn(() => vi.fn()),
  })),
}));

// Setup and cleanup
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    businessType: 'SPA',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  mockProduct: {
    id: 'test-product-id',
    userId: 'test-user-id',
    name: 'Test Product',
    description: 'A test spa product',
    price: 99.99,
    category: 'Skincare',
    ingredients: ['aloe vera', 'vitamin e'],
    benefits: ['moisturizing', 'anti-aging'],
    targetAudience: 'Adult women',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  mockTrainingMaterial: {
    id: 'test-material-id',
    productId: 'test-product-id',
    userId: 'test-user-id',
    title: 'Test Product - Sales Script',
    content: 'Mock training content',
    type: 'script',
    duration: 5,
    generatedAt: new Date(),
    version: 1,
    status: 'draft',
  },
  mockJWTToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1NjQwMDB9.test-signature'
};