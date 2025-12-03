# Visual Data Platform API

Crowdsourced visual data collection platform backend API.

## Features

- 🔐 JWT-based authentication
- 📸 Campaign management for photo collection
- ⬆️ Direct upload to Cloudflare R2 with presigned URLs
- ✅ Automated quality checks
- 💰 Earnings and payout tracking
- 📊 User statistics and transaction history
- 🛡️ Fraud detection and quality scoring

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: JWT + bcryptjs

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Cloudflare R2 account (or AWS S3)

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd visual-data-platform-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/visual_data_platform
JWT_SECRET=your-super-secret-key-here
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=visual-data-platform
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### 4. Set up the database

Generate Prisma client:

```bash
npm run prisma:generate
```

Push the schema to your database:

```bash
npm run db:push
```

### 5. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /v1/auth/signup` - Create new account
- `POST /v1/auth/login` - Login
- `GET /v1/auth/me` - Get current user profile
- `POST /v1/auth/logout` - Logout

### Campaigns

- `GET /v1/campaigns` - List active campaigns
- `GET /v1/campaigns/:id` - Get campaign details
- `GET /v1/campaigns/recommended/for-you` - Get recommended campaigns
- `POST /v1/campaigns` - Create campaign (admin)

### Uploads

- `POST /v1/uploads/initiate` - Get presigned upload URL
- `POST /v1/uploads/complete` - Complete upload with metadata
- `GET /v1/uploads/my-uploads` - Get user's uploads
- `GET /v1/uploads/:id` - Get upload details
- `GET /v1/uploads/admin/pending` - Get pending uploads (admin)
- `POST /v1/uploads/:id/approve` - Approve upload (admin)
- `POST /v1/uploads/:id/reject` - Reject upload (admin)

### Users

- `GET /v1/users/stats` - Get user statistics
- `GET /v1/users/earnings` - Get earnings summary
- `GET /v1/users/transactions` - Get transaction history
- `PATCH /v1/users/profile` - Update profile
- `POST /v1/users/payout-method` - Set payout method

## Deploying to Render

### Step 1: Set up Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket (e.g., `visual-data-platform`)
3. Create R2 API token:
   - Click "Manage R2 API Tokens"
   - Create API Token
   - Save: Access Key ID, Secret Access Key, Account ID

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 4: Create PostgreSQL Database

1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - Name: `visual-data-db`
   - Database: `visual_data_platform`
   - User: `visualdata`
   - Region: Choose closest to you
   - Plan: **Free** (or Starter $7/mo for production)
4. Click "Create Database"
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 5: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `visual-data-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm run prisma:migrate && npm start`
   - **Plan**: **Free** (or Starter $7/mo)

### Step 6: Add Environment Variables

In the "Environment" section, add these variables:

```
NODE_ENV=production
DATABASE_URL=<paste-internal-database-url>
JWT_SECRET=<generate-random-string>
REFRESH_TOKEN_SECRET=<generate-random-string>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=*

# Cloudflare R2
R2_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-access-key>
R2_SECRET_ACCESS_KEY=<your-secret-key>
R2_BUCKET_NAME=visual-data-platform
R2_PUBLIC_URL=https://<bucket-name>.<account-id>.r2.cloudflarestorage.com
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Config
MAX_FILE_SIZE_MB=50
MIN_IMAGE_WIDTH=1920
MIN_IMAGE_HEIGHT=1080
DEFAULT_BASE_PAYOUT=0.50
DEFAULT_BONUS_PAYOUT=0.25
```

**To generate random secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 7: Deploy

Click "Create Web Service" - Render will:

1. Clone your repository
2. Install dependencies
3. Build the TypeScript code
4. Run Prisma migrations
5. Start the server

### Step 8: Get Your API URL

Once deployed, your API will be at:

```
https://visual-data-api.onrender.com
```

Test it:

```bash
curl https://visual-data-api.onrender.com/v1/health
```

## Render Free Tier Limitations

⚠️ **Important**: Free tier web services sleep after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

**Solutions:**
1. Upgrade to Starter plan ($7/mo) for always-on
2. Use a ping service (e.g., UptimeRobot) to keep it awake
3. Handle cold starts gracefully in mobile app

## Auto-Deploy from GitHub

Render automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Monitoring

View logs in Render Dashboard:
- Click your service
- Go to "Logs" tab
- See real-time application logs

## Database Management

Access your database:

1. In Render Dashboard, click your database
2. Copy "External Database URL"
3. Use with any PostgreSQL client:

```bash
psql <external-database-url>
```

Or use Prisma Studio:

```bash
# Update DATABASE_URL in .env with external URL
npm run prisma:studio
```

## Troubleshooting

### Build fails

Check build logs in Render. Common issues:
- Missing environment variables
- TypeScript errors
- Prisma schema issues

### Database connection fails

- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** for Render services in same region
- Check database is running

### R2 uploads fail

- Verify R2 credentials are correct
- Check R2 bucket exists
- Ensure bucket has CORS configured (if needed)

### API returns 500 errors

Check logs in Render Dashboard for detailed error messages.

## Production Checklist

Before launching:

- [ ] Change all default secrets
- [ ] Set strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Set up error monitoring (Sentry)
- [ ] Enable database backups
- [ ] Set up custom domain
- [ ] Configure rate limiting
- [ ] Add API documentation
- [ ] Set up staging environment
- [ ] Configure automated backups

## Support

For issues or questions:
1. Check logs in Render Dashboard
2. Review this README
3. Check Render documentation: https://render.com/docs

## License

MIT
