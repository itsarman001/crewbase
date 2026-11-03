"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/role-badge";
import { Button } from "@/components/ui/button";
import { Team, User } from "@/types";
import { useAuth } from "@/components/auth/auth-provider";
import { can } from "@/lib/permissions";
import { Users, Copy, Check, UserMinus, Plus } from "lucide-react";
import { toast } from "sonner";

interface TeamRosterDialogProps {
  team: Team | null;
  members: User[];
  allUsers?: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRosterChanged?: () => void;
}

export function TeamRosterDialog({
  team,
  members,
  allUsers = [],
  open,
  onOpenChange,
  onRosterChanged,
}: TeamRosterDialogProps) {
  const { user: currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<string>("");

  if (!team) return null;

  const canManageMembers = currentUser
    ? can(currentUser, "teams:manage_members", { targetTeamId: team.id })
    : false;

  const squadMembers = members.filter((m) => m.teamId === team.id);
  const unassignedUsers = allUsers.filter((u) => !u.teamId);

  const handleCopy = () => {
    navigator.clipboard.writeText(team.code);
    setCopied(true);
    toast.success(`Copied join code: ${team.code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/members/${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Failed to remove member", {
          description: json.error?.message ?? "An error occurred",
        });
        return;
      }
      toast.success(`${memberName} unassigned from ${team.name}`);
      onRosterChanged?.();
    } catch {
      toast.error("Network error removing member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserIdToAdd) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserIdToAdd }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Failed to add member", {
          description: json.error?.message ?? "An error occurred",
        });
        return;
      }
      toast.success(`Member assigned to ${team.name}`);
      setSelectedUserIdToAdd("");
      onRosterChanged?.();
    } catch {
      toast.error("Network error adding member");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {team.name}
            </DialogTitle>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
              {team.code}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {team.description ?? "Active operational squad"}
          </DialogDescription>
        </DialogHeader>

        {/* Squad Metadata Pill */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Join Code:</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {team.code}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopy}
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">{squadMembers.length}</span> assigned
          </div>
        </div>

        {/* Add Unassigned Member Form (if manager/admin) */}
        {canManageMembers && unassignedUsers.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <select
              value={selectedUserIdToAdd}
              onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
              className="flex-1 h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select unassigned member to add...</option>
              {unassignedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <Button
              size="sm"
              disabled={!selectedUserIdToAdd || isProcessing}
              onClick={handleAddMember}
              className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </Button>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-2 mt-2">
          <h4 className="text-xs font-semibold text-foreground">Squad Roster</h4>
          <div className="divide-y divide-border border border-border rounded-lg bg-card max-h-60 overflow-y-auto">
            {squadMembers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No personnel currently assigned to this squad.
              </div>
            ) : (
              squadMembers.map((member) => {
                const inits = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-7 border border-border shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold bg-muted">
                          {inits}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoleBadge role={member.role} size="sm" />
                      {canManageMembers && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={isProcessing}
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          title="Unassign member"
                          className="size-6 text-muted-foreground hover:text-destructive"
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
