# Vercel Deployment Checklist

## Required Environment Variables

### Database
- **DATABASE_URL** (Required)
  - For Vercel Postgres: Get from your Vercel Postgres dashboard
  - For external PostgreSQL: `postgresql://user:password@host:port/database?schema=public`
  - Example: `postgresql://postgres:password@localhost:5432/little_honey_pos?schema=public`

### Authentication (Auth.js / NextAuth v5)
- **AUTH_SECRET** (Required)
  - Generate with: `openssl rand -base64 32`
  - Must be a random string for session encryption
  - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

- **AUTH_URL** (Required)
  - Set to your Vercel deployment URL
  - Development: `http://localhost:3000`
  - Production: `https://your-app.vercel.app`
  - Important: Must match the exact URL where the app is deployed

### Application
- **NODE_ENV** (Required)
  - Development: `development`
  - Production: `production`

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix environment variables and lint errors for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js

### 3. Configure Environment Variables in Vercel
Add these in your Vercel project settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| DATABASE_URL | Your PostgreSQL connection string | Production, Preview, Development |
| AUTH_SECRET | Generate with `openssl rand -base64 32` | Production, Preview, Development |
| AUTH_URL | Your Vercel deployment URL | Production, Preview, Development |
| NODE_ENV | `production` | Production |
| NODE_ENV | `development` | Development |

### 4. Deploy
- Click "Deploy"
- Wait for the build to complete (should succeed now)

### 5. Database Setup
After deployment, you need to set up your database:

**Option A: Vercel Postgres (Recommended)**
- Vercel Postgres will be automatically configured
- Run the following command locally to push schema:
```bash
DATABASE_URL="your-vercel-postgres-url" npx prisma db push
```

**Option B: External PostgreSQL**
- Run the following command locally with your production DATABASE_URL:
```bash
DATABASE_URL="your-production-url" npx prisma db push
```

### 6. Seed Database (Optional)
- Run the seed script with production DATABASE_URL:
```bash
DATABASE_URL="your-production-url" npm run db:seed
```

### 7. Post-Deployment Verification
- [ ] Update `AUTH_URL` to match your actual Vercel domain
- [ ] Test the application at your Vercel URL
- [ ] Test login with demo accounts:
  - Admin: admin@littlehoney.com / Admin123!
  - Cashier: cashier@littlehoney.com / Cashier123!
- [ ] Verify database connection
- [ ] Configure custom domain if needed in Vercel settings

## Troubleshooting

### Build Fails
- Check that all environment variables are set in Vercel
- Verify DATABASE_URL is valid and accessible
- Ensure AUTH_SECRET is set

### Authentication Issues
- Verify AUTH_URL matches your deployment URL exactly
- Check AUTH_SECRET is set and not empty
- Ensure cookies are enabled in your browser

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if your PostgreSQL database allows connections from Vercel
- For Vercel Postgres, ensure it's in the same region as your deployment

## Files Changed for Vercel Deployment

1. **vercel.json** - Removed invalid `env` section (Vercel doesn't support env vars in vercel.json)
2. **env.example** - Updated to use AUTH_URL and AUTH_SECRET (NextAuth v5)
3. **docker-compose.yml** - Updated to use AUTH_URL and AUTH_SECRET
4. **README.md** - Updated all references to use AUTH_URL and AUTH_SECRET
5. **prisma/schema.prisma** - Added CREDIT to PaymentMethod enum
6. **TypeScript/ESLint fixes** - Fixed 26 lint errors across multiple files
7. **app/dashboard/pos/page.tsx** - Fixed type issues and setState in effect
8. **lib/api-response.ts** - Replaced `any` with `unknown` for better type safety
9. **lib/offline-storage.ts** - Replaced `any` with `unknown`
10. **components/ui/input.tsx** - Fixed empty interface issue

## Success Criteria
- ✅ npm run build passes with zero errors
- ✅ npm run lint passes with zero errors
- ✅ No environment validation errors
- ✅ No Vercel deployment errors
- ✅ Project is production-ready for automatic GitHub → Vercel deployments
