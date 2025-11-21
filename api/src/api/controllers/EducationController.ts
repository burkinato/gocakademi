import { Request, Response } from 'express';
import { UnitRepository } from '../../infrastructure/repositories/UnitRepository.js';
import { TopicRepository } from '../../infrastructure/repositories/TopicRepository.js';
import { AssessmentRepository } from '../../infrastructure/repositories/AssessmentRepository.js';
import { QuestionRepository } from '../../infrastructure/repositories/QuestionRepository.js';
import { ProgressRepository } from '../../infrastructure/repositories/ProgressRepository.js';

export class EducationController {
    private unitRepo: UnitRepository;
    private topicRepo: TopicRepository;
    private assessmentRepo: AssessmentRepository;
    private questionRepo: QuestionRepository;
    private progressRepo: ProgressRepository;

    constructor() {
        this.unitRepo = new UnitRepository();
        this.topicRepo = new TopicRepository();
        this.assessmentRepo = new AssessmentRepository();
        this.questionRepo = new QuestionRepository();
        this.progressRepo = new ProgressRepository();
    }

    // ============================================
    // Unit Management
    // ============================================

    getUnitsByCourse = async (req: Request, res: Response) => {
        try {
            const courseId = parseInt(req.params.courseId);
            const units = await this.unitRepo.findByCourseId(courseId);

            res.json({ success: true, data: units });
        } catch (error) {
            console.error('Error fetching units:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch units' });
        }
    };

    getUnit = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const unit = await this.unitRepo.findById(id);

            if (!unit) {
                return res.status(404).json({ success: false, error: 'Unit not found' });
            }

            res.json({ success: true, data: unit });
        } catch (error) {
            console.error('Error fetching unit:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch unit' });
        }
    };

    createUnit = async (req: Request, res: Response) => {
        try {
            const unit = await this.unitRepo.create(req.body);
            res.status(201).json({ success: true, data: unit });
        } catch (error) {
            console.error('Error creating unit:', error);
            res.status(500).json({ success: false, error: 'Failed to create unit' });
        }
    };

    updateUnit = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const unit = await this.unitRepo.update(id, req.body);

            if (!unit) {
                return res.status(404).json({ success: false, error: 'Unit not found' });
            }

            res.json({ success: true, data: unit });
        } catch (error) {
            console.error('Error updating unit:', error);
            res.status(500).json({ success: false, error: 'Failed to update unit' });
        }
    };

    deleteUnit = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.unitRepo.delete(id);

            if (!success) {
                return res.status(404).json({ success: false, error: 'Unit not found' });
            }

            res.json({ success: true, message: 'Unit deleted successfully' });
        } catch (error) {
            console.error('Error deleting unit:', error);
            res.status(500).json({ success: false, error: 'Failed to delete unit' });
        }
    };

    reorderUnits = async (req: Request, res: Response) => {
        try {
            const { items } = req.body; // Array of { id, orderIndex }
            await this.unitRepo.reorder(items);

            res.json({ success: true, message: 'Units reordered successfully' });
        } catch (error) {
            console.error('Error reordering units:', error);
            res.status(500).json({ success: false, error: 'Failed to reorder units' });
        }
    };

    // ============================================
    // Topic Management
    // ============================================

    getTopicsByUnit = async (req: Request, res: Response) => {
        try {
            const unitId = parseInt(req.params.unitId);
            const topics = await this.topicRepo.findByUnitId(unitId);

            res.json({ success: true, data: topics });
        } catch (error) {
            console.error('Error fetching topics:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch topics' });
        }
    };

    getTopic = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const topic = await this.topicRepo.findById(id);

            if (!topic) {
                return res.status(404).json({ success: false, error: 'Topic not found' });
            }

            res.json({ success: true, data: topic });
        } catch (error) {
            console.error('Error fetching topic:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch topic' });
        }
    };

    createTopic = async (req: Request, res: Response) => {
        try {
            const topic = await this.topicRepo.create(req.body);
            res.status(201).json({ success: true, data: topic });
        } catch (error) {
            console.error('Error creating topic:', error);
            res.status(500).json({ success: false, error: 'Failed to create topic' });
        }
    };

    updateTopic = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const topic = await this.topicRepo.update(id, req.body);

            if (!topic) {
                return res.status(404).json({ success: false, error: 'Topic not found' });
            }

            res.json({ success: true, data: topic });
        } catch (error) {
            console.error('Error updating topic:', error);
            res.status(500).json({ success: false, error: 'Failed to update topic' });
        }
    };

    deleteTopic = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.topicRepo.delete(id);

            if (!success) {
                return res.status(404).json({ success: false, error: 'Topic not found' });
            }

            res.json({ success: true, message: 'Topic deleted successfully' });
        } catch (error) {
            console.error('Error deleting topic:', error);
            res.status(500).json({ success: false, error: 'Failed to delete topic' });
        }
    };

    reorderTopics = async (req: Request, res: Response) => {
        try {
            const unitId = parseInt(req.params.unitId);
            const { items } = req.body;
            await this.topicRepo.reorder(unitId, items);

            res.json({ success: true, message: 'Topics reordered successfully' });
        } catch (error) {
            console.error('Error reordering topics:', error);
            res.status(500).json({ success: false, error: 'Failed to reorder topics' });
        }
    };

    // ============================================
    // Assessment Management
    // ============================================

    getAssessmentsByUnit = async (req: Request, res: Response) => {
        try {
            const unitId = parseInt(req.params.unitId);
            const assessments = await this.assessmentRepo.findByUnitId(unitId);

            res.json({ success: true, data: assessments });
        } catch (error) {
            console.error('Error fetching assessments:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
        }
    };

    getAssessment = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const includeQuestions = req.query.includeQuestions === 'true';

            const assessment = includeQuestions
                ? await this.assessmentRepo.findWithQuestions(id)
                : await this.assessmentRepo.findById(id);

            if (!assessment) {
                return res.status(404).json({ success: false, error: 'Assessment not found' });
            }

            res.json({ success: true, data: assessment });
        } catch (error) {
            console.error('Error fetching assessment:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch assessment' });
        }
    };

    createAssessment = async (req: Request, res: Response) => {
        try {
            const assessment = await this.assessmentRepo.create(req.body);
            res.status(201).json({ success: true, data: assessment });
        } catch (error) {
            console.error('Error creating assessment:', error);
            res.status(500).json({ success: false, error: 'Failed to create assessment' });
        }
    };

    updateAssessment = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const assessment = await this.assessmentRepo.update(id, req.body);

            if (!assessment) {
                return res.status(404).json({ success: false, error: 'Assessment not found' });
            }

            res.json({ success: true, data: assessment });
        } catch (error) {
            console.error('Error updating assessment:', error);
            res.status(500).json({ success: false, error: 'Failed to update assessment' });
        }
    };

    deleteAssessment = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.assessmentRepo.delete(id);

            if (!success) {
                return res.status(404).json({ success: false, error: 'Assessment not found' });
            }

            res.json({ success: true, message: 'Assessment deleted successfully' });
        } catch (error) {
            console.error('Error deleting assessment:', error);
            res.status(500).json({ success: false, error: 'Failed to delete assessment' });
        }
    };

    // ============================================
    // Question Management
    // ============================================

    getQuestionsByAssessment = async (req: Request, res: Response) => {
        try {
            const assessmentId = parseInt(req.params.assessmentId);
            const questions = await this.questionRepo.findByAssessmentId(assessmentId);

            res.json({ success: true, data: questions });
        } catch (error) {
            console.error('Error fetching questions:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch questions' });
        }
    };

    getQuestion = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const question = await this.questionRepo.findById(id);

            if (!question) {
                return res.status(404).json({ success: false, error: 'Question not found' });
            }

            res.json({ success: true, data: question });
        } catch (error) {
            console.error('Error fetching question:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch question' });
        }
    };

    createQuestion = async (req: Request, res: Response) => {
        try {
            const question = await this.questionRepo.create(req.body);
            res.status(201).json({ success: true, data: question });
        } catch (error) {
            console.error('Error creating question:', error);
            res.status(500).json({ success: false, error: 'Failed to create question' });
        }
    };

    updateQuestion = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const question = await this.questionRepo.update(id, req.body);

            if (!question) {
                return res.status(404).json({ success: false, error: 'Question not found' });
            }

            res.json({ success: true, data: question });
        } catch (error) {
            console.error('Error updating question:', error);
            res.status(500).json({ success: false, error: 'Failed to update question' });
        }
    };

    deleteQuestion = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.questionRepo.delete(id);

            if (!success) {
                return res.status(404).json({ success: false, error: 'Question not found' });
            }

            res.json({ success: true, message: 'Question deleted successfully' });
        } catch (error) {
            console.error('Error deleting question:', error);
            res.status(500).json({ success: false, error: 'Failed to delete question' });
        }
    };

    reorderQuestions = async (req: Request, res: Response) => {
        try {
            const assessmentId = parseInt(req.params.assessmentId);
            const { items } = req.body;
            await this.questionRepo.reorder(assessmentId, items);

            res.json({ success: true, message: 'Questions reordered successfully' });
        } catch (error) {
            console.error('Error reordering questions:', error);
            res.status(500).json({ success: false, error: 'Failed to reorder questions' });
        }
    };

    // ============================================
    // Progress Tracking
    // ============================================

    getCourseProgress = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id; // From auth middleware
            const courseId = parseInt(req.params.courseId);

            const progress = await this.progressRepo.getStudentCourseProgress(userId, courseId);

            if (!progress) {
                return res.status(404).json({ success: false, error: 'Progress not found' });
            }

            res.json({ success: true, data: progress });
        } catch (error) {
            console.error('Error fetching progress:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch progress' });
        }
    };

    enrollCourse = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const courseId = parseInt(req.params.courseId);

            const enrollment = await this.progressRepo.enrollStudent(userId, courseId);

            res.status(201).json({ success: true, data: enrollment });
        } catch (error) {
            console.error('Error enrolling in course:', error);
            res.status(500).json({ success: false, error: 'Failed to enroll in course' });
        }
    };

    updateTopicProgress = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const topicId = parseInt(req.params.topicId);
            const { status, watchedDuration } = req.body;

            const progress = await this.progressRepo.updateTopicProgress(userId, topicId, {
                status,
                watchedDuration
            });

            res.json({ success: true, data: progress });
        } catch (error) {
            console.error('Error updating topic progress:', error);
            res.status(500).json({ success: false, error: 'Failed to update topic progress' });
        }
    };

    submitAssessment = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const assessmentId = parseInt(req.params.assessmentId);
            const { answers, startedAt, submittedAt } = req.body;

            const result = await this.progressRepo.submitAssessment({
                userId,
                assessmentId,
                answers,
                startedAt: new Date(startedAt),
                submittedAt: new Date(submittedAt)
            });

            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error submitting assessment:', error);
            res.status(500).json({ success: false, error: 'Failed to submit assessment' });
        }
    };

    getAssessmentResults = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const assessmentId = parseInt(req.params.assessmentId);

            const results = await this.progressRepo.getAssessmentResults(userId, assessmentId);

            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching assessment results:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch assessment results' });
        }
    };
}
