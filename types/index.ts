// ==========================================
// PRISMA MODEL MIRRORS
// Must match prisma/schema.prisma strictly
// ==========================================

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  GUEST = "GUEST",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string | null;
  team?: Team | { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;

  // UI / presentation helpers (optional)
  avatarUrl?: string;
  status?: "ACTIVE" | "INVITED" | "SUSPENDED";
  department?: string;
  lastActive?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  member?: User[];
  members?: User[]; // alias for convenience in UI
  _count?: {
    member?: number;
  };
  createdAt: Date;
  updatedAt: Date;

  // UI / presentation helpers (optional)
  department?: string;
  leadId?: string;
  leadName?: string;
  memberCount?: number;
}

// ==========================================
// UI / PRESENTATION TYPES
// ==========================================

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface StatMetric {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  iconName?: string;
}

export interface RoleEntitlement {
  category: string;
  permission: string;
  description: string;
  admin: boolean;
  manager: boolean;
  user: boolean;
  guest: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  allowedRoles: Role[];
  badge?: string;
}
