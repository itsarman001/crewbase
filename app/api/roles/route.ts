import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, rethrowPrerenderError } from "@/lib/api-response";
import { PERMISSION_MATRIX, ROLE_CONFIG } from "@/lib/constants";
import { Role } from "@/types";


export async function GET() {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("UNAUTHENTICATED", "Authentication required", 401);
    }

    if (!can(actor, "roles:view")) {
      return apiError("FORBIDDEN", "Only workspace administrators can inspect RBAC policy", 403);
    }

    const counts = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    const totalUsers = counts.reduce((acc, c) => acc + c._count.id, 0);

    const roleDistribution = [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST].map((role) => {
      const match = counts.find((c) => c.role === role);
      const count = match ? match._count.id : 0;
      const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      return {
        role,
        label: ROLE_CONFIG[role].label,
        count,
        percentage,
      };
    });

    return apiSuccess(
      {
        roles: Object.keys(ROLE_CONFIG),
        config: ROLE_CONFIG,
        matrix: PERMISSION_MATRIX,
        distribution: roleDistribution,
        totalUsers,
      },
      200
    );
  } catch (error) {
    rethrowPrerenderError(error);
    console.error("GET /api/roles error:", error);
    return apiError("INTERNAL_ERROR", "Internal server error", 500);
  }
}
