"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ShieldAlert,
  Lock,
  FileQuestion,
  ServerCrash,
  WifiOff,
  ArrowLeft,
  RotateCcw,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SystemStatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System States & Error Handlers"
        description="Preview of zero-trust exception screens, session expiration dialogs, and error boundaries."
      />

      {/* Connectivity Banner */}
      <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300">
        <WifiOff className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-xs font-semibold">Simulated Offline State</AlertTitle>
        <AlertDescription className="text-xs">
          Real-time WebSocket reconnection active. Changes will sync once back online.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 401 Session Expired */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted">
                HTTP 401
              </span>
              <CardTitle className="text-base font-semibold">Session Expired</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Triggered when the httpOnly authentication JWT is expired or revoked.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Lock className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Authentication Required</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your credentials have expired. Please re-authenticate to continue.
                </p>
              </div>
              <Button size="sm" render={<Link href="/login" className="gap-1.5" />}>
                <LogIn className="size-3.5" />
                <span>Return to Login</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 403 Forbidden Access */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                HTTP 403
              </span>
              <CardTitle className="text-base font-semibold">Access Restricted</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Triggered when the signed-in role lacks scope to access a protected resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-3">
              <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Insufficient Privilege Tier</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  You need ADMIN privilege to view or edit this section. Contact workspace owner.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/dashboard" className="gap-1.5" />}
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 404 Route Not Found */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted">
                HTTP 404
              </span>
              <CardTitle className="text-base font-semibold">Resource Not Found</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Triggered when an unmapped route or nonexistent squad is requested.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <FileQuestion className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Page Not Found</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  The requested resource or squad code does not exist.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/dashboard" className="gap-1.5" />}
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 500 Server Fault */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                HTTP 500
              </span>
              <CardTitle className="text-base font-semibold">Internal Service Fault</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Triggered when a backend or database exception occurs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-3">
              <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ServerCrash className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Server Connection Interrupted</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  An unexpected fault occurred in the downstream service. The incident has been logged.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Retrying connection...")}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span>Retry Request</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
