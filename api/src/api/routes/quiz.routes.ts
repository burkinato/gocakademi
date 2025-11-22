import { Router } from 'express';
import { QuizController } from '../controllers/QuizController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const quizController = new QuizController();

// Quiz CRUD
router.post('/', authMiddleware, quizController.createQuiz);
router.get('/:id', authMiddleware, quizController.getQuiz);
router.put('/:id', authMiddleware, quizController.updateQuiz);
router.delete('/:id', authMiddleware, quizController.deleteQuiz);

// Question management
router.post('/:id/questions', authMiddleware, quizController.addQuestion);
router.put('/:id/questions/:questionId', authMiddleware, quizController.updateQuestion);
router.delete('/:id/questions/:questionId', authMiddleware, quizController.deleteQuestion);
router.post('/:id/questions/reorder', authMiddleware, quizController.reorderQuestions);

// Quiz taking
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);
router.get('/:id/results/:attemptId', authMiddleware, quizController.getResults);
router.get('/:id/attempts', authMiddleware, quizController.getAttempts);

export default router;
