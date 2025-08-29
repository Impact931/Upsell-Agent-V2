import OpenAI from 'openai';
import { OpenAIError } from './errors';
import { Product, TrainingMaterial, TrainingGenerationContext, IdealClientProfile } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS = {
  script: `You are an expert sales trainer for spa and wellness businesses. Generate compelling, natural sales scripts that help staff confidently introduce and upsell products. Focus on benefits, addressing common concerns, and creating value-driven conversations. Always include wellness disclaimers where appropriate.`,
  
  guide: `You are a spa/salon business consultant. Create comprehensive product guides that help staff understand products thoroughly, including ingredients, benefits, usage instructions, and ideal customer profiles. Make it practical and easy to reference during client interactions.`,
  
  faq: `You are a customer service expert for wellness businesses. Generate frequently asked questions and professional answers that staff can use to address common client concerns about products and services. Include pricing, ingredients, contraindications, and expected results.`,
  
  objectionHandling: `You are an expert sales coach specializing in spa and wellness businesses. Create comprehensive objection handling responses that help staff address common client concerns with empathy and professionalism. Provide specific scripts for overcoming price, effectiveness, time, and trust objections. Always maintain a consultative, non-pushy approach that builds confidence and trust.`,
};

export class OpenAIService {
  private static instance: OpenAIService;
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateTrainingMaterial(
    context: TrainingGenerationContext,
    type: 'script' | 'guide' | 'faq' | 'objection-handling'
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(context, type);
      
      // Map hyphenated types to camelCase for SYSTEM_PROMPTS lookup
      const systemPromptKey = type === 'objection-handling' ? 'objectionHandling' : type;
      const systemPrompt = SYSTEM_PROMPTS[systemPromptKey as keyof typeof SYSTEM_PROMPTS];
      
      if (!systemPrompt) {
        throw new Error(`No system prompt found for type: ${type}`);
      }
      
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new OpenAIError('No content generated from OpenAI');
      }

      return this.postProcessContent(content, type, context);
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new OpenAIError('OpenAI API quota exceeded. Please check your billing.');
      }
      
      if (error.code === 'rate_limit_exceeded') {
        throw new OpenAIError('Rate limit exceeded. Please try again in a moment.');
      }
      
      throw new OpenAIError(
        `Failed to generate ${type}: ${error.message}`,
        { originalError: error.message, type }
      );
    }
  }

  async generateAllTrainingMaterials(context: TrainingGenerationContext): Promise<TrainingMaterial[]> {
    const materials: TrainingMaterial[] = [];
    const promises: Promise<TrainingMaterial>[] = [];

    if (context.includeTypes.includes('script')) {
      promises.push(this.createTrainingMaterial(context, 'script'));
    }
    
    if (context.includeTypes.includes('guide')) {
      promises.push(this.createTrainingMaterial(context, 'guide'));
    }
    
    if (context.includeTypes.includes('faq')) {
      promises.push(this.createTrainingMaterial(context, 'faq'));
    }
    
    if (context.includeTypes.includes('objection-handling')) {
      promises.push(this.createTrainingMaterial(context, 'objection-handling'));
    }

    try {
      const results = await Promise.all(promises);
      materials.push(...results);
      return materials;
    } catch (error) {
      throw new OpenAIError('Failed to generate training materials', { originalError: error });
    }
  }

  private async createTrainingMaterial(
    context: TrainingGenerationContext,
    type: 'script' | 'guide' | 'faq' | 'objection-handling'
  ): Promise<TrainingMaterial> {
    const content = await this.generateTrainingMaterial(context, type);
    
    return {
      id: this.generateId(),
      productId: context.product.id,
      userId: context.product.userId,
      title: this.generateTitle(context.product.name, type),
      content,
      type,
      duration: this.estimateDuration(content, type),
      generatedAt: new Date(),
      version: 1,
      status: 'draft',
    };
  }

  private buildPrompt(context: TrainingGenerationContext, type: string): string {
    const { product, businessType, targetAudience, tone, idealClientProfiles } = context;
    
    let prompt = `Generate a ${type} for the following product in a ${businessType} setting:\n\n`;
    prompt += `Product Name: ${product.name}\n`;
    prompt += `Description: ${product.description}\n`;
    prompt += `Price: $${product.price}\n`;
    prompt += `Category: ${product.category}\n`;
    
    if (product.ingredients && product.ingredients.length > 0) {
      prompt += `Key Ingredients: ${product.ingredients.join(', ')}\n`;
    }
    
    if (product.benefits && product.benefits.length > 0) {
      prompt += `Key Benefits: ${product.benefits.join(', ')}\n`;
    }
    
    prompt += `\nTarget Audience: ${targetAudience || product.targetAudience || 'General wellness clients'}\n`;
    prompt += `Tone: ${tone}\n`;
    prompt += `Business Type: ${businessType}\n`;

    // Add ICP context if available
    if (idealClientProfiles && idealClientProfiles.length > 0) {
      prompt += `\n--- IDEAL CLIENT PROFILES ---\n`;
      prompt += `Use these Ideal Client Profiles to create targeted, personalized content:\n\n`;
      
      idealClientProfiles.forEach((icp, index) => {
        prompt += `ICP ${index + 1}: ${icp.title}\n`;
        prompt += `- Age: ${icp.demographics.ageRange}, Income: ${icp.demographics.income}\n`;
        prompt += `- Lifestyle: ${icp.demographics.lifestyle}\n`;
        prompt += `- Pain Points: ${icp.painPoints.join(', ')}\n`;
        prompt += `- Motivations: ${icp.motivations.join(', ')}\n`;
        prompt += `- Preferred Tone: ${icp.preferredTone}\n\n`;
      });
      
      prompt += `Create content that addresses these specific customer profiles, their pain points, and motivations.\n\n`;
    }

    switch (type) {
      case 'script':
        if (idealClientProfiles && idealClientProfiles.length > 0) {
          prompt += `Create a comprehensive sales script that can be adapted for different client types. Include:\n`;
          prompt += `- Opening lines that resonate with each ICP\n`;
          prompt += `- Benefit highlights that address specific pain points\n`;
          prompt += `- Price presentation techniques for different income levels\n`;
          prompt += `- Closing techniques that match each ICP's decision-making style\n`;
          prompt += `Make it natural and consultative, with specific approaches for each customer persona.`;
        } else {
          prompt += `Create a natural, conversational sales script that staff can use to introduce and upsell this product. Include opening lines, benefit highlights, price presentation, and closing techniques. Make it sound natural and consultative, not pushy.`;
        }
        break;
      
      case 'guide':
        prompt += `Create a comprehensive product guide that staff can reference. Include product details, usage instructions, ideal clients, contraindications (if any), and tips for successful recommendations.`;
        if (idealClientProfiles && idealClientProfiles.length > 0) {
          prompt += ` Reference the specific ICPs and how to identify which clients match each profile.`;
        }
        break;
      
      case 'faq':
        if (idealClientProfiles && idealClientProfiles.length > 0) {
          prompt += `Generate 8-10 frequently asked questions about this product with professional, informative answers. Include questions that each ICP is likely to ask based on their pain points and concerns. Cover ingredients, results, pricing, usage, and address the specific concerns of each customer persona.`;
        } else {
          prompt += `Generate 8-10 frequently asked questions about this product with professional, informative answers. Include questions about ingredients, results, pricing, usage, and any concerns clients might have.`;
        }
        break;
      
      case 'objection-handling':
        if (idealClientProfiles && idealClientProfiles.length > 0) {
          prompt += `Create comprehensive objection handling responses for common client concerns about this product. Structure your response to address each ICP's specific objections:\n\n`;
          
          idealClientProfiles.forEach((icp, index) => {
            prompt += `**For ${icp.title}:**\n`;
            prompt += `- Address price concerns relevant to their ${icp.demographics.income} income level\n`;
            prompt += `- Counter effectiveness doubts based on their lifestyle: ${icp.demographics.lifestyle}\n`;
            prompt += `- Handle time/convenience objections\n`;
            prompt += `- Build trust using their preferred ${icp.preferredTone} communication style\n\n`;
          });
          
          prompt += `Additionally, provide general objection handling for:\n`;
          prompt += `- "It's too expensive" objections\n`;
          prompt += `- "I need to think about it" delays\n`;
          prompt += `- "Does this really work?" skepticism\n`;
          prompt += `- "I don't have time" concerns\n\n`;
          prompt += `Format as clear, actionable responses staff can use immediately. Include the exact words to say and the reasoning behind each response.`;
        } else {
          prompt += `Create comprehensive responses to common client objections about this product. Include specific scripts for:\n`;
          prompt += `- Price objections ("It's too expensive", "I can't afford it")\n`;
          prompt += `- Effectiveness concerns ("Does this really work?", "I've tried similar products before")\n`;
          prompt += `- Time objections ("I don't have time", "I'm too busy")\n`;
          prompt += `- Decision delays ("I need to think about it", "I'll come back later")\n`;
          prompt += `- Trust issues ("I'm not sure about this", "Is this right for me?")\n\n`;
          prompt += `For each objection, provide the exact response words and explain the psychology behind why it works. Make responses empathetic, professional, and focused on value rather than pressure.`;
        }
        break;
    }

    prompt += `\n\nIMPORTANT: Include appropriate wellness disclaimers. Avoid making medical claims. Focus on wellness benefits and customer satisfaction.`;
    
    return prompt;
  }

  private postProcessContent(content: string, type: string, context: TrainingGenerationContext): string {
    // Add standard disclaimer
    const disclaimer = this.getDisclaimer(context.businessType);
    
    // Format content based on type
    let formattedContent = content.trim();
    
    // Add disclaimer at the end
    formattedContent += `\n\n---\n${disclaimer}`;
    
    return formattedContent;
  }

  private getDisclaimer(businessType: string): string {
    return `**Disclaimer**: This information is for general wellness purposes only and does not constitute medical advice. Individual results may vary. Please consult with a healthcare provider for specific concerns. All ${businessType} services and products are intended for wellness and relaxation purposes.`;
  }

  private generateTitle(productName: string, type: string): string {
    const typeLabels = {
      script: 'Sales Script',
      guide: 'Product Guide',
      faq: 'FAQ Guide',
      'objection-handling': 'Objection Handling Guide',
    };
    
    return `${productName} - ${typeLabels[type as keyof typeof typeLabels]}`;
  }

  private estimateDuration(content: string, type: string): number {
    // Estimate reading/training time in minutes based on content length and type
    const wordCount = content.split(/\s+/).length;
    const baseMultipliers = {
      script: 0.5, // Scripts are for quick reference
      guide: 1, // Guides need thorough reading
      faq: 0.75, // FAQs are reference material
      'objection-handling': 0.75, // Quick reference for responses
    };
    
    const wordsPerMinute = 200;
    const baseDuration = wordCount / wordsPerMinute;
    const multiplier = baseMultipliers[type as keyof typeof baseMultipliers] || 1;
    
    return Math.max(1, Math.round(baseDuration * multiplier));
  }

  private generateId(): string {
    return `tm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate content using OpenAI
  async generateContent(prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert sales trainer and content creator for wellness businesses. Generate comprehensive, professional training content that helps staff excel in their roles.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new OpenAIError('No content generated from OpenAI');
      }

      return content;
    } catch (error: any) {
      console.error('OpenAI content generation error:', error);
      throw new OpenAIError('Failed to generate content', { originalError: error.message });
    }
  }

  // Extract product information from text using OpenAI
  async extractProductInfo(text: string): Promise<Partial<Product>> {
    try {
      const prompt = `Extract product information from the following text and return it in JSON format. Include name, description, price (if mentioned), category, ingredients (if listed), and benefits (if mentioned). If information is not available, omit the field or set it to null.

Text: ${text}

Return only valid JSON:`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a product information extraction assistant. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new OpenAIError('No content generated for product extraction');
      }

      try {
        return JSON.parse(content);
      } catch {
        // If JSON parsing fails, return basic extracted info
        return {
          name: text.split('\n')[0]?.trim() || 'Unknown Product',
          description: text.substring(0, 500),
        };
      }
    } catch (error: any) {
      console.error('Product extraction error:', error);
      throw new OpenAIError('Failed to extract product information', { originalError: error.message });
    }
  }

  // Generate Ideal Client Profiles (ICPs) based on product information
  async generateIdealClientProfiles(productText: string, product?: Partial<Product>): Promise<IdealClientProfile[]> {
    try {
      const prompt = `Based on the following product information, generate 3 unique Ideal Client Profiles (ICPs) for potential customers who would benefit from this product.

Product Information:
${productText}

${product ? `
Product Name: ${product.name || 'Unknown'}
Price: $${product.price || 'Not specified'}
Category: ${product.category || 'General'}
Benefits: ${product.benefits ? product.benefits.join(', ') : 'Various benefits'}
` : ''}

For each ICP, provide detailed information in JSON format with the following structure:
{
  "title": "Descriptive persona name (e.g., 'Busy Professional Mom')",
  "demographics": {
    "ageRange": "age range",
    "income": "income level",
    "lifestyle": "lifestyle description",
    "location": "location type (optional)",
    "occupation": "occupation type (optional)"
  },
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "motivations": ["motivation 1", "motivation 2", "motivation 3"],
  "preferredTone": "professional|casual|consultative"
}

Generate exactly 3 distinct ICPs that represent different customer segments. Make them realistic, specific, and actionable for sales training.

CRITICAL FORMATTING REQUIREMENTS:
- Return ONLY a valid JSON array with no markdown formatting
- Use proper double quotes for all strings
- Do not include line breaks within string values
- Ensure all objects are properly comma-separated
- Include all required fields for each ICP

Return as a clean JSON array like this format:
[{"title": "Name", "demographics": {...}, "painPoints": [...], "motivations": [...], "preferredTone": "professional"}]`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are a customer persona expert for wellness businesses. Generate realistic, actionable Ideal Client Profiles based on product information. You MUST return only valid JSON arrays with no markdown, no comments, no additional text. Use proper JSON formatting with double quotes and no line breaks within string values.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.8, // Higher creativity for diverse personas
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new OpenAIError('No content generated for ICP creation');
      }

      // Declare cleanedContent at function scope to avoid undefined reference in catch block
      let cleanedContent = '';

      try {
        // Clean the content to handle markdown-wrapped JSON
        cleanedContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Remove any additional whitespace
        cleanedContent = cleanedContent.trim();
        
        // Fix common JSON formatting issues only if not already properly formatted
        if (!cleanedContent.match(/^[\s]*[\[\{]/)) {
          // Not starting with [ or {, might need more cleaning
          cleanedContent = cleanedContent.replace(/^[^[\{]*/, ''); // Remove leading non-JSON text
        }
        
        // Remove control characters and fix line breaks within strings
        cleanedContent = cleanedContent
          .replace(/\r?\n/g, ' ') // Replace line breaks with spaces
          .replace(/\t/g, ' ') // Replace tabs with spaces
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\s+/g, ' '); // Normalize multiple spaces
        
        // Fix common JSON issues with aggressive cleaning
        cleanedContent = cleanedContent
          // Remove comments and malformed fields that start with $ or _comment_
          .replace(/"[_$][^"]*":\s*"[^"]*",?\s*/g, '')
          .replace(/"[_$][^"]*":\s*\[[^\]]*\],?\s*/g, '')
          // Fix triple quotes and multiple consecutive quotes
          .replace(/"{2,}/g, '"')
          // Fix escaped quotes within the JSON (common OpenAI issue)
          .replace(/\\"/g, '"')
          // Fix malformed quoted keys like \"motivations\" -> "motivations"
          .replace(/\\"([a-zA-Z_][a-zA-Z0-9_]*)\\"/g, '"$1"')
          // Remove any text that looks like escaped dollar signs or weird characters
          .replace(/\$[^"]*\$/g, '')
          // Clean up malformed fields with dollar signs
          .replace(/"\$[^"]*":\s*"[^"]*",?\s*/g, '')
          .replace(/"\$[^"]*":\s*\[[^\]]*\],?\s*/g, '')
          // Add quotes around unquoted keys
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          // Fix unquoted string values
          .replace(/:\s*([^",\[\{][^",\}\]]*?)\s*([,\}\]])/g, (match, value, ending) => {
            // Don't quote if it's already a number, boolean, or null
            if (/^(true|false|null|\d+\.?\d*)$/.test(value.trim())) {
              return `: ${value.trim()}${ending}`;
            }
            return `: "${value.trim()}"${ending}`;
          })
          // Replace single quotes with double quotes (but be careful about apostrophes)
          .replace(/'/g, '"')
          // Remove trailing commas before ] or }
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix missing commas between array elements
          .replace(/}\s*{/g, '}, {')
          // Fix missing commas between object properties  
          .replace(/"\s*"([a-zA-Z])/g, '", "$1')
          // Fix malformed object structures with empty fields
          .replace(/,\s*,/g, ',')
          .replace(/{\s*,/g, '{')
          .replace(/,\s*}/g, '}');
        
        const icpsData = JSON.parse(cleanedContent);
        
        // Validate that we got an array of ICPs (allow 1-5 ICPs for flexibility)
        if (!Array.isArray(icpsData) || icpsData.length === 0 || icpsData.length > 5) {
          throw new Error(`Expected array of 1-5 ICPs, got ${Array.isArray(icpsData) ? icpsData.length : 'not an array'}`);
        }

        // Convert to IdealClientProfile objects with additional fields and validation
        const icps: IdealClientProfile[] = icpsData.map((icp: any, index: number) => {
          // Ensure painPoints and motivations are arrays and not empty
          const painPoints = Array.isArray(icp.painPoints) && icp.painPoints.length > 0
            ? icp.painPoints
            : ['Seeking effective solutions for their needs', 'Looking for quality products that deliver results', 'Want value for their investment'];
          
          const motivations = Array.isArray(icp.motivations) && icp.motivations.length > 0
            ? icp.motivations
            : ['Achieve personal wellness goals', 'Experience high-quality treatments', 'Invest in long-term health and beauty'];

          return {
            id: this.generateId(),
            productId: product?.id || '',
            userId: product?.userId || '',
            title: icp.title || `Customer Persona ${index + 1}`,
            demographics: icp.demographics || {},
            painPoints,
            motivations,
            preferredTone: icp.preferredTone || 'professional',
            generatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });

        return icps;
      } catch (parseError) {
        console.error('Failed to parse ICP JSON:', parseError, 'Original content:', content);
        console.error('Cleaned content that failed to parse:', cleanedContent || 'undefined');
        
        // Try multiple fallback approaches
        try {
          let finalAttempt = content.trim();
          
          // First, try extracting just the array part
          const arrayMatch = finalAttempt.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            try {
              finalAttempt = arrayMatch[0];
              
              // Apply aggressive cleaning to the extracted array
              finalAttempt = finalAttempt
                .replace(/\r?\n/g, ' ')
                .replace(/\t/g, ' ')
                .replace(/[\x00-\x1F\x7F]/g, '')
                .replace(/\s+/g, ' ')
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
                .replace(/:\s*([^",\[\{][^",\}\]]*?)\s*([,\}\]])/g, (match, value, ending) => {
                  if (/^(true|false|null|\d+\.?\d*)$/.test(value.trim())) {
                    return `: ${value.trim()}${ending}`;
                  }
                  return `: "${value.trim()}"${ending}`;
                })
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/}\s*{/g, '}, {');
                
              const icpsData = JSON.parse(finalAttempt);
              
              if (Array.isArray(icpsData) && icpsData.length > 0) {
                const icps: IdealClientProfile[] = icpsData.map((icp: any, index: number) => ({
                  id: this.generateId(),
                  productId: product?.id || '',
                  userId: product?.userId || '',
                  title: icp.title || `Customer Persona ${index + 1}`,
                  demographics: icp.demographics || {},
                  painPoints: icp.painPoints || [],
                  motivations: icp.motivations || [],
                  preferredTone: icp.preferredTone || 'professional',
                  generatedAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }));
                
                console.log('Successfully parsed ICPs on second attempt with aggressive cleaning');
                return icps;
              }
            } catch (arrayParseError) {
              console.error('Array extraction failed:', arrayParseError);
              
              // Try even more aggressive approach - manually construct JSON from patterns
              try {
                const titleMatches = content.match(/"title":\s*"([^"]+)"/g) || [];
                if (titleMatches.length >= 1) {
                  console.log('Attempting manual ICP construction from title matches');
                  const manualICPs: IdealClientProfile[] = titleMatches.slice(0, 3).map((titleMatch, index) => {
                    const title = titleMatch.match(/"title":\s*"([^"]+)"/)?.[1] || `Customer Persona ${index + 1}`;
                    return {
                      id: this.generateId(),
                      productId: product?.id || '',
                      userId: product?.userId || '',
                      title,
                      demographics: {
                        ageRange: '25-50',
                        income: 'Various',
                        lifestyle: 'Wellness-focused'
                      },
                      painPoints: ['Product concerns', 'Value questions', 'Trust issues'],
                      motivations: ['Health improvement', 'Self-care', 'Quality products'],
                      preferredTone: 'professional' as const,
                      generatedAt: new Date(),
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                  });
                  
                  console.log(`Manually constructed ${manualICPs.length} ICPs from partial data`);
                  return manualICPs;
                }
              } catch (manualError) {
                console.error('Manual construction failed:', manualError);
              }
            }
          }
        } catch (secondAttemptError) {
          console.error('All fallback parsing attempts failed:', secondAttemptError);
        }
        
        // Return fallback ICPs if all parsing fails
        console.log('Using fallback ICPs due to parsing failures');
        return this.generateFallbackICPs(product);
      }
    } catch (error: any) {
      console.error('ICP generation error:', error);
      
      // Always return fallback ICPs instead of throwing error to prevent upload failures
      console.log('Generating fallback ICPs due to complete failure');
      try {
        return this.generateFallbackICPs(product);
      } catch (fallbackError) {
        // If even fallback fails, return minimal ICPs
        console.error('Fallback ICP generation failed:', fallbackError);
        return [{
          id: this.generateId(),
          productId: product?.id || '',
          userId: product?.userId || '',
          title: 'General Customer',
          demographics: { ageRange: '25-50', income: 'Medium', lifestyle: 'Health-conscious', location: 'Various', occupation: 'Various' },
          painPoints: ['Looking for quality products', 'Seeking effective solutions', 'Want value for investment'],
          motivations: ['Improve wellness', 'Achieve goals', 'Feel confident'],
          preferredTone: 'professional',
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
      }
    }
  }

  // Generate fallback ICPs if AI generation fails
  private generateFallbackICPs(product?: Partial<Product>): IdealClientProfile[] {
    const baseICP = {
      productId: product?.id || '',
      userId: product?.userId || '',
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return [
      {
        ...baseICP,
        id: this.generateId(),
        title: 'Health-Conscious Professional',
        demographics: {
          ageRange: '25-45',
          income: 'Middle to Upper-Middle Class',
          lifestyle: 'Busy professional seeking wellness solutions',
        },
        painPoints: ['Limited time for self-care', 'Work stress', 'Seeking quick effective solutions'],
        motivations: ['Health improvement', 'Stress relief', 'Professional appearance'],
        preferredTone: 'professional' as const,
      },
      {
        ...baseICP,
        id: this.generateId(),
        title: 'Wellness Enthusiast',
        demographics: {
          ageRange: '30-55',
          income: 'Disposable income for wellness',
          lifestyle: 'Active wellness-focused lifestyle',
        },
        painPoints: ['Finding quality products', 'Maintaining routine', 'Product effectiveness'],
        motivations: ['Holistic wellness', 'Natural solutions', 'Self-investment'],
        preferredTone: 'consultative' as const,
      },
      {
        ...baseICP,
        id: this.generateId(),
        title: 'Self-Care Seeker',
        demographics: {
          ageRange: '35-65',
          income: 'Values quality over price',
          lifestyle: 'Prioritizes personal care and relaxation',
        },
        painPoints: ['Aging concerns', 'Finding reliable products', 'Time for self-care'],
        motivations: ['Self-care routine', 'Quality results', 'Personal pampering'],
        preferredTone: 'casual' as const,
      },
    ];
  }
}

export const openaiService = OpenAIService.getInstance();