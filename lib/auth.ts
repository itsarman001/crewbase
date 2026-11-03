import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role, User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-crewbase-secret-dev-mode";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export const AUTH_COOKIE_NAME = "token";

export interface JwtPayload {
  sub: string;
  userId?: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface Session {
  user: User;
}

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
  team: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} as const;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: { userId: string; role: Role }): string {
  return jwt.sign(
    {
      sub: payload.userId,
      userId: payload.userId,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Reads session from HTTP-only cookie and fetches the fresh user from DB.
 * Never selects the password hash.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const userId = payload.sub ?? payload.userId;
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    if (!user) return null;

    return { user: user as unknown as User };
  } catch (error) {
    console.error("getSession DB error:", error);
    return null;
  }
}

/**
 * Returns current authenticated user or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}
