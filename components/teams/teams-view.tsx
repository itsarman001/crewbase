"use client";

import { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TeamCard } from "@/components/teams/team-card";
import { TeamRosterDialog } from "@/components/teams/team-roster-dialog";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { can } from "@/lib/permissions";
import { Team, User } from "@/types";
import { Search, Plus, FolderKanban } from "lucide-react";

interface TeamsViewProps {
  initialTeams: Team[];
  initialUsers: User[];
}

export function TeamsView({ initialTeams, initialUsers }: TeamsViewProps) {
  const { user: currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("members-desc");

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canCreateTeam = currentUser ? can(currentUser, "teams:create") : false;

  const refreshRoster = useCallback(async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/users?pageSize=100"),
      ]);
      if (teamsRes.ok && usersRes.ok) {
        const teamsJson = await teamsRes.json();
        const usersJson = await usersRes.json();
        setTeams(teamsJson.data?.teams ?? []);
        setUsers(usersJson.data?.items ?? []);
      }
    } catch (e) {
      console.error("Failed to refresh team data:", e);
    }
  }, []);

  const filteredTeams = useMemo(() => {
    return teams
      .filter((t) => {
        const matchesSearch =
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          t.code.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "members-desc") {
          return (b.memberCount ?? 0) - (a.memberCount ?? 0);
        }
        if (sortBy === "alpha") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [teams, searchQuery, sortBy]);

  const handleManageRoster = (team: Team) => {
    setSelectedTeam(team);
    setRosterDialogOpen(true);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams & Squads"
        badge={
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {teams.length} Active Squads
          </span>
        }
        description="Organize engineering workstreams, cross-functional squads, and member allocations."
      >
        {canCreateTeam && (
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            <span>Create Squad</span>
          </Button>
        )}
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search squad name, mission, or code..."
            className="h-8 pl-8 text-xs bg-muted/30 border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "members-desc")}>
            <SelectTrigger className="h-8 w-44 text-xs bg-muted/30">
              <SelectValue placeholder="Sort squads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="members-desc">Most members first</SelectItem>
              <SelectItem value="alpha">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Squad Cards Grid */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="size-10 text-muted-foreground/60" />}
          title="No squads found"
          description="No organizational squads match the current search criteria."
          actionLabel={canCreateTeam ? "Initialize First Squad" : undefined}
          onAction={canCreateTeam ? () => setCreateDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              members={users}
              onManageRoster={handleManageRoster}
            />
          ))}
        </div>
      )}

      {/* Roster Dialog */}
      <TeamRosterDialog
        team={selectedTeam}
        members={users}
        allUsers={users}
        open={rosterDialogOpen}
        onOpenChange={setRosterDialogOpen}
        onRosterChanged={refreshRoster}
      />

      {/* Create Squad Dialog */}
      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}
