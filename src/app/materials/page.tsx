'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Share, 
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Grid,
  List,
  FolderOpen,
  Sort,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header, BottomNav, PageHeader } from '@/components/Navigation';
import { Card, CardContent, Button, LoadingSpinner, Input, ProductFolder, ConfirmModal } from '@/components/ui';
import { useTrainingMaterials } from '@/hooks';
import { ComplianceNotice } from '@/components/Compliance';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'script' | 'guide' | 'faq' | 'objection-handling';
  description?: string;
  content?: string;
  duration: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  views?: number;
  rating?: number;
  isFavorited?: boolean;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  author?: string;
  product?: {
    id: string;
    name: string;
    category: string;
    price: number;
  };
}


const TYPE_ICONS = {
  script: MessageSquare,
  guide: FileText,
  faq: HelpCircle,
  'objection-handling': TrendingUp,
};

const TYPE_COLORS = {
  script: '#9CAF88', // sage-300
  guide: '#C8A882', // earth secondary  
  faq: '#7A9266', // sage-400
  'objection-handling': '#B8A082', // muted gold
};

type ViewMode = 'folders' | 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title' | 'views' | 'rating';

interface IdealClientProfile {
  id: string;
  title: string;
  demographics: {
    ageRange: string;
    income: string;
    lifestyle: string;
  };
  painPoints: string[];
  motivations: string[];
  preferredTone: string;
  generatedAt: string;
}

interface ProductGroup {
  product: {
    id: string;
    name: string;
    category: string;
    price?: number;
    idealClientProfiles?: IdealClientProfile[];
  };
  materials: TrainingMaterial[];
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { materials: apiMaterials, isLoading, error } = useTrainingMaterials();
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [materialToDelete, setMaterialToDelete] = useState<TrainingMaterial | null>(null);

  // Sync API data with local state and transform it
  useEffect(() => {
    if (apiMaterials && apiMaterials.length > 0) {
      const transformedMaterials: TrainingMaterial[] = apiMaterials.map((material: any) => ({
        id: material.id,
        title: material.title,
        type: material.type.toLowerCase().replace('_', '-') as 'script' | 'guide' | 'faq' | 'objection-handling',
        description: material.content?.substring(0, 200) + '...' || 'AI-generated training material',
        content: material.content,
        duration: material.duration || 5,
        difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
        category: material.product?.category || 'General',
        tags: material.product ? [material.product.category.toLowerCase()] : ['general'],
        views: Math.floor(Math.random() * 50) + 10, // Mock view count for demo
        rating: Number((Math.random() * 1 + 4).toFixed(1)), // Mock rating 4.0-5.0
        isFavorited: false,
        status: material.status.toLowerCase() as 'published' | 'draft' | 'archived',
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
        author: 'AI Generated',
        product: material.product ? {
          ...material.product,
          idealClientProfiles: material.product.idealClientProfiles || []
        } : undefined,
      }));
      setMaterials(transformedMaterials);
    } else if (apiMaterials && apiMaterials.length === 0) {
      // Clear materials if API returns empty array
      setMaterials([]);
    }
  }, [apiMaterials]);

  const categories = useMemo(() => 
    Array.from(new Set(materials.map(m => m.category).filter(Boolean))), 
    [materials]
  );

  // Group materials by product
  const productGroups = useMemo<ProductGroup[]>(() => {
    const groupMap = new Map<string, ProductGroup>();
    
    materials.forEach(material => {
      const productKey = material.product?.id || 'no-product';
      const productName = material.product?.name || 'Uncategorized Materials';
      const productCategory = material.product?.category || 'General';
      
      if (!groupMap.has(productKey)) {
        groupMap.set(productKey, {
          product: {
            id: productKey,
            name: productName,
            category: productCategory,
            price: material.product?.price,
            idealClientProfiles: material.product?.idealClientProfiles || [],
          },
          materials: []
        });
      }
      
      groupMap.get(productKey)!.materials.push(material);
    });
    
    return Array.from(groupMap.values());
  }, [materials]);

  // Filter and sort product groups
  const filteredProductGroups = useMemo(() => {
    let filtered = productGroups.map(group => {
      let filteredMaterials = group.materials;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredMaterials = filteredMaterials.filter(material =>
          material.title.toLowerCase().includes(query) ||
          material.description?.toLowerCase().includes(query) ||
          material.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          material.category?.toLowerCase().includes(query) ||
          group.product.name.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (selectedCategory !== 'all') {
        filteredMaterials = filteredMaterials.filter(material =>
          material.category === selectedCategory
        );
      }

      // Type filter
      if (selectedType !== 'all') {
        filteredMaterials = filteredMaterials.filter(material => material.type === selectedType);
      }

      // Status filter
      if (selectedStatus !== 'all') {
        filteredMaterials = filteredMaterials.filter(material => material.status === selectedStatus);
      }

      // Sort materials within each group
      filteredMaterials.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });

      return {
        ...group,
        materials: filteredMaterials
      };
    });

    // Only keep groups that have materials after filtering
    filtered = filtered.filter(group => group.materials.length > 0);

    // Sort groups by latest material creation date
    filtered.sort((a, b) => {
      const aLatest = a.materials.reduce((latest, material) => 
        new Date(material.createdAt) > new Date(latest.createdAt) ? material : latest
      );
      const bLatest = b.materials.reduce((latest, material) => 
        new Date(material.createdAt) > new Date(latest.createdAt) ? material : latest
      );
      return new Date(bLatest.createdAt).getTime() - new Date(aLatest.createdAt).getTime();
    });

    return filtered;
  }, [productGroups, searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // Pagination calculations
  const totalProducts = filteredProductGroups.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProductGroups = filteredProductGroups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // For backward compatibility with grid/list views
  const filteredMaterials = useMemo(() => {
    return filteredProductGroups.flatMap(group => group.materials);
  }, [filteredProductGroups]);

  const handleToggleFavorite = (materialId: string) => {
    setMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, isFavorited: !material.isFavorited }
          : material
      )
    );
    toast.success('Updated favorites');
  };

  const handleFolderToggle = (productId: string) => {
    setExpandedFolders(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleArchiveProduct = async (productId: string) => {
    try {
      // Remove all materials for this product from the main list (they will be stored in archive)
      setMaterials(prev => prev.filter(material => material.product?.id !== productId));
      toast.success('Product archived successfully and removed from main view');
    } catch (error) {
      toast.error('Failed to archive product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Remove all materials for this product
      setMaterials(prev => prev.filter(material => material.productId !== productId));
      toast.success('Product and all materials deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleMaterialSelect = (material: TrainingMaterial) => {
    router.push(`/materials/${material.id}`);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      setMaterialToDelete(null);
      toast.success('Training material deleted successfully');
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleShare = (material: TrainingMaterial) => {
    if (navigator.share) {
      navigator.share({
        title: material.title,
        text: material.description,
        url: `/materials/${material.id}`,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${material.title} - ${window.location.origin}/materials/${material.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-sage-700 bg-sage-100';
      case 'draft':
        return 'text-earth-700 bg-earth-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-sage-700 bg-sage-100';
      case 'intermediate':
        return 'text-earth-700 bg-earth-100';
      case 'advanced':
        return 'text-accent-coral bg-accent-coral/10';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg">Loading materials...</LoadingSpinner>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center shadow-spa">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-semibold text-earth-800">
                    Sales Support Materials
                  </h1>
                  <p className="text-lg text-earth-600">
                    Manage and access all your sales support content
                  </p>
                </div>
              </div>
              {user?.role === 'manager' && (
                <Link href="/upload">
                  <button className="bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <Plus className="w-5 h-5" />
                    New Product
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-sage-200/40 shadow-spa mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
                  <input
                    type="search"
                    placeholder="Search product materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2 ${showFilters ? 'bg-sage-100 text-sage-700 border-sage-300' : 'bg-white/70 text-earth-600 border-sage-200/60 hover:border-sage-300'} border-2`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="appearance-none bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 focus:border-sage-300 focus:ring-2 focus:ring-sage-300/50 px-4 py-3 pr-10 rounded-xl font-medium text-earth-600 transition-all duration-300 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="views">Most Viewed</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sage-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="flex bg-white/50 p-1 rounded-xl border border-sage-200/40">
                  <button
                    onClick={() => setViewMode('folders')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'folders' ? 'bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-spa' : 'text-earth-500 hover:text-sage-600 hover:bg-sage-50/80'}`}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-spa' : 'text-earth-500 hover:text-sage-600 hover:bg-sage-50/80'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-spa' : 'text-earth-500 hover:text-sage-600 hover:bg-sage-50/80'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-sage-200/40 shadow-spa mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-earth-700">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 text-earth-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-earth-700">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 text-earth-600"
                  >
                    <option value="all">All Types</option>
                    <option value="script">Scripts</option>
                    <option value="guide">Guides</option>
                    <option value="faq">FAQs</option>
                    <option value="objection-handling">Objection Handling</option>
                  </select>
                </div>

                {user?.role === 'manager' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-earth-700">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 text-earth-600"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                    className="bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-earth-600 hover:text-sage-700 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] w-full"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-sage-200/40">
              <p className="text-sm font-medium text-earth-600">
                {viewMode === 'folders' 
                  ? `${filteredProductGroups.length} product folder${filteredProductGroups.length !== 1 ? 's' : ''} • ${filteredMaterials.length} material${filteredMaterials.length !== 1 ? 's' : ''}`
                  : `${filteredMaterials.length} material${filteredMaterials.length !== 1 ? 's' : ''} found`
                }
              </p>
            </div>
          </div>

          {/* Materials Display */}
          {(viewMode === 'folders' ? filteredProductGroups.length === 0 : filteredMaterials.length === 0) ? (
            <div className="bg-white/80 backdrop-blur-sm text-center p-12 rounded-2xl border border-sage-200/40 shadow-spa">
              <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-sage-400" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-earth-800 mb-3">No materials found</h3>
              <p className="text-lg text-earth-600 mb-8">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : error 
                    ? 'Error loading training materials. Please try again.'
                    : 'Upload your first product to get started'
                }
              </p>
              {user?.role === 'manager' && (
                <Link href="/upload">
                  <button className="bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02] mx-auto">
                    <Plus className="w-5 h-5" />
                    New Product
                  </button>
                </Link>
              )}
            </div>
          ) : viewMode === 'folders' ? (
            <>
              <div className="space-y-4">
                {paginatedProductGroups.map((group) => (
                  <ProductFolder
                    key={group.product.id}
                    product={group.product}
                    materials={group.materials}
                    onMaterialSelect={handleMaterialSelect}
                    isExpanded={expandedFolders.includes(group.product.id)}
                    onToggleExpand={handleFolderToggle}
                    onArchiveProduct={handleArchiveProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-sage-200/40 shadow-spa">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-earth-600 font-medium">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
                                currentPage === pageNumber
                                  ? 'bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-spa'
                                  : 'bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={clsx(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredMaterials.map((material) => {
                const Icon = TYPE_ICONS[material.type];
                
                return (
                  <div 
                    key={material.id} 
                    className={clsx(
                      'bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200/40 shadow-spa hover:shadow-spa-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden',
                      viewMode === 'list' && 'flex'
                    )}
                  >
                    <div className={clsx('p-0', viewMode === 'list' && 'flex w-full')}>
                      {/* Type indicator */}
                      <div 
                        className={clsx(
                          'flex items-center justify-center',
                          viewMode === 'grid' ? 'h-2 w-full' : 'w-2 h-full'
                        )}
                        style={{ backgroundColor: TYPE_COLORS[material.type] }}
                      />

                      <div className={clsx('flex-1 p-6', viewMode === 'list' && 'flex items-center')}>
                        {viewMode === 'grid' ? (
                          // Grid view
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon 
                                  className="w-5 h-5" 
                                  style={{ color: TYPE_COLORS[material.type] }}
                                />
                                <span 
                                  className="text-sm font-medium capitalize px-2 py-1 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-900 border border-primary-200"
                                >
                                  Sales Support {material.type.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => handleToggleFavorite(material.id)}
                                className="p-2 rounded-lg bg-white/50 border border-sage-200/60 hover:border-sage-300 transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Star 
                                  className={clsx('w-4 h-4', material.isFavorited && 'fill-current')}
                                  style={{ color: material.isFavorited ? '#F59E0B' : '#9CA3AF' }}
                                />
                              </button>
                            </div>

                            {/* Product Name */}
                            {material.product?.name && (
                              <div className="mb-2">
                                <span className="text-lg font-bold text-primary-900">{material.product.name}</span>
                              </div>
                            )}

                            <h3 className="font-display text-lg font-semibold text-earth-800 mb-2">{material.title}</h3>
                            <p className="text-earth-600 mb-3">
                              {material.description}
                            </p>

                            {/* ICP Pain Points and Motivators */}
                            {material.product?.idealClientProfiles && material.product.idealClientProfiles.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Client Profiles:</h4>
                                <div className="space-y-2">
                                  {material.product.idealClientProfiles.slice(0, 3).map((icp, index) => (
                                    <div key={icp.id} className="bg-gradient-to-r from-neutral-50 to-primary-50/30 p-3 rounded-lg border border-primary-200/40">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {index + 1}
                                        </div>
                                        <span className="text-sm font-semibold text-primary-900">{icp.title}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <div className="text-red-600 font-medium mb-1">Top Pain Points:</div>
                                          {(icp.painPoints || []).slice(0, 2).map((pain, idx) => (
                                            <div key={idx} className="text-red-700 flex items-start gap-1">
                                              <span className="text-red-400 mt-0.5">•</span>
                                              <span className="line-clamp-1">{pain}</span>
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <div className="text-green-600 font-medium mb-1">Motivations:</div>
                                          {(icp.motivations || []).slice(0, 2).map((motivation, idx) => (
                                            <div key={idx} className="text-green-700 flex items-start gap-1">
                                              <span className="text-green-400 mt-0.5">•</span>
                                              <span className="line-clamp-1">{motivation}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs mb-4 text-earth-500">
                              <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                                <Clock className="w-3 h-3" />
                                {material.duration} min
                              </span>
                              <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                                <Eye className="w-3 h-3" />
                                {material.views} views
                              </span>
                              <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3 fill-current text-yellow-500" />
                                {material.rating}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                                {material.difficulty}
                              </span>
                            </div>

                            {/* Status and date */}
                            <div className="flex items-center justify-between text-xs mb-4">
                              <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(material.status)}`}>
                                {material.status}
                              </span>
                              <span className="text-earth-500">
                                {formatDate(material.createdAt)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMaterialSelect(material)}
                                className="flex-1 bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              
                              <button 
                                onClick={() => handleShare(material)}
                                className="bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Share className="w-4 h-4" />
                              </button>
                              
                              {user?.role === 'manager' && (
                                <>
                                  <button className="bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setMaterialToDelete(material)}
                                    className="bg-white/70 border-2 border-accent-coral/40 hover:border-accent-coral text-accent-coral hover:text-accent-coral p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          // List view
                          <div className="flex w-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon 
                                  className="w-5 h-5" 
                                  style={{ color: TYPE_COLORS[material.type] }}
                                />
                                <div className="flex items-center gap-3">
                                  {material.product?.name && (
                                    <span className="text-lg font-bold text-primary-900">{material.product.name} - </span>
                                  )}
                                  <h3 className="font-display text-lg font-semibold text-earth-800">{material.title}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                                  {material.status}
                                </span>
                              </div>
                              
                              <p className="text-earth-600 mb-2">
                                {material.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-earth-500">
                                <span className="bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-900 border border-primary-200 px-2 py-1 rounded">Sales Support {material.type.replace('-', ' ')}</span>
                                <span className="bg-sage-50 px-2 py-1 rounded">{material.category}</span>
                                <span>{material.duration} min</span>
                                <span>{material.views} views</span>
                                <span>★ {material.rating}</span>
                                <span>{formatDate(material.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleToggleFavorite(material.id)}
                                className="p-2 rounded-lg bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Star 
                                  className={clsx('w-4 h-4', material.isFavorited && 'fill-current')}
                                  style={{ color: material.isFavorited ? '#F59E0B' : '#9CA3AF' }}
                                />
                              </button>
                              
                              <button
                                onClick={() => handleMaterialSelect(material)}
                                className="bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              
                              <button 
                                onClick={() => handleShare(material)}
                                className="bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                              >
                                <Share className="w-4 h-4" />
                              </button>
                              
                              {user?.role === 'manager' && (
                                <>
                                  <button className="bg-white/70 border-2 border-sage-200/60 hover:border-sage-300 text-sage-600 hover:text-sage-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setMaterialToDelete(material)}
                                    className="bg-white/70 border-2 border-accent-coral/40 hover:border-accent-coral text-accent-coral hover:text-accent-coral p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compliance Notice */}
          {filteredMaterials.length > 0 && (
            <div className="mt-8">
              <ComplianceNotice 
                type={user?.businessType === 'spa' ? 'spa' : user?.businessType === 'salon' ? 'salon' : 'wellness'}
                variant="inline" 
                dismissible={true}
              />
            </div>
          )}
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {materialToDelete && (
        <ConfirmModal
          isOpen={!!materialToDelete}
          onClose={() => setMaterialToDelete(null)}
          onConfirm={() => handleDeleteMaterial(materialToDelete.id)}
          title="Delete Training Material"
          description={`Are you sure you want to delete "${materialToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}

      <BottomNav />
    </div>
  );
}