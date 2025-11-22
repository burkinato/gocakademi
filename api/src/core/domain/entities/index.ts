export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

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

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string; // e.g., 'users', 'courses', 'students'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  createdAt: Date;
}

export interface RolePermission {
  id: number;
  role: 'student' | 'instructor' | 'admin';
  permissionId: number;
  createdAt: Date;
}

export interface UserPermission {
  id: number;
  userId: number;
  permissionId: number;
  granted: boolean; // true = granted, false = revoked
  createdAt: Date;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string; // e.g., 'user.create', 'course.update', 'login.success'
  resourceType?: string; // e.g., 'user', 'course', 'student'
  resourceId?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>; // JSONB data
  createdAt: Date;
}

export interface LoginAttempt {
  id: number;
  email: string;
  ipAddress: string;
  success: boolean;
  failureReason?: string; // e.g., 'invalid_password', 'user_not_found'
  attemptedAt: Date;
}

export interface RefreshToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  studentNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;

  // Contact information
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Academic information
  enrollmentDate?: Date;
  expectedGraduationDate?: Date;
  currentLevel?: string;
  gpa?: number;

  // Additional information
  bio?: string;
  profileImageUrl?: string;
  notes?: string; // Admin notes

  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: string; // e.g., 'id_card', 'transcript', 'certificate'
  documentName: string;
  fileUrl: string;
  fileSize?: number; // in bytes
  mimeType?: string;
  uploadedBy?: number;
  uploadedAt: Date;
  notes?: string;
}

export interface EnrollmentDetail {
  id: number;
  enrollmentId: number;
  grade?: number;
  attendancePercentage?: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  quizScores?: number[]; // JSONB array
  notes?: string; // Instructor notes
  certificateIssued: boolean;
  certificateUrl?: string;
  updatedAt: Date;
}

export interface InstructorStudent {
  id: number;
  instructorId: number;
  studentId: number;
  courseId: number;
  assignedAt: Date;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: number; // in hours
  imageUrl: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string;
  videoUrl?: string;
  orderIndex: number;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number; // percentage
  completedAt?: Date;
  enrolledAt: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  authorId: number;
  imageUrl?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: number;
  userId: number;
  courseId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

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

export interface FilterParams {
  search?: string;
  role?: 'student' | 'instructor' | 'admin';
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  [key: string]: any; // For additional dynamic filters
}

export interface UserWithPermissions extends User {
  permissions: Permission[];
}

export interface StudentWithProfile extends User {
  profile?: StudentProfile;
  documents?: StudentDocument[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// Education Management Types
// ============================================

export type AccessLevel = 'free' | 'premium' | 'restricted';
export type ContentType = 'video' | 'pdf' | 'document' | 'link' | 'quiz' | 'assignment';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';

export interface Unit {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  isRequired: boolean;
  accessLevel: AccessLevel;
  estimatedDuration?: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: number;
  unitId: number;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl?: string;
  externalLink?: string;
  content?: string;
  orderIndex: number;
  isRequired: boolean;
  accessLevel: AccessLevel;
  duration?: number; // minutes
  fileSize?: number; // bytes
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  assessmentId: number;
  questionType: QuestionType;
  questionText: string;
  points: number;
  orderIndex: number;
  options?: QuestionOption[];
  correctAnswer?: any; // Type varies by question type
  explanation?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  id: number;
  unitId: number;
  title: string;
  description?: string;
  orderIndex: number;
  isRequired: boolean;
  passingScore: number; // percentage
  timeLimit?: number; // minutes
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  shuffleQuestions: boolean;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
}

export interface TopicProgress {
  topicId: number;
  userId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  watchedDuration?: number; // seconds
  completedAt?: Date;
  lastAccessedAt: Date;
}

export interface AssessmentResult {
  id: number;
  userId: number;
  assessmentId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  answers: Record<string, any>;
  startedAt: Date;
  submittedAt: Date;
}

export interface CourseEnrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: Date;
  completedAt?: Date;
  progressPercentage: number;
  lastAccessedAt?: Date;
}

export interface StudentProgress {
  courseId: number;
  userId: number;
  courseProgress: {
    total: number;
    completed: number;
    percentage: number;
    requiredCompleted: boolean;
  };
  unitProgress: Record<number, {
    total: number;
    completed: number;
    percentage: number;
  }>;
  topicProgress: Record<number, TopicProgress>;
  assessmentProgress: Record<number, {
    attempts: number;
    bestScore: number;
    passed: boolean;
  }>;
}

// DTOs for creating/updating

export interface CreateUnitDto {
  courseId: number;
  title: string;
  description?: string;
  isRequired?: boolean;
  accessLevel?: AccessLevel;
  estimatedDuration?: number;
}

export interface UpdateUnitDto {
  title?: string;
  description?: string;
  isRequired?: boolean;
  accessLevel?: AccessLevel;
  estimatedDuration?: number;
}

export interface CreateTopicDto {
  unitId: number;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl?: string;
  externalLink?: string;
  content?: string;
  isRequired?: boolean;
  accessLevel?: AccessLevel;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface UpdateTopicDto {
  title?: string;
  description?: string;
  contentType?: ContentType;
  contentUrl?: string;
  externalLink?: string;
  content?: string;
  isRequired?: boolean;
  accessLevel?: AccessLevel;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface CreateAssessmentDto {
  unitId: number;
  title: string;
  description?: string;
  isRequired?: boolean;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  shuffleQuestions?: boolean;
  accessLevel?: AccessLevel;
}

export interface UpdateAssessmentDto {
  title?: string;
  description?: string;
  isRequired?: boolean;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  shuffleQuestions?: boolean;
  accessLevel?: AccessLevel;
}

export interface CreateQuestionDto {
  assessmentId: number;
  questionType: QuestionType;
  questionText: string;
  points?: number;
  options?: Omit<QuestionOption, 'id'>[];
  correctAnswer?: any;
  explanation?: string;
  imageUrl?: string;
}

export interface UpdateQuestionDto {
  questionType?: QuestionType;
  questionText?: string;
  points?: number;
  options?: Omit<QuestionOption, 'id'>[];
  correctAnswer?: any;
  explanation?: string;
  imageUrl?: string;
}

export interface SubmitAssessmentDto {
  userId: number;
  assessmentId: number;
  answers: Record<string, any>;
  startedAt: Date;
  submittedAt: Date;
}
