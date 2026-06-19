// =============================================================================
// apps/web/lib/auth.ts — Auth.js v5 configuration
// Configura el proveedor Credentials con bcrypt y scaffoldea OAuth (Req 1.4, 1.6, 1.7, 3.1).
// =============================================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@aurora/shared";

// Import db and repositories only in server-side code (not Edge Runtime)
// These are lazily imported within authorize/signIn callbacks
const getAuthDeps = async () => {
  const { prisma } = await import("@/lib/db");
  const { PrismaAuthRepository, upsertUserFromProviderUseCase } = await import(
    "@aurora/core/auth"
  );
  return { prisma, PrismaAuthRepository, upsertUserFromProviderUseCase };
};

// ─── Module Augmentation — Extend NextAuth types ─────────────────────────────
// Exposes `id` and `role` on session.user and in the JWT token.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
  }

  interface JWT {
    id: string;
    role: Role;
  }
}

// ─── Auth.js Configuration ────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { prisma, PrismaAuthRepository } = await getAuthDeps();
        const repository = new PrismaAuthRepository(prisma);
        const user = await repository.findUserByEmailWithHash(
          credentials.email as string,
        );

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),

    // ── Google OAuth extension point (inactive until credentials are set) ──
    // To activate: add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
    // and uncomment the provider below.
    //
    // import Google from "next-auth/providers/google";
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (not credentials): sync user to local DB
      // This scaffold runs when Google OAuth is activated in the future.
      if (account && account.provider !== "credentials") {
        const { prisma, PrismaAuthRepository, upsertUserFromProviderUseCase } =
          await getAuthDeps();
        const repository = new PrismaAuthRepository(prisma);
        await upsertUserFromProviderUseCase({
          repository,
          data: {
            email: user.email!,
            fullName: user.name ?? "",
            emailVerified: null,
          },
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      // On initial sign-in, `user` is populated — persist id and role into the token.
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose id and role from JWT token onto the session object.
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
