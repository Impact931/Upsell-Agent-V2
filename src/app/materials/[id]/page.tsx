'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  Share,
  Bookmark,
  BookmarkCheck,
  Clock,
  Eye,
  Star,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Calendar,
  User,
  Tag,
  Users,
  Target,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header, BottomNav } from '@/components/Navigation';
import { Card, CardContent, Button, LoadingSpinner } from '@/components/ui';
import { useTrainingMaterials } from '@/hooks';
import { toast } from 'react-hot-toast';

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
    idealClientProfiles?: IdealClientProfile[];
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

export default function MaterialViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { materials, isLoading } = useTrainingMaterials();
  
  const [material, setMaterial] = useState<TrainingMaterial | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [activeICPTab, setActiveICPTab] = useState<string>('');

  useEffect(() => {
    if (materials && params.id) {
      const foundMaterial = materials.find((m: any) => m.id === params.id);
      if (foundMaterial) {
        // Transform the API material to match our interface
        const transformedMaterial: TrainingMaterial = {
          id: foundMaterial.id,
          title: foundMaterial.title,
          type: foundMaterial.type.toLowerCase().replace('_', '-') as 'script' | 'guide' | 'faq' | 'objection-handling',
          description: 'AI-generated training material customized for multiple client personas',
          content: foundMaterial.content,
          duration: foundMaterial.duration || 5,
          difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
          category: foundMaterial.product?.category || 'General',
          tags: foundMaterial.product ? [foundMaterial.product.category.toLowerCase()] : ['general'],
          views: Math.floor(Math.random() * 50) + 10,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          isFavorited: false,
          status: foundMaterial.status.toLowerCase() as 'published' | 'draft' | 'archived',
          createdAt: foundMaterial.createdAt,
          updatedAt: foundMaterial.updatedAt,
          author: 'AI Generated',
          product: foundMaterial.product ? {
            ...foundMaterial.product,
            idealClientProfiles: foundMaterial.product.idealClientProfiles || []
          } : undefined,
        };
        
        setMaterial(transformedMaterial);
        setViewCount(transformedMaterial.views || 0);
        setIsBookmarked(transformedMaterial.isFavorited || false);
        
        // Set first ICP as active tab if this is a script with ICPs
        if (transformedMaterial.type === 'script' && transformedMaterial.product?.idealClientProfiles && transformedMaterial.product.idealClientProfiles.length > 0) {
          setActiveICPTab(transformedMaterial.product.idealClientProfiles[0].id);
        }
        
        // Increment view count (mock)
        setTimeout(() => {
          setViewCount(prev => prev + 1);
        }, 2000);
      }
    }
  }, [materials, params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Helper function to format content with proper CSS styling
  const formatContentWithCSS = (content: string) => {
    if (!content) return '';
    
    return content
      // Replace markdown headers
      .replace(/#### (.*?)$/gm, '<h4 class="text-lg font-semibold text-teal-600 mt-6 mb-3 pb-1 border-b border-teal-200">$1</h4>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 underline decoration-teal-500">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-extrabold text-gray-900 mt-10 mb-5 pl-4 border-l-4 border-teal-500">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-3xl font-black text-teal-600 mt-12 mb-6 text-center uppercase tracking-wide">$1</h1>')
      // Replace markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Format lists
      .replace(/^- (.*?)$/gm, '<div class="flex items-start my-2"><span class="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span>$1</span></div>')
      .replace(/^(\d+)\. (.*?)$/gm, '<div class="flex items-start my-2"><span class="font-semibold text-teal-600 mr-2 min-w-6">$1.</span><span>$2</span></div>')
      // Handle line breaks
      .replace(/\n\n/g, '<br class="my-4"/>')
      .replace(/\n/g, '<br/>');
  };

  // Generate a complete, high-converting sales script for each specific ICP
  const getICPSpecificContent = (icp: IdealClientProfile, content: string) => {
    // Always generate a complete, actionable sales script for this specific ICP
    return generateCompleteScript(icp);
  };

  const generateCompleteScript = (icp: IdealClientProfile) => {    
    return `**Complete Sales Script for ${icp.title}**\n\n` +
    
    `**OPENING (Build Rapport & Identify Need)**\n` +
    `"${getOpeningScript(icp)}"\n\n` +
    
    `**DISCOVERY QUESTIONS (Uncover Pain Points)**\n` +
    `${getDiscoveryQuestions(icp).join('\n')}\n\n` +
    
    `**BENEFIT PRESENTATION (Value Proposition)**\n` +
    `"${getBenefitPresentation(icp)}"\n\n` +
    
    `**HANDLE OBJECTIONS (Address Concerns)**\n` +
    `${getObjectionHandling(icp).join('\n')}\n\n` +
    
    `**PRICE PRESENTATION (Investment Justification)**\n` +
    `"${getPricePresentation(icp)}"\n\n` +
    
    `**CLOSING (Ask for the Sale)**\n` +
    `"${getClosingTechnique(icp)}"\n\n` +
    
    `**FOLLOW-UP (Seal the Deal)**\n` +
    `"${getFollowUpScript(icp)}"`;
  };

  const getOpeningScript = (icp: IdealClientProfile) => {
    // Generate opening based on actual ICP data
    const primaryPain = icp.painPoints[0] || 'wellness concerns';
    const primaryMotivation = icp.motivations[0] || 'improving well-being';
    const demographics = icp.demographics;
    
    if (icp.title.toLowerCase().includes('remote worker') || icp.title.toLowerCase().includes('professional')) {
      return `Good afternoon! I can see you're someone who values efficiency and well-being. Our ${material?.product?.name || 'product'} is perfect for busy professionals like yourself who want ${primaryMotivation.toLowerCase()}. Many of our clients who work remotely have found it helps with ${primaryPain.toLowerCase()}. Would you like to hear how it can fit into your daily routine?`;
    }
    
    if (icp.title.toLowerCase().includes('senior') || icp.title.toLowerCase().includes('wellness-focused')) {
      return `Hello! Our ${material?.product?.name || 'product'} is specially designed for health-conscious individuals who appreciate natural wellness solutions. I noticed you might be interested in ${primaryMotivation.toLowerCase()}. It's gentle yet effective for addressing ${primaryPain.toLowerCase()}. May I share how it can enhance your wellness routine?`;
    }
    
    if (icp.title.toLowerCase().includes('millennial') || icp.title.toLowerCase().includes('mindful')) {
      return `Hi there! I can tell you're someone who values mindful, natural approaches to wellness. Our ${material?.product?.name || 'product'} aligns perfectly with your focus on ${primaryMotivation.toLowerCase()}. Many clients with similar concerns about ${primaryPain.toLowerCase()} have had great results. Would you like to learn more?`;
    }
    
    // Default dynamic opening
    return `Hello! I noticed you might be interested in solutions for ${primaryPain.toLowerCase()}. Our ${material?.product?.name || 'product'} is specifically designed for someone who values ${primaryMotivation.toLowerCase()}. Would you like to discover how it can help you?`;
  };

  const getDiscoveryQuestions = (icp: IdealClientProfile) => {
    const questions = [
      `• "What's your biggest challenge with ${icp.painPoints[0]?.toLowerCase() || 'relaxation'}?"`,
      `• "How important is ${icp.motivations[0]?.toLowerCase() || 'natural wellness'} to you right now?"`,
      `• "What have you tried before that didn't quite work for you?"`
    ];
    return questions;
  };

  const getBenefitPresentation = (icp: IdealClientProfile) => {
    const benefits = icp.motivations.slice(0, 3).map(motivation => 
      `delivering ${motivation.toLowerCase()}`
    ).join(', and ');
    
    const primaryPain = icp.painPoints[0] || 'wellness concerns';
    const primaryMotivation = icp.motivations[0] || 'improved well-being';
    
    if (icp.title.toLowerCase().includes('remote worker') || icp.title.toLowerCase().includes('professional')) {
      return `Here's what makes our ${material?.product?.name || 'product'} perfect for busy professionals like yourself: It directly addresses ${primaryPain.toLowerCase()} while ${benefits}. It's designed to fit seamlessly into your schedule without requiring significant time investment.`;
    }
    
    if (icp.title.toLowerCase().includes('senior') || icp.title.toLowerCase().includes('wellness-focused')) {
      return `This ${material?.product?.name || 'product'} is ideal for health-conscious individuals because it uses only natural, gentle approaches that promote wellness. By ${benefits}, it's specifically designed for those who prioritize holistic health solutions for ${primaryPain.toLowerCase()}.`;
    }
    
    if (icp.title.toLowerCase().includes('millennial') || icp.title.toLowerCase().includes('mindful')) {
      return `As someone who values mindful, sustainable approaches, you'll appreciate that our ${material?.product?.name || 'product'} is environmentally conscious while ${benefits}. It perfectly aligns with your focus on ${primaryMotivation.toLowerCase()} and addresses ${primaryPain.toLowerCase()}.`;
    }
    
    // Default dynamic presentation
    return `This ${material?.product?.name || 'product'} directly addresses your needs by ${benefits}. It's specifically designed for people like you who value ${primaryMotivation.toLowerCase()} and want to resolve ${primaryPain.toLowerCase()}.`;
  };

  const getObjectionHandling = (icp: IdealClientProfile) => {
    return [
      `**If they say "I need to think about it":** "I completely understand wanting to make the right decision. What specific concerns do you have that I can address right now?"`,
      `**If they say "It's too expensive":** "I hear you. When you break it down, it's less than ${Math.round(100 / 30)} dollars per day for ${icp.motivations[0]?.toLowerCase() || 'better wellness'}. What's the cost of NOT addressing ${icp.painPoints[0]?.toLowerCase() || 'this issue'}?"`,
      `**If they say "I'll buy it online":** "That's certainly an option. The difference here is you get my personal support and guarantee. Plus, I can answer any questions you have right now. Isn't that peace of mind worth it?"`
    ];
  };

  const getPricePresentation = (icp: IdealClientProfile) => {
    const productPrice = material?.product?.price || 50;
    const primaryMotivation = icp.motivations[0] || 'improved well-being';
    const primaryPain = icp.painPoints[0] || 'wellness concerns';
    
    if (icp.title.toLowerCase().includes('remote worker') || icp.title.toLowerCase().includes('professional')) {
      return `At $${productPrice}, this ${material?.product?.name || 'product'} is a smart investment for busy professionals. Think about what you spend on stress relief or wellness treatments - this pays for itself by ${primaryMotivation.toLowerCase()} and addressing ${primaryPain.toLowerCase()}. It's professional-grade results at a fraction of the cost.`;
    }
    
    if (icp.title.toLowerCase().includes('senior') || icp.title.toLowerCase().includes('wellness-focused')) {
      return `At $${productPrice}, this represents excellent value for someone committed to natural wellness. It's much more cost-effective than multiple spa visits or wellness treatments, and you can use it whenever you need ${primaryMotivation.toLowerCase()}. Your health is worth this investment.`;
    }
    
    if (icp.title.toLowerCase().includes('millennial') || icp.title.toLowerCase().includes('mindful')) {
      return `For $${productPrice}, you're investing in ${primaryMotivation.toLowerCase()} while supporting sustainable practices. When you consider the long-term benefits of addressing ${primaryPain.toLowerCase()}, it's actually quite affordable and aligns with your values.`;
    }
    
    // Default dynamic price presentation
    return `At $${productPrice}, this ${material?.product?.name || 'product'} represents excellent value for someone who prioritizes ${primaryMotivation.toLowerCase()}. Given what you value most, this investment makes perfect sense for addressing ${primaryPain.toLowerCase()}.`;
  };

  const getClosingTechnique = (icp: IdealClientProfile) => {
    const primaryMotivation = icp.motivations[0] || 'improved well-being';
    const primaryPain = icp.painPoints[0] || 'wellness concerns';
    
    if (icp.title.toLowerCase().includes('remote worker') || icp.title.toLowerCase().includes('professional')) {
      return `How about we start with one to complement your busy lifestyle? It's a smart step towards ${primaryMotivation.toLowerCase()} and addressing ${primaryPain.toLowerCase()}. You deserve that investment in your well-being.`;
    }
    
    if (icp.title.toLowerCase().includes('senior') || icp.title.toLowerCase().includes('wellness-focused')) {
      return `Based on your commitment to natural wellness, this ${material?.product?.name || 'product'} seems like the perfect addition to your health routine. It aligns perfectly with your focus on ${primaryMotivation.toLowerCase()}. Should we get one started for you today?`;
    }
    
    if (icp.title.toLowerCase().includes('millennial') || icp.title.toLowerCase().includes('mindful')) {
      return `This ${material?.product?.name || 'product'} fits perfectly with your values and lifestyle. It's designed for people who prioritize ${primaryMotivation.toLowerCase()}. How would you like to move forward with addressing ${primaryPain.toLowerCase()}?`;
    }
    
    // Default dynamic closing
    return `Based on what you've shared about ${primaryPain.toLowerCase()}, this ${material?.product?.name || 'product'} seems like the perfect fit for someone focused on ${primaryMotivation.toLowerCase()}. How would you like to move forward?`;
  };

  const getFollowUpScript = (icp: IdealClientProfile) => {
    const primaryMotivation = icp.motivations[0] || 'positive results';
    return `Perfect! I'm excited for you to experience the benefits of ${material?.product?.name || 'this product'}. I'll make sure you have my contact information for any questions. Many clients with similar goals around ${primaryMotivation.toLowerCase()} see great results within the first few days. I'll check in with you next week to see how it's working for you.`;
  };

  // Helper function to generate key talking points for an ICP
  const generateKeyTalkingPoints = (icp: IdealClientProfile) => {
    return [
      `Address their primary concern: ${icp.painPoints[0] || 'specific needs'}`,
      icp.motivations[0] && `Highlight value: ${icp.motivations[0]}`,
      `Adapt tone to be ${icp.preferredTone} throughout the conversation`,
      `Reference their ${icp.demographics.lifestyle} lifestyle when relevant`,
      `Focus on ROI given their ${icp.demographics.income} income level`,
      icp.painPoints[1] && `Be prepared to discuss: ${icp.painPoints[1]}`,
    ].filter(Boolean) as string[];
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = () => {
    if (navigator.share && material) {
      navigator.share({
        title: material.title,
        text: material.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!material) return;
    
    // Check if we're viewing an ICP-specific script
    if (material.type === 'script' && material.product?.idealClientProfiles && activeICPTab) {
      const currentICP = material.product.idealClientProfiles.find(icp => icp.id === activeICPTab);
      if (currentICP) {
        // Create ICP-specific download content
        let icpContent = `${material.title}\n`;
        icpContent += `Customized for: ${currentICP.title}\n\n`;
        icpContent += `DEMOGRAPHICS:\n`;
        icpContent += `Age: ${currentICP.demographics.ageRange}\n`;
        icpContent += `Income: ${currentICP.demographics.income}\n`;
        icpContent += `Lifestyle: ${currentICP.demographics.lifestyle}\n\n`;
        icpContent += `PAIN POINTS:\n${currentICP.painPoints.map(p => `• ${p}`).join('\n')}\n\n`;
        icpContent += `MOTIVATIONS:\n${currentICP.motivations.map(m => `• ${m}`).join('\n')}\n\n`;
        icpContent += `PREFERRED TONE: ${currentICP.preferredTone}\n\n`;
        icpContent += `KEY TALKING POINTS:\n${generateKeyTalkingPoints(currentICP).map(p => `• ${p}`).join('\n')}\n\n`;
        icpContent += `CUSTOMIZED SCRIPT:\n${getICPSpecificContent(currentICP, material.content || '')}`;
        
        const blob = new Blob([icpContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${currentICP.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${currentICP.title} training material downloaded`);
        return;
      }
    }
    
    // Fallback to original download for non-ICP materials
    const content = material.content || material.description || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Training material downloaded');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg">Loading material...</LoadingSpinner>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="text-center p-8 max-w-md">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-300)' }} />
            <h2 className="heading-3 mb-2">Material Not Found</h2>
            <p className="body-base mb-4" style={{ color: 'var(--neutral-600)' }}>
              The training material you're looking for could not be found.
            </p>
            <Button variant="primary" onClick={() => router.push('/materials')}>
              Back to Materials
            </Button>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  const Icon = TYPE_ICONS[material.type];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--neutral-50)' }}>
      <Header />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>

          {/* Header Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TYPE_COLORS[material.type]}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: TYPE_COLORS[material.type] }} />
                  </div>
                  
                  <div className="flex-1">
                    {/* Product Name */}
                    {material.product?.name && (
                      <div className="mb-4">
                        <h1 className="text-2xl font-bold text-primary-900 mb-1">{material.product.name}</h1>
                        <p className="text-secondary-900/80 text-sm">
                          Professional sales support materials created specifically for your {user?.businessType || 'wellness'} team
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-sm font-medium capitalize px-3 py-1 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-900 border border-primary-200"
                      >
                        Sales Support {material.type.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                        {material.status}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-neutral-900 mb-3">{material.title}</h2>
                    
                    {material.description && (
                      <div 
                        className="body-base mb-4 prose max-w-none" 
                        style={{ color: 'var(--neutral-700)' }}
                        dangerouslySetInnerHTML={{
                          __html: formatContentWithCSS(material.description)
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmarkToggle}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" style={{ color: 'var(--primary-teal)' }} />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-100)' }}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 mr-1" style={{ color: 'var(--neutral-600)' }} />
                  </div>
                  <div className="font-semibold text-lg">{material.duration}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>Minutes</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 mr-1" style={{ color: 'var(--neutral-600)' }} />
                  </div>
                  <div className="font-semibold text-lg">{viewCount}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>Views</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 mr-1 fill-current" style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="font-semibold text-lg">{material.rating}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>Rating</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Tag className="w-4 h-4 mr-1" style={{ color: 'var(--neutral-600)' }} />
                  </div>
                  <div className={`font-semibold text-sm px-2 py-1 rounded capitalize ${getDifficultyColor(material.difficulty || 'intermediate')}`}>
                    {material.difficulty || 'Intermediate'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-4 h-4 mr-1" style={{ color: 'var(--neutral-600)' }} />
                  </div>
                  <div className="font-semibold text-sm">{formatDate(material.createdAt).split(' ')[0]}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>Created</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="p-6 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
                <h2 className="heading-3">Training Content</h2>
              </div>
              
              <div className="p-6">
                {/* ICP Tabs for Scripts */}
                {material.type === 'script' && material.product?.idealClientProfiles && material.product.idealClientProfiles.length > 0 ? (
                  <div className="space-y-6">
                    {/* Tab Navigation - All 3 tabs on one line */}
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-primary-200/40 shadow-spa">
                      {material.product.idealClientProfiles.map((icp, index) => (
                        <button
                          key={icp.id}
                          onClick={() => setActiveICPTab(icp.id)}
                          className={`group relative px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                            activeICPTab === icp.id
                              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-spa-lg'
                              : 'text-neutral-900 hover:text-primary-900 hover:bg-primary-50/80'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors mb-2 ${
                              activeICPTab === icp.id 
                                ? 'bg-white/20 text-white' 
                                : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="font-semibold text-xs leading-tight">{icp.title}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Tab Content - Elegant content display */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-100/50 shadow-spa overflow-hidden">
                      {material.product.idealClientProfiles
                        .filter(icp => icp.id === activeICPTab)
                        .map((icp) => (
                          <div key={icp.id} className="p-8">
                            {/* ICP Header */}
                            <div className="mb-6 pb-4 border-b border-primary-200/40">
                              <h3 className="text-xl font-semibold text-primary-900 mb-3">
                                {icp.title} Sales Script
                              </h3>
                              
                              {/* Pain Points and Motivators Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Top 2 Pain Points */}
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                      <span className="text-red-600 text-sm">⚠</span>
                                    </div>
                                    <h4 className="font-semibold text-red-800 text-sm">Pain Points</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {(icp.painPoints || []).slice(0, 2).map((pain, idx) => (
                                      <div key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span>{pain}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Top 2 Motivations */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <Heart className="w-3 h-3 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-green-800 text-sm">Motivations</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {(icp.motivations || []).slice(0, 2).map((motivation, idx) => (
                                      <div key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                        <span className="text-green-400 mt-1">•</span>
                                        <span>{motivation}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <p className="text-secondary-900/80 text-sm">
                                Customized sales approach tailored for this client profile
                              </p>
                            </div>
                            
                            {/* Script Content */}
                            <div 
                              className="prose prose-lg max-w-none spa-content"
                              style={{ 
                                lineHeight: '1.8',
                                fontSize: '16px',
                                color: '#54463a',
                                fontFamily: 'Inter, system-ui, sans-serif'
                              }}
                              dangerouslySetInnerHTML={{
                                __html: formatContentWithCSS(getICPSpecificContent(icp, material.content || ''))
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  // Regular content display for non-script materials or scripts without ICPs
                  <div 
                    style={{ 
                      lineHeight: '1.8',
                      fontSize: '16px',
                      color: 'var(--neutral-800)'
                    }}
                  >
                    {material.content ? (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatContentWithCSS(material.content)
                        }}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--neutral-300)' }} />
                        <p style={{ color: 'var(--neutral-600)' }}>
                          No detailed content available for this material.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata Section */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="heading-4 mb-3">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--neutral-600)' }}>Category:</span>
                      <span style={{ color: 'var(--neutral-900)' }}>{material.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--neutral-600)' }}>Author:</span>
                      <span style={{ color: 'var(--neutral-900)' }}>{material.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--neutral-600)' }}>Created:</span>
                      <span style={{ color: 'var(--neutral-900)' }}>{formatDate(material.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--neutral-600)' }}>Updated:</span>
                      <span style={{ color: 'var(--neutral-900)' }}>{formatDate(material.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                {material.product && (
                  <div>
                    <h3 className="heading-4 mb-3">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--neutral-600)' }}>Product:</span>
                        <span style={{ color: 'var(--neutral-900)' }}>{material.product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--neutral-600)' }}>Category:</span>
                        <span style={{ color: 'var(--neutral-900)' }}>{material.product.category}</span>
                      </div>
                      {material.product.price && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--neutral-600)' }}>Price:</span>
                          <span style={{ color: 'var(--neutral-900)' }}>${material.product.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              
              {material.tags && material.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
                  <h3 className="heading-4 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: 'var(--primary-teal-pale)', 
                          color: 'var(--primary-teal-dark)' 
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}