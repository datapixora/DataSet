import { PrismaClient } from '@prisma/client';
import config from '../config';

const prisma = new PrismaClient();

interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  autoApprove: boolean;
}

export class QualityService {
  /**
   * Perform automated quality checks on an upload
   */
  async checkQuality(uploadId: string): Promise<QualityCheckResult> {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        user: true,
        campaign: true,
      },
    });

    if (!upload) {
      return {
        passed: false,
        issues: ['Upload not found'],
        autoApprove: false,
      };
    }

    const issues: string[] = [];

    // 1. Check image dimensions
    if (upload.width && upload.height) {
      if (
        upload.width < config.uploads.minImageWidth ||
        upload.height < config.uploads.minImageHeight
      ) {
        issues.push(
          `Image resolution too low. Minimum: ${config.uploads.minImageWidth}x${config.uploads.minImageHeight}`
        );
      }
    } else {
      issues.push('Image dimensions not available');
    }

    // 2. Check file size
    const maxSizeBytes = config.uploads.maxFileSizeMB * 1024 * 1024;
    if (upload.fileSizeBytes && upload.fileSizeBytes > maxSizeBytes) {
      issues.push(`File size exceeds ${config.uploads.maxFileSizeMB}MB limit`);
    }

    // 3. Check EXIF data presence
    if (!upload.exifData) {
      issues.push('Missing EXIF metadata - image may have been edited');
    }

    // 4. Check GPS data if required by campaign
    if (upload.campaign?.requiredMetadata) {
      const required = upload.campaign.requiredMetadata as any;
      if (required.gps === true) {
        const exifData = upload.exifData as any;
        if (!exifData?.gps) {
          issues.push('GPS location required but not present');
        }
      }
    }

    // 5. Check required tags
    const userTags = upload.userTags as string[];
    const requiredTags = upload.campaign?.tags as string[];

    if (requiredTags && requiredTags.length > 0) {
      const missingTags = requiredTags.filter((tag) => !userTags.includes(tag));
      if (missingTags.length > 0) {
        issues.push(`Missing required tags: ${missingTags.join(', ')}`);
      }
    }

    // 6. Check upload frequency (fraud detection)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uploadsToday = await prisma.upload.count({
      where: {
        userId: upload.userId,
        createdAt: {
          gte: today,
        },
      },
    });

    const maxUploadsPerDay = upload.user.isVerified
      ? config.uploads.maxUploadsPerDayVerified
      : config.uploads.maxUploadsPerDayNewUser;

    if (uploadsToday > maxUploadsPerDay) {
      issues.push(`Daily upload limit exceeded (${maxUploadsPerDay})`);
    }

    // Determine if we can auto-approve
    const passed = issues.length === 0;
    const autoApprove =
      passed &&
      upload.user.qualityScore.toNumber() > 0.85 &&
      upload.user.approvedUploads > 50;

    return {
      passed,
      issues,
      autoApprove,
    };
  }

  /**
   * Calculate payout for an upload
   */
  async calculatePayout(uploadId: string): Promise<number> {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: { campaign: true },
    });

    if (!upload || !upload.campaign) {
      return 0;
    }

    let payout = upload.campaign.basePayout.toNumber();

    // Add bonus for optional tags
    const userTags = upload.userTags as string[];
    const optionalTags = upload.campaign.optionalTags as string[] | null;

    if (optionalTags && optionalTags.length > 0) {
      const hasOptionalTags = optionalTags.some((tag) => userTags.includes(tag));
      if (hasOptionalTags && upload.campaign.bonusPayout) {
        payout += upload.campaign.bonusPayout.toNumber();
      }
    }

    return payout;
  }

  /**
   * Update user quality score based on recent uploads
   */
  async updateUserQualityScore(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    // Get recent uploads (last 100)
    const recentUploads = await prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (recentUploads.length === 0) return;

    // Calculate approval rate
    const approvedCount = recentUploads.filter(
      (u) => u.status === 'APPROVED'
    ).length;
    const approvalRate = approvedCount / recentUploads.length;

    // Calculate average AI quality score
    const uploadsWithAIScore = recentUploads.filter((u) => u.aiQualityScore);
    const avgAIScore =
      uploadsWithAIScore.length > 0
        ? uploadsWithAIScore.reduce(
            (sum, u) => sum + (u.aiQualityScore?.toNumber() || 0),
            0
          ) / uploadsWithAIScore.length
        : 0.5;

    // Combined quality score (weighted)
    const qualityScore = approvalRate * 0.7 + avgAIScore * 0.3;

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        qualityScore: Math.max(0, Math.min(1, qualityScore)),
      },
    });
  }
}

export default new QualityService();
