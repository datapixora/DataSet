import { Request, Response, NextFunction } from 'express';
import campaignService from '../services/campaign.service';
import { CampaignStatus } from '@prisma/client';

export class CampaignsController {
  async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, countryCode, search, page = '1', limit = '20' } = req.query;

      const result = await campaignService.getCampaigns(
        {
          status: status as CampaignStatus,
          countryCode: countryCode as string,
          search: search as string,
        },
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
        req.user?.id
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCampaignById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await campaignService.getCampaignById(id, req.user?.id);

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { limit = '10' } = req.query;

      const campaigns = await campaignService.getRecommendedCampaigns(
        req.user.id,
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await campaignService.createCampaign(req.body);

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await campaignService.updateCampaign(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCampaignStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const campaign = await campaignService.updateCampaignStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Campaign status updated successfully',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await campaignService.deleteCampaign(id);

      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CampaignsController();
