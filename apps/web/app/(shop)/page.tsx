export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage → redirects to catalog
// =============================================================================

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/catalog");
}
