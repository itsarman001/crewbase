import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError, rethrowPrerenderError } from "@/lib/api-response";
import { createTeamSchema } from "@/lib/validations/team";
import { listTeams, createTeam, TeamServiceError } from "@/services/team.service";


export async function GET() {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const teams = await listTeams(actor);
    return apiSuccess({ teams, items: teams }, 200);
  } catch (error) {
    rethrowPrerenderError(error);
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("GET /api/teams error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const newTeam = await createTeam(actor, validation.data);
    return apiSuccess({ team: newTeam }, 201);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("POST /api/teams error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
