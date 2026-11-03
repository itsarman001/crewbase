import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | string>;
  };
}

export interface ApiSuccessBody<T = unknown> {
  data: T;
}

export function apiSuccess<T>(data: T, status = 200, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, { status, ...init });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[] | string>,
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export function handleZodError(error: ZodError): NextResponse {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!details[key]) {
      details[key] = issue.message;
    }
  }

  return apiError("VALIDATION_ERROR", "Invalid input parameters", 400, details);
}

export function rethrowPrerenderError(error: unknown): void {
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string"
  ) {
    const digest = (error as { digest: string }).digest;
    if (
      digest.includes("HANGING_PROMISE_REJECTION") ||
      digest.includes("DYNAMIC_SERVER_USAGE") ||
      digest.includes("NEXT_PRERENDER")
    ) {
      throw error;
    }
  }
}
