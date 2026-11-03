import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-response";
import { updateTeamSchema } from "@/lib/validations/team";
import {
  getTeamById,
  updateTeam,
  deleteTeam,
  TeamServiceError,
} from "@/services/team.service";


export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { teamId } = await context.params;
    const team = await getTeamById(actor, teamId);
    return apiSuccess({ team }, 200);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("GET /api/teams/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { teamId } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const validation = updateTeamSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const updated = await updateTeam(actor, teamId, validation.data);
    return apiSuccess({ team: updated }, 200);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("PATCH /api/teams/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { teamId } = await context.params;
    await deleteTeam(actor, teamId);
    return apiSuccess({ message: "Squad deleted successfully" }, 200);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("DELETE /api/teams/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
