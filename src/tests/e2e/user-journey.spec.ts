import { test, expect } from '@playwright/test';

// Test the complete user journey for spa/salon staff
test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses to avoid depending on external services
    await page.route('**/api/auth/**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'test-user-id',
              email: 'test@spa.com',
              name: 'Test Spa Manager',
              businessType: 'spa'
            },
            token: 'mock-jwt-token'
          })
        });
      }
    });

    await page.route('**/api/upload', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'mock-session-id',
          fileName: 'product-brochure.pdf',
          extractedData: {
            text: 'Premium Anti-Aging Serum with Vitamin C',
            extractedProduct: {
              name: 'Premium Anti-Aging Serum',
              price: 89.99,
              category: 'Skincare'
            }
          }
        })
      });
    });

    await page.route('**/api/process', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            id: 'test-product-id',
            name: 'Premium Anti-Aging Serum'
          },
          trainingMaterials: [
            {
              id: 'tm-1',
              title: 'Premium Anti-Aging Serum - Sales Script',
              type: 'script',
              content: 'Sales script content...',
              duration: 3
            },
            {
              id: 'tm-2', 
              title: 'Premium Anti-Aging Serum - Product Guide',
              type: 'guide',
              content: 'Product guide content...',
              duration: 5
            }
          ],
          estimatedDuration: 8
        })
      });
    });

    await page.route('**/api/training', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trainingMaterials: [
            {
              id: 'tm-1',
              title: 'Premium Anti-Aging Serum - Sales Script',
              type: 'script',
              content: '# Sales Script\n\nIntroduce the premium serum...',
              duration: 3,
              generatedAt: new Date().toISOString(),
              product: {
                name: 'Premium Anti-Aging Serum',
                category: 'Skincare',
                price: 89.99
              }
            }
          ],
          pagination: { total: 1, hasMore: false }
        })
      });
    });
  });

  test('spa manager completes full workflow: register → login → upload → generate → view materials', async ({ page }) => {
    // 1. Visit registration page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Register');

    // 2. Fill registration form
    await page.fill('[name="name"]', 'Sarah Johnson');
    await page.fill('[name="email"]', 'sarah@luxespa.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.selectOption('[name="businessType"]', 'spa');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');

    // 3. Navigate to upload page
    await page.click('text=Upload Product');
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('Upload Product Materials');

    // 4. Upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Click to browse');
    const fileChooser = await fileChooserPromise;
    
    // Create a test file buffer
    const testFileContent = 'Premium Anti-Aging Serum with Vitamin C and Hyaluronic Acid. Price: $89.99';
    await fileChooser.setFiles({
      name: 'product-brochure.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(testFileContent),
    });

    // Wait for upload to complete
    await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 10000 });

    // 5. Configure training options
    await page.check('[name="includeScript"]');
    await page.check('[name="includeGuide"]');
    await page.fill('[name="targetAudience"]', 'Women 30-50 seeking anti-aging solutions');
    await page.selectOption('[name="tone"]', 'professional');

    // 6. Generate training materials
    await page.click('button:has-text("Generate Training Materials")');

    // Wait for processing
    await expect(page.locator('text=Generating training materials')).toBeVisible();
    await expect(page.locator('text=Training materials generated successfully')).toBeVisible({ timeout: 30000 });

    // 7. Navigate to materials page
    await page.click('text=View Materials');
    await expect(page).toHaveURL('/materials');

    // 8. Verify generated materials are displayed
    await expect(page.locator('text=Premium Anti-Aging Serum - Sales Script')).toBeVisible();
    await expect(page.locator('text=3 min')).toBeVisible(); // Duration

    // 9. View material details
    await page.click('text=Premium Anti-Aging Serum - Sales Script');
    await expect(page.locator('text=Sales Script')).toBeVisible();
    await expect(page.locator('text=Introduce the premium serum')).toBeVisible();

    // 10. Test staff interface navigation
    await page.click('text=Staff Interface');
    await expect(page).toHaveURL('/staff');
    await expect(page.locator('h1')).toContainText('Staff Training Materials');
  });

  test('handles error states gracefully', async ({ page }) => {
    // Mock upload failure
    await page.route('**/api/upload', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'File too large. Maximum size is 10MB.',
          code: 'FILE_TOO_LARGE'
        })
      });
    });

    await page.goto('/login');
    
    // Login first
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/upload');

    // Try to upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Click to browse');
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Large file content'),
    });

    // Verify error message is displayed
    await expect(page.locator('text=File too large')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('validates form inputs properly', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test invalid email
    await page.fill('[name="email"]', 'invalid-email');
    await page.blur('[name="email"]');
    await expect(page.locator('text=Invalid email format')).toBeVisible();

    // Test weak password
    await page.fill('[name="password"]', '123');
    await page.blur('[name="password"]');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('mobile navigation works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Login
    await page.fill('[name="email"]', 'test@spa.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Test bottom navigation
    await page.click('[data-testid="nav-upload"]');
    await expect(page).toHaveURL('/upload');
    
    await page.click('[data-testid="nav-materials"]');
    await expect(page).toHaveURL('/materials');
    
    await page.click('[data-testid="nav-staff"]');
    await expect(page).toHaveURL('/staff');

    // Test hamburger menu if present
    const menuButton = page.locator('[data-testid="menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      await page.click('text=Dashboard');
      await expect(page).toHaveURL('/dashboard');
    }
  });

  test('accessibility requirements are met', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for form labels
    await page.goto('/login');
    
    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');
    
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
    
    // Check focus management
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('performance metrics meet requirements', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for web vitals
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'layout-shift') {
              resolve(entry.value);
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Resolve with 0 if no layout shifts detected after 2 seconds
        setTimeout(() => resolve(0), 2000);
      });
    });
    
    // Cumulative Layout Shift should be minimal
    expect(cls).toBeLessThan(0.1);
  });
});