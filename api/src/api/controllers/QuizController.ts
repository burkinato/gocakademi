import { Request, Response } from 'express';
import { QuizService } from '../../application/services/QuizService.js';

export class QuizController {
    private quizService: QuizService;

    constructor() {
        this.quizService = new QuizService();
    }

    // Create a new quiz
    createQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const quizData = req.body;
            const quiz = await this.quizService.createQuiz(quizData);
            res.status(201).json({ success: true, data: quiz });
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Get quiz by ID
    getQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const quiz = await this.quizService.getQuizById(Number(id));

            if (!quiz) {
                res.status(404).json({ success: false, error: 'Quiz not found' });
                return;
            }

            res.status(200).json({ success: true, data: quiz });
        } catch (error: any) {
            console.error('Error getting quiz:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Update quiz
    updateQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const quizData = req.body;
            const quiz = await this.quizService.updateQuiz(Number(id), quizData);
            res.status(200).json({ success: true, data: quiz });
        } catch (error: any) {
            console.error('Error updating quiz:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Delete quiz
    deleteQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.quizService.deleteQuiz(Number(id));
            res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting quiz:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Add question to quiz
    addQuestion = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const questionData = req.body;
            const question = await this.quizService.addQuestion(Number(id), questionData);
            res.status(201).json({ success: true, data: question });
        } catch (error: any) {
            console.error('Error adding question:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Update question
    updateQuestion = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, questionId } = req.params;
            const questionData = req.body;
            const question = await this.quizService.updateQuestion(
                Number(id),
                Number(questionId),
                questionData
            );
            res.status(200).json({ success: true, data: question });
        } catch (error: any) {
            console.error('Error updating question:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Delete question
    deleteQuestion = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, questionId } = req.params;
            await this.quizService.deleteQuestion(Number(id), Number(questionId));
            res.status(200).json({ success: true, message: 'Question deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting question:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Reorder questions
    reorderQuestions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { questionIds } = req.body; // Array of question IDs in new order
            await this.quizService.reorderQuestions(Number(id), questionIds);
            res.status(200).json({ success: true, message: 'Questions reordered successfully' });
        } catch (error: any) {
            console.error('Error reordering questions:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Submit quiz attempt
    submitQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { answers, timeSpent } = req.body;
            const userId = (req as any).user?.id; // Assuming auth middleware sets user

            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return;
            }

            const result = await this.quizService.submitQuiz(Number(id), userId, answers, timeSpent);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Get quiz results
    getResults = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, attemptId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return;
            }

            const results = await this.quizService.getResults(Number(attemptId), userId);

            if (!results) {
                res.status(404).json({ success: false, error: 'Results not found' });
                return;
            }

            res.status(200).json({ success: true, data: results });
        } catch (error: any) {
            console.error('Error getting results:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Get all attempts for a quiz
    getAttempts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return;
            }

            const attempts = await this.quizService.getAttempts(Number(id), userId);
            res.status(200).json({ success: true, data: attempts });
        } catch (error: any) {
            console.error('Error getting attempts:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };
}
