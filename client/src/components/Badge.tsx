import { cn } from '../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'outline';
  className?: string;
}

const variantClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  outline:
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-surface-300 text-surface-600 dark:border-surface-600 dark:text-surface-400',
};

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return <span className={cn(variantClasses[variant], className)}>{children}</span>;
}
