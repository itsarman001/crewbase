import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-response";
import { addTeamMemberSchema } from "@/lib/validations/team";
import { addTeamMember, TeamServiceError } from "@/services/team.service";


export async function POST(
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

    const validation = addTeamMemberSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const member = await addTeamMember(actor, teamId, validation.data.userId);
    return apiSuccess({ member }, 200);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("POST /api/teams/:id/members error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
