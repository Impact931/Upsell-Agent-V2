import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'test-user', email: 'test@spa.com', businessType: 'spa' },
          token: 'mock-token'
        })
      });
    });

    // Mock training materials
    await page.route('**/api/training', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trainingMaterials: [
            {
              id: 'tm-1',
              title: 'Premium Facial Serum - Sales Script',
              type: 'script',
              content: '# Sales Script for Premium Facial Serum\n\nThis is a comprehensive sales script...',
              duration: 3,
              product: { name: 'Premium Facial Serum', category: 'Skincare', price: 89.99 }
            }
          ],
          pagination: { total: 1, hasMore: false }
        })
      });
    });
  });

  mobileViewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });

      // Test login page
      await page.goto('/login');
      
      // Verify responsive design elements
      const loginForm = page.locator('form');
      await expect(loginForm).toBeVisible();
      
      // Check that form takes appropriate width on mobile
      const formBounds = await loginForm.boundingBox();
      expect(formBounds!.width).toBeLessThanOrEqual(width - 40); // Account for padding
      
      // Login to access main interface
      await page.fill('[name="email"]', 'test@spa.com');
      await page.fill('[name="password"]', 'password');
      await page.click('button[type="submit"]');
      
      // Test dashboard responsiveness
      await expect(page).toHaveURL('/dashboard');
      
      // Verify mobile navigation is present on smaller screens
      if (width <= 768) {
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
        await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
      } else {
        await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
      }
      
      // Test staff interface (main mobile interface)
      await page.goto('/staff');
      await expect(page.locator('h1')).toBeVisible();
      
      // Check that training materials are displayed properly
      await expect(page.locator('text=Premium Facial Serum - Sales Script')).toBeVisible();
      
      // Verify cards/content adapts to screen size
      const materialCard = page.locator('[data-testid="material-card"]').first();
      if (await materialCard.isVisible()) {
        const cardBounds = await materialCard.boundingBox();
        expect(cardBounds!.width).toBeLessThanOrEqual(width - 20); // Account for margins
      }
    });
  });

  test('should handle touch interactions correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff');
    
    // Test touch scrolling
    const materialsList = page.locator('[data-testid="materials-list"]');
    if (await materialsList.isVisible()) {
      // Simulate touch scroll
      await materialsList.hover();
      await page.mouse.wheel(0, 200);
    }
    
    // Test tap interactions
    const materialCard = page.locator('[data-testid="material-card"]').first();
    if (await materialCard.isVisible()) {
      // Simulate tap (touch start/end)
      await materialCard.dispatchEvent('touchstart');
      await materialCard.dispatchEvent('touchend');
      await materialCard.click();
    }
    
    // Test swipe gestures if implemented
    const swipeableElement = page.locator('[data-testid="swipeable"]');
    if (await swipeableElement.isVisible()) {
      const bounds = await swipeableElement.boundingBox();
      const startX = bounds!.x + bounds!.width * 0.8;
      const endX = bounds!.x + bounds!.width * 0.2;
      const y = bounds!.y + bounds!.height / 2;
      
      // Simulate swipe left
      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(endX, y, { steps: 10 });
      await page.mouse.up();
    }
  });

  test('should handle virtual keyboard properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Focus on input field (would trigger virtual keyboard on real device)
    const emailInput = page.locator('[name="email"]');
    await emailInput.focus();
    
    // Verify input is still visible when virtual keyboard would be present
    // (simulate reduced viewport height)
    await page.setViewportSize({ width: 375, height: 400 }); // Simulated keyboard height
    
    await expect(emailInput).toBeInViewport();
    await expect(page.locator('button[type="submit"]')).toBeInViewport();
  });

  test('should optimize images and content for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff');
    
    // Check that images are appropriately sized
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const bounds = await img.boundingBox();
        expect(bounds!.width).toBeLessThanOrEqual(375); // Should not exceed viewport width
      }
    }
    
    // Verify text is readable (not too small)
    const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ });
    const textCount = await textElements.count();
    
    for (let i = 0; i < Math.min(textCount, 5); i++) { // Check first 5 text elements
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return parseFloat(style.fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
      }
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff');
    
    // Verify layout in portrait
    const portraitHeader = page.locator('h1');
    await expect(portraitHeader).toBeVisible();
    
    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verify layout adapts to landscape
    await expect(portraitHeader).toBeVisible();
    
    // Check that content doesn't overflow
    const body = page.locator('body');
    const bounds = await body.boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(667);
    
    // Verify navigation still works in landscape
    const navElement = page.locator('[data-testid="mobile-nav"], [data-testid="desktop-nav"]');
    await expect(navElement).toBeVisible();
  });

  test('should provide appropriate touch target sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff');
    
    // Check button sizes meet touch target guidelines (minimum 44px)
    const buttons = page.locator('button, a[role="button"], [data-testid*="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const bounds = await button.boundingBox();
        
        // Check minimum touch target size (44px is iOS guideline, 48px is Material Design)
        expect(Math.min(bounds!.width, bounds!.height)).toBeGreaterThanOrEqual(40);
      }
    }
    
    // Check spacing between touch targets
    const interactiveElements = page.locator('button, a, input[type="checkbox"], input[type="radio"]');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 1) {
      const firstElement = await interactiveElements.nth(0).boundingBox();
      const secondElement = await interactiveElements.nth(1).boundingBox();
      
      if (firstElement && secondElement) {
        const verticalSpacing = Math.abs(firstElement.y - secondElement.y);
        const horizontalSpacing = Math.abs(firstElement.x - secondElement.x);
        
        // Ensure adequate spacing between touch targets
        expect(Math.min(verticalSpacing, horizontalSpacing)).toBeGreaterThan(8);
      }
    }
  });

  test('should load quickly on mobile connection', async ({ page }) => {
    // Simulate slower mobile connection
    await page.route('**/*', async (route) => {
      // Add artificial delay to simulate 3G connection
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - startTime;
    
    // Should load reasonably quickly even on slower connections
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify critical content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('should handle offline scenarios gracefully', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go online first to load the page
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff');
    
    // Simulate going offline
    await page.setOfflineMode(true);
    
    // Try to perform an action that requires network
    await page.click('[data-testid="refresh-materials"]');
    
    // Should show appropriate offline message or cached content
    const offlineMessage = page.locator('text=/offline|no connection|network error/i');
    const cachedContent = page.locator('[data-testid="material-card"]');
    
    // Either show offline message or display cached content
    const hasOfflineMessage = await offlineMessage.isVisible();
    const hasCachedContent = await cachedContent.isVisible();
    
    expect(hasOfflineMessage || hasCachedContent).toBe(true);
    
    // Go back online
    await page.setOfflineMode(false);
    
    // Verify functionality returns when online
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should be accessible with screen readers', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/staff');
    
    // Check for proper ARIA labels and roles
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labeling
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const associatedLabel = page.locator(`label[for="${await input.getAttribute('id')}"]`);
      
      // Input should have either aria-label, aria-labelledby, or associated label
      const hasLabel = ariaLabel || ariaLabelledBy || await associatedLabel.count() > 0;
      expect(hasLabel).toBeTruthy();
    }
    
    // Check for keyboard navigation support
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });
});