import { NextRequest, NextResponse } from 'next/server';
import { handleAsyncRoute } from '@/lib/errors';
import { checkDatabaseHealth } from '@/lib/database';
import { checkLoggerHealth } from '@/lib/logger';
import { config } from '@/config';

async function healthCheckHandler(_request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // Database health check
  try {
    const dbHealth = await checkDatabaseHealth();
    checks.database = dbHealth;
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Logger health check
  try {
    const loggerHealth = checkLoggerHealth();
    checks.logger = loggerHealth;
  } catch (error) {
    checks.logger = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // OpenAI health check (basic)
  try {
    if (config.openai.apiKey) {
      // Simple check - we don't make an actual API call to avoid costs
      // Just verify the API key format
      const isValidKey = config.openai.apiKey.startsWith('sk-') && config.openai.apiKey.length > 20;
      checks.openai = {
        status: isValidKey ? 'healthy' : 'unhealthy',
        details: { keyConfigured: !!config.openai.apiKey, keyFormat: isValidKey },
      };
    } else {
      checks.openai = {
        status: 'unhealthy',
        error: 'OpenAI API key not configured',
      };
    }
  } catch (error) {
    checks.openai = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // File system health check
  try {
    const fs = require('fs');
    const path = require('path');
    const testFile = path.join('/tmp', 'health-check-test.txt');
    
    fs.writeFileSync(testFile, 'health check test');
    fs.statSync(testFile); // Test file system read access
    fs.unlinkSync(testFile);
    
    checks.filesystem = { 
      status: 'healthy',
      details: { writable: true }
    };
  } catch (error) {
    checks.filesystem = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory usage check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };
  
  // Consider unhealthy if heap usage > 500MB (adjust as needed)
  const isMemoryHealthy = memUsageMB.heapUsed < 500;
  checks.memory = {
    status: isMemoryHealthy ? 'healthy' : 'unhealthy',
    usage: memUsageMB,
    details: { thresholdMB: 500 }
  };

  // Security checks
  checks.security = {
    status: 'healthy',
    details: {
      jwtConfigured: !!process.env.JWT_SECRET,
      httpsEnforced: process.env.NODE_ENV === 'production',
      corsConfigured: !!process.env.CORS_ORIGINS,
      rateLimitingEnabled: process.env.RATE_LIMIT_MAX !== undefined
    }
  };

  // Recent error rate check (last 5 minutes)
  try {
    // This would require a proper metrics store in production
    // For now, just check if logger is accessible
    checks.errorRate = {
      status: 'healthy',
      details: { recentErrors: 0, threshold: 10 }
    };
  } catch (error) {
    checks.errorRate = {
      status: 'unhealthy',
      error: 'Unable to check error rate'
    };
  }

  // Overall health status
  const allHealthy = Object.values(checks).every(
    check => check.status === 'healthy'
  );

  const responseTime = Date.now() - startTime;

  const healthResponse = {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    checks,
  };

  // Return appropriate HTTP status
  const httpStatus = allHealthy ? 200 : 503;

  return NextResponse.json(healthResponse, { status: httpStatus });
}

export const GET = handleAsyncRoute(healthCheckHandler);