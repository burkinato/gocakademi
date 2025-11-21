import { pool } from '../database/connection.js';
import { Unit, CreateUnitDto, UpdateUnitDto } from '../types/index.js';

export class UnitRepository {
    /**
     * Find units by course ID
     */
    async findByCourseId(courseId: number): Promise<Unit[]> {
        const query = `
            SELECT *
            FROM units
            WHERE course_id = $1
            ORDER BY order_index ASC, id ASC
        `;
        const result = await pool.query(query, [courseId]);
        return result.rows.map(this.mapToUnit);
    }

    /**
     * Find unit by ID
     */
    async findById(id: number): Promise<Unit | null> {
        const query = 'SELECT * FROM units WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToUnit(result.rows[0]);
    }

    /**
     * Create new unit
     */
    async create(data: CreateUnitDto): Promise<Unit> {
        // Get the next order_index for this course
        const maxOrderQuery = `
            SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
            FROM units
            WHERE course_id = $1
        `;
        const maxOrderResult = await pool.query(maxOrderQuery, [data.courseId]);
        const orderIndex = maxOrderResult.rows[0].next_order;

        const query = `
            INSERT INTO units (
                course_id, title, description, order_index,
                is_required, access_level, estimated_duration
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            data.courseId,
            data.title,
            data.description || null,
            orderIndex,
            data.isRequired ?? true,
            data.accessLevel || 'free',
            data.estimatedDuration || null
        ];

        const result = await pool.query(query, values);
        return this.mapToUnit(result.rows[0]);
    }

    /**
     * Update unit
     */
    async update(id: number, data: UpdateUnitDto): Promise<Unit | null> {
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
        if (data.accessLevel !== undefined) {
            fields.push(`access_level = $${paramCount++}`);
            values.push(data.accessLevel);
        }
        if (data.estimatedDuration !== undefined) {
            fields.push(`estimated_duration = $${paramCount++}`);
            values.push(data.estimatedDuration || null);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE units
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToUnit(result.rows[0]);
    }

    /**
     * Delete unit (will cascade delete topics and assessments)
     */
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM units WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Reorder units
     */
    async reorder(items: { id: number; orderIndex: number }[]): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            for (const item of items) {
                await client.query(
                    'UPDATE units SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [item.orderIndex, item.id]
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
     * Map database row to Unit object
     */
    private mapToUnit(row: any): Unit {
        return {
            id: row.id,
            courseId: row.course_id,
            title: row.title,
            description: row.description,
            orderIndex: row.order_index,
            isRequired: row.is_required,
            accessLevel: row.access_level,
            estimatedDuration: row.estimated_duration,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
