"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ExpenseItemSkeleton() {
  return (
    <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton circle width={40} height={40} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        <div>
          <Skeleton width={120} height={16} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
          <Skeleton width={80} height={12} className="mt-1" baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton width={60} height={20} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        <Skeleton width={50} height={10} className="mt-1" baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
      </div>
    </div>
  );
}

export function ExpenseListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {Array.from({ length: count }).map((_, i) => (
        <ExpenseItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <Skeleton circle width={48} height={48} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        <div className="flex-1">
          <Skeleton width="60%" height={18} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
          <Skeleton width="40%" height={14} className="mt-1" baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton height={60} borderRadius={8} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
        <Skeleton height={60} borderRadius={8} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
      </div>
    </div>
  );
}

export function GroupListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GroupCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-4 sm:p-5">
      <Skeleton width={80} height={12} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
      <Skeleton width={100} height={28} className="mt-2" baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-4 sm:p-6">
      <Skeleton width={100} height={16} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton circle width={32} height={32} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
              <Skeleton width={80} height={14} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
            </div>
            <Skeleton width={50} height={14} baseColor="var(--background-warm)" highlightColor="var(--background-elevated)" />
          </div>
        ))}
      </div>
    </div>
  );
}
