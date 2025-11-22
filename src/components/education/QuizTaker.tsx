import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizQuestion, QuizAttempt } from '../../types/quiz.types';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';

interface QuizTakerProps {
    quiz: Quiz;
    onSubmit: (answers: Record<string, any>) => Promise<void>;
    onExit?: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onSubmit, onExit }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(
        quiz.timeLimit ? quiz.timeLimit * 60 : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [startTime] = useState(new Date());

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Auto-save to localStorage
    useEffect(() => {
        const interval = setInterval(() => {
            localStorage.setItem(`quiz-${quiz.id}-answers`, JSON.stringify(answers));
            localStorage.setItem(`quiz-${quiz.id}-time`, timeRemaining?.toString() || '');
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [quiz.id, answers, timeRemaining]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining === null) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 0) {
                    handleSubmit();
                    return 0;
                }

                // Warning at 5 minutes
                if (prev === 300) {
                    toast.error('5 dakika kaldı!', { duration: 5000 });
                }
                // Warning at 1 minute
                if (prev === 60) {
                    toast.error('1 dakika kaldı!', { duration: 5000 });
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setShowSubmitDialog(false);
        setIsSubmitting(true);

        try {
            await onSubmit(answers);
            localStorage.removeItem(`quiz-${quiz.id}-answers`);
            localStorage.removeItem(`quiz-${quiz.id}-time`);
            toast.success('Quiz başarıyla gönderildi');
        } catch (error) {
            toast.error('Quiz gönderilirken hata oluştu');
            setIsSubmitting(false);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / quiz.questions.length) * 100;

    const renderQuestion = (question: QuizQuestion) => {
        const answer = answers[question.id];

        switch (question.type) {
            case 'multiple-choice':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.id}
                                className={cn(
                                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                                    answer === option.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option.id}
                                    checked={answer === option.id}
                                    onChange={() => handleAnswerChange(question.id, option.id)}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-gray-900 dark:text-white">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'multiple-select':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.id}
                                className={cn(
                                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                                    answer?.includes(option.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="checkbox"
                                    value={option.id}
                                    checked={answer?.includes(option.id) || false}
                                    onChange={(e) => {
                                        const currentAnswers = answer || [];
                                        if (e.target.checked) {
                                            handleAnswerChange(question.id, [...currentAnswers, option.id]);
                                        } else {
                                            handleAnswerChange(
                                                question.id,
                                                currentAnswers.filter((id: string) => id !== option.id)
                                            );
                                        }
                                    }}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <span className="text-gray-900 dark:text-white">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'true-false':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.id}
                                className={cn(
                                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                                    answer === option.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option.id}
                                    checked={answer === option.id}
                                    onChange={() => handleAnswerChange(question.id, option.id)}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-gray-900 dark:text-white">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'open-ended':
                return (
                    <textarea
                        value={answer || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Cevabınızı buraya yazın..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                );

            case 'fill-blanks':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {question.text}
                        </p>
                        <input
                            type="text"
                            value={answer || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Cevabınızı buraya yazın..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {quiz.title}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Soru {currentQuestionIndex + 1} / {quiz.questions.length}
                            </p>
                        </div>

                        {timeRemaining !== null && (
                            <div
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
                                    timeRemaining <= 60
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : timeRemaining <= 300
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                )}
                            >
                                <Clock className="w-5 h-5" />
                                {formatTime(timeRemaining)}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {answeredCount} / {quiz.questions.length} soru cevaplanmış
                        </p>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6"
                    >
                        {/* Question Text */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {currentQuestion.text}
                                </h2>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-4 whitespace-nowrap">
                                    {currentQuestion.points} puan
                                </span>
                            </div>

                            {currentQuestion.media && (
                                <div className="mb-4">
                                    {currentQuestion.media.type === 'image' ? (
                                        <img
                                            src={currentQuestion.media.url}
                                            alt="Soru görseli"
                                            className="max-w-full h-auto rounded-lg"
                                        />
                                    ) : (
                                        <video
                                            src={currentQuestion.media.url}
                                            controls
                                            className="max-w-full h-auto rounded-lg"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Answer Options */}
                        {renderQuestion(currentQuestion)}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Önceki
                    </button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button
                            onClick={() => setShowSubmitDialog(true)}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Flag className="w-4 h-4" />
                            Tamamla
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Sonraki
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <Dialog.Root open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Quiz'i Tamamla
                        </Dialog.Title>
                        <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                            <div className="space-y-2">
                                <p>Quiz'i göndermek istediğinizden emin misiniz?</p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-300">
                                        <strong>{answeredCount}</strong> / {quiz.questions.length} soru cevaplanmış
                                    </p>
                                    {answeredCount < quiz.questions.length && (
                                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                {quiz.questions.length - answeredCount} soru cevaplanmamış. Boş bırakılan sorular yanlış sayılacaktır.
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Dialog.Description>
                        <div className="flex gap-3">
                            <Dialog.Close asChild>
                                <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    İptal
                                </button>
                            </Dialog.Close>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
};
