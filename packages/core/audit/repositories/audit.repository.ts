// =============================================================================
// @aurora/core/audit — PrismaAuditRepository
// Implementación Prisma del repositorio de auditoría (Req 10.1, 10.3).
// Encapsula las operaciones de persistencia de logs de auditoría,
// mapeando resultados Prisma a tipos de dominio y capturando errores Prisma
// para re-lanzarlos como AuroraError.
// =============================================================================

import type { PrismaClient } from "@aurora/database/generated/prisma/client.js";
import type { CreateAuditLogData, AuditFilters, AuditLogRecord } from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IAuditRepository } from "./audit.repository.interface.js";

export class PrismaAuditRepository implements IAuditRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async log(data: CreateAuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          affectedEntity: data.affectedEntity,
          entityId: data.entityId,
          previousData: data.previousData !== undefined && data.previousData !== null
            ? (data.previousData as object)
            : undefined,
          newData: data.newData !== undefined && data.newData !== null
            ? (data.newData as object)
            : undefined,
          note: data.note ?? null,
        },
      });
    } catch (error) {
      throw this.handlePrismaError(error, "log");
    }
  }

  async list(filters: AuditFilters): Promise<AuditLogRecord[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.affectedEntity) where.affectedEntity = filters.affectedEntity;
      if (filters.entityId) where.entityId = filters.entityId;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        };
      }

      const records = await this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return records.map((record) => ({
        id: record.id,
        userId: record.userId,
        action: record.action,
        affectedEntity: record.affectedEntity,
        entityId: record.entityId,
        previousData: record.previousData as unknown,
        newData: record.newData as unknown,
        note: record.note,
        createdAt: record.createdAt,
      }));
    } catch (error) {
      throw this.handlePrismaError(error, "list");
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
