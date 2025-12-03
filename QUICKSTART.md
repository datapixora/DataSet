# ⚡ Quick Start Guide

Get your API running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Git installed

## Step 1: Install Dependencies

```bash
cd visual-data-platform-api
npm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

Make sure PostgreSQL is running, then create the database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE visual_data_platform;
\q
```

### Option B: Use Supabase (Free Cloud Database)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy the connection string
4. Update `.env` with the connection string

## Step 3: Configure Environment

The `.env` file is already created. Just update:

```bash
# Update database URL if needed
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visual_data_platform

# Add R2 credentials (or skip for now - uploads won't work without them)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
```

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run db:push

# (Optional) Add sample data
npm run db:seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 3000
📍 Environment: development
🔗 API URL: http://localhost:3000
```

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3000/v1/health
```

### Create Account

```bash
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "YourPass123!",
    "fullName": "Your Name"
  }'
```

Save the `accessToken` from the response!

### Get Campaigns

```bash
curl http://localhost:3000/v1/campaigns
```

### Get Your Profile

```bash
curl http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎉 Success!

Your API is running! Now you can:

1. **Build the mobile app** - Connect to `http://localhost:3000` (or your computer's IP for testing on device)
2. **Deploy to Render** - Follow `DEPLOYMENT_GUIDE.md`
3. **Customize** - Add your own campaigns, modify payouts, etc.

## Next Steps

- Read the full `README.md` for API documentation
- Check `DEPLOYMENT_GUIDE.md` to deploy to production
- View `prisma/schema.prisma` to understand the database structure
- Explore the code in `src/` directory

## Troubleshooting

### Can't connect to database

```bash
# Check PostgreSQL is running
pg_isready

# Or start it
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### Port 3000 already in use

Change the port in `.env`:
```
PORT=8000
```

### Prisma errors

```bash
# Reset and regenerate
rm -rf node_modules
npm install
npm run prisma:generate
```

## Need Help?

- Check the logs in your terminal
- Review the code - it's well commented
- Check `README.md` for full documentation
