# Upsell Agent Design System
## Version 1.0 - Mobile-First Professional Design

---

## Overview

The Upsell Agent design system prioritizes mobile-first accessibility, professional appearance, and intuitive user experience for spa/salon staff and managers. This system ensures consistent implementation across all interfaces while meeting WCAG 2.1 AA compliance standards.

### Design Principles

1. **Mobile-First**: Optimized for touch interactions and small screens
2. **Professional**: Clean, trustworthy appearance suitable for business environments
3. **Accessible**: WCAG 2.1 AA compliant with inclusive design practices
4. **Efficient**: Support for &lt;5 minute workflows and quick task completion
5. **Wellness-Focused**: Visual language appropriate for spa/salon industry

---

## Color Palette

### Primary Colors
```css
--primary-teal: #00796B        /* Primary brand color - professional teal */
--primary-teal-dark: #004D40   /* Darker variant for hover states */
--primary-teal-light: #4DB6AC  /* Lighter variant for backgrounds */
--primary-teal-pale: #E0F2F1   /* Very light for subtle backgrounds */
```

### Secondary Colors
```css
--secondary-sage: #689F38      /* Complementary wellness green */
--secondary-sage-dark: #33691E /* Darker variant */
--secondary-sage-light: #8BC34A /* Lighter variant */
--secondary-sage-pale: #F1F8E9  /* Very light background */
```

### Neutral Colors
```css
--neutral-900: #212121         /* Primary text */
--neutral-800: #424242         /* Secondary text */
--neutral-600: #757575         /* Tertiary text */
--neutral-400: #BDBDBD         /* Disabled text/borders */
--neutral-300: #E0E0E0         /* Light borders */
--neutral-200: #EEEEEE         /* Light backgrounds */
--neutral-100: #F5F5F5         /* Subtle backgrounds */
--neutral-50: #FAFAFA          /* Page backgrounds */
--white: #FFFFFF               /* Pure white */
```

### Status Colors
```css
--success: #2E7D32            /* Success states */
--success-light: #C8E6C9      /* Success backgrounds */
--warning: #F57C00            /* Warning states */
--warning-light: #FFE0B2      /* Warning backgrounds */
--error: #D32F2F              /* Error states */
--error-light: #FFCDD2        /* Error backgrounds */
--info: #1976D2               /* Info states */
--info-light: #BBDEFB         /* Info backgrounds */
```

### Accessibility Notes
- All color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- Colors are tested for color-blind users
- Status colors include icons to avoid color-only communication

---

## Typography

### Font Stack
```css
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-monospace: "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px - minimum body text */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Typography Hierarchy
```css
/* Headings */
.heading-1 { font-size: var(--text-4xl); font-weight: 700; line-height: 1.2; }
.heading-2 { font-size: var(--text-3xl); font-weight: 600; line-height: 1.3; }
.heading-3 { font-size: var(--text-2xl); font-weight: 600; line-height: 1.4; }
.heading-4 { font-size: var(--text-xl); font-weight: 500; line-height: 1.4; }

/* Body Text */
.body-large { font-size: var(--text-lg); line-height: 1.6; }
.body-base { font-size: var(--text-base); line-height: 1.6; }
.body-small { font-size: var(--text-sm); line-height: 1.5; }

/* Specialized */
.caption { font-size: var(--text-xs); line-height: 1.4; color: var(--neutral-600); }
.label { font-size: var(--text-sm); font-weight: 500; line-height: 1.4; }
.button-text { font-size: var(--text-base); font-weight: 500; }
```

---

## Spacing System

### Scale
```css
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
```

### Usage Guidelines
- **Touch Targets**: Minimum 44px (var(--space-12)) for mobile
- **Content Padding**: var(--space-4) for mobile, var(--space-6) for desktop
- **Section Spacing**: var(--space-8) to var(--space-12)
- **Component Margins**: var(--space-4) to var(--space-6)

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - small elements */
--radius-base: 0.5rem;  /* 8px - standard */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - modals */
--radius-full: 9999px;  /* Fully rounded */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

---

## Breakpoints

### Responsive Design Approach
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

### Usage Patterns
```css
/* Mobile (Default): 320px - 639px */
/* Tablet: 640px - 1023px */  
/* Desktop: 1024px+ */
```

---

## Animation & Transitions

### Duration
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
```css
.fade-in { opacity: 0; animation: fadeIn var(--duration-base) var(--ease-out) forwards; }
.slide-up { transform: translateY(10px); opacity: 0; animation: slideUp var(--duration-base) var(--ease-out) forwards; }
.scale-in { transform: scale(0.95); opacity: 0; animation: scaleIn var(--duration-base) var(--ease-out) forwards; }
```

---

## Accessibility Guidelines

### Focus States
```css
.focus-outline {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
  border-radius: var(--radius-base);
}
```

### Screen Reader Support
- All interactive elements have appropriate ARIA labels
- Form inputs have associated labels
- Status messages use live regions
- Navigation landmarks are properly defined

### Color Accessibility
- Never rely on color alone to communicate information
- All interactive states include visual indicators beyond color
- Text meets WCAG AA contrast requirements
- Focus indicators are clearly visible

### Touch Accessibility
- Minimum touch target size: 44px × 44px
- Adequate spacing between interactive elements
- Swipe gestures include alternative navigation methods
- Touch feedback for all interactive elements

---

## Brand Guidelines

### Logo Usage
- Primary logo: Teal on white or light backgrounds
- Secondary logo: White on teal backgrounds  
- Minimum size: 120px width for digital use
- Clear space: Equal to the height of the logo mark

### Voice & Tone
- **Professional**: Clear, confident, knowledgeable
- **Supportive**: Encouraging, helpful, non-intimidating
- **Efficient**: Concise, action-oriented, time-respectful
- **Inclusive**: Accessible language, diverse representation

### Photography Style
- Clean, well-lit spa/salon environments
- Professional staff interactions
- Product shots with neutral backgrounds
- Diverse representation of staff and clients

---

## Implementation Notes

### CSS Architecture
- Use CSS custom properties for theming
- BEM methodology for class naming
- Component-scoped styles with CSS modules
- Utility classes for spacing and layout

### Performance Considerations
- Optimize images for different screen densities
- Use system fonts as fallbacks
- Minimize animation on slower devices
- Lazy load non-critical design assets

### Browser Support
- Modern browsers (last 2 versions)
- iOS Safari 13+
- Chrome 80+
- Firefox 75+
- Edge 80+

---

## Component Reference

This design system includes detailed specifications for:
- Buttons (Primary, Secondary, Outline, Icon)
- Form Elements (Input, Textarea, Select, Checkbox, Radio)
- Navigation (Header, Sidebar, Breadcrumbs, Pagination)
- Content Display (Cards, Tables, Lists, Modals)
- Feedback (Alerts, Toasts, Loading States, Progress)
- File Upload (Drag & Drop, Progress Indicators)

See individual component documentation for detailed specifications and usage guidelines.