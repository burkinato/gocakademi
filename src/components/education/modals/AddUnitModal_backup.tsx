export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;

  // Contact information
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Profile information
  dateOfBirth?: Date;
  profileImageUrl?: string;
  bio?: string;

  // Authentication & Security
  lastLoginAt?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;

  createdAt: Date;
  updatedAt: Date;
}

