import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsersController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          totalUploads: true,
          approvedUploads: true,
          rejectedUploads: true,
          totalEarned: true,
          currentBalance: true,
          qualityScore: true,
          isVerified: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get pending uploads count
      const pendingUploads = await prisma.upload.count({
        where: {
          userId: req.user.id,
          status: 'PENDING',
        },
      });

      res.status(200).json({
        success: true,
        data: {
          ...user,
          pendingUploads,
          approvalRate:
            user.totalUploads > 0
              ? (user.approvedUploads / user.totalUploads) * 100
              : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId: req.user.id },
          include: {
            upload: {
              select: {
                id: true,
                campaign: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          skip,
          take: parseInt(limit as string, 10),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.transaction.count({
          where: { userId: req.user.id },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string, 10)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getEarningsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          totalEarned: true,
          currentBalance: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get pending earnings (approved but not paid)
      const pendingEarnings = await prisma.upload.aggregate({
        where: {
          userId: req.user.id,
          status: 'APPROVED',
          payoutStatus: 'PENDING',
        },
        _sum: {
          payoutAmount: true,
        },
      });

      // Get total withdrawn
      const withdrawals = await prisma.transaction.aggregate({
        where: {
          userId: req.user.id,
          type: 'WITHDRAWAL',
        },
        _sum: {
          amount: true,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          totalEarned: user.totalEarned,
          currentBalance: user.currentBalance,
          pendingEarnings: pendingEarnings._sum.payoutAmount || 0,
          totalWithdrawn: Math.abs(withdrawals._sum.amount?.toNumber() || 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { fullName, countryCode, language, phone } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          fullName,
          countryCode,
          language,
          phone,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          countryCode: true,
          language: true,
          phone: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async setPayoutMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { method, details } = req.body;

      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          payoutMethod: method,
          payoutDetails: details, // Should be encrypted in production
        },
      });

      res.status(200).json({
        success: true,
        message: 'Payout method updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
