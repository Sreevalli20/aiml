import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn('animate-pulse bg-slate-800/60 rounded-md', className)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('animate-pulse bg-slate-800/60 rounded-md', className)} />
  );
};

export const AttendanceCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-baseline space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
};
