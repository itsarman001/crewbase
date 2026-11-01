import { checkUserPermission, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Roles an admin is allowed to assign through this endpoint
const ASSIGNABLE_ROLES: Role[] = [Role.MANAGER, Role.USER];

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

    // 2. Authorization
    if (!checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        { error: "You're not authorized to change roles" },
        { status: 403 },
      );
    }

    // 3. Can't change your own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You can't change your own role" },
        { status: 403 },
      );
    }

    // 4. Parse + validate body
    let body: { role?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const role = body.role;
    if (typeof role !== "string" || !ASSIGNABLE_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { error: `role must be one of: ${ASSIGNABLE_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    // 5. Make sure the target exists, and protect other admins
    //    (remove this block if admins should be able to demote each other)
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === Role.ADMIN) {
      return NextResponse.json(
        { error: "You can't change another admin's role" },
        { status: 403 },
      );
    }

    // 6. Update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: safeUserSelect,
    });

    return NextResponse.json({
      user: updatedUser,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("Role assignment failed:", error);

    // Race condition: user deleted between the check and the update
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
