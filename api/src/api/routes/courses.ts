import { Router } from 'express';
import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } from '../controllers/CourseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { LessonService } from '../services/LessonService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
const lessonService = new LessonService();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes (require admin)
router.post('/', authMiddleware, createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

// Lessons API
router.get('/:id/lessons', async (req, res) => {
  try {
    const lessons = await lessonService.getByCourse(parseInt(req.params.id));
    res.json({ success: true, data: lessons });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/:id/lessons', authMiddleware, async (req, res) => {
  try {
    const { lessons } = req.body;
    const result = await lessonService.createBulk(parseInt(req.params.id), Array.isArray(lessons) ? lessons : []);
    res.status(201).json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;
import { AssessmentService } from '../services/AssessmentService.js';
const assessmentService = new AssessmentService();
// Assessments API
router.get('/:id/assessments', async (req, res) => {
  try {
    const data = await assessmentService.getByCourse(parseInt(req.params.id));
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/:id/assessments', authMiddleware, async (req, res) => {
  try {
    const { unitTitle, isOptional } = req.body;
    const data = await assessmentService.create(parseInt(req.params.id), unitTitle, !!isOptional);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/assessments/:assessmentId/questions', authMiddleware, async (req, res) => {
  try {
    const data = await assessmentService.addQuestion(parseInt(req.params.assessmentId), req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/assessments/:assessmentId/submit', async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const data = await assessmentService.submit(parseInt(req.params.assessmentId), userId, answers || {});
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});