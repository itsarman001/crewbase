"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RoleBadge } from "@/components/shared/role-badge";
import { DataTable, ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Role, StatMetric } from "@/types";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Users,
  FolderKanban,
  ShieldAlert,
  ShieldCheck,
  Search,
  MoreHorizontal,
  ExternalLink,
  Activity,
} from "lucide-react";

export interface RoleDistributionItem {
  role: Role;
  count: number;
  percentage: number;
  label: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  actor: string;
  time: string;
}

interface DashboardViewProps {
  stats: StatMetric[];
  roleDistribution: RoleDistributionItem[];
  recentActivity: ActivityItem[];
  initialUsers: User[];
}

export function DashboardView({
  stats,
  roleDistribution,
  recentActivity,
  initialUsers,
}: DashboardViewProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "ALL">("ALL");

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRole === "ALL" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [initialUsers, searchQuery, selectedRole]);

  const columns: ColumnDef<User>[] = [
    {
      header: "Member",
      cell: (user) => {
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 border border-border">
              <AvatarFallback className="text-xs font-medium bg-muted text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-sm leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Privilege Tier",
      cell: (user) => <RoleBadge role={user.role} />,
    },
    {
      header: "Assigned Squad",
      cell: (user) => (
        <span className="text-sm text-foreground/90">
          {user.team && typeof user.team === "object" && "name" in user.team
            ? user.team.name
            : "Direct Guest / Unassigned"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: () => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
          Active
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-12 text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="size-7">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/users?search=${encodeURIComponent(user.email)}`} />}>
              View in Directory
            </DropdownMenuItem>
            {currentUser?.role === Role.ADMIN && (
              <DropdownMenuItem render={<Link href="/roles" />}>
                Audit Privileges
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Workspace Overview"
        badge={
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Zero-Trust Enforced
          </span>
        }
        description="Real-time security posture, personnel directory health, and active squad allocations."
      >
        <Button variant="outline" size="sm" render={<Link href="/teams" />} className="gap-1.5 h-8">
          <FolderKanban className="size-3.5" />
          <span>Squads</span>
        </Button>
        <Button size="sm" render={<Link href="/users" />} className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <Users className="size-3.5" />
          <span>Manage Users</span>
        </Button>
      </PageHeader>

      {/* Top Stat Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((metric, i) => {
          const icon =
            i === 0 ? (
              <Users className="size-4" />
            ) : i === 1 ? (
              <FolderKanban className="size-4" />
            ) : i === 2 ? (
              <ShieldAlert className="size-4" />
            ) : (
              <ShieldCheck className="size-4" />
            );

          return (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              description={metric.description}
              icon={icon}
            />
          );
        })}
      </div>

      {/* Role Privilege Distribution Bar */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Role Privilege Allocation</CardTitle>
              <CardDescription>
                Enterprise zero-trust role segmentation across active personnel
              </CardDescription>
            </div>
            {currentUser?.role === Role.ADMIN && (
              <Link
                href="/roles"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>View full RBAC matrix</span>
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stacked Multi-segment Distribution Bar */}
          <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex">
            {roleDistribution.map((item, idx) => {
              const bg =
                idx === 0
                  ? "bg-indigo-600"
                  : idx === 1
                  ? "bg-blue-600"
                  : idx === 2
                  ? "bg-zinc-400 dark:bg-zinc-600"
                  : "bg-zinc-200 dark:bg-zinc-800";
              return (
                <div
                  key={item.role}
                  style={{ width: `${item.percentage}%` }}
                  className={`${bg} transition-all`}
                  title={`${item.label}: ${item.count}`}
                />
              );
            })}
          </div>

          {/* Role Badges with Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {roleDistribution.map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <RoleBadge role={item.role} size="sm" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {item.count}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Recent Roster + Security Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Roster Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Personnel Directory Snapshot
              </h2>
              <p className="text-xs text-muted-foreground">
                Active squad members and current privilege levels
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-card border-border"
                />
              </div>
              <div className="flex rounded-md border border-border p-0.5 bg-muted/40">
                {(["ALL", Role.ADMIN, Role.MANAGER, Role.USER] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                      selectedRole === r
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "ALL" ? "All" : r.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            pageSize={6}
            emptyTitle="No members match filter"
            emptyDescription="Try adjusting your search query or role filter."
          />
        </div>

        {/* Security & Access Activity Feed */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              <Activity className="size-4 text-primary" />
              <span>Governance Telemetry</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Recent privilege adjustments and workspace events
            </p>
          </div>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="pb-3 border-b border-border/70 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {activity.action}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.detail}
                  </p>
                  <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                    Triggered by: <span className="font-medium text-foreground/80">{activity.actor}</span>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
