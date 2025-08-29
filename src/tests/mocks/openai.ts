import { vi } from 'vitest';

export const mockOpenAIResponse = {
  choices: [{
    message: {
      content: `# Sales Script: Premium Facial Serum

## Introduction
"I noticed you enjoyed your facial today. Based on your skin's response and what you've shared about your skincare goals, I'd love to introduce you to our Premium Facial Serum that I think would be perfect for you."

## Product Benefits
"This serum contains vitamin C and hyaluronic acid, which will help maintain that glowing complexion we achieved today. Many of our clients see visible improvements in skin texture and hydration within just two weeks."

## Value Proposition
"For $89, this serum provides a 60-day supply, which breaks down to less than $1.50 per day for professional-grade skincare. When you consider the cost of frequent facials, this extends your results significantly."

## Closing
"Would you like me to set one aside for you today? I can also show you the best application technique to maximize the benefits."

---
**Disclaimer**: This information is for general wellness purposes only and does not constitute medical advice. Individual results may vary. Please consult with a healthcare provider for specific concerns. All spa services and products are intended for wellness and relaxation purposes.`
    }
  }]
};

export const mockOpenAIService = {
  generateTrainingMaterial: vi.fn().mockResolvedValue(mockOpenAIResponse.choices[0].message.content),
  generateAllTrainingMaterials: vi.fn().mockResolvedValue([
    {
      id: 'tm_1234567890_abc123456',
      productId: 'test-product-id',
      userId: 'test-user-id',
      title: 'Test Product - Sales Script',
      content: mockOpenAIResponse.choices[0].message.content,
      type: 'script',
      duration: 3,
      generatedAt: new Date(),
      version: 1,
      status: 'draft',
    }
  ]),
  extractProductInfo: vi.fn().mockResolvedValue({
    name: 'Premium Facial Serum',
    description: 'Advanced anti-aging serum with vitamin C',
    price: 89.99,
    category: 'Skincare',
    ingredients: ['vitamin C', 'hyaluronic acid'],
    benefits: ['anti-aging', 'hydrating']
  })
};

export const mockOpenAIError = {
  code: 'rate_limit_exceeded',
  message: 'Rate limit exceeded',
  type: 'requests'
};

export const mockOpenAIQuotaError = {
  code: 'insufficient_quota',
  message: 'You exceeded your current quota',
  type: 'insufficient_quota'
};