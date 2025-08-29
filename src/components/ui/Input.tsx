import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    help, 
    required, 
    icon, 
    endIcon,
    type, 
    className, 
    id, 
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="form-group">
        {label && (
          <label 
            htmlFor={inputId} 
            className={clsx('form-label', { 'form-label--required': required })}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={clsx(
              'form-input',
              {
                'pl-10': icon,
                'pr-10': isPassword || endIcon,
                'border-red-500': error,
              },
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
              ) : (
                <Eye className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
              )}
            </button>
          )}
          
          {endIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{endIcon}</span>
            </div>
          )}
        </div>
        
        {error && <p className="form-error">{error}</p>}
        {help && !error && <p className="form-help">{help}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';