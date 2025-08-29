import { createWorker } from 'tesseract.js';
import PDFParse from 'pdf-parse';
import sharp from 'sharp';
import { FileProcessingError } from './errors';
import { openaiService } from './openai';
import { Product } from '@/types';

export interface ProcessedFileData {
  text: string;
  extractedProduct?: Partial<Product>;
  confidence: number;
  processingTime: number;
}

export class FileProcessor {
  private static instance: FileProcessor;
  
  public static getInstance(): FileProcessor {
    if (!FileProcessor.instance) {
      FileProcessor.instance = new FileProcessor();
    }
    return FileProcessor.instance;
  }

  async processFile(file: File): Promise<ProcessedFileData> {
    const startTime = Date.now();
    
    try {
      let text = '';
      let confidence = 0;

      switch (file.type) {
        case 'application/pdf':
          ({ text, confidence } = await this.processPDF(file));
          break;
        
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/png':
          ({ text, confidence } = await this.processImage(file));
          break;
        
        case 'text/plain':
          ({ text, confidence } = await this.processText(file));
          break;
        
        default:
          throw new FileProcessingError(`Unsupported file type: ${file.type}`);
      }

      if (!text.trim()) {
        throw new FileProcessingError('No text content could be extracted from the file');
      }

      // Extract product information using AI
      const extractedProduct = await openaiService.extractProductInfo(text);

      const processingTime = Date.now() - startTime;

      return {
        text: text.trim(),
        extractedProduct,
        confidence,
        processingTime,
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      if (error instanceof FileProcessingError) {
        throw error;
      }
      
      throw new FileProcessingError(
        `Failed to process file: ${error.message}`,
        { originalError: error.message, processingTime }
      );
    }
  }

  private async processPDF(file: File): Promise<{ text: string; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(arrayBuffer));
      
      if (!data.text.trim()) {
        throw new FileProcessingError('PDF appears to be empty or contains no extractable text');
      }

      return {
        text: data.text,
        confidence: 0.95, // PDF text extraction is generally reliable
      };
    } catch (error: any) {
      throw new FileProcessingError(`PDF processing failed: ${error.message}`);
    }
  }

  private async processImage(file: File): Promise<{ text: string; confidence: number }> {
    let worker: Tesseract.Worker | null = null;
    
    try {
      // Optimize image for OCR
      const optimizedImage = await this.optimizeImageForOCR(file);
      
      // Initialize Tesseract worker
      worker = await createWorker();
      
      // Perform OCR
      const { data } = await worker.recognize(optimizedImage);
      
      if (!data.text.trim()) {
        throw new FileProcessingError('No text could be extracted from the image');
      }

      return {
        text: data.text,
        confidence: data.confidence / 100, // Convert to 0-1 scale
      };
    } catch (error: any) {
      throw new FileProcessingError(`Image OCR failed: ${error.message}`);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  private async processText(file: File): Promise<{ text: string; confidence: number }> {
    try {
      const text = await file.text();
      
      if (!text.trim()) {
        throw new FileProcessingError('Text file is empty');
      }

      return {
        text,
        confidence: 1.0, // Text files have perfect confidence
      };
    } catch (error: any) {
      throw new FileProcessingError(`Text file processing failed: ${error.message}`);
    }
  }

  private async optimizeImageForOCR(file: File): Promise<Buffer> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Optimize image for better OCR results
      const optimizedBuffer = await sharp(inputBuffer)
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();

      return optimizedBuffer;
    } catch (error: any) {
      throw new FileProcessingError(`Image optimization failed: ${error.message}`);
    }
  }

  // Validate extracted text quality
  validateTextQuality(text: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const minLength = 50;
    const maxGarbageRatio = 0.3;

    // Check minimum length
    if (text.length < minLength) {
      issues.push('Text is too short for meaningful product information');
    }

    // Check for excessive garbage characters
    const garbageChars = text.match(/[^\w\s\-.,!?@#$%&*()\[\]{}:;"']/g) || [];
    const garbageRatio = garbageChars.length / text.length;
    
    if (garbageRatio > maxGarbageRatio) {
      issues.push('Text contains too many unrecognizable characters');
    }

    // Check for repeated patterns (common OCR issue)
    const repeatedPatterns = text.match(/(.{3,})\1{3,}/g);
    if (repeatedPatterns && repeatedPatterns.length > 0) {
      issues.push('Text contains repeated patterns, possibly due to OCR errors');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // Clean and normalize extracted text
  cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common OCR artifacts
      .replace(/[|]/g, 'I')
      .replace(/[0O]/g, 'O')
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Remove trailing spaces
      .replace(/[ \t]+$/gm, '')
      // Trim overall
      .trim();
  }

  // Generate fallback product data when extraction fails
  generateFallbackProductData(filename: string): Partial<Product> {
    const cleanName = filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case

    return {
      name: cleanName,
      description: `Product information extracted from ${filename}. Please review and update as needed.`,
      category: 'General',
    };
  }
}

export const fileProcessor = FileProcessor.getInstance();