import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  full_name: z.string().min(1),
  email: z.string().email().optional(),
  roles: z.array(z.string()).default([])
});

export const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional()
});

export const warehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional()
});

export const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category_id: z.number().int().nullable().optional(),
  unit: z.string().min(1),
  cost: z.number().nonnegative().default(0),
  price: z.number().nonnegative().default(0),
  min_stock: z.number().nonnegative().default(0)
});

export const receiptSchema = z.object({
  code: z.string().min(1),
  supplier_id: z.number().int().nullable().optional(),
  warehouse_id: z.number().int(),
  received_at: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.number().int(),
        quantity: z.number().positive(),
        unit_cost: z.number().nonnegative()
      })
    )
    .min(1)
});

export const issueSchema = z.object({
  code: z.string().min(1),
  warehouse_id: z.number().int(),
  issued_at: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.number().int(),
        quantity: z.number().positive(),
        unit_price: z.number().nonnegative()
      })
    )
    .min(1)
});
