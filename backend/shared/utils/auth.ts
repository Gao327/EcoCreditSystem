import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JwtPayload, UserRole } from '../types';

export class AuthUtils {
  private static jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
  private static jwtExpirationTime = process.env.JWT_EXPIRATION_TIME || '7d';

  /**
   * Generate JWT token for user
   */
  static generateToken(userId: string, email: string, role: UserRole = 'user'): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId,
      email,
      role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpirationTime,
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random API key
   */
  static generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Check if user has required role
   */
  static hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      moderator: 2,
      admin: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
} 