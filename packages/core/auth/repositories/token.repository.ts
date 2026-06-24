// =============================================================================
// @aurora/core/auth — PrismaVerificationTokenRepository
// =============================================================================

import type { PrismaClient } from "@aurora/database";
import type { TokenType } from "@aurora/shared";
import { AuroraError } from "@aurora/shared";
import type { IVerificationTokenRepository, TokenRecord } from "./token.repository.interface";

function mapToTokenRecord(t: {
  id: string;
  userId: string;
  token: string;
  type: string;
  expiresAt: Date;
}): TokenRecord {
  return {
    id: t.id,
    userId: t.userId,
    token: t.token,
    type: t.type as TokenType,
    expiresAt: t.expiresAt,
  };
}

export class PrismaVerificationTokenRepository
  implements IVerificationTokenRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async createToken(data: {
    userId: string;
    token: string;
    type: TokenType;
    expiresAt: Date;
  }): Promise<TokenRecord> {
    const record = await this.prisma.verificationToken.create({ data });
    return mapToTokenRecord(record);
  }

  async findByToken(token: string, type: TokenType): Promise<TokenRecord | null> {
    const record = await this.prisma.verificationToken.findFirst({
      where: { token, type },
    });
    return record ? mapToTokenRecord(record) : null;
  }

  async invalidateAllByUserAndType(userId: string, type: TokenType): Promise<void> {
    await this.prisma.verificationToken.deleteMany({ where: { userId, type } });
  }

  async deleteToken(id: string): Promise<void> {
    await this.prisma.verificationToken.delete({ where: { id } }).catch(() => {});
  }
}
