'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star,
  Clock,
  Eye,
  Download,
  Share,
  Play,
  FileText,
  MessageSquare,
  HelpCircle,
  Bookmark,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header, BottomNav } from '@/components/Navigation';
import { Card, CardContent, Button, LoadingSpinner, Input } from '@/components/ui';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'script' | 'guide' | 'faq' | 'objection-handling';
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  views: number;
  rating: number;
  isFavorited: boolean;
  isCompleted: boolean;
  lastAccessed?: string;
  createdAt: string;
  content?: string;
}

const MOCK_MATERIALS: TrainingMaterial[] = [
  {
    id: '1',
    title: 'Hydrating Face Serum Sales Script',
    type: 'script',
    description: 'Master the art of selling premium skincare with confidence and expertise.',
    duration: 5,
    difficulty: 'beginner',
    category: 'Skincare',
    tags: ['anti-aging', 'hydration', 'premium'],
    views: 45,
    rating: 4.8,
    isFavorited: true,
    isCompleted: true,
    lastAccessed: '2024-01-15',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Massage Package Upsell Guide',
    type: 'guide',
    description: 'Step-by-step approach to increasing revenue through package deals.',
    duration: 8,
    difficulty: 'intermediate',
    category: 'Massage',
    tags: ['packages', 'upselling', 'relaxation'],
    views: 32,
    rating: 4.9,
    isFavorited: false,
    isCompleted: false,
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    title: 'Common Customer Objections FAQ',
    type: 'faq',
    description: 'Ready-made responses to the most common customer concerns and questions.',
    duration: 3,
    difficulty: 'beginner',
    category: 'General',
    tags: ['objections', 'customer-service', 'communication'],
    views: 28,
    rating: 4.7,
    isFavorited: true,
    isCompleted: false,
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'Aromatherapy Product Recommendations',
    type: 'objection-handling',
    description: 'Handle price objections and highlight value propositions effectively.',
    duration: 6,
    difficulty: 'advanced',
    category: 'Aromatherapy',
    tags: ['essential-oils', 'wellness', 'therapeutic'],
    views: 19,
    rating: 4.6,
    isFavorited: false,
    isCompleted: false,
    createdAt: '2024-01-03',
  },
];

const TYPE_ICONS = {
  script: MessageSquare,
  guide: BookOpen,
  faq: HelpCircle,
  'objection-handling': TrendingUp,
};

const TYPE_COLORS = {
  script: 'var(--primary-teal)',
  guide: 'var(--secondary-sage)',
  faq: 'var(--info)',
  'objection-handling': 'var(--warning)',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<TrainingMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory, selectedType]);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      setTimeout(() => {
        setMaterials(MOCK_MATERIALS);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      toast.error('Failed to load training materials');
      setIsLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material =>
        material.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    setFilteredMaterials(filtered);
  };

  const toggleFavorite = (materialId: string) => {
    setMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, isFavorited: !material.isFavorited }
          : material
      )
    );
    toast.success('Updated favorites');
  };

  const markAsCompleted = (materialId: string) => {
    setMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, isCompleted: true, lastAccessed: new Date().toISOString().split('T')[0] }
          : material
      )
    );
    toast.success('Material marked as completed!');
  };

  const categories = Array.from(new Set(materials.map(m => m.category)));

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
        <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-8">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="heading-2 mb-2">
              Hello, {user?.businessName}! 📚
            </h1>
            <p className="body-base" style={{ color: 'var(--neutral-600)' }}>
              Your personalized training materials are ready
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center p-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: 'var(--primary-teal-pale)' }}
              >
                <BookOpen className="w-5 h-5" style={{ color: 'var(--primary-teal)' }} />
              </div>
              <h3 className="heading-4 mb-1">{materials.length}</h3>
              <p className="caption">Total Materials</p>
            </Card>

            <Card className="text-center p-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: 'var(--success-light)' }}
              >
                <Star className="w-5 h-5" style={{ color: 'var(--success)' }} />
              </div>
              <h3 className="heading-4 mb-1">{materials.filter(m => m.isCompleted).length}</h3>
              <p className="caption">Completed</p>
            </Card>

            <Card className="text-center p-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: 'var(--error-light)' }}
              >
                <Heart className="w-5 h-5" style={{ color: 'var(--error)' }} />
              </div>
              <h3 className="heading-4 mb-1">{materials.filter(m => m.isFavorited).length}</h3>
              <p className="caption">Favorites</p>
            </Card>

            <Card className="text-center p-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: 'var(--info-light)' }}
              >
                <Clock className="w-5 h-5" style={{ color: 'var(--info)' }} />
              </div>
              <h3 className="heading-4 mb-1">{materials.reduce((acc, m) => acc + m.duration, 0)}</h3>
              <p className="caption">Total Minutes</p>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(showFilters && 'bg-gray-100')}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {showFilters && (
              <Card className="p-4">
                <div className="space-y-4">
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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Materials List */}
          {filteredMaterials.length === 0 ? (
            <Card className="text-center p-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--neutral-300)' }} />
              <h3 className="heading-4 mb-2">No materials found</h3>
              <p className="body-base mb-4" style={{ color: 'var(--neutral-600)' }}>
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Ask your manager to upload training materials'
                }
              </p>
              {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => {
                const IconComponent = TYPE_ICONS[material.type];
                
                return (
                  <Card key={material.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Left section - Icon and type */}
                        <div 
                          className="flex-shrink-0 w-20 flex flex-col items-center justify-center p-4"
                          style={{ backgroundColor: `${TYPE_COLORS[material.type]}15` }}
                        >
                          <IconComponent 
                            className="w-8 h-8 mb-2" 
                            style={{ color: TYPE_COLORS[material.type] }}
                          />
                          <span 
                            className="text-xs font-medium capitalize"
                            style={{ color: TYPE_COLORS[material.type] }}
                          >
                            {material.type.replace('-', ' ')}
                          </span>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="heading-4 mb-1">{material.title}</h3>
                              <p className="body-small mb-2" style={{ color: 'var(--neutral-600)' }}>
                                {material.description}
                              </p>
                            </div>
                            
                            <Button
                              variant="icon"
                              size="sm"
                              onClick={() => toggleFavorite(material.id)}
                              className="ml-2"
                            >
                              <Heart 
                                className={clsx('w-4 h-4', material.isFavorited && 'fill-current')}
                                style={{ color: material.isFavorited ? 'var(--error)' : 'var(--neutral-400)' }}
                              />
                            </Button>
                          </div>

                          {/* Meta information */}
                          <div className="flex flex-wrap items-center gap-4 text-xs mb-3" style={{ color: 'var(--neutral-500)' }}>
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
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              material.difficulty === 'beginner' 
                                ? 'bg-green-100 text-green-800'
                                : material.difficulty === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {material.difficulty}
                            </span>
                            {material.isCompleted && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Star className="w-3 h-3 fill-current" />
                                Completed
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {material.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 rounded text-xs"
                                style={{ 
                                  backgroundColor: 'var(--neutral-100)', 
                                  color: 'var(--neutral-600)' 
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 sm:flex-initial"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {material.isCompleted ? 'Review' : 'Start'}
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <Share className="w-4 h-4" />
                            </Button>
                            
                            {!material.isCompleted && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => markAsCompleted(material.id)}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}