# 🚀 Deployment Guide - Render Free Tier

Complete step-by-step guide to deploy your Visual Data Platform API to Render for **$0/month**.

## Prerequisites

- ✅ GitHub account
- ✅ Render account (sign up at render.com)
- ✅ Cloudflare account (for R2 storage)

---

## Part 1: Set Up Cloudflare R2 (5 minutes)

### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **R2** in the sidebar
3. Click **Create bucket**
4. Bucket name: `visual-data-platform` (or your choice)
5. Location: Automatic
6. Click **Create bucket**

### Step 2: Create R2 API Token

1. In R2 page, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Token name: `visual-data-api-token`
4. Permissions: **Admin Read & Write**
5. Click **Create API Token**
6. **SAVE THESE VALUES** (you won't see them again):
   - ✅ Access Key ID
   - ✅ Secret Access Key
   - ✅ Account ID (shown at top of page)

### Step 3: Get R2 Endpoint URL

Your R2 endpoint format:
```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Your R2 public URL format:
```
https://<BUCKET_NAME>.<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Replace `<ACCOUNT_ID>` with your actual Account ID from Step 2.

---

## Part 2: Push Code to GitHub (2 minutes)

### Step 1: Initialize Git

```bash
cd visual-data-platform-api
git init
git add .
git commit -m "Initial commit - Visual Data Platform API"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `visual-data-platform-api`
3. Privacy: **Private** (recommended)
4. **Don't** initialize with README (we already have one)
5. Click **Create repository**

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/visual-data-platform-api.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Render (10 minutes)

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **Get Started**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your GitHub

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **New +**
2. Select **PostgreSQL**
3. Configure:
   ```
   Name: visual-data-db
   Database: visual_data_platform
   User: visualdata
   Region: Oregon (US West) or closest to you
   PostgreSQL Version: 16
   Plan: Free
   ```
4. Click **Create Database**
5. Wait 1-2 minutes for database to be created
6. **COPY the Internal Database URL** (starts with `postgresql://`)
   - You'll need this in Step 4
   - Format: `postgresql://visualdata:PASSWORD@HOST/visual_data_platform`

### Step 3: Create Web Service

1. Click **New +** again
2. Select **Web Service**
3. Click **Connect a repository**
4. Find and select `visual-data-platform-api`
5. Configure:
   ```
   Name: visual-data-api
   Region: Oregon (same as database)
   Branch: main
   Root Directory: (leave blank)
   Runtime: Node
   Build Command: npm install && npm run prisma:generate && npm run build
   Start Command: npm run prisma:migrate && npm start
   Plan: Free
   ```
6. **DON'T CLICK CREATE YET** - we need to add environment variables first

### Step 4: Add Environment Variables

Scroll down to **Environment Variables** section and add these:

#### Required Variables

```bash
# App Configuration
NODE_ENV=production
PORT=10000

# Database (paste from Step 2)
DATABASE_URL=postgresql://visualdata:PASSWORD@HOST/visual_data_platform

# JWT Secrets (generate random strings)
JWT_SECRET=<GENERATE_RANDOM_STRING>
REFRESH_TOKEN_SECRET=<GENERATE_RANDOM_STRING>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=*

# Cloudflare R2 (from Part 1)
R2_ACCOUNT_ID=<YOUR_ACCOUNT_ID>
R2_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
R2_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
R2_BUCKET_NAME=visual-data-platform
R2_PUBLIC_URL=https://visual-data-platform.<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ENDPOINT=https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com

# Upload Configuration
MAX_FILE_SIZE_MB=50
MAX_UPLOADS_PER_DAY_NEW_USER=50
MAX_UPLOADS_PER_DAY_VERIFIED=200
MIN_IMAGE_WIDTH=1920
MIN_IMAGE_HEIGHT=1080

# Payout Configuration
DEFAULT_BASE_PAYOUT=0.50
DEFAULT_BONUS_PAYOUT=0.25
```

#### How to Generate Random Secrets

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using Online Tool**
Go to: https://randomkeygen.com/ and copy a 256-bit key

**Option 3: Using OpenSSL**
```bash
openssl rand -hex 32
```

### Step 5: Deploy!

1. Scroll down and click **Create Web Service**
2. Render will now:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Build TypeScript
   - Run database migrations
   - Start the server
3. Wait 3-5 minutes for first deploy
4. Watch the logs in real-time

### Step 6: Verify Deployment

Once you see "Deploy succeeded", your API is live!

**Your API URL:**
```
https://visual-data-api.onrender.com
```

**Test it:**
```bash
curl https://visual-data-api.onrender.com/v1/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-03-12T10:30:00.000Z"
}
```

---

## Part 4: Seed Database (Optional)

Add sample data to test your API:

### Step 1: Connect to Database

In your local terminal:

```bash
# Copy the EXTERNAL Database URL from Render
# (not the internal one - it's different)

# Update your local .env
DATABASE_URL=<EXTERNAL_DATABASE_URL>
```

### Step 2: Run Seed

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@example.com` / `Admin@123`
- Test user: `test@example.com` / `Test@123`
- 3 sample campaigns
- Sample tags

### Step 3: Test Login

```bash
curl -X POST https://visual-data-api.onrender.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

---

## Part 5: Auto-Deploy Setup

Render automatically deploys when you push to GitHub!

```bash
# Make a change
echo "# Updated" >> README.md

# Commit and push
git add .
git commit -m "Update documentation"
git push origin main
```

Render will automatically:
1. Detect the push
2. Start a new build
3. Deploy the new version
4. Zero downtime!

---

## 🎯 Next Steps

### 1. Configure Custom Domain (Optional)

1. In Render Dashboard, click your service
2. Go to **Settings** → **Custom Domain**
3. Add your domain: `api.yourdomain.com`
4. Update DNS records as instructed
5. Render provides free SSL automatically

### 2. Monitor Your API

**View Logs:**
- Render Dashboard → Your Service → **Logs** tab
- Real-time log streaming
- Search and filter

**View Metrics:**
- Render Dashboard → Your Service → **Metrics** tab
- CPU, Memory, Request counts
- Response times

### 3. Upgrade When Needed

**Free Tier Limitations:**
- ⏱️ Sleeps after 15 min inactivity
- 🔄 Takes ~30 sec to wake up
- 💾 512MB RAM
- 📊 Limited build minutes

**When to Upgrade to Starter ($7/mo):**
- ✅ You have 10+ daily active users
- ✅ You're charging users
- ✅ You need 24/7 uptime
- ✅ You raised funding

---

## 🔧 Troubleshooting

### Build Failed

**Check:**
1. View build logs in Render
2. Verify all environment variables are set
3. Check `package.json` scripts are correct

**Common issues:**
```bash
# Missing environment variable
Error: Invalid connection string

# Solution: Double-check DATABASE_URL is set

# TypeScript error
Error: Cannot find module './config'

# Solution: Check import paths, rebuild locally first
```

### Database Connection Failed

**Check:**
1. DATABASE_URL is the **Internal** URL (for Render → Render connections)
2. Database and API are in the same region
3. Database is running (green status in Render)

### R2 Upload Failed

**Check:**
1. R2 credentials are correct
2. Bucket name matches
3. Account ID is correct
4. Endpoint URL format is correct

### API Returns 500 Error

**Check logs:**
1. Render Dashboard → Service → Logs
2. Look for error stack traces
3. Common issues:
   - Missing environment variables
   - Database connection issues
   - R2 credential issues

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Render API** | Free (sleeps after 15min) | $7/mo (always on) |
| **Render Database** | Free (90 days, then $7/mo) | $7/mo |
| **Cloudflare R2** | 10GB free/month | $0.015/GB after |
| **Total MVP** | **$0/mo (first 90 days)** | **$14/mo** |

---

## ✅ Deployment Checklist

- [ ] Cloudflare R2 bucket created
- [ ] R2 API token generated and saved
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Web service deployed successfully
- [ ] Health check endpoint returns 200
- [ ] Database seeded (optional)
- [ ] Test login works
- [ ] Auto-deploy configured

---

## 🎉 Success!

Your Visual Data Platform API is now live at:
```
https://visual-data-api.onrender.com
```

Ready to build the mobile app? Check out the main README for API documentation.

**Need help?**
- Check Render docs: https://render.com/docs
- Check Prisma docs: https://www.prisma.io/docs
- Review the logs in Render Dashboard
