import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '@/components/FileUpload';

// Mock the file upload hook
vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: vi.fn(() => ({
    uploadFile: vi.fn(),
    isUploading: false,
    progress: 0,
    error: null,
  })),
}));

describe('FileUpload Component', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file upload area', () => {
    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/drag.*drop.*files/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
  });

  it('should show accepted file types', () => {
    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/pdf.*jpg.*png/i)).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const { useFileUpload } = await import('@/hooks/useFileUpload');
    const mockUploadFile = vi.fn();
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: mockUploadFile,
      isUploading: false,
      progress: 0,
      error: null,
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    const fileInput = screen.getByRole('button');
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.click(fileInput);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (hiddenInput) {
      fireEvent.change(hiddenInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith(file);
    });
  });

  it('should show upload progress', () => {
    const { useFileUpload } = require('@/hooks/useFileUpload');
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: vi.fn(),
      isUploading: true,
      progress: 45,
      error: null,
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it('should display upload error', () => {
    const { useFileUpload } = require('@/hooks/useFileUpload');
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: vi.fn(),
      isUploading: false,
      progress: 0,
      error: 'File too large. Maximum size is 10MB.',
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should handle drag and drop', async () => {
    const { useFileUpload } = await import('@/hooks/useFileUpload');
    const mockUploadFile = vi.fn();
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: mockUploadFile,
      isUploading: false,
      progress: 0,
      error: null,
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    const dropzone = screen.getByText(/drag.*drop.*files/i).closest('div');
    const file = new File(['test content'], 'brochure.pdf', { type: 'application/pdf' });

    if (dropzone) {
      fireEvent.dragOver(dropzone, {
        dataTransfer: {
          files: [file],
          items: [{ kind: 'file', type: 'application/pdf' }],
          types: ['Files'],
        },
      });

      expect(dropzone).toHaveClass('border-blue-500');

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(file);
      });
    }
  });

  it('should reject invalid file types', async () => {
    const { useFileUpload } = await import('@/hooks/useFileUpload');
    const mockUploadFile = vi.fn();
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: mockUploadFile,
      isUploading: false,
      progress: 0,
      error: null,
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    const dropzone = screen.getByText(/drag.*drop.*files/i).closest('div');
    const file = new File(['test content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    if (dropzone) {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('file type'));
        expect(mockUploadFile).not.toHaveBeenCalled();
      });
    }
  });

  it('should show file size limit', () => {
    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/maximum.*10mb/i)).toBeInTheDocument();
  });

  it('should disable upload during processing', () => {
    const { useFileUpload } = require('@/hooks/useFileUpload');
    
    (useFileUpload as any).mockReturnValue({
      uploadFile: vi.fn(),
      isUploading: true,
      progress: 25,
      error: null,
    });

    render(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        onError={mockOnError}
      />
    );

    const uploadArea = screen.getByText(/uploading/i).closest('div');
    expect(uploadArea).toHaveClass('pointer-events-none');
  });
});