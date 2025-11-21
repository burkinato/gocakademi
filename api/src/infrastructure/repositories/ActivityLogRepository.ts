import { pool } from '../database/connection.js';
import { ActivityLog, PaginationParams, PaginatedResponse } from '../types/index.js';

export class ActivityLogRepository {
    async create(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
        const result = await pool.query(
            `INSERT INTO activity_logs 
       (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                log.userId,
                log.action,
                log.resourceType,
                log.resourceId,
                log.ipAddress,
                log.userAgent,
                log.details ? JSON.stringify(log.details) : null,
            ]
        );
        return this.mapToActivityLog(result.rows[0]);
    }

    async findById(id: number): Promise<ActivityLog | null> {
        const result = await pool.query(
            'SELECT * FROM activity_logs WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToActivityLog(result.rows[0]) : null;
    }

    async findByUser(
        userId: number,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = pagination?.sortBy || 'created_at';
        const sortOrder = pagination?.sortOrder || 'desc';

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM activity_logs WHERE user_id = $1',
            [userId]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const result = await pool.query(
            `SELECT * FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return {
            data: result.rows.map(this.mapToActivityLog),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByAction(
        action: string,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = pagination?.sortBy || 'created_at';
        const sortOrder = pagination?.sortOrder || 'desc';

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM activity_logs WHERE action = $1',
            [action]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const result = await pool.query(
            `SELECT * FROM activity_logs 
       WHERE action = $1 
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $2 OFFSET $3`,
            [action, limit, offset]
        );

        return {
            data: result.rows.map(this.mapToActivityLog),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByDateRange(
        startDate: Date,
        endDate: Date,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = pagination?.sortBy || 'created_at';
        const sortOrder = pagination?.sortOrder || 'desc';

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM activity_logs WHERE created_at BETWEEN $1 AND $2',
            [startDate, endDate]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const result = await pool.query(
            `SELECT * FROM activity_logs 
       WHERE created_at BETWEEN $1 AND $2 
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $3 OFFSET $4`,
            [startDate, endDate, limit, offset]
        );

        return {
            data: result.rows.map(this.mapToActivityLog),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByResource(
        resourceType: string,
        resourceId: number,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = pagination?.sortBy || 'created_at';
        const sortOrder = pagination?.sortOrder || 'desc';

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM activity_logs WHERE resource_type = $1 AND resource_id = $2',
            [resourceType, resourceId]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const result = await pool.query(
            `SELECT * FROM activity_logs 
       WHERE resource_type = $1 AND resource_id = $2 
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $3 OFFSET $4`,
            [resourceType, resourceId, limit, offset]
        );

        return {
            data: result.rows.map(this.mapToActivityLog),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAll(pagination?: PaginationParams): Promise<PaginatedResponse<ActivityLog>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = pagination?.sortBy || 'created_at';
        const sortOrder = pagination?.sortOrder || 'desc';

        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM activity_logs');
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const result = await pool.query(
            `SELECT * FROM activity_logs 
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            data: result.rows.map(this.mapToActivityLog),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteOldLogs(daysToKeep: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await pool.query(
            'DELETE FROM activity_logs WHERE created_at < $1',
            [cutoffDate]
        );

        return result.rowCount || 0;
    }

    private mapToActivityLog(row: any): ActivityLog {
        return {
            id: row.id,
            userId: row.user_id,
            action: row.action,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            details: row.details,
            createdAt: row.created_at,
        };
    }
}
