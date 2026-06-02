import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, reference, notes } = body

    // Get current supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Calculate new balance
    let newBalance = supplier.creditBalance
    if (type === "CREDIT") {
      newBalance += amount
    } else if (type === "DEBIT" || type === "PAYMENT") {
      newBalance -= amount
    }

    // Check if within credit limit
    if (newBalance > supplier.creditLimit) {
      return NextResponse.json({ error: "Credit limit exceeded" }, { status: 400 })
    }

    // Create credit transaction
    const transaction = await prisma.supplierCreditTransaction.create({
      data: {
        supplierId: id,
        type,
        amount,
        balance: newBalance,
        reference,
        notes,
      },
    })

    // Update supplier balance
    await prisma.supplier.update({
      where: { id },
      data: { creditBalance: newBalance },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "SUPPLIER_CREDIT_TRANSACTION",
        entityId: transaction.id,
        newValue: JSON.stringify({ type, amount, balance: newBalance }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Error creating supplier credit transaction:", error)
    return NextResponse.json({ error: "Failed to create credit transaction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.supplierCreditTransaction.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching supplier credit transactions:", error)
    return NextResponse.json({ error: "Failed to fetch credit transactions" }, { status: 500 })
  }
}
