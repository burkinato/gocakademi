import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../types/index.js';
import { tokenValidationService, validateRefreshToken } from '../services/TokenValidationService.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone: phone || '',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      role: role || 'student',
    });

    logger.info(`New user registered: ${email}`);
    
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
      },
      message: 'Kullanıcı başarıyla kaydedildi',
    });
  } catch (error) {
    logger.error(`Registration failed for ${req.body.email}:`, error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Kayıt işlemi başarısız oldu',
      });
    }
  }
};

export const login = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    logger.info(`User logged in: ${email}`);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Giriş başarılı',
    });
  } catch (error) {
    logger.error(`Login failed for ${req.body.email}:`, error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Giriş işlemi başarısız oldu',
      });
    }
  }
};

export const adminLogin = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password } = req.body;

    const result = await authService.adminLogin(email, password);

    logger.info(`Admin logged in: ${email}`);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Admin girişi başarılı',
    });
  } catch (error) {
    logger.error(`Admin login failed for ${req.body.email}:`, error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Admin girişi başarısız oldu',
      });
    }
  }
};

export const refreshToken = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    logger.info('Token refreshed successfully');
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Token başarıyla yenilendi',
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token yenileme başarısız oldu',
      });
    }
  }
};

export const logout = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Access token required', 401, 'AUTH_TOKEN_MISSING');
    }

    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.userId) {
      throw new AppError('Invalid token', 400, 'AUTH_TOKEN_INVALID');
    }

    await authService.logout(token, decoded.userId);

    logger.info(`User logged out: ${decoded.email || decoded.userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Çıkış işlemi başarısız oldu',
      });
    }
  }
};

export const forgotPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    logger.info(`Password reset requested for: ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
    });
  } catch (error) {
    logger.error(`Password reset request failed for ${email}:`, error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Şifre sıfırlama isteği başarısız oldu',
      });
    }
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    logger.info('Password reset successfully');
    
    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı',
    });
  } catch (error) {
    logger.error('Password reset failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Şifre sıfırlama başarısız oldu',
      });
    }
  }
};

export const changePassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Kullanıcı kimliği bulunamadı', 401, 'AUTH_USER_NOT_FOUND');
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    logger.info(`Password changed for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi',
    });
  } catch (error) {
    logger.error('Password change failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Şifre değiştirme başarısız oldu',
      });
    }
  }
};

export const getProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Kullanıcı kimliği bulunamadı', 401, 'AUTH_USER_NOT_FOUND');
    }

    const user = await authService.getProfile(userId);

    logger.info(`Profile viewed for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profil bilgileri getirildi',
    });
  } catch (error) {
    logger.error('Get profile failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Profil bilgileri getirilemedi',
      });
    }
  }
};

export const updateProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.id;
    const { firstName, lastName, phone } = req.body;

    if (!userId) {
      throw new AppError('Kullanıcı kimliği bulunamadı', 401, 'AUTH_USER_NOT_FOUND');
    }

    const user = await authService.updateProfile(userId, {
      firstName,
      lastName,
      phone: phone || ''
    });

    logger.info(`Profile updated for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profil bilgileri güncellendi',
    });
  } catch (error) {
    logger.error('Update profile failed:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Profil bilgileri güncellenemedi',
      });
    }
  }
};