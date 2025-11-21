/**
 * Eğitim İçerik Yönetim Sistemi - Type Definitions
 */

// Content Types
export type ContentType = 'video' | 'pdf' | 'document' | 'link' | 'quiz' | 'assignment';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';
export type AccessLevel = 'free' | 'premium' | 'restricted';

// Unit (Ünite)
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

export interface CreateUnitDto {
    courseId: number;
    title: string;
    description?: string;
    orderIndex?: number;
    isRequired?: boolean;
    accessLevel?: AccessLevel;
    estimatedDuration?: number;
}

export interface UpdateUnitDto {
    title?: string;
    description?: string;
    orderIndex?: number;
    isRequired?: boolean;
    accessLevel?: AccessLevel;
    estimatedDuration?: number;
}

// Topic (Konu)
export interface Topic {
    id: number;
    unitId: number;
    title: string;
    description?: string;
    contentType: ContentType;
    contentUrl?: string; // Video URL, PDF URL, etc.
    externalLink?: string;
    content?: string; // Text content
    orderIndex: number;
    isRequired: boolean;
    accessLevel: AccessLevel;
    duration?: number; // minutes
    fileSize?: number; // bytes
    mimeType?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTopicDto {
    unitId: number;
    title: string;
    description?: string;
    contentType: ContentType;
    contentUrl?: string;
    externalLink?: string;
    content?: string;
    orderIndex?: number;
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
    orderIndex?: number;
    isRequired?: boolean;
    accessLevel?: AccessLevel;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
}

// Assessment (Değerlendirme/Sınav)
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
}

export interface CreateAssessmentDto {
    unitId: number;
    title: string;
    description?: string;
    orderIndex?: number;
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
    orderIndex?: number;
    isRequired?: boolean;
    passingScore?: number;
    timeLimit?: number;
    maxAttempts?: number;
    showCorrectAnswers?: boolean;
    shuffleQuestions?: boolean;
    accessLevel?: AccessLevel;
}

// Question (Soru)
export interface Question {
    id: number;
    assessmentId: number;
    questionType: QuestionType;
    questionText: string;
    points: number;
    orderIndex: number;
    options?: QuestionOption[]; // For multiple choice, matching, etc.
    correctAnswer?: string | string[]; // Depends on question type
    explanation?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
    imageUrl?: string;
}

export interface CreateQuestionDto {
    assessmentId: number;
    questionType: QuestionType;
    questionText: string;
    points?: number;
    orderIndex?: number;
    options?: Omit<QuestionOption, 'id'>[];
    correctAnswer?: string | string[];
    explanation?: string;
    imageUrl?: string;
}

export interface UpdateQuestionDto {
    questionType?: QuestionType;
    questionText?: string;
    points?: number;
    orderIndex?: number;
    options?: QuestionOption[];
    correctAnswer?: string | string[];
    explanation?: string;
    imageUrl?: string;
}

// Student Progress
export interface StudentProgress {
    id: number;
    userId: number;
    courseId: number;
    unitId?: number;
    topicId?: number;
    assessmentId?: number;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    completedAt?: Date;
    lastAccessedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Assessment Result
export interface AssessmentResult {
    id: number;
    userId: number;
    assessmentId: number;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    attemptNumber: number;
    answers: StudentAnswer[];
    startedAt: Date;
    submittedAt: Date;
    createdAt: Date;
}

export interface StudentAnswer {
    questionId: number;
    answer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
}

// File Upload
export interface FileUpload {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: number;
    uploadedAt: Date;
}

// Reorder Request
export interface ReorderRequest {
    items: Array<{
        id: number;
        orderIndex: number;
    }>;
}

// Course with full structure
export interface CourseWithStructure {
    id: number;
    title: string;
    description?: string;
    units: UnitWithContent[];
}

export interface UnitWithContent {
    id: number;
    title: string;
    description?: string;
    orderIndex: number;
    isRequired: boolean;
    accessLevel: AccessLevel;
    topics: Topic[];
    assessments: Assessment[];
}
