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
import {
  mockStats,
  mockUsers,
  mockRoleDistribution,
  mockRecentActivity,
} from "@/data/mock";
import { User, Role } from "@/types";
import {
  Users,
  FolderKanban,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "ALL">("ALL");

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRole === "ALL" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, selectedRole]);

  const handleInviteClick = () => {
    toast.info("Invite modal triggered", {
      description: "User invitation workflow will be enabled in Phase 2.",
    });
  };

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
      header: "Activity",
      cell: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.lastActive ?? "Recently"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-16 text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              render={<Link href="/users" className="flex items-center gap-2 cursor-pointer w-full" />}
            >
              <span>Manage in Users</span>
              <ExternalLink className="size-3.5 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.info(`Inspect privileges for ${user.name}`, {
                  description: "Will open user drawer in Phase 2.",
                })
              }
            >
              <span>View Permissions</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Overview"
        description="Unified status of team allocations, privilege distribution, and security posture."
      >
        <Button variant="outline" size="sm" onClick={handleInviteClick} className="gap-1.5 h-8">
          <UserPlus className="size-3.5" />
          <span>Invite Member</span>
        </Button>
        <Button size="sm" render={<Link href="/roles" />} className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <ShieldAlert className="size-3.5" />
          <span>Configure RBAC</span>
        </Button>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={mockStats[0].title}
          value={mockStats[0].value}
          change={mockStats[0].change}
          trend={mockStats[0].trend}
          description={mockStats[0].description}
          icon={<Users className="size-4 text-primary" />}
        />
        <StatCard
          title={mockStats[1].title}
          value={mockStats[1].value}
          change={mockStats[1].change}
          trend={mockStats[1].trend}
          description={mockStats[1].description}
          icon={<FolderKanban className="size-4 text-primary" />}
        />
        <StatCard
          title={mockStats[2].title}
          value={mockStats[2].value}
          change={mockStats[2].change}
          trend={mockStats[2].trend}
          description={mockStats[2].description}
          icon={<ShieldAlert className="size-4 text-primary" />}
        />
        <StatCard
          title={mockStats[3].title}
          value={mockStats[3].value}
          change={mockStats[3].change}
          trend={mockStats[3].trend}
          description={mockStats[3].description}
          icon={<ShieldCheck className="size-4 text-primary" />}
        />
      </div>

      {/* Role Distribution & Access Governance Visualizer */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Role Privilege Allocation</CardTitle>
              <CardDescription>
                Enterprise zero-trust role segmentation across active personnel
              </CardDescription>
            </div>
            <Link
              href="/roles"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>View full RBAC matrix</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stacked Multi-segment Distribution Bar */}
          <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex">
            <div
              style={{ width: `${mockRoleDistribution[0].percentage}%` }}
              className="bg-indigo-600 transition-all"
              title={`Admin: ${mockRoleDistribution[0].count}`}
            />
            <div
              style={{ width: `${mockRoleDistribution[1].percentage}%` }}
              className="bg-blue-600 transition-all"
              title={`Manager: ${mockRoleDistribution[1].count}`}
            />
            <div
              style={{ width: `${mockRoleDistribution[2].percentage}%` }}
              className="bg-zinc-400 dark:bg-zinc-600 transition-all"
              title={`User: ${mockRoleDistribution[2].count}`}
            />
            <div
              style={{ width: `${mockRoleDistribution[3].percentage}%` }}
              className="bg-zinc-200 dark:bg-zinc-800 transition-all"
              title={`Guest: ${mockRoleDistribution[3].count}`}
            />
          </div>

          {/* Role Badges with Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {mockRoleDistribution.map((item) => (
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
              {mockRecentActivity.map((activity) => (
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
