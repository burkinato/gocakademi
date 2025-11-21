import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../types/index.js';
import { tokenValidationService, validateRefreshToken } from '../services/TokenValidationService.js';
import jwt from 'jsonwebtoken';

const authService = new AuthService();

export const register = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      role: 'student',
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
};

export const adminLogin = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.adminLogin(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Admin login successful',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Admin login failed',
    });
  }
};

export const refreshToken = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
};

export const logout = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Decode token to get user ID
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.userId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Call enhanced logout with token blacklisting
    await authService.logout(token, decoded.userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // TODO: Implement password reset token generation and email sending
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    });
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    // TODO: Implement password reset with token validation
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    });
  }
};

export const changePassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // TODO: Implement password change logic
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password change failed',
    });
  }
};

export const getProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // TODO: Fetch user profile from database
    res.status(200).json({
      success: true,
      data: { userId },
      message: 'Profile fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // TODO: Update user profile in database
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
};