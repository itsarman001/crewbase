import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex gap-3 p-3 rounded-lg border border-border bg-card">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-44" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-4 w-36 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="size-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
