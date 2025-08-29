# Responsive Design Specifications
## Upsell Agent - Cross-Device Experience Guidelines

---

## Responsive Design Philosophy

### Mobile-First Approach
The Upsell Agent platform prioritizes mobile experience, as 80% of staff interactions will occur on smartphones during work hours. We progressively enhance the experience for larger screens while maintaining core functionality at all breakpoints.

### Progressive Enhancement Strategy
1. **Core Functionality**: Essential features work on all devices without JavaScript
2. **Enhanced Interactions**: Touch gestures, animations, and advanced interactions on capable devices
3. **Advanced Features**: Desktop-specific functionality like keyboard shortcuts and bulk operations
4. **Performance Optimization**: Adaptive loading based on device capabilities and network conditions

---

## Breakpoint System

### Standard Breakpoints
```css
/* Mobile First Media Queries */
:root {
  --breakpoint-xs: 320px;   /* Small phones */
  --breakpoint-sm: 480px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small desktops */
  --breakpoint-xl: 1280px;  /* Large desktops */
  --breakpoint-xxl: 1536px; /* Extra large screens */
}

/* Usage in CSS */
@media (min-width: 768px) { /* Tablet and up */ }
@media (min-width: 1024px) { /* Desktop and up */ }
```

### Container System
```css
.container {
  width: 100%;
  padding: 0 var(--space-4); /* 16px */
  margin: 0 auto;
}

@media (min-width: 480px) {
  .container { padding: 0 var(--space-6); } /* 24px */
}

@media (min-width: 768px) {
  .container { 
    padding: 0 var(--space-8); /* 32px */
    max-width: 1200px;
  }
}
```

---

## Device-Specific Layouts

### Mobile Layout (320px - 767px)

#### Navigation Pattern
```
┌─────────────────────────────────────┐
│ [☰] Brand Logo         [🔔] [👤]   │ ← Header (Fixed, 56px)
├─────────────────────────────────────┤
│                                     │
│         Main Content                │ ← Scrollable content
│         (Full width)                │   area with padding
│                                     │
│                                     │
├─────────────────────────────────────┤
│    [🏠]  [📁]  [👥]  [⚙️]        │ ← Bottom nav (Fixed, 64px)
└─────────────────────────────────────┘

Layout Specifications:
- Header: Fixed position, z-index: 1000
- Content: padding-top: 72px (header + spacing)
- Content: padding-bottom: 80px (bottom nav + spacing)  
- Bottom nav: Fixed position, z-index: 1000
- Safe area: Account for iPhone notch/home indicator
```

#### Content Layout Patterns
```css
/* Single Column Layout */
.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

/* Card Stack */
.card-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Action Buttons */
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}

.mobile-actions .button {
  width: 100%;
  min-height: 44px;
}
```

### Tablet Layout (768px - 1023px)

#### Navigation Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Brand Logo    [Search...]    [🔔] [👤] [⚙️]          │ ← Top nav (64px)
├─────────────────────────────────────────────────────────────┤
│ [🏠Dashboard] [📁Materials] [👥Staff] [⚙️Settings]        │ ← Secondary nav
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                 Main Content Area                           │ ← Two column possible
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Layout Specifications:
- Horizontal navigation with dropdowns
- Two-column content layouts where appropriate
- Sidebar panels for auxiliary information
- Larger touch targets (48px minimum)
```

#### Content Layout Patterns
```css
/* Two Column Layout */
.tablet-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

/* Form Layout */
.tablet-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4) var(--space-6);
}
```

### Desktop Layout (1024px+)

#### Navigation Pattern
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Brand] Upsell Agent      [Search...]         [🔔] [👤] [⚙️]      │ ← Header
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────────────────────────────────────────────────────────┐ │
│ │[🏠] │ │                                                         │ │
│ │Dash │ │                                                         │ │
│ │     │ │                Main Content                             │ │
│ │[📁] │ │                                                         │ │
│ │Mat  │ │                                                         │ │
│ │     │ │                                                         │ │
│ │[👥] │ │                                                         │ │
│ │Staff│ │                                                         │ │
│ │     │ │                                                         │ │
│ │[⚙️] │ │                                                         │ │
│ │Set  │ │                                                         │ │
│ └─────┘ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
  ↑ Sidebar (240px)              ↑ Main content area

Layout Specifications:
- Persistent sidebar navigation
- Multi-column content layouts
- Hover states and keyboard navigation
- Advanced features like bulk operations
```

#### Content Layout Patterns
```css
/* Sidebar Layout */
.desktop-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

/* Main Content Grid */
.desktop-content {
  display: grid;
  grid-template-columns: 1fr 300px; /* Main + sidebar */
  gap: var(--space-8);
  padding: var(--space-8);
}

/* Three Column Cards */
.desktop-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}
```

---

## Component Responsiveness

### Button System
```css
/* Mobile: Full width buttons */
@media (max-width: 767px) {
  .button {
    width: 100%;
    min-height: 44px;
    font-size: var(--text-base);
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
}

/* Tablet: Inline buttons */
@media (min-width: 768px) {
  .button {
    width: auto;
    min-width: 120px;
    min-height: 48px;
  }
  
  .button-group {
    display: flex;
    flex-direction: row;
    gap: var(--space-3);
  }
}

/* Desktop: Enhanced buttons */
@media (min-width: 1024px) {
  .button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .button:focus {
    outline: 2px solid var(--primary-teal);
    outline-offset: 2px;
  }
}
```

### Form Elements
```css
/* Mobile: Stacked form layout */
@media (max-width: 767px) {
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  
  .form-input {
    width: 100%;
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Tablet: Two-column forms */
@media (min-width: 768px) {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
  
  .form-input {
    min-height: 48px;
  }
}

/* Desktop: Enhanced forms */
@media (min-width: 1024px) {
  .form-group {
    display: grid;
    grid-template-columns: 200px 1fr;
    align-items: center;
    gap: var(--space-4);
  }
  
  .form-label {
    text-align: right;
    font-weight: 500;
  }
}
```

### Card Components
```css
/* Mobile: Full width cards */
@media (max-width: 767px) {
  .card {
    width: 100%;
    margin-bottom: var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  .card-content {
    padding: var(--space-4);
  }
}

/* Tablet: Grid layout */
@media (min-width: 768px) {
  .card-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
  
  .card-content {
    padding: var(--space-5);
  }
}

/* Desktop: Three column + hover */
@media (min-width: 1024px) {
  .card-container {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    transition: all var(--duration-base) var(--ease-out);
  }
}
```

---

## Typography Scaling

### Responsive Font Sizes
```css
/* Base typography (mobile) */
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
}

/* Tablet scaling */
@media (min-width: 768px) {
  :root {
    --text-xl: 1.375rem;   /* 22px */
    --text-2xl: 1.625rem;  /* 26px */
    --text-3xl: 2rem;      /* 32px */
    --text-4xl: 2.5rem;    /* 40px */
  }
}

/* Desktop scaling */
@media (min-width: 1024px) {
  :root {
    --text-2xl: 1.75rem;   /* 28px */
    --text-3xl: 2.25rem;   /* 36px */
    --text-4xl: 3rem;      /* 48px */
    --text-5xl: 3.75rem;   /* 60px */
  }
}
```

### Reading Experience
```css
/* Mobile: Optimized for scanning */
@media (max-width: 767px) {
  .content-text {
    font-size: var(--text-base);
    line-height: 1.6;
    max-width: none;
  }
  
  .heading {
    line-height: 1.2;
    margin-bottom: var(--space-3);
  }
}

/* Desktop: Optimized for reading */
@media (min-width: 1024px) {
  .content-text {
    font-size: var(--text-lg);
    line-height: 1.7;
    max-width: 65ch; /* Optimal reading width */
  }
  
  .heading {
    line-height: 1.1;
    margin-bottom: var(--space-4);
  }
}
```

---

## Image and Media Handling

### Responsive Images
```css
/* Base responsive behavior */
.responsive-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-base);
}

/* Aspect ratio containers */
.image-container-16-9 {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container-1-1 {
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .responsive-image {
    image-rendering: -webkit-optimize-contrast;
  }
}
```

### Loading States
```css
/* Mobile: Simple loading */
@media (max-width: 767px) {
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
}

/* Desktop: Enhanced loading */
@media (min-width: 1024px) {
  .loading-skeleton {
    background: linear-gradient(90deg, #f5f5f5 25%, #eeeeee 50%, #f5f5f5 75%);
    background-size: 200% 100%;
    animation: loading 1s infinite;
  }
}
```

---

## Touch and Interaction Design

### Touch Targets
```css
/* Minimum touch target sizes */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tablet: Slightly larger */
@media (min-width: 768px) {
  .touch-target {
    min-width: 48px;
    min-height: 48px;
  }
}

/* Desktop: Hover states */
@media (min-width: 1024px) and (hover: hover) {
  .touch-target:hover {
    background-color: var(--neutral-100);
    transform: scale(1.05);
  }
}
```

### Gesture Support
```css
/* Swipe gestures on mobile */
@media (max-width: 767px) {
  .swipeable {
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
  }
}

/* Prevent gestures on desktop */
@media (min-width: 1024px) {
  .swipeable {
    touch-action: auto;
  }
}
```

---

## Performance Considerations

### Critical CSS
```css
/* Above-the-fold styles for mobile */
@media (max-width: 767px) {
  /* Header, navigation, and initial content */
  .header, .nav, .hero {
    /* Inline critical styles */
  }
}
```

### Lazy Loading
```css
/* Placeholder for non-critical content */
.lazy-load {
  opacity: 0;
  transform: translateY(20px);
  transition: all var(--duration-base) var(--ease-out);
}

.lazy-load.loaded {
  opacity: 1;
  transform: translateY(0);
}
```

### Reduced Motion Support
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Device-Specific Optimizations

### iOS Safari
```css
/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px; /* Minimum to prevent zoom */
}

/* Safe area support */
.page-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Scroll behavior */
.scrollable {
  -webkit-overflow-scrolling: touch;
}
```

### Android Chrome
```css
/* Address bar behavior */
.viewport-height {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid var(--neutral-900);
  }
}
```

### Desktop Browsers
```css
/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--neutral-100);
}

::-webkit-scrollbar-thumb {
  background: var(--neutral-400);
  border-radius: 4px;
}

/* Focus management */
.focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}
```

---

## Testing Strategy

### Device Testing Matrix
| Device Category | Screen Sizes | Orientation | Features to Test |
|----------------|-------------|-------------|------------------|
| Mobile Phones  | 320px - 480px | Portrait/Landscape | Touch, gestures, readability |
| Large Phones   | 480px - 640px | Portrait/Landscape | One-handed use, thumb reach |
| Tablets        | 768px - 1024px | Portrait/Landscape | Two-column layouts, forms |
| Desktop        | 1024px+ | Landscape | Hover states, keyboard nav |

### Responsive Testing Checklist
- [ ] All text remains readable at all breakpoints
- [ ] Touch targets meet minimum size requirements
- [ ] Images scale appropriately without distortion
- [ ] Navigation remains accessible on all devices
- [ ] Forms are usable on touch devices
- [ ] Performance remains acceptable on slower devices
- [ ] Content hierarchy is clear at all screen sizes
- [ ] No horizontal scrolling on intended layouts

This responsive specification ensures consistent, accessible, and performant experiences across all devices while optimizing for the mobile-first usage patterns of spa and salon staff.