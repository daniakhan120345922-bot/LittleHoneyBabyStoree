import { Button } from "@/components/ui/button"
import { Printer, Download, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReceiptProps {
  open: boolean
  onClose: () => void
  sale: {
    saleNumber: string
    date: string
    cashier: string
    items: Array<{
      name: string
      quantity: number
      price: number
      subtotal: number
    }>
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentMethod: string
    paidAmount: number
    changeAmount: number
  }
}

export function Receipt({ open, onClose, sale }: ReceiptProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content')
    if (printContent) {
      const printWindow = window.open('', '', 'width=80mm,height=auto')
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0;
                padding: 5mm;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
              }
              .header h1 {
                font-size: 16px;
                margin: 5px 0;
              }
              .header p {
                font-size: 10px;
                margin: 2px 0;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 11px;
              }
              .item-name {
                flex: 1;
              }
              .item-qty {
                width: 30px;
                text-align: center;
              }
              .item-price {
                width: 50px;
                text-align: right;
              }
              .total {
                text-align: right;
                font-weight: bold;
                margin: 5px 0;
              }
              .footer {
                text-align: center;
                margin-top: 15px;
                font-size: 10px;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownloadPDF = () => {
    // PDF download logic would go here
    console.log("Download PDF")
  }

  const handleEmail = () => {
    // Email logic would go here
    console.log("Email receipt")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>
            Sale #{sale.saleNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div 
          id="receipt-content" 
          className="bg-white p-4 text-black font-mono text-sm"
          style={{ width: '80mm', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="header">
            <div className="text-3xl mb-1">🍯</div>
            <h1 className="text-lg font-bold">Little Honey Baby Store</h1>
            <p className="text-xs">123 Baby Street, City, State</p>
            <p className="text-xs">Phone: (555) 123-4567</p>
          </div>

          <div className="divider"></div>

          {/* Sale Info */}
          <div className="text-xs space-y-1 mb-2">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{sale.saleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{sale.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashier}</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Items */}
          <div className="mb-2">
            {sale.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="flex justify-between text-xs">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-12 text-right">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="w-12 text-right">${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Tax:</span>
              <span>${sale.tax.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs">
                <span>Discount:</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm mt-2">
              <span>Total:</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Payment */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>${sale.paidAmount.toFixed(2)}</span>
            </div>
            {sale.changeAmount > 0 && (
              <div className="flex justify-between">
                <span>Change:</span>
                <span>${sale.changeAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="divider"></div>

          {/* Footer */}
          <div className="footer text-xs">
            <p>Thank you for shopping with us!</p>
            <p>Please come again</p>
            <p className="mt-2">Powered by Little Honey POS</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
