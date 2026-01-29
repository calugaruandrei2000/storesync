import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, createUser, getUserById } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Custom JWT Auth Setup
  await setupAuth(app);

  // --- Dashboard ---
  app.get(api.dashboard.stats.path, isAuthenticated, async (req, res) => {
    const stats = await storage.getDashboardStats(req.user!.id);
    res.json(stats);
  });

  // --- Stores ---
  app.get(api.stores.list.path, isAuthenticated, async (req, res) => {
    const stores = await storage.getStoresByUser(req.user!.id);
    res.json(stores);
  });

  app.get(api.stores.get.path, isAuthenticated, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store || store.userId !== req.user!.id) {
      return res.status(404).json({ message: "Magazin negăsit" });
    }
    res.json(store);
  });

  app.post(api.stores.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.stores.create.input.parse(req.body);
      const store = await storage.createStore({ ...input, userId: req.user!.id }); 
      
      await storage.createLog({
        storeId: store.id,
        entity: 'store',
        action: 'create',
        status: 'success',
        message: `Magazin ${store.name} conectat cu succes`
      });

      res.status(201).json(store);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      res.status(500).json({ message: "Eroare internă" });
    }
  });

  app.put(api.stores.update.path, isAuthenticated, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store || store.userId !== req.user!.id) {
      return res.status(404).json({ message: "Magazin negăsit" });
    }
    const updated = await storage.updateStore(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete(api.stores.delete.path, isAuthenticated, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store || store.userId !== req.user!.id) {
      return res.status(404).json({ message: "Magazin negăsit" });
    }
    await storage.deleteStore(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.stores.sync.path, isAuthenticated, async (req, res) => {
    const storeId = Number(req.params.id);
    const store = await storage.getStore(storeId);
    if (!store || store.userId !== req.user!.id) {
      return res.status(404).json({ message: "Magazin negăsit" });
    }

    // Simulate sync process
    await storage.createLog({
      storeId,
      entity: 'sync',
      action: 'start',
      status: 'success',
      message: `Sincronizare inițiată pentru ${store.name}`
    });

    // Background sync simulation
    setTimeout(async () => {
      try {
        // Seed some demo products
        await storage.seedProducts(storeId, store.type);
        // Seed some demo orders
        await storage.seedOrders(storeId);
        
        await storage.createLog({
          storeId,
          entity: 'product',
          action: 'sync',
          status: 'success',
          message: `Sincronizate 45 produse din ${store.type}`
        });
        await storage.createLog({
          storeId,
          entity: 'order',
          action: 'sync',
          status: 'success',
          message: 'Sincronizate 8 comenzi noi'
        });
        
        await storage.updateStore(storeId, { lastSyncAt: new Date() });
      } catch (e) {
        console.error("Sync error:", e);
      }
    }, 1500);

    res.json({ message: "Sincronizare pornită" });
  });

  // --- Products ---
  app.get(api.products.list.path, isAuthenticated, async (req, res) => {
    const result = await storage.getProducts(
      req.user!.id,
      req.query.storeId ? Number(req.query.storeId) : undefined,
      req.query.search as string
    );
    res.json(result);
  });

  // Update stock
  app.put("/api/products/:id/stock", isAuthenticated, async (req, res) => {
    const productId = Number(req.params.id);
    const { quantity } = req.body;
    
    const product = await storage.updateProductStock(productId, quantity, req.user!.id);
    if (!product) {
      return res.status(404).json({ message: "Produs negăsit" });
    }
    
    res.json(product);
  });

  // --- Orders ---
  app.get(api.orders.list.path, isAuthenticated, async (req, res) => {
    const result = await storage.getOrders(
      req.user!.id,
      req.query.storeId ? Number(req.query.storeId) : undefined,
      req.query.status as string
    );
    res.json(result);
  });

  app.get(api.orders.get.path, isAuthenticated, async (req, res) => {
    const result = await storage.getOrderWithDetails(Number(req.params.id), req.user!.id);
    if (!result) return res.status(404).json({ message: "Comandă negăsită" });
    res.json(result);
  });

  // --- AWB Generation ---
  app.post(api.orders.generateAwb.path, isAuthenticated, async (req, res) => {
    const orderId = Number(req.params.id);
    const { courier } = req.body;
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Comandă negăsită" });
    }

    // Check if AWB already exists
    const existingAwb = await storage.getAwbByOrderId(orderId);
    if (existingAwb) {
      return res.status(400).json({ message: "AWB deja generat pentru această comandă" });
    }

    // Generate AWB number based on courier
    const awbPrefix = courier === 'fancourier' ? 'FC' : courier === 'sameday' ? 'SD' : 'GLS';
    const awbNumber = `${awbPrefix}${Date.now().toString().slice(-10)}`;
    
    const awb = await storage.createAwb({
      orderId,
      courier,
      awbNumber,
      status: 'generated',
      pdfUrl: `/api/awb/${awbNumber}/pdf`,
      trackingHistory: [
        { status: 'generated', timestamp: new Date().toISOString(), message: 'AWB generat' }
      ]
    });

    await storage.createLog({
      storeId: order.storeId,
      entity: 'awb',
      action: 'generate',
      status: 'success',
      message: `AWB ${awbNumber} generat pentru comanda ${order.orderNumber}`
    });

    res.json(awb);
  });

  // --- AWB Tracking ---
  app.get("/api/awb/:awbNumber/track", isAuthenticated, async (req, res) => {
    const awb = await storage.getAwbByNumber(req.params.awbNumber as string);
    if (!awb) {
      return res.status(404).json({ message: "AWB negăsit" });
    }
    res.json(awb);
  });

  // Simulate tracking update (for demo)
  app.post("/api/awb/:id/update-status", isAuthenticated, async (req, res) => {
    const awbId = Number(req.params.id);
    const { status, message } = req.body;
    
    const awb = await storage.updateAwbStatus(awbId, status, message);
    if (!awb) {
      return res.status(404).json({ message: "AWB negăsit" });
    }
    res.json(awb);
  });

  // --- Invoice Generation ---
  app.post(api.orders.generateInvoice.path, isAuthenticated, async (req, res) => {
    const orderId = Number(req.params.id);
    const { provider } = req.body;

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Comandă negăsită" });
    }

    // Check if invoice already exists
    const existingInvoice = await storage.getInvoiceByOrderId(orderId);
    if (existingInvoice) {
      return res.status(400).json({ message: "Factură deja generată pentru această comandă" });
    }

    const series = provider === 'smartbill' ? 'SB' : 'OB';
    const invoiceNumber = `${series}${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const invoice = await storage.createInvoice({
      orderId,
      provider,
      invoiceNumber,
      series,
      status: 'issued',
      url: `/api/invoices/${invoiceNumber}/pdf`
    });

    await storage.createLog({
      storeId: order.storeId,
      entity: 'invoice',
      action: 'generate',
      status: 'success',
      message: `Factură ${invoiceNumber} emisă pentru comanda ${order.orderNumber}`
    });

    res.json(invoice);
  });

  // --- Shipments List ---
  app.get("/api/shipments", isAuthenticated, async (req, res) => {
    const shipments = await storage.getShipments(req.user!.id);
    res.json(shipments);
  });

  // --- Invoices List ---
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    const invoices = await storage.getInvoices(req.user!.id);
    res.json(invoices);
  });

  // --- Logs ---
  app.get(api.logs.list.path, isAuthenticated, async (req, res) => {
    const logs = await storage.getLogs(req.user!.id);
    res.json(logs);
  });

  // --- AI Config ---
  app.get(api.ai.config.path, isAuthenticated, async (req, res) => {
    const config = await storage.getAiConfig(Number(req.params.storeId));
    res.json(config || null);
  });

  app.post(api.ai.updateConfig.path, isAuthenticated, async (req, res) => {
    const config = await storage.upsertAiConfig({
      storeId: Number(req.params.storeId),
      ...req.body
    });
    res.json(config);
  });

  return httpServer;
}
