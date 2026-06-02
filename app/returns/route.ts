import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { saleId, customerId, reason, refundAmount, refundMethod, items, notes } = body

    // Generate return number
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`

    // Create return with items in a transaction
    const returnRecord = await prisma.$transaction(async (tx) => {
      // Create return
      const newReturn = await tx.return.create({
        data: {
          returnNumber,
          saleId,
          customerId: customerId || null,
          userId: session.user.id,
          reason,
          refundAmount,
          refundMethod,
          status: "PENDING",
          notes,
        },
      })

      // Create return items and restore stock
      for (const item of items) {
        // Create return item
        await tx.returnItem.create({
          data: {
            returnId: newReturn.id,
            saleItemId: item.saleItemId,
            productId: item.productId,
            quantity: item.quantity,
            refundAmount: item.refundAmount,
            reason: item.reason,
          },
        })

        // Restore product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        })

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            userId: session.user.id,
            type: "STOCK_IN",
            quantity: item.quantity,
            referenceId: newReturn.id,
            notes: `Return #${returnNumber}`,
          },
        })
      }

      return newReturn
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "RETURN",
        entityId: returnRecord.id,
        newValue: JSON.stringify({ returnNumber, refundAmount, refundMethod }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ success: true, return: returnRecord })
  } catch (error) {
    console.error("Error creating return:", error)
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const returns = await prisma.return.findMany({
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
        sale: {
          include: {
            items: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const total = await prisma.return.count()

    return NextResponse.json({ returns, total })
  } catch (error) {
    console.error("Error fetching returns:", error)
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 })
  }
}
