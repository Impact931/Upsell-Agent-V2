'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  FolderOpen, 
  Folder,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Clock,
  Eye,
  Star,
  Users,
  Target,
  Heart,
  Archive,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { clsx } from 'clsx';

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

interface ProductFolderProps {
  product: {
    id: string;
    name: string;
    category: string;
    price?: number;
    idealClientProfiles?: IdealClientProfile[];
  };
  materials: TrainingMaterial[];
  onMaterialSelect: (material: TrainingMaterial) => void;
  isExpanded?: boolean;
  onToggleExpand?: (productId: string) => void;
  onArchiveProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
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

export function ProductFolder({ 
  product, 
  materials, 
  onMaterialSelect,
  isExpanded = false,
  onToggleExpand,
  onArchiveProduct,
  onDeleteProduct
}: ProductFolderProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  
  // Close actions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    }
    
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);
  
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand(product.id);
    } else {
      setLocalExpanded(!localExpanded);
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

  const latestMaterial = materials.length > 0 
    ? materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Folder Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
              {expanded ? (
                <FolderOpen className="w-6 h-6" style={{ color: 'var(--primary-teal)' }} />
              ) : (
                <Folder className="w-6 h-6" style={{ color: 'var(--primary-teal)' }} />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="heading-4 mb-1">{product.name}</h3>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--neutral-600)' }}>
                <span>{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
                <span>{product.category}</span>
                {latestMaterial && (
                  <span>Updated {formatDate(latestMaterial.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--primary-teal-pale)',
                color: 'var(--primary-teal-dark)'
              }}
            >
              {materials.length}
            </span>
            
            {/* Action Menu */}
            {(onArchiveProduct || onDeleteProduct) && (
              <div className="relative" ref={actionsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Product actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
                
                {showActions && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    style={{ boxShadow: 'var(--shadow-md)' }}
                  >
                    {onArchiveProduct && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveProduct(product.id);
                          setShowActions(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archive Product
                      </button>
                    )}
                    {onDeleteProduct && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this product and all its materials? This action cannot be undone.')) {
                            onDeleteProduct(product.id);
                            setShowActions(false);
                          }
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Product
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Folder Contents */}
        {expanded && (
          <div className="border-t" style={{ borderColor: 'var(--neutral-200)' }}>
            <div className="p-4 space-y-4">
              {/* Ideal Client Profiles Section */}
              {product.idealClientProfiles && product.idealClientProfiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" style={{ color: 'var(--primary-teal)' }} />
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--neutral-900)' }}>
                      Ideal Client Profiles ({product.idealClientProfiles.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {product.idealClientProfiles.map((icp, index) => (
                      <div
                        key={icp.id}
                        className="p-3 rounded-lg border bg-gradient-to-br from-teal-50 to-blue-50"
                        style={{ borderColor: 'var(--primary-teal-pale)' }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-700">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-gray-900 truncate">
                              {icp.title}
                            </h5>
                            <p className="text-xs text-gray-600">
                              {icp.demographics.ageRange} • {icp.demographics.income}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-1">
                            <Target className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Pain Points:</span>
                              <p className="mt-0.5">{icp.painPoints.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <Heart className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Motivations:</span>
                              <p className="mt-0.5">{icp.motivations.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <div className="pt-1 border-t border-gray-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              icp.preferredTone === 'professional' 
                                ? 'bg-blue-100 text-blue-700'
                                : icp.preferredTone === 'casual' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                            }`}>
                              {icp.preferredTone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training Materials Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" style={{ color: 'var(--primary-teal)' }} />
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--neutral-900)' }}>
                    Training Materials ({materials.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {materials.map((material) => {
                const Icon = TYPE_ICONS[material.type];
                
                return (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--neutral-200)' }}
                    onClick={() => onMaterialSelect(material)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <Icon 
                          className="w-5 h-5 mt-0.5" 
                          style={{ color: TYPE_COLORS[material.type] }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>
                            {material.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)} ml-2 flex-shrink-0`}>
                            {material.status}
                          </span>
                        </div>
                        
                        {material.description && (
                          <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--neutral-600)' }}>
                            {material.description.length > 100 
                              ? material.description.substring(0, 100) + '...'
                              : material.description
                            }
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--neutral-500)' }}>
                          <span 
                            className="capitalize font-medium"
                            style={{ color: TYPE_COLORS[material.type] }}
                          >
                            {material.type.replace('-', ' ')}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {material.duration} min
                          </span>
                          
                          {material.views && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {material.views}
                            </span>
                          )}
                          
                          {material.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" style={{ color: 'var(--warning)' }} />
                              {material.rating}
                            </span>
                          )}
                          
                          {material.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                              {material.difficulty}
                            </span>
                          )}
                          
                          <span>{formatDate(material.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
                {materials.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--neutral-300)' }} />
                    <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
                      No materials in this product folder
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}