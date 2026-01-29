import { db } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import {
  stores, products, orders, awbGenerations, invoices, syncLogs, aiConfigs,
  type Store, type InsertStore, type UpdateStoreRequest,
  type Product,
  type Order,
  type AwbGeneration,
  type Invoice,
  type SyncLog,
  type AiConfig
} from "@shared/schema";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStoresByUser(userId: string): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore & { userId: string }): Promise<Store>;
  updateStore(id: number, updates: UpdateStoreRequest): Promise<Store>;
  deleteStore(id: number): Promise<void>;

  // Products
  getProducts(userId: string, storeId?: number, search?: string, limit?: number, offset?: number): Promise<{ items: Product[], total: number }>;
  updateProductStock(productId: number, quantity: number, userId: string): Promise<Product | undefined>;
  seedProducts(storeId: number, storeType: string): Promise<void>;
  
  // Orders
  getOrders(userId: string, storeId?: number, status?: string, limit?: number, offset?: number): Promise<{ items: Order[], total: number }>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithDetails(id: number, userId: string): Promise<{ order: Order, awb: AwbGeneration | null, invoice: Invoice | null } | undefined>;
  seedOrders(storeId: number): Promise<void>;
  
  // Logistics
  createAwb(data: any): Promise<AwbGeneration>;
  getAwbByOrderId(orderId: number): Promise<AwbGeneration | undefined>;
  getAwbByNumber(awbNumber: string): Promise<AwbGeneration | undefined>;
  updateAwbStatus(id: number, status: string, message: string): Promise<AwbGeneration | undefined>;
  getShipments(userId: string): Promise<any[]>;
  
  // Billing
  createInvoice(data: any): Promise<Invoice>;
  getInvoiceByOrderId(orderId: number): Promise<Invoice | undefined>;
  getInvoices(userId: string): Promise<any[]>;
  
  // AI Config
  getAiConfig(storeId: number): Promise<AiConfig | undefined>;
  upsertAiConfig(config: any): Promise<AiConfig>;
  
  // Logs
  getLogs(userId: string, storeId?: number, limit?: number): Promise<SyncLog[]>;
  createLog(log: any): Promise<SyncLog>;

  // Stats
  getDashboardStats(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // --- Stores ---
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(desc(stores.createdAt));
  }

  async getStoresByUser(userId: string): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.userId, userId)).orderBy(desc(stores.createdAt));
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(insertStore: InsertStore & { userId: string }): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  async updateStore(id: number, updates: any): Promise<Store> {
    const [store] = await db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return store;
  }

  async deleteStore(id: number): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }

  // --- Products ---
  async getProducts(userId: string, storeId?: number, search?: string, limit = 50, offset = 0): Promise<{ items: Product[], total: number }> {
    // Get user's stores first
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    
    if (storeIds.length === 0) {
      return { items: [], total: 0 };
    }

    let conditions = [inArray(products.storeId, storeIds)];
    if (storeId) {
      conditions.push(eq(products.storeId, storeId));
    }

    const items = await db.select().from(products)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.id));
    
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(products)
      .where(and(...conditions));
    
    return { items, total: Number(countResult?.count || 0) };
  }

  async updateProductStock(productId: number, quantity: number, userId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) return undefined;
    
    // Verify ownership
    const store = await this.getStore(product.storeId);
    if (!store || store.userId !== userId) return undefined;
    
    const [updated] = await db.update(products)
      .set({ stockQuantity: quantity, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    
    return updated;
  }

  async seedProducts(storeId: number, storeType: string): Promise<void> {
    const demoProducts = [
      { name: "Tricou Premium Alb", sku: "TPW-001", price: "89.99", stockQuantity: 150, status: "publish", imageUrl: "" },
      { name: "Bluză Casual Navy", sku: "BCN-002", price: "149.99", stockQuantity: 75, status: "publish", imageUrl: "" },
      { name: "Pantaloni Slim Fit", sku: "PSF-003", price: "199.99", stockQuantity: 45, status: "publish", imageUrl: "" },
      { name: "Jachetă Piele Neagră", sku: "JPN-004", price: "599.99", stockQuantity: 12, status: "publish", imageUrl: "" },
      { name: "Sneakers Urban", sku: "SU-005", price: "349.99", stockQuantity: 8, status: "publish", imageUrl: "" },
      { name: "Geantă Piele", sku: "GP-006", price: "449.99", stockQuantity: 3, status: "publish", imageUrl: "" },
      { name: "Ceas Automatic", sku: "CA-007", price: "1299.99", stockQuantity: 5, status: "publish", imageUrl: "" },
      { name: "Ochelari Soare", sku: "OS-008", price: "249.99", stockQuantity: 0, status: "draft", imageUrl: "" },
    ];

    for (const p of demoProducts) {
      await db.insert(products).values({
        storeId,
        remoteId: `${storeType}-${p.sku}`,
        ...p
      }).onConflictDoNothing();
    }
  }

  // --- Orders ---
  async getOrders(userId: string, storeId?: number, status?: string, limit = 50, offset = 0): Promise<{ items: Order[], total: number }> {
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    
    if (storeIds.length === 0) {
      return { items: [], total: 0 };
    }

    let conditions = [inArray(orders.storeId, storeIds)];
    if (storeId) conditions.push(eq(orders.storeId, storeId));
    if (status) conditions.push(eq(orders.status, status));

    const items = await db.select().from(orders)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.createdAt));
    
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(...conditions));
    
    return { items, total: Number(countResult?.count || 0) };
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithDetails(id: number, userId: string): Promise<{ order: Order, awb: AwbGeneration | null, invoice: Invoice | null } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    // Verify ownership
    const store = await this.getStore(order.storeId);
    if (!store || store.userId !== userId) return undefined;

    const [awb] = await db.select().from(awbGenerations).where(eq(awbGenerations.orderId, id));
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, id));

    return { order, awb: awb || null, invoice: invoice || null };
  }

  async seedOrders(storeId: number): Promise<void> {
    const statuses = ['pending', 'processing', 'completed', 'shipped'];
    const names = ['Ion Popescu', 'Maria Ionescu', 'Andrei Gheorghe', 'Elena Radu', 'Mihai Dobre'];
    
    for (let i = 0; i < 8; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const total = (Math.random() * 500 + 50).toFixed(2);
      
      await db.insert(orders).values({
        storeId,
        remoteId: `ORD-${Date.now()}-${i}`,
        orderNumber: `#${1000 + i}`,
        status,
        total,
        currency: 'RON',
        customerName: name,
        customerEmail: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        customerAddress: {
          street: 'Str. Exemplu nr. ' + (i + 1),
          city: 'București',
          county: 'București',
          postalCode: '01000' + i,
          country: 'România'
        },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }).onConflictDoNothing();
    }
  }

  // --- Logistics & Billing ---
  async createAwb(data: any): Promise<AwbGeneration> {
    const [awb] = await db.insert(awbGenerations).values(data).returning();
    return awb;
  }

  async getAwbByOrderId(orderId: number): Promise<AwbGeneration | undefined> {
    const [awb] = await db.select().from(awbGenerations).where(eq(awbGenerations.orderId, orderId));
    return awb;
  }

  async getAwbByNumber(awbNumber: string): Promise<AwbGeneration | undefined> {
    const [awb] = await db.select().from(awbGenerations).where(eq(awbGenerations.awbNumber, awbNumber));
    return awb;
  }

  async updateAwbStatus(id: number, status: string, message: string): Promise<AwbGeneration | undefined> {
    const [existing] = await db.select().from(awbGenerations).where(eq(awbGenerations.id, id));
    if (!existing) return undefined;

    const history = (existing.trackingHistory as any[]) || [];
    history.push({ status, message, timestamp: new Date().toISOString() });

    const [updated] = await db.update(awbGenerations)
      .set({ status: status as any, trackingHistory: history })
      .where(eq(awbGenerations.id, id))
      .returning();
    
    return updated;
  }

  async getShipments(userId: string): Promise<any[]> {
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    if (storeIds.length === 0) return [];

    const userOrders = await db.select().from(orders).where(inArray(orders.storeId, storeIds));
    const orderIds = userOrders.map(o => o.id);
    if (orderIds.length === 0) return [];

    const shipments = await db.select().from(awbGenerations)
      .where(inArray(awbGenerations.orderId, orderIds))
      .orderBy(desc(awbGenerations.createdAt));

    // Enrich with order data
    return shipments.map(s => {
      const order = userOrders.find(o => o.id === s.orderId);
      return { ...s, order };
    });
  }

  async createInvoice(data: any): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async getInvoiceByOrderId(orderId: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
    return invoice;
  }

  async getInvoices(userId: string): Promise<any[]> {
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    if (storeIds.length === 0) return [];

    const userOrders = await db.select().from(orders).where(inArray(orders.storeId, storeIds));
    const orderIds = userOrders.map(o => o.id);
    if (orderIds.length === 0) return [];

    const invoicesList = await db.select().from(invoices)
      .where(inArray(invoices.orderId, orderIds))
      .orderBy(desc(invoices.createdAt));

    return invoicesList.map(inv => {
      const order = userOrders.find(o => o.id === inv.orderId);
      return { ...inv, order };
    });
  }

  // --- AI Config ---
  async getAiConfig(storeId: number): Promise<AiConfig | undefined> {
    const [config] = await db.select().from(aiConfigs).where(eq(aiConfigs.storeId, storeId));
    return config;
  }

  async upsertAiConfig(data: any): Promise<AiConfig> {
    const [config] = await db.insert(aiConfigs)
      .values(data)
      .onConflictDoUpdate({ target: aiConfigs.storeId, set: data })
      .returning();
    return config;
  }

  // --- Logs ---
  async getLogs(userId: string, storeId?: number, limit = 100): Promise<SyncLog[]> {
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    if (storeIds.length === 0) return [];

    return await db.select().from(syncLogs)
      .where(inArray(syncLogs.storeId, storeIds))
      .limit(limit)
      .orderBy(desc(syncLogs.createdAt));
  }
  
  async createLog(log: any): Promise<SyncLog> {
    const [newLog] = await db.insert(syncLogs).values(log).returning();
    return newLog;
  }

  // --- Stats ---
  async getDashboardStats(userId: string): Promise<any> {
    const userStores = await this.getStoresByUser(userId);
    const storeIds = userStores.map(s => s.id);
    
    if (storeIds.length === 0) {
      return {
        totalRevenue: "0 RON",
        totalOrders: 0,
        productsCount: 0,
        lowStockCount: 0,
        pendingShipments: 0,
        storesCount: 0
      };
    }

    const [ordersResult] = await db.select({ 
      count: sql<number>`count(*)`,
      total: sql<string>`COALESCE(SUM(total::numeric), 0)`
    }).from(orders).where(inArray(orders.storeId, storeIds));
    
    const [productsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(products).where(inArray(products.storeId, storeIds));
    
    const [lowStockResult] = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(
        inArray(products.storeId, storeIds),
        sql`${products.stockQuantity} < 10`
      ));

    const orderIds = (await db.select({ id: orders.id }).from(orders).where(inArray(orders.storeId, storeIds))).map(o => o.id);
    let pendingShipments = 0;
    if (orderIds.length > 0) {
      const [pending] = await db.select({ count: sql<number>`count(*)` })
        .from(awbGenerations)
        .where(and(
          inArray(awbGenerations.orderId, orderIds),
          eq(awbGenerations.status, 'generated')
        ));
      pendingShipments = Number(pending?.count || 0);
    }

    return {
      totalRevenue: `${Number(ordersResult?.total || 0).toFixed(2)} RON`,
      totalOrders: Number(ordersResult?.count || 0),
      productsCount: Number(productsResult?.count || 0),
      lowStockCount: Number(lowStockResult?.count || 0),
      pendingShipments,
      storesCount: storeIds.length
    };
  }
}

export const storage = new DatabaseStorage();
