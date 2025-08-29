import { NextResponse } from 'next/server';
import { ApiError } from '@/types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'FILE_PROCESSING_ERROR', details);
    this.name = 'FileProcessingError';
  }
}

export class OpenAIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, 'OPENAI_ERROR', details);
    this.name = 'OpenAIError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export function createErrorResponse(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date(),
    };

    return NextResponse.json({ error: apiError }, { status: error.statusCode });
  }

  // Handle unexpected errors
  const apiError: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date(),
  };

  return NextResponse.json({ error: apiError }, { status: 500 });
}

export function handleAsyncRoute(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}