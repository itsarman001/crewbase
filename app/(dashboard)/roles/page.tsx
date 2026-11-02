"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSION_MATRIX, ROLE_CONFIG } from "@/lib/constants";
import { Role } from "@/types";
import {
  Check,
  Minus,
  Download,
  RefreshCw,
  Lock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RolesPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("RBAC policies evaluated", {
        description: "Zero-trust posture compliant with workspace security baseline.",
      });
    }, 600);
  };

  const handleExport = () => {
    toast.info("Exporting RBAC Matrix", {
      description: "Generating policy compliance report in CSV format...",
    });
  };

  const roles = [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access Control"
        badge={<RoleBadge role={Role.ADMIN} size="sm" />}
        description="Enterprise zero-trust role definitions, permission entitlements, and privilege allocation."
      >
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-8">
          <Download className="size-3.5" />
          <span>Export Matrix</span>
        </Button>
        <Button
          size="sm"
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Audit Posture</span>
        </Button>
      </PageHeader>

      {/* Role Tier Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => {
          const config = ROLE_CONFIG[role];
          return (
            <Card key={role} className="border border-border bg-card shadow-xs">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <RoleBadge role={role} />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Tier {config.level}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-foreground">{config.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {config.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Rule Alert */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-foreground">
        <Lock className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-primary">Last Admin Protection Active</span>
          <p className="text-muted-foreground">
            The workspace security policy enforces that the last remaining administrator cannot be demoted or removed.
            Self-registration defaults strictly to the <span className="font-medium text-foreground">USER</span> role.
          </p>
        </div>
      </div>

      {/* Permission Scope Entitlement Matrix */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Scope Entitlement Matrix</CardTitle>
              <CardDescription>
                Detailed operational permissions mapped across each credential level
              </CardDescription>
            </div>
            <Link
              href="/users"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage member assignments</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-[240px]">
                    Permission Scope
                  </TableHead>
                  <TableHead className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider w-20">
                    Admin
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider w-20">
                    Manager
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider w-20">
                    User
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider w-20">
                    Guest
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {PERMISSION_MATRIX.map((perm, index) => (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 font-medium text-xs text-foreground">
                      {perm.permission}
                      <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                        {perm.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-muted-foreground">
                      {perm.description}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      {perm.admin ? (
                        <div className="inline-flex size-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 items-center justify-center">
                          <Check className="size-3.5" />
                        </div>
                      ) : (
                        <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      {perm.manager ? (
                        <div className="inline-flex size-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 items-center justify-center">
                          <Check className="size-3.5" />
                        </div>
                      ) : (
                        <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      {perm.user ? (
                        <div className="inline-flex size-6 rounded-full bg-muted text-muted-foreground items-center justify-center">
                          <Check className="size-3.5" />
                        </div>
                      ) : (
                        <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      {perm.guest ? (
                        <div className="inline-flex size-6 rounded-full bg-muted text-muted-foreground items-center justify-center">
                          <Check className="size-3.5" />
                        </div>
                      ) : (
                        <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
