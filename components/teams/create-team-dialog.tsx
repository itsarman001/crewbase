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
import { Team } from "@/types";
import { FolderKanban, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated?: (newTeam: Team) => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onTeamCreated,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in squad name and squad code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Squad creation failed", {
          description: json.error?.message ?? "Could not create squad.",
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Squad initialized successfully!", {
        description: `Created ${name} (${code.toUpperCase()}).`,
      });

      setName("");
      setCode("");
      setDescription("");
      onTeamCreated?.(json.data.team);
      onOpenChange(false);
    } catch {
      toast.error("Network error creating squad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Initialize New Squad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an engineering squad or cross-functional team with a dedicated roster code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Squad Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Platform Infrastructure"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Squad Code <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. INFRA"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="h-9 text-xs font-mono uppercase"
            />
            <p className="text-[11px] text-muted-foreground">
              Unique 2-10 character code used by recruits during registration.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Mission / Description
            </label>
            <Input
              placeholder="e.g. Kubernetes orchestration and CI/CD pipelines"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-xs"
            />
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
                  <span>Creating squad...</span>
                </>
              ) : (
                <span>Create Squad</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
