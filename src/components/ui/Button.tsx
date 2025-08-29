import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'base', 
    loading = false, 
    icon, 
    children, 
    className, 
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={clsx(
          'btn',
          {
            'btn--primary': variant === 'primary',
            'btn--secondary': variant === 'secondary',
            'btn--outline': variant === 'outline',
            'btn--icon': variant === 'icon',
            'btn--sm': size === 'sm',
            'btn--lg': size === 'lg',
          },
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {variant !== 'icon' && children && (
              <span>{typeof children === 'string' && children.includes('ing') ? children : 'Loading...'}</span>
            )}
          </>
        ) : (
          <>
            {icon && <span className="btn__icon">{icon}</span>}
            {children && <span className="btn__text">{children}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';