import { Request, Response, NextFunction } from 'express';
import uploadService from '../services/upload.service';

export class UploadsController {
  async initiateUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { filename, file_size, mime_type } = req.body;

      const result = await uploadService.initiateUpload(req.user.id, {
        filename,
        fileSize: file_size,
        mimeType: mime_type,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await uploadService.completeUpload(req.user.id, req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { page = '1', limit = '20' } = req.query;

      const result = await uploadService.getUserUploads(
        req.user.id,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const upload = await uploadService.getUploadById(id, req.user?.id);

      res.status(200).json({
        success: true,
        data: upload,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async getAllUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20', status } = req.query;

      const result = await uploadService.getAllUploads(
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
        status as string | undefined
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query;

      const result = await uploadService.getPendingUploads(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      const upload = await uploadService.approveUpload(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Upload approved successfully',
        data: upload,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      const upload = await uploadService.rejectUpload(id, reason, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Upload rejected',
        data: upload,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadsController();
