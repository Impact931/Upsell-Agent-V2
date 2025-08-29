'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  upload: 'Upload Materials',
  materials: 'Training Materials',
  staff: 'Staff Access',
  'staff-management': 'Staff Management',
  settings: 'Settings',
  analytics: 'Analytics',
  compliance: 'Compliance Guidelines',
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for root or single-level pages
  }

  return (
    <nav 
      className={clsx('flex items-center space-x-1 text-sm mb-4', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="w-4 h-4 mx-1" 
                  style={{ color: 'var(--neutral-400)' }}
                  aria-hidden="true"
                />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--primary-teal)' }}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              ) : (
                <span
                  className="flex items-center"
                  style={{ 
                    color: isLast ? 'var(--neutral-900)' : 'var(--neutral-600)',
                    fontWeight: isLast ? '500' : 'normal'
                  }}
                  {...(isLast && { 'aria-current': 'page' })}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Don't link the last segment (current page)
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

// Component for page headers with breadcrumbs
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  breadcrumbs, 
  actions, 
  className 
}: PageHeaderProps) {
  return (
    <div className={clsx('mb-6 md:mb-8', className)}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-1 mb-2">{title}</h1>
          {description && (
            <p className="body-large" style={{ color: 'var(--neutral-600)' }}>
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}