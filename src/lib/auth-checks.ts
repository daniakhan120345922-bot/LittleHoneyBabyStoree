import { auth } from "@/lib/auth"
import { errorResponse } from "./api-response"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return errorResponse(new Error("Unauthorized"), 401)
  }
  return null
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return errorResponse(new Error("Unauthorized"), 401)
  }
  
  // Check if user is admin - you may need to adjust this based on your user model
  // This assumes the user object has a role property
  if (session.user.role !== "ADMIN") {
    return errorResponse(new Error("Forbidden: Admin access required"), 403)
  }
  
  return null
}

export async function requireCashier() {
  const session = await auth()
  if (!session?.user) {
    return errorResponse(new Error("Unauthorized"), 401)
  }
  
  // Allow both ADMIN and CASHIER roles
  if (session.user.role !== "ADMIN" && session.user.role !== "CASHIER") {
    return errorResponse(new Error("Forbidden: Cashier access required"), 403)
  }
  
  return null
}
