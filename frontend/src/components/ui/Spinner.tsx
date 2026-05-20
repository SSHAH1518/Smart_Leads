import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, fullScreen }) => {
  const icon = <Loader2 className={cn('animate-spin text-brand-600', sizes[size], className)} />;
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-50">
        {icon}
      </div>
    );
  }
  return icon;
};
