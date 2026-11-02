"use client";

import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockCurrentUser } from "@/data/mock";
import {
  Laptop,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  Check,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = mockCurrentUser;
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [isSaving, setIsSaving] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile saved successfully");
    }, 600);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    toast.success(`Theme set to ${newTheme}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Profile & Preferences"
        description="Manage your identity credentials, active browser sessions, and workspace appearance."
      />

      {/* Identity Card */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-border">
              <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">{user.name}</CardTitle>
                <RoleBadge role={user.role} />
              </div>
              <CardDescription className="text-xs">
                {user.email} • {user.department ?? "Engineering"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Email (SCIM Synced)</label>
              <Input
                value={email}
                disabled
                className="h-9 text-sm bg-muted/50 cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                Managed by Enterprise Single Sign-On (Okta / SAML).
              </p>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Theme Appearance Selector */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance & Mode</CardTitle>
          <CardDescription>
            Switch between light, dark, and system color preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 text-foreground"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <Sun className="size-5" />
              <span>Light</span>
              {theme === "light" && <Check className="size-3.5 text-primary" />}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 text-foreground"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <Moon className="size-5" />
              <span>Dark</span>
              {theme === "dark" && <Check className="size-3.5 text-primary" />}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 text-foreground"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <Monitor className="size-5" />
              <span>System</span>
              {theme === "system" && <Check className="size-3.5 text-primary" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
          <CardDescription>
            Devices currently authorized with valid JWT access tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <Laptop className="size-5 text-primary" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Chrome on Linux (X11)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Current Session
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  IP: 192.168.1.42 • Session expires in 7 days
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => toast.info("Current session cannot be revoked from self.")}
              disabled
            >
              Active
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="size-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Mobile Safari on iOS
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Last active: 2 hours ago • New York, USA
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => toast.success("Terminated iOS session.")}
              className="text-destructive hover:text-destructive"
            >
              Revoke
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
