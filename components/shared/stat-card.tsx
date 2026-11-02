import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  description,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border border-border bg-card shadow-xs", className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <div className="size-8 rounded-md bg-muted/60 flex items-center justify-center text-foreground/70">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
          {(change || description) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {change && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded",
                    trend === "up" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                    trend === "down" && "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
                    trend === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend === "up" && <ArrowUpRight className="size-3" />}
                  {trend === "down" && <ArrowDownRight className="size-3" />}
                  {trend === "neutral" && <Minus className="size-3" />}
                  {change}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground truncate">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
