import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function ForbiddenState({
  title = "Access Restricted",
  description = "You do not have the required RBAC privilege level to view this resource. Contact your workspace administrator for elevated credentials.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto">
      <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <ShieldAlert className="size-8" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {description}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
          <ArrowLeft className="size-4 mr-2" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
