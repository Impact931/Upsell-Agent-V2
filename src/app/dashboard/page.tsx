'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  TrendingUp, 
  Eye,
  Download,
  Share,
  Plus,
  Filter,
  Search,
  BarChart3,
  DollarSign,
  Clock,
  Archive,
  Folder,
  MessageSquare,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header, BottomNav } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner } from '@/components/ui';
import { EnhancedFileUpload } from '@/components/EnhancedFileUpload';
import { WellnessDisclaimer } from '@/components/Compliance';
import { useTrainingMaterials } from '@/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalMaterials: number;
  totalViews: number;
}


export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { materials: apiMaterials, isLoading: apiLoading, error } = useTrainingMaterials();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Set basic stats from API materials
  useEffect(() => {
    if (apiMaterials) {
      const uniqueProducts = new Set(apiMaterials.map(m => m.product?.id || 'general')).size;
      setStats({
        totalMaterials: uniqueProducts,
        totalViews: apiMaterials.length * 25, // Mock views
      });
      setIsLoading(false);
    }
  }, [apiMaterials]);

  // Set loading based on API loading state
  useEffect(() => {
    setIsLoading(apiLoading);
  }, [apiLoading]);



  const handleUploadComplete = (result: any) => {
    toast.success('File uploaded successfully!');
    setShowUpload(false);
    // Data will automatically refresh through the useTrainingMaterials hook
  };

  const handleContentChange = (content: { productName: string; productDescription: string; recommendedPrice: string }) => {
    // Content change handler for dashboard modal - can be used for validation or state management
  };

  const handleStagedUploadSubmit = async (files: any[], productData: { productName: string; productDescription: string; recommendedPrice: string }) => {
    console.log('Dashboard staged upload submit:', { filesCount: files.length, productData });
    
    try {
      // Import Cookies dynamically since we're in a client component
      const Cookies = (await import('js-cookie')).default;
      const token = Cookies.get('upsell_agent_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Upload each file with metadata
      const uploadPromises = files.map(async (uploadFile) => {
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('productName', productData.productName);
        formData.append('productDescription', productData.productDescription);
        formData.append('recommendedPrice', productData.recommendedPrice);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 409) {
            throw new Error(`${errorData.message || 'A product with this name already exists. Please use a different name.'}`);
          }
          throw new Error('Upload failed');
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      
      toast.success('Training materials generated successfully!');
      setShowUpload(false);
      // Data will refresh through the useTrainingMaterials hook
      
    } catch (error: any) {
      console.error('Dashboard staged upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg">Loading dashboard...</LoadingSpinner>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--neutral-50)' }}>
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="heading-1 mb-2">
              Welcome back, {user?.businessName}! 👋
            </h1>
            <p className="body-large" style={{ color: 'var(--neutral-600)' }}>
              Here's what's happening with your sales training today
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant="primary"
              className="h-24 flex-col btn--mobile-full"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="w-6 h-6 mb-2" />
              New Upsell Product
            </Button>
            
            <Link href="/materials" className="btn btn--secondary h-24 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              View Materials
            </Link>
            
            
            <Link href="/analytics" className="btn btn--outline h-24 flex-col">
              <BarChart3 className="w-6 h-6 mb-2" />
              View Analytics
            </Link>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="text-center p-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'var(--primary-teal-pale)' }}
                >
                  <FileText className="w-6 h-6" style={{ color: 'var(--primary-teal)' }} />
                </div>
                <h3 className="heading-3 mb-1">{stats.totalMaterials}</h3>
                <p className="body-small" style={{ color: 'var(--neutral-600)' }}>
                  Upsell Products
                </p>
              </Card>

              <Card className="text-center p-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'var(--secondary-sage-pale)' }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: 'var(--secondary-sage)' }} />
                </div>
                <h3 className="heading-3 mb-1">{stats.totalMaterials}</h3>
                <p className="body-small" style={{ color: 'var(--neutral-600)' }}>
                  Products Ready
                </p>
              </Card>

              <Card className="text-center p-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'var(--info-light)' }}
                >
                  <Eye className="w-6 h-6" style={{ color: 'var(--info)' }} />
                </div>
                <h3 className="heading-3 mb-1">{stats.totalViews}</h3>
                <p className="body-small" style={{ color: 'var(--neutral-600)' }}>
                  Total Views
                </p>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Stats & Tips */}
            <div className="space-y-6 lg:col-span-3">
              {/* Performance Tip */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--success)' }} />
                    Performance Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-small mb-4" style={{ color: 'var(--neutral-700)' }}>
                    Materials with FAQ sections get 40% more views and higher staff engagement scores.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
                    Create FAQ Materials
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Notice */}
              <WellnessDisclaimer 
                variant="inline" 
                dismissible={true}
                className="p-0"
              />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Search Materials
                  </Button>
                  <Link href="/materials" className="btn btn--outline btn--sm w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Reports
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
              <h2 className="heading-3">Create New Upsell Product</h2>
              <Button variant="icon" onClick={() => setShowUpload(false)}>
                <Plus className="w-5 h-5 rotate-45" />
              </Button>
            </div>
            <div className="p-6">
              <EnhancedFileUpload
                onUploadComplete={undefined}
                onSubmit={handleStagedUploadSubmit}
                onContentChange={handleContentChange}
                maxFiles={5}
                className="mb-4"
                showSubmitButton={true}
              />
            </div>
          </div>
        </div>
      )}


      <BottomNav />
    </div>
  );
}