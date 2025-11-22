import { Request, Response } from 'express';
import { CourseService } from '../../application/services/CourseService.js';
import { LessonService } from '../../application/services/LessonService.js';
import { ApiResponse } from '../../core/domain/entities/index.js';

const courseService = new CourseService();
const lessonService = new LessonService();

const buildLessonsFromCurriculum = (curriculum: any[]) => {
  const lessons: any[] = [];
  let order = 0;
  for (const unit of curriculum) {
    const unitTitle = unit.title;
    for (const item of (unit.items || [])) {
      const durationValue = item.duration ? parseInt(item.duration) : null;
      const metadata: Record<string, any> = {
        attachments: item.attachments || [],
        quiz: item.quiz || null,
        richTextEnabled: Boolean(item.richTextContent),
        resources: item.resources || [],
        videoAsset: item.videoAsset || null,
      };

      lessons.push({
        title: item.title,
        unitTitle,
        content: item.richTextContent || item.textContent || undefined,
        videoUrl: item.type === 'video' ? item.contentUrl : undefined,
        orderIndex: order++,
        duration: durationValue ? (Number.isNaN(durationValue) ? null : durationValue) : null,
        contentType: item.type,
        isRequired: item.isRequired ?? true,
        metadata,
      });
    }
  }
  return lessons;
};

export const getAllCourses = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { limit = 10, offset = 0, category, level, includeAll } = req.query;
    
    const courses = await courseService.getAllCourses(
      parseInt(limit as string),
      parseInt(offset as string),
      category as string,
      level as string,
      includeAll === 'true'
    );

    res.status(200).json({
      success: true,
      data: courses,
      message: 'Courses retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve courses',
    });
  }
};

export const getCourseById = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    
    const course = await courseService.getCourseById(parseInt(id));

    res.status(200).json({
      success: true,
      data: course,
      message: 'Course retrieved successfully',
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Course not found',
    });
  }
};

export const createCourse = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { curriculum, ...courseData } = req.body as any;
    
    const course = await courseService.createCourse(courseData);

    if (Array.isArray(curriculum) && curriculum.length > 0) {
      const lessons = buildLessonsFromCurriculum(curriculum);
      await lessonService.createBulk(course.id, lessons);
    }

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create course',
    });
  }
};

export const updateCourse = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const { curriculum, ...courseData } = req.body as any;
    
    const course = await courseService.updateCourse(parseInt(id), courseData);
    if (Array.isArray(curriculum)) {
      const lessons = buildLessonsFromCurriculum(curriculum);
      await lessonService.replaceCourseLessons(parseInt(id), lessons);
    }

    res.status(200).json({
      success: true,
      data: course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Course not found',
    });
  }
};

export const deleteCourse = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    
    const result = await courseService.deleteCourse(parseInt(id));

    res.status(200).json({
      success: true,
      data: result,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Course not found',
    });
  }
};
