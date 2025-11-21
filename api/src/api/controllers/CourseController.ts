import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService.js';
import { LessonService } from '../services/LessonService.js';
import { ApiResponse } from '../types/index.js';

const courseService = new CourseService();
const lessonService = new LessonService();

export const getAllCourses = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { limit = 10, offset = 0, category, level } = req.query;
    
    const courses = await courseService.getAllCourses(
      parseInt(limit as string),
      parseInt(offset as string),
      category as string,
      level as string
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
      const lessons = [] as any[];
      let order = 0;
      for (const unit of curriculum) {
        const unitTitle = unit.title;
        for (const item of (unit.items || [])) {
          lessons.push({
            title: item.title,
            unitTitle,
            content: item.type === 'text' ? item.textContent : undefined,
            videoUrl: item.type === 'video' ? item.contentUrl : undefined,
            orderIndex: order++,
            duration: item.duration ? parseInt(item.duration) || null : null,
            contentType: item.type,
            isRequired: item.isRequired ?? true,
          });
        }
      }
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
    const courseData = req.body;
    
    const course = await courseService.updateCourse(parseInt(id), courseData);

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