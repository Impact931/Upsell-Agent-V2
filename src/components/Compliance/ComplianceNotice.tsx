'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Shield, Eye, EyeOff, X } from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { clsx } from 'clsx';

interface ComplianceNoticeProps {
  type?: 'wellness' | 'spa' | 'salon' | 'general';
  variant?: 'banner' | 'modal' | 'inline';
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const COMPLIANCE_CONTENT = {
  wellness: {
    title: 'Wellness Industry Guidelines',
    icon: Shield,
    content: `
      This training material is designed for informational and educational purposes only. 
      When discussing wellness services and products with clients:
      
      • Do not make medical claims or diagnose conditions
      • Emphasize relaxation and wellness benefits, not medical treatment
      • Recommend clients consult healthcare providers for medical concerns
      • Follow all local regulations regarding wellness service descriptions
      • Maintain professional boundaries in all client interactions
    `,
    color: 'info',
  },
  spa: {
    title: 'Spa Service Compliance',
    icon: Info,
    content: `
      Spa services should be presented as relaxation and wellness experiences:
      
      • Focus on stress relief, relaxation, and pampering benefits
      • Avoid medical or therapeutic claims unless licensed
      • Clearly communicate service limitations and expectations
      • Respect client privacy and personal boundaries
      • Ensure proper hygiene and safety protocols are followed
    `,
    color: 'info',
  },
  salon: {
    title: 'Salon Service Standards',
    icon: Info,
    content: `
      Professional salon services require adherence to industry standards:
      
      • Use only approved products and techniques
      • Maintain current licensing and certifications
      • Follow proper sanitation and safety procedures
      • Provide clear service descriptions and pricing
      • Respect client preferences and comfort levels
    `,
    color: 'info',
  },
  general: {
    title: 'Professional Standards',
    icon: AlertTriangle,
    content: `
      All training materials should be used in accordance with professional standards:
      
      • Maintain ethical business practices at all times
      • Respect client confidentiality and privacy
      • Provide accurate service information and pricing
      • Follow all applicable local and federal regulations
      • Prioritize client safety and satisfaction
    `,
    color: 'warning',
  },
} as const;

export function ComplianceNotice({ 
  type = 'general', 
  variant = 'inline',
  dismissible = true,
  className,
  onDismiss 
}: ComplianceNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const compliance = COMPLIANCE_CONTENT[type];
  const Icon = compliance.icon;

  // Check if user has previously dismissed this type of notice
  useEffect(() => {
    if (dismissible && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`compliance-dismissed-${type}`);
      if (dismissed) {
        setIsVisible(false);
      }
    }
  }, [type, dismissible]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    if (dismissible && typeof window !== 'undefined') {
      localStorage.setItem(`compliance-dismissed-${type}`, 'true');
    }
    
    onDismiss?.();
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) {
    return null;
  }

  const renderContent = () => (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-semibold">{compliance.title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            size="sm"
            onClick={handleToggleExpanded}
            aria-label={isExpanded ? 'Collapse guidelines' : 'Expand guidelines'}
          >
            {isExpanded ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          
          {dismissible && (
            <Button
              variant="icon"
              size="sm"
              onClick={handleDismiss}
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {compliance.content.trim()}
          </div>
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'banner':
      return (
        <div 
          className="w-full p-4 border-l-4"
          style={{
            backgroundColor: compliance.color === 'info' ? 'var(--info-light)' : 'var(--warning-light)',
            borderColor: compliance.color === 'info' ? 'var(--info)' : 'var(--warning)',
          }}
        >
          {renderContent()}
        </div>
      );

    case 'modal':
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {renderContent()}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleDismiss}>
                Understood
              </Button>
            </div>
          </div>
        </div>
      );

    default: // inline
      return (
        <Alert
          variant={compliance.color as 'info' | 'warning'}
          dismissible={dismissible}
          onDismiss={dismissible ? handleDismiss : undefined}
          className={className}
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex-1">
              <h4 className="font-semibold mb-2">{compliance.title}</h4>
              
              {!isExpanded && (
                <p className="text-sm mb-2">
                  Important guidelines for professional service delivery.
                </p>
              )}
              
              {isExpanded && (
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {compliance.content.trim()}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleExpanded}
                className="mt-2"
              >
                {isExpanded ? 'Show Less' : 'Read Guidelines'}
              </Button>
            </div>
          </div>
        </Alert>
      );
  }
}

// Specialized compliance notices for different contexts
export function WellnessDisclaimer({ className, ...props }: Omit<ComplianceNoticeProps, 'type'>) {
  return (
    <ComplianceNotice 
      type="wellness" 
      className={clsx('mt-6', className)}
      {...props} 
    />
  );
}

export function SpaServiceDisclaimer({ className, ...props }: Omit<ComplianceNoticeProps, 'type'>) {
  return (
    <ComplianceNotice 
      type="spa" 
      className={clsx('mt-6', className)}
      {...props} 
    />
  );
}

export function SalonServiceDisclaimer({ className, ...props }: Omit<ComplianceNoticeProps, 'type'>) {
  return (
    <ComplianceNotice 
      type="salon" 
      className={clsx('mt-6', className)}
      {...props} 
    />
  );
}

// Hook for compliance state management
export function useCompliance() {
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = new Set<string>();
      
      ['wellness', 'spa', 'salon', 'general'].forEach(type => {
        if (localStorage.getItem(`compliance-dismissed-${type}`)) {
          dismissed.add(type);
        }
      });
      
      setDismissedNotices(dismissed);
    }
  }, []);

  const isDismissed = (type: string) => dismissedNotices.has(type);
  
  const dismissNotice = (type: string) => {
    setDismissedNotices(prev => new Set([...prev, type]));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`compliance-dismissed-${type}`, 'true');
    }
  };

  const resetNotice = (type: string) => {
    setDismissedNotices(prev => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`compliance-dismissed-${type}`);
    }
  };

  return {
    isDismissed,
    dismissNotice,
    resetNotice,
    dismissedNotices: Array.from(dismissedNotices),
  };
}