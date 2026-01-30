import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// --- Stores ---
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // Owner
  name: text("name").notNull(),
  type: text("type", { enum: ["woocommerce", "shopify", "magento", "prestashop"] }).notNull(),
  url: text("url").notNull(),
  
  // Credentials (encrypted ideally, but plain for MVP start)
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  accessToken: text("access_token"), // For Shopify/OAuth
  
  status: text("status", { enum: ["active", "inactive", "error"] }).default("active"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, { fields: [stores.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  syncLogs: many(syncLogs),
  aiConfig: one(aiConfigs),
}));

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, userId: true, lastSyncAt: true, createdAt: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// --- Products ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  remoteId: text("remote_id").notNull(), // ID in Woo/Shopify
  name: text("name").notNull(),
  sku: text("sku"),
  price: decimal("price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").default(0),
  status: text("status").default("publish"), // publish, draft, private
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
}));

export type Product = typeof products.$inferSelect;

// --- Orders ---
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  remoteId: text("remote_id").notNull(),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull(), // pending, processing, completed, cancelled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("RON"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerAddress: jsonb("customer_address"), // Full address object
  createdAt: timestamp("created_at").notNull(), // Original order date
  syncedAt: timestamp("synced_at").defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  awb: one(awbGenerations),
  invoice: one(invoices),
}));

export type Order = typeof orders.$inferSelect;

// --- AWB Generations (Shipping) ---
export const awbGenerations = pgTable("awb_generations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => orders.id),
  courier: text("courier", { enum: ["fancourier", "sameday", "gls"] }).notNull(),
  awbNumber: text("awb_number"),
  status: text("status", { enum: ["pending", "generated", "shipped", "delivered", "failed"] }).default("pending"),
  pdfUrl: text("pdf_url"),
  trackingHistory: jsonb("tracking_history"), // Array of events
  createdAt: timestamp("created_at").defaultNow(),
});

export const awbRelations = relations(awbGenerations, ({ one }) => ({
  order: one(orders, { fields: [awbGenerations.orderId], references: [orders.id] }),
}));

export type AwbGeneration = typeof awbGenerations.$inferSelect;

// --- Invoices (Billing) ---
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => orders.id),
  provider: text("provider", { enum: ["smartbill", "oblio"] }).notNull(),
  invoiceNumber: text("invoice_number"),
  series: text("series"),
  url: text("url"), // Public or signed URL to PDF
  status: text("status", { enum: ["draft", "issued", "cancelled", "failed"] }).default("issued"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
}));

export type Invoice = typeof invoices.$inferSelect;

// --- AI Layer Configuration ---
export const aiConfigs = pgTable("ai_configs", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().unique().references(() => stores.id),
  enabled: boolean("enabled").default(false),
  provider: text("provider").default("openai"), // openai, groq, anthropic
  model: text("model").default("gpt-4o"),
  settings: jsonb("settings"), // Custom prompts, temperature, etc.
  lastAnalysisAt: timestamp("last_analysis_at"),
});

export const aiConfigRelations = relations(aiConfigs, ({ one }) => ({
  store: one(stores, { fields: [aiConfigs.storeId], references: [stores.id] }),
}));

export type AiConfig = typeof aiConfigs.$inferSelect;

// --- Sync Logs ---
export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  entity: text("entity").notNull(), // product, order, stock
  action: text("action").notNull(), // sync, update, import
  status: text("status", { enum: ["success", "failed", "warning"] }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
  store: one(stores, { fields: [syncLogs.storeId], references: [stores.id] }),
}));

export type SyncLog = typeof syncLogs.$inferSelect;

// --- API Request Types ---
export type CreateStoreRequest = InsertStore;
export type UpdateStoreRequest = Partial<InsertStore>;

export type GenerateAwbRequest = {
  courier: "fancourier" | "sameday" | "gls";
  orderId: number;
};

export type GenerateInvoiceRequest = {
  provider: "smartbill" | "oblio";
  orderId: number;
};

export type DashboardStats = {
  totalRevenue: string;
  totalOrders: number;
  productsCount: number;
  lowStockCount: number;
  pendingShipments: number;
};


export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),  // ← UN SINGUR CÂMP
  // ...
});
