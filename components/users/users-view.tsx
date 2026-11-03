"use client";

import { useState, useMemo } from "react";
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
import { useAuth } from "@/components/auth/auth-provider";
import { can } from "@/lib/permissions";
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
} from "lucide-react";
import { toast } from "sonner";

interface UsersViewProps {
  initialUsers: User[];
  teams: Team[];
}

export function UsersView({ initialUsers, teams }: UsersViewProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const canCreate = currentUser ? can(currentUser, "users:create") : false;

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesTeam =
        teamFilter === "all" ||
        (u.teamId && u.teamId === teamFilter) ||
        (u.team && typeof u.team === "object" && "id" in u.team && u.team.id === teamFilter);

      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [users, searchQuery, roleFilter, teamFilter]);

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

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Deprovisioning failed", {
          description: json.error?.message ?? "Could not remove member.",
        });
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success("Member removed", {
        description: `${userToDelete.name} has been deprovisioned from the workspace.`,
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch {
      toast.error("Network error removing member");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setTeamFilter("all");
  };

  const handleExportCSV = () => {
    const headers = "Name,Email,Role,Squad,Created\n";
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.name}","${u.email}","${u.role}","${u.team && "name" in u.team ? u.team.name : "None"}","${new Date(u.createdAt).toISOString()}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `crewbase-roster-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Roster CSV exported");
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
        const isCurrent = currentUser?.id === user.id;

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
            <span className="text-muted-foreground italic text-xs">No squad</span>
          )}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (user) => (
        <span className="text-xs text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-16 text-right",
      cell: (user: User) => {
        const isCurrent = currentUser?.id === user.id;
        const canEditUser = currentUser
          ? can(currentUser, "users:edit", {
              targetUserId: user.id,
              targetUserTeamId: user.teamId,
              isSelf: isCurrent,
            })
          : false;

        const canDeleteThisUser = currentUser ? can(currentUser, "users:delete") : false;
        const canChangeRole = currentUser ? can(currentUser, "users:change_role") : false;

        if (!canEditUser && !canDeleteThisUser && !canChangeRole) {
          return null;
        }

        // Last Admin or self protection lock icon
        if (user.role === Role.ADMIN && isCurrent) {
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
                <p className="text-xs">Self admin role is protected</p>
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
              {canChangeRole && (
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
              )}
              {canEditUser && (
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
              )}
              {canDeleteThisUser && (
                <>
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
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
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
        {canCreate && (
          <Button
            size="sm"
            onClick={() => setInviteDialogOpen(true)}
            className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="size-3.5" />
            <span>Invite Member</span>
          </Button>
        )}
      </PageHeader>

      {/* Directory count summary */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Active directory roster:</span>
          <span className="font-semibold text-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
            {filteredUsers.length} members
          </span>
        </div>
      </div>

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
              {teams.map((t) => (
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
        pageSize={10}
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
        teams={teams}
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        onTeamChanged={handleTeamChanged}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        teams={teams}
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
