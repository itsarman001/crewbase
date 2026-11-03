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
import { RoleBadge } from "@/components/shared/role-badge";
import { User, Role } from "@/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { Check, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChangeRoleDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChanged?: (userId: string, newRole: Role) => void;
}

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onRoleChanged,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(user?.role ?? Role.USER);
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [isSaving, setIsSaving] = useState(false);

  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setSelectedRole(user.role);
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
      const res = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Role update failed", {
          description: json.error?.message ?? "Could not update user role.",
        });
        setIsSaving(false);
        return;
      }

      onRoleChanged?.(user.id, selectedRole);
      toast.success(`Role updated for ${user.name}`, {
        description: `Privilege scope adjusted to ${ROLE_CONFIG[selectedRole].label}.`,
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

  const availableRoles = [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Change privilege role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update organizational permissions and authorization tiers for this member.
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
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">
              Current
            </span>
            <RoleBadge role={user.role} size="sm" />
          </div>
        </div>

        {/* Role Options */}
        <div className="space-y-2 mt-2">
          {availableRoles.map((role) => {
            const config = ROLE_CONFIG[role];
            const isSelected = selectedRole === role;

            return (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {config.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Tier {config.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Policy Warning */}
        {selectedRole !== Role.ADMIN && user.role === Role.ADMIN && (
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
            <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p>
              Demoting an Administrator requires that at least one other active Administrator exists in the workspace.
            </p>
          </div>
        )}

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
            disabled={isSaving || selectedRole === user.role}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Updating role...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
