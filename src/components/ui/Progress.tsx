import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  showTime?: boolean;
  estimatedTime?: string;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value, 
    max = 100, 
    label, 
    showValue = true, 
    showTime = false,
    estimatedTime,
    size = 'base', 
    variant = 'primary',
    className, 
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = Math.round(percentage);

    const sizeClasses = {
      sm: 'h-1',
      base: 'h-2',
      lg: 'h-3',
    };

    const variantClasses = {
      primary: 'bg-teal-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
    };

    return (
      <div
        ref={ref}
        className={clsx('progress', className)}
        {...props}
      >
        {(label || showValue) && (
          <div className="progress__label">
            <span>{label}</span>
            {showValue && (
              <span className="font-medium">{displayValue}%</span>
            )}
          </div>
        )}
        
        <div
          className={clsx('progress__bar', sizeClasses[size])}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${displayValue}%`}
        >
          <div
            className={clsx('progress__fill', variantClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showTime && estimatedTime && (
          <div className="progress__time">
            Estimated time: {estimatedTime}
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'base' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSpinner({ size = 'base', className, children }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    base: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={clsx('loading-spinner', className)}>
      <div className={clsx('loading-spinner__icon', sizeClasses[size])}>
        <svg viewBox="0 0 100 100" className="animate-spin">
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
            className="opacity-25"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="31.416"
            strokeDashoffset="23.562"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {children && <span className="sr-only">{children}</span>}
    </div>
  );
}