"use server";
// =============================================================================
// apps/web/lib/actions/user.actions.ts
// Server Actions para el área de cliente: perfil y direcciones (Req 15.1–15.5).
// =============================================================================

import { prisma } from "@/lib/db";
import { handleActionError } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import type { UserProfile, SavedAddressRecord, CreateAddressData, UpdateProfileData } from "@aurora/shared";
import { auth } from "@/lib/auth";
import {
  getProfileUseCase,
  updateProfileUseCase,
  addSavedAddressUseCase,
  removeSavedAddressUseCase,
  listSavedAddressesUseCase,
  PrismaUsersRepository,
} from "@aurora/core/users";

export async function getProfileAction(): Promise<ActionResult<UserProfile | null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaUsersRepository(prisma);
    const profile = await getProfileUseCase({
      repository,
      userId: session.user.id,
    });
    return { data: profile, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProfileAction(
  data: UpdateProfileData,
): Promise<ActionResult<UserProfile>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaUsersRepository(prisma);
    const profile = await updateProfileUseCase({
      repository,
      userId: session.user.id,
      data,
    });
    return { data: profile, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listSavedAddressesAction(): Promise<
  ActionResult<SavedAddressRecord[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaUsersRepository(prisma);
    const addresses = await listSavedAddressesUseCase({
      repository,
      userId: session.user.id,
    });
    return { data: addresses, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addSavedAddressAction(
  data: CreateAddressData,
): Promise<ActionResult<SavedAddressRecord>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaUsersRepository(prisma);
    const address = await addSavedAddressUseCase({
      repository,
      userId: session.user.id,
      data,
    });
    return { data: address, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeSavedAddressAction(
  addressId: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        error: { code: "UNAUTHORIZED", message: "Sesión requerida." },
      };
    }
    const repository = new PrismaUsersRepository(prisma);
    // Ownership is validated inside the use case via userId (Req 15.5)
    await removeSavedAddressUseCase({
      repository,
      addressId,
      userId: session.user.id,
    });
    return { data: undefined, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
