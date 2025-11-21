import { PermissionRepository } from '../repositories/PermissionRepository.js';
import { Permission, RolePermission, UserPermission } from '../types/index.js';

export class PermissionService {
    private permissionRepo: PermissionRepository;

    constructor() {
        this.permissionRepo = new PermissionRepository();
    }

    // ============================================================================
    // PERMISSION MANAGEMENT
    // ============================================================================

    async getAllPermissions(): Promise<Permission[]> {
        return await this.permissionRepo.findAll();
    }

    async getPermissionById(id: number): Promise<Permission | null> {
        return await this.permissionRepo.findById(id);
    }

    async getPermissionByName(name: string): Promise<Permission | null> {
        return await this.permissionRepo.findByName(name);
    }

    async getPermissionsByResource(resource: string): Promise<Permission[]> {
        return await this.permissionRepo.findByResource(resource);
    }

    async createPermission(
        name: string,
        resource: string,
        action: string,
        description?: string
    ): Promise<Permission> {
        // Check if permission already exists
        const existing = await this.permissionRepo.findByName(name);
        if (existing) {
            throw new Error(`Permission '${name}' already exists`);
        }

        return await this.permissionRepo.create({
            name,
            description,
            resource,
            action,
        });
    }

    async updatePermission(
        id: number,
        updates: Partial<Omit<Permission, 'id' | 'createdAt'>>
    ): Promise<Permission> {
        const permission = await this.permissionRepo.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }

        // If name is being updated, check for conflicts
        if (updates.name && updates.name !== permission.name) {
            const existing = await this.permissionRepo.findByName(updates.name);
            if (existing) {
                throw new Error(`Permission '${updates.name}' already exists`);
            }
        }

        const updated = await this.permissionRepo.update(id, updates);
        if (!updated) {
            throw new Error('Failed to update permission');
        }

        return updated;
    }

    async deletePermission(id: number): Promise<void> {
        const permission = await this.permissionRepo.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }

        const deleted = await this.permissionRepo.delete(id);
        if (!deleted) {
            throw new Error('Failed to delete permission');
        }
    }

    // ============================================================================
    // ROLE PERMISSIONS
    // ============================================================================

    async getRolePermissions(role: 'student' | 'instructor' | 'admin'): Promise<Permission[]> {
        return await this.permissionRepo.findByRole(role);
    }

    async assignPermissionToRole(
        role: 'student' | 'instructor' | 'admin',
        permissionId: number
    ): Promise<RolePermission> {
        // Verify permission exists
        const permission = await this.permissionRepo.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }

        return await this.permissionRepo.assignToRole(role, permissionId);
    }

    async removePermissionFromRole(
        role: 'student' | 'instructor' | 'admin',
        permissionId: number
    ): Promise<void> {
        const removed = await this.permissionRepo.removeFromRole(role, permissionId);
        if (!removed) {
            throw new Error('Permission not assigned to this role');
        }
    }

    async bulkAssignPermissionsToRole(
        role: 'student' | 'instructor' | 'admin',
        permissionIds: number[]
    ): Promise<RolePermission[]> {
        const results: RolePermission[] = [];

        for (const permissionId of permissionIds) {
            try {
                const result = await this.assignPermissionToRole(role, permissionId);
                results.push(result);
            } catch (error) {
                console.error(`Failed to assign permission ${permissionId} to role ${role}:`, error);
            }
        }

        return results;
    }

    // ============================================================================
    // USER PERMISSIONS
    // ============================================================================

    async getUserPermissions(userId: number): Promise<Permission[]> {
        return await this.permissionRepo.findByUser(userId);
    }

    async assignPermissionToUser(
        userId: number,
        permissionId: number,
        granted: boolean = true
    ): Promise<UserPermission> {
        // Verify permission exists
        const permission = await this.permissionRepo.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }

        return await this.permissionRepo.assignToUser(userId, permissionId, granted);
    }

    async revokePermissionFromUser(userId: number, permissionId: number): Promise<void> {
        // Set granted to false instead of deleting
        await this.permissionRepo.assignToUser(userId, permissionId, false);
    }

    async removeUserPermission(userId: number, permissionId: number): Promise<void> {
        const removed = await this.permissionRepo.removeFromUser(userId, permissionId);
        if (!removed) {
            throw new Error('Permission not assigned to this user');
        }
    }

    async bulkAssignPermissionsToUser(
        userId: number,
        permissionIds: number[],
        granted: boolean = true
    ): Promise<UserPermission[]> {
        const results: UserPermission[] = [];

        for (const permissionId of permissionIds) {
            try {
                const result = await this.assignPermissionToUser(userId, permissionId, granted);
                results.push(result);
            } catch (error) {
                console.error(`Failed to assign permission ${permissionId} to user ${userId}:`, error);
            }
        }

        return results;
    }

    // ============================================================================
    // PERMISSION CHECKING
    // ============================================================================

    async checkPermission(userId: number, permissionName: string): Promise<boolean> {
        return await this.permissionRepo.checkUserPermission(userId, permissionName);
    }

    async checkAnyPermission(userId: number, permissionNames: string[]): Promise<boolean> {
        for (const permissionName of permissionNames) {
            const hasPermission = await this.checkPermission(userId, permissionName);
            if (hasPermission) {
                return true;
            }
        }
        return false;
    }

    async checkAllPermissions(userId: number, permissionNames: string[]): Promise<boolean> {
        for (const permissionName of permissionNames) {
            const hasPermission = await this.checkPermission(userId, permissionName);
            if (!hasPermission) {
                return false;
            }
        }
        return true;
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    async getPermissionsByNames(names: string[]): Promise<Permission[]> {
        const permissions: Permission[] = [];

        for (const name of names) {
            const permission = await this.permissionRepo.findByName(name);
            if (permission) {
                permissions.push(permission);
            }
        }

        return permissions;
    }

    async syncRolePermissions(
        role: 'student' | 'instructor' | 'admin',
        permissionIds: number[]
    ): Promise<void> {
        // Get current permissions
        const currentPermissions = await this.getRolePermissions(role);
        const currentIds = currentPermissions.map(p => p.id);

        // Remove permissions that are not in the new list
        for (const currentId of currentIds) {
            if (!permissionIds.includes(currentId)) {
                await this.removePermissionFromRole(role, currentId);
            }
        }

        // Add new permissions
        for (const permissionId of permissionIds) {
            if (!currentIds.includes(permissionId)) {
                await this.assignPermissionToRole(role, permissionId);
            }
        }
    }
}
