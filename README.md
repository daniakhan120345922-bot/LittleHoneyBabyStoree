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

## Vercel Deployment

### Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres or external)

### Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables**
   Add these environment variables in Vercel project settings:
   
   - `DATABASE_URL`: Your PostgreSQL connection string
     - For Vercel Postgres: Get from your Vercel Postgres dashboard
     - For external: `postgresql://user:password@host:port/database?schema=public`
   
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   
   - `NODE_ENV`: `production`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

5. **Run Database Migrations**
   After deployment, you need to set up your database:
   
   - If using Vercel Postgres: It will be automatically configured
   - If using external PostgreSQL: Run `npx prisma db push` locally with your production DATABASE_URL

6. **Seed Database (Optional)**
   - Run the seed script with production DATABASE_URL:
   ```bash
   DATABASE_URL="your-production-url" npm run db:seed
   ```

### Post-Deployment

- Update your `NEXTAUTH_URL` to match your actual Vercel domain
- Test the application at your Vercel URL
- Configure custom domain if needed in Vercel settings

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)
