import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  listUserSimulations: vi.fn().mockResolvedValue([
    {
      id: 7,
      userId: 11,
      title: "Projeto teste",
      data: JSON.stringify({ base: 5, height: 3.6, length: 8 }),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  ]),
  createUserSimulation: vi.fn().mockResolvedValue(42),
  deleteUserSimulation: vi.fn().mockResolvedValue(undefined),
  getUserSettings: vi.fn().mockResolvedValue({ data: JSON.stringify({ minFootHeight: 3.2 }) }),
  upsertUserSettings: vi.fn().mockResolvedValue(undefined),
  listUserComparisons: vi.fn().mockResolvedValue([]),
  createUserComparison: vi.fn().mockResolvedValue(9),
  deleteUserComparison: vi.fn().mockResolvedValue(undefined),
  clearUserComparisons: vi.fn().mockResolvedValue(undefined),
  listUserMaterialPrices: vi.fn().mockResolvedValue([]),
  replaceUserMaterialPrices: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createContext(user: TrpcContext["user"] = {
  id: 11,
  openId: "test-user",
  email: "test@example.com",
  name: "Usuário Teste",
  loginMethod: "email",
  passwordHash: null,
  emailVerified: 1,
  verificationToken: null,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
}): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("persistência do simulador", () => {
  it("bloqueia consultas quando não há usuário autenticado", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.persistence.simulations.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("lista simulações do usuário com os dados JSON convertidos", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.persistence.simulations.list();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 7,
      title: "Projeto teste",
      data: { base: 5, height: 3.6, length: 8 },
    });
    expect(dbMocks.listUserSimulations).toHaveBeenCalledWith(11);
  });

  it("salva e remove uma simulação vinculada ao usuário", async () => {
    const caller = appRouter.createCaller(createContext());

    const saved = await caller.persistence.simulations.save({
      title: "Novo projeto",
      data: { base: 6, height: 3.8, length: 9 },
    });
    await caller.persistence.simulations.delete({ id: 42 });

    expect(saved).toEqual({ id: 42 });
    expect(dbMocks.createUserSimulation).toHaveBeenCalledWith(
      11,
      "Novo projeto",
      JSON.stringify({ base: 6, height: 3.8, length: 9 }),
    );
    expect(dbMocks.deleteUserSimulation).toHaveBeenCalledWith(11, 42);
  });

  it("persiste configurações de negócio como um único documento por usuário", async () => {
    const caller = appRouter.createCaller(createContext());

    expect(await caller.persistence.settings.get()).toEqual({ minFootHeight: 3.2 });
    await caller.persistence.settings.save({ data: { minFootHeight: 3.5, pricesVersion: "v2" } });

    expect(dbMocks.upsertUserSettings).toHaveBeenCalledWith(
      11,
      JSON.stringify({ minFootHeight: 3.5, pricesVersion: "v2" }),
    );
  });
});
