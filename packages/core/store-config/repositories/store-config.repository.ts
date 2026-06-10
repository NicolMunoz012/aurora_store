// =============================================================================
// @aurora/core/store-config — PrismaStoreConfigRepository
// Implementación Prisma del repositorio de configuración de tienda (DA-003).
// Patrón singleton: existe exactamente un registro en la tabla store_config.
// Mapea Decimal de Prisma a decimal.js para el dominio (Req 1.4, 12.1).
// =============================================================================

import type { PrismaClient } from "@aurora/database/generated/prisma/client.js";
import type { StoreConfigRecord, UpdateStoreConfigData } from "@aurora/shared";
import { AuroraError, StoreConfigNotInitializedError } from "@aurora/shared";
import { Decimal } from "decimal.js";
import type { IStoreConfigRepository } from "./store-config.repository.interface.js";

/**
 * Mapea un registro Prisma de StoreConfig al tipo de dominio StoreConfigRecord.
 * Convierte Prisma.Decimal → decimal.js Decimal para wholesaleThreshold.
 */
function mapToStoreConfigRecord(record: {
  id: string;
  wholesaleThreshold: unknown;
  whatsappNumber: string;
  storePhysicalAddress: string;
  anonOrderExpiryDays: number;
  registeredOrderExpiryDays: number;
}): StoreConfigRecord {
  return {
    id: record.id,
    wholesaleThreshold: new Decimal(record.wholesaleThreshold!.toString()),
    whatsappNumber: record.whatsappNumber,
    storePhysicalAddress: record.storePhysicalAddress,
    anonOrderExpiryDays: record.anonOrderExpiryDays,
    registeredOrderExpiryDays: record.registeredOrderExpiryDays,
  };
}

export class PrismaStoreConfigRepository implements IStoreConfigRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async get(): Promise<StoreConfigRecord> {
    try {
      const record = await this.prisma.storeConfig.findFirstOrThrow();
      return mapToStoreConfigRecord(record);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as Record<string, unknown>).code === "P2025"
      ) {
        throw new StoreConfigNotInitializedError();
      }
      throw this.handlePrismaError(error, "get");
    }
  }

  async update(data: UpdateStoreConfigData): Promise<StoreConfigRecord> {
    try {
      const current = await this.prisma.storeConfig.findFirst();
      if (!current) {
        throw new StoreConfigNotInitializedError();
      }

      const updateData: Record<string, unknown> = {};
      if (data.wholesaleThreshold !== undefined) {
        updateData.wholesaleThreshold = data.wholesaleThreshold.toString();
      }
      if (data.whatsappNumber !== undefined) {
        updateData.whatsappNumber = data.whatsappNumber;
      }
      if (data.storePhysicalAddress !== undefined) {
        updateData.storePhysicalAddress = data.storePhysicalAddress;
      }
      if (data.anonOrderExpiryDays !== undefined) {
        updateData.anonOrderExpiryDays = data.anonOrderExpiryDays;
      }
      if (data.registeredOrderExpiryDays !== undefined) {
        updateData.registeredOrderExpiryDays = data.registeredOrderExpiryDays;
      }

      const updated = await this.prisma.storeConfig.update({
        where: { id: current.id },
        data: updateData,
      });

      return mapToStoreConfigRecord(updated);
    } catch (error) {
      if (error instanceof AuroraError) {
        throw error;
      }
      throw this.handlePrismaError(error, "update");
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

      if (prismaCode === "P2025") {
        return new StoreConfigNotInitializedError();
      }

      return new AuroraError(
        "REPOSITORY_ERROR",
        `Database error [${prismaCode}] in StoreConfigRepository.${operation}`,
      );
    }

    return new AuroraError(
      "REPOSITORY_ERROR",
      `Unexpected error in StoreConfigRepository.${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
