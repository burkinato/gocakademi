import { pool } from '../database/connection.js';
import { Assessment, CreateAssessmentDto, UpdateAssessmentDto } from '../types/index.js';

export class AssessmentRepository {
    /**
     * Find assessments by unit ID
     */
    async findByUnitId(unitId: number): Promise<Assessment[]> {
        const query = `
            SELECT *
            FROM assessments
            WHERE unit_id = $1
            ORDER BY order_index ASC, id ASC
        `;
        const result = await pool.query(query, [unitId]);
        return result.rows.map(this.mapToAssessment);
    }

    /**
     * Find assessment by ID
     */
    async findById(id: number): Promise<Assessment | null> {
        const query = 'SELECT * FROM assessments WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToAssessment(result.rows[0]);
    }

    /**
     * Find assessment with questions
     */
    async findWithQuestions(id: number): Promise<Assessment | null> {
        const assessment = await this.findById(id);

        if (!assessment) {
            return null;
        }

        const questionsQuery = `
            SELECT *
            FROM questions
            WHERE assessment_id = $1
            ORDER BY order_index ASC, id ASC
        `;
        const questionsResult = await pool.query(questionsQuery, [id]);

        return {
            ...assessment,
            questions: questionsResult.rows.map(row => ({
                id: row.id,
                assessmentId: row.assessment_id,
                questionType: row.question_type,
                questionText: row.question_text,
                points: row.points,
                orderIndex: row.order_index,
                options: row.options,
                correctAnswer: row.correct_answer,
                explanation: row.explanation,
                imageUrl: row.image_url,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }))
        };
    }

    /**
     * Create new assessment
     */
    async create(data: CreateAssessmentDto): Promise<Assessment> {
        // Get the next order_index for this unit
        const maxOrderQuery = `
            SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
            FROM assessments
            WHERE unit_id = $1
        `;
        const maxOrderResult = await pool.query(maxOrderQuery, [data.unitId]);
        const orderIndex = maxOrderResult.rows[0].next_order;

        const query = `
            INSERT INTO assessments (
                unit_id, title, description, order_index,
                is_required, passing_score, time_limit, max_attempts,
                show_correct_answers, shuffle_questions, access_level
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            data.unitId,
            data.title,
            data.description || null,
            orderIndex,
            data.isRequired ?? true,
            data.passingScore || 70,
            data.timeLimit || null,
            data.maxAttempts || null,
            data.showCorrectAnswers ?? false,
            data.shuffleQuestions ?? false,
            data.accessLevel || 'free'
        ];

        const result = await pool.query(query, values);
        return this.mapToAssessment(result.rows[0]);
    }

    /**
     * Update assessment
     */
    async update(id: number, data: UpdateAssessmentDto): Promise<Assessment | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(data.description || null);
        }
        if (data.isRequired !== undefined) {
            fields.push(`is_required = $${paramCount++}`);
            values.push(data.isRequired);
        }
        if (data.passingScore !== undefined) {
            fields.push(`passing_score = $${paramCount++}`);
            values.push(data.passingScore);
        }
        if (data.timeLimit !== undefined) {
            fields.push(`time_limit = $${paramCount++}`);
            values.push(data.timeLimit || null);
        }
        if (data.maxAttempts !== undefined) {
            fields.push(`max_attempts = $${paramCount++}`);
            values.push(data.maxAttempts || null);
        }
        if (data.showCorrectAnswers !== undefined) {
            fields.push(`show_correct_answers = $${paramCount++}`);
            values.push(data.showCorrectAnswers);
        }
        if (data.shuffleQuestions !== undefined) {
            fields.push(`shuffle_questions = $${paramCount++}`);
            values.push(data.shuffleQuestions);
        }
        if (data.accessLevel !== undefined) {
            fields.push(`access_level = $${paramCount++}`);
            values.push(data.accessLevel);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE assessments
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToAssessment(result.rows[0]);
    }

    /**
     * Delete assessment (will cascade delete questions)
     */
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM assessments WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Map database row to Assessment object
     */
    private mapToAssessment(row: any): Assessment {
        return {
            id: row.id,
            unitId: row.unit_id,
            title: row.title,
            description: row.description,
            orderIndex: row.order_index,
            isRequired: row.is_required,
            passingScore: row.passing_score,
            timeLimit: row.time_limit,
            maxAttempts: row.max_attempts,
            showCorrectAnswers: row.show_correct_answers,
            shuffleQuestions: row.shuffle_questions,
            accessLevel: row.access_level,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
