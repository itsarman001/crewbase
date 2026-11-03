import { Role } from "@/types";

export type AppAction =
  | "dashboard:view"
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "users:change_role"
  | "teams:view"
  | "teams:create"
  | "teams:delete"
  | "teams:edit"
  | "teams:manage_members"
  | "roles:view"
  | "roles:manage";

export interface PermissionContext {
  userId?: string;
  userTeamId?: string | null;
  targetUserId?: string;
  targetUserTeamId?: string | null;
  targetTeamId?: string | null;
  isSelf?: boolean;
}

export interface PermissionActor {
  id?: string;
  role: Role;
  teamId?: string | null;
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.USER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
};

export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Single source of truth for all RBAC checks in Crewbase.
 * Strictly implements the permission matrix in docs/SPEC.md.
 * Must NOT query the database.
 */
export function can(
  actor: PermissionActor | Role,
  action: AppAction,
  context?: PermissionContext,
): boolean {
  const role: Role = typeof actor === "string" ? actor : actor.role;
  const actorId: string | undefined = typeof actor === "object" ? actor.id : context?.userId;
  const actorTeamId: string | null | undefined =
    typeof actor === "object" ? actor.teamId : context?.userTeamId;

  // 1. Dashboard
  if (action === "dashboard:view") {
    return true; // All authenticated roles can view dashboard (Guest is limited)
  }

  // 2. Roles & RBAC (Admin only)
  if (action === "roles:view" || action === "roles:manage") {
    return role === Role.ADMIN;
  }

  // 3. User operations
  if (action === "users:create" || action === "users:delete" || action === "users:change_role") {
    return role === Role.ADMIN;
  }

  if (action === "users:view") {
    if (role === Role.GUEST) return false;
    if (role === Role.ADMIN) return true;

    // MANAGER and USER: own team only or general scoped view
    if (context?.targetUserTeamId !== undefined) {
      if (!context.targetUserTeamId || !actorTeamId) return false;
      return context.targetUserTeamId === actorTeamId;
    }
    return true;
  }

  if (action === "users:edit") {
    if (role === Role.ADMIN) return true;
    if (role === Role.GUEST) return false;

    // Check self-edit
    const isTargetSelf =
      context?.isSelf ||
      (Boolean(context?.targetUserId) && Boolean(actorId) && context?.targetUserId === actorId);

    if (role === Role.USER) {
      return Boolean(isTargetSelf);
    }

    if (role === Role.MANAGER) {
      if (isTargetSelf) return true;
      // Manager can edit members of their own team
      if (context?.targetUserTeamId && actorTeamId) {
        return context.targetUserTeamId === actorTeamId;
      }
      return false;
    }

    return false;
  }

  // 4. Team operations
  if (action === "teams:create" || action === "teams:delete") {
    return role === Role.ADMIN;
  }

  if (action === "teams:view") {
    if (role === Role.GUEST) return false;
    if (role === Role.ADMIN) return true;

    // MANAGER / USER can view their own team
    if (context?.targetTeamId !== undefined) {
      if (!context.targetTeamId || !actorTeamId) return false;
      return context.targetTeamId === actorTeamId;
    }
    return true;
  }

  if (action === "teams:edit" || action === "teams:manage_members") {
    if (role === Role.ADMIN) return true;
    if (role === Role.MANAGER) {
      if (context?.targetTeamId && actorTeamId) {
        return context.targetTeamId === actorTeamId;
      }
      return false;
    }
    return false;
  }

  return false;
}

/**
 * Check whether a role has access to a top-level page route.
 * Matches SPEC.md Section 5:
 * /dashboard: Any signed-in user
 * /users: ADMIN, MANAGER, USER (scoped), not GUEST
 * /teams: ADMIN, MANAGER, USER (scoped), not GUEST
 * /roles: ADMIN only
 * /profile: Any signed-in user
 */
export function canAccessRoute(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/roles")) {
    return role === Role.ADMIN;
  }
  if (pathname.startsWith("/users") || pathname.startsWith("/teams")) {
    return role !== Role.GUEST;
  }
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/system-states")) {
    return true;
  }
  return true;
}
