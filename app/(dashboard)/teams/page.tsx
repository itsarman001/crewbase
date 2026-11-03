import { getSession } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import { listTeams } from "@/services/team.service";
import { listUsers } from "@/services/user.service";
import { TeamsView } from "@/components/teams/teams-view";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { redirect } from "next/navigation";


export default async function TeamsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!canAccessRoute(session.user.role, "/teams")) {
    return (
      <ForbiddenState
        title="Squad Access Restricted"
        description="Guest accounts do not have permission to view workspace squads and team structures."
      />
    );
  }

  const [teams, usersResult] = await Promise.all([
    listTeams(session.user),
    listUsers(session.user, { page: 1, pageSize: 100 }),
  ]);

  return <TeamsView initialTeams={teams} initialUsers={usersResult.items} />;
}
