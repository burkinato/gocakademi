import { Pool } from 'pg';
import { pool } from '../../infrastructure/database/connection';

interface QuizData {
    courseId?: number;
    lessonId?: number;
    title: string;
    description?: string;
    timeLimit?: number | null;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    passingScore?: number;
    showCorrectAnswers?: boolean;
    allowRetry?: boolean;
    maxAttempts?: number | null;
}

interface QuestionData {
    type: string;
    text: string;
    points?: number;
    mediaType?: string;
    mediaUrl?: string;
    explanation?: string;
    orderIndex: number;
    options?: Array<{
        text: string;
        isCorrect: boolean;
        orderIndex: number;
    }>;
}

export class QuizService {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async createQuiz(quizData: QuizData) {
        const client = await this.db.connect();
        try {
            const result = await client.query(
                `INSERT INTO quizzes (
          course_id, lesson_id, title, description, time_limit,
          shuffle_questions, shuffle_options, passing_score,
          show_correct_answers, allow_retry, max_attempts
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
                [
                    quizData.courseId || null,
                    quizData.lessonId || null,
                    quizData.title,
                    quizData.description || null,
                    quizData.timeLimit || null,
                    quizData.shuffleQuestions ?? false,
                    quizData.shuffleOptions ?? false,
                    quizData.passingScore ?? 70,
                    quizData.showCorrectAnswers ?? true,
                    quizData.allowRetry ?? true,
                    quizData.maxAttempts || null,
                ]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getQuizById(quizId: number) {
        const client = await this.db.connect();
        try {
            // Get quiz
            const quizResult = await client.query(
                'SELECT * FROM quizzes WHERE id = $1',
                [quizId]
            );

            if (quizResult.rows.length === 0) {
                return null;
            }

            const quiz = quizResult.rows[0];

            // Get questions
            const questionsResult = await client.query(
                'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index',
                [quizId]
            );

            // Get options for each question
            const questions = await Promise.all(
                questionsResult.rows.map(async (question) => {
                    const optionsResult = await client.query(
                        'SELECT * FROM quiz_question_options WHERE question_id = $1 ORDER BY order_index',
                        [question.id]
                    );
                    return {
                        ...question,
                        options: optionsResult.rows,
                    };
                })
            );

            return {
                ...quiz,
                questions,
            };
        } finally {
            client.release();
        }
    }

    async updateQuiz(quizId: number, quizData: Partial<QuizData>) {
        const client = await this.db.connect();
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(quizData).forEach(([key, value]) => {
                if (value !== undefined) {
                    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
                    fields.push(`${snakeKey} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            values.push(quizId);
            const result = await client.query(
                `UPDATE quizzes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async deleteQuiz(quizId: number) {
        const client = await this.db.connect();
        try {
            await client.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
        } finally {
            client.release();
        }
    }

    async addQuestion(quizId: number, questionData: QuestionData) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // Insert question
            const questionResult = await client.query(
                `INSERT INTO quiz_questions (
          quiz_id, type, text, points, media_type, media_url, explanation, order_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
                [
                    quizId,
                    questionData.type,
                    questionData.text,
                    questionData.points ?? 1,
                    questionData.mediaType || null,
                    questionData.mediaUrl || null,
                    questionData.explanation || null,
                    questionData.orderIndex,
                ]
            );

            const question = questionResult.rows[0];

            // Insert options if provided
            if (questionData.options && questionData.options.length > 0) {
                for (const option of questionData.options) {
                    await client.query(
                        `INSERT INTO quiz_question_options (question_id, text, is_correct, order_index)
            VALUES ($1, $2, $3, $4)`,
                        [question.id, option.text, option.isCorrect, option.orderIndex]
                    );
                }
            }

            await client.query('COMMIT');

            // Return question with options
            return await this.getQuestionById(question.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getQuestionById(questionId: number) {
        const client = await this.db.connect();
        try {
            const questionResult = await client.query(
                'SELECT * FROM quiz_questions WHERE id = $1',
                [questionId]
            );

            if (questionResult.rows.length === 0) {
                return null;
            }

            const question = questionResult.rows[0];

            const optionsResult = await client.query(
                'SELECT * FROM quiz_question_options WHERE question_id = $1 ORDER BY order_index',
                [questionId]
            );

            return {
                ...question,
                options: optionsResult.rows,
            };
        } finally {
            client.release();
        }
    }

    async updateQuestion(quizId: number, questionId: number, questionData: Partial<QuestionData>) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // Update question
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(questionData).forEach(([key, value]) => {
                if (value !== undefined && key !== 'options') {
                    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
                    fields.push(`${snakeKey} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            if (fields.length > 0) {
                values.push(questionId);
                await client.query(
                    `UPDATE quiz_questions SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
                    values
                );
            }

            // Update options if provided
            if (questionData.options) {
                // Delete existing options
                await client.query('DELETE FROM quiz_question_options WHERE question_id = $1', [questionId]);

                // Insert new options
                for (const option of questionData.options) {
                    await client.query(
                        `INSERT INTO quiz_question_options (question_id, text, is_correct, order_index)
            VALUES ($1, $2, $3, $4)`,
                        [questionId, option.text, option.isCorrect, option.orderIndex]
                    );
                }
            }

            await client.query('COMMIT');

            return await this.getQuestionById(questionId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteQuestion(quizId: number, questionId: number) {
        const client = await this.db.connect();
        try {
            await client.query('DELETE FROM quiz_questions WHERE id = $1 AND quiz_id = $2', [
                questionId,
                quizId,
            ]);
        } finally {
            client.release();
        }
    }

    async reorderQuestions(quizId: number, questionIds: number[]) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            for (let i = 0; i < questionIds.length; i++) {
                await client.query(
                    'UPDATE quiz_questions SET order_index = $1 WHERE id = $2 AND quiz_id = $3',
                    [i, questionIds[i], quizId]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async submitQuiz(quizId: number, userId: number, answers: Record<string, any>, timeSpent: number) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // Get quiz and questions
            const quiz = await this.getQuizById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            // Calculate score
            const { score, passed, questionResults } = this.calculateScore(quiz, answers);

            // Save attempt
            const attemptResult = await client.query(
                `INSERT INTO quiz_attempts (quiz_id, user_id, score, passed, time_spent, answers, submitted_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *`,
                [quizId, userId, score, passed, timeSpent, JSON.stringify(answers)]
            );

            await client.query('COMMIT');

            return {
                attempt: attemptResult.rows[0],
                score,
                passed,
                questionResults,
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private calculateScore(quiz: any, answers: Record<string, any>) {
        let totalPoints = 0;
        let earnedPoints = 0;
        const questionResults: any[] = [];

        quiz.questions.forEach((question: any) => {
            totalPoints += question.points;
            const userAnswer = answers[question.id];
            let isCorrect = false;
            let pointsEarned = 0;

            switch (question.type) {
                case 'multiple-choice':
                case 'true-false':
                    const correctOption = question.options.find((opt: any) => opt.is_correct);
                    isCorrect = userAnswer === correctOption?.id;
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                case 'multiple-select':
                    const correctOptionIds = question.options
                        .filter((opt: any) => opt.is_correct)
                        .map((opt: any) => opt.id)
                        .sort();
                    const userAnswerIds = (userAnswer || []).sort();
                    isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(userAnswerIds);
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                case 'fill-blanks':
                    const correctAnswer = question.options?.[0]?.text?.toLowerCase().trim();
                    const userAnswerText = userAnswer?.toLowerCase().trim();
                    isCorrect = correctAnswer === userAnswerText;
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                case 'open-ended':
                    // Open-ended questions require manual grading
                    isCorrect = false;
                    pointsEarned = 0;
                    break;
            }

            earnedPoints += pointsEarned;

            questionResults.push({
                questionId: question.id,
                isCorrect,
                pointsEarned,
                pointsPossible: question.points,
                userAnswer,
            });
        });

        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = score >= quiz.passing_score;

        return { score, passed, questionResults };
    }

    async getResults(attemptId: number, userId: number) {
        const client = await this.db.connect();
        try {
            const attemptResult = await client.query(
                'SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2',
                [attemptId, userId]
            );

            if (attemptResult.rows.length === 0) {
                return null;
            }

            const attempt = attemptResult.rows[0];
            const quiz = await this.getQuizById(attempt.quiz_id);

            return {
                attempt,
                quiz,
            };
        } finally {
            client.release();
        }
    }

    async getAttempts(quizId: number, userId: number) {
        const client = await this.db.connect();
        try {
            const result = await client.query(
                'SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY started_at DESC',
                [quizId, userId]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }
}
