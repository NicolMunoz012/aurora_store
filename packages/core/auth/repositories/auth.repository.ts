// =============================================================================
// @aurora/core/auth — PrismaAuthRepository
// Implementación Prisma del repositorio de autenticación (Req 1.6, 11.3).
// Encapsula todas las operaciones de acceso a datos de usuario,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type { UserProfile, UpsertUserFromProviderData } from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IAuthRepository } from "./auth.repository.interface";

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

export class PrismaAuthRepository implements IAuthRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findUserById(id: string): Promise<UserProfile | null> {
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
      throw this.handlePrismaError(error, "findUserById");
    }
  }

  async findUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
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
      throw this.handlePrismaError(error, "findUserByEmail");
    }
  }

  async findUserByEmailWithHash(
    email: string,
  ): Promise<(UserProfile & { passwordHash: string }) | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          emailVerified: true,
          termsAccepted: true,
          createdAt: true,
          passwordHash: true,
        },
      });

      if (!user) return null;

      return {
        ...mapToUserProfile(user),
        passwordHash: user.passwordHash,
      };
    } catch (error) {
      throw this.handlePrismaError(error, "findUserByEmailWithHash");
    }
  }

  async createUserWithCredentials(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    termsAccepted: boolean;
  }): Promise<UserProfile> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          termsAccepted: data.termsAccepted,
          role: "CLIENT",
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
      throw this.handlePrismaError(error, "createUserWithCredentials");
    }
  }

  async upsertUserFromProvider(
    data: UpsertUserFromProviderData,
  ): Promise<UserProfile> {
    try {
      const user = await this.prisma.user.upsert({
        where: { email: data.email },
        create: {
          fullName: data.fullName,
          email: data.email,
          emailVerified: data.emailVerified,
          passwordHash: "",
          role: "CLIENT",
          termsAccepted: false,
        },
        update: {
          fullName: data.fullName,
          emailVerified: data.emailVerified,
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
      throw this.handlePrismaError(error, "upsertUserFromProvider");
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "updatePassword");
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
