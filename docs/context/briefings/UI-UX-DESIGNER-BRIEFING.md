# Agent Briefing: UI/UX Designer - User Experience Design

## Context Summary
- **Project Phase**: Design Foundation (Week 1-2)
- **Previous Work**: Project context and business requirements established
- **Current State**: Ready for user experience design and interface specifications

## Specific Task
**Primary Objective**: Design intuitive, mobile-first user experience for spa/salon staff and managers using the Upsell Agent platform, with focus on simplicity, accessibility, and professional appearance.

**Success Criteria**:
- [ ] Complete responsive design system (mobile, tablet, desktop)
- [ ] User flow diagrams for all core features
- [ ] High-fidelity mockups ready for frontend implementation
- [ ] Component library specifications with accessibility guidelines
- [ ] Mobile-optimized staff interface design
- [ ] Professional manager interface design
- [ ] Brand guidelines and visual identity established
- [ ] Accessibility compliance framework (WCAG 2.1 AA)

**Timeline**: 7 days (Days 1-7, with handoff to Frontend Developer on Day 2)

## Design Requirements

### Target Users & Use Cases

#### Primary User: Salon/Spa Manager
**Context**: Office/back-of-house environment, desktop/tablet usage
**Goals**: 
- Upload product documentation efficiently
- Generate training materials quickly (<5 minutes total workflow)
- Manage staff access and training assignments
- Review and customize generated content

**Pain Points**:
- Limited time for training material creation
- Inconsistent staff product knowledge
- Need professional appearance for business setting
- Varying technical comfort levels

#### Secondary User: Service Staff
**Context**: Mobile-first, on-the-go access between clients
**Goals**:
- Quickly access training materials during work
- Review product information before client consultations
- Understand upselling techniques for specific services
- Access materials without internet when possible

**Pain Points**:
- Limited time between appointments
- Small screen mobile access
- Need simple, clear information presentation
- Varying literacy and technical comfort levels

### Core User Flows

#### 1. Manager Onboarding Flow
```
Registration → Salon Setup → File Upload Tutorial → 
First Training Generation → Staff Invitation → Dashboard Overview
```

#### 2. File Upload & Training Generation Flow
```
Login → Upload Files → Processing Status → 
Customization Options → Generate Training → 
Review/Edit → Publish to Staff
```

#### 3. Staff Access Flow
```
Invitation → Account Setup → Training Materials Library → 
Search/Filter → View Training → Bookmark → Offline Access
```

#### 4. Training Material Consumption Flow
```
Login → Browse Materials → Select Training Topic → 
Read/View Content → Practice Scenarios → 
Mark Complete → Return to Library
```

### Design System Requirements

#### Visual Identity
- **Professional Aesthetic**: Clean, modern, trustworthy appearance
- **Wellness Industry Appropriate**: Calming colors, clean typography
- **Accessibility First**: High contrast, readable fonts, clear navigation
- **Mobile Optimized**: Touch-friendly, thumb-reachable navigation

#### Color Palette
- **Primary Colors**: Professional blues or greens suitable for wellness industry
- **Accent Colors**: Highlight important actions and success states
- **Neutral Colors**: Gray scale for backgrounds, text, and borders
- **Status Colors**: Clear indicators for success, warning, error states
- **Accessibility**: All color combinations meet WCAG AA contrast ratios

#### Typography
- **Hierarchy**: Clear distinction between headings, body text, captions
- **Readability**: Fonts optimized for mobile screens and longer reading
- **Accessibility**: Minimum 16px base font size, appropriate line height
- **Professional**: Clean, modern typefaces suitable for business use

#### Component Library
- **Form Elements**: Input fields, dropdowns, file upload areas
- **Navigation**: Mobile menu, breadcrumbs, pagination
- **Content Display**: Cards, lists, modals, accordions
- **Feedback**: Loading states, progress bars, notifications, error messages
- **Actions**: Buttons, links, icon buttons with clear hierarchy

### Interface Design Requirements

#### Mobile-First Approach (320px+)
**Staff Interface Priority**:
- Large, touch-friendly buttons (minimum 44px)
- Simplified navigation with thumb-reachable areas
- Readable text without zooming
- Minimal scrolling for core actions
- Offline access indicators

**Key Screens for Mobile**:
- Login/Registration
- Training materials library
- Individual training material viewer
- Search and filter interface
- Profile/settings (minimal)

#### Tablet Interface (768px+)
**Manager Interface Optimization**:
- Dual-panel layouts where appropriate
- Enhanced navigation with sidebar options
- Improved file upload interface
- Better content organization and filtering
- Multi-select and bulk operations

#### Desktop Interface (1024px+)
**Full Feature Access**:
- Comprehensive dashboard with analytics
- Advanced file management and organization
- Side-by-side content editing and preview
- Detailed staff management and assignment
- Comprehensive settings and customization

### Specific Feature Design

#### File Upload Interface
**Requirements**:
- Drag-and-drop area with clear visual feedback
- Multiple file selection with preview thumbnails
- Progress indicators for upload and OCR processing
- Error handling with clear recovery instructions
- File type and size validation with helpful guidance

**Design Considerations**:
- Visual distinction between different processing states
- Clear indication of supported file types
- Progress visualization that doesn't cause anxiety
- Error messages that provide actionable solutions

#### Training Material Generation
**Requirements**:
- Step-by-step workflow with progress indication
- Customization options without overwhelming choices
- Preview capability before final generation
- Clear timeline expectations (<5 minutes)
- Integration of compliance disclaimers

**Design Considerations**:
- Workflow that feels guided but not restrictive
- Customization options that enhance rather than complicate
- Clear value proposition at each step
- Professional appearance suitable for business use

#### Training Material Viewer
**Requirements**:
- Mobile-optimized reading experience
- Clear typography and layout hierarchy
- Bookmark and favorite functionality
- Search within content capability
- Download/offline access options

**Design Considerations**:
- Reading experience optimized for various lighting conditions
- Navigation that doesn't interrupt reading flow
- Clear separation between different content types
- Professional formatting that maintains credibility

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Management**: Clear focus indicators and logical tab order
- **Screen Reader Support**: Semantic HTML structure and ARIA labels
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Text Alternatives**: Alt text for images and icons

#### Inclusive Design Considerations
- **Low Vision**: Scalable text, high contrast mode support
- **Motor Impairments**: Large touch targets, avoid precise movements
- **Cognitive Load**: Clear information hierarchy, simple language
- **Technical Literacy**: Intuitive interactions, clear help text

## Resources Available

### Business Context
- `/Users/jhrstudio/Documents/GitHub/Upsell-Agent-V2/docs/context/ Upsell-Agent prePRD Brief.md` - Detailed business requirements
- Target market: Spa/salon/wellness centers
- Success metrics: 15-20% revenue lift, <5 min training generation
- Compliance requirements: Wellness marketing disclaimers

### Technical Constraints
- **Framework**: Next.js/TypeScript implementation
- **Performance**: <5 second page loads, <5 minute training generation
- **Mobile**: Mobile-first responsive design required
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Industry Research
- **Competitive Analysis**: Review existing salon management software
- **User Research**: Spa/salon staff workflow and technology comfort
- **Accessibility Standards**: WCAG 2.1 guidelines and best practices
- **Mobile Usage Patterns**: Service industry mobile device usage

## Design Deliverables

### Phase 1: Foundation (Days 1-2)
**Deliverables**:
- [ ] User persona definitions with research backing
- [ ] User journey maps for primary workflows
- [ ] Information architecture and site map
- [ ] Initial wireframes for core screens
- [ ] Design system color palette and typography

### Phase 2: Core Design (Days 3-5)
**Deliverables**:
- [ ] High-fidelity mockups for all core screens
- [ ] Responsive breakpoint designs (mobile, tablet, desktop)
- [ ] Component library with specifications
- [ ] Interactive prototype for user flow validation
- [ ] Accessibility compliance documentation

### Phase 3: Refinement (Days 6-7)
**Deliverables**:
- [ ] Refined designs based on stakeholder feedback
- [ ] Developer handoff documentation
- [ ] Asset library (icons, images, brand elements)
- [ ] Animation and interaction specifications
- [ ] Quality assurance checklist

## Integration Points

### Frontend Developer Handoff (Day 2)
**Timing**: Early handoff to enable parallel development
**Requirements**:
- Core component designs completed
- Basic responsive layouts defined
- Color palette and typography established
- Key user flows documented

**Handoff Package**:
- Design system documentation
- High-fidelity mockups for priority screens
- Component specifications with measurements
- Asset library and style guide
- User flow diagrams

### Ongoing Collaboration (Days 3-7)
**Responsibilities**:
- Review frontend implementation for design fidelity
- Provide additional specifications as needed
- Refine designs based on technical constraints
- Support accessibility implementation
- Validate user experience decisions

## Quality Assurance

### Design Validation
- [ ] User flow testing with representative users
- [ ] Accessibility audit using automated and manual testing
- [ ] Mobile device testing across different screen sizes
- [ ] Cross-browser compatibility for design elements
- [ ] Performance impact assessment of design choices

### Stakeholder Review
- [ ] Business stakeholder approval of user experience
- [ ] Technical team validation of implementation feasibility
- [ ] Accessibility expert review of compliance approach
- [ ] Industry expert feedback on professional appearance
- [ ] Pilot salon manager input on workflow design

## Success Metrics

### User Experience Metrics
- **Task Completion Rate**: Users can complete core workflows
- **Time to Complete**: File upload to training access under 5 minutes
- **Error Recovery**: Users can resolve issues independently
- **Satisfaction Score**: Positive feedback from pilot salon users
- **Accessibility Score**: WCAG 2.1 AA compliance verified

### Design Quality Metrics
- **Visual Consistency**: Coherent design system implementation
- **Responsive Behavior**: Proper display across device sizes
- **Performance Impact**: Design elements don't slow loading
- **Implementation Fidelity**: Frontend matches design specifications
- **Professional Appearance**: Suitable for business environment

## Next Steps After Briefing

### Immediate Actions (Next 4 hours)
1. Review business requirements and target user context
2. Research existing salon management software and workflows
3. Begin user persona development based on prePRD insights
4. Start information architecture planning

### Day 1 Priorities
1. Complete user research and persona definition
2. Create user journey maps for core workflows
3. Develop initial information architecture
4. Begin wireframe development for priority screens

### Days 2-7 Execution
1. High-fidelity mockup creation
2. Component library development  
3. Responsive design implementation
4. Accessibility compliance integration
5. Developer handoff preparation and support

## Consultation Availability

### Specialist Support
- **Accessibility Expert**: WCAG compliance review and guidance
- **Mobile UX Specialist**: Touch interface optimization
- **Industry Research**: Spa/salon workflow analysis
- **Brand Designer**: Visual identity development support

### Stakeholder Input
- **Business Analyst**: User requirement validation
- **Frontend Developer**: Technical constraint discussion
- **Context Manager**: Design decision documentation
- **Pilot Salon Managers**: Real-world workflow validation