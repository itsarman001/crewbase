"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { DataTable, ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeRoleDialog } from "@/components/users/change-role-dialog";
import { ChangeTeamDialog } from "@/components/users/change-team-dialog";
import { InviteUserDialog } from "@/components/users/invite-user-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { mockUsers, mockTeams, mockCurrentUser } from "@/data/mock";
import { User, Role, Team } from "@/types";
import {
  Search,
  UserPlus,
  Download,
  FilterX,
  MoreHorizontal,
  Shield,
  FolderKanban,
  UserX,
  Lock,
  Eye,
  Users as UsersIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [teamFilter, setTeamFilter] = React.useState<string>("all");
  const [previewMode, setPreviewMode] = React.useState<"active" | "non-admin" | "skeleton" | "empty">("active");

  // Dialog states
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  // Filter logic
  const filteredUsers = React.useMemo(() => {
    if (previewMode === "empty") return [];

    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesTeam =
        teamFilter === "all" ||
        (u.team && typeof u.team === "object" && "id" in u.team && u.team.id === teamFilter);

      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [users, searchQuery, roleFilter, teamFilter, previewMode]);

  const handleRoleChanged = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleTeamChanged = (userId: string, newTeam: Team | null) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              teamId: newTeam?.id ?? null,
              team: newTeam,
            }
          : u
      )
    );
  };

  const handleUserInvited = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    toast.success(`Member removed`, {
      description: `${userToDelete.name} has been deprovisioned from the workspace.`,
    });
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setTeamFilter("all");
  };

  const handleExportCSV = () => {
    toast.info("Exporting Roster CSV", {
      description: "Generating spreadsheet export of 26 active directory members...",
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      header: (
        <div className="flex items-center justify-center">
          <Checkbox aria-label="Select all" />
        </div>
      ),
      className: "w-10 text-center",
      cell: () => (
        <div className="flex items-center justify-center">
          <Checkbox aria-label="Select row" />
        </div>
      ),
    },
    {
      header: "User",
      cell: (user) => {
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const isCurrent = user.id === mockCurrentUser.id;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 border border-border shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm truncate">
                  {user.name}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      cell: (user) => <RoleBadge role={user.role} />,
    },
    {
      header: "Squad / Team",
      cell: (user) => (
        <span className="text-sm text-foreground">
          {user.team && typeof user.team === "object" && "name" in user.team ? (
            user.team.name
          ) : (
            <span className="text-muted-foreground italic text-xs">No team</span>
          )}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.lastActive ?? "Recently"}
        </span>
      ),
    },
    ...(previewMode !== "non-admin"
      ? [
          {
            header: "Actions",
            className: "w-16 text-right",
            cell: (user: User) => {
              // Admin protection demo: Sarah Lin or Last Admin
              const isLockedAdmin = user.role === Role.ADMIN && user.id === mockCurrentUser.id;

              if (isLockedAdmin) {
                return (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled
                          className="size-7 text-muted-foreground/50 cursor-not-allowed"
                        >
                          <Lock className="size-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      <p className="text-xs">Self or primary Admin role is protected</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setRoleDialogOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Shield className="size-4 text-primary mr-2" />
                      <span>Change role</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setTeamDialogOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <FolderKanban className="size-4 text-muted-foreground mr-2" />
                      <span>Assign squad</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <UserX className="size-4 mr-2" />
                      <span>Remove member</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage workspace members, administrative privileges, and team allocations."
      >
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 h-8">
          <Download className="size-3.5" />
          <span>Export CSV</span>
        </Button>
        <Button
          size="sm"
          onClick={() => setInviteDialogOpen(true)}
          className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="size-3.5" />
          <span>Invite Member</span>
        </Button>
      </PageHeader>

      {/* State Switcher (Stitch interactive mode sandbox) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-lg bg-card border border-border shadow-2xs">
        <div className="inline-flex items-center p-0.5 rounded-md bg-muted/60 border border-border/80">
          <button
            onClick={() => setPreviewMode("active")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              previewMode === "active"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UsersIcon className="size-3.5 text-primary" />
            <span>Active Directory</span>
          </button>
          <button
            onClick={() => setPreviewMode("non-admin")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              previewMode === "non-admin"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3.5" />
            <span>Non-Admin View</span>
          </button>
          <button
            onClick={() => setPreviewMode("skeleton")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              previewMode === "skeleton"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCcw className="size-3.5" />
            <span>Skeleton State</span>
          </button>
          <button
            onClick={() => setPreviewMode("empty")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              previewMode === "empty"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Empty State</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Active directory count:</span>
          <span className="font-semibold text-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
            {filteredUsers.length} members
          </span>
        </div>
      </div>

      {/* Non-Admin View Notice */}
      {previewMode === "non-admin" && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Eye className="size-4 text-primary" />
            <span>Read-only simulation • Administrative modification controls are omitted.</span>
          </div>
          <span className="text-muted-foreground">Manager / User View</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border shadow-2xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="h-8 pl-8 text-xs bg-muted/30 border-border"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? "all")}>
            <SelectTrigger className="h-8 w-full sm:w-36 text-xs bg-muted/30">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>

          {/* Team Filter */}
          <Select value={teamFilter} onValueChange={(val) => setTeamFilter(val ?? "all")}>
            <SelectTrigger className="h-8 w-full sm:w-44 text-xs bg-muted/30">
              <SelectValue placeholder="All squads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All squads</SelectItem>
              {mockTeams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchQuery || roleFilter !== "all" || teamFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <FilterX className="size-3.5" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={previewMode === "skeleton"}
        pageSize={8}
        emptyTitle="No members found"
        emptyDescription="No directory members match the active filters or search criteria."
      />

      {/* Connected Dialogs */}
      <ChangeRoleDialog
        user={selectedUser}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onRoleChanged={handleRoleChanged}
      />

      <ChangeTeamDialog
        user={selectedUser}
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        onTeamChanged={handleTeamChanged}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onUserInvited={handleUserInvited}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Remove Member"
        description={`Are you sure you want to remove ${userToDelete?.name} from the workspace? All active access tokens will be terminated.`}
        confirmLabel="Remove member"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
