import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser, AuthError } from "@/services/auth.service";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-response";
import { AUTH_COOKIE_NAME } from "@/lib/auth";


export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { user, token } = await loginUser(validation.data);

    const response = apiSuccess({ user }, 200);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error("Login endpoint error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
