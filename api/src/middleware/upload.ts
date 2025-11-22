import multer from 'multer';
import path from 'path';
import { AVATAR_UPLOAD_DIR } from '../utils/filePaths.js';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: user-{userId}-{timestamp}.{ext}
        const userId = (req as any).user?.id || 'temp';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `user-${userId}-${timestamp}${ext}`);
    }
});

// File filter - only accept images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};

// Configure multer
export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});
