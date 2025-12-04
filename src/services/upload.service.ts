import { PrismaClient, UploadStatus, PayoutStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import storageService from './storage.service';
import qualityService from './quality.service';

const prisma = new PrismaClient();

interface InitiateUploadData {
  filename: string;
  fileSize: number;
  mimeType: string;
}

interface CompleteUploadData {
  uploadId: string;
  campaignId: string;
  userTags: string[];
  userNotes?: string;
  width?: number;
  height?: number;
  exifData?: any;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp?: string;
  deviceInfo?: any;
}

export class UploadService {
  /**
   * Step 1: Initiate upload - generate presigned URL
   */
  async initiateUpload(userId: string, data: InitiateUploadData) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(data.mimeType)) {
      throw new AppError(400, 'Invalid file type. Only JPEG and PNG are allowed');
    }

    // Generate presigned URL
    const { uploadId, uploadUrl, filePath } = await storageService.generatePresignedUploadUrl(
      userId,
      data.filename,
      data.mimeType
    );

    // Create upload record
    await prisma.upload.create({
      data: {
        id: uploadId,
        userId,
        filePath,
        fileSizeBytes: BigInt(data.fileSize),
        mimeType: data.mimeType,
        originalFilename: data.filename,
        userTags: [],
        status: UploadStatus.PENDING,
      },
    });

    return {
      uploadId,
      uploadUrl,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    };
  }

  /**
   * Step 2: Complete upload - add metadata after file is uploaded
   */
  async completeUpload(userId: string, data: CompleteUploadData) {
    // Find upload record
    const upload = await prisma.upload.findUnique({
      where: { id: data.uploadId },
    });

    if (!upload) {
      throw new AppError(404, 'Upload not found');
    }

    if (upload.userId !== userId) {
      throw new AppError(403, 'Unauthorized');
    }

    // Verify campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'ACTIVE') {
      throw new AppError(400, 'Campaign is not active');
    }

    // Check user hasn't exceeded campaign limit
    if (campaign.maxUploadsPerUser) {
      const userUploadsCount = await prisma.upload.count({
        where: {
          userId,
          campaignId: data.campaignId,
        },
      });

      if (userUploadsCount >= campaign.maxUploadsPerUser) {
        throw new AppError(400, `You have reached the maximum uploads for this campaign`);
      }
    }

    // Build EXIF data
    const exifData: any = data.exifData || {};
    if (data.gpsCoordinates) {
      exifData.gps = data.gpsCoordinates;
    }
    if (data.timestamp) {
      exifData.datetime_original = data.timestamp;
    }
    if (data.deviceInfo) {
      exifData.device = data.deviceInfo;
    }

    // Update upload record
    const updatedUpload = await prisma.upload.update({
      where: { id: data.uploadId },
      data: {
        campaignId: data.campaignId,
        userTags: data.userTags,
        userNotes: data.userNotes,
        width: data.width,
        height: data.height,
        exifData,
        status: UploadStatus.PROCESSING,
      },
    });

    // Update campaign collected count
    await prisma.campaign.update({
      where: { id: data.campaignId },
      data: {
        totalCollected: { increment: 1 },
      },
    });

    // Update user upload count
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalUploads: { increment: 1 },
      },
    });

    // Run quality checks asynchronously (in production, use a job queue)
    this.processUpload(data.uploadId).catch(console.error);

    return {
      upload: updatedUpload,
      message: "Upload received! We'll review it within 24 hours.",
    };
  }

  /**
   * Process upload - quality checks and auto-approval
   */
  private async processUpload(uploadId: string) {
    try {
      // Run quality checks
      const qualityResult = await qualityService.checkQuality(uploadId);

      if (!qualityResult.passed) {
        // Auto-reject
        await this.rejectUpload(uploadId, qualityResult.issues.join('; '), 'system');
        return;
      }

      // Calculate payout
      const payout = await qualityService.calculatePayout(uploadId);

      // Update upload with payout
      await prisma.upload.update({
        where: { id: uploadId },
        data: {
          payoutAmount: payout,
          processedAt: new Date(),
        },
      });

      // Auto-approve if eligible
      if (qualityResult.autoApprove) {
        await this.approveUpload(uploadId, 'system');
      } else {
        // Send to manual review
        await prisma.upload.update({
          where: { id: uploadId },
          data: {
            status: UploadStatus.PENDING,
          },
        });
      }
    } catch (error) {
      console.error('Error processing upload:', error);
    }
  }

  /**
   * Approve an upload
   */
  async approveUpload(uploadId: string, reviewerId: string) {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: { user: true },
    });

    if (!upload) {
      throw new AppError(404, 'Upload not found');
    }

    // Update upload status
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: UploadStatus.APPROVED,
        reviewedById: reviewerId === 'system' ? null : reviewerId,
        reviewedAt: new Date(),
        payoutStatus: PayoutStatus.PENDING,
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: upload.userId },
      data: {
        approvedUploads: { increment: 1 },
        totalEarned: { increment: upload.payoutAmount },
        currentBalance: { increment: upload.payoutAmount },
      },
    });

    // Create transaction record
    const newBalance = upload.user.currentBalance.toNumber() + upload.payoutAmount.toNumber();
    await prisma.transaction.create({
      data: {
        userId: upload.userId,
        uploadId: upload.id,
        type: 'EARNING',
        amount: upload.payoutAmount,
        balanceAfter: newBalance,
        description: `Earning from upload approval`,
      },
    });

    // Update user quality score
    await qualityService.updateUserQualityScore(upload.userId);

    return upload;
  }

  /**
   * Reject an upload
   */
  async rejectUpload(uploadId: string, reason: string, reviewerId: string) {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new AppError(404, 'Upload not found');
    }

    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: UploadStatus.REJECTED,
        rejectionReason: reason,
        reviewedById: reviewerId === 'system' ? null : reviewerId,
        reviewedAt: new Date(),
        payoutStatus: PayoutStatus.REJECTED,
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: upload.userId },
      data: {
        rejectedUploads: { increment: 1 },
      },
    });

    // Update user quality score
    await qualityService.updateUserQualityScore(upload.userId);

    return upload;
  }

  /**
   * Get user's uploads
   */
  async getUserUploads(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where: { userId },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.upload.count({ where: { userId } }),
    ]);

    return {
      uploads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get upload by ID
   */
  async getUploadById(uploadId: string, userId?: string) {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        campaign: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            qualityScore: true,
          },
        },
      },
    });

    if (!upload) {
      throw new AppError(404, 'Upload not found');
    }

    // Only owner can see their own uploads (unless admin)
    if (userId && upload.userId !== userId) {
      throw new AppError(403, 'Unauthorized');
    }

    return upload;
  }

  /**
   * Get pending uploads for review (admin)
   */
  async getAllUploads(page: number = 1, limit: number = 20, status?: string) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
        where.status = status.toUpperCase() as UploadStatus;
      }

      const [uploads, total] = await Promise.all([
        prisma.upload.findMany({
          where,
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                qualityScore: true,
                approvedUploads: true,
                rejectedUploads: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }, // newest first
        }),
        prisma.upload.count({
          where,
        }),
      ]);

      return {
        uploads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in getAllUploads:', error);
      // Return empty result on error
      return {
        uploads: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  async getPendingUploads(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where: {
          status: UploadStatus.PENDING,
        },
        include: {
          campaign: true,
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              qualityScore: true,
              approvedUploads: true,
              rejectedUploads: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // oldest first
      }),
      prisma.upload.count({
        where: { status: UploadStatus.PENDING },
      }),
    ]);

    return {
      uploads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new UploadService();
