"use server";
// =============================================================================
// apps/web/lib/actions/admin.brands.actions.ts — Brand management
// =============================================================================

import { prisma, withDbRetry } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { auth } from "@/lib/auth";
import { PrismaAuthRepository } from "@aurora/core/auth";
import { verifyUserRoleUseCase } from "@aurora/core/auth";

export interface BrandRecord {
  id: string;
  imageUrl: string;
  imageKey: string;
  order: number;
  isActive: boolean;
}

async function assertAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED_ROLE" });
  const authRepo = new PrismaAuthRepository(prisma);
  const isAdmin = await verifyUserRoleUseCase({ repository: authRepo, userId: session.user.id, expectedRole: "ADMIN" });
  if (!isAdmin) throw Object.assign(new Error("Forbidden"), { code: "UNAUTHORIZED_ROLE" });
}

export async function listBrandsAction(): Promise<ActionResult<BrandRecord[]>> {
  try {
    const brands = await withDbRetry(() =>
      prisma.brand.findMany({ orderBy: { order: "asc" } }),
    );
    return { data: brands, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listActiveBrandsAction(): Promise<ActionResult<BrandRecord[]>> {
  try {
    const brands = await withDbRetry(() =>
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 5,
      }),
    );
    return { data: brands, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveBrandsAction(
  brands: { id?: string; imageUrl: string; imageKey: string; order: number }[],
): Promise<ActionResult<void>> {
  try {
    await assertAdmin();

    // Delete all and recreate in order (max 5)
    await withDbRetry(() => prisma.brand.deleteMany());

    if (brands.length > 0) {
      await withDbRetry(() =>
        prisma.brand.createMany({
          data: brands.slice(0, 5).map((b, i) => ({
            imageUrl: b.imageUrl,
            imageKey: b.imageKey,
            order: i,
            isActive: true,
          })),
        }),
      );
    }

    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
