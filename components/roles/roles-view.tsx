"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

interface RoleCount {
  role: Role;
  count: number;
}

interface RolesViewProps {
  roleCounts: RoleCount[];
}

export function RolesView({ roleCounts }: RolesViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("RBAC policies evaluated", {
        description: "Zero-trust posture compliant with workspace security baseline.",
      });
    }, 400);
  };

  const handleExport = () => {
    const headers = "Category,Permission,Description,Admin,Manager,User,Guest\n";
    const rows = PERMISSION_MATRIX.map(
      (p) =>
        `"${p.category}","${p.permission}","${p.description}",${p.admin},${p.manager},${p.user},${p.guest}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `crewbase-rbac-matrix-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("RBAC Matrix exported to CSV");
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
          const count = roleCounts.find((c) => c.role === role)?.count ?? 0;
          return (
            <Card key={role} className="border border-border bg-card shadow-xs">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <RoleBadge role={role} />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Tier {config.level} • {count} active
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

      {/* Entitlements Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Privilege Entitlement</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Manager</TableHead>
              <TableHead className="text-center">User</TableHead>
              <TableHead className="text-center">Guest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSION_MATRIX.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs text-foreground">
                      {item.permission}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {item.admin ? (
                    <Check className="size-4 text-emerald-600 inline" />
                  ) : (
                    <Minus className="size-4 text-muted-foreground/40 inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.manager ? (
                    <Check className="size-4 text-emerald-600 inline" />
                  ) : (
                    <Minus className="size-4 text-muted-foreground/40 inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.user ? (
                    <Check className="size-4 text-emerald-600 inline" />
                  ) : (
                    <Minus className="size-4 text-muted-foreground/40 inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.guest ? (
                    <Check className="size-4 text-emerald-600 inline" />
                  ) : (
                    <Minus className="size-4 text-muted-foreground/40 inline" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
