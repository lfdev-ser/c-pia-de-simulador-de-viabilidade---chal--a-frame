import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = pendente, 1 = confirmado
  verificationToken: varchar("verificationToken", { length: 128 }),
  resetPasswordToken: varchar("resetPasswordToken", { length: 128 }),
  resetPasswordExpires: timestamp("resetPasswordExpires"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * Simulações salvas pelos usuários
 */
export const simulations = mysqlTable("simulations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  data: text("data").notNull(), // JSON com os parâmetros da simulação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = typeof simulations.$inferInsert;

/**
 * Histórico de comparações entre simulações
 */
export const comparisonHistory = mysqlTable("comparison_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  simulation1Id: int("simulation1Id"),
  simulation2Id: int("simulation2Id"),
  data: text("data").notNull(), // JSON com dados comparativos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComparisonHistory = typeof comparisonHistory.$inferSelect;
export type InsertComparisonHistory = typeof comparisonHistory.$inferInsert;

/**
 * Preços customizados de materiais por usuário ou globais
 */
export const materialPrices = mysqlTable("material_prices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null se for global/padrão
  materialKey: varchar("materialKey", { length: 100 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaterialPrice = typeof materialPrices.$inferSelect;
export type InsertMaterialPrice = typeof materialPrices.$inferInsert;

/**
 * Configurações de negócio do simulador por usuário.
 * O JSON mantém a flexibilidade dos editores existentes sem perder o isolamento por conta.
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  data: text("data").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Obras ICF & Galeria (vídeos, fotos de blocos EPS, folders e catálogos)
 */
export const icfWorks = mysqlTable("icf_works", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'chalet' | 'blocks' | 'folder' | 'video'
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IcfWork = typeof icfWorks.$inferSelect;
export type InsertIcfWork = typeof icfWorks.$inferInsert;

/**
 * Patrocinadores / Posts Patrocinados (espaço gratuito para parceiros)
 */
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  externalLink: varchar("externalLink", { length: 500 }),
  address: varchar("address", { length: 500 }),
  website: varchar("website", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;
