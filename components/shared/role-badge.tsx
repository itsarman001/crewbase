import * as React from "react";
import { Role } from "@/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RoleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: Role;
  size?: "sm" | "default";
}

export function RoleBadge({ role, size = "default", className, ...props }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    badgeClass: "bg-muted text-muted-foreground border-border border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded tracking-tight transition-colors select-none",
        size === "sm" ? "px-1.5 py-0.5 text-[11px] leading-tight" : "px-2 py-0.5 text-xs leading-none",
        config.badgeClass,
        className
      )}
      {...props}
    >
      {config.label.toUpperCase()}
    </span>
  );
}
