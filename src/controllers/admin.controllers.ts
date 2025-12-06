import { Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const getEarningsStatsSchema = z.object({
  range: z.enum(['day', 'month', 'year']).default('month'),
});

export const getEarningsStats = async (req: Request, res: Response) => {
  try {
    const query = getEarningsStatsSchema.safeParse(req.query);

    if (!query.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: query.error.errors,
      });
    }

    const { range } = query.data;

    let dateTrunc;
    switch (range) {
      case 'day':
        dateTrunc = 'hour';
        break;
      case 'year':
        dateTrunc = 'month';
        break;
      case 'month':
      default:
        dateTrunc = 'day';
        break;
    }

    const earnings = await prisma.$queryRaw<
      { name: string; earnings: number }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC(${dateTrunc}, "createdAt"), 'YYYY-MM-DD HH24:MI') as name,
        SUM(amount) as earnings
      FROM "transactions"
      WHERE type = ${TransactionType.EARNING}
      GROUP BY name
      ORDER BY name ASC;
    `;

    // The raw query returns Decimal objects, so we need to convert them to numbers
    const formattedEarnings = earnings.map(e => ({
      ...e,
      earnings: Number(e.earnings),
      // Optionally format the 'name' based on the range for better readability
      name: formatLabel(e.name, range as 'day' | 'month' | 'year'),
    }));

    res.status(200).json({
      success: true,
      data: formattedEarnings,
    });
  } catch (error) {
    console.error('Error fetching earnings stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const formatLabel = (name: string, range: 'day' | 'month' | 'year') => {
    const date = new Date(name);
    switch (range) {
        case 'day':
            return date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
        case 'month':
            return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        case 'year':
            return date.toLocaleString('default', { month: 'short' });
        default:
            return name;
    }
}
