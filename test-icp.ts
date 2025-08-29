// Test script to verify ICP generation functionality
import { openaiService } from './src/lib/openai';

async function testICPGeneration() {
  const testProductText = `
Advanced Anti-Aging Serum with Retinol
Price: $89
This powerful serum contains 1.5% retinol, hyaluronic acid, and vitamin C to reduce fine lines and wrinkles. 
Suitable for all skin types. Apply 2-3 times per week in the evening.
Helps improve skin texture, reduces age spots, and promotes cellular renewal.
Results visible in 4-6 weeks with consistent use.
`;

  try {
    console.log('Testing ICP generation...');
    const icps = await openaiService.generateIdealClientProfiles(testProductText, {
      id: 'test-product-id',
      userId: 'test-user-id',
      name: 'Advanced Anti-Aging Serum',
      price: 89,
    });

    console.log('\n🎉 ICP Generation Successful!');
    console.log(`Generated ${icps.length} Ideal Client Profiles:\n`);

    icps.forEach((icp, index) => {
      console.log(`--- ICP ${index + 1}: ${icp.title} ---`);
      console.log(`Demographics: ${JSON.stringify(icp.demographics, null, 2)}`);
      console.log(`Pain Points: ${icp.painPoints.join(', ')}`);
      console.log(`Motivations: ${icp.motivations.join(', ')}`);
      console.log(`Preferred Tone: ${icp.preferredTone}`);
      console.log('');
    });

    return true;
  } catch (error) {
    console.error('❌ ICP Generation Failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testICPGeneration();
}

export { testICPGeneration };