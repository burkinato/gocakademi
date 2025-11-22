import { CourseRepository } from '../../infrastructure/repositories/CourseRepository.js';
import { Course } from '../../core/domain/entities/index.js';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async getAllCourses(limit: number = 10, offset: number = 0, category?: string, level?: string, includeAll: boolean = false) {
    try {
      const courses = await this.courseRepository.findAll(limit, offset, category, level, includeAll);
      return courses;
    } catch (error) {
      throw new Error('Failed to fetch courses');
    }
  }

  async getCourseById(id: number) {
    try {
      const course = await this.courseRepository.findById(id);
      if (!course) {
        throw new Error('Course not found');
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const course = await this.courseRepository.create(courseData);
      return course;
    } catch (error) {
      throw new Error('Failed to create course');
    }
  }

  async updateCourse(id: number, courseData: Partial<Course>) {
    try {
      const course = await this.courseRepository.update(id, courseData);
      if (!course) {
        throw new Error('Course not found');
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  async deleteCourse(id: number) {
    try {
      const deleted = await this.courseRepository.delete(id);
      if (!deleted) {
        throw new Error('Course not found');
      }
      return { message: 'Course deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getCoursesByInstructor(instructorId: number) {
    try {
      const courses = await this.courseRepository.findByInstructor(instructorId);
      return courses;
    } catch (error) {
      throw new Error('Failed to fetch instructor courses');
    }
  }
}
