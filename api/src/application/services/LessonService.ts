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

  async replaceCourseLessons(courseId: number, lessons: LessonInput[]) {
    await this.repo.deleteByCourse(courseId);
    if (lessons.length === 0) {
      return { created: 0 };
    }
    return this.createBulk(courseId, lessons);
  }
}
