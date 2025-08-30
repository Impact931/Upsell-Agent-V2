'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { Button, Progress, Modal } from '@/components/ui';
import { api } from '@/utils/api';

export interface EnhancedFileUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadProgress?: (progress: number) => void;
  onContentChange?: (content: { productName: string; productDescription: string; recommendedPrice: string }) => void;
  onSubmit?: (files: UploadFile[], productData: { productName: string; productDescription: string; recommendedPrice: string }) => Promise<void>;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  className?: string;
  showSubmitButton?: boolean;
}

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  result?: UploadResult;
  error?: string;
  preview?: string;
}

export interface UploadResult {
  sessionId: string;
  fileName: string;
  fileType: string;
  extractedData?: {
    text?: string;
    products?: Array<{
      name: string;
      description?: string;
      price?: number;
      category?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

export function EnhancedFileUpload({
  onUploadComplete,
  onUploadProgress,
  onContentChange,
  onSubmit,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFiles = 5,
  className,
  showSubmitButton = false,
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [recommendedPrice, setRecommendedPrice] = useState('');

  // Debug: Log component initialization
  useEffect(() => {
    console.log('🔧 EnhancedFileUpload initialized with showSubmitButton:', showSubmitButton);
    if (showSubmitButton) {
      console.log('🎯 STAGED UPLOAD MODE: Files will NOT auto-upload');
    } else {
      console.log('⚡ AUTO UPLOAD MODE: Files will auto-upload on drop');
    }
  }, [showSubmitButton]);

  // Notify parent component when content changes
  useEffect(() => {
    onContentChange?.({
      productName,
      productDescription,
      recommendedPrice,
    });
  }, [productName, productDescription, recommendedPrice, onContentChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach((fileRejection) => {
        const { file, errors } = fileRejection;
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File type not supported: ${file.name}`);
          }
        });
      });

      // Check total file count
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Add new files
      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setFiles(prev => [...prev, ...newFiles]);

      // Only start uploading if showSubmitButton is false (old behavior)
      // When showSubmitButton is true, files should only upload via submit button
      if (!showSubmitButton) {
        newFiles.forEach(uploadFile);
      } else {
        // Log for debugging - this should not auto-upload when showSubmitButton is true
        console.log('🚫 Files added but NOT auto-uploading (showSubmitButton=true). Files:', newFiles.map(f => f.file.name));
        console.log('✅ Staged upload mode active - submit button required for upload');
      }
    },
    [files.length, maxFiles, maxFileSize, showSubmitButton]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: true,
  });

  const uploadFile = async (uploadFile: UploadFile) => {
    setIsUploading(true);
    
    try {
      // Create metadata object for additional form fields
      const metadata: Record<string, string> = {};
      if (productName.trim()) metadata.productName = productName.trim();
      if (productDescription.trim()) metadata.productDescription = productDescription.trim();
      if (recommendedPrice.trim()) metadata.recommendedPrice = recommendedPrice.trim();

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
              : f
          )
        );
      }, 300);

      const response = await api.uploadFile(uploadFile.file, metadata);

      clearInterval(progressInterval);

      const result: UploadResult = response;

      // Update file status
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, progress: 100, status: 'completed', result }
            : f
        )
      );

      toast.success(`File ${uploadFile.file.name} uploaded successfully`);
      onUploadComplete?.(result);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { 
                ...f, 
                status: 'error', 
                error: error.response?.data?.error || 'Upload failed' 
              }
            : f
        )
      );

      toast.error(`Failed to upload ${uploadFile.file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called with:', {
      productName: productName,
      productDescription: productDescription,
      recommendedPrice: recommendedPrice,
      filesCount: files.length
    });

    if (!productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!recommendedPrice.trim()) {
      toast.error('Recommended price is required');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    const productData = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      recommendedPrice: recommendedPrice.trim(),
    };
    
    console.log('Product data prepared for submission:', productData);

    try {
      setIsUploading(true);
      
      if (onSubmit) {
        // Show progress for each file during onSubmit
        files.forEach(file => {
          setFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
            )
          );
        });

        // Simulate progress during the API call
        const progressInterval = setInterval(() => {
          setFiles(prev =>
            prev.map(file => ({
              ...file,
              progress: file.status === 'uploading' ? Math.min(file.progress + Math.random() * 15 + 5, 90) : file.progress
            }))
          );
        }, 200);

        try {
          await onSubmit(files, productData);
          
          // Complete all files
          setFiles(prev =>
            prev.map(file => ({
              ...file,
              progress: 100,
              status: 'completed'
            }))
          );
        } finally {
          clearInterval(progressInterval);
        }
      } else {
        // Fallback to individual file uploads
        for (const file of files) {
          await uploadFile(file);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to process files');
    }
  };

  const canSubmit = showSubmitButton && productName.trim() && recommendedPrice.trim() && files.length > 0 && !isUploading;

  const overallProgress = files.length > 0 
    ? files.reduce((sum, file) => sum + file.progress, 0) / files.length 
    : 0;

  return (
    <div className={clsx('w-full', className)}>
      {/* Product Name Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-earth-700 mb-3">
          Product Name <span className="text-accent-coral">*</span>
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter your wellness product or service name..."
          className="w-full px-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 text-earth-700"
        />
        <p className="text-xs text-earth-500 mt-2">
          This will be used as the main identifier for your wellness training materials.
        </p>
      </div>

      {/* Product Description Text Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-earth-700 mb-3">
          Product Description (Optional)
        </label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Describe your wellness product, service, or provide additional context for the AI to generate better training materials..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 resize-none text-earth-700"
        />
        <p className="text-xs text-earth-500 mt-2">
          Provide details about your wellness product, target audience, key benefits, or any specific messaging you want included in the training materials.
        </p>
      </div>

      {/* Recommended Sales Price */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-earth-700 mb-3">
          Recommended Sales Price <span className="text-accent-coral">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage-500 text-sm font-medium">$</span>
          <input
            type="text"
            value={recommendedPrice}
            onChange={(e) => {
              // Only allow numbers and decimal points
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setRecommendedPrice(value);
            }}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3 border-2 border-sage-200/60 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 hover:border-sage-300 text-earth-700"
          />
        </div>
        <p className="text-xs text-earth-500 mt-2">
          Enter the recommended retail price for this wellness product. This will help the AI create appropriate sales scripts and objection handling materials.
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={clsx(
            'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01]',
            isDragActive
              ? 'border-sage-400 bg-sage-50/80 backdrop-blur-sm shadow-spa-lg'
              : 'border-sage-200/60 hover:border-sage-400 hover:bg-sage-50/50 backdrop-blur-sm'
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-500 rounded-2xl flex items-center justify-center shadow-spa">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            {isDragActive ? (
              <div className="text-center">
                <p className="text-sage-700 font-semibold text-lg">Drop your wellness files here...</p>
                <p className="text-sage-600 text-sm mt-1">We'll process them for training materials</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-earth-700 font-semibold text-lg">
                  Upload Your Wellness Materials
                </p>
                <p className="text-earth-600">
                  Drag files here or click to browse
                </p>
                <div className="bg-sage-50/80 rounded-xl px-4 py-2 mt-4">
                  <p className="text-sm text-sage-700 font-medium">
                    Supports PDF, JPG, PNG, DOCX up to {Math.round(maxFileSize / 1024 / 1024)}MB each
                  </p>
                  <p className="text-xs text-sage-600 mt-1">
                    Maximum {maxFiles} files ({files.length} uploaded)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {files.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-sage-200/40 shadow-spa space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-earth-700 font-medium">Overall Progress</span>
              <span className="text-sage-700 font-semibold">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200/40 shadow-spa hover:shadow-spa-lg transition-all duration-300"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center shadow-spa">
                    {getFileIcon(file.file)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-earth-800 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-earth-500 font-medium">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={file.progress} size="sm" />
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <p className="text-xs text-accent-coral font-medium mt-1">{file.error}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {file.status === 'completed' && (
                    <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-sage-600" />
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="w-8 h-8 bg-accent-coral/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-accent-coral" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 hover:bg-sage-100 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isUploading && file.status === 'uploading'}
                  >
                    <X className="w-4 h-4 text-earth-500 hover:text-accent-coral" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {files.length > 0 && (
          <div className="bg-gradient-to-br from-sage-50/80 to-earth-50/60 border-2 border-sage-200/40 rounded-2xl p-6 shadow-spa backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center shadow-spa">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-display font-semibold text-earth-800 mb-2">
                  Ready for Wellness AI Processing
                </h4>
                <p className="text-earth-600 leading-relaxed">
                  {productName.trim() || productDescription.trim() || recommendedPrice.trim()
                    ? `Your ${[
                        productName.trim() && `wellness product "${productName.trim()}"`,
                        productDescription.trim() && 'product description',
                        recommendedPrice.trim() && `pricing ($${recommendedPrice.trim()})`,
                        files.length > 0 && 'uploaded materials'
                      ].filter(Boolean).join(', ')} will be analyzed by our specialized wellness AI to create personalized training materials and ideal client profiles.`
                    : 'Your information will be analyzed by our wellness AI to create personalized training materials and ideal client profiles.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="mt-8 p-6 border-t-2 border-sage-200/40">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-spa hover:shadow-spa-lg ${
                canSubmit && !isUploading
                  ? 'bg-gradient-to-br from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Wellness Materials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <span>Generate Wellness Training Materials</span>
                </div>
              )}
            </button>
            
            {!canSubmit && !isUploading && (
              <p className="text-sm text-earth-500 text-center mt-3 bg-earth-50 p-3 rounded-xl">
                Please provide a wellness product name, price, and select at least one file to continue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}