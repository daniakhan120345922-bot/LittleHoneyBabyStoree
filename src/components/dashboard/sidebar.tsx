"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut,
  Store,
  ClipboardList,
  Calculator
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Role } from "@prisma/client"

interface SidebarProps {
  userRole: Role
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "CASHIER"] },
  { name: "POS Terminal", href: "/dashboard/pos", icon: Calculator, roles: ["ADMIN", "CASHIER"] },
  { name: "Products", href: "/dashboard/products", icon: Package, roles: ["ADMIN"] },
  { name: "Categories", href: "/dashboard/categories", icon: Store, roles: ["ADMIN"] },
  { name: "Inventory", href: "/dashboard/inventory", icon: ClipboardList, roles: ["ADMIN"] },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck, roles: ["ADMIN"] },
  { name: "Customers", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "CASHIER"] },
  { name: "Sales", href: "/dashboard/sales", icon: ShoppingCart, roles: ["ADMIN", "CASHIER"] },
  { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart, roles: ["ADMIN"] },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍯</span>
          <span className="text-lg font-bold">Little Honey</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation
          .filter((item) => item.roles.includes(userRole))
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
      </nav>
      <div className="border-t border-slate-700 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
