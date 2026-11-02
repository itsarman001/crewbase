import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function RolesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* 4 Role cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border bg-card">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matrix skeleton */}
      <Card className="border border-border bg-card p-4 space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-6">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
