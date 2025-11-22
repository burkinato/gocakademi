import { query } from '../database/connection.js';

export interface LessonInput {
  title: string;
  unitTitle?: string;
  content?: string;
  videoUrl?: string;
  orderIndex?: number;
  duration?: number;
  contentType?: 'video'|'text'|'pdf'|'quiz';
  isRequired?: boolean;
  metadata?: Record<string, any>;
}

export class LessonRepository {
  async findByCourse(courseId: number) {
    const result = await query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC, id ASC', [courseId]);
    return result.rows;
  }

  async createBulk(courseId: number, lessons: LessonInput[]): Promise<number> {
    let created = 0;
    for (const [idx, l] of lessons.entries()) {
      await query(
        `INSERT INTO lessons (course_id, title, content, video_url, order_index, duration, unit_title, content_type, is_required, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          courseId,
          l.title,
          l.content || null,
          l.videoUrl || null,
          l.orderIndex ?? idx,
          l.duration ?? null,
          l.unitTitle || null,
          l.contentType || null,
          l.isRequired ?? true,
          l.metadata ?? {},
        ]
      );
      created++;
    }
    return created;
  }

  async deleteByCourse(courseId: number): Promise<void> {
    await query('DELETE FROM lessons WHERE course_id = $1', [courseId]);
  }
}
