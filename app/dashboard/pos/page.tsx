"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Barcode, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, Printer, Pause, Play, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { offlineStorage } from "@/lib/offline-storage"

export default function POSPage() {
  const [cart, setCart] = useState<Array<{ id: number; name: string; sku: string; price: number; quantity: number; image: string; subtotal: number }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOnline, setIsOnline] = useState(offlineStorage.isOnline())
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { id: "all", name: "All" },
    { id: "diapers", name: "Baby Diapers" },
    { id: "milk", name: "Baby Milk" },
    { id: "food", name: "Baby Food" },
    { id: "clothes", name: "Baby Clothes" },
    { id: "toys", name: "Baby Toys" },
    { id: "care", name: "Baby Care" },
  ]

  const products = [
    { id: 1, name: "Pampers Premium Diapers", sku: "PD-001", price: 18.99, stock: 150, category: "diapers", image: "🍼" },
    { id: 2, name: "Similac Advance Formula", sku: "MF-002", price: 35.99, stock: 8, category: "milk", image: "🥛" },
    { id: 3, name: "Gerber Baby Food", sku: "BF-003", price: 2.99, stock: 200, category: "food", image: "🥣" },
    { id: 4, name: "Baby Onesie", sku: "BC-004", price: 12.99, stock: 75, category: "clothes", image: "👕" },
    { id: 5, name: "Rattle Toy", sku: "BT-005", price: 8.99, stock: 45, category: "toys", image: "🧸" },
    { id: 6, name: "Baby Shampoo", sku: "BC-006", price: 7.99, stock: 60, category: "care", image: "🧴" },
    { id: 7, name: "Huggies Snug & Dry", sku: "PD-007", price: 16.99, stock: 120, category: "diapers", image: "🍼" },
    { id: 8, name: "Enfamil Infant Formula", sku: "MF-008", price: 32.99, stock: 25, category: "milk", image: "🥛" },
  ]

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-focus barcode input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2' || e.key === 'F3') {
        e.preventDefault()
        barcodeInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const addToCart = (product: { id: number; name: string; sku: string; price: number; image: string }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1, subtotal: product.price }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        }
        return item
      })
    )
  }

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault()
    const barcode = (e.target as HTMLFormElement).barcode.value
    const product = products.find((p) => p.sku === barcode || barcode.includes(p.sku))
    if (product) {
      addToCart(product)
      ;(e.target as HTMLFormElement).barcode.value = ""
    }
  }

  const completeSale = async (paymentMethod: string) => {
    if (cart.length === 0) return

    setIsProcessing(true)

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax

    const saleData = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      paymentMethod,
      paidAmount: total,
      subtotal,
      tax,
      total,
    }

    try {
      if (isOnline) {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Sale completed:', result)
          setCart([])
        } else {
          throw new Error('Failed to create sale')
        }
      } else {
        // Queue sale for offline mode
        await offlineStorage.queueSale(saleData)
        console.log('Sale queued for offline sync')
        setCart([])
      }
    } catch (error) {
      console.error('Error completing sale:', error)
      // Queue as fallback
      await offlineStorage.queueSale(saleData)
      setCart([])
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Side - Product Selection */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Search and Barcode */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products or scan barcode..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => barcodeInputRef.current?.focus()}>
                  <Barcode className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleBarcodeScan} className="mt-2">
                <Input
                  ref={barcodeInputRef}
                  name="barcode"
                  placeholder="Scan barcode (F2/F3 to focus)"
                  className="text-center"
                />
              </form>
            </CardContent>
          </Card>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="text-4xl text-center mb-2">{product.image}</div>
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Shopping Cart */}
        <div className="col-span-4 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shopping Cart</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" title="Hold Sale">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Resume Sale">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Cancel Sale" className="text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!isOnline && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Offline Mode - Sales will be queued
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Cart is empty
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <div className="text-2xl">{item.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-medium text-sm">${item.subtotal.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex flex-col h-20 gap-1"
                  onClick={() => completeSale('CASH')}
                  disabled={isProcessing || cart.length === 0}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-20 gap-1"
                  onClick={() => completeSale('CARD')}
                  disabled={isProcessing || cart.length === 0}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-20 gap-1"
                  onClick={() => completeSale('MOBILE_PAYMENT')}
                  disabled={isProcessing || cart.length === 0}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">Mobile</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 gap-1">
                  <Printer className="h-5 w-5" />
                  <span className="text-xs">Print</span>
                </Button>
              </div>

              <Button
                className="w-full mt-2"
                size="lg"
                disabled={isProcessing || cart.length === 0}
                onClick={() => completeSale('CASH')}
              >
                {isProcessing ? 'Processing...' : `Complete Sale - $${total.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
