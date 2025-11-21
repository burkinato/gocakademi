import { Router } from 'express';
import { EducationController } from '../controllers/EducationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const educationController = new EducationController();

// All education routes require authentication
router.use(authenticateToken);

// ============================================
// Unit Routes
// ============================================

router.get('/courses/:courseId/units', educationController.getUnitsByCourse);
router.get('/units/:id', educationController.getUnit);
router.post('/units', educationController.createUnit);
router.put('/units/:id', educationController.updateUnit);
router.delete('/units/:id', educationController.deleteUnit);
router.post('/units/reorder', educationController.reorderUnits);

// ============================================
// Topic Routes
// ============================================

router.get('/units/:unitId/topics', educationController.getTopicsByUnit);
router.get('/topics/:id', educationController.getTopic);
router.post('/topics', educationController.createTopic);
router.put('/topics/:id', educationController.updateTopic);
router.delete('/topics/:id', educationController.deleteTopic);
router.post('/units/:unitId/topics/reorder', educationController.reorderTopics);

// ============================================
// Assessment Routes
// ============================================

router.get('/units/:unitId/assessments', educationController.getAssessmentsByUnit);
router.get('/assessments/:id', educationController.getAssessment);
router.post('/assessments', educationController.createAssessment);
router.put('/assessments/:id', educationController.updateAssessment);
router.delete('/assessments/:id', educationController.deleteAssessment);

// ============================================
// Question Routes
// ============================================

router.get('/assessments/:assessmentId/questions', educationController.getQuestionsByAssessment);
router.get('/questions/:id', educationController.getQuestion);
router.post('/questions', educationController.createQuestion);
router.put('/questions/:id', educationController.updateQuestion);
router.delete('/questions/:id', educationController.deleteQuestion);
router.post('/assessments/:assessmentId/questions/reorder', educationController.reorderQuestions);

// ============================================
// Progress Tracking Routes
// ============================================

router.get('/courses/:courseId/progress', educationController.getCourseProgress);
router.post('/courses/:courseId/enroll', educationController.enrollCourse);
router.post('/topics/:topicId/progress', educationController.updateTopicProgress);
router.post('/assessments/:assessmentId/submit', educationController.submitAssessment);
router.get('/assessments/:assessmentId/results', educationController.getAssessmentResults);

export default router;
