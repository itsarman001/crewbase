import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, generateToken, safeUserSelect } from "@/lib/auth";
import { Role, User } from "@/types";
import { RegisterInput, LoginInput } from "@/lib/validations/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "CONFLICT" | "NOT_FOUND" | "VALIDATION_ERROR",
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function registerUser(input: RegisterInput): Promise<{
  user: User;
  token: string;
}> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AuthError("A user with this email address already exists", "CONFLICT", 409);
  }

  let teamId: string | null = null;
  if (input.teamCode && input.teamCode.trim()) {
    const team = await prisma.team.findUnique({
      where: { code: input.teamCode.trim().toUpperCase() },
      select: { id: true },
    });

    if (!team) {
      throw new AuthError("The provided team code does not exist", "NOT_FOUND", 404);
    }
    teamId = team.id;
  }

  const hashedPassword = await hashPassword(input.password);
  const totalUsers = await prisma.user.count();
  const role: Role = totalUsers === 0 ? Role.ADMIN : Role.USER;

  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role,
      teamId,
    },
    select: safeUserSelect,
  });

  const token = generateToken({ userId: newUser.id, role: newUser.role });

  return {
    user: newUser as unknown as User,
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<{
  user: User;
  token: string;
}> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...safeUserSelect,
      password: true,
    },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", "UNAUTHENTICATED", 401);
  }

  const isValidPassword = await verifyPassword(input.password, user.password);
  if (!isValidPassword) {
    throw new AuthError("Invalid email or password", "UNAUTHENTICATED", 401);
  }

  const token = generateToken({ userId: user.id, role: user.role });

  const safeUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    team: user.team,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: safeUser,
    token,
  };
}
