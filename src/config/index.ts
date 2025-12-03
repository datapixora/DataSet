import dotenv from 'dotenv';

dotenv.config();

interface Config {
  app: {
    env: string;
    port: number;
    apiBaseUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  database: {
    url: string;
  };
  storage: {
    r2AccountId: string;
    r2AccessKeyId: string;
    r2SecretAccessKey: string;
    r2BucketName: string;
    r2PublicUrl: string;
    r2Endpoint: string;
  };
  cors: {
    origin: string;
  };
  uploads: {
    maxFileSizeMB: number;
    maxUploadsPerDayNewUser: number;
    maxUploadsPerDayVerified: number;
    minImageWidth: number;
    minImageHeight: number;
  };
  payouts: {
    defaultBasePayout: number;
    defaultBonusPayout: number;
  };
}

const config: Config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/visual_data_platform',
  },
  storage: {
    r2AccountId: process.env.R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || 'visual-data-platform',
    r2PublicUrl: process.env.R2_PUBLIC_URL || '',
    r2Endpoint: process.env.R2_ENDPOINT || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  uploads: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
    maxUploadsPerDayNewUser: parseInt(process.env.MAX_UPLOADS_PER_DAY_NEW_USER || '50', 10),
    maxUploadsPerDayVerified: parseInt(process.env.MAX_UPLOADS_PER_DAY_VERIFIED || '200', 10),
    minImageWidth: parseInt(process.env.MIN_IMAGE_WIDTH || '1920', 10),
    minImageHeight: parseInt(process.env.MIN_IMAGE_HEIGHT || '1080', 10),
  },
  payouts: {
    defaultBasePayout: parseFloat(process.env.DEFAULT_BASE_PAYOUT || '0.50'),
    defaultBonusPayout: parseFloat(process.env.DEFAULT_BONUS_PAYOUT || '0.25'),
  },
};

export default config;
