import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'base' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = true, padding = 'base', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'card',
          {
            'hover:shadow-md hover:transform hover:translate-y-[-2px]': hover,
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4': padding === 'base',
            'p-6': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('card__header', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('card__title', className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('card__content', className)} {...props}>
    {children}
  </div>
);

export const CardActions = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('card__actions', className)} {...props}>
    {children}
  </div>
);

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx('card__description', className)} {...props}>
    {children}
  </p>
);

export const CardMeta = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('card__meta', className)} {...props}>
    {children}
  </div>
);