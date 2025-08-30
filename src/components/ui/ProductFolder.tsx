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
  script: '#9CAF88', // sage-300
  guide: '#C8A882', // earth secondary  
  faq: '#7A9266', // sage-400
  'objection-handling': '#B8A082', // muted gold
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

  const latestMaterial = materials.length > 0 
    ? materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200/40 shadow-spa hover:shadow-spa-lg transition-all duration-300 overflow-hidden">
      <div className="p-0">
        {/* Folder Header */}
        <div
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-sage-50/50 transition-all duration-300"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center shadow-spa transition-all duration-300">
                {expanded ? (
                  <FolderOpen className="w-5 h-5 text-white" />
                ) : (
                  <Folder className="w-5 h-5 text-white" />
                )}
              </div>
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-sage-500 transition-transform duration-300" />
              ) : (
                <ChevronRight className="w-5 h-5 text-sage-500 transition-transform duration-300" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold text-earth-800 mb-1">{product.name}</h3>
              <div className="flex items-center gap-4 text-sm text-earth-600">
                <span className="bg-sage-50 px-2 py-1 rounded-lg font-medium">
                  {materials.length} material{materials.length !== 1 ? 's' : ''}
                </span>
                <span className="bg-earth-50 px-2 py-1 rounded-lg font-medium">{product.category}</span>
                {latestMaterial && (
                  <span className="text-earth-500">Updated {formatDate(latestMaterial.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sage-100 to-sage-200 text-sage-700 px-3 py-2 rounded-xl text-sm font-semibold shadow-spa">
              {materials.length}
            </div>
            
            {/* Action Menu */}
            {(onArchiveProduct || onDeleteProduct) && (
              <div className="relative" ref={actionsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="p-2 hover:bg-sage-100 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  aria-label="Product actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-sage-500" />
                </button>
                
                {showActions && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm border border-sage-200/60 rounded-xl shadow-spa-lg z-10"
                  >
                    {onArchiveProduct && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveProduct(product.id);
                          setShowActions(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-earth-700 hover:bg-sage-50/80 transition-all duration-300 rounded-lg mx-2 my-1"
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
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-accent-coral hover:bg-accent-coral/10 transition-all duration-300 rounded-lg mx-2 my-1"
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
          <div className="border-t border-sage-200/40">
            <div className="p-6 space-y-6">
              {/* Ideal Client Profiles Section */}
              {product.idealClientProfiles && product.idealClientProfiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-sage-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-display text-lg font-semibold text-earth-800">
                      Ideal Client Profiles ({product.idealClientProfiles.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {product.idealClientProfiles.map((icp, index) => (
                      <div
                        key={icp.id}
                        className="p-4 rounded-xl border border-sage-200/60 bg-gradient-to-br from-sage-50/80 to-earth-50/60 backdrop-blur-sm shadow-spa hover:shadow-spa-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-spa">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-display font-semibold text-sm text-earth-800 truncate">
                              {icp.title}
                            </h5>
                            <p className="text-xs text-earth-600">
                              {icp.demographics.ageRange} • {icp.demographics.income}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-1">
                            <Target className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                            <div className="text-xs text-earth-600">
                              <span className="font-semibold">Pain Points:</span>
                              <p className="mt-1">{icp.painPoints.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <Heart className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <div className="text-xs text-earth-600">
                              <span className="font-semibold">Motivations:</span>
                              <p className="mt-1">{icp.motivations.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-sage-200/60">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              icp.preferredTone === 'professional' 
                                ? 'bg-sage-100 text-sage-700'
                                : icp.preferredTone === 'casual' 
                                  ? 'bg-earth-100 text-earth-700'
                                  : 'bg-accent-mint/20 text-sage-700'
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-earth-400 to-earth-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-earth-800">
                    Training Materials ({materials.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {materials.map((material) => {
                const Icon = TYPE_ICONS[material.type];
                
                return (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-sage-200/60 hover:bg-sage-50/50 transition-all duration-300 cursor-pointer shadow-spa hover:shadow-spa-lg transform hover:scale-[1.01]"
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
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-display font-semibold text-sm text-earth-800">
                            {material.title}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(material.status)} ml-3 flex-shrink-0`}>
                            {material.status}
                          </span>
                        </div>
                        
                        {material.description && (
                          <p className="text-xs mb-3 line-clamp-2 text-earth-600">
                            {material.description.length > 100 
                              ? material.description.substring(0, 100) + '...'
                              : material.description
                            }
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-earth-500">
                          <span 
                            className="capitalize font-semibold bg-white/70 px-2 py-1 rounded-lg"
                            style={{ color: TYPE_COLORS[material.type] }}
                          >
                            {material.type.replace('-', ' ')}
                          </span>
                          
                          <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            {material.duration} min
                          </span>
                          
                          {material.views && (
                            <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                              <Eye className="w-3 h-3" />
                              {material.views}
                            </span>
                          )}
                          
                          {material.rating && (
                            <span className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              {material.rating}
                            </span>
                          )}
                          
                          {material.difficulty && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(material.difficulty)}`}>
                              {material.difficulty}
                            </span>
                          )}
                          
                          <span className="text-earth-400">{formatDate(material.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
                {materials.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-sage-400" />
                    </div>
                    <p className="text-sm text-earth-600">
                      No wellness materials in this product folder
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}