// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
// Shared password for all seeded dev accounts. Override via .env if you like.
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Password@123";

const teams = [
  {
    code: "ENG",
    name: "Engineering",
    description: "Builds and maintains the core product and infrastructure.",
  },
  {
    code: "DSN",
    name: "Design",
    description: "Owns UX research, UI design, and the design system.",
  },
  {
    code: "MKT",
    name: "Marketing",
    description: "Drives brand, content, and growth campaigns.",
  },
  {
    code: "HR",
    name: "People Operations",
    description: "Handles recruitment, onboarding, and employee experience.",
  },
];

const users: {
  name: string;
  email: string;
  role: Role;
  teamCode?: string;
}[] = [
  // Admins (not tied to a team)
  {
    name: "Olivia Bennett",
    email: "olivia.bennett@crewbase.dev",
    role: Role.ADMIN,
  },
  { name: "Rahul Mehta", email: "rahul.mehta@crewbase.dev", role: Role.ADMIN },

  // Managers (one per team)
  {
    name: "Daniel Foster",
    email: "daniel.foster@crewbase.dev",
    role: Role.MANAGER,
    teamCode: "ENG",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@crewbase.dev",
    role: Role.MANAGER,
    teamCode: "DSN",
  },
  {
    name: "Marcus Reed",
    email: "marcus.reed@crewbase.dev",
    role: Role.MANAGER,
    teamCode: "MKT",
  },
  {
    name: "Sophia Alvarez",
    email: "sophia.alvarez@crewbase.dev",
    role: Role.MANAGER,
    teamCode: "HR",
  },

  // Engineering
  {
    name: "Ethan Clarke",
    email: "ethan.clarke@crewbase.dev",
    role: Role.USER,
    teamCode: "ENG",
  },
  {
    name: "Ananya Das",
    email: "ananya.das@crewbase.dev",
    role: Role.USER,
    teamCode: "ENG",
  },
  {
    name: "Liam Turner",
    email: "liam.turner@crewbase.dev",
    role: Role.USER,
    teamCode: "ENG",
  },
  {
    name: "Neha Kapoor",
    email: "neha.kapoor@crewbase.dev",
    role: Role.USER,
    teamCode: "ENG",
  },

  // Design
  {
    name: "Isabella Rossi",
    email: "isabella.rossi@crewbase.dev",
    role: Role.USER,
    teamCode: "DSN",
  },
  {
    name: "Arjun Nair",
    email: "arjun.nair@crewbase.dev",
    role: Role.USER,
    teamCode: "DSN",
  },

  // Marketing
  {
    name: "Chloe Harrison",
    email: "chloe.harrison@crewbase.dev",
    role: Role.USER,
    teamCode: "MKT",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@crewbase.dev",
    role: Role.USER,
    teamCode: "MKT",
  },

  // People Operations
  {
    name: "Grace Mitchell",
    email: "grace.mitchell@crewbase.dev",
    role: Role.USER,
    teamCode: "HR",
  },

  // Guests (external collaborators, no team)
  {
    name: "Noah Whitaker",
    email: "noah.whitaker@partner.example",
    role: Role.GUEST,
  },
  { name: "Meera Iyer", email: "meera.iyer@partner.example", role: Role.GUEST },
];

async function main() {
  console.log("Started Database Seeding...");

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  // 1. Teams
  const teamIdByCode = new Map<string, string>();

  for (const team of teams) {
    const record = await prisma.team.upsert({
      where: { code: team.code },
      update: { name: team.name, description: team.description },
      create: team,
    });
    teamIdByCode.set(team.code, record.id);
  }
  console.log(`Seeded ${teams.length} teams`);

  // 2. Users
  for (const { teamCode, ...user } of users) {
    const teamId = teamCode ? (teamIdByCode.get(teamCode) ?? null) : null;

    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, teamId },
      create: { ...user, password: hashedPassword, teamId },
    });
  }
  console.log(`Seeded ${users.length} users`);

  console.log(
    `Seeding complete. Default password for all accounts: ${SEED_PASSWORD}`,
  );
}

main()
  .catch((e) => {
    console.error("Seeding Error: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
