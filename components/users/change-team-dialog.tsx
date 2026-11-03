"use client";

import { useState } from "react";
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
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChangeTeamDialogProps {
  user: User | null;
  teams: Team[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamChanged?: (userId: string, newTeam: Team | null) => void;
}

export function ChangeTeamDialog({
  user,
  teams,
  open,
  onOpenChange,
  onTeamChanged,
}: ChangeTeamDialogProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    user?.teamId ?? null
  );
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}/team`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeamId }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Squad assignment failed", {
          description: json.error?.message ?? "Could not assign member to squad.",
        });
        setIsSaving(false);
        return;
      }

      const chosenTeam = teams.find((t) => t.id === selectedTeamId) ?? null;
      onTeamChanged?.(user.id, chosenTeam);
      toast.success(`Squad updated for ${user.name}`, {
        description: chosenTeam
          ? `Transferred to ${chosenTeam.name}.`
          : "Removed from squad assignments.",
      });
      onOpenChange(false);
    } catch {
      toast.error("Network error", {
        description: "Failed to connect to the server.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentTeam = teams.find((t) => t.id === user.teamId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Assign Squad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Move this member between engineering squads or unassign from current squad.
          </DialogDescription>
        </DialogHeader>

        {/* User Identity Preview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 border border-border shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase font-medium block">
              Current Squad
            </span>
            <span className="text-xs font-medium text-foreground">
              {currentTeam ? currentTeam.name : "Unassigned"}
            </span>
          </div>
        </div>

        {/* Squad Selection List */}
        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
          {/* Option: Unassigned / Direct */}
          <div
            onClick={() => setSelectedTeamId(null)}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              selectedTeamId === null
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-border/80 hover:bg-muted/30"
            )}
          >
            <div
              className={cn(
                "size-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                selectedTeamId === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40"
              )}
            >
              {selectedTeamId === null && <Check className="size-2.5 stroke-[3]" />}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground block">
                No Squad / Unassigned
              </span>
              <span className="text-xs text-muted-foreground">
                Standalone member or external consultant
              </span>
            </div>
          </div>

          {/* Squad options */}
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {team.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {team.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {team.description || "Active squad"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || selectedTeamId === user.teamId}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Reassigning...</span>
              </>
            ) : (
              <span>Confirm assignment</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
