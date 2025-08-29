'use client';

import { Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'base',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        (modal as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    base: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      aria-hidden="false"
    >
      <div className="modal__backdrop" onClick={handleBackdropClick} />
      
      <div className="modal__container">
        <div className={clsx('modal__content', sizeClasses[size], className)}>
          {(title || showCloseButton) && (
            <div className="modal__header">
              {title && (
                <h2 id="modal-title" className="modal__title">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <Button
                  variant="icon"
                  onClick={onClose}
                  className="modal__close"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
          
          <div className="modal__body">
            {description && (
              <p id="modal-description" className="mb-4" style={{ color: 'var(--neutral-600)' }}>
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={clsx('modal__footer', className)}>
      {children}
    </div>
  );
}

// Confirmation modal with predefined actions
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      closeOnBackdropClick={!loading}
      closeOnEsc={!loading}
    >
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'primary' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
          className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}