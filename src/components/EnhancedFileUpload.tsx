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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter your product or service name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be used as the main identifier for your training materials.
        </p>
      </div>

      {/* Product Description Text Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Description (Optional)
        </label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Describe your product, service, or provide additional context for the AI to generate better training materials..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide details about your product, target audience, key benefits, or any specific messaging you want included in the training materials.
        </p>
      </div>

      {/* Recommended Sales Price */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recommended Sales Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input
            type="text"
            value={recommendedPrice}
            onChange={(e) => {
              // Only allow numbers and decimal points
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setRecommendedPrice(value);
            }}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter the recommended retail price for this product. This will help the AI create appropriate sales scripts and objection handling materials.
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={clsx(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-teal-400 bg-teal-50'
              : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-8 h-8 text-gray-400" />
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            {isDragActive ? (
              <p className="text-teal-600 font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  Drag files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, JPG, PNG, DOCX up to {Math.round(maxFileSize / 1024 / 1024)}MB each
                </p>
                <p className="text-xs text-gray-400">
                  Maximum {maxFiles} files ({files.length} uploaded)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-900">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    {getFileIcon(file.file)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {file.status === 'uploading' && (
                    <div className="mt-1">
                      <Progress value={file.progress} size="sm" />
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    disabled={isUploading && file.status === 'uploading'}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {files.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">
                  Ready for AI Processing
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {productName.trim() || productDescription.trim() || recommendedPrice.trim()
                    ? `Your ${[
                        productName.trim() && `product "${productName.trim()}"`,
                        productDescription.trim() && 'product description',
                        recommendedPrice.trim() && `pricing ($${recommendedPrice.trim()})`,
                        files.length > 0 && 'uploaded files'
                      ].filter(Boolean).join(', ')} will be analyzed to create personalized training materials and ideal client profiles.`
                    : 'Your information will be analyzed to create personalized training materials and ideal client profiles.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="mt-6 p-4 border-t border-gray-200">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={isUploading}
              className="w-full"
            >
              {isUploading ? 'Processing Files...' : 'Generate Training Materials'}
            </Button>
            
            {!canSubmit && !isUploading && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please provide a product name, price, and select at least one file to continue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}