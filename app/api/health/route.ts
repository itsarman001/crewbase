import { checkDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GEt() {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database Connection Failed",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      stats: "ok",
      message: "Database connected successfully",
    },
    { status: 200 },
  );
}
