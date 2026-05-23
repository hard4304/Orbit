import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/types";

/**
 * Standard error handler for API routes.
 * Catches auth errors, validation errors, and generic errors.
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  // Auth error
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Forbidden error
  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: error.issues[0].message },
      { status: 400 }
    );
  }

  // Not found (convention: throw "Not found" in services)
  if (error instanceof Error && error.message === "Not found") {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  // Conflict (duplicate data)
  if (error instanceof Error && error.message.includes("already")) {
    return NextResponse.json({ success: false, error: error.message }, { status: 409 });
  }

  // Generic server error
  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
