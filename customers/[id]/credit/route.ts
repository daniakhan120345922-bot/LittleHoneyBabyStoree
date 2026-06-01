import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, reference, notes } = body

    // Get current customer
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Calculate new balance
    let newBalance = customer.creditBalance
    if (type === "CREDIT") {
      newBalance += amount
    } else if (type === "DEBIT" || type === "PAYMENT") {
      newBalance -= amount
    }

    // Check if within credit limit
    if (newBalance > customer.creditLimit) {
      return NextResponse.json({ error: "Credit limit exceeded" }, { status: 400 })
    }

    // Create credit transaction
    const transaction = await prisma.creditTransaction.create({
      data: {
        customerId: params.id,
        type,
        amount,
        balance: newBalance,
        reference,
        notes,
      },
    })

    // Update customer balance
    await prisma.customer.update({
      where: { id: params.id },
      data: { creditBalance: newBalance },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "CREDIT_TRANSACTION",
        entityId: transaction.id,
        newValue: JSON.stringify({ type, amount, balance: newBalance }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Error creating credit transaction:", error)
    return NextResponse.json({ error: "Failed to create credit transaction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.creditTransaction.findMany({
      where: { customerId: params.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching credit transactions:", error)
    return NextResponse.json({ error: "Failed to fetch credit transactions" }, { status: 500 })
  }
}
