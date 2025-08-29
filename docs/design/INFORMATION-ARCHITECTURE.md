# Information Architecture & Wireframes
## Upsell Agent - Site Structure & Navigation Design

---

## Site Map

### Manager Dashboard Hierarchy
```
🏠 Dashboard (Home)
├── 📊 Overview & Analytics
├── 📁 Training Materials
│   ├── 🔄 Generate New Materials
│   │   ├── Upload Files
│   │   ├── Processing Status  
│   │   ├── Review & Customize
│   │   └── Publish to Staff
│   ├── 📚 Materials Library
│   │   ├── By Category
│   │   ├── By Date Created
│   │   └── By Staff Assignment
│   └── 🗑️ Archive/Trash
├── 👥 Staff Management
│   ├── 📱 Staff Access Control
│   ├── 📈 Usage Analytics
│   └── ➕ Invite New Staff
├── ⚙️ Settings
│   ├── 🏢 Spa Profile
│   ├── 🎨 Customization
│   ├── 📋 Compliance
│   └── 🔐 Account Security
└── ❓ Help & Support
    ├── 📖 User Guide
    ├── 💬 Contact Support
    └── 🎥 Video Tutorials
```

### Staff Mobile App Hierarchy
```
🏠 Training Materials (Home)
├── 🔍 Search & Filter
├── 📚 Categories
│   ├── 💆 Skincare Products
│   ├── 💅 Nail Care
│   ├── 🧴 Body Treatments
│   └── 🎁 Gift Cards/Packages
├── ⭐ Bookmarks/Favorites  
├── 📱 Recently Viewed
├── 👤 Profile
│   ├── 📊 Progress Tracking
│   ├── 🏆 Achievements
│   └── ⚙️ Settings
└── 📞 Quick Actions
    ├── 💬 Ask Manager
    ├── 📋 Feedback
    └── 🆘 Help
```

---

## Navigation Patterns

### Primary Navigation (Manager Dashboard)
**Desktop/Tablet**: Persistent sidebar navigation
- **Logo/Brand**: Top of sidebar, returns to dashboard
- **Main Sections**: Vertical list with icons and labels
- **User Account**: Bottom of sidebar with profile photo
- **Quick Actions**: Floating action button for "Generate Materials"

**Mobile**: Bottom tab navigation (when screen < 768px)
- **Dashboard**: Home icon
- **Materials**: Library icon  
- **Staff**: People icon
- **Settings**: Gear icon

### Secondary Navigation (Staff Mobile)
**Mobile-First**: Bottom tab navigation with thumb-friendly design
- **Home**: Training materials library
- **Search**: Search and filter interface
- **Bookmarks**: Saved/favorited materials
- **Profile**: User account and progress

### Contextual Navigation
- **Breadcrumbs**: For deep navigation paths
- **Back Buttons**: Clear return paths on mobile
- **Step Indicators**: For multi-step processes (file upload, generation)

---

## Screen Wireframes

### Manager Dashboard - Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Upsell Agent                    [👤 Sarah M.] [🔔] [⚙️] │
├─────────────────────────────────────────────────────────────┤
│ [🏠] Dashboard     │                                         │
│ [📁] Materials     │ Welcome back, Sarah                     │
│ [👥] Staff         │ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ [⚙️] Settings      │ │15 Active│ │89% Usage│ │$2.3K    │     │
│ [❓] Help          │ │Materials│ │This Week│ │Revenue  │     │
│                    │ └─────────┘ └─────────┘ └─────────┘     │
│ ┌───────────────┐  │                                         │
│ │[+] Generate   │  │ Recent Training Materials               │
│ │   Materials   │  │ ┌─────────────────────────────────────┐ │
│ └───────────────┘  │ │ 🧴 Hydrating Face Serum             │ │
│                    │ │ Created: 2 days ago │ 👁️ 12 views   │ │
│                    │ ├─────────────────────────────────────┤ │
│                    │ │ 💆 Anti-Aging Treatment Package     │ │
│                    │ │ Created: 1 week ago │ 👁️ 28 views   │ │
│                    │ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Manager Dashboard - Mobile Layout (375px)

```
┌─────────────────────────────┐
│ [☰] Upsell Agent     [🔔]   │
├─────────────────────────────┤
│ Hi Sarah! 👋                │
│                             │
│ ┌─────────┐ ┌─────────┐     │
│ │15 Active│ │89% Usage│     │
│ │Materials│ │This Week│     │
│ └─────────┘ └─────────┘     │
│                             │
│ ┌─────────────────────────┐ │
│ │  [+] Generate New       │ │
│ │      Materials          │ │
│ └─────────────────────────┘ │
│                             │
│ Recent Materials            │
│ ┌─────────────────────────┐ │
│ │🧴 Hydrating Serum       │ │
│ │2 days ago │ 👁️ 12 views │ │
│ ├─────────────────────────┤ │
│ │💆 Anti-Aging Package    │ │
│ │1 week ago │ 👁️ 28 views │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│[🏠][📁][👥][⚙️]            │
└─────────────────────────────┘
```

### File Upload Flow - Mobile Optimized

#### Step 1: Upload Selection
```
┌─────────────────────────────┐
│ [←] Generate Materials      │
├─────────────────────────────┤
│ Step 1 of 4: Upload Files   │
│ ●○○○                        │
│                             │
│ ┌─────────────────────────┐ │
│ │     📄                  │ │
│ │  Drag files here        │ │  
│ │     or tap to           │ │
│ │    select files         │ │
│ │                         │ │
│ │ Supported: PDF, JPG,    │ │
│ │ PNG, DOCX (Max 10MB)    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📷 Take Photo           │ │
│ └─────────────────────────┘ │
│                             │
│        [Continue]           │
└─────────────────────────────┘
```

#### Step 2: Processing Status
```
┌─────────────────────────────┐
│ [←] Generate Materials      │
├─────────────────────────────┤
│ Step 2 of 4: Processing     │
│ ○●○○                        │
│                             │
│ Processing your files...    │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔄 Extracting text      │ │
│ │ ████████████░░░ 75%     │ │
│ └─────────────────────────┘ │
│                             │
│ ✓ product-info.pdf          │
│ 🔄 ingredient-list.jpg      │
│ ⏱️ benefits-chart.png       │
│                             │
│ This usually takes 2-3      │
│ minutes. Feel free to       │
│ continue with other tasks.  │
│                             │
│    [Run in Background]      │
└─────────────────────────────┘
```

### Staff Training Materials - Mobile Interface

#### Materials Library (Home)
```
┌─────────────────────────────┐
│ 🔍 Search materials...  [⚙️]│
├─────────────────────────────┤
│ Hi Maya! 👋                 │
│ 3 new materials this week   │
│                             │
│ Quick Access                │
│ ┌─────────┐ ┌─────────┐     │
│ │   ⭐     │ │   🕐     │     │
│ │Favorites│ │ Recent  │     │
│ └─────────┘ └─────────┘     │
│                             │
│ Categories                  │
│ ┌─────────────────────────┐ │
│ │💆 Skincare (12)         │ │
│ ├─────────────────────────┤ │
│ │💅 Nail Care (8)         │ │
│ ├─────────────────────────┤ │
│ │🧴 Body Treatments (15)  │ │
│ ├─────────────────────────┤ │
│ │🎁 Packages (5)          │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│[🏠][🔍][⭐][👤]            │
└─────────────────────────────┘
```

#### Material Detail View
```
┌─────────────────────────────┐
│ [←] Hydrating Face Serum [⭐]│
├─────────────────────────────┤
│ 🧴 Hydrating Face Serum     │
│ Premium Anti-Aging Formula  │
│                             │
│ ┌─────────────────────────┐ │
│ │ Key Benefits            │ │
│ │ • Reduces fine lines    │ │
│ │ • Improves skin texture │ │
│ │ │ • 24-hour hydration   │ │
│ └─────────────────────────┘ │
│                             │
│ Client Recommendations      │
│ ┌─────────────────────────┐ │
│ │ "Perfect for clients    │ │
│ │ with mature skin who    │ │
│ │ want visible results.   │ │
│ │ Use after chemical      │ │
│ │ peels for best effect." │ │
│ └─────────────────────────┘ │
│                             │
│ [View Full Script]          │
│ [Save to Favorites]         │
├─────────────────────────────┤
│[🏠][🔍][⭐][👤]            │
└─────────────────────────────┘
```

---

## Information Hierarchy

### Manager Dashboard Priority
1. **Quick Actions**: Generate new materials (primary CTA)
2. **Status Overview**: Key metrics and recent activity
3. **Materials Management**: Access to training library
4. **Staff Monitoring**: Usage analytics and management
5. **Settings**: Configuration and account management

### Staff Interface Priority  
1. **Search & Discovery**: Find relevant training materials quickly
2. **Category Browse**: Organized access to all materials
3. **Bookmarks**: Quick access to frequently used materials
4. **Recent Items**: Continue where you left off
5. **Profile**: Personal progress and settings

---

## Content Organization Principles

### Categorization Strategy
**Product-Based Categories**:
- Skincare Products (Face, Body, Specialized)
- Treatment Add-Ons (Serums, Masks, Enhancements)
- Service Packages (Bundles, Memberships)
- Retail Items (Take-Home Products)
- Seasonal/Promotional Items

**Usage-Based Categories**:
- New Arrivals
- Best Sellers  
- High Commission Items
- Client Favorites
- Training Essentials

### Search & Filter Options
**For Managers**:
- By creation date
- By staff assignment
- By category
- By usage/popularity
- By revenue impact

**For Staff**:
- By product type
- By client concern (anti-aging, acne, etc.)
- By treatment type
- By price range
- By commission level

---

## Responsive Behavior

### Breakpoint Adaptations

#### Mobile (320px - 767px)
- **Navigation**: Bottom tabs, hamburger menu for secondary options
- **Content**: Single column layout, card-based design
- **Actions**: Full-width buttons, thumb-friendly touch targets
- **Images**: Responsive scaling, optimized for mobile bandwidth

#### Tablet (768px - 1023px)  
- **Navigation**: Persistent sidebar or top navigation
- **Content**: Two-column layouts where appropriate
- **Actions**: Standard button sizing, hover states enabled
- **Images**: Higher resolution, better quality

#### Desktop (1024px+)
- **Navigation**: Full sidebar with labels and icons
- **Content**: Multi-column layouts, detailed information display
- **Actions**: Advanced features, keyboard shortcuts
- **Images**: Full resolution, multiple sizes available

### Progressive Enhancement
1. **Core Functionality**: Works on all devices without JavaScript
2. **Enhanced Interactions**: Touch gestures, smooth animations
3. **Advanced Features**: Keyboard shortcuts, bulk operations
4. **Performance Optimizations**: Lazy loading, caching strategies

---

## Accessibility Considerations

### Navigation Accessibility
- **Keyboard Navigation**: All interactive elements accessible via Tab
- **Skip Links**: Direct access to main content areas
- **ARIA Labels**: Clear descriptions for screen readers
- **Focus Indicators**: Visible focus states on all interactive elements

### Content Accessibility  
- **Heading Structure**: Proper H1-H6 hierarchy for screen readers
- **Alt Text**: Descriptive text for all images and icons
- **Color Independence**: Information not conveyed by color alone
- **Text Alternatives**: Icons paired with text labels

### Mobile Accessibility
- **Touch Targets**: Minimum 44px × 44px for all interactive elements
- **Gesture Alternatives**: Swipe actions have button alternatives
- **Voice Control**: Compatible with voice recognition software
- **Screen Reader**: Optimized for mobile screen reader usage

---

## Technical Specifications

### URL Structure
```
Manager Dashboard:
/dashboard                    # Main dashboard
/materials                    # Training materials library
/materials/generate          # Material generation flow  
/materials/:id              # Individual material view
/materials/:id/edit         # Material editing
/staff                      # Staff management
/staff/:id                  # Individual staff view
/settings                   # Account settings
/help                       # Help and support

Staff Interface:
/                           # Materials library (home)
/search                     # Search interface
/materials/:id             # Material detail view
/bookmarks                 # Saved materials
/profile                   # User profile
```

### State Management Requirements
- **Authentication State**: User login status and permissions
- **Navigation State**: Current location and breadcrumbs  
- **Content State**: Loaded materials and caching
- **Form State**: Upload progress and validation
- **User Preferences**: Saved settings and bookmarks

### Performance Requirements
- **Initial Load**: <3 seconds on mobile 3G
- **Navigation**: <1 second between pages
- **Search Results**: <2 seconds for query results
- **File Upload**: Progress indication for files >1MB
- **Offline Support**: Core materials available offline

This information architecture provides the foundation for all subsequent design and development work, ensuring consistent navigation patterns and optimal user experience across all devices and use cases.