"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Role, Team } from "@/types";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface InviteUserDialogProps {
  open: boolean;
  teams: Team[];
  onOpenChange: (open: boolean) => void;
  onUserInvited?: (newUser: User) => void;
}

export function InviteUserDialog({
  open,
  teams,
  onOpenChange,
  onUserInvited,
}: InviteUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.USER);
  const [teamId, setTeamId] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          teamId: teamId === "none" ? null : teamId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Seat provisioning failed", {
          description: json.error?.message ?? "Could not create user account.",
        });
        setIsSubmitting(false);
        return;
      }

      const createdUser = json.data?.user;
      onUserInvited?.(createdUser);

      toast.success("Seat provisioned successfully", {
        description: `Created account for ${name} (${role}). Default password is Password@123`,
      });

      // Reset form
      setName("");
      setEmail("");
      setRole(Role.USER);
      setTeamId("none");
      onOpenChange(false);
    } catch {
      toast.error("Network error", {
        description: "Failed to connect to the server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Provision New Member Seat
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Onboard a team member to the workspace directory and allocate their initial RBAC entitlement tier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Member Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* Member Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Corporate Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="e.g. member@crewbase.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* RBAC Role Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              RBAC Role Tier <span className="text-destructive">*</span>
            </label>
            <Select value={role} onValueChange={(val) => setRole(val as Role)}>
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Select privilege level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.ADMIN} className="text-xs">
                  Admin — Full workspace administrative power
                </SelectItem>
                <SelectItem value={Role.MANAGER} className="text-xs">
                  Manager — Scoped squad leadership & approvals
                </SelectItem>
                <SelectItem value={Role.USER} className="text-xs">
                  User — Standard workspace contributor
                </SelectItem>
                <SelectItem value={Role.GUEST} className="text-xs">
                  Guest — Restricted read-only observer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Squad / Team Allocation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Initial Squad Assignment
            </label>
            <Select value={teamId} onValueChange={(val) => setTeamId(val ?? "none")}>
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Select assigned squad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">
                  None / Unassigned Squad
                </SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.name} ({t.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <span>Provision Seat</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
