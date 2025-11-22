// Quiz Types and Interfaces

export type QuestionType =
    | 'multiple-choice'
    | 'multiple-select'
    | 'true-false'
    | 'open-ended'
    | 'fill-blanks';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
}

export interface QuizQuestion {
    id: string;
    type: QuestionType;
    text: string;
    points: number;
    media?: {
        type: 'image' | 'video';
        url: string;
    };
    options?: QuestionOption[];
    correctAnswers?: string[];
    explanation?: string;
    orderIndex: number;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    timeLimit: number | null; // minutes
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    passingScore: number; // percentage
    showCorrectAnswers: boolean;
    allowRetry: boolean;
    maxAttempts: number | null;
    questions: QuizQuestion[];
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    score: number; // percentage
    passed: boolean;
    timeSpent: number; // seconds
    answers: Record<string, any>;
    startedAt: Date;
    submittedAt?: Date;
}

export interface QuizResult {
    attempt: QuizAttempt;
    quiz: Quiz;
    questionResults: {
        questionId: string;
        question: QuizQuestion;
        userAnswer: any;
        isCorrect: boolean;
        pointsEarned: number;
        pointsPossible: number;
    }[];
    totalCorrect: number;
    totalIncorrect: number;
    totalSkipped: number;
    totalPoints: number;
    maxPoints: number;
}
