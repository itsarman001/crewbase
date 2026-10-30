import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "your'e not authenticated",
        },
        { status: 401 },
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error while getting user: ${error}`);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong!",
      },
      { status: 500 },
    );
  }
}
