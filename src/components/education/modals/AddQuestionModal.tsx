import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal';
import { FormField } from '../../shared/FormField';
import { Button } from '../../shared/Button';
import { Question, QuestionType, QuestionOption, CreateQuestionDto, UpdateQuestionDto } from '../../../types/education.types';
import { toast } from 'react-hot-toast';

interface AddQuestionModalProps {
    assessmentId: number;
    question?: Question | null;
    onClose: () => void;
    onSuccess: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
    { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
    { value: 'true_false', label: 'Doğru/Yanlış' },
    { value: 'short_answer', label: 'Kısa Cevap' },
    { value: 'essay', label: 'Uzun Cevap (Essay)' },
    { value: 'matching', label: 'Eşleştirme' },
    { value: 'fill_blank', label: 'Boşluk Doldurma' }
];

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
    assessmentId,
    question,
    onClose,
    onSuccess
}) => {
    const isEditMode = !!question;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        questionType: 'multiple_choice' as QuestionType,
        questionText: '',
        points: 1,
        explanation: ''
    });
    const [options, setOptions] = useState<QuestionOption[]>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
    ]);
    const [correctAnswer, setCorrectAnswer] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (question) {
            setFormData({
                questionType: question.questionType,
                questionText: question.questionText,
                points: question.points,
                explanation: question.explanation || ''
            });

            if (question.options) {
                setOptions(question.options);
            }

            if (typeof question.correctAnswer === 'string') {
                setCorrectAnswer(question.correctAnswer);
            }
        }
    }, [question]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.questionText.trim()) {
            newErrors.questionText = 'Soru metni gereklidir';
        }

        if (formData.points <= 0) {
            newErrors.points = 'Puan 0\'dan büyük olmalıdır';
        }

        // Question type specific validation
        if (formData.questionType === 'multiple_choice') {
            const validOptions = options.filter(opt => opt.text.trim());
            if (validOptions.length < 2) {
                newErrors.options = 'En az 2 seçenek gereklidir';
            }
            if (!options.some(opt => opt.isCorrect)) {
                newErrors.options = 'En az bir doğru cevap seçmelisiniz';
            }
        }

        if ((formData.questionType === 'short_answer' || formData.questionType === 'fill_blank') && !correctAnswer.trim()) {
            newErrors.correctAnswer = 'Doğru cevap gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, text } : opt
        ));
    };

    const handleCorrectToggle = (id: string) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ));
    };

    const handleAddOption = () => {
        const newId = (Math.max(...options.map(o => parseInt(o.id))) + 1).toString();
        setOptions([...options, { id: newId, text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (id: string) => {
        if (options.length > 2) {
            setOptions(options.filter(opt => opt.id !== id));
        } else {
            toast.error('En az 2 seçenek olmalıdır');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Lütfen formu kontrol edin');
            return;
        }

        setLoading(true);

        try {
            // Prepare correct answer based on question type
            let finalCorrectAnswer: string | string[] | undefined;
            let finalOptions: Omit<QuestionOption, 'id'>[] | undefined;

            switch (formData.questionType) {
                case 'multiple_choice':
                    finalOptions = options.filter(opt => opt.text.trim()).map(({ id, ...rest }) => rest);
                    finalCorrectAnswer = options.filter(opt => opt.isCorrect).map(opt => opt.id);
                    break;
                case 'true_false':
                    finalOptions = [
                        { text: 'Doğru', isCorrect: correctAnswer === 'true' },
                        { text: 'Yanlış', isCorrect: correctAnswer === 'false' }
                    ];
                    finalCorrectAnswer = correctAnswer;
                    break;
                case 'short_answer':
                case 'fill_blank':
                    finalCorrectAnswer = correctAnswer;
                    break;
                case 'essay':
                    // Essays don't have predefined correct answers
                    break;
                case 'matching':
                    finalOptions = options.filter(opt => opt.text.trim()).map(({ id, ...rest }) => rest);
                    // Matching logic would be more complex
                    break;
            }

            if (isEditMode && question) {
                // Update existing question
                const updateData: UpdateQuestionDto = {
                    questionType: formData.questionType,
                    questionText: formData.questionText,
                    points: formData.points,
                    options: finalOptions,
                    correctAnswer: finalCorrectAnswer,
                    explanation: formData.explanation || undefined
                };

                // TODO: API call
                // await apiClient.updateQuestion(question.id, updateData);
                console.log('Update question:', question.id, updateData);
                toast.success('Soru güncellendi');
            } else {
                // Create new question
                const createData: CreateQuestionDto = {
                    assessmentId,
                    questionType: formData.questionType,
                    questionText: formData.questionText,
                    points: formData.points,
                    options: finalOptions,
                    correctAnswer: finalCorrectAnswer,
                    explanation: formData.explanation || undefined
                };

                // TODO: API call
                // await apiClient.createQuestion(createData);
                console.log('Create question:', createData);
                toast.success('Soru oluşturuldu');
            }

            onSuccess();
        } catch (error) {
            console.error('Question save error:', error);
            toast.error(isEditMode ? 'Soru güncellenemedi' : 'Soru oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    const renderQuestionTypeInput = () => {
        switch (formData.questionType) {
            case 'multiple_choice':
                return (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Seçenekler
                            </label>
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Seçenek Ekle
                            </button>
                        </div>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 min-w-[2rem]">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={`Seçenek ${index + 1}`}
                                    />
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={() => handleCorrectToggle(option.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                                        title="Doğru cevap"
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(option.id)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.options && (
                            <p className="text-sm text-red-600 mt-1">{errors.options}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            ✓ işaretli seçenekler doğru cevaptır
                        </p>
                    </div>
                );

            case 'true_false':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Doğru Cevap
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                <input
                                    type="radio"
                                    value="true"
                                    checked={correctAnswer === 'true'}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                                />
                                <span className="font-medium">Doğru</span>
                            </label>
                            <label className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                <input
                                    type="radio"
                                    value="false"
                                    checked={correctAnswer === 'false'}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                                />
                                <span className="font-medium">Yanlış</span>
                            </label>
                        </div>
                    </div>
                );

            case 'short_answer':
            case 'fill_blank':
                return (
                    <FormField
                        label="Doğru Cevap"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        error={errors.correctAnswer}
                        required
                        placeholder="Doğru cevabı girin"
                    />
                );

            case 'essay':
                return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Essay tipi sorular manuel olarak değerlendirilir
                        </p>
                    </div>
                );

            case 'matching':
                return (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Eşleştirme soruları için gelişmiş düzenleyici geliştirme aşamasındadır
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isEditMode ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Soru Tipi
                    </label>
                    <select
                        value={formData.questionType}
                        onChange={(e) => setFormData({ ...formData, questionType: e.target.value as QuestionType })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    >
                        {QUESTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Soru Metni *
                    </label>
                    <textarea
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Sorunuzu buraya yazın..."
                    />
                    {errors.questionText && (
                        <p className="text-sm text-red-600 mt-1">{errors.questionText}</p>
                    )}
                </div>

                {/* Points */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Puan
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                        className="w-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                </div>

                {/* Question Type Specific Input */}
                {renderQuestionTypeInput()}

                {/* Explanation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Açıklama (isteğe bağlı)
                    </label>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Cevap sonrası gösterilecek açıklama..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                    >
                        {isEditMode ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
