import test from "node:test";
import assert from "node:assert/strict";
import { can, canAccessRoute, hasMinimumRole } from "../lib/permissions";
import { Role } from "../types";

test("Permission Matrix: Dashboard access", () => {
  assert.equal(can(Role.ADMIN, "dashboard:view"), true);
  assert.equal(can(Role.MANAGER, "dashboard:view"), true);
  assert.equal(can(Role.USER, "dashboard:view"), true);
  assert.equal(can(Role.GUEST, "dashboard:view"), true);
});

test("Permission Matrix: Role & RBAC view/manage", () => {
  assert.equal(can(Role.ADMIN, "roles:view"), true);
  assert.equal(can(Role.ADMIN, "roles:manage"), true);

  assert.equal(can(Role.MANAGER, "roles:view"), false);
  assert.equal(can(Role.MANAGER, "roles:manage"), false);

  assert.equal(can(Role.USER, "roles:view"), false);
  assert.equal(can(Role.USER, "roles:manage"), false);

  assert.equal(can(Role.GUEST, "roles:view"), false);
  assert.equal(can(Role.GUEST, "roles:manage"), false);
});

test("Permission Matrix: User creation, deletion, role assignment", () => {
  // Only Admin can create, delete, or change user role
  assert.equal(can(Role.ADMIN, "users:create"), true);
  assert.equal(can(Role.ADMIN, "users:delete"), true);
  assert.equal(can(Role.ADMIN, "users:change_role"), true);

  assert.equal(can(Role.MANAGER, "users:create"), false);
  assert.equal(can(Role.MANAGER, "users:delete"), false);
  assert.equal(can(Role.MANAGER, "users:change_role"), false);

  assert.equal(can(Role.USER, "users:create"), false);
  assert.equal(can(Role.USER, "users:delete"), false);
  assert.equal(can(Role.USER, "users:change_role"), false);

  assert.equal(can(Role.GUEST, "users:create"), false);
  assert.equal(can(Role.GUEST, "users:delete"), false);
  assert.equal(can(Role.GUEST, "users:change_role"), false);
});

test("Permission Matrix: User editing permissions", () => {
  const admin = { id: "admin-1", role: Role.ADMIN, teamId: "team-eng" };
  const manager = { id: "mgr-1", role: Role.MANAGER, teamId: "team-eng" };
  const user = { id: "usr-1", role: Role.USER, teamId: "team-eng" };
  const guest = { id: "gst-1", role: Role.GUEST, teamId: null };

  // Admin can edit anyone
  assert.equal(can(admin, "users:edit", { targetUserId: "other-user" }), true);

  // User can edit self only
  assert.equal(can(user, "users:edit", { targetUserId: "usr-1" }), true);
  assert.equal(can(user, "users:edit", { targetUserId: "other-user" }), false);

  // Manager can edit self
  assert.equal(can(manager, "users:edit", { targetUserId: "mgr-1" }), true);
  // Manager can edit members of own team
  assert.equal(
    can(manager, "users:edit", { targetUserId: "usr-1", targetUserTeamId: "team-eng" }),
    true
  );
  // Manager cannot edit members of other teams
  assert.equal(
    can(manager, "users:edit", { targetUserId: "usr-2", targetUserTeamId: "team-dsn" }),
    false
  );

  // Guest cannot edit
  assert.equal(can(guest, "users:edit", { targetUserId: "gst-1" }), false);
});

test("Permission Matrix: Teams view and management", () => {
  const manager = { id: "mgr-1", role: Role.MANAGER, teamId: "team-eng" };
  const user = { id: "usr-1", role: Role.USER, teamId: "team-eng" };
  const guest = { id: "gst-1", role: Role.GUEST, teamId: null };

  // Admin has full team permissions
  assert.equal(can(Role.ADMIN, "teams:create"), true);
  assert.equal(can(Role.ADMIN, "teams:delete"), true);
  assert.equal(can(Role.ADMIN, "teams:edit"), true);
  assert.equal(can(Role.ADMIN, "teams:manage_members"), true);

  // Manager cannot create or delete teams
  assert.equal(can(manager, "teams:create"), false);
  assert.equal(can(manager, "teams:delete"), false);

  // Manager can edit own team and manage members
  assert.equal(can(manager, "teams:edit", { targetTeamId: "team-eng" }), true);
  assert.equal(can(manager, "teams:edit", { targetTeamId: "team-dsn" }), false);
  assert.equal(can(manager, "teams:manage_members", { targetTeamId: "team-eng" }), true);
  assert.equal(can(manager, "teams:manage_members", { targetTeamId: "team-dsn" }), false);

  // User and Guest cannot edit teams or manage members
  assert.equal(can(user, "teams:edit", { targetTeamId: "team-eng" }), false);
  assert.equal(can(user, "teams:manage_members", { targetTeamId: "team-eng" }), false);
  assert.equal(can(guest, "teams:view"), false);
});

test("Route Access Checks", () => {
  assert.equal(canAccessRoute(Role.ADMIN, "/roles"), true);
  assert.equal(canAccessRoute(Role.MANAGER, "/roles"), false);
  assert.equal(canAccessRoute(Role.USER, "/roles"), false);
  assert.equal(canAccessRoute(Role.GUEST, "/roles"), false);

  assert.equal(canAccessRoute(Role.ADMIN, "/users"), true);
  assert.equal(canAccessRoute(Role.MANAGER, "/users"), true);
  assert.equal(canAccessRoute(Role.USER, "/users"), true);
  assert.equal(canAccessRoute(Role.GUEST, "/users"), false);

  assert.equal(canAccessRoute(Role.ADMIN, "/dashboard"), true);
  assert.equal(canAccessRoute(Role.GUEST, "/dashboard"), true);
});

test("Role Hierarchy Helper", () => {
  assert.equal(hasMinimumRole(Role.ADMIN, Role.USER), true);
  assert.equal(hasMinimumRole(Role.MANAGER, Role.USER), true);
  assert.equal(hasMinimumRole(Role.USER, Role.MANAGER), false);
  assert.equal(hasMinimumRole(Role.GUEST, Role.USER), false);
});
