// =============================================================================
// app/(client)/layout.tsx — Client area layout (requires authentication)
// Redirects to /login if no session.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  return <>{children}</>;
}
