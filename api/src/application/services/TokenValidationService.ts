import jwt from 'jsonwebtoken';
import { env } from '../../core/config/env';
import { pool } from '../../infrastructure/database/connection.js';
import crypto from 'crypto';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  sessionId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: number;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
  errorCode?: 'EXPIRED' | 'INVALID' | 'REVOKED' | 'BLACKLISTED' | 'MALFORMED';
}

export interface TokenBlacklistEntry {
  token: string;
  userId: number;
  reason: string;
  blacklistedAt: Date;
  expiresAt: Date;
}

export class TokenValidationService {
  private static instance: TokenValidationService;
  private tokenBlacklist: Map<string, TokenBlacklistEntry> = new Map();
  private activeSessions: Map<string, { userId: number; createdAt: Date; expiresAt: Date }> = new Map();

  private constructor() {
    // Start cleanup interval for expired tokens
    this.startCleanupInterval();
  }

  public static getInstance(): TokenValidationService {
    if (!TokenValidationService.instance) {
      TokenValidationService.instance = new TokenValidationService();
    }
    return TokenValidationService.instance;
  }

  /**
   * Generate access token with enhanced security
   */
  public generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + (12 * 60 * 60),
    };

    return jwt.sign(tokenPayload, env.JWT_SECRET, {
      algorithm: 'HS256',
      issuer: 'gokakademi',
      audience: 'gokakademi-users',
      jwtid: crypto.randomUUID(),
    });
  }

  /**
   * Generate refresh token
   */
  public generateRefreshToken(userId: number, sessionId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: RefreshTokenPayload = {
      userId,
      sessionId,
      iat: now,
      exp: now + (7 * 24 * 60 * 60), // 7 days
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      issuer: 'gokakademi',
      audience: 'gokakademi-users',
      jwtid: crypto.randomUUID(),
    });
  }

  /**
   * Validate access token with comprehensive checks
   */
  public async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        return {
          valid: false,
          error: 'Token has been revoked',
          errorCode: 'BLACKLISTED',
        };
      }

      // Verify token signature and decode
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'gokakademi',
        audience: 'gokakademi-users',
      }) as TokenPayload;

      // Check if token is expired (additional check)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return {
          valid: false,
          error: 'Token has expired',
          errorCode: 'EXPIRED',
        };
      }

      // Validate session
      const sessionValid = await this.validateSession(decoded.sessionId, decoded.userId);
      if (!sessionValid) {
        return {
          valid: false,
          error: 'Session is invalid or expired',
          errorCode: 'REVOKED',
        };
      }

      // Check if user is still active in database
      const userActive = await this.isUserActive(decoded.userId);
      if (!userActive) {
        return {
          valid: false,
          error: 'User account is deactivated',
          errorCode: 'REVOKED',
        };
      }

      // Validate token structure
      if (!this.isValidTokenStructure(decoded)) {
        return {
          valid: false,
          error: 'Invalid token structure',
          errorCode: 'MALFORMED',
        };
      }

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: 'Token has expired',
          errorCode: 'EXPIRED',
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          error: 'Invalid token',
          errorCode: 'INVALID',
        };
      }

      if (error instanceof jwt.NotBeforeError) {
        return {
          valid: false,
          error: 'Token not active yet',
          errorCode: 'INVALID',
        };
      }

      return {
        valid: false,
        error: 'Token validation failed',
        errorCode: 'INVALID',
      };
    }
  }

  /**
   * Validate refresh token
   */
  public async validateRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: 'gokakademi',
        audience: 'gokakademi-users',
      }) as RefreshTokenPayload;

      // Validate session
      const sessionValid = await this.validateSession(decoded.sessionId, decoded.userId);
      if (!sessionValid) {
        return {
          valid: false,
          error: 'Session is invalid or expired',
          errorCode: 'REVOKED',
        };
      }

      return {
        valid: true,
        payload: decoded as any,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: 'Refresh token has expired',
          errorCode: 'EXPIRED',
        };
      }

      return {
        valid: false,
        error: 'Invalid refresh token',
        errorCode: 'INVALID',
      };
    }
  }

  /**
   * Blacklist a token (logout functionality)
   */
  public async blacklistToken(token: string, userId: number, reason: string = 'User logout'): Promise<void> {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const entry: TokenBlacklistEntry = {
        token: this.getTokenFingerprint(token),
        userId,
        reason,
        blacklistedAt: new Date(),
        expiresAt: new Date(decoded.exp * 1000),
      };

      this.tokenBlacklist.set(entry.token, entry);

      // Also blacklist in database for persistence
      await this.blacklistTokenInDatabase(token, userId, reason);
    } catch (error) {
      console.error('Failed to blacklist token:', error);
      throw error;
    }
  }

  /**
   * Create a new session
   */
  public async createSession(userId: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    this.activeSessions.set(sessionId, {
      userId,
      createdAt: now,
      expiresAt,
    });

    // Store in database
    await this.createSessionInDatabase(sessionId, userId, expiresAt);

    return sessionId;
  }

  /**
   * Revoke a session
   */
  public async revokeSession(sessionId: string, userId: number): Promise<void> {
    this.activeSessions.delete(sessionId);
    await this.revokeSessionInDatabase(sessionId, userId);
  }

  /**
   * Revoke all sessions for a user
   */
  public async revokeAllUserSessions(userId: number): Promise<void> {
    // Remove from memory
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }

    // Revoke in database
    await this.revokeAllUserSessionsInDatabase(userId);
  }

  /**
   * Get active sessions for a user
   */
  public getUserSessions(userId: number): Array<{ sessionId: string; createdAt: Date; expiresAt: Date }> {
    const sessions: Array<{ sessionId: string; createdAt: Date; expiresAt: Date }> = [];
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        sessions.push({
          sessionId,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        });
      }
    }

    return sessions;
  }

  // Private helper methods

  private isTokenBlacklisted(token: string): boolean {
    const fingerprint = this.getTokenFingerprint(token);
    const entry = this.tokenBlacklist.get(fingerprint);
    
    if (!entry) {
      return false;
    }

    // Check if blacklist entry has expired
    if (entry.expiresAt < new Date()) {
      this.tokenBlacklist.delete(fingerprint);
      return false;
    }

    return true;
  }

  private getTokenFingerprint(token: string): string {
    // Create a hash of the token for efficient storage
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async validateSession(sessionId: string, userId: number): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      // Check database
      return await this.validateSessionInDatabase(sessionId, userId);
    }

    if (session.userId !== userId) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      this.activeSessions.delete(sessionId);
      return false;
    }

    return true;
  }

  private async isUserActive(userId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'SELECT is_active FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].is_active;
    } catch (error) {
      console.error('Failed to check user active status:', error);
      return false;
    }
  }

  private isValidTokenStructure(payload: TokenPayload): boolean {
    return (
      typeof payload.userId === 'number' &&
      typeof payload.email === 'string' &&
      ['student', 'instructor', 'admin'].includes(payload.role) &&
      Array.isArray(payload.permissions) &&
      typeof payload.sessionId === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    );
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every hour
    setInterval(() => {
      const now = new Date();

      // Clean up expired blacklist entries
      for (const [token, entry] of this.tokenBlacklist.entries()) {
        if (entry.expiresAt < now) {
          this.tokenBlacklist.delete(token);
        }
      }

      // Clean up expired sessions
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (session.expiresAt < now) {
          this.activeSessions.delete(sessionId);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  // Database operations

  private async blacklistTokenInDatabase(token: string, userId: number, reason: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      const expiresAt = new Date(decoded.exp * 1000);
      const fingerprint = this.getTokenFingerprint(token);

      await pool.query(
        `INSERT INTO token_blacklist (token_hash, user_id, reason, blacklisted_at, expires_at) 
         VALUES ($1, $2, $3, NOW(), $4)
         ON CONFLICT (token_hash) DO NOTHING`,
        [fingerprint, userId, reason, expiresAt]
      );
    } catch (error) {
      console.error('Failed to blacklist token in database:', error);
      // Don't throw error - memory blacklist is sufficient
    }
  }

  private async createSessionInDatabase(sessionId: string, userId: number, expiresAt: Date): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO user_sessions (session_id, user_id, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW())`,
        [sessionId, userId, expiresAt]
      );
    } catch (error) {
      console.error('Failed to create session in database:', error);
    }
  }

  private async validateSessionInDatabase(sessionId: string, userId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT expires_at FROM user_sessions 
         WHERE session_id = $1 AND user_id = $2 AND expires_at > NOW()`,
        [sessionId, userId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Failed to validate session in database:', error);
      return false;
    }
  }

  private async revokeSessionInDatabase(sessionId: string, userId: number): Promise<void> {
    try {
      await pool.query(
        `UPDATE user_sessions 
         SET revoked_at = NOW() 
         WHERE session_id = $1 AND user_id = $2`,
        [sessionId, userId]
      );
    } catch (error) {
      console.error('Failed to revoke session in database:', error);
    }
  }

  private async revokeAllUserSessionsInDatabase(userId: number): Promise<void> {
    try {
      await pool.query(
        `UPDATE user_sessions 
         SET revoked_at = NOW() 
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );
    } catch (error) {
      console.error('Failed to revoke all user sessions in database:', error);
    }
  }
}

// Export singleton instance
export const tokenValidationService = TokenValidationService.getInstance();

// Export convenience functions
export const {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
  blacklistToken,
  createSession,
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
} = tokenValidationService;