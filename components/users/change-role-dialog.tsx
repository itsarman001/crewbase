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
  const [selectedRole, setSelectedRole] = React.useState<Role>(user?.role ?? Role.USER);
  const [prevUserId, setPrevUserId] = React.useState(user?.id);
  const [isSaving, setIsSaving] = React.useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onRoleChanged?.(user.id, selectedRole);
      toast.success(`Role updated for ${user.name}`, {
        description: `Privilege scope elevated/adjusted to ${ROLE_CONFIG[selectedRole].label}.`,
      });
      onOpenChange(false);
    }, 600);
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
        <div className="space-y-2 mt-1">
          <label className="text-xs font-semibold text-foreground">
            Select new role
          </label>
          <div className="grid gap-2">
            {availableRoles.map((role) => {
              const isSelected = selectedRole === role;
              const config = ROLE_CONFIG[role];
              return (
                <div
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="mt-0.5 size-4 rounded-full border border-border flex items-center justify-center shrink-0">
                    {isSelected && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {config.label}
                        </span>
                        <RoleBadge role={role} size="sm" />
                      </div>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection Note */}
        {user.role === Role.ADMIN && selectedRole !== Role.ADMIN && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <ShieldAlert className="size-4 shrink-0" />
            <span>
              Last Admin Guard: Demoting the final administrator is disallowed by RBAC policies.
            </span>
          </div>
        )}

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
              <span>Save changes</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
