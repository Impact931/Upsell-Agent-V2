'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === 'manager') {
          router.push('/dashboard');
        } else {
          router.push('/materials');
        }
      } else {
        // Redirect to login for unauthenticated users
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg">Loading...</LoadingSpinner>
      </div>
    );
  }

  // Fallback content (should rarely be seen due to redirects)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Upsell Agent
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered sales training platform for spa and salon businesses
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Backend API is Ready!
          </h2>
          <p className="text-gray-600 mb-6">
            The Upsell Agent backend architecture has been successfully implemented with the following features:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🔐 Authentication</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• JWT-based authentication</li>
                <li>• User registration & login</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">📁 File Processing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF text extraction</li>
                <li>• OCR for images</li>
                <li>• Automated product parsing</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🤖 AI Integration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• OpenAI GPT integration</li>
                <li>• Training material generation</li>
                <li>• Multiple content types</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🗄️ Database</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PostgreSQL with Prisma</li>
                <li>• Structured data models</li>
                <li>• Optimized queries</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            API Endpoints Available
          </h3>
          <div className="text-left space-y-2 text-sm text-blue-700">
            <div><code className="bg-blue-100 px-2 py-1 rounded">POST /api/auth/register</code> - User registration</div>
            <div><code className="bg-blue-100 px-2 py-1 rounded">POST /api/auth/login</code> - User login</div>
            <div><code className="bg-blue-100 px-2 py-1 rounded">POST /api/upload</code> - File upload & processing</div>
            <div><code className="bg-blue-100 px-2 py-1 rounded">POST /api/process</code> - Generate training materials</div>
            <div><code className="bg-blue-100 px-2 py-1 rounded">GET /api/training</code> - List training materials</div>
            <div><code className="bg-blue-100 px-2 py-1 rounded">GET /api/health</code> - System health check</div>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm">
          <p>Ready for frontend integration and user interface development.</p>
        </div>
      </div>
    </div>
  );
}