import { getSession } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import { listUsers } from "@/services/user.service";
import { listTeams } from "@/services/team.service";
import { UsersView } from "@/components/users/users-view";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { redirect } from "next/navigation";


export default async function UsersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!canAccessRoute(session.user.role, "/users")) {
    return (
      <ForbiddenState
        title="Directory Access Restricted"
        description="Guest accounts do not have permission to view workspace directory members."
      />
    );
  }

  const [usersResult, teams] = await Promise.all([
    listUsers(session.user, { page: 1, pageSize: 100 }),
    listTeams(session.user),
  ]);

  return <UsersView initialUsers={usersResult.items} teams={teams} />;
}
