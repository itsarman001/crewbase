import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full border border-border shadow-xs text-center p-6 sm:p-8">
        <CardContent className="space-y-4 p-0">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileQuestion className="size-7" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">
              Error 404
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Page Not Found
            </h1>
            <p className="text-sm text-muted-foreground">
              The requested directory route or workspace resource could not be located.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard" className="gap-1.5" />}
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Safety</span>
            </Button>
            <Button
              size="sm"
              render={<Link href="/dashboard" className="gap-1.5 bg-primary text-primary-foreground" />}
            >
              <Home className="size-3.5" />
              <span>Workspace Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
