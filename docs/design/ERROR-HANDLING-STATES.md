# Error Handling & Loading States Design
## Upsell Agent - Complete State Management Specification

---

## Design Philosophy

Error handling and loading states are critical for maintaining user confidence and professional appearance in the Upsell Agent platform. Our approach prioritizes:

1. **Transparency**: Users always understand what's happening
2. **Recovery**: Clear paths to resolve issues independently
3. **Prevention**: Proactive guidance to avoid errors
4. **Professionalism**: Maintaining business-appropriate tone even during failures
5. **Accessibility**: Ensuring all states are perceivable and actionable for all users

---

## Loading States Design

### Primary Loading Patterns

#### 1. Skeleton Loading
**Use Case**: Content that has predictable structure (cards, lists, forms)

```html
<!-- Material Card Skeleton -->
<div class="skeleton-card" aria-label="Loading training material" role="status">
  <div class="skeleton-card__header">
    <div class="skeleton-line skeleton-line--title"></div>
    <div class="skeleton-circle skeleton-circle--sm"></div>
  </div>
  <div class="skeleton-card__body">
    <div class="skeleton-line skeleton-line--body"></div>
    <div class="skeleton-line skeleton-line--body skeleton-line--short"></div>
    <div class="skeleton-card__meta">
      <div class="skeleton-line skeleton-line--meta"></div>
      <div class="skeleton-line skeleton-line--meta"></div>
    </div>
  </div>
  <span class="sr-only">Loading training material information</span>
</div>
```

```css
.skeleton-card {
  background: var(--white);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  animation: pulse 2s ease-in-out infinite;
}

.skeleton-line {
  height: 16px;
  background: var(--neutral-200);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  animation: shimmer 2s ease-in-out infinite;
}

.skeleton-line--title {
  height: 20px;
  width: 70%;
  margin-bottom: var(--space-3);
}

.skeleton-line--body {
  width: 100%;
}

.skeleton-line--short {
  width: 60%;
}

.skeleton-line--meta {
  height: 12px;
  width: 80px;
  display: inline-block;
  margin-right: var(--space-3);
}

.skeleton-circle {
  border-radius: 50%;
  background: var(--neutral-200);
}

.skeleton-circle--sm {
  width: 24px;
  height: 24px;
}

@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-card, .skeleton-line {
    animation: none;
  }
}
```

#### 2. Spinner Loading
**Use Case**: Indeterminate processes, button loading states

```html
<!-- Primary Spinner -->
<div class="loading-spinner loading-spinner--primary" role="status" aria-label="Processing">
  <svg class="loading-spinner__icon" viewBox="0 0 50 50">
    <circle 
      cx="25" 
      cy="25" 
      r="20" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="31.416"
      stroke-dashoffset="31.416"
    />
  </svg>
  <span class="loading-spinner__text">Processing your files...</span>
</div>

<!-- Button Loading State -->
<button class="btn btn--primary" disabled aria-describedby="btn-loading-text">
  <svg class="btn__spinner" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>
  <span>Generating Materials</span>
  <span id="btn-loading-text" class="sr-only">Please wait, generating training materials</span>
</button>
```

```css
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
}

.loading-spinner__icon {
  width: 40px;
  height: 40px;
  color: var(--primary-teal);
  animation: spin 1s linear infinite;
}

.loading-spinner--primary .loading-spinner__icon circle {
  animation: dash 1.5s ease-in-out infinite;
}

.loading-spinner__text {
  font-size: var(--text-sm);
  color: var(--neutral-600);
  text-align: center;
}

.btn__spinner {
  width: 16px;
  height: 16px;
  margin-right: var(--space-2);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
```

#### 3. Progress Bar Loading
**Use Case**: File uploads, processing stages with measurable progress

```html
<div class="progress-loader" role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-loader__header">
    <h3 class="progress-loader__title">Processing Your Documents</h3>
    <span class="progress-loader__percentage">67%</span>
  </div>
  <div class="progress-loader__bar">
    <div class="progress-loader__fill" style="width: 67%"></div>
  </div>
  <div class="progress-loader__details">
    <span class="progress-loader__status">Analyzing product information...</span>
    <span class="progress-loader__time">Est. time remaining: 1 minute</span>
  </div>
</div>
```

```css
.progress-loader {
  background: var(--white);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.progress-loader__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.progress-loader__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--neutral-900);
}

.progress-loader__percentage {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary-teal);
}

.progress-loader__bar {
  height: 8px;
  background: var(--neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.progress-loader__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-teal), var(--primary-teal-light));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
  position: relative;
}

.progress-loader__fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer-progress 1.5s infinite;
}

.progress-loader__details {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--neutral-600);
}

@keyframes shimmer-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## Error State Design

### Error Classification System

#### 1. User Errors (Recoverable)
**Characteristics**: User action required, clear resolution path

##### File Upload Errors
```html
<div class="error-card error-card--user" role="alert" aria-labelledby="error-title">
  <div class="error-card__icon">
    <svg aria-hidden="true" class="error-icon error-icon--warning">
      <use href="#alert-triangle-icon"></use>
    </svg>
  </div>
  <div class="error-card__content">
    <h3 id="error-title" class="error-card__title">File Format Not Supported</h3>
    <p class="error-card__message">
      The file "presentation.pptx" cannot be processed. Please convert to a supported format.
    </p>
    <div class="error-card__details">
      <strong>Supported formats:</strong>
      <ul class="error-card__list">
        <li>PDF documents (.pdf)</li>
        <li>Image files (.jpg, .png)</li>
        <li>Word documents (.docx)</li>
      </ul>
    </div>
  </div>
  <div class="error-card__actions">
    <button class="btn btn--primary btn--sm">Convert File</button>
    <button class="btn btn--secondary btn--sm">Choose Different File</button>
  </div>
</div>
```

##### Form Validation Errors
```html
<div class="form-group form-group--error">
  <label for="product-name" class="form-label">Product Name *</label>
  <input 
    type="text" 
    id="product-name" 
    class="form-input form-input--error"
    value=""
    aria-describedby="product-name-error"
    aria-invalid="true"
    required
  >
  <div id="product-name-error" class="form-error" role="alert">
    <svg class="form-error__icon" aria-hidden="true">
      <use href="#alert-circle-icon"></use>
    </svg>
    Product name is required to generate training materials
  </div>
</div>
```

#### 2. System Errors (Technical Issues)
**Characteristics**: System-level problems, may require retry or alternative approach

##### Network Connection Errors
```html
<div class="error-state error-state--system" role="alert">
  <div class="error-state__illustration">
    <svg class="error-state__icon" aria-hidden="true">
      <use href="#wifi-off-icon"></use>
    </svg>
  </div>
  <div class="error-state__content">
    <h2 class="error-state__title">Connection Lost</h2>
    <p class="error-state__message">
      Your upload was interrupted due to a connection issue. Don't worry – your progress has been saved.
    </p>
    <div class="error-state__status">
      <div class="upload-status">
        <div class="upload-status__item upload-status__item--success">
          <svg aria-hidden="true"><use href="#check-icon"></use></svg>
          <span>product-info.pdf uploaded</span>
        </div>
        <div class="upload-status__item upload-status__item--error">
          <svg aria-hidden="true"><use href="#x-icon"></use></svg>
          <span>benefits-chart.jpg failed at 45%</span>
        </div>
      </div>
    </div>
  </div>
  <div class="error-state__actions">
    <button class="btn btn--primary">
      <svg class="btn__icon" aria-hidden="true">
        <use href="#refresh-icon"></use>
      </svg>
      Retry Upload
    </button>
    <button class="btn btn--secondary">Continue with Uploaded Files</button>
    <button class="btn btn--ghost">Switch to Mobile Data</button>
  </div>
</div>
```

##### Server Processing Errors
```html
<div class="error-state error-state--processing" role="alert">
  <div class="error-state__illustration">
    <svg class="error-state__icon error-state__icon--error" aria-hidden="true">
      <use href="#server-icon"></use>
    </svg>
  </div>
  <div class="error-state__content">
    <h2 class="error-state__title">Processing Temporarily Unavailable</h2>
    <p class="error-state__message">
      Our AI processing service is experiencing high demand. Your files are safely stored and ready to process.
    </p>
    <div class="error-state__eta">
      <strong>Estimated wait time:</strong> 5-10 minutes
    </div>
  </div>
  <div class="error-state__actions">
    <button class="btn btn--primary">
      <svg class="btn__icon" aria-hidden="true">
        <use href="#bell-icon"></use>
      </svg>
      Notify Me When Ready
    </button>
    <button class="btn btn--secondary">Try Again Later</button>
    <button class="btn btn--ghost">Create Manual Template</button>
  </div>
</div>
```

#### 3. Empty States (Contextual Guidance)
**Characteristics**: No errors, but no content available

##### First-Time User Empty State
```html
<div class="empty-state empty-state--onboarding">
  <div class="empty-state__illustration">
    <svg class="empty-state__icon" aria-hidden="true">
      <use href="#document-plus-icon"></use>
    </svg>
  </div>
  <div class="empty-state__content">
    <h2 class="empty-state__title">Ready to Create Your First Training Material?</h2>
    <p class="empty-state__message">
      Upload product documentation and our AI will generate professional sales scripts and training guides in under 5 minutes.
    </p>
    <div class="empty-state__features">
      <div class="feature-list">
        <div class="feature-list__item">
          <svg aria-hidden="true"><use href="#zap-icon"></use></svg>
          <span>Generate materials in minutes</span>
        </div>
        <div class="feature-list__item">
          <svg aria-hidden="true"><use href="#mobile-icon"></use></svg>
          <span>Mobile-friendly for staff access</span>
        </div>
        <div class="feature-list__item">
          <svg aria-hidden="true"><use href="#trending-up-icon"></use></svg>
          <span>Proven to increase sales 15-20%</span>
        </div>
      </div>
    </div>
  </div>
  <div class="empty-state__actions">
    <button class="btn btn--primary btn--lg">
      <svg class="btn__icon" aria-hidden="true">
        <use href="#upload-icon"></use>
      </svg>
      Upload First Document
    </button>
    <button class="btn btn--secondary">Watch Tutorial Video</button>
  </div>
</div>
```

##### No Search Results
```html
<div class="empty-state empty-state--search">
  <div class="empty-state__illustration">
    <svg class="empty-state__icon" aria-hidden="true">
      <use href="#search-icon"></use>
    </svg>
  </div>
  <div class="empty-state__content">
    <h3 class="empty-state__title">No training materials found for "vitamin serum"</h3>
    <p class="empty-state__message">
      Try adjusting your search terms or browse by category to find what you're looking for.
    </p>
  </div>
  <div class="empty-state__actions">
    <button class="btn btn--secondary">Clear Search</button>
    <button class="btn btn--ghost">Browse All Categories</button>
  </div>
</div>
```

---

## Error State CSS Framework

```css
/* Base Error Components */
.error-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}

.error-card--user {
  border-color: var(--warning);
  background: var(--warning-light);
}

.error-card--system {
  border-color: var(--error);
  background: var(--error-light);
}

.error-card__icon {
  flex-shrink: 0;
}

.error-icon {
  width: 24px;
  height: 24px;
}

.error-icon--warning {
  color: var(--warning);
}

.error-icon--error {
  color: var(--error);
}

.error-card__content {
  flex: 1;
}

.error-card__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--neutral-900);
}

.error-card__message {
  margin: 0 0 var(--space-3);
  font-size: var(--text-base);
  color: var(--neutral-800);
  line-height: 1.5;
}

.error-card__details {
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  color: var(--neutral-700);
}

.error-card__list {
  margin: var(--space-2) 0 0;
  padding-left: var(--space-4);
}

.error-card__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* Full-Page Error States */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  min-height: 400px;
}

.error-state__illustration {
  margin-bottom: var(--space-6);
}

.error-state__icon {
  width: 64px;
  height: 64px;
  color: var(--neutral-400);
}

.error-state__icon--error {
  color: var(--error);
}

.error-state__title {
  margin: 0 0 var(--space-3);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--neutral-900);
}

.error-state__message {
  margin: 0 0 var(--space-4);
  font-size: var(--text-base);
  color: var(--neutral-600);
  max-width: 500px;
  line-height: 1.6;
}

.error-state__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}

/* Form Error States */
.form-input--error {
  border-color: var(--error);
  background: var(--error-light);
}

.form-input--error:focus {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--error);
}

.form-error__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Mobile Responsive Adjustments */
@media (max-width: 767px) {
  .error-card {
    flex-direction: column;
    text-align: center;
  }
  
  .error-card__actions {
    justify-content: center;
  }
  
  .error-state {
    padding: var(--space-6) var(--space-4);
  }
  
  .error-state__actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .error-state__actions .btn {
    width: 100%;
  }
}
```

---

## Micro-Interactions & Animations

### Error State Animations
```css
/* Error reveal animation */
.error-card {
  animation: errorSlideIn var(--duration-base) var(--ease-out);
}

@keyframes errorSlideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Shake animation for critical errors */
.error-card--critical {
  animation: errorShake 0.5s var(--ease-out);
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Loading to error transition */
.loading-to-error {
  animation: loadingFadeOut var(--duration-base) var(--ease-out) forwards,
             errorFadeIn var(--duration-base) var(--ease-out) var(--duration-base) forwards;
}

@keyframes loadingFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes errorFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

### Success State Transitions
```css
/* Loading to success animation */
.success-reveal {
  animation: successScale var(--duration-slow) var(--ease-out);
}

@keyframes successScale {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* Checkmark animation */
.success-checkmark {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: checkmarkDraw 0.8s var(--ease-out) forwards;
}

@keyframes checkmarkDraw {
  to { stroke-dashoffset: 0; }
}
```

---

## Accessibility Implementation

### Screen Reader Support
```html
<!-- Loading state announcements -->
<div role="status" aria-live="polite" aria-label="Loading status">
  <span class="sr-only" id="loading-text">Processing your documents, please wait...</span>
</div>

<!-- Error state announcements -->
<div role="alert" aria-live="assertive" aria-describedby="error-details">
  <span id="error-details" class="sr-only">
    File upload failed. The file format is not supported. Please select a PDF, JPG, PNG, or DOCX file.
  </span>
</div>

<!-- Progress updates -->
<div role="progressbar" 
     aria-valuenow="67" 
     aria-valuemin="0" 
     aria-valuemax="100" 
     aria-describedby="progress-text">
  <span id="progress-text" class="sr-only">
    Processing is 67% complete. Estimated time remaining: 1 minute.
  </span>
</div>
```

### Keyboard Navigation
```css
/* Focus management for error actions */
.error-card__actions .btn:first-child {
  /* Auto-focus primary action in error states */
}

.error-state__actions .btn {
  /* Ensure all error recovery actions are keyboard accessible */
}

/* Skip link for error states */
.error-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-teal);
  color: var(--white);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.error-skip-link:focus {
  top: 6px;
}
```

### Color Accessibility
```css
/* Ensure errors are perceivable without color */
.error-indicator::before {
  content: "⚠️ ";
  speak: "alert ";
}

.success-indicator::before {
  content: "✅ ";
  speak: "success ";
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .error-card--user {
    border-width: 3px;
    border-color: var(--error);
  }
  
  .loading-spinner__icon {
    stroke-width: 3;
  }
}
```

---

## Testing & Validation

### Error State Testing Checklist
- [ ] All error states have clear, actionable messages
- [ ] Recovery paths are obvious and functional
- [ ] Screen readers can perceive and navigate error states
- [ ] Error states work without color perception
- [ ] Mobile error states are touch-friendly
- [ ] Error animations respect reduced motion preferences
- [ ] All error text is professional and helpful in tone

### Loading State Testing Checklist
- [ ] Loading states accurately represent actual progress
- [ ] Skeleton loading matches final content structure
- [ ] Loading indicators are perceivable by screen readers
- [ ] Loading states don't cause layout shifts
- [ ] Progress bars provide realistic time estimates
- [ ] Loading states work on slow connections
- [ ] Loading animations are smooth and professional

### Performance Considerations
- [ ] Error states load quickly without additional network requests
- [ ] Loading animations don't impact performance
- [ ] Skeleton screens improve perceived performance
- [ ] Error recovery doesn't require full page reloads
- [ ] Loading states cache appropriately for repeat visits

This comprehensive error handling and loading state system ensures that users always understand the system status, can recover from issues independently, and maintain confidence in the platform's professionalism and reliability.