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
    const { name, type, discountType, discountValue, minQuantity, maxQuantity, startDate, endDate, applicableCategories, applicableProducts } = body

    const discountRule = await prisma.discountRule.create({
      data: {
        name,
        type,
        discountType,
        discountValue,
        minQuantity,
        maxQuantity,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        applicableCategories,
        applicableProducts,
        isActive: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "DISCOUNT_RULE",
        entityId: discountRule.id,
        newValue: JSON.stringify({ name, type, discountValue }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ success: true, discountRule })
  } catch (error) {
    console.error("Error creating discount rule:", error)
    return NextResponse.json({ error: "Failed to create discount rule" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    const discountRules = await prisma.discountRule.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ discountRules })
  } catch (error) {
    console.error("Error fetching discount rules:", error)
    return NextResponse.json({ error: "Failed to fetch discount rules" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, isActive } = body

    const discountRule = await prisma.discountRule.update({
      where: { id },
      data: { isActive },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "DISCOUNT_RULE",
        entityId: discountRule.id,
        newValue: JSON.stringify({ isActive }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ success: true, discountRule })
  } catch (error) {
    console.error("Error updating discount rule:", error)
    return NextResponse.json({ error: "Failed to update discount rule" }, { status: 500 })
  }
}
