import { z } from "zod"

export const saleItemSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
})

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  customerId: z.string().cuid().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "MOBILE_PAYMENT", "CREDIT"]),
  paidAmount: z.number().nonnegative(),
  notes: z.string().optional(),
})

export const returnItemSchema = z.object({
  saleItemId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  refundAmount: z.number().nonnegative(),
  reason: z.string().optional(),
})

export const returnSchema = z.object({
  saleId: z.string().cuid(),
  customerId: z.string().cuid().optional(),
  reason: z.string().min(1),
  refundAmount: z.number().nonnegative(),
  refundMethod: z.enum(["CASH", "CARD", "MOBILE_PAYMENT", "STORE_CREDIT"]),
  items: z.array(returnItemSchema).min(1),
  notes: z.string().optional(),
})
