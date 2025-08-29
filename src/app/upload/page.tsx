'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { useAuth, useRequireAuth } from '@/contexts/AuthContext';
import { Header, BottomNav } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Progress, LoadingSpinner } from '@/components/ui';
import { EnhancedFileUpload, UploadResult } from '@/components/EnhancedFileUpload';
import { useTrainingApi } from '@/hooks';
import { toast } from 'react-hot-toast';

// Generate a UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface TrainingOptions {
  includeScript: boolean;
  includeGuide: boolean;
  includeFAQ: boolean;
  includeObjectionHandling: boolean;
  targetAudience: string;
  tone: 'professional' | 'friendly' | 'casual';
}

const DEFAULT_TRAINING_OPTIONS: TrainingOptions = {
  includeScript: true,
  includeGuide: true,
  includeFAQ: true,
  includeObjectionHandling: false,
  targetAudience: 'general',
  tone: 'professional',
};

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    name: 'File Upload',
    description: 'Uploading and validating product files',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'extraction',
    name: 'Content Analysis',
    description: 'Extracting product specifications and details',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'icp_generation',
    name: 'ICP Generation',
    description: 'AI analyzing product to create Ideal Client Profiles',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'tone_analysis',
    name: 'Tone Optimization',
    description: 'Determining optimal communication approach for each client type',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'specialized_generation',
    name: 'Specialized Content Creation',
    description: 'Generating personalized training materials for each client persona',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'finalization',
    name: 'Quality Assurance',
    description: 'Finalizing and organizing your customized training materials',
    status: 'pending',
    progress: 0,
  },
];

export default function UploadPage() {
  useRequireAuth('manager'); // Only managers can upload

  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'completed'>('upload');
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [trainingOptions, setTrainingOptions] = useState<TrainingOptions>(DEFAULT_TRAINING_OPTIONS);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS);
  const [sessionId, setSessionId] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [textContent, setTextContent] = useState<{ productName: string; productDescription: string; recommendedPrice: string }>({
    productName: '',
    productDescription: '',
    recommendedPrice: ''
  });
  
  const router = useRouter();
  const { generateTraining, isGenerating } = useTrainingApi();

  // Calculate overall progress
  const overallProgress = processingSteps.reduce((sum, step) => sum + step.progress, 0) / processingSteps.length;

  useEffect(() => {
    if (currentStep === 'processing') {
      simulateProcessing();
    }
  }, [currentStep]);

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResults(prev => [...prev, result]);
    setSessionId(result.sessionId);
    
    // Estimate processing time based on file size and complexity
    const estimatedMinutes = Math.max(3, Math.min(15, uploadResults.length * 3)); // Longer for enhanced AI workflow
    setEstimatedTime(estimatedMinutes * 60); // Convert to seconds
    
    toast.success('File uploaded successfully! Click "Generate Training Materials" when ready to process.');
  };

  const handleContentChange = (content: { productName: string; productDescription: string; recommendedPrice: string }) => {
    setTextContent(content);
  };

  const handleStagedUploadSubmit = async (files: any[], productData: { productName: string; productDescription: string; recommendedPrice: string }) => {
    console.log('handleStagedUploadSubmit called with:', {
      filesCount: files.length,
      productData: productData
    });
    
    // Update text content with submitted data
    setTextContent(productData);
    
    // Create formData for each file and upload them
    try {
      const token = Cookies.get('upsell_agent_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const uploadPromises = files.map(async (uploadFile) => {
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        
        // Add product metadata to each upload
        formData.append('productName', productData.productName);
        formData.append('productDescription', productData.productDescription);
        formData.append('recommendedPrice', productData.recommendedPrice);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 409) {
            throw new Error(`${errorData.message || 'A product with this name already exists. Please use a different name.'}`);
          }
          throw new Error('Upload failed');
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      
      // Set upload results and proceed to completed state
      setUploadResults(results);
      if (results.length > 0) {
        setSessionId(results[0].sessionId);
      }
      
      toast.success('Training materials generated successfully!');
      setCurrentStep('completed');
      
    } catch (error: any) {
      console.error('Staged upload error:', error);
      const errorMessage = error.message || 'Failed to upload files';
      toast.error(errorMessage);
    }
  };

  const handleStartProcessing = async () => {
    // Product name is always required
    if (!textContent.productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    const hasFiles = uploadResults.length > 0;
    const hasTextContent = textContent.productDescription.trim() !== '' || textContent.recommendedPrice.trim() !== '';
    
    if (!hasFiles && !hasTextContent) {
      toast.error('Please either upload files or provide additional product information (description or price)');
      return;
    }

    setCurrentStep('processing');
    setStartTime(Date.now());

    try {
      let currentSessionId = sessionId;
      
      // For text-only submissions, we need to create product data and send it differently
      if (!hasFiles && hasTextContent) {
        // Create product data from text inputs - sanitize strings to avoid validation errors
        const sanitizeString = (str: string) => {
          return str.replace(/[<>"'&]/g, '').trim();
        };

        const description = textContent.productDescription.trim();
        const sanitizedDescription = description ? sanitizeString(description) : 'Product details to be provided';
        
        const productData = {
          name: sanitizeString(textContent.productName.trim()),
          description: sanitizedDescription.length >= 10 ? sanitizedDescription : 'Product details to be provided',
          category: 'General',
          price: textContent.recommendedPrice.trim() ? Math.max(0.01, parseFloat(textContent.recommendedPrice.trim()) || 0.01) : 0.01,
        };

        // Create a temporary upload session for text-only submissions to use the same workflow as files
        const token = Cookies.get('upsell_agent_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Create an upload session that simulates a text file upload
        const sessionResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: `${productData.name.replace(/[^a-zA-Z0-9]/g, '_')}_product_info.txt`,
            fileType: 'text',
            fileSize: JSON.stringify(productData).length,
            extractedData: {
              extractedProduct: productData,
              userProvidedData: productData,
              text: `Product: ${productData.name}\n\nDescription: ${productData.description}\n\nPrice: $${productData.price}`,
            },
          }),
        });

        if (!sessionResponse.ok) {
          const sessionErrorData = await sessionResponse.json().catch(() => ({}));
          console.error('Session creation error:', sessionErrorData);
          
          // Handle duplicate product error specifically
          if (sessionResponse.status === 409) {
            throw new Error(`${sessionErrorData.message || 'A product with this name already exists. Please use a different name.'}`);
          }
          
          throw new Error('Failed to create upload session for text submission');
        }

        const sessionResult = await sessionResponse.json();
        currentSessionId = sessionResult.sessionId;
        setSessionId(currentSessionId);
        
        // For text-only submissions, the upload API already generated everything
        // Skip the generateTraining call and go directly to completed state
        toast.success('Training materials generated successfully!');
        setCurrentStep('completed');
      } else {
        // For file uploads or mixed submissions, use the existing flow
        currentSessionId = sessionId || `session-${Date.now()}`;
        if (!sessionId) {
          setSessionId(currentSessionId);
        }
        
        // Start the training generation process
        await generateTraining(currentSessionId, trainingOptions);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      
      // Reset processing state
      setCurrentStep('upload');
      setStartTime(0);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to start training generation';
      toast.error(errorMessage);
      
      // If it's a specific API error, provide more context
      if (errorMessage.includes('422') || errorMessage.includes('Unprocessable')) {
        toast.error('There was an issue processing your product data. Please try again or contact support.');
      }
    }
  };

  const simulateProcessing = () => {
    const steps = [...processingSteps];
    let currentStepIndex = 0;

    const updateSteps = () => {
      if (currentStepIndex >= steps.length) {
        setCurrentStep('completed');
        toast.success('Training materials generated successfully!');
        return;
      }

      const step = steps[currentStepIndex];
      
      // Mark current step as processing
      step.status = 'processing';
      setProcessingSteps([...steps]);

      // Simulate progress with more realistic timing for AI-intensive steps
      let progress = 0;
      const stepTimings = {
        'upload': { interval: 200, increment: 25 }, // Fast
        'extraction': { interval: 400, increment: 15 }, // Medium
        'icp_generation': { interval: 800, increment: 8 }, // Slower for AI processing
        'tone_analysis': { interval: 600, increment: 12 }, // Medium-slow
        'specialized_generation': { interval: 1000, increment: 6 }, // Slowest for specialized content
        'finalization': { interval: 300, increment: 20 }, // Fast
      };
      
      const timing = stepTimings[step.id as keyof typeof stepTimings] || { interval: 500, increment: 10 };
      
      const progressInterval = setInterval(() => {
        progress += Math.random() * timing.increment + 2;
        
        if (progress >= 100) {
          progress = 100;
          step.progress = progress;
          step.status = 'completed';
          setProcessingSteps([...steps]);
          clearInterval(progressInterval);
          
          currentStepIndex++;
          setTimeout(updateSteps, 800); // Longer pause for AI steps
        } else {
          step.progress = progress;
          setProcessingSteps([...steps]);
        }
      }, timing.interval);
    };

    updateSteps();
  };

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedTime = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--neutral-50)' }}>
      <Header />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="heading-2">Create New Upsell Product</h1>
              {currentStep === 'processing' && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Elapsed: {formatTime(elapsedTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Remaining: ~{formatTime(remainingTime)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {[
                { key: 'upload', label: 'Upload' },
                { key: 'processing', label: 'AI Processing' },
                { key: 'completed', label: 'Completed' },
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep === step.key 
                      ? 'bg-teal-600 text-white' 
                      : index < ['upload', 'processing', 'completed'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index < ['upload', 'processing', 'completed'].indexOf(currentStep) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.label}</span>
                  {index < 3 && <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Step */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    New Upsell Product
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-base mb-6" style={{ color: 'var(--neutral-600)' }}>
                    Describe your product or service and upload supporting materials. Our AI will analyze 
                    everything to create ideal client profiles and generate personalized training materials.
                  </p>
                  
                  <EnhancedFileUpload
                    onUploadComplete={undefined}
                    onContentChange={handleContentChange}
                    onSubmit={handleStagedUploadSubmit}
                    maxFiles={5}
                    className="mb-6"
                    showSubmitButton={true}
                  />

                  {/* Old Submit Button - Hidden when using staged workflow */}

                  {uploadResults.length > 0 && (
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
                      <h3 className="heading-4 mb-4">Uploaded Files</h3>
                      <div className="space-y-3">
                        {uploadResults.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">{result.fileName}</p>
                                <p className="text-sm text-green-700">
                                  {result.extractedData?.products?.length 
                                    ? `${result.extractedData.products.length} products detected`
                                    : 'Content extracted successfully'
                                  }
                                </p>
                              </div>
                            </div>
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                        ))}
                      </div>
                      
                      {currentStep === 'processing' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                            <h4 className="font-semibold text-blue-900">AI Processing in Progress...</h4>
                          </div>
                          <p className="text-sm text-blue-800">
                            Our advanced AI is analyzing your product information to create Ideal Client Profiles 
                            and generate personalized training materials. This process will take a few minutes.
                          </p>
                        </div>
                      )}

                      {currentStep === 'upload' && (uploadResults.length > 0 || textContent.productName.trim() !== '' || textContent.productDescription.trim() !== '' || textContent.recommendedPrice.trim() !== '') && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-900">Ready to Process</h4>
                          </div>
                          <p className="text-sm text-green-800">
                            {textContent.productName.trim()
                              ? `Your product "${textContent.productName.trim()}" ${uploadResults.length > 0 || textContent.productDescription.trim() || textContent.recommendedPrice.trim() ? 'and additional information are' : 'is'} ready for processing.`
                              : uploadResults.length > 0
                                ? 'Your files have been uploaded successfully.'
                                : 'Your product information has been entered.'
                            } {textContent.productName.trim() ? 'Click "Generate Training Materials" to start the AI analysis and create your personalized training content.' : 'Please enter a product name to continue.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}


          {/* Processing Step */}
          {currentStep === 'processing' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Your Training Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <Progress
                      value={overallProgress}
                      label="Enhanced AI Processing"
                      showValue
                      showTime
                      estimatedTime={`${Math.ceil(remainingTime / 60)} minutes`}
                      size="lg"
                      className="mb-4"
                    />
                    <p className="body-base" style={{ color: 'var(--neutral-600)' }}>
                      Our advanced AI is analyzing your product information, creating ideal client profiles, and generating personalized training materials...
                    </p>
                  </div>

                  <div className="space-y-4">
                    {processingSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: 'var(--neutral-200)' }}>
                        <div className="flex-shrink-0">
                          {getStepIcon(step)}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{step.name}</h4>
                          <p className="text-sm mb-2" style={{ color: 'var(--neutral-600)' }}>
                            {step.description}
                          </p>
                          
                          {step.status === 'processing' && (
                            <Progress
                              value={step.progress}
                              size="sm"
                              showValue
                            />
                          )}
                          
                          {step.status === 'completed' && (
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Complete
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completed Step */}
          {currentStep === 'completed' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="text-center py-12">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: 'var(--success-light)' }}
                  >
                    <CheckCircle className="w-12 h-12" style={{ color: 'var(--success)' }} />
                  </div>
                  
                  <h2 className="heading-2 mb-4">Training Materials Ready! 🎉</h2>
                  <p className="body-large mb-8" style={{ color: 'var(--neutral-600)' }}>
                    Your customized training materials have been generated successfully. 
                    Your team can now access them immediately.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button
                      variant="primary"
                      onClick={() => router.push('/materials')}
                      className="flex-1"
                    >
                      View Materials
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="flex-1"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}