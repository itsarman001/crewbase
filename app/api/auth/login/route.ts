import { generateToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required or not valid",
        },
        { status: 400 },
      );
    }

    // Find existing user
    const userFromDb = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    const isValidPassword =
      userFromDb && (await verifyPassword(password, userFromDb.password));

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Generate Token
    const token = generateToken(userFromDb.id);

    // Create Response
    const response = NextResponse.json({
      user: {
        id: userFromDb.id,
        email: userFromDb.email,
        name: userFromDb.name,
        role: userFromDb.role,
        teamId: userFromDb.teamId,
        team: userFromDb.team,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(`Login Failed: ${error}`);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong!",
      },
      { status: 500 },
    );
  }
}
