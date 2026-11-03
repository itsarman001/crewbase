import { getSession } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RolesView } from "@/components/roles/roles-view";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { Role } from "@/types";
import { redirect } from "next/navigation";


export default async function RolesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!canAccessRoute(session.user.role, "/roles")) {
    return (
      <ForbiddenState
        title="RBAC Configuration Restricted"
        description="Only Workspace Administrators are authorized to inspect or manage role assignments and permission policies."
      />
    );
  }

  const roleGroups = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const roleCounts = [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST].map((role) => {
    const match = roleGroups.find((g) => g.role === role);
    return {
      role,
      count: match ? match._count.id : 0,
    };
  });

  return <RolesView roleCounts={roleCounts} />;
}
