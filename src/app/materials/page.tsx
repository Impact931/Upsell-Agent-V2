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
  script: 'var(--primary-teal)',
  guide: 'var(--secondary-sage)',
  faq: 'var(--info)',
  'objection-handling': 'var(--warning)',
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
        return 'text-green-700 bg-green-100';
      case 'draft':
        return 'text-yellow-700 bg-yellow-100';
      case 'archived':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-700 bg-green-100';
      case 'intermediate':
        return 'text-yellow-700 bg-yellow-100';
      case 'advanced':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--neutral-50)' }}>
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <PageHeader
            title="Training Materials"
            description="Manage and access all your training content"
            actions={
              user?.role === 'manager' && (
                <Link href="/upload">
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Upsell Product
                  </Button>
                </Link>
              )
            }
          />

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(showFilters && 'bg-gray-100')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="form-input pr-10 appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="views">Most Viewed</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'folders' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('folders')}
                  className="rounded-r-none border-r-0"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-r-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label mb-2 block">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Types</option>
                    <option value="script">Scripts</option>
                    <option value="guide">Guides</option>
                    <option value="faq">FAQs</option>
                    <option value="objection-handling">Objection Handling</option>
                  </select>
                </div>

                {user?.role === 'manager' && (
                  <div>
                    <label className="label mb-2 block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="form-input"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                )}

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
              {viewMode === 'folders' 
                ? `${filteredProductGroups.length} product folder${filteredProductGroups.length !== 1 ? 's' : ''} • ${filteredMaterials.length} material${filteredMaterials.length !== 1 ? 's' : ''}`
                : `${filteredMaterials.length} material${filteredMaterials.length !== 1 ? 's' : ''} found`
              }
            </p>
          </div>

          {/* Materials Display */}
          {(viewMode === 'folders' ? filteredProductGroups.length === 0 : filteredMaterials.length === 0) ? (
            <Card className="text-center p-12">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-300)' }} />
              <h3 className="heading-3 mb-2">No materials found</h3>
              <p className="body-base mb-6" style={{ color: 'var(--neutral-600)' }}>
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : error 
                    ? 'Error loading training materials. Please try again.'
                    : 'Upload your first training material to get started'
                }
              </p>
              {user?.role === 'manager' && (
                <Link href="/upload">
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Upsell Product
                  </Button>
                </Link>
              )}
            </Card>
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
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
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
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <Card 
                    key={material.id} 
                    className={clsx(
                      'overflow-hidden',
                      viewMode === 'list' && 'flex'
                    )}
                  >
                    <CardContent className={clsx('p-0', viewMode === 'list' && 'flex w-full')}>
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
                                  className="text-sm font-medium capitalize"
                                  style={{ color: TYPE_COLORS[material.type] }}
                                >
                                  {material.type.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <Button
                                variant="icon"
                                size="sm"
                                onClick={() => handleToggleFavorite(material.id)}
                              >
                                <Star 
                                  className={clsx('w-4 h-4', material.isFavorited && 'fill-current')}
                                  style={{ color: material.isFavorited ? 'var(--warning)' : 'var(--neutral-400)' }}
                                />
                              </Button>
                            </div>

                            <h3 className="heading-4 mb-2">{material.title}</h3>
                            <p className="body-small mb-4" style={{ color: 'var(--neutral-600)' }}>
                              {material.description}
                            </p>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs mb-4" style={{ color: 'var(--neutral-500)' }}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {material.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {material.views} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" style={{ color: 'var(--warning)' }} />
                                {material.rating}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                                {material.difficulty}
                              </span>
                            </div>

                            {/* Status and date */}
                            <div className="flex items-center justify-between text-xs mb-4">
                              <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(material.status)}`}>
                                {material.status}
                              </span>
                              <span style={{ color: 'var(--neutral-500)' }}>
                                {formatDate(material.createdAt)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMaterialSelect(material)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(material)}
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                              
                              {user?.role === 'manager' && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setMaterialToDelete(material)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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
                                <h3 className="heading-4">{material.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                                  {material.status}
                                </span>
                              </div>
                              
                              <p className="body-small mb-2" style={{ color: 'var(--neutral-600)' }}>
                                {material.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--neutral-500)' }}>
                                <span>{material.type.replace('-', ' ')}</span>
                                <span>{material.category}</span>
                                <span>{material.duration} min</span>
                                <span>{material.views} views</span>
                                <span>★ {material.rating}</span>
                                <span>{formatDate(material.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="icon"
                                size="sm"
                                onClick={() => handleToggleFavorite(material.id)}
                              >
                                <Star 
                                  className={clsx('w-4 h-4', material.isFavorited && 'fill-current')}
                                  style={{ color: material.isFavorited ? 'var(--warning)' : 'var(--neutral-400)' }}
                                />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMaterialSelect(material)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(material)}
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                              
                              {user?.role === 'manager' && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setMaterialToDelete(material)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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