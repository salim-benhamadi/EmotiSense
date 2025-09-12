import { clsx } from 'clsx';

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className 
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colors = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    neutral: 'border-neutral-600'
  };

  const classes = clsx(
    'animate-spin rounded-full border-2 border-transparent border-t-2',
    sizes[size],
    colors[color],
    className
  );

  return <div className={classes} />;
}