import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository';
import { ActivityLogService } from './ActivityLogService';
import { env } from '../../core/config/env';
import { User, Permission } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'student' | 'instructor' | 'admin';
  isActive?: boolean;
  bio?: string;
  profileImageUrl?: string;
}

export interface LoginData {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'instructor' | 'admin';
    isActive: boolean;
    permissions: Permission[];
  };
  token: string;
  refreshToken: string;
}

export class EnhancedUserService {
  private userRepository: UserRepository;
  private permissionRepository: PermissionRepository;
  private activityLogService: ActivityLogService;

  constructor() {
    this.userRepository = new UserRepository();
    this.permissionRepository = new PermissionRepository();
    this.activityLogService = new ActivityLogService();
  }

  async createUser(userData: CreateUserData, createdBy?: number): Promise<LoginData> {
    try {
      // Validate email format
      if (!this.isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Validate password strength
      if (!this.isValidPassword(userData.password)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: userData.isActive ?? true,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
      });

      // Get default permissions for role
      const defaultPermissions = await this.permissionRepository.getDefaultPermissionsForRole(user.role);
      
      // Assign default permissions
      for (const permission of defaultPermissions) {
        await this.permissionRepository.assignPermissionToUser(user.id, permission.id);
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log activity
      await this.activityLogService.logActivity({
        userId: createdBy || user.id,
        action: 'user.create',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          permissions: defaultPermissions,
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async authenticateUser(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<LoginData> {
    try {
      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Log failed login attempt
        await this.activityLogService.logActivity({
          action: 'login.failed',
          resourceType: 'user',
          details: { email, reason: 'user_not_found', ipAddress, userAgent },
        });
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        await this.activityLogService.logActivity({
          userId: user.id,
          action: 'login.failed',
          resourceType: 'user',
          resourceId: user.id,
          details: { email, reason: 'account_inactive', ipAddress, userAgent },
        });
        throw new Error('Account is deactivated');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.activityLogService.logActivity({
          userId: user.id,
          action: 'login.failed',
          resourceType: 'user',
          resourceId: user.id,
          details: { email, reason: 'invalid_password', ipAddress, userAgent },
        });
        throw new Error('Invalid credentials');
      }

      // Get user permissions
      const permissions = await this.permissionRepository.getUserPermissions(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      await this.userRepository.update(user.id, { lastLoginAt: new Date() });

      // Log successful login
      await this.activityLogService.logActivity({
        userId: user.id,
        action: 'login.success',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          permissions,
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, updates: UpdateUserData, updatedBy?: number): Promise<User> {
    try {
      // Check if email is being changed and if it's already taken
      if (updates.email) {
        const existingUser = await this.userRepository.findByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already in use');
        }
      }

      const updatedUser = await this.userRepository.update(userId, {
        ...updates,
        updatedAt: new Date(),
      });

      // Log activity
      await this.activityLogService.logActivity({
        userId: updatedBy || userId,
        action: 'user.update',
        resourceType: 'user',
        resourceId: userId,
        details: { updates: Object.keys(updates) },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(userId: number, deactivatedBy?: number): Promise<User> {
    try {
      const user = await this.userRepository.update(userId, {
        isActive: false,
        updatedAt: new Date(),
      });

      // Log activity
      await this.activityLogService.logActivity({
        userId: deactivatedBy || userId,
        action: 'user.deactivate',
        resourceType: 'user',
        resourceId: userId,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async activateUser(userId: number, activatedBy?: number): Promise<User> {
    try {
      const user = await this.userRepository.update(userId, {
        isActive: true,
        updatedAt: new Date(),
      });

      // Log activity
      await this.activityLogService.logActivity({
        userId: activatedBy || userId,
        action: 'user.activate',
        resourceType: 'user',
        resourceId: userId,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number, deletedBy?: number): Promise<void> {
    try {
      // Log activity before deletion
      await this.activityLogService.logActivity({
        userId: deletedBy || userId,
        action: 'user.delete',
        resourceType: 'user',
        resourceId: userId,
      });

      await this.userRepository.delete(userId);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(filters?: {
    role?: 'student' | 'instructor' | 'admin';
    isActive?: boolean;
    search?: string;
  }): Promise<User[]> {
    return this.userRepository.findAll(filters);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        throw new Error('New password does not meet requirements');
      }

      // Check if new password is same as current
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.userRepository.update(userId, { password: hashedNewPassword });

      // Log activity
      await this.activityLogService.logActivity({
        userId,
        action: 'user.password.change',
        resourceType: 'user',
        resourceId: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return;
      }

      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

      // Update password
      await this.userRepository.update(user.id, { password: hashedTempPassword });

      // Log activity
      await this.activityLogService.logActivity({
        userId: user.id,
        action: 'user.password.reset',
        resourceType: 'user',
        resourceId: user.id,
      });

      // TODO: Send email with temporary password
      // await this.emailService.sendPasswordResetEmail(user.email, tempPassword);
    } catch (error) {
      throw error;
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '1h',
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}