import { prisma } from "@/lib/prisma";
import { safeUserSelect, hashPassword } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Role, User } from "@/types";
import { CreateUserInput, UpdateUserInput, UserQueryInput } from "@/lib/validations/user";
import { Prisma } from "@prisma/client";

export class UserServiceError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT",
    public status: number,
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}

export async function listUsers(actor: User, query: Partial<UserQueryInput> = {}) {
  if (!can(actor, "users:view")) {
    throw new UserServiceError("You do not have permission to view users", "FORBIDDEN", 403);
  }

  const { page = 1, pageSize = 10, search, role, teamId } = query;
  const where: Prisma.UserWhereInput = {};

  // Role scoping
  if (actor.role === Role.ADMIN) {
    // Admin can view all
    if (teamId && teamId !== "all") {
      where.teamId = teamId === "unassigned" ? null : teamId;
    }
  } else {
    // Manager and User: scoped to own team only
    if (!actor.teamId) {
      // If user has no team, they only see themselves
      where.id = actor.id;
    } else {
      where.teamId = actor.teamId;
    }
  }

  // Role filter
  if (role && role !== "all") {
    where.role = role as Role;
  }

  // Search filter
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    items: items as unknown as User[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getUserById(actor: User, id: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    throw new UserServiceError("User not found", "NOT_FOUND", 404);
  }

  // Scoping check
  if (actor.role !== Role.ADMIN && actor.id !== id && actor.teamId !== user.teamId) {
    throw new UserServiceError("You do not have permission to view this user", "FORBIDDEN", 403);
  }

  return user as unknown as User;
}

export async function createUser(actor: User, input: CreateUserInput): Promise<User> {
  if (!can(actor, "users:create")) {
    throw new UserServiceError("Only administrators can create users", "FORBIDDEN", 403);
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new UserServiceError("A user with this email address already exists", "CONFLICT", 409);
  }

  if (input.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: input.teamId },
    });
    if (!team) {
      throw new UserServiceError("Specified squad not found", "NOT_FOUND", 404);
    }
  }

  const plainPassword = input.password ?? "Password@123";
  const hashedPassword = await hashPassword(plainPassword);

  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role ?? Role.USER,
      teamId: input.teamId || null,
    },
    select: safeUserSelect,
  });

  return newUser as unknown as User;
}

export async function updateUser(
  actor: User,
  targetId: string,
  input: UpdateUserInput
): Promise<User> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: safeUserSelect,
  });

  if (!target) {
    throw new UserServiceError("User not found", "NOT_FOUND", 404);
  }

  const isSelf = actor.id === targetId;
  const isAllowed = can(actor, "users:edit", {
    targetUserId: targetId,
    targetUserTeamId: target.teamId,
    isSelf,
  });

  if (!isAllowed) {
    throw new UserServiceError("You do not have permission to edit this user", "FORBIDDEN", 403);
  }

  const dataToUpdate: Prisma.UserUpdateInput = {};

  if (input.name) {
    dataToUpdate.name = input.name;
  }

  if (input.password) {
    dataToUpdate.password = await hashPassword(input.password);
  }

  // Only admin or manager can change team through updateUser
  if (input.teamId !== undefined && (actor.role === Role.ADMIN || actor.role === Role.MANAGER)) {
    if (input.teamId) {
      const team = await prisma.team.findUnique({ where: { id: input.teamId } });
      if (!team) throw new UserServiceError("Squad not found", "NOT_FOUND", 404);
      dataToUpdate.team = { connect: { id: input.teamId } };
    } else {
      dataToUpdate.team = { disconnect: true };
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: dataToUpdate,
    select: safeUserSelect,
  });

  return updated as unknown as User;
}

export async function deleteUser(actor: User, targetId: string): Promise<void> {
  if (!can(actor, "users:delete")) {
    throw new UserServiceError("Only administrators can delete users", "FORBIDDEN", 403);
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new UserServiceError("User not found", "NOT_FOUND", 404);
  }

  // Last admin protection
  if (target.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });
    if (adminCount <= 1) {
      throw new UserServiceError(
        "Cannot delete the last remaining administrator in the workspace",
        "CONFLICT",
        409
      );
    }
  }

  await prisma.user.delete({
    where: { id: targetId },
  });
}

export async function changeUserRole(actor: User, targetId: string, newRole: Role): Promise<User> {
  if (!can(actor, "users:change_role")) {
    throw new UserServiceError("Only administrators can change roles", "FORBIDDEN", 403);
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new UserServiceError("User not found", "NOT_FOUND", 404);
  }

  // Last admin protection
  if (target.role === Role.ADMIN && newRole !== Role.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });
    if (adminCount <= 1) {
      throw new UserServiceError(
        "Cannot demote the last remaining administrator in the workspace",
        "CONFLICT",
        409
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: newRole },
    select: safeUserSelect,
  });

  return updated as unknown as User;
}

export async function changeUserTeam(
  actor: User,
  targetId: string,
  newTeamId: string | null
): Promise<User> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, teamId: true },
  });

  if (!target) {
    throw new UserServiceError("User not found", "NOT_FOUND", 404);
  }

  // Admin can change any team, Manager can change if target or dest is their team
  if (actor.role !== Role.ADMIN) {
    if (actor.role !== Role.MANAGER) {
      throw new UserServiceError("You do not have permission to reassign squads", "FORBIDDEN", 403);
    }
    // Manager check: must belong to the manager's team
    if (target.teamId !== actor.teamId && newTeamId !== actor.teamId) {
      throw new UserServiceError("Managers can only manage members of their own squad", "FORBIDDEN", 403);
    }
  }

  if (newTeamId) {
    const teamExists = await prisma.team.findUnique({ where: { id: newTeamId } });
    if (!teamExists) {
      throw new UserServiceError("Target squad does not exist", "NOT_FOUND", 404);
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { teamId: newTeamId },
    select: safeUserSelect,
  });

  return updated as unknown as User;
}
