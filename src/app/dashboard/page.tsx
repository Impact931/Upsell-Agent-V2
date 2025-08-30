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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sage-50/30 to-earth-50/30">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center shadow-spa">
                <span className="text-2xl">🌿</span>
              </div>
              <div>
                <h1 className="font-display text-3xl font-semibold text-earth-800">
                  Welcome back, {user?.businessName}
                </h1>
                <p className="text-lg text-earth-600">
                  Your wellness management dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setShowUpload(true)}
              className="group bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white p-6 rounded-2xl shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <Upload className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">New Wellness Product</span>
                <span className="text-sm opacity-90 mt-1">Upload & generate materials</span>
              </div>
            </button>
            
            <Link href="/materials" className="group bg-white/80 backdrop-blur-sm border-2 border-sage-200/60 hover:border-sage-300 p-6 rounded-2xl shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <FileText className="w-8 h-8 mb-3 text-sage-500 group-hover:text-sage-600 group-hover:scale-110 transition-all" />
                <span className="font-semibold text-lg text-earth-700">View Materials</span>
                <span className="text-sm text-earth-500 mt-1">Browse training content</span>
              </div>
            </Link>
            
            <Link href="/analytics" className="group bg-white/80 backdrop-blur-sm border-2 border-earth-200/60 hover:border-earth-300 p-6 rounded-2xl shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="w-8 h-8 mb-3 text-earth-500 group-hover:text-earth-600 group-hover:scale-110 transition-all" />
                <span className="font-semibold text-lg text-earth-700">Analytics</span>
                <span className="text-sm text-earth-500 mt-1">Performance insights</span>
              </div>
            </Link>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-sage-100/50 shadow-spa text-center group hover:shadow-spa-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7 text-sage-600" />
                </div>
                <h3 className="text-2xl font-bold text-earth-800 mb-1">{stats.totalMaterials}</h3>
                <p className="text-earth-600 font-medium">
                  Wellness Products
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-earth-100/50 shadow-spa text-center group hover:shadow-spa-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-earth-100 to-earth-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-earth-600" />
                </div>
                <h3 className="text-2xl font-bold text-earth-800 mb-1">{stats.totalMaterials}</h3>
                <p className="text-earth-600 font-medium">
                  Ready for Training
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-sage-100/50 shadow-spa text-center group hover:shadow-spa-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-mint/20 to-accent-mint/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 text-sage-600" />
                </div>
                <h3 className="text-2xl font-bold text-earth-800 mb-1">{stats.totalViews}</h3>
                <p className="text-earth-600 font-medium">
                  Team Engagements
                </p>
              </div>
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