// =============================================================================
// @aurora/core/users — PrismaUsersRepository
// Implementación Prisma del repositorio de usuarios (Req 1.6, 3.1–3.5).
// Encapsula todas las operaciones de acceso a datos de usuario y direcciones,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type {
  UserProfile,
  SavedAddressRecord,
  UpdateProfileData,
  CreateAddressData,
} from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IUsersRepository } from "./users.repository.interface";

/**
 * Mapea un registro de usuario Prisma al tipo de dominio UserProfile.
 * Excluye passwordHash y updatedAt del resultado.
 */
function mapToUserProfile(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: Date | null;
  termsAccepted: boolean;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as UserProfile["role"],
    emailVerified: user.emailVerified,
    termsAccepted: user.termsAccepted,
    createdAt: user.createdAt,
  };
}

/**
 * Mapea un registro de dirección Prisma al tipo de dominio SavedAddressRecord.
 */
function mapToSavedAddress(address: {
  id: string;
  userId: string;
  addressName: string;
  department: string;
  municipality: string;
  address: string;
  neighborhood: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SavedAddressRecord {
  return {
    id: address.id,
    userId: address.userId,
    addressName: address.addressName,
    department: address.department,
    municipality: address.municipality,
    address: address.address,
    neighborhood: address.neighborhood,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export class PrismaUsersRepository implements IUsersRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<UserProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          emailVerified: true,
          termsAccepted: true,
          createdAt: true,
        },
      });

      return user ? mapToUserProfile(user) : null;
    } catch (error) {
      throw this.handlePrismaError(error, "findById");
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileData,
  ): Promise<UserProfile> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.email !== undefined && { email: data.email }),
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          emailVerified: true,
          termsAccepted: true,
          createdAt: true,
        },
      });

      return mapToUserProfile(user);
    } catch (error) {
      throw this.handlePrismaError(error, "updateProfile");
    }
  }

  async findByEmail(
    email: string,
  ): Promise<{ id: string; email: string } | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      throw this.handlePrismaError(error, "findByEmail");
    }
  }

  async listSavedAddresses(userId: string): Promise<SavedAddressRecord[]> {
    try {
      const addresses = await this.prisma.savedAddress.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return addresses.map(mapToSavedAddress);
    } catch (error) {
      throw this.handlePrismaError(error, "listSavedAddresses");
    }
  }

  async createSavedAddress(
    userId: string,
    data: CreateAddressData,
  ): Promise<SavedAddressRecord> {
    try {
      const address = await this.prisma.savedAddress.create({
        data: {
          userId,
          addressName: data.addressName,
          department: data.department,
          municipality: data.municipality,
          address: data.address,
          neighborhood: data.neighborhood ?? null,
        },
      });

      return mapToSavedAddress(address);
    } catch (error) {
      throw this.handlePrismaError(error, "createSavedAddress");
    }
  }

  async deleteSavedAddress(addressId: string, userId: string): Promise<void> {
    try {
      const address = await this.prisma.savedAddress.findUnique({
        where: { id: addressId },
        select: { userId: true },
      });

      if (!address) {
        throw new AuroraError(
          "ADDRESS_NOT_FOUND",
          `Saved address "${addressId}" not found`,
        );
      }

      if (address.userId !== userId) {
        throw new AuroraError(
          "ADDRESS_OWNERSHIP_ERROR",
          `Address "${addressId}" does not belong to user "${userId}"`,
        );
      }

      await this.prisma.savedAddress.delete({
        where: { id: addressId },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "deleteSavedAddress");
    }
  }

  /**
   * Captura errores de Prisma y los transforma en AuroraError.
   * Nunca se exponen errores crudos de Prisma fuera de la capa de repositorio (Req 11.3).
   */
  private handlePrismaError(error: unknown, operation: string): AuroraError {
    if (error instanceof AuroraError) {
      return error;
    }

    // Prisma known request errors have a `code` property (e.g. P2002 for unique constraint)
    if (
      error instanceof Error &&
      "code" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    ) {
      const prismaCode = (error as Record<string, unknown>).code as string;

      if (prismaCode === "P2002") {
        return new AuroraError(
          "REPOSITORY_ERROR",
          `Unique constraint violation in ${operation}`,
        );
      }

      if (prismaCode === "P2025") {
        return new AuroraError(
          "REPOSITORY_ERROR",
          `Record not found in ${operation}`,
        );
      }

      return new AuroraError(
        "REPOSITORY_ERROR",
        `Database error [${prismaCode}] in ${operation}`,
      );
    }

    return new AuroraError(
      "REPOSITORY_ERROR",
      `Unexpected error in ${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
