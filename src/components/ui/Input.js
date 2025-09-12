import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  type = 'text',
  label,
  error,
  helper,
  icon,
  className,
  ...props 
}, ref) => {
  const inputClasses = clsx(
    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200',
    {
      'border-neutral-300 focus:ring-primary-500': !error,
      'border-red-300 focus:ring-red-500': error,
      'pl-10': icon
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-neutral-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;