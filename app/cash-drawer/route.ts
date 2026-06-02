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
    const { action, amount, reason, openingBalance } = body

    if (action === "open") {
      // Check if there's an open drawer for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingDrawer = await prisma.cashDrawer.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: today,
          },
          isOpen: true,
        },
      })

      if (existingDrawer) {
        return NextResponse.json({ error: "Drawer already open for today" }, { status: 400 })
      }

      const drawer = await prisma.cashDrawer.create({
        data: {
          userId: session.user.id,
          openingBalance: openingBalance || 0,
          cashIn: 0,
          cashOut: 0,
          isOpen: true,
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entityType: "CASH_DRAWER",
          entityId: drawer.id,
          newValue: JSON.stringify({ openingBalance }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      })

      return NextResponse.json({ success: true, drawer })
    }

    if (action === "close") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const drawer = await prisma.cashDrawer.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: today,
          },
          isOpen: true,
        },
      })

      if (!drawer) {
        return NextResponse.json({ error: "No open drawer found" }, { status: 404 })
      }

      const updatedDrawer = await prisma.cashDrawer.update({
        where: { id: drawer.id },
        data: {
          closingBalance: drawer.openingBalance + drawer.cashIn - drawer.cashOut,
          isOpen: false,
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entityType: "CASH_DRAWER",
          entityId: drawer.id,
          newValue: JSON.stringify({ closingBalance: updatedDrawer.closingBalance }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      })

      return NextResponse.json({ success: true, drawer: updatedDrawer })
    }

    if (action === "transaction") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const drawer = await prisma.cashDrawer.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: today,
          },
          isOpen: true,
        },
      })

      if (!drawer) {
        return NextResponse.json({ error: "No open drawer found" }, { status: 404 })
      }

      // Create transaction
      const transaction = await prisma.cashDrawerTransaction.create({
        data: {
          cashDrawerId: drawer.id,
          type: amount > 0 ? "IN" : "OUT",
          amount: Math.abs(amount),
          reason,
        },
      })

      // Update drawer
      const updatedDrawer = await prisma.cashDrawer.update({
        where: { id: drawer.id },
        data: {
          cashIn: amount > 0 ? { increment: amount } : undefined,
          cashOut: amount < 0 ? { increment: Math.abs(amount) } : undefined,
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entityType: "CASH_TRANSACTION",
          entityId: transaction.id,
          newValue: JSON.stringify({ type: transaction.type, amount: transaction.amount }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      })

      return NextResponse.json({ success: true, drawer: updatedDrawer, transaction })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in cash drawer:", error)
    return NextResponse.json({ error: "Failed to process cash drawer action" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    const whereClause: { userId: string; date?: { gte: Date; lt: Date } } = {
      userId: session.user.id,
    }

    if (date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      whereClause.date = {
        gte: targetDate,
        lt: nextDay,
      }
    }

    const drawers = await prisma.cashDrawer.findMany({
      where: whereClause,
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ drawers })
  } catch (error) {
    console.error("Error fetching cash drawers:", error)
    return NextResponse.json({ error: "Failed to fetch cash drawers" }, { status: 500 })
  }
}
