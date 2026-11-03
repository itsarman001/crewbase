import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { removeTeamMember, TeamServiceError } from "@/services/team.service";


export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ teamId: string; userId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { teamId, userId } = await context.params;
    const removedMember = await removeTeamMember(actor, teamId, userId);
    return apiSuccess({ member: removedMember, message: "Member removed from squad" }, 200);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("DELETE /api/teams/:id/members/:userId error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
