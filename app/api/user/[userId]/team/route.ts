// @route: PATCH /api/user/[userId]/team
// Body: { "teamId": "<Team.id>" }  -> assign user to that team
//       { "teamId": null }         -> remove user from their team
import { checkUserPermission, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
  team: { select: { id: true, name: true, code: true } },
} satisfies Prisma.UserSelect;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;

    // 1. Authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // 2. Authorization (logged in, but not allowed)
    if (!checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        { error: "You're not authorized to assign teams" },
        { status: 403 },
      );
    }

    // 3. Parse + validate body
    let body: { teamId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    // `undefined` means the field was missing; `null` means "remove from team"
    if (
      body.teamId === undefined ||
      (body.teamId !== null &&
        (typeof body.teamId !== "string" || body.teamId.trim() === ""))
    ) {
      return NextResponse.json(
        { error: "teamId must be a team id string, or null to unassign" },
        { status: 400 },
      );
    }

    // 4. If assigning, make sure the team exists (clean 404 instead of an FK error)
    const teamId: string | null = body.teamId;
    if (teamId !== null) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true },
      });

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
    }

    // 5. Update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { teamId }, // explicit null disconnects; undefined would be ignored
      select: safeUserSelect,
    });

    return NextResponse.json({
      user: updatedUser,
      message: teamId
        ? `User assigned to ${updatedUser.team?.name} successfully`
        : "User removed from team successfully",
    });
  } catch (error) {
    console.error("Team assignment failed:", error);

    // P2025 = record to update not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error, something went wrong!" },
      { status: 500 },
    );
  }
}
