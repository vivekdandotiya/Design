import { cn } from '../lib/utils';

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded-lg shimmer',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return (
    <div className={cn('w-full aspect-video rounded-xl shimmer', className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5 space-y-4', className)}>
      <SkeletonImage />
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full shimmer" />
        <div className="h-5 w-3/4 rounded-lg shimmer" />
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded-full shimmer" />
          <div className="h-3 w-16 rounded-full shimmer" />
          <div className="h-3 w-16 rounded-full shimmer" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 rounded-lg shimmer" />
          <div className="h-9 w-28 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'w-full', className }: { width?: string; className?: string }) {
  return <div className={cn('h-4 rounded-lg shimmer', width, className)} />;
}
