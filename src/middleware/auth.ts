import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

// Protected routes configuration
const PROTECTED_ROUTES = {
  // Manager-only routes
  manager: ['/upload', '/staff-management', '/analytics'],
  // Staff and manager routes
  authenticated: ['/dashboard', '/materials', '/staff', '/settings', '/compliance'],
  // Public routes (no authentication required)
  public: ['/login', '/register', '/', '/api/health'],
};

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register', 
  '/api/health',
];

interface JWTPayload {
  userId: string;
  email: string;
  role: 'manager' | 'staff';
  businessType: string;
  exp: number;
}

export function handleRouteAuthentication(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  
  // Check if route requires authentication
  if (isPublicRoute(pathname)) {
    return null; // Allow access
  }

  // Get token from cookie
  const token = request.cookies.get('upsell_agent_token')?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Use centralized auth service for JWT verification
    const decoded = authService.verifyToken(token);
    
    // Token expiration is already handled by authService.verifyToken()

    // Check role-based access
    if (requiresManagerRole(pathname) && decoded.role !== 'manager') {
      // Redirect to appropriate dashboard
      const redirectUrl = new URL('/staff', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return null; // Allow access

  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid token
    response.cookies.delete('upsell_agent_token');
    return response;
  }
}

export function handleApiAuthentication(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Check if API route is public
  if (isPublicApiRoute(pathname)) {
    return null;
  }

  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('upsell_agent_token')?.value;
  
  let token: string | undefined;
  try {
    token = authHeader ? authService.extractTokenFromHeader(authHeader) : cookieToken;
  } catch (error) {
    // If header extraction fails, try cookie token
    token = cookieToken;
  }

  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Use centralized auth service for token verification
    const decoded = authService.verifyToken(token);
    
    // Token expiration is already handled by authService.verifyToken()

    // Check role-based API access
    if (requiresManagerApiAccess(pathname) && decoded.role !== 'manager') {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to access this resource',
          },
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return null; // Allow access

  } catch (error) {
    console.error('API JWT verification failed:', error);
    
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function isPublicRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.public.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function requiresManagerRole(pathname: string): boolean {
  return PROTECTED_ROUTES.manager.some(route => pathname.startsWith(route));
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

function requiresManagerApiAccess(pathname: string): boolean {
  // API routes that require manager role
  const managerApiRoutes = [
    '/api/upload',
    '/api/process',
    '/api/training', // POST, PUT, DELETE operations
    '/api/staff',
  ];
  
  return managerApiRoutes.some(route => {
    if (route === '/api/training') {
      // Allow GET for all authenticated users, restrict POST/PUT/DELETE for managers
      return pathname.startsWith(route) && 
             (pathname !== '/api/training' && !pathname.match(/\/api\/training\/[^\/]+$/));
    }
    return pathname.startsWith(route);
  });
}

// Utility function to extract user info from request headers (for API routes)
export function getUserFromRequest(request: Request): {
  userId: string;
  role: 'manager' | 'staff';
  email: string;
  businessType: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role') as 'manager' | 'staff';
  const email = request.headers.get('x-user-email');
  const businessType = request.headers.get('x-business-type');

  if (!userId || !role || !email || !businessType) {
    return null;
  }

  return {
    userId,
    role,
    email,
    businessType,
  };
}