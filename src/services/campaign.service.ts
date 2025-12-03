import { PrismaClient, Campaign, CampaignStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface CreateCampaignData {
  title: string;
  description?: string;
  instructions?: string;
  tags: string[];
  optionalTags?: string[];
  requiredMetadata?: any;
  allowedCountries?: string[];
  basePayout: number;
  bonusPayout?: number;
  maxUploadsPerUser?: number;
  totalBudget?: number;
  targetQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
}

interface CampaignFilters {
  status?: CampaignStatus;
  countryCode?: string;
  search?: string;
}

export class CampaignService {
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        tags: data.tags,
        optionalTags: data.optionalTags,
        requiredMetadata: data.requiredMetadata,
        allowedCountries: data.allowedCountries,
        basePayout: data.basePayout,
        bonusPayout: data.bonusPayout,
        maxUploadsPerUser: data.maxUploadsPerUser,
        totalBudget: data.totalBudget,
        targetQuantity: data.targetQuantity,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: CampaignStatus.DRAFT,
      },
    });

    return campaign;
  }

  async getCampaigns(
    filters: CampaignFilters,
    page: number = 1,
    limit: number = 20,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: [],
    };

    if (filters.status) {
      where.status = filters.status;
    } else {
      // Default to active campaigns for public view
      where.status = CampaignStatus.ACTIVE;
    }

    // Filter by country if specified
    if (filters.countryCode) {
      where.AND.push({
        OR: [
          { allowedCountries: { equals: null } }, // Global campaigns
          { allowedCountries: { array_contains: filters.countryCode } },
        ],
      });
    }

    // Search by title
    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // Check if campaign is still valid (not ended)
    where.AND.push({
      OR: [
        { endsAt: null },
        { endsAt: { gte: new Date() } },
      ],
    });

    // If AND array is empty, remove it
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.campaign.count({ where }),
    ]);

    // If userId provided, get user's upload count for each campaign
    let campaignsWithUserData = campaigns;

    if (userId) {
      const userUploadCounts = await Promise.all(
        campaigns.map((campaign) =>
          prisma.upload.count({
            where: {
              campaignId: campaign.id,
              userId,
            },
          })
        )
      );

      campaignsWithUserData = campaigns.map((campaign, index) => ({
        ...campaign,
        userUploadCount: userUploadCounts[index],
      }));
    }

    return {
      campaigns: campaignsWithUserData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCampaignById(campaignId: string, userId?: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    // Get user's upload count if userId provided
    let userUploadCount = 0;
    if (userId) {
      userUploadCount = await prisma.upload.count({
        where: {
          campaignId,
          userId,
        },
      });
    }

    return {
      ...campaign,
      userUploadCount,
    };
  }

  async updateCampaign(campaignId: string, data: Partial<CreateCampaignData>) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        tags: data.tags,
        optionalTags: data.optionalTags,
        basePayout: data.basePayout,
        bonusPayout: data.bonusPayout,
        maxUploadsPerUser: data.maxUploadsPerUser,
        targetQuantity: data.targetQuantity,
        endsAt: data.endsAt,
      },
    });

    return updated;
  }

  async updateCampaignStatus(campaignId: string, status: CampaignStatus) {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    });

    return campaign;
  }

  async deleteCampaign(campaignId: string) {
    await prisma.campaign.delete({
      where: { id: campaignId },
    });
  }

  async getRecommendedCampaigns(userId: string, limit: number = 10) {
    // Get user's country and previous uploads
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { countryCode: true },
    });

    // Get active campaigns
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: new Date() } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { basePayout: 'desc' },
        { priority: 'desc' },
      ],
    });

    return campaigns;
  }
}

export default new CampaignService();
