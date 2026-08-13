import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { getUserById } from "../db";
import { sdk } from "./sdk";

type CreateExpressContextOptions = {
  req: Request;
  res: Response;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // A autenticação é opcional para procedures públicas.
    user = null;
  }

  // O fluxo de login por e-mail usa um cookie próprio. Resolver o usuário aqui
  // permite que protectedProcedure proteja também as contas desse fluxo.
  if (!user) {
    const userId = opts.req.cookies?.userId;
    if (userId) {
      const numericId = Number.parseInt(userId, 10);
      if (Number.isInteger(numericId) && numericId > 0) {
        user = (await getUserById(numericId)) ?? null;
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
