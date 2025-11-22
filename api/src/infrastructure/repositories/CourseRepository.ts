import { query } from '../database/connection.js';
import { Course } from '../types/index.js';

const columnMap: Record<string, string> = {
  instructorId: 'instructor_id',
  imageUrl: 'image_url',
  isPublished: 'is_published',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const toSnakeCase = (key: string): string => {
  if (columnMap[key]) return columnMap[key];
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export class CourseRepository {
  async findById(id: number): Promise<Course | null> {
    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findAll(limit: number = 10, offset: number = 0, category?: string, level?: string, includeAll: boolean = false): Promise<Course[]> {
    let queryText = 'SELECT * FROM courses';
    const conditions: string[] = [];
    const params: any[] = [];

    if (!includeAll) {
      conditions.push('is_published = true');
    }

    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (level) {
      conditions.push(`level = $${params.length + 1}`);
      params.push(level);
    }

    if (conditions.length) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return result.rows;
  }

  async create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const result = await query(
      `INSERT INTO courses (title, description, instructor_id, category, level, price, duration, image_url, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        courseData.title,
        courseData.description,
        courseData.instructorId,
        courseData.category,
        courseData.level,
        courseData.price,
        courseData.duration,
        courseData.imageUrl,
        courseData.isPublished
      ]
    );
    return result.rows[0];
  }

  async update(id: number, courseData: Partial<Course>): Promise<Course | null> {
    const entries = Object.entries(courseData || {}).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      const existing = await this.findById(id);
      return existing;
    }

    const setClauses = entries.map(([key], index) => `${toSnakeCase(key)} = $${index + 2}`);
    const values = entries.map(([, value]) => value);

    const result = await query(
      `UPDATE courses SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM courses WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async findByInstructor(instructorId: number): Promise<Course[]> {
    const result = await query('SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC', [instructorId]);
    return result.rows;
  }
}
