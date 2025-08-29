'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { Button, Progress, Modal } from '@/components/ui';
import { api } from '@/utils/api';

export interface FileUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadProgress?: (progress: number) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  className?: string;
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
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export function FileUpload({
  onUploadComplete,
  onUploadProgress,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`;
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('fileName', uploadFile.file.name);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev =>
          prev.map(f => {
            if (f.id === uploadFile.id && f.progress < 90) {
              const newProgress = f.progress + Math.random() * 20;
              onUploadProgress?.(newProgress);
              return { ...f, progress: Math.min(newProgress, 90) };
            }
            return f;
          })
        );
      }, 300);

      const response = await api.uploadFile(uploadFile.file);
      
      clearInterval(progressInterval);

      // Complete upload
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                progress: 100,
                status: 'completed' as const,
                result: response as UploadResult,
              }
            : f
        )
      );

      onUploadComplete?.(response as UploadResult);
      toast.success(`${uploadFile.file.name} uploaded successfully!`);

    } catch (error) {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );

      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const handleFileAdd = useCallback(
    async (files: File[]) => {
      const validFiles: UploadFile[] = [];

      for (const file of files) {
        if (uploadedFiles.length + validFiles.length >= maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const validationError = validateFile(file);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          continue;
        }

        const preview = await createFilePreview(file);
        const uploadFile: UploadFile = {
          id: generateFileId(),
          file,
          progress: 0,
          status: 'uploading',
          preview,
        };

        validFiles.push(uploadFile);
      }

      if (validFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...validFiles]);

        // Start uploading files
        validFiles.forEach(file => {
          uploadFile(file);
        });
      }
    },
    [uploadedFiles.length, maxFiles, maxFileSize, allowedTypes]
  );

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop: handleFileAdd,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploadedFiles.length >= maxFiles,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'uploading', progress: 0, error: undefined }
            : f
        )
      );
      uploadFile(file);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalProgress = uploadedFiles.length > 0
    ? uploadedFiles.reduce((sum, file) => sum + file.progress, 0) / uploadedFiles.length
    : 0;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={clsx(
          'file-upload__dropzone',
          {
            'file-upload__dropzone--dragover': dropzoneActive,
            'opacity-50 cursor-not-allowed': uploadedFiles.length >= maxFiles,
          }
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <Upload className="file-upload__icon" />
        
        <div className="file-upload__text">
          <strong>
            {uploadedFiles.length >= maxFiles
              ? 'Maximum files reached'
              : dropzoneActive
              ? 'Drop files here'
              : 'Drag files here'
            }
          </strong>
          {uploadedFiles.length < maxFiles && (
            <span> or click to browse</span>
          )}
        </div>
        
        <div className="file-upload__help">
          Supports PDF, JPG, PNG, DOCX up to {Math.round(maxFileSize / 1024 / 1024)}MB each
          <br />
          Maximum {maxFiles} files ({uploadedFiles.length}/{maxFiles} uploaded)
        </div>
      </div>

      {/* Progress Bar (when files are uploading) */}
      {uploadedFiles.some(f => f.status === 'uploading') && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Progress
            value={totalProgress}
            label="Overall progress"
            showValue
            size="base"
          />
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="label">Uploaded Files ({uploadedFiles.length})</h3>
          
          {uploadedFiles.map((uploadFile) => {
            const FileIcon = getFileIcon(uploadFile.file);
            
            return (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt={uploadFile.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      
                      {uploadFile.preview && (
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => setPreviewFile(uploadFile)}
                          aria-label="Preview file"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                  </p>

                  {/* Progress bar for individual file */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress
                        value={uploadFile.progress}
                        size="sm"
                        showValue
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {uploadFile.status === 'error' && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-red-600">{uploadFile.error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(uploadFile.id)}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Success info */}
                  {uploadFile.status === 'completed' && uploadFile.result?.extractedData && (
                    <div className="mt-2 text-xs text-green-600">
                      {uploadFile.result.extractedData.products?.length
                        ? `${uploadFile.result.extractedData.products.length} products detected`
                        : 'Text extracted successfully'
                      }
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.file.name}
          size="lg"
        >
          <div className="text-center">
            {previewFile.preview ? (
              <img
                src={previewFile.preview}
                alt={previewFile.file.name}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Preview not available for this file type</p>
              </div>
            )}
            
            {previewFile.result?.extractedData?.text && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                <h4 className="font-medium mb-2">Extracted Text:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-10">
                  {previewFile.result.extractedData.text}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}