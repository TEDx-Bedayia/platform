import { HOST } from "@/app/metadata";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validates CSRF protection by checking Origin and Referer headers.
 * This prevents cross-site request forgery attacks by ensuring requests
 * originate from our own domain.
 *
 * @param request - The incoming request
 * @returns null if valid, NextResponse with 403 if invalid
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Skip CSRF check for HEAD, OPTIONS (safe methods)
  const safeMethod = ["HEAD", "OPTIONS"].includes(request.method);
  if (safeMethod) {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Parse allowed origins from HOST constant and environment
  const allowedOrigins = getAllowedOrigins();

  // Check Origin header first (most reliable)
  if (origin) {
    if (allowedOrigins.some((allowed) => origin === allowed)) {
      return null; // Valid origin
    }
    console.warn(`CSRF blocked: Invalid origin "${origin}"`);
    return NextResponse.json(
      { message: "Forbidden: Invalid request origin" },
      { status: 403 }
    );
  }

  // Fall back to Referer header check
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;
      if (allowedOrigins.some((allowed) => refererOrigin === allowed)) {
        return null; // Valid referer
      }
    } catch {
      // Invalid URL in referer
    }
    console.warn(`CSRF blocked: Invalid referer "${referer}"`);
    return NextResponse.json(
      { message: "Forbidden: Invalid request origin" },
      { status: 403 }
    );
  }

  // No Origin or Referer header - could be a direct API call or attack
  // For admin endpoints, we should be strict and reject these
  console.warn("CSRF blocked: Missing origin/referer headers");
  return NextResponse.json(
    { message: "Forbidden: Missing request origin" },
    { status: 403 }
  );
}

/**
 * Less strict CSRF validation that allows requests without headers
 * (for public-facing endpoints that might be called from mobile apps, etc.)
 */
export function validateCsrfLenient(request: NextRequest): NextResponse | null {
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (safeMethod) {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // If no headers, allow (lenient mode)
  if (!origin && !referer) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();

  // Check Origin if present
  if (origin && !allowedOrigins.some((allowed) => origin === allowed)) {
    console.warn(`CSRF blocked (lenient): Invalid origin "${origin}"`);
    return NextResponse.json(
      { message: "Forbidden: Invalid request origin" },
      { status: 403 }
    );
  }

  // Check Referer if present and Origin wasn't
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;
      if (!allowedOrigins.some((allowed) => refererOrigin === allowed)) {
        console.warn(`CSRF blocked (lenient): Invalid referer "${referer}"`);
        return NextResponse.json(
          { message: "Forbidden: Invalid request origin" },
          { status: 403 }
        );
      }
    } catch {
      // Invalid URL, reject
      return NextResponse.json(
        { message: "Forbidden: Invalid request origin" },
        { status: 403 }
      );
    }
  }

  return null;
}

/**
 * Returns list of allowed origins for CSRF validation
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  origins.push("https://tedx-bedayia.vercel.app");

  // Add production host
  if (HOST) {
    origins.push(HOST);
    // Also allow without trailing slash
    origins.push(HOST.replace(/\/$/, ""));
  }

  // Add localhost variants for development
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000");
    origins.push("http://127.0.0.1:3000");
  }

  // Add any additional allowed origins from environment
  if (process.env.ALLOWED_ORIGINS) {
    const additional = process.env.ALLOWED_ORIGINS.split(",").map((o) =>
      o.trim()
    );
    origins.push(...additional);
  }

  return origins;
}
