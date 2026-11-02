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
import { User, Role } from "@/types";
import { mockTeams } from "@/data/mock";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserInvited?: (newUser: User) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onUserInvited,
}: InviteUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.USER);
  const [teamId, setTeamId] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const chosenTeam = mockTeams.find((t) => t.id === teamId) ?? null;
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role,
        teamId: chosenTeam ? chosenTeam.id : null,
        team: chosenTeam,
        status: "INVITED",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: "Invited",
      };

      onUserInvited?.(newUser);
      toast.success(`Invitation dispatched to ${email}`, {
        description: `Invited as ${role} with pending workspace verification.`,
      });
      setName("");
      setEmail("");
      setRole(Role.USER);
      setTeamId("none");
      onOpenChange(false);
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Invite workspace member
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dispatch an onboarding invitation and provision role entitlements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="h-9 pl-9 text-sm bg-muted/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Work email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya@company.internal"
                className="h-9 pl-9 text-sm bg-muted/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Role</label>
              <Select
                value={role}
                onValueChange={(val) => {
                  if (val) setRole(val as Role);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                  <SelectItem value={Role.USER}>User</SelectItem>
                  <SelectItem value={Role.GUEST}>Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Squad</label>
              <Select value={teamId} onValueChange={(val) => setTeamId(val ?? "none")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Assign squad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {mockTeams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[110px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Inviting...</span>
                </>
              ) : (
                <span>Send invite</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
