import { LessonRepository, LessonInput } from '../../infrastructure/repositories/LessonRepository.js';

export class LessonService {
  private repo: LessonRepository;

  constructor() {
    this.repo = new LessonRepository();
  }

  async getByCourse(courseId: number) {
    return this.repo.findByCourse(courseId);
  }

  async createBulk(courseId: number, lessons: LessonInput[]) {
    const count = await this.repo.createBulk(courseId, lessons);
    return { created: count };
  }
}