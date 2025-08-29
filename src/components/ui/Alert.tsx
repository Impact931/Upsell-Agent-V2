import { HTMLAttributes, forwardRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode | boolean;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    variant = 'info', 
    title, 
    dismissible = false, 
    onDismiss, 
    icon = true,
    className, 
    children,
    ...props 
  }, ref) => {
    const IconComponent = iconMap[variant];
    const shouldShowIcon = icon !== false;
    const iconElement = icon === true ? <IconComponent className="alert__icon" /> : icon;

    return (
      <div
        ref={ref}
        className={clsx('alert', `alert--${variant}`, className)}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {shouldShowIcon && (
          <div className="alert__icon">
            {iconElement}
          </div>
        )}
        
        <div className="alert__content">
          {title && (
            <h4 className="alert__title">{title}</h4>
          )}
          <div className="alert__message">
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <Button
            variant="icon"
            size="sm"
            onClick={onDismiss}
            className="alert__close"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';