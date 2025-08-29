// Core Types for Upsell Agent Platform

export interface User {
  id: string;
  email: string;
  businessName: string;
  businessType: 'spa' | 'salon' | 'wellness';
  role: 'manager' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients?: string[];
  benefits?: string[];
  targetAudience?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdealClientProfile {
  id: string;
  productId: string;
  userId: string;
  title: string; // e.g., "Busy Professional Mom"
  demographics: {
    ageRange: string;
    income: string;
    lifestyle: string;
    location?: string;
    occupation?: string;
  };
  painPoints: string[];
  motivations: string[];
  preferredTone: 'professional' | 'casual' | 'consultative';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingMaterial {
  id: string;
  productId: string;
  userId: string;
  title: string;
  content: string;
  type: 'script' | 'guide' | 'faq' | 'objection-handling';
  duration: number; // estimated minutes
  generatedAt: Date;
  version: number;
  status: 'draft' | 'published' | 'archived';
  targetIcpId?: string; // Optional: specific ICP this material targets
}

export interface UploadSession {
  id: string;
  userId: string;
  filename: string;
  fileType: 'pdf' | 'image' | 'text';
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  extractedData?: any;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface AuthRequest {
  email: string;
  password: string;
  businessName?: string;
  businessType?: 'spa' | 'salon' | 'wellness';
  role?: 'manager' | 'staff';
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
  expiresIn: string;
}

export interface UploadRequest {
  file: File;
  productName?: string;
  category?: string;
}

export interface UploadResponse {
  sessionId: string;
  status: string;
  extractedData?: any;
  message: string;
}

export interface ProcessingRequest {
  sessionId: string;
  productData?: Partial<Product>;
  trainingOptions: {
    includeScript: boolean;
    includeGuide: boolean;
    includeFAQ: boolean;
    includeObjectionHandling: boolean;
    targetAudience?: string;
    tone?: 'professional' | 'friendly' | 'casual';
  };
}

export interface ProcessingResponse {
  trainingMaterials: TrainingMaterial[];
  estimatedDuration: number;
  generatedAt: Date;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Validation Schemas
export interface FileValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Configuration Types
export interface AppConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    uploadPath: string;
  };
  database: {
    url: string;
  };
  cors: {
    origin: string[];
    methods: string[];
  };
}

// OpenAI Integration Types
export interface OpenAIPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TrainingGenerationContext {
  product: Product;
  businessType: string;
  targetAudience: string;
  tone: string;
  includeTypes: string[];
  idealClientProfiles?: IdealClientProfile[]; // Enhanced context with ICPs
}

export interface EnhancedProcessingResponse {
  idealClientProfiles: IdealClientProfile[];
  trainingMaterials: TrainingMaterial[];
  estimatedDuration: number;
  generatedAt: Date;
}