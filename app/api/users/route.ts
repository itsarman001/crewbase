import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError, rethrowPrerenderError } from "@/lib/api-response";
import { userQuerySchema, createUserSchema } from "@/lib/validations/user";
import { listUsers, createUser, UserServiceError } from "@/services/user.service";


export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { searchParams } = request.nextUrl;
    const queryParams = {
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      teamId: searchParams.get("teamId") ?? undefined,
    };

    const validation = userQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const result = await listUsers(actor, validation.data);
    return apiSuccess(result, 200);
  } catch (error) {
    rethrowPrerenderError(error);
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("GET /api/users error:", error);
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

    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const newUser = await createUser(actor, validation.data);
    return apiSuccess({ user: newUser }, 201);
  } catch (error) {
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("POST /api/users error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
