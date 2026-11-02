"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TeamCard } from "@/components/teams/team-card";
import { TeamRosterDialog } from "@/components/teams/team-roster-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockTeams, mockUsers } from "@/data/mock";
import { Team } from "@/types";
import {
  Search,
  Plus,
  Clock,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";

export default function TeamsPage() {
  const [teams] = useState<Team[]>(mockTeams);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("members-desc");
  const [previewMode, setPreviewMode] = useState<"active" | "empty">("active");

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    if (previewMode === "empty") return [];

    return teams
      .filter((t) => {
        const matchesSearch =
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          t.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept =
          departmentFilter === "ALL" ||
          (t.department?.toLowerCase() === departmentFilter.toLowerCase());

        return matchesSearch && matchesDept;
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
  }, [teams, searchQuery, departmentFilter, sortBy, previewMode]);

  const handleManageRoster = (team: Team) => {
    setSelectedTeam(team);
    setRosterDialogOpen(true);
  };

  const handleCreateTeamClick = () => {
    toast.info("Squad Creation API", {
      description: "Team provisioning and SCIM sync will be enabled in Phase 2.",
    });
  };

  const departments = Array.from(
    new Set(teams.map((t) => t.department).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams & Squads"
        badge={
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            5 Strategic Squads
          </span>
        }
        description="Organize engineering workstreams, cross-functional squads, and member allocations."
      >
        {/* View Switcher */}
        <div className="inline-flex items-center p-0.5 rounded-md bg-muted/60 border border-border">
          <button
            onClick={() => setPreviewMode("active")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              previewMode === "active"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderKanban className="size-3.5 text-primary" />
            <span>Active Squads</span>
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

        {/* Disabled CTA with informative tooltip */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                onClick={handleCreateTeamClick}
                className="gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                <span>Create team</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded bg-primary-foreground/20 text-primary-foreground font-medium ml-1">
                  <Clock className="size-2.5" />
                  Phase 2
                </span>
              </Button>
            }
          />
          <TooltipContent>
            <p className="text-xs">Team provisioning API rollout scheduled for Phase 2</p>
          </TooltipContent>
        </Tooltip>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border shadow-2xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams by name, description, or code..."
              className="h-8 pl-8 text-xs bg-muted/30 border-border"
            />
          </div>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val ?? "ALL")}>
            <SelectTrigger className="h-8 w-full sm:w-44 text-xs bg-muted/30">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "members-desc")}>
            <SelectTrigger className="h-8 w-full sm:w-44 text-xs bg-muted/30">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="members-desc">Members (high to low)</SelectItem>
              <SelectItem value="alpha">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric Pill Summary */}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Active teams:</span>
          <span className="font-semibold text-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
            {filteredTeams.length} squads
          </span>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          title="No teams match your query"
          description="Try clearing search filters or switching back to the active directory."
          actionLabel="Reset filters"
          onAction={() => {
            setSearchQuery("");
            setDepartmentFilter("ALL");
            setPreviewMode("active");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              members={mockUsers}
              onManageRoster={handleManageRoster}
            />
          ))}
        </div>
      )}

      {/* Roster Detail Dialog */}
      <TeamRosterDialog
        team={selectedTeam}
        members={mockUsers}
        open={rosterDialogOpen}
        onOpenChange={setRosterDialogOpen}
      />
    </div>
  );
}
