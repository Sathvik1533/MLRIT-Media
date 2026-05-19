import { NextRequest, NextResponse } from "next/server";

// Returns a 401/500 Response if the request lacks a valid ADMIN_KEY bearer token.
// Returns null if auth passes — callers should early-return on non-null.
//
// Usage:
//   const denied = requireAdmin(request);
//   if (denied) return denied;
export function requireAdmin(request: NextRequest): NextResponse | null {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
