import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  clearUserComparisons,
  createUserComparison,
  createUserSimulation,
  deleteUserComparison,
  deleteUserSimulation,
  getDb,
  getUserSettings,
  listUserComparisons,
  listUserMaterialPrices,
  listUserSimulations,
  replaceUserMaterialPrices,
  upsertUserSettings,
} from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const jsonObject = z.record(z.string(), z.unknown());

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (opts.ctx.user) return opts.ctx.user;

      const userId = (opts.ctx.req as any).cookies?.userId;
      if (!userId) return null;

      const db = await getDb();
      if (!db) return null;

      const result = await db.select().from(users).where(eq(users.id, Number.parseInt(userId, 10))).limit(1);
      return result.length > 0 ? result[0] : null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie('userId', { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  authEmail: router({
    register: publicProcedure
      .input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");

        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        if (existing.length > 0) {
          const user = existing[0];
          if (user.emailVerified === 1) throw new Error("Este e-mail já está cadastrado e confirmado.");
          await db.update(users).set({
            name: input.name,
            passwordHash: input.password,
            verificationToken,
          }).where(eq(users.id, user.id));
          return {
            success: true,
            message: "Cadastro atualizado! Verifique seu e-mail para confirmar a conta.",
            verificationToken,
          };
        }

        await db.insert(users).values({
          openId: `email_${crypto.randomBytes(8).toString('hex')}`,
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
      .input(z.object({ email: z.string().email(), password: z.string() }))
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
          user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, role: user.role },
        };
      }),

    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");
        const found = await db.select().from(users).where(eq(users.verificationToken, input.token)).limit(1);
        if (found.length === 0) throw new Error("Token de confirmação inválido ou expirado.");
        await db.update(users).set({ emailVerified: 1, verificationToken: null }).where(eq(users.id, found[0].id));
        return { success: true, message: "E-mail confirmado com sucesso! Agora você pode fazer login." };
      }),

    resendVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados indisponível");
        const found = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (found.length === 0) throw new Error("E-mail não encontrado.");
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await db.update(users).set({ verificationToken }).where(eq(users.id, found[0].id));
        return { success: true, message: "Novo link de confirmação enviado para o seu e-mail.", verificationToken };
      }),
  }),

  persistence: router({
    simulations: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const rows = await listUserSimulations(ctx.user.id);
        return rows.map(row => {
          let data: Record<string, unknown> = {};
          try {
            data = JSON.parse(row.data) as Record<string, unknown>;
          } catch {
            // Mantém uma estrutura vazia para registros antigos corrompidos.
          }
          return { id: row.id, title: row.title, data, createdAt: row.createdAt, updatedAt: row.updatedAt };
        });
      }),
      save: protectedProcedure
        .input(z.object({ title: z.string().min(1).max(255), data: jsonObject }))
        .mutation(async ({ ctx, input }) => ({
          id: await createUserSimulation(ctx.user.id, input.title, JSON.stringify(input.data)),
        })),
      delete: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          await deleteUserSimulation(ctx.user.id, input.id);
          return { success: true } as const;
        }),
    }),

    settings: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        const row = await getUserSettings(ctx.user.id);
        if (!row) return null;
        try {
          return JSON.parse(row.data) as Record<string, unknown>;
        } catch {
          return null;
        }
      }),
      save: protectedProcedure
        .input(z.object({ data: jsonObject }))
        .mutation(async ({ ctx, input }) => {
          await upsertUserSettings(ctx.user.id, JSON.stringify(input.data));
          return { success: true } as const;
        }),
    }),

    comparisons: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const rows = await listUserComparisons(ctx.user.id);
        return rows.map(row => {
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(row.data) as Record<string, unknown>;
          } catch {
            parsed = { description: row.data };
          }
          return {
            ...parsed,
            id: String(row.id),
            timestamp: row.createdAt instanceof Date ? row.createdAt.getTime() : Date.now(),
            name: typeof parsed.name === "string" ? parsed.name : row.title,
          };
        });
      }),
      save: protectedProcedure
        .input(z.object({
          title: z.string().min(1).max(255),
          data: jsonObject,
          simulation1Id: z.number().int().positive().optional(),
          simulation2Id: z.number().int().positive().optional(),
        }))
        .mutation(async ({ ctx, input }) => ({
          id: await createUserComparison(ctx.user.id, input.title, JSON.stringify(input.data), input.simulation1Id, input.simulation2Id),
        })),
      delete: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          await deleteUserComparison(ctx.user.id, input.id);
          return { success: true } as const;
        }),
      clear: protectedProcedure.mutation(async ({ ctx }) => {
        await clearUserComparisons(ctx.user.id);
        return { success: true } as const;
      }),
    }),

    materialPrices: router({
      list: protectedProcedure.query(({ ctx }) => listUserMaterialPrices(ctx.user.id)),
      replace: protectedProcedure
        .input(z.object({ prices: z.array(z.object({ materialKey: z.string().min(1).max(100), price: z.string().max(50) })) }))
        .mutation(async ({ ctx, input }) => {
          await replaceUserMaterialPrices(ctx.user.id, input.prices);
          return { success: true } as const;
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
