import React, { useState } from 'react';
import { Quiz, QuizQuestion, QuestionType } from '../../types/quiz.types';
import * as Accordion from '@radix-ui/react-accordion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus,
    GripVertical,
    Edit,
    Copy,
    Trash2,
    Eye,
    ChevronDown,
    CheckCircle2,
    Circle,
    HelpCircle,
    FileText,
    Type,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface QuizEditorProps {
    quiz: Quiz;
    onChange: (quiz: Quiz) => void;
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
    'multiple-choice': <CheckCircle2 className="w-4 h-4" />,
    'multiple-select': <Circle className="w-4 h-4" />,
    'true-false': <HelpCircle className="w-4 h-4" />,
    'open-ended': <FileText className="w-4 h-4" />,
    'fill-blanks': <Type className="w-4 h-4" />,
};

const questionTypeLabels: Record<QuestionType, string> = {
    'multiple-choice': 'Çoktan Seçmeli',
    'multiple-select': 'Çoklu Seçim',
    'true-false': 'Doğru/Yanlış',
    'open-ended': 'Açık Uçlu',
    'fill-blanks': 'Boşluk Doldurma',
};

interface SortableQuestionItemProps {
    question: QuizQuestion;
    index: number;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onPreview: () => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
    question,
    index,
    onEdit,
    onDuplicate,
    onDelete,
    onPreview,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Accordion.Item value={question.id} ref={setNodeRef} style={style}>
            <div
                className={cn(
                    'border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 mb-2',
                    isDragging && 'opacity-50 shadow-lg'
                )}
            >
                <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors group">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <GripVertical className="w-5 h-5" />
                        </div>

                        <div className={cn('p-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300')}>
                            {questionTypeIcons[question.type]}
                        </div>

                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    Soru {index + 1}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                    {questionTypeLabels[question.type]}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                    {question.points} puan
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {question.text || 'Soru metni girilmemiş'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview();
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Önizle"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate();
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Kopyala"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                        </div>
                    </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Düzenle
                    </button>
                </Accordion.Content>
            </div>
        </Accordion.Item>
    );
};

export const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onChange }) => {
    const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = quiz.questions.findIndex((q) => q.id === active.id);
            const newIndex = quiz.questions.findIndex((q) => q.id === over.id);

            const newQuestions = arrayMove(quiz.questions, oldIndex, newIndex).map(
                (q, index) => ({ ...q, orderIndex: index })
            );

            onChange({ ...quiz, questions: newQuestions });
            toast.success('Soru sıralaması güncellendi');
        }
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: QuizQuestion = {
            id: crypto.randomUUID(),
            type,
            text: '',
            points: 1,
            orderIndex: quiz.questions.length,
            options: type === 'multiple-choice' || type === 'multiple-select'
                ? [
                    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 0 },
                    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 1 },
                    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 2 },
                    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 3 },
                ]
                : type === 'true-false'
                    ? [
                        { id: crypto.randomUUID(), text: 'Doğru', isCorrect: false, orderIndex: 0 },
                        { id: crypto.randomUUID(), text: 'Yanlış', isCorrect: false, orderIndex: 1 },
                    ]
                    : undefined,
        };

        onChange({ ...quiz, questions: [...quiz.questions, newQuestion] });
        setExpandedQuestions([...expandedQuestions, newQuestion.id]);
        toast.success('Yeni soru eklendi');
    };

    const duplicateQuestion = (questionId: string) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        if (!question) return;

        const newQuestion: QuizQuestion = {
            ...question,
            id: crypto.randomUUID(),
            orderIndex: quiz.questions.length,
            options: question.options?.map((opt) => ({
                ...opt,
                id: crypto.randomUUID(),
            })),
        };

        onChange({ ...quiz, questions: [...quiz.questions, newQuestion] });
        toast.success('Soru kopyalandı');
    };

    const deleteQuestion = (questionId: string) => {
        if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;

        const newQuestions = quiz.questions
            .filter((q) => q.id !== questionId)
            .map((q, index) => ({ ...q, orderIndex: index }));

        onChange({ ...quiz, questions: newQuestions });
        toast.success('Soru silindi');
    };

    const previewQuestion = (questionId: string) => {
        // TODO: Implement preview modal
        toast.info('Önizleme özelliği yakında eklenecek');
    };

    return (
        <div className="space-y-6">
            {/* Quiz Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quiz Ayarları
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Süre Limiti (dakika)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={quiz.timeLimit || ''}
                            onChange={(e) =>
                                onChange({ ...quiz, timeLimit: e.target.value ? Number(e.target.value) : null })
                            }
                            placeholder="Süre limiti yok"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Geçme Notu (%)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={quiz.passingScore}
                            onChange={(e) =>
                                onChange({ ...quiz, passingScore: Math.min(100, Math.max(0, Number(e.target.value))) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quiz.shuffleQuestions}
                            onChange={(e) => onChange({ ...quiz, shuffleQuestions: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Soruları karıştır
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quiz.shuffleOptions}
                            onChange={(e) => onChange({ ...quiz, shuffleOptions: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Seçenekleri karıştır
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quiz.showCorrectAnswers}
                            onChange={(e) => onChange({ ...quiz, showCorrectAnswers: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Doğru cevapları göster
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quiz.allowRetry}
                            onChange={(e) => onChange({ ...quiz, allowRetry: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Tekrar denemeye izin ver
                        </span>
                    </label>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Sorular ({quiz.questions.length})
                    </h3>
                </div>

                {quiz.questions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Henüz soru eklenmemiş
                        </p>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={quiz.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                            <Accordion.Root
                                type="multiple"
                                value={expandedQuestions}
                                onValueChange={setExpandedQuestions}
                            >
                                {quiz.questions.map((question, index) => (
                                    <SortableQuestionItem
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        onEdit={() => {/* TODO: Open edit modal */ }}
                                        onDuplicate={() => duplicateQuestion(question.id)}
                                        onDelete={() => deleteQuestion(question.id)}
                                        onPreview={() => previewQuestion(question.id)}
                                    />
                                ))}
                            </Accordion.Root>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Add Question Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addQuestion(type)}
                            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                {questionTypeIcons[type]}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                {questionTypeLabels[type]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
