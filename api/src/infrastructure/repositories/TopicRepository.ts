import { pool } from '../database/connection.js';
import { Topic, CreateTopicDto, UpdateTopicDto } from '../types/index.js';

export class TopicRepository {
    /**
     * Find topics by unit ID
     */
    async findByUnitId(unitId: number): Promise<Topic[]> {
        const query = `
            SELECT *
            FROM topics
            WHERE unit_id = $1
            ORDER BY order_index ASC, id ASC
        `;
        const result = await pool.query(query, [unitId]);
        return result.rows.map(this.mapToTopic);
    }

    /**
     * Find topic by ID
     */
    async findById(id: number): Promise<Topic | null> {
        const query = 'SELECT * FROM topics WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToTopic(result.rows[0]);
    }

    /**
     * Create new topic
     */
    async create(data: CreateTopicDto): Promise<Topic> {
        // Get the next order_index for this unit
        const maxOrderQuery = `
            SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
            FROM topics
            WHERE unit_id = $1
        `;
        const maxOrderResult = await pool.query(maxOrderQuery, [data.unitId]);
        const orderIndex = maxOrderResult.rows[0].next_order;

        const query = `
            INSERT INTO topics (
                unit_id, title, description, content_type,
                content_url, external_link, content, order_index,
                is_required, access_level, duration, file_size, mime_type
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            data.unitId,
            data.title,
            data.description || null,
            data.contentType,
            data.contentUrl || null,
            data.externalLink || null,
            data.content || null,
            orderIndex,
            data.isRequired ?? true,
            data.accessLevel || 'free',
            data.duration || null,
            data.fileSize || null,
            data.mimeType || null
        ];

        const result = await pool.query(query, values);
        return this.mapToTopic(result.rows[0]);
    }

    /**
     * Update topic
     */
    async update(id: number, data: UpdateTopicDto): Promise<Topic | null> {
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
        if (data.contentType !== undefined) {
            fields.push(`content_type = $${paramCount++}`);
            values.push(data.contentType);
        }
        if (data.contentUrl !== undefined) {
            fields.push(`content_url = $${paramCount++}`);
            values.push(data.contentUrl || null);
        }
        if (data.externalLink !== undefined) {
            fields.push(`external_link = $${paramCount++}`);
            values.push(data.externalLink || null);
        }
        if (data.content !== undefined) {
            fields.push(`content = $${paramCount++}`);
            values.push(data.content || null);
        }
        if (data.isRequired !== undefined) {
            fields.push(`is_required = $${paramCount++}`);
            values.push(data.isRequired);
        }
        if (data.accessLevel !== undefined) {
            fields.push(`access_level = $${paramCount++}`);
            values.push(data.accessLevel);
        }
        if (data.duration !== undefined) {
            fields.push(`duration = $${paramCount++}`);
            values.push(data.duration || null);
        }
        if (data.fileSize !== undefined) {
            fields.push(`file_size = $${paramCount++}`);
            values.push(data.fileSize || null);
        }
        if (data.mimeType !== undefined) {
            fields.push(`mime_type = $${paramCount++}`);
            values.push(data.mimeType || null);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE topics
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToTopic(result.rows[0]);
    }

    /**
     * Delete topic
     */
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM topics WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Reorder topics within a unit
     */
    async reorder(unitId: number, items: { id: number; orderIndex: number }[]): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            for (const item of items) {
                await client.query(
                    'UPDATE topics SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND unit_id = $3',
                    [item.orderIndex, item.id, unitId]
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
     * Map database row to Topic object
     */
    private mapToTopic(row: any): Topic {
        return {
            id: row.id,
            unitId: row.unit_id,
            title: row.title,
            description: row.description,
            contentType: row.content_type,
            contentUrl: row.content_url,
            externalLink: row.external_link,
            content: row.content,
            orderIndex: row.order_index,
            isRequired: row.is_required,
            accessLevel: row.access_level,
            duration: row.duration,
            fileSize: row.file_size,
            mimeType: row.mime_type,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
