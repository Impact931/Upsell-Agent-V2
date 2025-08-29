# Component Library & Accessibility Guidelines
## Upsell Agent - Reusable Interface Components

---

## Component Architecture

### Design Token System
All components utilize the design token system defined in the Design System. This ensures consistency and enables easy theming across the entire application.

```css
/* Example token usage in components */
.component {
  color: var(--neutral-900);
  background: var(--white);
  padding: var(--space-4);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--ease-out);
}
```

---

## Button Components

### Primary Button
**Purpose**: Main actions, form submissions, primary CTAs

```html
<button class="btn btn--primary" type="button">
  <span class="btn__text">Generate Materials</span>
  <svg class="btn__icon" aria-hidden="true">...</svg>
</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  text-decoration: none;
}

.btn--primary {
  background: var(--primary-teal);
  color: var(--white);
}

.btn--primary:hover {
  background: var(--primary-teal-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn--primary:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

.btn--primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn--primary:disabled {
  background: var(--neutral-300);
  color: var(--neutral-600);
  cursor: not-allowed;
  transform: none;
}
```

**Accessibility Notes**:
- Minimum 44px touch target size
- Clear focus indicators
- Disabled state with reduced opacity
- Icon + text provides redundant information
- Role="button" for non-button elements

### Secondary Button
**Purpose**: Secondary actions, cancel buttons, alternative options

```html
<button class="btn btn--secondary" type="button">
  <span class="btn__text">View Details</span>
</button>
```

```css
.btn--secondary {
  background: var(--white);
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
}

.btn--secondary:hover {
  background: var(--primary-teal-pale);
  border-color: var(--primary-teal-dark);
}

.btn--secondary:disabled {
  background: var(--white);
  color: var(--neutral-400);
  border-color: var(--neutral-300);
}
```

### Icon Button
**Purpose**: Compact actions, toolbar buttons, favorites

```html
<button class="btn btn--icon" type="button" aria-label="Add to favorites">
  <svg class="btn__icon" aria-hidden="true">
    <use href="#star-icon"></use>
  </svg>
</button>
```

```css
.btn--icon {
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  color: var(--neutral-600);
  border: 2px solid transparent;
}

.btn--icon:hover {
  background: var(--neutral-100);
  color: var(--primary-teal);
  border-color: var(--neutral-200);
}

.btn--icon:focus {
  border-color: var(--primary-teal);
}
```

**Accessibility Notes**:
- Requires aria-label for screen readers
- 44px minimum size for touch accessibility
- Visual focus indicator
- High contrast color ratios

---

## Form Components

### Text Input
**Purpose**: Single-line text entry, email, search

```html
<div class="form-group">
  <label for="product-name" class="form-label">Product Name</label>
  <input 
    type="text" 
    id="product-name" 
    name="productName"
    class="form-input"
    placeholder="Enter product name"
    required
    aria-describedby="product-name-help"
  >
  <div id="product-name-help" class="form-help">
    This will appear in the training materials
  </div>
</div>
```

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--neutral-800);
}

.form-label--required::after {
  content: " *";
  color: var(--error);
}

.form-input {
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--neutral-300);
  border-radius: var(--radius-base);
  font-size: 16px; /* Prevents zoom on iOS */
  font-family: inherit;
  background: var(--white);
  transition: border-color var(--duration-base) var(--ease-out);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px var(--primary-teal-pale);
}

.form-input:invalid {
  border-color: var(--error);
}

.form-input:disabled {
  background: var(--neutral-100);
  color: var(--neutral-600);
  cursor: not-allowed;
}

.form-help {
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--error);
}
```

### Select Dropdown
**Purpose**: Single selection from predefined options

```html
<div class="form-group">
  <label for="category" class="form-label">Category</label>
  <div class="select-wrapper">
    <select id="category" name="category" class="form-select" required>
      <option value="">Choose a category...</option>
      <option value="skincare">Skincare Products</option>
      <option value="body">Body Treatments</option>
      <option value="packages">Service Packages</option>
    </select>
    <svg class="select-icon" aria-hidden="true">
      <use href="#chevron-down-icon"></use>
    </svg>
  </div>
</div>
```

```css
.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) var(--space-10) var(--space-3) var(--space-4);
  border: 2px solid var(--neutral-300);
  border-radius: var(--radius-base);
  font-size: 16px;
  font-family: inherit;
  background: var(--white);
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px var(--primary-teal-pale);
}

.select-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--neutral-600);
  pointer-events: none;
}
```

### File Upload
**Purpose**: Document and image uploads with drag-and-drop

```html
<div class="form-group">
  <label for="file-upload" class="form-label">Upload Documents</label>
  <div class="file-upload" data-component="file-upload">
    <input 
      type="file" 
      id="file-upload" 
      name="documents"
      class="file-upload__input"
      multiple
      accept=".pdf,.jpg,.jpeg,.png,.docx"
      aria-describedby="file-upload-help"
    >
    <div class="file-upload__dropzone">
      <svg class="file-upload__icon" aria-hidden="true">
        <use href="#document-icon"></use>
      </svg>
      <p class="file-upload__text">
        <strong>Drag files here</strong> or click to browse
      </p>
      <p class="file-upload__help" id="file-upload-help">
        Supports PDF, JPG, PNG, DOCX up to 10MB each
      </p>
    </div>
    <div class="file-upload__preview" aria-live="polite"></div>
  </div>
</div>
```

```css
.file-upload {
  position: relative;
}

.file-upload__input {
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

.file-upload__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: var(--space-6);
  border: 3px dashed var(--neutral-300);
  border-radius: var(--radius-lg);
  background: var(--neutral-50);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
}

.file-upload__dropzone:hover,
.file-upload__dropzone--dragover {
  border-color: var(--primary-teal);
  background: var(--primary-teal-pale);
}

.file-upload__dropzone:focus-within {
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px var(--primary-teal-pale);
}

.file-upload__icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-3);
  color: var(--neutral-400);
}

.file-upload__text {
  margin-bottom: var(--space-2);
  font-size: var(--text-base);
  text-align: center;
  color: var(--neutral-800);
}

.file-upload__help {
  font-size: var(--text-sm);
  text-align: center;
  color: var(--neutral-600);
}

.file-upload__preview {
  margin-top: var(--space-4);
}
```

---

## Navigation Components

### Header Navigation
**Purpose**: Site-wide navigation, branding, user actions

```html
<header class="header" role="banner">
  <div class="header__container">
    <div class="header__brand">
      <button class="header__menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="main-nav">
        <svg class="header__menu-icon" aria-hidden="true">
          <use href="#menu-icon"></use>
        </svg>
      </button>
      <a href="/" class="header__logo">
        <img src="/logo.svg" alt="Upsell Agent" class="header__logo-img">
      </a>
    </div>
    
    <div class="header__search">
      <div class="search-field">
        <input 
          type="search" 
          class="search-field__input"
          placeholder="Search materials..."
          aria-label="Search training materials"
        >
        <button class="search-field__button" type="submit" aria-label="Search">
          <svg aria-hidden="true">
            <use href="#search-icon"></use>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="header__actions">
      <button class="header__action" aria-label="Notifications">
        <svg aria-hidden="true">
          <use href="#bell-icon"></use>
        </svg>
        <span class="header__badge" aria-label="2 unread notifications">2</span>
      </button>
      <div class="header__user">
        <button class="user-menu__trigger" aria-label="User menu" aria-expanded="false">
          <img src="/avatar.jpg" alt="Sarah's profile" class="user-menu__avatar">
          <span class="user-menu__name">Sarah</span>
          <svg class="user-menu__icon" aria-hidden="true">
            <use href="#chevron-down-icon"></use>
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>
```

```css
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--white);
  border-bottom: 1px solid var(--neutral-200);
  box-shadow: var(--shadow-sm);
}

.header__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  height: 64px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header__menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-base);
  cursor: pointer;
}

@media (max-width: 767px) {
  .header__menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header__search {
    display: none;
  }
}

.header__logo-img {
  height: 32px;
  width: auto;
}

.search-field {
  position: relative;
  width: 400px;
}

.search-field__input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-12) 0 var(--space-4);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-base);
  background: var(--neutral-50);
  font-size: var(--text-base);
}

.search-field__input:focus {
  outline: none;
  border-color: var(--primary-teal);
  background: var(--white);
}

.search-field__button {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
```

### Bottom Navigation (Mobile)
**Purpose**: Primary navigation for mobile devices

```html
<nav class="bottom-nav" role="navigation" aria-label="Main navigation">
  <a href="/dashboard" class="bottom-nav__item bottom-nav__item--active" aria-current="page">
    <svg class="bottom-nav__icon" aria-hidden="true">
      <use href="#home-icon"></use>
    </svg>
    <span class="bottom-nav__label">Dashboard</span>
  </a>
  <a href="/materials" class="bottom-nav__item">
    <svg class="bottom-nav__icon" aria-hidden="true">
      <use href="#folder-icon"></use>
    </svg>
    <span class="bottom-nav__label">Materials</span>
  </a>
  <a href="/staff" class="bottom-nav__item">
    <svg class="bottom-nav__icon" aria-hidden="true">
      <use href="#users-icon"></use>
    </svg>
    <span class="bottom-nav__label">Staff</span>
  </a>
  <a href="/settings" class="bottom-nav__item">
    <svg class="bottom-nav__icon" aria-hidden="true">
      <use href="#settings-icon"></use>
    </svg>
    <span class="bottom-nav__label">Settings</span>
  </a>
</nav>
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  background: var(--white);
  border-top: 1px solid var(--neutral-200);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  padding: var(--space-2);
  text-decoration: none;
  color: var(--neutral-600);
  transition: color var(--duration-base) var(--ease-out);
}

.bottom-nav__item:hover,
.bottom-nav__item--active {
  color: var(--primary-teal);
}

.bottom-nav__item--active {
  background: var(--primary-teal-pale);
}

.bottom-nav__icon {
  width: 24px;
  height: 24px;
  margin-bottom: var(--space-1);
}

.bottom-nav__label {
  font-size: var(--text-xs);
  font-weight: 500;
  text-align: center;
}
```

---

## Content Display Components

### Card Component
**Purpose**: Content containers, material items, statistics

```html
<article class="card" role="article">
  <div class="card__header">
    <h3 class="card__title">Hydrating Face Serum</h3>
    <button class="card__action" aria-label="Add to favorites">
      <svg aria-hidden="true">
        <use href="#star-icon"></use>
      </svg>
    </button>
  </div>
  <div class="card__content">
    <p class="card__description">Premium anti-aging formula with hyaluronic acid</p>
    <div class="card__meta">
      <span class="card__date">Created 2 days ago</span>
      <span class="card__views">👁️ 12 views</span>
      <span class="card__revenue">$340 revenue</span>
    </div>
  </div>
  <div class="card__actions">
    <button class="btn btn--secondary btn--sm">Edit</button>
    <button class="btn btn--secondary btn--sm">Share</button>
    <button class="btn btn--secondary btn--sm">Analytics</button>
  </div>
</article>
```

```css
.card {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-base) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) 0;
}

.card__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--neutral-900);
}

.card__action {
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--neutral-400);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
}

.card__action:hover {
  background: var(--neutral-100);
  color: var(--primary-teal);
}

.card__content {
  flex: 1;
  padding: var(--space-3) var(--space-4);
}

.card__description {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  color: var(--neutral-700);
  line-height: 1.5;
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

.card__actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}

@media (max-width: 767px) {
  .card__actions {
    flex-direction: column;
  }
  
  .card__actions .btn {
    width: 100%;
  }
}
```

### Modal Component
**Purpose**: Dialogs, confirmations, detailed views

```html
<div class="modal" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description" aria-hidden="true">
  <div class="modal__backdrop" aria-hidden="true"></div>
  <div class="modal__container">
    <div class="modal__content">
      <header class="modal__header">
        <h2 id="modal-title" class="modal__title">Confirm Delete</h2>
        <button class="modal__close" aria-label="Close dialog">
          <svg aria-hidden="true">
            <use href="#x-icon"></use>
          </svg>
        </button>
      </header>
      <div class="modal__body">
        <p id="modal-description">Are you sure you want to delete this training material? This action cannot be undone.</p>
      </div>
      <footer class="modal__footer">
        <button class="btn btn--secondary">Cancel</button>
        <button class="btn btn--primary btn--destructive">Delete</button>
      </footer>
    </div>
  </div>
</div>
```

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all var(--duration-base) var(--ease-out);
}

.modal[aria-hidden="false"] {
  opacity: 1;
  visibility: visible;
}

.modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal__container {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  margin: var(--space-4);
  overflow: hidden;
}

.modal__content {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--neutral-200);
}

.modal__title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--neutral-900);
}

.modal__close {
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--neutral-600);
  cursor: pointer;
}

.modal__close:hover {
  background: var(--neutral-100);
  color: var(--neutral-900);
}

.modal__body {
  padding: var(--space-4) var(--space-6);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--neutral-200);
}

@media (max-width: 767px) {
  .modal__footer {
    flex-direction: column-reverse;
  }
  
  .modal__footer .btn {
    width: 100%;
  }
}
```

---

## Feedback Components

### Loading States
**Purpose**: Processing indication, content loading

```html
<!-- Spinner Loading -->
<div class="loading-spinner" role="status" aria-label="Loading">
  <svg class="loading-spinner__icon" aria-hidden="true">
    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="4"/>
  </svg>
  <span class="sr-only">Loading...</span>
</div>

<!-- Skeleton Loading -->
<div class="loading-skeleton" aria-label="Loading content">
  <div class="loading-skeleton__line"></div>
  <div class="loading-skeleton__line"></div>
  <div class="loading-skeleton__line loading-skeleton__line--short"></div>
</div>

<!-- Progress Bar -->
<div class="progress" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="File processing progress">
  <div class="progress__label">Processing files... 75%</div>
  <div class="progress__bar">
    <div class="progress__fill" style="width: 75%"></div>
  </div>
  <div class="progress__time">Estimated time: 30 seconds</div>
</div>
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-skeleton {
  padding: var(--space-4);
  animation: pulse 2s ease-in-out infinite;
}

.loading-skeleton__line {
  height: 16px;
  background: var(--neutral-200);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.loading-skeleton__line--short {
  width: 60%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.progress {
  padding: var(--space-4);
}

.progress__label {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--neutral-800);
}

.progress__bar {
  height: 8px;
  background: var(--neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress__fill {
  height: 100%;
  background: var(--primary-teal);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

.progress__time {
  font-size: var(--text-xs);
  color: var(--neutral-600);
  text-align: center;
}
```

### Alert Messages
**Purpose**: Success, error, warning, info messages

```html
<div class="alert alert--success" role="alert" aria-live="polite">
  <svg class="alert__icon" aria-hidden="true">
    <use href="#check-circle-icon"></use>
  </svg>
  <div class="alert__content">
    <h4 class="alert__title">Training materials generated successfully!</h4>
    <p class="alert__message">Your materials are ready to share with staff.</p>
  </div>
  <button class="alert__close" aria-label="Dismiss notification">
    <svg aria-hidden="true">
      <use href="#x-icon"></use>
    </svg>
  </button>
</div>
```

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
}

.alert--success {
  background: var(--success-light);
  border-color: var(--success);
  color: var(--neutral-800);
}

.alert--error {
  background: var(--error-light);
  border-color: var(--error);
  color: var(--neutral-800);
}

.alert--warning {
  background: var(--warning-light);
  border-color: var(--warning);
  color: var(--neutral-800);
}

.alert--info {
  background: var(--info-light);
  border-color: var(--info);
  color: var(--neutral-800);
}

.alert__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.alert--success .alert__icon {
  color: var(--success);
}

.alert--error .alert__icon {
  color: var(--error);
}

.alert__content {
  flex: 1;
}

.alert__title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-base);
  font-weight: 600;
}

.alert__message {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
}

.alert__close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--neutral-600);
  cursor: pointer;
}

.alert__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--neutral-800);
}
```

---

## Accessibility Guidelines

### Screen Reader Support
1. **Semantic HTML**: Use proper HTML elements (button, nav, main, etc.)
2. **ARIA Labels**: Provide descriptive labels for complex elements
3. **Live Regions**: Use aria-live for dynamic content updates
4. **Focus Management**: Maintain logical focus order

### Keyboard Navigation
1. **Tab Order**: All interactive elements accessible via Tab key
2. **Skip Links**: Direct navigation to main content
3. **Keyboard Shortcuts**: Document and implement consistent shortcuts
4. **Focus Indicators**: Clear visual focus states

### Touch Accessibility
1. **Target Size**: Minimum 44px × 44px for all touch targets
2. **Spacing**: Adequate space between interactive elements
3. **Gestures**: Provide alternatives to complex gestures

### Color and Contrast
1. **Contrast Ratios**: Meet WCAG AA standards (4.5:1 for normal text)
2. **Color Independence**: Never rely on color alone for information
3. **High Contrast Mode**: Support system high contrast preferences

### Motion and Animation
1. **Reduced Motion**: Respect prefers-reduced-motion settings
2. **Essential Animation**: Only animate when it serves a functional purpose
3. **Control**: Provide controls to pause auto-playing content

---

## Component Usage Guidelines

### Implementation Checklist
- [ ] All components use design tokens for consistency
- [ ] Proper semantic HTML structure
- [ ] ARIA labels and descriptions where needed
- [ ] Focus management and keyboard accessibility
- [ ] Responsive behavior across breakpoints
- [ ] Loading and error states handled
- [ ] Color contrast requirements met
- [ ] Touch target size requirements met

### Testing Requirements
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation testing
- [ ] Mobile device testing across iOS and Android
- [ ] Cross-browser compatibility testing
- [ ] Color contrast verification
- [ ] Performance impact assessment

This component library provides a comprehensive foundation for building accessible, consistent, and professional interfaces that meet the needs of both spa managers and staff members across all devices and interaction methods.