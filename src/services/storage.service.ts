import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Configure S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: config.storage.r2Endpoint,
      credentials: {
        accessKeyId: config.storage.r2AccessKeyId,
        secretAccessKey: config.storage.r2SecretAccessKey,
      },
    });

    this.bucketName = config.storage.r2BucketName;
  }

  /**
   * Generate a presigned URL for direct upload from mobile client
   */
  async generatePresignedUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<{ uploadId: string; uploadUrl: string; filePath: string }> {
    const uploadId = uuidv4();
    const fileExtension = filename.split('.').pop();
    const filePath = `raw-uploads/${userId}/${uploadId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return {
      uploadId,
      uploadUrl,
      filePath,
    };
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    return `${config.storage.r2PublicUrl}/${filePath}`;
  }

  /**
   * Generate thumbnail path
   */
  getThumbnailPath(filePath: string): string {
    const pathParts = filePath.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    return `${basePath}_thumb.${extension}`;
  }
}

export default new StorageService();
