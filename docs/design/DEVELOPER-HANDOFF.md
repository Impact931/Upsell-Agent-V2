# Developer Handoff Documentation
## Upsell Agent - Complete Implementation Guide

---

## Handoff Overview

This document provides everything the development team needs to implement the Upsell Agent design system. All specifications have been created with Next.js/TypeScript implementation in mind and include production-ready code examples.

### What's Included
- Complete design system specifications
- Component implementations with TypeScript types
- Responsive breakpoint definitions
- Accessibility requirements and testing guidelines
- Asset specifications and optimization requirements
- Performance benchmarks and testing criteria

---

## File Structure & Organization

### Recommended Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── forms/           # Form-specific components
│   ├── navigation/      # Navigation components
│   ├── feedback/        # Loading, error, and status components
│   └── layout/          # Layout and container components
├── styles/              # Global styles and design tokens
│   ├── globals.css      # Global styles and CSS reset
│   ├── tokens.css       # Design token definitions
│   └── components/      # Component-specific styles
├── types/               # TypeScript type definitions
│   ├── design-system.ts # Design system type definitions
│   └── components.ts    # Component prop types
└── utils/               # Utility functions
    ├── cn.ts            # Class name utility (clsx + tailwind-merge)
    └── accessibility.ts # Accessibility helper functions
```

---

## Design Token Implementation

### CSS Custom Properties (tokens.css)
```css
:root {
  /* Colors */
  --primary-teal: #00796B;
  --primary-teal-dark: #004D40;
  --primary-teal-light: #4DB6AC;
  --primary-teal-pale: #E0F2F1;
  
  --secondary-sage: #689F38;
  --secondary-sage-dark: #33691E;
  --secondary-sage-light: #8BC34A;
  --secondary-sage-pale: #F1F8E9;
  
  --neutral-900: #212121;
  --neutral-800: #424242;
  --neutral-600: #757575;
  --neutral-400: #BDBDBD;
  --neutral-300: #E0E0E0;
  --neutral-200: #EEEEEE;
  --neutral-100: #F5F5F5;
  --neutral-50: #FAFAFA;
  --white: #FFFFFF;
  
  --success: #2E7D32;
  --success-light: #C8E6C9;
  --warning: #F57C00;
  --warning-light: #FFE0B2;
  --error: #D32F2F;
  --error-light: #FFCDD2;
  --info: #1976D2;
  --info-light: #BBDEFB;
  
  /* Typography */
  --font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-monospace: "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Spacing */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-base: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Breakpoints (for reference, use in JS) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Responsive typography scaling */
@media (min-width: 768px) {
  :root {
    --text-xl: 1.375rem;   /* 22px */
    --text-2xl: 1.625rem;  /* 26px */
    --text-3xl: 2rem;      /* 32px */
    --text-4xl: 2.5rem;    /* 40px */
  }
}

@media (min-width: 1024px) {
  :root {
    --text-2xl: 1.75rem;   /* 28px */
    --text-3xl: 2.25rem;   /* 36px */
    --text-4xl: 3rem;      /* 48px */
    --text-5xl: 3.75rem;   /* 60px */
  }
}
```

### TypeScript Design System Types
```typescript
// types/design-system.ts

export type ColorToken = 
  | 'primary-teal' | 'primary-teal-dark' | 'primary-teal-light' | 'primary-teal-pale'
  | 'secondary-sage' | 'secondary-sage-dark' | 'secondary-sage-light' | 'secondary-sage-pale'
  | 'neutral-900' | 'neutral-800' | 'neutral-600' | 'neutral-400' | 'neutral-300' 
  | 'neutral-200' | 'neutral-100' | 'neutral-50' | 'white'
  | 'success' | 'success-light' | 'warning' | 'warning-light' 
  | 'error' | 'error-light' | 'info' | 'info-light';

export type SpaceToken = 
  | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'space-5' | 'space-6' 
  | 'space-8' | 'space-10' | 'space-12' | 'space-16' | 'space-20';

export type TextSizeToken = 
  | 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' 
  | 'text-2xl' | 'text-3xl' | 'text-4xl';

export type RadiusToken = 
  | 'radius-sm' | 'radius-base' | 'radius-lg' | 'radius-xl' | 'radius-full';

export type ShadowToken = 
  | 'shadow-sm' | 'shadow-base' | 'shadow-md' | 'shadow-lg' | 'shadow-xl';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

export interface DesignTokens {
  colors: Record<ColorToken, string>;
  spacing: Record<SpaceToken, string>;
  typography: Record<TextSizeToken, string>;
  borderRadius: Record<RadiusToken, string>;
  boxShadow: Record<ShadowToken, string>;
  breakpoints: Record<Breakpoint, string>;
}
```

---

## Component Implementation Examples

### Button Component
```typescript
// components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-content gap-2 min-h-[44px] px-5 py-3 rounded-lg text-base font-medium font-sans cursor-pointer transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-teal text-white hover:bg-primary-teal-dark hover:-translate-y-0.5 hover:shadow-md focus:ring-primary-teal active:translate-y-0 active:shadow-sm',
        secondary: 'bg-white text-primary-teal border-2 border-primary-teal hover:bg-primary-teal-pale hover:border-primary-teal-dark focus:ring-primary-teal',
        outline: 'bg-transparent text-neutral-800 border-2 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 focus:ring-neutral-400',
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:ring-neutral-400',
        destructive: 'bg-error text-white hover:bg-error-dark focus:ring-error',
      },
      size: {
        sm: 'min-h-[36px] px-3 py-2 text-sm',
        md: 'min-h-[44px] px-5 py-3 text-base',
        lg: 'min-h-[52px] px-6 py-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Input Component
```typescript
// components/ui/Input.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  'w-full min-h-[44px] px-4 py-3 text-base font-sans bg-white border-2 border-neutral-300 rounded-lg transition-colors focus:outline-none focus:border-primary-teal focus:ring-3 focus:ring-primary-teal-pale disabled:bg-neutral-100 disabled:text-neutral-600 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-error bg-error-light focus:border-error focus:ring-error/10',
      },
      size: {
        sm: 'min-h-[36px] px-3 py-2 text-sm',
        md: 'min-h-[44px] px-4 py-3 text-base',
        lg: 'min-h-[52px] px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-neutral-800 mb-2"
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant: error ? 'error' : variant, size, className }))}
          aria-describedby={cn(helperTextId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {helperText && !error && (
          <p id={helperTextId} className="mt-2 text-xs text-neutral-600">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-2 text-xs text-error flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
```

### Card Component
```typescript
// components/ui/Card.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  'bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md hover:-translate-y-1',
        static: '',
        interactive: 'cursor-pointer hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-offset-2',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900', className)}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 leading-relaxed', className)}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0 border-t border-neutral-200 bg-neutral-50', className)}
    {...props}
  />
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

---

## Responsive Implementation

### Breakpoint Configuration
```typescript
// utils/breakpoints.ts
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for responsive behavior
import { useState, useEffect } from 'react';

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${breakpoints[breakpoint]})`;
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, breakpoint]);

  return matches;
}

// Responsive component helper
export function useResponsive() {
  const isSm = useBreakpoint('sm');
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    breakpoints: { isSm, isMd, isLg, isXl },
  };
}
```

### Container Component
```typescript
// components/layout/Container.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const Container: React.FC<ContainerProps> = ({ 
  className, 
  maxWidth = 'lg',
  padding = true,
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        {
          'px-4 sm:px-6 lg:px-8': padding,
          'max-w-screen-sm': maxWidth === 'sm',
          'max-w-screen-md': maxWidth === 'md',
          'max-w-screen-lg': maxWidth === 'lg',
          'max-w-screen-xl': maxWidth === 'xl',
          'max-w-full': maxWidth === 'full',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Container };
```

---

## Accessibility Implementation

### Focus Management Utilities
```typescript
// utils/accessibility.ts
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  firstElement.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Screen Reader Only Utility
```css
/* Add to globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Skip Link Component
```typescript
// components/accessibility/SkipLink.tsx
import React from 'react';

const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-teal focus:text-white focus:rounded-md focus:text-sm focus:font-medium focus:no-underline"
    >
      Skip to main content
    </a>
  );
};

export { SkipLink };
```

---

## Asset Specifications

### Image Requirements
```typescript
// types/assets.ts
export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export interface ResponsiveImageAsset extends ImageAsset {
  srcSet: {
    '1x': string;
    '2x': string;
    '3x'?: string;
  };
  breakpoints?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}
```

### Icon System
```typescript
// components/ui/Icon.tsx
import React from 'react';
import { cn } from '@/utils/cn';

// Icon name type based on your icon library
export type IconName = 
  | 'home' | 'folder' | 'users' | 'settings' | 'search' | 'bell' | 'x'
  | 'check' | 'alert-triangle' | 'alert-circle' | 'upload' | 'download'
  | 'edit' | 'trash' | 'star' | 'heart' | 'eye' | 'refresh' | 'plus'
  | 'minus' | 'chevron-down' | 'chevron-up' | 'chevron-left' | 'chevron-right'
  | 'arrow-left' | 'arrow-right' | 'external-link' | 'copy' | 'share';

interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const Icon: React.FC<IconProps> = ({ name, size = 'md', className, ...props }) => {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <use href={`#${name}-icon`} />
    </svg>
  );
};

export { Icon };
```

### Logo Component
```typescript
// components/ui/Logo.tsx
import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'dark';
  className?: string;
}

const logoSizes = {
  sm: { width: 120, height: 32 },
  md: { width: 160, height: 42 },
  lg: { width: 200, height: 53 },
};

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className 
}) => {
  const { width, height } = logoSizes[size];
  const logoSrc = `/logo-${variant}.svg`;

  return (
    <Image
      src={logoSrc}
      alt="Upsell Agent"
      width={width}
      height={height}
      className={cn('h-auto', className)}
      priority
    />
  );
};

export { Logo };
```

---

## Performance Requirements

### Core Web Vitals Targets
```typescript
// Performance benchmarks to maintain
export const performanceTargets = {
  // Largest Contentful Paint
  LCP: '2.5s', // Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s
  
  // First Input Delay
  FID: '100ms', // Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms
  
  // Cumulative Layout Shift
  CLS: '0.1', // Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25
  
  // Time to Interactive
  TTI: '3.8s', // Target for mobile 3G
  
  // First Contentful Paint
  FCP: '1.8s', // Good: <1.8s, Needs Improvement: 1.8-3s, Poor: >3s
};

// Bundle size targets
export const bundleTargets = {
  // JavaScript bundle sizes
  initialJS: '200kb', // Gzipped
  totalJS: '500kb',   // Gzipped, including all code
  
  // CSS bundle sizes
  criticalCSS: '50kb',  // Above-the-fold styles
  totalCSS: '100kb',    // All styles
  
  // Image optimization
  heroImage: '150kb',   // Hero/banner images
  thumbnails: '50kb',   // Card/preview images
  icons: '10kb',        // Icon sprite
};
```

### Image Optimization
```typescript
// next.config.js configuration for images
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
};

// Image component usage example
import Image from 'next/image';

const OptimizedImage: React.FC<{src: string, alt: string}> = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={400}
    height={300}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="rounded-lg"
    loading="lazy"
  />
);
```

### Code Splitting Examples
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Large file upload component
const FileUpload = dynamic(() => import('./FileUpload'), {
  loading: () => <FileUploadSkeleton />,
  ssr: false, // Client-side only if needed
});

// Chart/analytics components
const AnalyticsChart = dynamic(() => import('./AnalyticsChart'), {
  loading: () => <div className="h-64 bg-neutral-100 rounded-lg animate-pulse" />,
});

// Route-based code splitting is handled automatically by Next.js
// But you can use dynamic imports for component-level splitting
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <AdminPanelSkeleton />,
});
```

---

## Testing Requirements

### Accessibility Testing Checklist
```typescript
// __tests__/accessibility.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have correct ARIA attributes when loading', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const button = getByRole('button');
    
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('disabled');
  });

  test('should be keyboard navigable', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);
    const button = getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
  });
});
```

### Visual Regression Testing
```typescript
// Use Chromatic or similar for visual regression testing
// .storybook/main.js
module.exports = {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y', // Accessibility testing addon
  ],
};

// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Generate Materials',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Processing...',
  },
};
```

### Device Testing Matrix
```typescript
// Device testing requirements
export const testDevices = [
  // Mobile devices
  { name: 'iPhone SE', viewport: '375x667', userAgent: 'iPhone' },
  { name: 'iPhone 12', viewport: '390x844', userAgent: 'iPhone' },
  { name: 'Samsung Galaxy S21', viewport: '360x800', userAgent: 'Android' },
  
  // Tablets
  { name: 'iPad', viewport: '768x1024', userAgent: 'iPad' },
  { name: 'iPad Pro', viewport: '1024x1366', userAgent: 'iPad' },
  
  // Desktop
  { name: 'Desktop Small', viewport: '1024x768', userAgent: 'Desktop' },
  { name: 'Desktop Large', viewport: '1920x1080', userAgent: 'Desktop' },
];

// Playwright configuration for cross-device testing
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};

export default config;
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Priority: Critical Path Components**
- [ ] Design system setup (tokens, utilities)
- [ ] Core UI components (Button, Input, Card)
- [ ] Layout components (Container, Grid)
- [ ] Typography system implementation
- [ ] Basic responsive behavior

### Phase 2: Core Features (Week 2)
**Priority: User-Facing Functionality**
- [ ] Navigation components (Header, Sidebar, Bottom nav)
- [ ] Form components and validation
- [ ] File upload component with progress
- [ ] Loading and error states
- [ ] Modal and overlay components

### Phase 3: Enhancement (Week 3)
**Priority: Polish and Optimization**
- [ ] Advanced interactions and animations
- [ ] Comprehensive accessibility testing
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation completion

---

## Quality Assurance Checklist

### Design Fidelity
- [ ] All colors match design tokens exactly
- [ ] Typography scales correctly across breakpoints
- [ ] Spacing follows the established rhythm
- [ ] Component states match design specifications
- [ ] Hover and focus states implemented correctly

### Accessibility Compliance
- [ ] WCAG 2.1 AA compliance verified with automated testing
- [ ] Manual keyboard navigation testing completed
- [ ] Screen reader testing with NVDA/JAWS/VoiceOver
- [ ] Color contrast ratios verified
- [ ] Focus management working correctly

### Performance Standards
- [ ] Core Web Vitals within target ranges
- [ ] Bundle sizes within specified limits
- [ ] Images optimized and responsive
- [ ] Code splitting implemented effectively
- [ ] Performance budgets established and monitored

### Cross-Browser/Device Testing
- [ ] Tested on Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Mobile testing on iOS Safari and Chrome Android
- [ ] Tablet testing on iPad and Android tablets
- [ ] Touch targets meet minimum size requirements
- [ ] Responsive design works across all breakpoints

This comprehensive developer handoff documentation provides everything needed for successful implementation of the Upsell Agent design system, ensuring consistent, accessible, and performant user experiences across all devices and use cases.