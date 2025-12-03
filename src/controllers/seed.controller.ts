import { Request, Response } from 'express';
import { PrismaClient, CampaignStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class SeedController {
  async seed(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🌱 Starting database seed...');

      // Create admin user
      const adminPassword = await bcrypt.hash('Admin@123', 12);
      const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          email: 'admin@example.com',
          passwordHash: adminPassword,
          fullName: 'Admin User',
          countryCode: 'US',
          isVerified: true,
          qualityScore: 1.0,
        },
      });
      console.log('✅ Admin user created:', admin.email);

      // Create test user
      const testPassword = await bcrypt.hash('Test@123', 12);
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          passwordHash: testPassword,
          fullName: 'Test User',
          countryCode: 'US',
          currentBalance: 10.5,
          totalEarned: 25.0,
          approvedUploads: 15,
          totalUploads: 18,
          qualityScore: 0.85,
        },
      });
      console.log('✅ Test user created:', testUser.email);

      // Create sample tags
      const tags = [
        { name: 'car', category: 'vehicle' },
        { name: 'front_view', category: 'angle' },
        { name: 'sedan', category: 'vehicle_type' },
        { name: 'suv', category: 'vehicle_type' },
        { name: 'red', category: 'color' },
        { name: 'urban', category: 'location' },
        { name: 'parking_lot', category: 'location' },
        { name: 'license_plate', category: 'feature' },
        { name: 'brand', category: 'feature' },
      ];

      for (const tag of tags) {
        await prisma.tag.upsert({
          where: { name: tag.name },
          update: {},
          create: tag,
        });
      }
      console.log(`✅ Created ${tags.length} tags`);

      // Create sample campaigns
      const campaign1 = await prisma.campaign.upsert({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        update: {},
        create: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Front View Cars - Urban Areas',
          description: 'We need front-facing photos of cars parked in urban environments',
          instructions:
            'Take clear photos of cars from the front. Ensure the license plate is visible (optional bonus). Photos must be taken in urban areas like city streets or parking lots.',
          tags: ['car', 'front_view', 'urban'],
          optionalTags: ['license_plate', 'brand'],
          basePayout: 0.5,
          bonusPayout: 0.25,
          maxUploadsPerUser: 100,
          targetQuantity: 10000,
          status: CampaignStatus.ACTIVE,
          priority: 10,
          endsAt: new Date('2026-12-31'),
          requiredMetadata: {
            gps: true,
            min_resolution: '1920x1080',
          },
        },
      });
      console.log('✅ Campaign created:', campaign1.title);

      const campaign2 = await prisma.campaign.upsert({
        where: { id: '550e8400-e29b-41d4-a716-446655440001' },
        update: {},
        create: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Red Sedans - All Angles',
          description: 'Looking for photos of red sedans from any angle',
          instructions:
            'Capture red sedans from various angles. All angles accepted: front, side, back, or three-quarter view.',
          tags: ['car', 'sedan', 'red'],
          optionalTags: ['brand'],
          basePayout: 0.4,
          bonusPayout: 0.15,
          maxUploadsPerUser: 50,
          targetQuantity: 5000,
          status: CampaignStatus.ACTIVE,
          priority: 8,
          endsAt: new Date('2026-06-30'),
        },
      });
      console.log('✅ Campaign created:', campaign2.title);

      const campaign3 = await prisma.campaign.upsert({
        where: { id: '550e8400-e29b-41d4-a716-446655440002' },
        update: {},
        create: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'SUVs and Trucks - Parking Lots',
          description: 'Photos of SUVs and trucks in parking lot settings',
          instructions:
            'Capture clear photos of SUVs and trucks parked in parking lots. Multiple vehicles in frame is acceptable.',
          tags: ['suv', 'parking_lot'],
          basePayout: 0.35,
          maxUploadsPerUser: 75,
          targetQuantity: 3000,
          status: CampaignStatus.ACTIVE,
          priority: 5,
          endsAt: new Date('2026-03-31'),
        },
      });
      console.log('✅ Campaign created:', campaign3.title);

      res.status(200).json({
        success: true,
        message: 'Database seeded successfully!',
        data: {
          users: 2,
          campaigns: 3,
          tags: tags.length,
          testCredentials: {
            admin: {
              email: 'admin@example.com',
              password: 'Admin@123',
            },
            user: {
              email: 'test@example.com',
              password: 'Test@123',
            },
          },
        },
      });
    } catch (error) {
      console.error('❌ Seed failed:', error);
      res.status(500).json({
        success: false,
        message: 'Seed failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new SeedController();
