# Visual Data Platform API

> Crowdsourced visual data collection platform backend API

[![Deploy Status](https://img.shields.io/badge/deploy-render-success)](https://visual-data-api.onrender.com)
[![API Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/datapixora/DataSet)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Live Demo

- **API Base URL**: https://visual-data-api.onrender.com
- **Health Check**: https://visual-data-api.onrender.com/v1/health
- **Admin Dashboard**: [Coming Soon - Deploy your own]

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Overview](./docs/system-overview.md)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

## 🎯 Overview

Visual Data Platform is a crowdsourced photo collection platform that allows organizations to collect high-quality, categorized images from contributors worldwide. Think of it as a marketplace where:

- **Organizations** create photo collection campaigns with specific requirements
- **Contributors** upload photos and earn money for approved submissions
- **AI & Human Review** ensures quality and relevance
- **Automated Payouts** reward contributors fairly

**Use Cases:**
- Training datasets for computer vision AI models
- Stock photography collections
- Research data gathering
- Crowdsourced mapping/documentation projects

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user registration and login
- 📸 **Campaign Management** - Create and manage photo collection campaigns
- ☁️ **Cloud Storage** - Direct upload to Cloudflare R2 with presigned URLs
- ✅ **Quality Control** - Automated and manual review system
- 💰 **Earnings System** - Track payouts and user balances
- 🎯 **Recommendations** - AI-powered campaign suggestions
- 📊 **Analytics** - User statistics and transaction history

### Quality & Security
- ✅ Automated quality checks (resolution, format, metadata)
- 🛡️ Fraud detection and quality scoring
- 🔒 Role-based access control (Admin/User)
- 📝 Comprehensive API validation
- 🚨 Error handling and logging

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma 5.x |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Authentication** | JWT + bcryptjs |
| **Validation** | express-validator |
| **Deployment** | Render.com (Free tier) |

## 🚀 Getting Started

### Prerequisites

```bash
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
psql --version  # PostgreSQL 14+
```

### 1. Clone the Repository

```bash
git clone https://github.com/datapixora/DataSet.git
cd DataSet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visual_data_platform

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=your-super-secret-key-here
REFRESH_TOKEN_SECRET=another-super-secret-key

# Cloudflare R2 (or AWS S3)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=visual-data-platform
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Optional
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run db:push

# (Optional) Seed sample data
curl -X POST http://localhost:3000/seed
```

### 5. Start Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000`

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/v1/health

# Create test account
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

## 📚 API Documentation

### Base URL
```
Production: https://visual-data-api.onrender.com/v1
Development: http://localhost:3000/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create new account | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Campaign Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/campaigns` | List active campaigns | Optional |
| GET | `/campaigns/:id` | Get campaign details | Optional |
| GET | `/campaigns/recommended/for-you` | Get recommended campaigns | Yes |
| POST | `/campaigns` | Create campaign | Yes (Admin) |
| PATCH | `/campaigns/:id` | Update campaign | Yes (Admin) |

### Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/uploads/initiate` | Get presigned upload URL | Yes |
| POST | `/uploads/complete` | Complete upload with metadata | Yes |
| GET | `/uploads/my-uploads` | Get user's uploads | Yes |
| GET | `/uploads/:id` | Get upload details | Yes |
| GET | `/uploads/admin/all` | Get all uploads (admin) | Yes (Admin) |
| GET | `/uploads/admin/pending` | Get pending uploads | Yes (Admin) |
| POST | `/uploads/:id/approve` | Approve upload | Yes (Admin) |
| POST | `/uploads/:id/reject` | Reject upload | Yes (Admin) |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/stats` | Get user statistics | Yes |
| GET | `/users/earnings` | Get earnings summary | Yes |
| GET | `/users/transactions` | Get transaction history | Yes |
| PATCH | `/users/profile` | Update profile | Yes |

### Example Request

```bash
# Get campaigns
curl -X GET https://visual-data-api.onrender.com/v1/campaigns

# Response
{
  "success": true,
  "data": {
    "campaigns": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

**Full API Documentation**: See [API.md](./docs/API.md)

## 🗄️ Database Schema

```prisma
model User {
  id              String
  email           String @unique
  passwordHash    String
  fullName        String
  role            Role @default(USER)
  uploads         Upload[]
  transactions    Transaction[]
  // ... more fields
}

model Campaign {
  id              String
  title           String
  description     String
  targetQuantity  Int
  basePayout      Decimal
  status          CampaignStatus
  uploads         Upload[]
  // ... more fields
}

model Upload {
  id              String
  userId          String
  campaignId      String
  status          UploadStatus
  filePath        String
  payoutAmount    Decimal?
  user            User
  campaign        Campaign
  // ... more fields
}
```

**Full Schema**: See [prisma/schema.prisma](./prisma/schema.prisma)

## 🚢 Deployment

### Deploy to Render (Free)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `visual-data-db`
   - Plan: Free
   - Copy Internal Database URL

4. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Name: `visual-data-api`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm run prisma:migrate && npm start`
   - Add environment variables from `.env`

5. **Seed Database** (Optional)
```bash
curl -X POST https://your-app.onrender.com/seed
```

**Detailed Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Check code style
npm run lint

# Build for production
npm run build
```

## 📁 Project Structure

```
visual-data-platform-api/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper functions
│   └── index.ts         # App entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── dist/                # Compiled JavaScript
├── .env.example         # Environment template
└── package.json
```

## 👨‍💻 Team

- **Project Lead**: [@datapixora](https://github.com/datapixora)
- **Contributors**: See [Contributors](https://github.com/datapixora/DataSet/graphs/contributors)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live API**: https://visual-data-api.onrender.com
- **GitHub**: https://github.com/datapixora/DataSet
- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/datapixora/DataSet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/datapixora/DataSet/discussions)

## 📞 Support

- **Email**: support@visualdata.com
- **Discord**: [Join our community](#)
- **Twitter**: [@visualdataplatform](#)

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Hosted on [Render](https://render.com/)
- Storage by [Cloudflare R2](https://www.cloudflare.com/products/r2/)

---

**Made with ❤️ by the Visual Data Platform Team**
