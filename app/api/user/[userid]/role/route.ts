import { checkUserPermission, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ userId: string }>;
  },
) {
  try {
    const { userId } = await context.params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "You're not authorized to assign team",
        },
        { status: 401 },
      );
    }

    // Prevent current user from changing their own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          error: "You're not authorized to change your own role",
        },
        { status: 401 },
      );
    }

    const { role } = await request.json();
    const validateRoles = [Role.MANAGER, Role.USER];

    if (!validateRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid Role or you can't have more than one role",
        },
        { status: 404 },
      );
    }

    // Update user team's assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: `User role update to ${role} successfully`,
    });
  } catch (error) {
    console.error(`Role assignment failed: ${error}`);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found ")
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong!",
      },
      { status: 500 },
    );
  }
}
