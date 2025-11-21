import { pool } from '../database/connection.js';
import { Question, CreateQuestionDto, UpdateQuestionDto } from '../types/index.js';

export class QuestionRepository {
    /**
     * Find questions by assessment ID
     */
    async findByAssessmentId(assessmentId: number): Promise<Question[]> {
        const query = `
            SELECT *
            FROM questions
            WHERE assessment_id = $1
            ORDER BY order_index ASC, id ASC
        `;
        const result = await pool.query(query, [assessmentId]);
        return result.rows.map(this.mapToQuestion);
    }

    /**
     * Find question by ID
     */
    async findById(id: number): Promise<Question | null> {
        const query = 'SELECT * FROM questions WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToQuestion(result.rows[0]);
    }

    /**
     * Create new question
     */
    async create(data: CreateQuestionDto): Promise<Question> {
        // Get the next order_index for this assessment
        const maxOrderQuery = `
            SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
            FROM questions
            WHERE assessment_id = $1
        `;
        const maxOrderResult = await pool.query(maxOrderQuery, [data.assessmentId]);
        const orderIndex = maxOrderResult.rows[0].next_order;

        const query = `
            INSERT INTO questions (
                assessment_id, question_type, question_text,
                points, order_index, options, correct_answer,
                explanation, image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            data.assessmentId,
            data.questionType,
            data.questionText,
            data.points || 1,
            orderIndex,
            data.options ? JSON.stringify(data.options) : null,
            data.correctAnswer ? JSON.stringify(data.correctAnswer) : null,
            data.explanation || null,
            data.imageUrl || null
        ];

        const result = await pool.query(query, values);
        return this.mapToQuestion(result.rows[0]);
    }

    /**
     * Update question
     */
    async update(id: number, data: UpdateQuestionDto): Promise<Question | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.questionType !== undefined) {
            fields.push(`question_type = $${paramCount++}`);
            values.push(data.questionType);
        }
        if (data.questionText !== undefined) {
            fields.push(`question_text = $${paramCount++}`);
            values.push(data.questionText);
        }
        if (data.points !== undefined) {
            fields.push(`points = $${paramCount++}`);
            values.push(data.points);
        }
        if (data.options !== undefined) {
            fields.push(`options = $${paramCount++}`);
            values.push(data.options ? JSON.stringify(data.options) : null);
        }
        if (data.correctAnswer !== undefined) {
            fields.push(`correct_answer = $${paramCount++}`);
            values.push(data.correctAnswer ? JSON.stringify(data.correctAnswer) : null);
        }
        if (data.explanation !== undefined) {
            fields.push(`explanation = $${paramCount++}`);
            values.push(data.explanation || null);
        }
        if (data.imageUrl !== undefined) {
            fields.push(`image_url = $${paramCount++}`);
            values.push(data.imageUrl || null);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE questions
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToQuestion(result.rows[0]);
    }

    /**
     * Delete question
     */
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM questions WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Reorder questions within an assessment
     */
    async reorder(assessmentId: number, items: { id: number; orderIndex: number }[]): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            for (const item of items) {
                await client.query(
                    'UPDATE questions SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND assessment_id = $3',
                    [item.orderIndex, item.id, assessmentId]
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

    /**
     * Map database row to Question object
     */
    private mapToQuestion(row: any): Question {
        return {
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
        };
    }
}
