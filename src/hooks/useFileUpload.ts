import { useState, useCallback } from 'react';
import { api, retryRequest } from '@/utils/api';
import { toast } from 'react-hot-toast';

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (
    file: File, 
    metadata?: Record<string, string>
  ) => {
    const fileId = `${file.name}-${Date.now()}`;
    setIsUploading(true);

    // Initialize progress tracking
    setUploads(prev => new Map(prev).set(fileId, {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Create progress updater
      const updateProgress = (progress: number) => {
        setUploads(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(fileId);
          if (current) {
            newMap.set(fileId, { ...current, progress });
          }
          return newMap;
        });
      };

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        const current = uploads.get(fileId);
        if (current && current.progress < 90) {
          updateProgress(Math.min(current.progress + Math.random() * 10, 90));
        }
      }, 200);

      // Upload with retry logic
      const result = await retryRequest(
        () => api.uploadFile(file, metadata),
        3,
        1000
      );

      clearInterval(progressInterval);

      // Complete upload
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 100,
          status: 'completed',
          result,
        });
        return newMap;
      });

      toast.success(`${file.name} uploaded successfully!`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: errorMessage,
        });
        return newMap;
      });

      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [uploads]);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    metadata?: Record<string, string>
  ) => {
    const results = await Promise.allSettled(
      files.map(file => uploadFile(file, metadata))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    if (successful > 0) {
      toast.success(`${successful} file${successful > 1 ? 's' : ''} uploaded successfully`);
    }
    
    if (failed > 0) {
      toast.error(`${failed} file${failed > 1 ? 's' : ''} failed to upload`);
    }

    return results;
  }, [uploadFile]);

  const removeUpload = useCallback((fileId: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }, []);

  const retryUpload = useCallback((fileId: string) => {
    const upload = uploads.get(fileId);
    if (upload && upload.status === 'error') {
      // Reset status and retry
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          ...upload,
          status: 'uploading',
          progress: 0,
          error: undefined,
        });
        return newMap;
      });
      
      // This would need the original file reference - in a real implementation,
      // you'd store the file reference in the upload state
      toast.info('Retry functionality requires file reference');
    }
  }, [uploads]);

  const clearCompleted = useCallback(() => {
    setUploads(prev => {
      const newMap = new Map();
      prev.forEach((upload, key) => {
        if (upload.status !== 'completed') {
          newMap.set(key, upload);
        }
      });
      return newMap;
    });
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    isUploading,
    uploadFile,
    uploadMultipleFiles,
    removeUpload,
    retryUpload,
    clearCompleted,
  };
}