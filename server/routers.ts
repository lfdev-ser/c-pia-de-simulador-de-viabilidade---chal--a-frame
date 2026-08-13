import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const userId = (opts.ctx.req as any).cookies?.userId;
      if (!userId) return opts.ctx.user || null;
      
      const db = await getDb();
      if (!db) return opts.ctx.user || null;
      
      const res = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      return res.length > 0 ? res[0] : (opts.ctx.user || null);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie('userId', { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  authEmail: router({
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");

        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        if (existing.length > 0) {
          const user = existing[0];
          if (user.emailVerified === 1) {
            throw new Error("Este e-mail já está cadastrado e confirmado.");
          }
          await db.update(users)
            .set({
              name: input.name,
              passwordHash: input.password,
              verificationToken,
            })
            .where(eq(users.id, user.id));

          return {
            success: true,
            message: "Cadastro atualizado! Verifique seu e-mail para confirmar a conta.",
            verificationToken,
          };
        }

        const openId = `email_${crypto.randomBytes(8).toString('hex')}`;
        await db.insert(users).values({
          openId,
          name: input.name,
          email: input.email,
          passwordHash: input.password,
          emailVerified: 0,
          verificationToken,
          role: 'user',
        });

        return {
          success: true,
          message: "Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail.",
          verificationToken,
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");

        const found = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (found.length === 0 || found[0].passwordHash !== input.password) {
          throw new Error("E-mail ou senha incorretos.");
        }

        const user = found[0];

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('userId', user.id.toString(), {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          emailVerified: user.emailVerified === 1,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          }
        };
      }),

    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");

        const found = await db.select().from(users).where(eq(users.verificationToken, input.token)).limit(1);
        if (found.length === 0) {
          throw new Error("Token de confirmação inválido ou expirado.");
        }

        const user = found[0];
        await db.update(users)
          .set({ emailVerified: 1, verificationToken: null })
          .where(eq(users.id, user.id));

        return {
          success: true,
          message: "E-mail confirmado com sucesso! Agora você pode fazer login.",
        };
      }),

    resendVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");

        const found = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (found.length === 0) {
          throw new Error("E-mail não encontrado.");
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await db.update(users)
          .set({ verificationToken })
          .where(eq(users.id, found[0].id));

        return {
          success: true,
          message: "Novo link de confirmação enviado para o seu e-mail.",
          verificationToken,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
