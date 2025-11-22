import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { pool } from '../../infrastructure/database/connection.js';
import { env } from '../../core/config/env.js';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../../utils/auth.js';
import { ApiResponse } from '../../core/domain/entities/index.js';

export const register = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, 'student', true]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const rawEmail = (req.body?.email || '').toString().trim();
    const email = rawEmail.toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Admin env fallback: allow direct admin login even if DB password differs
    if (email === env.ADMIN_EMAIL.toLowerCase() && password === env.ADMIN_PASSWORD) {
      // Ensure admin exists
      const existingAdmin = await pool.query(
        'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = $1',
        [env.ADMIN_EMAIL.toLowerCase()]
      );

      let adminUser = existingAdmin.rows[0];

      if (!adminUser) {
        // Create admin user if not exists
        const hashed = await hashPassword(password);
        const created = await pool.query(
          `INSERT INTO users (email, password, first_name, last_name, role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, password, first_name, last_name, role, is_active`,
          [env.ADMIN_EMAIL.toLowerCase(), hashed, 'Admin', 'User', 'admin', true]
        );
        adminUser = created.rows[0];
      }

      if (!adminUser.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      const accessToken = generateToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });

      const refreshToken = generateRefreshToken({
        userId: adminUser.id,
        email: adminUser.email
      });

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.first_name,
            lastName: adminUser.last_name,
            role: adminUser.role
          }
        },
        message: 'Login successful',
      });
    }

    // Regular user lookup
    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check if active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
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

    // Find user
    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      },
      message: 'Admin login successful',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
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

    // Verify refresh token
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as any;

    // Generate new access token
    const accessToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
};

export const logout = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};

export const me = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get user from DB
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
      },
      message: 'Profile fetched successfully',
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { firstName, lastName, phone } = req.body;

    const existing = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const current = existing.rows[0];

    const updated = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           phone = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role, is_active`,
      [
        firstName ?? current.first_name,
        lastName ?? current.last_name,
        phone ?? current.phone ?? null,
        userId
      ]
    );

    const user = updated.rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
};

export const changePassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password are required',
      });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const isValid = await comparePassword(currentPassword, result.rows[0].password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      hashedNewPassword,
      userId
    ]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    });
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const tempPassword = randomBytes(6).toString('hex');
    const hashedPassword = await hashPassword(tempPassword);

    await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      hashedPassword,
      result.rows[0].id
    ]);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      // Returning temp password for now; in production send via email instead
      tempPassword,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    });
  }
};
