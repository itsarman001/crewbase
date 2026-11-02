import { Role, NavItem, RoleEntitlement } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    allowedRoles: [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST],
  },
  {
    title: "Users",
    href: "/users",
    icon: "Users",
    allowedRoles: [Role.ADMIN, Role.MANAGER, Role.USER],
  },
  {
    title: "Teams",
    href: "/teams",
    icon: "FolderKanban",
    allowedRoles: [Role.ADMIN, Role.MANAGER, Role.USER],
  },
  {
    title: "Roles & RBAC",
    href: "/roles",
    icon: "ShieldAlert",
    allowedRoles: [Role.ADMIN],
  },
];

export const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    description: string;
    badgeClass: string;
    level: number;
  }
> = {
  [Role.ADMIN]: {
    label: "Admin",
    description: "Full administrative control over workspace, teams, users, and RBAC policies.",
    badgeClass: "bg-role-admin-bg text-role-admin border-role-admin-border border font-medium",
    level: 3,
  },
  [Role.MANAGER]: {
    label: "Manager",
    description: "Squad lead authority to supervise scoped team members and assignments.",
    badgeClass: "bg-role-manager-bg text-role-manager border-role-manager-border border font-medium",
    level: 2,
  },
  [Role.USER]: {
    label: "User",
    description: "Standard member privileges to view workspace rosters and personal assignments.",
    badgeClass: "bg-role-user-bg text-role-user border-role-user-border border font-medium",
    level: 1,
  },
  [Role.GUEST]: {
    label: "Guest",
    description: "Restricted read-only observer access to designated public directories.",
    badgeClass: "bg-role-guest-bg text-role-guest border-dashed border-role-guest-border border font-medium",
    level: 0,
  },
};

export const PERMISSION_MATRIX: RoleEntitlement[] = [
  {
    category: "Workspace & System",
    permission: "View Dashboard Overview",
    description: "Read workspace-wide health metrics, team counts, and active seat tallies",
    admin: true,
    manager: true,
    user: true,
    guest: true,
  },
  {
    category: "Workspace & System",
    permission: "Manage RBAC & Entitlements",
    description: "Allocate privilege tiers, configure policy rules, and inspect security posture",
    admin: true,
    manager: false,
    user: false,
    guest: false,
  },
  {
    category: "Directory & Users",
    permission: "View Workspace Directory",
    description: "Browse personnel rosters, search staff, and inspect profile metadata",
    admin: true,
    manager: true,
    user: true,
    guest: false,
  },
  {
    category: "Directory & Users",
    permission: "Provision New User Seats",
    description: "Send workspace invitations and onboard recruits",
    admin: true,
    manager: false,
    user: false,
    guest: false,
  },
  {
    category: "Directory & Users",
    permission: "Reassign User Role Privileges",
    description: "Promote or demote member access levels (protected by Last Admin guard)",
    admin: true,
    manager: false,
    user: false,
    guest: false,
  },
  {
    category: "Directory & Users",
    permission: "Deprovision / Remove Users",
    description: "Revoke workspace credentials and terminate active sessions",
    admin: true,
    manager: false,
    user: false,
    guest: false,
  },
  {
    category: "Squads & Teams",
    permission: "Create & Disband Squads",
    description: "Initialize strategic business squads, generate join codes, or decommission",
    admin: true,
    manager: false,
    user: false,
    guest: false,
  },
  {
    category: "Squads & Teams",
    permission: "Manage Squad Roster",
    description: "Assign or transfer members between specific squads and departments",
    admin: true,
    manager: true,
    user: false,
    guest: false,
  },
  {
    category: "Squads & Teams",
    permission: "Edit Squad Metadata",
    description: "Update squad display labels, department codes, and mission outlines",
    admin: true,
    manager: true,
    user: false,
    guest: false,
  },
];
