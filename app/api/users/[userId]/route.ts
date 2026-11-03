import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-response";
import { updateUserSchema } from "@/lib/validations/user";
import {
  getUserById,
  updateUser,
  deleteUser,
  UserServiceError,
} from "@/services/user.service";


export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { userId } = await context.params;
    const user = await getUserById(actor, userId);
    return apiSuccess({ user }, 200);
  } catch (error) {
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("GET /api/users/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}

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

    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const updated = await updateUser(actor, userId, validation.data);
    return apiSuccess({ user: updated }, 200);
  } catch (error) {
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("PATCH /api/users/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { userId } = await context.params;
    await deleteUser(actor, userId);
    return apiSuccess({ message: "User deleted successfully" }, 200);
  } catch (error) {
    if (error instanceof UserServiceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("DELETE /api/users/:id error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
