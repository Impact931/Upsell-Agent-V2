import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

async function securityStatusHandler(_request: NextRequest) {
  const startTime = Date.now();
  
  // Only allow internal monitoring calls or authorized admin users
  const authHeader = _request.headers.get('authorization');
  const monitoringToken = process.env.MONITORING_TOKEN;
  
  if (!authHeader?.includes(monitoringToken || 'invalid') && process.env.NODE_ENV === 'production') {
    apiLogger.logSecurityEvent('Unauthorized security status access', 
      _request.headers.get('x-forwarded-for') || 'unknown');
    
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  const securityChecks: Record<string, any> = {};

  // Check for recent security events
  try {
    const db = await import('@/lib/database').then(m => m.prisma);
    
    // Get recent security events (last 24 hours)
    // TODO: Add securityEvent table to database schema if security logging is needed
    const recentEvents: any[] = []; // Placeholder for security events

    const eventsBySeverity = {
      critical: recentEvents.filter(e => e.severity === 'CRITICAL').length,
      high: recentEvents.filter(e => e.severity === 'HIGH').length,
      medium: recentEvents.filter(e => e.severity === 'MEDIUM').length,
      low: recentEvents.filter(e => e.severity === 'LOW').length
    };

    securityChecks.recentEvents = {
      status: eventsBySeverity.critical > 0 ? 'critical' : 
              eventsBySeverity.high > 5 ? 'warning' : 'healthy',
      total: recentEvents.length,
      bySeverity: eventsBySeverity,
      details: recentEvents.slice(0, 5).map(e => ({
        type: e.type,
        severity: e.severity,
        message: e.message,
        createdAt: e.createdAt
      }))
    };

    // Failed login attempts (last hour)
    // TODO: Add loginAttempt table to database schema if login attempt tracking is needed
    const recentFailedLogins: any[] = []; // Placeholder for failed login attempts

    // Group by IP to detect potential brute force
    const failedLoginsByIP = recentFailedLogins.reduce((acc, attempt) => {
      acc[attempt.ipAddress] = (acc[attempt.ipAddress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suspiciousIPs = Object.entries(failedLoginsByIP)
      .filter(([_ip, count]) => (count as number) > 5)
      .map(([ip, count]) => ({ ip, attempts: count as number }));

    securityChecks.loginSecurity = {
      status: suspiciousIPs.length > 0 ? 'warning' : 'healthy',
      failedAttempts: recentFailedLogins.length,
      suspiciousIPs,
      details: {
        threshold: 5,
        timeWindow: '1 hour'
      }
    };

    // Rate limiting status
    const rateLimitEntries = await db.rateLimit.findMany({
      where: {
        resetTime: {
          gte: new Date()
        }
      }
    });

    securityChecks.rateLimiting = {
      status: 'healthy',
      activeBlocks: rateLimitEntries.length,
      details: rateLimitEntries.slice(0, 10).map(entry => ({
        key: entry.key,
        count: entry.count,
        resetTime: entry.resetTime
      }))
    };

  } catch (error) {
    securityChecks.databaseCheck = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Database unavailable'
    };
  }

  // Environment security configuration check
  const envChecks = {
    jwtSecret: {
      configured: !!process.env.JWT_SECRET,
      strong: process.env.JWT_SECRET ? process.env.JWT_SECRET.length >= 32 : false
    },
    httpsEnforced: process.env.NODE_ENV === 'production',
    corsConfigured: !!process.env.CORS_ORIGINS,
    rateLimitingEnabled: !!process.env.RATE_LIMIT_MAX,
    loggingEnabled: !!process.env.LOG_FILE,
    productionMode: process.env.NODE_ENV === 'production'
  };

  const envIssues = Object.entries(envChecks)
    .filter(([key, value]) => typeof value === 'object' ? !Object.values(value).every(Boolean) : !value)
    .map(([key]) => key);

  securityChecks.configuration = {
    status: envIssues.length === 0 ? 'healthy' : 'warning',
    checks: envChecks,
    issues: envIssues
  };

  // Overall security status
  const hasErrors = Object.values(securityChecks).some(check => check.status === 'error');
  const hasCritical = Object.values(securityChecks).some(check => check.status === 'critical');
  const hasWarnings = Object.values(securityChecks).some(check => check.status === 'warning');

  const overallStatus = hasErrors ? 'error' : 
                       hasCritical ? 'critical' :
                       hasWarnings ? 'warning' : 'healthy';

  const responseTime = Date.now() - startTime;

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks: securityChecks,
    summary: {
      errors: Object.values(securityChecks).filter(c => c.status === 'error').length,
      critical: Object.values(securityChecks).filter(c => c.status === 'critical').length,
      warnings: Object.values(securityChecks).filter(c => c.status === 'warning').length,
      healthy: Object.values(securityChecks).filter(c => c.status === 'healthy').length
    }
  };

  // Log security status check
  apiLogger.logSecurityEvent('Security status checked', 
    request.headers.get('x-forwarded-for') || 'system', 
    { status: overallStatus });

  const httpStatus = overallStatus === 'error' ? 500 :
                    overallStatus === 'critical' ? 503 :
                    overallStatus === 'warning' ? 200 : 200;

  return NextResponse.json(response, { status: httpStatus });
}

export const GET = handleAsyncRoute(securityStatusHandler);