// =============================================================================
// TEMPORARY DIAGNOSTIC ROUTE — DELETE AFTER USE
// GET /api/debug-upload — reveals env vars and tests InsForge connectivity
// Protected: only accessible to ADMIN sessions
// =============================================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@insforge/sdk";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl  = process.env.INSFORGE_API_BASE ?? "(not set)";
  const apiKey   = process.env.INSFORGE_API_KEY ?? "(not set)";
  const bucket   = process.env.INSFORGE_STORAGE_BUCKET ?? "(not set)";
  const provider = process.env.UPLOAD_PROVIDER ?? "insforge (default)";

  // Mask key — show only first 8 and last 4 chars
  const maskedKey = apiKey.length > 12
    ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
    : apiKey === "(not set)" ? "(not set)" : "(too short)";

  // Test actual connectivity
  let connectivityResult: Record<string, unknown> = {};
  try {
    const client = createClient({ baseUrl, anonKey: apiKey });
    const blob = new Blob([new Uint8Array([0xFF, 0xD8, 0xFF])], { type: "image/jpeg" });
    const file = new File([blob], `diag-${Date.now()}.jpg`, { type: "image/jpeg" });
    const { data, error } = await client.storage.from(bucket).uploadAuto(file);
    connectivityResult = {
      success: !error && !!data,
      uploadedKey: data?.key ?? null,
      error: error?.message ?? null,
    };
  } catch (e) {
    connectivityResult = {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return NextResponse.json({
    env: {
      INSFORGE_API_BASE: baseUrl,
      INSFORGE_API_KEY: maskedKey,
      INSFORGE_STORAGE_BUCKET: bucket,
      UPLOAD_PROVIDER: provider,
      NODE_ENV: process.env.NODE_ENV,
    },
    connectivity: connectivityResult,
  });
}
