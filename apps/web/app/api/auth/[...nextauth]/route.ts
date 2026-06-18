// =============================================================================
// apps/web/app/api/auth/[...nextauth]/route.ts
// Re-exports Auth.js v5 handlers for GET and POST (Req 1.4).
// =============================================================================

import { handlers } from "@/lib/auth";

export const GET = handlers.GET;
export const POST = handlers.POST;
