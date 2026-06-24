// =============================================================================
// @aurora/core/auth — IVerificationTokenRepository
// =============================================================================

import type { TokenType } from "@aurora/shared";

export interface TokenRecord {
  id: string;
  userId: string;
  token: string;
  type: TokenType;
  expiresAt: Date;
}

export interface IVerificationTokenRepository {
  createToken(data: {
    userId: string;
    token: string;
    type: TokenType;
    expiresAt: Date;
  }): Promise<TokenRecord>;

  findByToken(token: string, type: TokenType): Promise<TokenRecord | null>;

  /** Invalida todos los tokens del mismo tipo para ese usuario */
  invalidateAllByUserAndType(userId: string, type: TokenType): Promise<void>;

  deleteToken(id: string): Promise<void>;
}
