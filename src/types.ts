
export interface Course {
  id: number;
  title: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  price: number;
  imageUrl: string;
  category: string;
  level: 'Başlangıç' | 'Orta' | 'İleri' | 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  duration?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  key: Page;
}

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string; // HTML string for body
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  date: string;
  readTime: string;
  image: string;
  category: string;
  featured?: boolean;
}

export type UserRole = 'guest' | 'user' | 'admin' | 'student' | 'instructor';

export type ContentType = 'video' | 'pdf' | 'text' | 'quiz';

export interface AttachmentResource {
  id: string;
  name: string;
  url?: string;
  dataUrl?: string;
  type: 'file' | 'link';
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface QuizConfig {
  durationMinutes?: number;
  allowRetry?: boolean;
  questions: QuizQuestion[];
}

export interface CurriculumItem {
  id: string;
  title: string;
  type: ContentType;
  duration?: string;
  isRequired: boolean;
  contentUrl?: string;
  textContent?: string;
  richTextContent?: string;
  videoAsset?: {
    source: 'upload' | 'url';
    name: string;
    size: number;
    mimeType: string;
    previewUrl?: string;
    file?: File | null;
  } | null;
  attachments?: AttachmentResource[];
  quiz?: QuizConfig;
  metadata?: Record<string, any>;
  fileName?: string;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  items: CurriculumItem[];
}

export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'course-detail'
  | 'courses'
  | 'corporate'
  | 'contact'
  | 'blog'
  | 'blog-detail'
  | 'admin-dashboard'
  | 'admin-courses'
  | 'admin-create-course'
  | 'admin-users'
  | 'admin-students'
  | 'admin-activity-logs';

// ============================================================================
// ADMIN PANEL TYPES
// ============================================================================

// User Management
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  street?: string;
  neighborhood?: string;
  district?: string;
  secondaryEmail?: string;
  website?: string;
  linkedin?: string;
  newsletterEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  marketingOptIn?: boolean;
  notes?: string;
  additionalPhones?: string[];
  emergencyContacts?: EmergencyContact[];
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Permissions
export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface UserWithPermissions extends User {
  permissions: Permission[];
}

// Activity Logs
export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: string;
}

// Student Management
export interface StudentProfile {
  id: number;
  userId: number;
  studentNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  enrollmentDate?: string;
  expectedGraduationDate?: string;
  currentLevel?: string;
  gpa?: number;
  bio?: string;
  profileImageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: number;
  uploadedAt: string;
  notes?: string;
}

export interface StudentWithProfile extends User {
  profile?: StudentProfile;
  documents?: StudentDocument[];
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter Params
export interface FilterParams {
  search?: string;
  role?: 'student' | 'instructor' | 'admin';
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// User Statistics
export interface UserStatistics {
  total: number;
  students: number;
  instructors: number;
  admins: number;
  active: number;
  inactive: number;
}
