import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { saleSchema } from "@/lib/validations/sales"
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(new Error("Unauthorized"), 401)
    }

    const body = await request.json()
    
    // Validate input
    const validation = saleSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { items, customerId, paymentMethod, paidAmount, notes } = validation.data

    // Check stock availability before transaction
    const productIds = items.map((item) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockQuantity: true, isActive: true },
    })

    const productStockMap = new Map<string, number>(products.map((p: { id: string; stockQuantity: number }) => [p.id, p.stockQuantity]))

    for (const item of items) {
      const stock: number = productStockMap.get(item.id) ?? 0
      if (stock < item.quantity) {
        return errorResponse(new Error(`Insufficient stock for product ${item.name}`), 400)
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.08
    const discount = 0
    const total = subtotal + tax

    if (paidAmount < total) {
      return errorResponse(new Error("Insufficient payment amount"), 400)
    }

    // Generate sale number
    const saleNumber = `SALE-${Date.now().toString().slice(-6)}`

    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Fetch products to get cost prices
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, costPrice: true },
      })

      const productCostMap = new Map(products.map((p: { id: string; costPrice: number }) => [p.id, p.costPrice]))

      let totalCost = 0
      let totalProfit = 0

      // Create sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: customerId || null,
          userId: session.user.id,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          paidAmount,
          changeAmount: paidAmount - total,
          notes,
        },
      })

      // Create sale items and update stock
      for (const item of items) {
        const productCost = productCostMap.get(item.id)
        const costPrice: number = (typeof productCost === 'number') ? productCost : 0
        const itemCost: number = costPrice * item.quantity
        const itemProfit: number = (item.price - costPrice) * item.quantity

        totalCost += itemCost
        totalProfit += itemProfit

        // Create sale item
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            costPrice,
            discount: 0,
            subtotal: item.price * item.quantity,
            profit: itemProfit,
          },
        })

        // Update product stock with negative check
        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })

        if (updatedProduct.stockQuantity < 0) {
          throw new Error(`Stock cannot go negative for product ${item.name}`)
        }

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.id,
            userId: session.user.id,
            type: "SALE",
            quantity: -item.quantity,
            referenceId: newSale.id,
            notes: `Sale #${saleNumber}`,
          },
        })
      }

      const profitMargin = total > 0 ? (totalProfit / total) * 100 : 0

      // Update sale with profit calculations
      await tx.sale.update({
        where: { id: newSale.id },
        data: {
          totalCost,
          profit: totalProfit,
          profitMargin,
        },
      })

      // Create payment record
      await tx.payment.create({
        data: {
          saleId: newSale.id,
          amount: paidAmount,
          paymentMethod,
        },
      })

      return { ...newSale, totalCost, profit: totalProfit, profitMargin }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "SALE",
        entityId: sale.id,
        newValue: JSON.stringify({ saleNumber, total, paymentMethod }),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return successResponse({ sale })
  } catch (error) {
    console.error("Error creating sale:", error)
    return errorResponse(error as Error, 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return errorResponse(new Error("Unauthorized"), 401)
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const sales = await prisma.sale.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const total = await prisma.sale.count()

    return successResponse({ sales, total })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return errorResponse(error as Error, 500)
  }
}
