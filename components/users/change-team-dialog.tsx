"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Team } from "@/types";
import { mockTeams } from "@/data/mock";
import { Check, FolderKanban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChangeTeamDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamChanged?: (userId: string, newTeam: Team | null) => void;
}

export function ChangeTeamDialog({
  user,
  open,
  onOpenChange,
  onTeamChanged,
}: ChangeTeamDialogProps) {
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(
    user?.teamId ?? null
  );
  const [prevUserId, setPrevUserId] = React.useState(user?.id);
  const [isSaving, setIsSaving] = React.useState(false);

  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setSelectedTeamId(user.teamId ?? null);
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const chosenTeam = mockTeams.find((t) => t.id === selectedTeamId) ?? null;
      onTeamChanged?.(user.id, chosenTeam);
      toast.success(`Squad updated for ${user.name}`, {
        description: chosenTeam
          ? `Transferred to ${chosenTeam.name}.`
          : "Unassigned from current squad.",
      });
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Assign squad or team
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Allocate {user.name} to an active business unit or operational squad.
          </DialogDescription>
        </DialogHeader>

        {/* User Identity Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
          <Avatar className="size-9 border border-border shrink-0">
            <AvatarFallback className="text-xs font-semibold bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              Current Squad:{" "}
              <span className="text-foreground font-medium">
                {user.team && typeof user.team === "object" && "name" in user.team
                  ? user.team.name
                  : "None (Unassigned)"}
              </span>
            </span>
          </div>
        </div>

        {/* Squad Selection List */}
        <div className="space-y-2 mt-1">
          <label className="text-xs font-semibold text-foreground">
            Target Squad
          </label>
          <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
            {mockTeams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 text-primary">
                      <FolderKanban className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {team.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {team.department ?? "General"} • {team.memberCount ?? 0} members
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-primary shrink-0" />}
                </div>
              );
            })}

            {/* Unassigned Option */}
            <div
              onClick={() => setSelectedTeamId(null)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                selectedTeamId === null
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                  : "border-border bg-card hover:bg-muted/30"
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Unassign Squad
                </span>
                <span className="text-xs text-muted-foreground">
                  Leave member unassigned (e.g. external guest or cross-org)
                </span>
              </div>
              {selectedTeamId === null && <Check className="size-4 text-primary shrink-0" />}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update squad</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
