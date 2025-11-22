import { pool, ensureUserExtendedColumns } from '../database/connection.js';
import { User, UserWithPermissions, PaginationParams, PaginatedResponse, FilterParams } from '../types/index.js';
import { PermissionRepository } from './PermissionRepository.js';

const parseJsonArray = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export class UserRepository {
  private permissionRepo: PermissionRepository;

  constructor() {
    this.permissionRepo = new PermissionRepository();
  }

  // ============================================================================
  // BASIC CRUD
  // ============================================================================

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await ensureUserExtendedColumns();
    const result = await pool.query(
      `INSERT INTO users (
        username, email, password, password_hash, first_name, last_name, role, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        (userData as any).username || null,
        userData.email,
        userData.password,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.role,
        userData.isActive,
      ]
    );
    return this.mapToUser(result.rows[0]);
  }

  async createBasic(params: { email: string; password: string; firstName: string; lastName: string; role: 'student' | 'instructor' | 'admin'; isActive?: boolean }): Promise<User> {
    await ensureUserExtendedColumns();
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        params.email,
        params.password,
        params.firstName,
        params.lastName,
        params.role,
        params.isActive ?? true,
      ]
    );
    return this.mapToUser(result.rows[0]);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await ensureUserExtendedColumns();
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fieldMappings: Record<string, string> = {
      email: 'email',
      password: 'password',
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      isActive: 'is_active',
      username: 'username',
      password_hash: 'password_hash',
      phone: 'phone',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      postalCode: 'postal_code',
      dateOfBirth: 'date_of_birth',
      bio: 'bio',
      profileImageUrl: 'profile_image_url',
      jobTitle: 'job_title',
      company: 'company',
      industry: 'industry',
      street: 'street',
      neighborhood: 'neighborhood',
      district: 'district',
      secondaryEmail: 'secondary_email',
      website: 'website',
      linkedin: 'linkedin',
      newsletterEnabled: 'newsletter_enabled',
      smsNotificationsEnabled: 'sms_notifications_enabled',
      marketingOptIn: 'marketing_opt_in',
      notes: 'notes',
      additionalPhones: 'additional_phones',
      emergencyContacts: 'emergency_contacts',
    };

    Object.entries(userData).forEach(([key, value]) => {
      if (fieldMappings[key] && value !== undefined) {
        // Handle JSON fields
        if (key === 'additionalPhones' || key === 'emergencyContacts') {
          fields.push(`${fieldMappings[key]} = $${paramCount++}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${fieldMappings[key]} = $${paramCount++}`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ============================================================================
  // EXTENDED QUERIES
  // ============================================================================

  async findAll(pagination?: PaginationParams): Promise<PaginatedResponse<User>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = pagination?.sortBy || 'created_at';
    const sortOrder = pagination?.sortOrder || 'desc';

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM users ORDER BY ${sortBy} ${sortOrder} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      data: result.rows.map(this.mapToUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByRole(role: 'student' | 'instructor' | 'admin', pagination?: PaginationParams): Promise<PaginatedResponse<User>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', [role]);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [role, limit, offset]
    );

    return {
      data: result.rows.map(this.mapToUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchUsers(filters: FilterParams, pagination?: PaginationParams): Promise<PaginatedResponse<User>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramCount = 1;

    if (filters.search) {
      whereConditions.push(
        `(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      );
      queryParams.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.role) {
      whereConditions.push(`role = $${paramCount}`);
      queryParams.push(filters.role);
      paramCount++;
    }

    if (filters.isActive !== undefined) {
      whereConditions.push(`is_active = $${paramCount}`);
      queryParams.push(filters.isActive);
      paramCount++;
    }

    if (filters.startDate) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(filters.endDate);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...queryParams, limit, offset]
    );

    return {
      data: result.rows.map(this.mapToUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findWithPermissions(id: number): Promise<UserWithPermissions | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const permissions = await this.permissionRepo.findByUser(id);

    return {
      ...user,
      permissions,
    };
  }

  // ============================================================================
  // STATUS & VERIFICATION
  // ============================================================================

  async updateStatus(id: number, isActive: boolean): Promise<User | null> {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async updateLastLogin(id: number): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  async verifyEmail(id: number): Promise<User | null> {
    const result = await pool.query(
      'UPDATE users SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async verifyPhone(id: number): Promise<User | null> {
    const result = await pool.query(
      'UPDATE users SET phone_verified = true, phone_verified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async enable2FA(id: number, secret: string): Promise<User | null> {
    const result = await pool.query(
      'UPDATE users SET two_factor_enabled = true, two_factor_secret = $1 WHERE id = $2 RETURNING *',
      [secret, id]
    );
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  async disable2FA(id: number): Promise<User | null> {
    const result = await pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length > 0 ? this.mapToUser(result.rows[0]) : null;
  }

  // ============================================================================
  // MAPPER
  // ============================================================================

  private mapToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      dateOfBirth: row.date_of_birth,
      profileImageUrl: row.profile_image_url,
      bio: row.bio,
      jobTitle: row.job_title,
      company: row.company,
      industry: row.industry,
      street: row.street,
      neighborhood: row.neighborhood,
      district: row.district,
      secondaryEmail: row.secondary_email,
      website: row.website,
      linkedin: row.linkedin,
      newsletterEnabled: row.newsletter_enabled,
      smsNotificationsEnabled: row.sms_notifications_enabled,
      marketingOptIn: row.marketing_opt_in,
      notes: row.notes,
      additionalPhones: parseJsonArray(row.additional_phones) as string[],
      emergencyContacts: parseJsonArray(row.emergency_contacts) as any,
      lastLoginAt: row.last_login_at,
      emailVerified: row.email_verified,
      emailVerifiedAt: row.email_verified_at,
      phoneVerified: row.phone_verified,
      phoneVerifiedAt: row.phone_verified_at,
      twoFactorEnabled: row.two_factor_enabled,
      twoFactorSecret: row.two_factor_secret,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
