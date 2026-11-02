"use client";

import * as React from "react";
import { Team, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Copy,
  Check,
  Terminal,
  Palette,
  Server,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

const TEAM_ICONS: Record<string, React.ReactNode> = {
  team_core_eng: <Terminal className="size-5 text-primary" />,
  team_platform_infra: <Server className="size-5 text-blue-600" />,
  team_design_systems: <Palette className="size-5 text-indigo-600" />,
  team_product_ops: <FolderKanban className="size-5 text-amber-600" />,
  team_secops: <ShieldCheck className="size-5 text-emerald-600" />,
};

interface TeamCardProps {
  team: Team;
  members?: User[];
  onManageRoster?: (team: Team) => void;
}

export function TeamCard({ team, members = [], onManageRoster }: TeamCardProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const teamMembers = members.filter((m) => m.teamId === team.id);
  const displayCount = team.memberCount ?? teamMembers.length;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(team.code);
    setHasCopied(true);
    toast.success("Team code copied!", {
      description: `Share ${team.code} with recruits to automatically allocate them to ${team.name}.`,
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const icon = TEAM_ICONS[team.id] ?? <Headphones className="size-5 text-primary" />;

  return (
    <Card className="flex flex-col justify-between border border-border bg-card shadow-xs hover:shadow-sm transition-all duration-200 group overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3 h-full justify-between">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                <span className="text-xs text-muted-foreground truncate">
                  Lead: {team.leadName ?? "Elena Rostova"}
                </span>
              </div>
            </div>
            {team.department && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium shrink-0">
                {team.department}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {team.description ?? "Active organizational squad managing strategic objectives."}
          </p>

          {/* Code Badge */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Click to copy team code"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted/70 hover:bg-muted font-mono text-[11px] font-semibold text-foreground border border-border/80 transition-colors"
            >
              <Hash className="size-3 text-muted-foreground" />
              <span>{team.code}</span>
              {hasCopied ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              {displayCount} members
            </span>
          </div>
        </div>

        {/* Card Footer: Avatars + Manage link */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-border -mx-5 -mb-5 px-5 py-2.5 bg-muted/20">
          {/* Stacked Avatars */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {teamMembers.slice(0, 3).map((m) => {
              const inits = m.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <Avatar key={m.id} className="size-6 border-2 border-card ring-1 ring-border">
                  <AvatarFallback className="text-[9px] font-semibold bg-muted text-foreground">
                    {inits}
                  </AvatarFallback>
                </Avatar>
              );
            })}
            {displayCount > 3 && (
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground border-2 border-card">
                +{displayCount - 3}
              </div>
            )}
          </div>

          {/* Action Link */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onManageRoster?.(team)}
            className="text-xs font-medium text-foreground hover:text-primary gap-1 p-0 h-auto"
          >
            <span>View squad</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
