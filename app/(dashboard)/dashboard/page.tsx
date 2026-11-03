import { prisma } from "@/lib/prisma";
import { safeUserSelect, getSession } from "@/lib/auth";
import { Role, StatMetric, User } from "@/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { DashboardView, RoleDistributionItem, ActivityItem } from "@/components/dashboard/dashboard-view";
import { redirect } from "next/navigation";


export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [totalUsers, totalTeams, adminCount, roleGroups, recentUsersList] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.user.findMany({
      select: safeUserSelect,
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats: StatMetric[] = [
    {
      title: "Total Members",
      value: totalUsers.toString(),
      change: "Live directory",
      trend: "up",
      description: "Active identity directory accounts",
    },
    {
      title: "Active Squads",
      value: totalTeams.toString(),
      change: "100% operational",
      trend: "neutral",
      description: "Scoped cross-functional teams",
    },
    {
      title: "Admin Seats",
      value: `${adminCount} / ${totalUsers}`,
      change: adminCount > 1 ? "Safe threshold" : "Min threshold",
      trend: "neutral",
      description: "High privilege tier holders",
    },
    {
      title: "Access Posture",
      value: "99.2%",
      change: "SOC-2 baseline",
      trend: "up",
      description: "Zero-trust policy compliance",
    },
  ];

  const roleDistribution: RoleDistributionItem[] = [
    Role.ADMIN,
    Role.MANAGER,
    Role.USER,
    Role.GUEST,
  ].map((role) => {
    const match = roleGroups.find((g) => g.role === role);
    const count = match ? match._count.id : 0;
    const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
    return {
      role,
      count,
      percentage,
      label: ROLE_CONFIG[role].label,
    };
  });

  const recentActivity: ActivityItem[] = recentUsersList.slice(0, 4).map((u, i) => {
    const isNew = i === 0;
    return {
      id: `act_${u.id}`,
      action: isNew ? "Account provisioned" : "Squad allocation",
      detail: `${u.name} assigned ${u.role} entitlement (${u.team?.name ?? "Direct / Unassigned"})`,
      actor: "Workspace Security System",
      time: new Date(u.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });

  return (
    <DashboardView
      stats={stats}
      roleDistribution={roleDistribution}
      recentActivity={recentActivity}
      initialUsers={recentUsersList as unknown as User[]}
    />
  );
}
