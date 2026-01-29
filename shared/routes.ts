import { z } from 'zod';
import { insertStoreSchema, stores, products, orders, awbGenerations, invoices, syncLogs, aiConfigs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalRevenue: z.string(),
          totalOrders: z.number(),
          productsCount: z.number(),
          lowStockCount: z.number(),
          pendingShipments: z.number(),
        }),
      },
    },
  },
  stores: {
    list: {
      method: 'GET' as const,
      path: '/api/stores',
      responses: {
        200: z.array(z.custom<typeof stores.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stores/:id',
      responses: {
        200: z.custom<typeof stores.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stores',
      input: insertStoreSchema,
      responses: {
        201: z.custom<typeof stores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/stores/:id',
      input: insertStoreSchema.partial(),
      responses: {
        200: z.custom<typeof stores.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/stores/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    sync: {
      method: 'POST' as const,
      path: '/api/stores/:id/sync',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        storeId: z.coerce.number().optional(),
        search: z.string().optional(),
        page: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof products.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      input: z.object({
        storeId: z.coerce.number().optional(),
        status: z.string().optional(),
        page: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof orders.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect & { awb: typeof awbGenerations.$inferSelect | null, invoice: typeof invoices.$inferSelect | null }>(),
        404: errorSchemas.notFound,
      },
    },
    generateAwb: {
      method: 'POST' as const,
      path: '/api/orders/:id/awb',
      input: z.object({
        courier: z.enum(["fancourier", "sameday", "gls"]),
      }),
      responses: {
        200: z.custom<typeof awbGenerations.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    generateInvoice: {
      method: 'POST' as const,
      path: '/api/orders/:id/invoice',
      input: z.object({
        provider: z.enum(["smartbill", "oblio"]),
      }),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    config: {
      method: 'GET' as const,
      path: '/api/ai/config/:storeId',
      responses: {
        200: z.custom<typeof aiConfigs.$inferSelect | null>(),
      },
    },
    updateConfig: {
      method: 'POST' as const,
      path: '/api/ai/config/:storeId',
      input: z.object({
        enabled: z.boolean(),
        provider: z.string(),
        model: z.string(),
      }),
      responses: {
        200: z.custom<typeof aiConfigs.$inferSelect>(),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      input: z.object({
        storeId: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof syncLogs.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type StoreResponse = z.infer<typeof api.stores.create.responses[201]>;
export type ProductsListResponse = z.infer<typeof api.products.list.responses[200]>;
export type OrdersListResponse = z.infer<typeof api.orders.list.responses[200]>;
