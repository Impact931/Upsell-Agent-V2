import { AppConfig } from '@/types';

// Load and validate environment variables
function validateEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value;
}

function validateEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  
  return parsed;
}

// Application configuration
export const config: AppConfig = {
  openai: {
    apiKey: validateEnvVar('OPENAI_API_KEY'),
    model: validateEnvVar('OPENAI_MODEL', 'gpt-4-turbo-preview'),
    maxTokens: validateEnvNumber('OPENAI_MAX_TOKENS', 2000),
  },
  jwt: {
    secret: validateEnvVar('JWT_SECRET'),
    expiresIn: validateEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  upload: {
    maxFileSize: validateEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'text/plain'
    ],
    uploadPath: validateEnvVar('UPLOAD_PATH', '/tmp/uploads'),
  },
  database: {
    url: validateEnvVar('DATABASE_URL'),
  },
  cors: {
    origin: validateEnvVar('CORS_ORIGINS', 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
};

// Environment-specific settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'test';

// App settings
export const appSettings = {
  port: validateEnvNumber('PORT', 3000),
  appUrl: validateEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  nodeEnv: validateEnvVar('NODE_ENV', 'development'),
  
  // Rate limiting
  rateLimit: {
    max: validateEnvNumber('RATE_LIMIT_MAX', 100),
    windowMs: validateEnvNumber('RATE_LIMIT_WINDOW', 900000), // 15 minutes
  },
  
  // Logging
  logging: {
    level: validateEnvVar('LOG_LEVEL', 'info'),
    file: validateEnvVar('LOG_FILE', 'logs/app.log'),
  },
  
  // Security
  security: {
    bcryptRounds: validateEnvNumber('BCRYPT_ROUNDS', 12),
    sessionTimeout: validateEnvNumber('SESSION_TIMEOUT', 86400000), // 24 hours
  },
};

// Feature flags
export const featureFlags = {
  enableFileUpload: true,
  enableOCR: true,
  enableAIGeneration: true,
  enableRateLimiting: isProduction,
  enableDetailedLogging: isDevelopment,
  enableCORS: true,
};

// API endpoints configuration
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  upload: '/api/upload',
  process: '/api/process',
  training: '/api/training',
  health: '/api/health',
};

// Validation constants
export const validationConstants = {
  file: {
    maxSize: config.upload.maxFileSize,
    allowedTypes: config.upload.allowedTypes,
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
  },
  user: {
    passwordMinLength: 8,
    businessNameMinLength: 2,
    supportedBusinessTypes: ['spa', 'salon', 'wellness'],
    supportedRoles: ['manager', 'staff'],
  },
  product: {
    nameMinLength: 1,
    descriptionMinLength: 10,
    categoryMinLength: 1,
  },
  training: {
    titleMinLength: 1,
    contentMinLength: 50,
    supportedTypes: ['script', 'guide', 'faq', 'objection-handling'],
    supportedStatuses: ['draft', 'published', 'archived'],
    supportedTones: ['professional', 'friendly', 'casual'],
  },
};

// Health check configuration
export const healthCheck = {
  interval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  services: [
    'database',
    'openai',
    'fileSystem',
  ],
};

// Export utility functions
export function getEnvironment(): 'development' | 'production' | 'test' {
  return appSettings.nodeEnv as 'development' | 'production' | 'test';
}

export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

export function getApiEndpoint(category: string, endpoint?: string): string {
  const base = apiEndpoints as any;
  
  if (endpoint) {
    return base[category]?.[endpoint] || `/api/${category}/${endpoint}`;
  }
  
  return base[category] || `/api/${category}`;
}