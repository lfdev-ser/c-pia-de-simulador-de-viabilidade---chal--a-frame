import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq } from "drizzle-orm";
import {
  InsertUser,
  comparisonHistory,
  materialPrices,
  simulations,
  userSettings,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listUserSimulations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulations)
    .where(eq(simulations.userId, userId))
    .orderBy(desc(simulations.createdAt));
}

export async function createUserSimulation(userId: number, title: string, data: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(simulations).values({ userId, title, data });
  return Number(result[0].insertId);
}

export async function deleteUserSimulation(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(simulations).where(and(eq(simulations.id, id), eq(simulations.userId, userId)));
}

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserSettings(userId: number, data: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(userSettings).values({ userId, data }).onDuplicateKeyUpdate({ set: { data } });
}

export async function listUserComparisons(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comparisonHistory)
    .where(eq(comparisonHistory.userId, userId))
    .orderBy(desc(comparisonHistory.createdAt));
}

export async function createUserComparison(
  userId: number,
  title: string,
  data: string,
  simulation1Id?: number,
  simulation2Id?: number,
) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(comparisonHistory).values({
    userId,
    title,
    data,
    simulation1Id: simulation1Id ?? null,
    simulation2Id: simulation2Id ?? null,
  });
  return Number(result[0].insertId);
}

export async function deleteUserComparison(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(comparisonHistory).where(and(eq(comparisonHistory.id, id), eq(comparisonHistory.userId, userId)));
}

export async function clearUserComparisons(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(comparisonHistory).where(eq(comparisonHistory.userId, userId));
}

export async function listUserMaterialPrices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materialPrices).where(eq(materialPrices.userId, userId));
}

export async function replaceUserMaterialPrices(
  userId: number,
  prices: Array<{ materialKey: string; price: string }>,
) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(materialPrices).where(eq(materialPrices.userId, userId));
  if (prices.length > 0) {
    await db.insert(materialPrices).values(prices.map(price => ({ ...price, userId })));
  }
}

// TODO: add feature queries here as your schema grows.

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
