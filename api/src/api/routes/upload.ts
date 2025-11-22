import { Router } from 'express';
import { uploadAvatarImage, deleteAvatarImage } from '../controllers/UploadController.js';
import { uploadAvatar } from '../../middleware/upload.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Upload avatar (requires authentication)
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadAvatarImage);

// Delete avatar (requires authentication)
router.delete('/avatar/:filename', authMiddleware, deleteAvatarImage);

export default router;
