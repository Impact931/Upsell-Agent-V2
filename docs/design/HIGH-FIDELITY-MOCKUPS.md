# High-Fidelity Mockups & Visual Design
## Upsell Agent - Complete Interface Specifications

---

## Manager Dashboard Mockups

### Desktop Dashboard (1280px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [≡] Upsell Agent               Search...     [🔔2] [👤Sarah] [⚙️]  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────┐ ┌─────────────────────────────────────────────────────────────┐ │
│ │[🏠] │ │ Welcome back, Sarah! 👋                                     │ │
│ │Dash │ │                                                             │ │
│ │     │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │ │
│ │[📁] │ │ │ 15       │ │ 89%      │ │ $2,347   │ │ 📈 +15%        │ │ │
│ │Mats │ │ │ Active   │ │ Weekly   │ │ Revenue  │ │ vs last month  │ │ │
│ │     │ │ │ Materials│ │ Usage    │ │ Impact   │ │                │ │ │
│ │[👥] │ │ └──────────┘ └──────────┘ └──────────┘ └─────────────────┘ │ │
│ │Staff│ │                                                             │ │
│ │     │ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │[⚙️] │ │ │ [+ Generate New Materials] [📊 View Analytics]           │ │ │
│ │Sets │ │ └─────────────────────────────────────────────────────────┘ │ │
│ │     │ │                                                             │ │
│ │[❓] │ │ Recent Training Materials                                   │ │
│ │Help │ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ └─────┘ │ │ 🧴 Hydrating Face Serum - Premium Formula              │ │ │
│         │ │    Created: 2 days ago │ 👁️ 12 views │ 📈 $340 sales    │ │ │
│         │ │ ┌───────────────┐ ┌──────────┐ ┌─────────────────────┐ │ │ │
│         │ │ │ [📝 Edit]     │ │[📤Share] │ │[📊View Analytics]   │ │ │ │
│         │ │ └───────────────┘ └──────────┘ └─────────────────────┘ │ │ │
│         │ │ ─────────────────────────────────────────────────────── │ │ │
│         │ │ 💆 Anti-Aging Treatment Package - Luxury Series       │ │ │
│         │ │    Created: 1 week ago │ 👁️ 28 views │ 📈 $890 sales   │ │ │
│         │ │ ┌───────────────┐ ┌──────────┐ ┌─────────────────────┐ │ │ │
│         │ │ │ [📝 Edit]     │ │[📤Share] │ │[📊View Analytics]   │ │ │ │
│         │ │ └───────────────┘ └──────────┘ └─────────────────────┘ │ │ │
│         │ └─────────────────────────────────────────────────────────┘ │ │
│         └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

Visual Design Notes:
- Header: White (#FFFFFF) with subtle shadow (--shadow-sm)
- Primary teal (#00796B) for brand elements and CTAs
- Sidebar: Light neutral (#F5F5F5) with active state indicator
- Cards: White with --shadow-base, --radius-lg rounded corners
- Metrics: Large numbers in --text-2xl, secondary text in --neutral-600
- Quick actions: Primary button styling with hover animations
```

### Mobile Dashboard (375px)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │[☰] Upsell Agent        [🔔2]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Hi Sarah! 👋                        │
│ Good morning                        │
│                                     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ 15 Active   │ │ 89% Staff Usage │ │
│ │ Materials   │ │ This Week       │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [+] Generate New           │ │
│ │          Materials              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Recent Materials                    │
│ ┌─────────────────────────────────┐ │
│ │🧴 Hydrating Face Serum          │ │
│ │Created 2d ago │ 👁️ 12 │ $340    │ │
│ │ ┌────────┐ ┌─────┐ ┌─────────┐  │ │
│ │ │[Edit]  │ │[⤴️] │ │[📊Stats]│  │ │
│ │ └────────┘ └─────┘ └─────────┘  │ │
│ ├─────────────────────────────────┤ │
│ │💆 Anti-Aging Package            │ │
│ │Created 1w ago │ 👁️ 28 │ $890    │ │
│ │ ┌────────┐ ┌─────┐ ┌─────────┐  │ │
│ │ │[Edit]  │ │[⤴️] │ │[📊Stats]│  │ │
│ │ └────────┘ └─────┘ └─────────┘  │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│    [🏠]  [📁]  [👥]  [⚙️]        │
└─────────────────────────────────────┘

Visual Design Notes:
- Full-width header with hamburger menu
- Large, touch-friendly buttons (min 44px height)
- Simplified metrics layout with essential information
- Card-based layout with generous white space
- Bottom navigation with clear icons and labels
- Primary green (#00796B) for active states
```

---

## File Upload Flow Mockups

### Step 1: File Selection (Mobile)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │[←] Generate Materials           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Step 1 of 4: Upload Files           │
│ ●○○○                                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │           📄                │ │ │
│ │ │                             │ │ │
│ │ │    Drag files here or       │ │ │
│ │ │      tap to browse          │ │ │
│ │ │                             │ │ │
│ │ │ Supported formats:          │ │ │
│ │ │ PDF, JPG, PNG, DOCX         │ │ │
│ │ │ Maximum size: 10MB          │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📷 Take Photo of Document       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        [Continue]               │ │
│ │      (1 file selected)          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Visual Design Notes:
- Dotted border upload area with hover/active states
- Large, clear typography for instructions
- Camera icon in secondary teal for photo option
- Progress indicator at top shows current step
- Continue button disabled until file selected
```

### Step 2: File Processing (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [←] Generate Materials            Processing Files...   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Step 2 of 4: Processing Your Files                         │
│ ○●○○                                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔄 Extracting content from your documents...           │ │
│ │                                                         │ │
│ │ ████████████████████████████████░░░░ 82%               │ │
│ │                                                         │ │
│ │ Estimated time remaining: 1 minute                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ File Processing Status:                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ product-brochure.pdf          │ Completed             │ │
│ │ 🔄 ingredient-details.jpg        │ Processing...         │ │
│ │ ⏳ benefits-comparison.png       │ Waiting...            │ │
│ │ ✅ pricing-sheet.docx            │ Completed             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ This process typically takes 2-3 minutes.              │ │
│ │ Feel free to continue with other tasks - we'll         │ │
│ │ notify you when processing is complete.                 │ │
│ │                                                         │ │
│ │ ┌─────────────────────────┐  ┌────────────────────────┐ │ │
│ │ │ [Run in Background]     │  │ [Stay on This Page]   │ │ │
│ │ └─────────────────────────┘  └────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Visual Design Notes:
- Large progress bar with smooth animation
- Status icons with color coding (green=success, blue=processing, gray=waiting)
- Gentle notification area with helpful information
- Option buttons for user control over process
- Consistent spacing and typography hierarchy
```

---

## Staff Mobile Interface Mockups

### Training Materials Library (375px)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search materials...    [⚙️]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Hi Maya! 👋                         │
│ 3 new materials this week           │
│                                     │
│ Quick Access                        │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │  ⭐ (12)    │ │  🕐 (5)         │ │
│ │ Favorites   │ │ Recent          │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ Browse by Category                  │
│ ┌─────────────────────────────────┐ │
│ │ 💆 Skincare Products      (12) │ │
│ │ Premium serums & treatments     │ │
│ ├─────────────────────────────────┤ │
│ │ 💅 Nail Care Services     (8)  │ │
│ │ Manicures, pedicures & add-ons  │ │
│ ├─────────────────────────────────┤ │
│ │ 🧴 Body Treatments       (15)  │ │
│ │ Massages, wraps & enhancements  │ │
│ ├─────────────────────────────────┤ │
│ │ 🎁 Service Packages      (5)   │ │
│ │ Bundles, memberships & specials │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│    [🏠]  [🔍]  [⭐]  [👤]        │
└─────────────────────────────────────┘

Visual Design Notes:
- Search bar at top with rounded corners and subtle shadow
- Personal greeting with contextual information
- Quick access cards with large, recognizable icons
- Category cards with icons, titles, counts, and descriptions
- Clean typography with clear information hierarchy
- Bottom navigation with active state highlighting
```

### Material Detail View (375px)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │[←] Hydrating Face Serum    [⭐] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🧴 Hydrating Face Serum             │
│ Premium Anti-Aging Formula          │
│ $89 retail │ 25% commission         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Key Benefits                    │ │
│ │ ━━━━━━━━━━━━                    │ │
│ │ • Reduces fine lines up to 40% │ │
│ │ • Improves skin texture         │ │
│ │ • Provides 24-hour hydration    │ │
│ │ • Suitable for all skin types   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💬 What to Say                  │ │
│ │ ━━━━━━━━━━━━                    │ │
│ │ "This serum is perfect for      │ │
│ │ anyone wanting to see real      │ │
│ │ results. Most clients notice    │ │
│ │ smoother skin within a week.    │ │
│ │ It works especially well after  │ │
│ │ our signature facial."          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [📖 View Full Script]           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [⭐ Save to Favorites]          │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│    [🏠]  [🔍]  [⭐]  [👤]        │
└─────────────────────────────────────┘

Visual Design Notes:
- Clear product header with pricing and commission info
- Organized content sections with visual dividers
- Practical "What to Say" section for immediate use
- Large action buttons for primary tasks
- Professional color scheme suitable for business environment
- Consistent spacing and readable typography
```

---

## Component Mockups

### Button System

```
Primary Buttons:
┌─────────────────────────┐
│    Generate Materials   │  [Background: #00796B, Text: White, Radius: 8px]
└─────────────────────────┘

┌─────────────────────────┐
│  🔄 Processing...       │  [Background: #004D40, Text: White, Disabled state]
└─────────────────────────┘

Secondary Buttons:
┌─────────────────────────┐
│      View Details       │  [Background: White, Border: #00796B, Text: #00796B]
└─────────────────────────┘

Outline Buttons:
┌─────────────────────────┐
│        Cancel           │  [Background: Transparent, Border: #BDBDBD, Text: #424242]
└─────────────────────────┘

Icon Buttons:
[📝] [🔍] [⚙️] [⭐]        [40px x 40px, Circular background on hover]
```

### Form Elements

```
Text Input:
┌─────────────────────────────────────┐
│ Product Name                        │
│ ┌─────────────────────────────────┐ │
│ │ Hydrating Face Serum            │ │ [Border: #E0E0E0, Focus: #00796B]
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Select Dropdown:
┌─────────────────────────────────────┐
│ Category                            │
│ ┌─────────────────────────────────┐ │
│ │ Skincare Products          [▼] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

File Upload Area:
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ - - - - - - - - - - - - - - - - │ │ [Dotted border: #00796B]
│ │           📄                    │ │
│ │    Drop files here or           │ │
│ │      click to browse            │ │
│ │                                 │ │
│ │ Supported: PDF, JPG, PNG, DOCX  │ │
│ │ - - - - - - - - - - - - - - - - │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Card Components

```
Material Card (Manager View):
┌─────────────────────────────────────┐
│ 🧴 Hydrating Face Serum             │ [Shadow: --shadow-base]
│ Premium Anti-Aging Formula          │ [Background: White]
│ ─────────────────────────────────── │ [Radius: --radius-lg]
│ Created: 2 days ago │ 👁️ 12 views   │
│ Revenue impact: $340                │
│                                     │
│ ┌──────────┐ ┌─────────┐ ┌────────┐ │
│ │ [📝Edit] │ │[📤Share]│ │[📊Stats]│ │
│ └──────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────┘

Category Card (Staff View):
┌─────────────────────────────────────┐
│ 💆 Skincare Products          (12)  │ [Background: --neutral-50]
│ Premium serums & treatments         │ [Border: --neutral-200]
│                                     │ [Hover: --primary-teal-pale]
│ Recently added: Vitamin C Serum     │
└─────────────────────────────────────┘
```

### Status Indicators

```
Processing States:
🔄 Processing...     [Color: #1976D2 (info blue)]
✅ Completed        [Color: #2E7D32 (success green)]
⚠️  Warning         [Color: #F57C00 (warning orange)]
❌ Failed           [Color: #D32F2F (error red)]
⏳ Waiting...       [Color: #757575 (neutral gray)]

Progress Bar:
┌─────────────────────────────────────┐
│ File Processing: 78%                │
│ ████████████████████████████░░░░    │ [Active: #00796B, Background: #E0E0E0]
│ Estimated time: 45 seconds          │
└─────────────────────────────────────┘
```

---

## Responsive Design Specifications

### Mobile Breakpoints (320px - 767px)
- **Typography**: Base font size 16px, line height 1.6
- **Touch Targets**: Minimum 44px height for all interactive elements  
- **Spacing**: 16px padding for content areas, 8px for card internal spacing
- **Navigation**: Bottom tabs, full-width buttons
- **Cards**: Single column layout with full-width cards

### Tablet Breakpoints (768px - 1023px)
- **Typography**: Base font size 16px, enhanced hierarchy
- **Layout**: Two-column layouts where appropriate
- **Navigation**: Top navigation bar with dropdown menus
- **Cards**: Two-column grid for material cards
- **Forms**: Inline labels and improved field grouping

### Desktop Breakpoints (1024px+)
- **Typography**: Enhanced hierarchy with larger headings
- **Layout**: Full sidebar navigation, multi-column content
- **Interactions**: Hover states, keyboard shortcuts
- **Cards**: Three-column grid with detailed information
- **Advanced Features**: Bulk operations, detailed analytics

---

## Animation Specifications

### Page Transitions
```css
.fade-in {
  opacity: 0;
  animation: fadeIn 200ms ease-out forwards;
}

.slide-up {
  transform: translateY(10px);
  opacity: 0;
  animation: slideUp 200ms ease-out forwards;
}
```

### Loading States
- **Skeleton Loading**: Gray placeholder blocks for content
- **Spinner**: Rotating icon for processing states
- **Progress Bars**: Smooth animation for file uploads
- **Pulse Animation**: Subtle breathing effect for waiting states

### Interactive Feedback
- **Button Press**: 2px downward transform on touch
- **Hover States**: 4px box-shadow increase on desktop
- **Focus States**: 2px solid outline in primary color
- **State Transitions**: 150ms ease-out for all state changes

---

## Accessibility Implementation

### Color Contrast Compliance
- **Normal Text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: High contrast focus indicators
- **Status Colors**: Never rely on color alone, include icons

### Focus Management
- **Visible Focus**: 2px solid outline in primary teal
- **Logical Tab Order**: Left to right, top to bottom
- **Skip Links**: Direct navigation to main content areas
- **Keyboard Shortcuts**: Documented alternatives for touch gestures

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy (H1-H6)
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Status updates announced to screen readers
- **Alt Text**: Descriptive text for all images and icons

These high-fidelity mockups provide complete visual specifications for development implementation, ensuring consistent design across all platforms and use cases while maintaining professional appearance and accessibility standards.