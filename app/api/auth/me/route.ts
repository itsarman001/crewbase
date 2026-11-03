import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, rethrowPrerenderError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }
    return apiSuccess({ user: session.user }, 200);
  } catch (error) {
    rethrowPrerenderError(error);
    console.error("Auth me endpoint error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
