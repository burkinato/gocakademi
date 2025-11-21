import { UserRepository } from '../repositories/UserRepository.js';
import { CourseRepository } from '../repositories/CourseRepository.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { User } from '../types/index.js';
import { env } from '../config/env.js';
import { tokenValidationService, generateAccessToken, generateRefreshToken, createSession, revokeSession } from './TokenValidationService.js';
import { PermissionRepository } from '../repositories/PermissionRepository.js';

export class AuthService {
  private userRepository: UserRepository;
  private permissionRepository: PermissionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.permissionRepository = new PermissionRepository();
  }

  async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.createBasic({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'student',
        isActive: true,
      });

      // Create session and generate access token
      const sessionId = await tokenValidationService.createSession(user.id);
      const permissions = await this.permissionRepository.findByUser(user.id);
      const token = tokenValidationService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // Check if this is an admin login attempt
      if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
        // Try to find existing admin user
        let adminUser = await this.userRepository.findByEmail(email);

        if (!adminUser) {
          // Create admin user if doesn't exist
        console.log('Creating admin user...');
        const hashedPassword = await hashPassword(password);
        adminUser = await this.userRepository.createBasic({
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
        });
        console.log('Admin user created successfully');
        }

        // Create session and generate tokens for admin
        const sessionId = await tokenValidationService.createSession(adminUser.id);
        const permissions = await this.permissionRepository.findByUser(adminUser.id);
        const token = tokenValidationService.generateAccessToken({
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          sessionId,
          permissions: permissions.map(p => `${p.resource}:${p.action}`),
        });

        return {
          user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
          },
          token,
        };
      }

      // Regular user login
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Create session and generate access token
      const sessionId = await tokenValidationService.createSession(user.id);
      const permissions = await this.permissionRepository.findByUser(user.id);
      const token = tokenValidationService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async adminLogin(email: string, password: string) {
    try {
      // Check if it's the admin account
      if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
        // Check if admin user exists in database
        let adminUser = await this.userRepository.findByEmail(email);

        if (!adminUser) {
          // Create admin user if doesn't exist
          const hashedPassword = await hashPassword(password);
          adminUser = await this.userRepository.createBasic({
            email,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isActive: true,
          });
        }

        // Create session
        const sessionId = await createSession(adminUser.id);

        // Get admin permissions
        const permissions = await this.permissionRepository.findByUser(adminUser.id);

        // Generate tokens
        const accessToken = generateAccessToken({
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          sessionId,
          permissions: permissions.map(p => `${p.resource}:${p.action}`),
        });

        const refreshToken = generateRefreshToken(adminUser.id, sessionId);

        return {
          user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
          },
          token: accessToken,
          refreshToken,
        };
      }

      throw new Error('Invalid admin credentials');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Validate refresh token
      const validationResult = await tokenValidationService.validateRefreshToken(refreshToken);

      if (!validationResult.valid || !validationResult.payload) {
        throw new Error('Invalid refresh token');
      }

      const { userId, sessionId } = validationResult.payload;

      // Get user data
      const user = await this.userRepository.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Get user permissions
      const permissions = await this.permissionRepository.findByUser(user.id);

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
      });

      return {
        token: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string, userId: number) {
    try {
      // Blacklist the access token
      await tokenValidationService.blacklistToken(token, userId, 'User logout');

      // Decode token to get session ID
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.sessionId) {
        // Revoke the session
        await revokeSession(decoded.sessionId, userId);
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async revokeAllUserSessions(userId: number) {
    try {
      await tokenValidationService.revokeAllUserSessions(userId);
      return { success: true };
    } catch (error) {
      console.error('Failed to revoke all user sessions:', error);
      throw error;
    }
  }
}