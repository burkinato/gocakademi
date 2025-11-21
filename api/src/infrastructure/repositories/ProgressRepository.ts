import { pool } from '../database/connection.js';
import {
    StudentProgress,
    TopicProgress,
    AssessmentResult,
    CourseEnrollment,
    SubmitAssessmentDto
} from '../types/index.js';

export class ProgressRepository {
    /**
     * Get student's overall course progress
     */
    async getStudentCourseProgress(userId: number, courseId: number): Promise<StudentProgress | null> {
        // Get enrollment info
        const enrollmentQuery = `
            SELECT *
            FROM course_enrollments
            WHERE user_id = $1 AND course_id = $2
        `;
        const enrollmentResult = await pool.query(enrollmentQuery, [userId, courseId]);

        if (enrollmentResult.rows.length === 0) {
            return null;
        }

        const enrollment = enrollmentResult.rows[0];

        // Get all units for this course
        const unitsQuery = `
            SELECT u.id, u.title, u.is_required,
                   (SELECT COUNT(*) FROM topics t WHERE t.unit_id = u.id AND t.is_required = true) as required_topics,
                   (SELECT COUNT(*) FROM assessments a WHERE a.unit_id = u.id AND a.is_required = true) as required_assessments
            FROM units u
            WHERE u.course_id = $1
            ORDER BY u.order_index ASC
        `;
        const unitsResult = await pool.query(unitsQuery, [courseId]);

        // Get topic progress
        const topicProgressQuery = `
            SELECT t.unit_id, stp.*
            FROM student_topic_progress stp
            JOIN topics t ON stp.topic_id = t.id
            JOIN units u ON t.unit_id = u.id
            WHERE stp.user_id = $1 AND u.course_id = $2
        `;
        const topicProgressResult = await pool.query(topicProgressQuery, [userId, courseId]);

        // Get assessment results
        const assessmentResultsQuery = `
            SELECT a.unit_id, ar.*
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            JOIN units u ON a.unit_id = u.id
            WHERE ar.user_id = $1 AND u.course_id = $2
        `;
        const assessmentResultsResult = await pool.query(assessmentResultsQuery, [userId, courseId]);

        // Build progress object
        const unitProgress: Record<number, any> = {};
        const topicProgress: Record<number, TopicProgress> = {};
        const assessmentProgress: Record<number, any> = {};

        // Process topic progress
        for (const row of topicProgressResult.rows) {
            const unitId = row.unit_id;
            const topicId = row.topic_id;

            topicProgress[topicId] = {
                topicId,
                userId,
                status: row.status,
                watchedDuration: row.watched_duration || 0,
                completedAt: row.completed_at,
                lastAccessedAt: row.last_accessed_at
            };

            if (!unitProgress[unitId]) {
                unitProgress[unitId] = { completed: 0, total: 0 };
            }
            if (row.status === 'completed') {
                unitProgress[unitId].completed++;
            }
        }

        // Process assessment results
        for (const row of assessmentResultsResult.rows) {
            const unitId = row.unit_id;
            const assessmentId = row.assessment_id;

            if (!assessmentProgress[assessmentId]) {
                assessmentProgress[assessmentId] = {
                    attempts: 0,
                    bestScore: 0,
                    passed: false
                };
            }

            assessmentProgress[assessmentId].attempts++;
            if (row.percentage > assessmentProgress[assessmentId].bestScore) {
                assessmentProgress[assessmentId].bestScore = row.percentage;
            }
            if (row.passed) {
                assessmentProgress[assessmentId].passed = true;
            }
        }

        // Calculate unit percentages
        for (const unit of unitsResult.rows) {
            const unitId = unit.id;
            const total = unit.required_topics + unit.required_assessments;

            if (!unitProgress[unitId]) {
                unitProgress[unitId] = { completed: 0, total };
            } else {
                unitProgress[unitId].total = total;
            }

            // Add completed assessments to unit progress
            // (This is simplified - in reality, we'd query more carefully)
            unitProgress[unitId].percentage = total > 0
                ? Math.round((unitProgress[unitId].completed / total) * 100)
                : 0;
        }

        return {
            courseId,
            userId,
            courseProgress: {
                total: unitsResult.rows.reduce((sum, u) => sum + (u.required_topics + u.required_assessments), 0),
                completed: enrollment.progress_percentage || 0,
                percentage: enrollment.progress_percentage || 0,
                requiredCompleted: enrollment.progress_percentage === 100
            },
            unitProgress,
            topicProgress,
            assessmentProgress
        };
    }

    /**
     * Get or create course enrollment
     */
    async enrollStudent(userId: number, courseId: number): Promise<CourseEnrollment> {
        const query = `
            INSERT INTO course_enrollments (user_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, course_id) DO UPDATE
            SET last_accessed_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await pool.query(query, [userId, courseId]);
        return this.mapToEnrollment(result.rows[0]);
    }

    /**
     * Update topic progress
     */
    async updateTopicProgress(
        userId: number,
        topicId: number,
        data: { status?: string; watchedDuration?: number }
    ): Promise<TopicProgress> {
        const query = `
            INSERT INTO student_topic_progress (user_id, topic_id, status, watched_duration, last_accessed_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, topic_id) DO UPDATE
            SET status = COALESCE($3, student_topic_progress.status),
                watched_duration = COALESCE($4, student_topic_progress.watched_duration),
                last_accessed_at = CURRENT_TIMESTAMP,
                completed_at = CASE 
                    WHEN $3 = 'completed' THEN CURRENT_TIMESTAMP
                    ELSE student_topic_progress.completed_at
                END,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const values = [userId, topicId, data.status || null, data.watchedDuration || null];
        const result = await pool.query(query, values);

        return {
            topicId: result.rows[0].topic_id,
            userId: result.rows[0].user_id,
            status: result.rows[0].status,
            watchedDuration: result.rows[0].watched_duration,
            completedAt: result.rows[0].completed_at,
            lastAccessedAt: result.rows[0].last_accessed_at
        };
    }

    /**
     * Get topic progress
     */
    async getTopicProgress(userId: number, topicId: number): Promise<TopicProgress | null> {
        const query = 'SELECT * FROM student_topic_progress WHERE user_id = $1 AND topic_id = $2';
        const result = await pool.query(query, [userId, topicId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            topicId: row.topic_id,
            userId: row.user_id,
            status: row.status,
            watchedDuration: row.watched_duration,
            completedAt: row.completed_at,
            lastAccessedAt: row.last_accessed_at
        };
    }

    /**
     * Submit assessment
     */
    async submitAssessment(data: SubmitAssessmentDto): Promise<AssessmentResult> {
        // Get assessment details and questions
        const assessmentQuery = `
            SELECT a.*, 
                   (SELECT SUM(points) FROM questions WHERE assessment_id = a.id) as total_points
            FROM assessments a
            WHERE a.id = $1
        `;
        const assessmentResult = await pool.query(assessmentQuery, [data.assessmentId]);

        if (assessmentResult.rows.length === 0) {
            throw new Error('Assessment not found');
        }

        const assessment = assessmentResult.rows[0];
        const totalPoints = assessment.total_points || 0;

        // Get questions with correct answers
        const questionsQuery = 'SELECT * FROM questions WHERE assessment_id = $1 ORDER BY order_index ASC';
        const questionsResult = await pool.query(questionsQuery, [data.assessmentId]);
        const questions = questionsResult.rows;

        // Calculate score
        let earnedPoints = 0;
        const gradedAnswers: Record<string, any> = {};

        for (const question of questions) {
            const userAnswer = data.answers[question.id.toString()];
            const correctAnswer = question.correct_answer;

            let isCorrect = false;

            // Grade based on question type
            switch (question.question_type) {
                case 'multiple_choice':
                    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
                        isCorrect = JSON.stringify(correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
                    }
                    break;
                case 'true_false':
                case 'short_answer':
                case 'fill_blank':
                    isCorrect = String(correctAnswer).toLowerCase().trim() === String(userAnswer).toLowerCase().trim();
                    break;
                case 'essay':
                    // Essays need manual grading
                    isCorrect = false;
                    break;
            }

            if (isCorrect) {
                earnedPoints += question.points;
            }

            gradedAnswers[question.id] = {
                userAnswer,
                isCorrect,
                points: isCorrect ? question.points : 0
            };
        }

        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = percentage >= assessment.passing_score;

        // Get attempt number
        const attemptQuery = `
            SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
            FROM assessment_results
            WHERE user_id = $1 AND assessment_id = $2
        `;
        const attemptResult = await pool.query(attemptQuery, [data.userId, data.assessmentId]);
        const attemptNumber = attemptResult.rows[0].next_attempt;

        // Insert result
        const insertQuery = `
            INSERT INTO assessment_results (
                user_id, assessment_id, score, total_points, percentage,
                passed, attempt_number, answers, started_at, submitted_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const insertValues = [
            data.userId,
            data.assessmentId,
            earnedPoints,
            totalPoints,
            percentage,
            passed,
            attemptNumber,
            JSON.stringify(gradedAnswers),
            data.startedAt,
            data.submittedAt
        ];
        const insertResult = await pool.query(insertQuery, insertValues);

        return {
            id: insertResult.rows[0].id,
            userId: data.userId,
            assessmentId: data.assessmentId,
            score: earnedPoints,
            totalPoints,
            percentage,
            passed,
            attemptNumber,
            answers: gradedAnswers,
            startedAt: data.startedAt,
            submittedAt: data.submittedAt
        };
    }

    /**
     * Get assessment results for a student
     */
    async getAssessmentResults(userId: number, assessmentId: number): Promise<AssessmentResult[]> {
        const query = `
            SELECT *
            FROM assessment_results
            WHERE user_id = $1 AND assessment_id = $2
            ORDER BY attempt_number DESC
        `;
        const result = await pool.query(query, [userId, assessmentId]);

        return result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            assessmentId: row.assessment_id,
            score: row.score,
            totalPoints: row.total_points,
            percentage: row.percentage,
            passed: row.passed,
            attemptNumber: row.attempt_number,
            answers: row.answers,
            startedAt: row.started_at,
            submittedAt: row.submitted_at
        }));
    }

    /**
     * Map database row to CourseEnrollment
     */
    private mapToEnrollment(row: any): CourseEnrollment {
        return {
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            enrolledAt: row.enrolled_at,
            completedAt: row.completed_at,
            progressPercentage: row.progress_percentage,
            lastAccessedAt: row.last_accessed_at
        };
    }
}
