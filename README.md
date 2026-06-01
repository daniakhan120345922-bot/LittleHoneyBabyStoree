# Little Honey Baby Store - Point of Sale System

A complete, production-ready POS application for a baby products retail store.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Prisma ORM
- PostgreSQL
- NextAuth Authentication
- React Query / TanStack Query
- Zustand for local state
- Zod validation
- Recharts for analytics
- React Hook Form
- Docker support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally or accessible

### Environment Setup

1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/little_honey_pos?schema=public"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Accounts

**Admin:**
- Email: admin@littlehoney.com
- Password: Admin123!

**Cashier:**
- Email: cashier@littlehoney.com
- Password: Cashier123!

## Features

- **Dashboard**: Analytics cards, charts, recent activities
- **Product Management**: CRUD, search, filter, import/export
- **Inventory Management**: Stock in/out, adjustments, history
- **Supplier Management**: Contact management, purchase history
- **Customer Management**: Loyalty program, purchase history
- **POS Terminal**: Barcode scanning, cart, payment processing
- **Purchase Management**: Purchase orders, inventory updates
- **Reports**: Sales, inventory, financial, customer reports
- **Analytics**: Revenue trends, top products, customer growth
- **Settings**: Store configuration, system settings

## Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push

# Seed database
docker-compose exec app npm run db:seed
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)
