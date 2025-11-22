import { Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { AVATAR_UPLOAD_DIR } from '../../utils/filePaths.js';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Upload avatar image
 * POST /api/upload/avatar
 */
export const uploadAvatarImage = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
            return;
        }

        const inputPath = req.file.path;
        const outputFilename = `optimized-${req.file.filename}`;
        const outputPath = path.join(AVATAR_UPLOAD_DIR, outputFilename);

        // Process image with sharp: resize and optimize
        await sharp(inputPath)
            .resize(400, 400, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 85 })
            .toFile(outputPath);

        // Delete original file
        fs.unlinkSync(inputPath);

        // Return URL path
        const imageUrl = `/uploads/avatars/${outputFilename}`;

        res.status(200).json({
            success: true,
            data: {
                url: imageUrl,
                filename: outputFilename
            },
            message: 'Avatar uploaded successfully'
        });
    } catch (error: any) {
        console.error('Avatar upload error:', error);

        // Clean up file if it exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload avatar'
        });
    }
};

/**
 * Delete avatar image
 * DELETE /api/upload/avatar/:filename
 */
export const deleteAvatarImage = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        const { filename } = req.params;

        if (!filename) {
            res.status(400).json({
                success: false,
                error: 'Filename is required'
            });
            return;
        }

        // Security: prevent directory traversal
        const sanitizedFilename = path.basename(filename);
        const filePath = path.join(AVATAR_UPLOAD_DIR, sanitizedFilename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({
                success: false,
                error: 'File not found'
            });
            return;
        }

        // Delete file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'Avatar deleted successfully'
        });
    } catch (error: any) {
        console.error('Avatar deletion error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete avatar'
        });
    }
};
