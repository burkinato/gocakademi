import { pool } from '../database/connection.js';
import { Permission, RolePermission, UserPermission } from '../types/index.js';

export class PermissionRepository {
    // ============================================================================
    // PERMISSION CRUD
    // ============================================================================

    async findAll(): Promise<Permission[]> {
        const result = await pool.query(
            'SELECT * FROM permissions ORDER BY resource, action'
        );
        return result.rows.map(this.mapToPermission);
    }

    async findById(id: number): Promise<Permission | null> {
        const result = await pool.query(
            'SELECT * FROM permissions WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToPermission(result.rows[0]) : null;
    }

    async findByName(name: string): Promise<Permission | null> {
        const result = await pool.query(
            'SELECT * FROM permissions WHERE name = $1',
            [name]
        );
        return result.rows.length > 0 ? this.mapToPermission(result.rows[0]) : null;
    }

    async findByResource(resource: string): Promise<Permission[]> {
        const result = await pool.query(
            'SELECT * FROM permissions WHERE resource = $1 ORDER BY action',
            [resource]
        );
        return result.rows.map(this.mapToPermission);
    }

    async create(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
        const result = await pool.query(
            `INSERT INTO permissions (name, description, resource, action)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [permission.name, permission.description, permission.resource, permission.action]
        );
        return this.mapToPermission(result.rows[0]);
    }

    async update(id: number, permission: Partial<Omit<Permission, 'id' | 'createdAt'>>): Promise<Permission | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (permission.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(permission.name);
        }
        if (permission.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(permission.description);
        }
        if (permission.resource !== undefined) {
            fields.push(`resource = $${paramCount++}`);
            values.push(permission.resource);
        }
        if (permission.action !== undefined) {
            fields.push(`action = $${paramCount++}`);
            values.push(permission.action);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE permissions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows.length > 0 ? this.mapToPermission(result.rows[0]) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM permissions WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    // ============================================================================
    // ROLE PERMISSIONS
    // ============================================================================

    async findByRole(role: 'student' | 'instructor' | 'admin'): Promise<Permission[]> {
        const result = await pool.query(
            `SELECT p.* FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = $1
       ORDER BY p.resource, p.action`,
            [role]
        );
        return result.rows.map(this.mapToPermission);
    }

    async assignToRole(role: 'student' | 'instructor' | 'admin', permissionId: number): Promise<RolePermission> {
        const result = await pool.query(
            `INSERT INTO role_permissions (role, permission_id)
       VALUES ($1, $2)
       ON CONFLICT (role, permission_id) DO UPDATE SET role = $1
       RETURNING *`,
            [role, permissionId]
        );
        return this.mapToRolePermission(result.rows[0]);
    }

    async removeFromRole(role: 'student' | 'instructor' | 'admin', permissionId: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM role_permissions WHERE role = $1 AND permission_id = $2',
            [role, permissionId]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    // ============================================================================
    // USER PERMISSIONS
    // ============================================================================

    async findByUser(userId: number): Promise<Permission[]> {
        // Get both role-based and user-specific permissions
        const result = await pool.query(
            `SELECT DISTINCT p.* FROM permissions p
       LEFT JOIN role_permissions rp ON p.id = rp.permission_id
       LEFT JOIN users u ON u.role = rp.role
       LEFT JOIN user_permissions up ON p.id = up.permission_id AND up.user_id = $1
       WHERE (u.id = $1 AND up.granted IS NULL) 
          OR (up.user_id = $1 AND up.granted = true)
       ORDER BY p.resource, p.action`,
            [userId]
        );
        return result.rows.map(this.mapToPermission);
    }

    async assignToUser(userId: number, permissionId: number, granted: boolean = true): Promise<UserPermission> {
        const result = await pool.query(
            `INSERT INTO user_permissions (user_id, permission_id, granted)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, permission_id) DO UPDATE SET granted = $3
       RETURNING *`,
            [userId, permissionId, granted]
        );
        return this.mapToUserPermission(result.rows[0]);
    }

    async removeFromUser(userId: number, permissionId: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
            [userId, permissionId]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    async checkUserPermission(userId: number, permissionName: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT EXISTS(
        SELECT 1 FROM permissions p
        LEFT JOIN role_permissions rp ON p.id = rp.permission_id
        LEFT JOIN users u ON u.role = rp.role
        LEFT JOIN user_permissions up ON p.id = up.permission_id AND up.user_id = $1
        WHERE p.name = $2 
          AND ((u.id = $1 AND up.granted IS NULL) OR (up.user_id = $1 AND up.granted = true))
      ) as has_permission`,
            [userId, permissionName]
        );
        return result.rows[0].has_permission;
    }

    // ============================================================================
    // MAPPERS
    // ============================================================================

    private mapToPermission(row: any): Permission {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            resource: row.resource,
            action: row.action,
            createdAt: row.created_at,
        };
    }

    private mapToRolePermission(row: any): RolePermission {
        return {
            id: row.id,
            role: row.role,
            permissionId: row.permission_id,
            createdAt: row.created_at,
        };
    }

    private mapToUserPermission(row: any): UserPermission {
        return {
            id: row.id,
            userId: row.user_id,
            permissionId: row.permission_id,
            granted: row.granted,
            createdAt: row.created_at,
        };
    }
}
