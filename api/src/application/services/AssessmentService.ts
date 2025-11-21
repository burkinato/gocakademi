import { query } from '../database/connection.js';

export class AssessmentService {
  async getByCourse(courseId: number) {
    const res = await query('SELECT * FROM unit_assessments WHERE course_id = $1', [courseId]);
    return res.rows;
  }

  async create(courseId: number, unitTitle: string, isOptional: boolean = true) {
    const res = await query('INSERT INTO unit_assessments (course_id, unit_title, is_optional) VALUES ($1,$2,$3) RETURNING *', [courseId, unitTitle, isOptional]);
    return res.rows[0];
  }

  async addQuestion(assessmentId: number, payload: { question: string; options?: any; correct_answer?: string; points?: number }) {
    const res = await query('INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, points) VALUES ($1,$2,$3,$4,$5) RETURNING *', [assessmentId, payload.question, payload.options || null, payload.correct_answer || null, payload.points ?? 1]);
    return res.rows[0];
  }

  async submit(assessmentId: number, userId: number, answers: Record<number, string>) {
    const q = await query('SELECT id, correct_answer, points FROM assessment_questions WHERE assessment_id = $1', [assessmentId]);
    let score = 0, total = 0;
    for (const row of q.rows) {
      total += row.points || 1;
      if (answers[row.id] && row.correct_answer && answers[row.id] === row.correct_answer) {
        score += row.points || 1;
      }
    }
    const res = await query('INSERT INTO assessment_results (assessment_id, user_id, score, total) VALUES ($1,$2,$3,$4) RETURNING *', [assessmentId, userId, score, total]);
    return res.rows[0];
  }
}