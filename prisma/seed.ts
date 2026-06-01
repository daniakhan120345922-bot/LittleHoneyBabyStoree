import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const cashierPassword = await bcrypt.hash('Cashier123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@littlehoney.com' },
    update: {},
    create: {
      email: 'admin@littlehoney.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@littlehoney.com' },
    update: {},
    create: {
      email: 'cashier@littlehoney.com',
      name: 'Cashier User',
      password: cashierPassword,
      role: Role.CASHIER,
      isActive: true,
    },
  })

  console.log('Created users:', { admin, cashier })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Baby Diapers' },
      update: {},
      create: { name: 'Baby Diapers', description: 'Disposable and cloth diapers for babies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Milk' },
      update: {},
      create: { name: 'Baby Milk', description: 'Formula milk and breastfeeding supplies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Food' },
      update: {},
      create: { name: 'Baby Food', description: 'Purees, cereals, and snacks for babies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Clothes' },
      update: {},
      create: { name: 'Baby Clothes', description: 'Clothing and accessories for babies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Toys' },
      update: {},
      create: { name: 'Baby Toys', description: 'Toys and entertainment for babies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Care' },
      update: {},
      create: { name: 'Baby Care', description: 'Skincare and hygiene products for babies' },
    }),
    prisma.category.upsert({
      where: { name: 'Baby Accessories' },
      update: {},
      create: { name: 'Baby Accessories', description: 'Various baby accessories' },
    }),
    prisma.category.upsert({
      where: { name: 'Strollers' },
      update: {},
      create: { name: 'Strollers', description: 'Strollers and travel systems' },
    }),
    prisma.category.upsert({
      where: { name: 'Feeding Products' },
      update: {},
      create: { name: 'Feeding Products', description: 'Bottles, nipples, and feeding supplies' },
    }),
    prisma.category.upsert({
      where: { name: 'Health Products' },
      update: {},
      create: { name: 'Health Products', description: 'Health and wellness products for babies' },
    }),
  ])

  console.log('Created categories:', categories.length)

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { name: 'Baby Diapers Co.' },
      update: {},
      create: {
        name: 'Baby Diapers Co.',
        contactPerson: 'John Smith',
        phone: '+1 234 567 890',
        email: 'john@diapers.com',
        address: '123 Diaper Lane, Diaper City, DC',
        notes: 'Primary diaper supplier',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Organic Foods Ltd.' },
      update: {},
      create: {
        name: 'Organic Foods Ltd.',
        contactPerson: 'Sarah Johnson',
        phone: '+1 345 678 901',
        email: 'sarah@organicfoods.com',
        address: '456 Organic Way, Food City, FC',
        notes: 'Organic baby food supplier',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Toy World Inc.' },
      update: {},
      create: {
        name: 'Toy World Inc.',
        contactPerson: 'Mike Davis',
        phone: '+1 456 789 012',
        email: 'mike@toyworld.com',
        address: '789 Toy Street, Toy Town, TT',
        notes: 'Baby toys supplier',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Baby Fashion' },
      update: {},
      create: {
        name: 'Baby Fashion',
        contactPerson: 'Emily Brown',
        phone: '+1 567 890 123',
        email: 'emily@babyfashion.com',
        address: '321 Fashion Ave, Style City, SC',
        notes: 'Baby clothing supplier',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Health First' },
      update: {},
      create: {
        name: 'Health First',
        contactPerson: 'David Wilson',
        phone: '+1 678 901 234',
        email: 'david@healthfirst.com',
        address: '654 Health Road, Wellness City, WC',
        notes: 'Baby health products supplier',
      },
    }),
  ])

  console.log('Created suppliers:', suppliers.length)

  // Create products
  const diaperCategory = categories.find((c) => c.name === 'Baby Diapers')!
  const milkCategory = categories.find((c) => c.name === 'Baby Milk')!
  const foodCategory = categories.find((c) => c.name === 'Baby Food')!
  const clothesCategory = categories.find((c) => c.name === 'Baby Clothes')!
  const toysCategory = categories.find((c) => c.name === 'Baby Toys')!
  const careCategory = categories.find((c) => c.name === 'Baby Care')!

  const diaperSupplier = suppliers.find((s) => s.name === 'Baby Diapers Co.')!
  const milkSupplier = suppliers.find((s) => s.name === 'Organic Foods Ltd.')!
  const toySupplier = suppliers.find((s) => s.name === 'Toy World Inc.')!
  const clothesSupplier = suppliers.find((c) => c.name === 'Baby Fashion')!
  const careSupplier = suppliers.find((c) => c.name === 'Health First')!

  const products = await Promise.all([
    // Diapers
    prisma.product.upsert({
      where: { sku: 'PD-001' },
      update: {},
      create: {
        name: 'Pampers Premium Diapers',
        sku: 'PD-001',
        barcode: 'LH001',
        categoryId: diaperCategory.id,
        supplierId: diaperSupplier.id,
        brand: 'Pampers',
        costPrice: 12.00,
        sellingPrice: 18.99,
        stockQuantity: 150,
        reorderLevel: 10,
        description: 'Premium disposable diapers for newborns',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PD-002' },
      update: {},
      create: {
        name: 'Huggies Snug & Dry',
        sku: 'PD-002',
        barcode: 'LH002',
        categoryId: diaperCategory.id,
        supplierId: diaperSupplier.id,
        brand: 'Huggies',
        costPrice: 11.50,
        sellingPrice: 16.99,
        stockQuantity: 120,
        reorderLevel: 15,
        description: 'Snug and dry diapers',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PD-003' },
      update: {},
      create: {
        name: 'Luvs Ultra Leakguards',
        sku: 'PD-003',
        barcode: 'LH003',
        categoryId: diaperCategory.id,
        supplierId: diaperSupplier.id,
        brand: 'Luvs',
        costPrice: 10.00,
        sellingPrice: 14.99,
        stockQuantity: 200,
        reorderLevel: 20,
        description: 'Ultra leakguard diapers',
        isActive: true,
      },
    }),

    // Milk
    prisma.product.upsert({
      where: { sku: 'MF-001' },
      update: {},
      create: {
        name: 'Similac Advance Formula',
        sku: 'MF-001',
        barcode: 'LH004',
        categoryId: milkCategory.id,
        supplierId: milkSupplier.id,
        brand: 'Similac',
        costPrice: 25.00,
        sellingPrice: 35.99,
        stockQuantity: 8,
        reorderLevel: 10,
        description: 'Advance infant formula',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MF-002' },
      update: {},
      create: {
        name: 'Enfamil Infant Formula',
        sku: 'MF-002',
        barcode: 'LH005',
        categoryId: milkCategory.id,
        supplierId: milkSupplier.id,
        brand: 'Enfamil',
        costPrice: 24.00,
        sellingPrice: 32.99,
        stockQuantity: 25,
        reorderLevel: 10,
        description: 'Infant formula',
        isActive: true,
      },
    }),

    // Food
    prisma.product.upsert({
      where: { sku: 'BF-001' },
      update: {},
      create: {
        name: 'Gerber Baby Food',
        sku: 'BF-001',
        barcode: 'LH006',
        categoryId: foodCategory.id,
        supplierId: milkSupplier.id,
        brand: 'Gerber',
        costPrice: 1.50,
        sellingPrice: 2.99,
        stockQuantity: 200,
        reorderLevel: 30,
        description: 'Mixed fruit puree',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BF-002' },
      update: {},
      create: {
        name: 'Happy Baby Organic Puffs',
        sku: 'BF-002',
        barcode: 'LH007',
        categoryId: foodCategory.id,
        supplierId: milkSupplier.id,
        brand: 'Happy Baby',
        costPrice: 2.00,
        sellingPrice: 3.99,
        stockQuantity: 150,
        reorderLevel: 25,
        description: 'Organic baby puffs',
        isActive: true,
      },
    }),

    // Clothes
    prisma.product.upsert({
      where: { sku: 'BC-001' },
      update: {},
      create: {
        name: 'Baby Onesie',
        sku: 'BC-001',
        barcode: 'LH008',
        categoryId: clothesCategory.id,
        supplierId: clothesSupplier.id,
        brand: 'Carter\'s',
        costPrice: 8.00,
        sellingPrice: 12.99,
        stockQuantity: 75,
        reorderLevel: 15,
        description: 'Cotton onesie',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BC-002' },
      update: {},
      create: {
        name: 'Baby Sleep Sack',
        sku: 'BC-002',
        barcode: 'LH009',
        categoryId: clothesCategory.id,
        supplierId: clothesSupplier.id,
        brand: 'Halo',
        costPrice: 15.00,
        sellingPrice: 24.99,
        stockQuantity: 50,
        reorderLevel: 10,
        description: 'Sleep sack',
        isActive: true,
      },
    }),

    // Toys
    prisma.product.upsert({
      where: { sku: 'BT-001' },
      update: {},
      create: {
        name: 'Rattle Toy',
        sku: 'BT-001',
        barcode: 'LH010',
        categoryId: toysCategory.id,
        supplierId: toySupplier.id,
        brand: 'Fisher-Price',
        costPrice: 5.00,
        sellingPrice: 8.99,
        stockQuantity: 45,
        reorderLevel: 10,
        description: 'Baby rattle',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BT-002' },
      update: {},
      create: {
        name: 'Soft Plush Bear',
        sku: 'BT-002',
        barcode: 'LH011',
        categoryId: toysCategory.id,
        supplierId: toySupplier.id,
        brand: 'Gund',
        costPrice: 10.00,
        sellingPrice: 18.99,
        stockQuantity: 30,
        reorderLevel: 8,
        description: 'Soft plush bear',
        isActive: true,
      },
    }),

    // Care
    prisma.product.upsert({
      where: { sku: 'BCR-001' },
      update: {},
      create: {
        name: 'Baby Shampoo',
        sku: 'BCR-001',
        barcode: 'LH012',
        categoryId: careCategory.id,
        supplierId: careSupplier.id,
        brand: 'Johnson\'s',
        costPrice: 4.00,
        sellingPrice: 7.99,
        stockQuantity: 60,
        reorderLevel: 15,
        description: 'Gentle baby shampoo',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BCR-002' },
      update: {},
      create: {
        name: 'Baby Lotion',
        sku: 'BCR-002',
        barcode: 'LH013',
        categoryId: careCategory.id,
        supplierId: careSupplier.id,
        brand: 'Johnson\'s',
        costPrice: 4.50,
        sellingPrice: 8.99,
        stockQuantity: 55,
        reorderLevel: 15,
        description: 'Baby lotion',
        isActive: true,
      },
    }),
  ])

  console.log('Created products:', products.length)

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { phone: '+1 234 567 890' },
      update: {},
      create: {
        name: 'Emma Wilson',
        phone: '+1 234 567 890',
        email: 'emma@email.com',
        address: '123 Main St, City, State',
        loyaltyPoints: 250,
      },
    }),
    prisma.customer.upsert({
      where: { phone: '+1 345 678 901' },
      update: {},
      create: {
        name: 'James Brown',
        phone: '+1 345 678 901',
        email: 'james@email.com',
        address: '456 Oak Ave, City, State',
        loyaltyPoints: 178,
      },
    }),
    prisma.customer.upsert({
      where: { phone: '+1 456 789 012' },
      update: {},
      create: {
        name: 'Sophia Martinez',
        phone: '+1 456 789 012',
        email: 'sophia@email.com',
        address: '789 Pine Rd, City, State',
        loyaltyPoints: 468,
      },
    }),
    prisma.customer.upsert({
      where: { phone: '+1 567 890 123' },
      update: {},
      create: {
        name: 'Liam Johnson',
        phone: '+1 567 890 123',
        email: 'liam@email.com',
        address: '321 Elm St, City, State',
        loyaltyPoints: 120,
      },
    }),
    prisma.customer.upsert({
      where: { phone: '+1 678 901 234' },
      update: {},
      create: {
        name: 'Olivia Davis',
        phone: '+1 678 901 234',
        email: 'olivia@email.com',
        address: '654 Maple Dr, City, State',
        loyaltyPoints: 340,
      },
    }),
  ])

  console.log('Created customers:', customers.length)

  // Create settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Little Honey Baby Store',
      storeAddress: '123 Baby Street, City, State',
      storePhone: '(555) 123-4567',
      storeEmail: 'info@littlehoney.com',
      taxRate: 8,
      currency: 'USD',
      receiptHeader: 'Thank you for shopping with us!',
      receiptFooter: 'Please come again',
      barcodePrefix: 'LH',
      lowStockAlert: 10,
    },
  })

  console.log('Created settings')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
