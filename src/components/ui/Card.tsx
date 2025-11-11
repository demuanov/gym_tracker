import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-7 lg:p-8',
  };

  const classes = [
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    paddingClasses[padding],
    hover ? 'hover:shadow-md transition-shadow duration-200' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}