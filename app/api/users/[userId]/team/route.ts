import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-response";
import { changeTeamSchema } from "@/lib/validations/user";
import { changeUserTeam, UserServiceError } from "@/services/user.service";


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { userId } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const validation = changeTeamSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const updatedUser = await changeUserTeam(actor, userId, validation.data.teamId);
    return apiSuccess({ user: updatedUser }, 200);
  } catch (error) {
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("PATCH /api/users/:id/team error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
