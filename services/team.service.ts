import { prisma } from "@/lib/prisma";
import { safeUserSelect } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Role, Team, User } from "@/types";
import { CreateTeamInput, UpdateTeamInput } from "@/lib/validations/team";

export class TeamServiceError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT",
    public status: number,
  ) {
    super(message);
    this.name = "TeamServiceError";
  }
}

export async function listTeams(actor: User) {
  if (!can(actor, "teams:view")) {
    throw new TeamServiceError("You do not have permission to view teams", "FORBIDDEN", 403);
  }

  const where = actor.role === Role.ADMIN ? {} : { id: actor.teamId ?? "none" };

  const teams = await prisma.team.findMany({
    where,
    include: {
      member: {
        select: safeUserSelect,
      },
      _count: {
        select: { member: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    code: team.code,
    description: team.description,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    member: team.member as unknown as User[],
    members: team.member as unknown as User[],
    memberCount: team._count.member,
    _count: team._count,
  })) as Team[];
}

export async function getTeamById(actor: User, teamId: string): Promise<Team> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      member: {
        select: safeUserSelect,
      },
      _count: {
        select: { member: true },
      },
    },
  });

  if (!team) {
    throw new TeamServiceError("Squad not found", "NOT_FOUND", 404);
  }

  if (actor.role !== Role.ADMIN && actor.teamId !== teamId) {
    throw new TeamServiceError("You do not have permission to view this squad", "FORBIDDEN", 403);
  }

  return {
    id: team.id,
    name: team.name,
    code: team.code,
    description: team.description,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    member: team.member as unknown as User[],
    members: team.member as unknown as User[],
    memberCount: team._count.member,
    _count: team._count,
  } as Team;
}

export async function createTeam(actor: User, input: CreateTeamInput): Promise<Team> {
  if (!can(actor, "teams:create")) {
    throw new TeamServiceError("Only administrators can create squads", "FORBIDDEN", 403);
  }

  const [existingName, existingCode] = await Promise.all([
    prisma.team.findUnique({ where: { name: input.name } }),
    prisma.team.findUnique({ where: { code: input.code } }),
  ]);

  if (existingName) {
    throw new TeamServiceError("A squad with this name already exists", "CONFLICT", 409);
  }

  if (existingCode) {
    throw new TeamServiceError("A squad with this code already exists", "CONFLICT", 409);
  }

  const newTeam = await prisma.team.create({
    data: {
      name: input.name,
      code: input.code,
      description: input.description,
    },
    include: {
      member: { select: safeUserSelect },
      _count: { select: { member: true } },
    },
  });

  return {
    ...newTeam,
    member: newTeam.member as unknown as User[],
    members: newTeam.member as unknown as User[],
    memberCount: newTeam._count.member,
  } as Team;
}

export async function updateTeam(
  actor: User,
  teamId: string,
  input: UpdateTeamInput
): Promise<Team> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new TeamServiceError("Squad not found", "NOT_FOUND", 404);
  }

  if (!can(actor, "teams:edit", { targetTeamId: teamId })) {
    throw new TeamServiceError("You do not have permission to edit this squad", "FORBIDDEN", 403);
  }

  if (input.name && input.name !== team.name) {
    const existingName = await prisma.team.findUnique({ where: { name: input.name } });
    if (existingName) {
      throw new TeamServiceError("A squad with this name already exists", "CONFLICT", 409);
    }
  }

  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: input.name,
      description: input.description,
    },
    include: {
      member: { select: safeUserSelect },
      _count: { select: { member: true } },
    },
  });

  return {
    ...updatedTeam,
    member: updatedTeam.member as unknown as User[],
    members: updatedTeam.member as unknown as User[],
    memberCount: updatedTeam._count.member,
  } as Team;
}

export async function deleteTeam(actor: User, teamId: string): Promise<void> {
  if (!can(actor, "teams:delete")) {
    throw new TeamServiceError("Only administrators can delete squads", "FORBIDDEN", 403);
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new TeamServiceError("Squad not found", "NOT_FOUND", 404);
  }

  // Deleting team sets member teamId to null due to onDelete: SetNull in schema
  await prisma.team.delete({ where: { id: teamId } });
}

export async function addTeamMember(
  actor: User,
  teamId: string,
  userId: string
): Promise<User> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new TeamServiceError("Squad not found", "NOT_FOUND", 404);
  }

  if (!can(actor, "teams:manage_members", { targetTeamId: teamId })) {
    throw new TeamServiceError(
      "You do not have permission to manage members of this squad",
      "FORBIDDEN",
      403
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new TeamServiceError("User not found", "NOT_FOUND", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { teamId },
    select: safeUserSelect,
  });

  return updatedUser as unknown as User;
}

export async function removeTeamMember(
  actor: User,
  teamId: string,
  userId: string
): Promise<User> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new TeamServiceError("Squad not found", "NOT_FOUND", 404);
  }

  if (!can(actor, "teams:manage_members", { targetTeamId: teamId })) {
    throw new TeamServiceError(
      "You do not have permission to manage members of this squad",
      "FORBIDDEN",
      403
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new TeamServiceError("User not found", "NOT_FOUND", 404);
  }

  if (user.teamId !== teamId) {
    throw new TeamServiceError("User is not a member of this squad", "VALIDATION_ERROR", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { teamId: null },
    select: safeUserSelect,
  });

  return updatedUser as unknown as User;
}
