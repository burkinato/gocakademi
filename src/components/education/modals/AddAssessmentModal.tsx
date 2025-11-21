import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal';
import { FormField } from '../../shared/FormField';
import { Button } from '../../shared/Button';
import { Assessment, AccessLevel, CreateAssessmentDto, UpdateAssessmentDto, Question } from '../../../types/education.types';
import { toast } from 'react-hot-toast';
import { AddQuestionModal } from './AddQuestionModal';

interface AddAssessmentModalProps {
    unitId: number;
    assessment?: Assessment | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({
    unitId,
    assessment,
    onClose,
    onSuccess
}) => {
    const isEditMode = !!assessment;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isRequired: true,
        passingScore: 70,
        timeLimit: 0, // 0 means no limit
        maxAttempts: 0, //0 means unlimited
        showCorrectAnswers: false,
        shuffleQuestions: false,
        accessLevel: 'free' as AccessLevel
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Questions management (for edit mode)
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    useEffect(() => {
        if (assessment) {
            setFormData({
                title: assessment.title,
                description: assessment.description || '',
                isRequired: assessment.isRequired,
                passingScore: assessment.passingScore,
                timeLimit: assessment.timeLimit || 0,
                maxAttempts: assessment.maxAttempts || 0,
                showCorrectAnswers: assessment.showCorrectAnswers,
                shuffleQuestions: assessment.shuffleQuestions,
                accessLevel: assessment.accessLevel
            });

            // TODO: Load questions for this assessment
            // const loadedQuestions = await apiClient.getQuestions(assessment.id);
            // setQuestions(loadedQuestions);
        }
    }, [assessment]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Değerlendirme başlığı gereklidir';
        }

        if (formData.title.length > 255) {
            newErrors.title = 'Başlık çok uzun (max 255 karakter)';
        }

        if (formData.passingScore < 0 || formData.passingScore > 100) {
            newErrors.passingScore = 'Geçme notu 0-100 arasında olmalıdır';
        }

        if (formData.timeLimit < 0) {
            newErrors.timeLimit = 'Süre sınırı negatif olamaz';
        }

        if (formData.maxAttempts < 0) {
            newErrors.maxAttempts = 'Deneme sayısı negatif olamaz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Lütfen formu kontrol edin');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && assessment) {
                // Update existing assessment
                const updateData: UpdateAssessmentDto = {
                    title: formData.title,
                    description: formData.description || undefined,
                    isRequired: formData.isRequired,
                    passingScore: formData.passingScore,
                    timeLimit: formData.timeLimit || undefined,
                    maxAttempts: formData.maxAttempts || undefined,
                    showCorrectAnswers: formData.showCorrectAnswers,
                    shuffleQuestions: formData.shuffleQuestions,
                    accessLevel: formData.accessLevel
                };

                // TODO: API call
                // await apiClient.updateAssessment(assessment.id, updateData);
                console.log('Update assessment:', assessment.id, updateData);
                toast.success('Değerlendirme güncellendi');
            } else {
                // Create new assessment
                const createData: CreateAssessmentDto = {
                    unitId,
                    title: formData.title,
                    description: formData.description || undefined,
                    isRequired: formData.isRequired,
                    passingScore: formData.passingScore,
                    timeLimit: formData.timeLimit || undefined,
                    maxAttempts: formData.maxAttempts || undefined,
                    showCorrectAnswers: formData.showCorrectAnswers,
                    shuffleQuestions: formData.shuffleQuestions,
                    accessLevel: formData.accessLevel
                };

                // TODO: API call
                // await apiClient.createAssessment(createData);
                console.log('Create assessment:', createData);
                toast.success('Değerlendirme oluşturuldu');
            }

            onSuccess();
        } catch (error) {
            console.error('Assessment save error:', error);
            toast.error(isEditMode ? 'Değerlendirme güncellenemedi' : 'Değerlendirme oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setShowAddQuestionModal(true);
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setShowAddQuestionModal(true);
    };

    const handleDeleteQuestion = (questionId: number) => {
        // TODO: Implement delete confirmation
        console.log('Delete question:', questionId);
    };

    const handleQuestionSaved = () => {
        setShowAddQuestionModal(false);
        setEditingQuestion(null);
        // TODO: Reload questions
    };

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                title={isEditMode ? 'Değerlendirmeyi Düzenle' : 'Yeni Değerlendirme Ekle'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <FormField
                        label="Değerlendirme Başlığı"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        error={errors.title}
                        required
                        placeholder="Örn: Ünite 1 Quiz"
                    />

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Açıklama
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="Değerlendirme hakkında kısa açıklama..."
                        />
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Passing Score */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Geçme Notu (%)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={formData.passingScore}
                                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-lg font-semibold text-primary min-w-[3rem]">
                                    %{formData.passingScore}
                                </span>
                            </div>
                            {errors.passingScore && (
                                <p className="text-sm text-red-600 mt-1">{errors.passingScore}</p>
                            )}
                        </div>

                        {/* Access Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Erişim Seviyesi
                            </label>
                            <select
                                value={formData.accessLevel}
                                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as AccessLevel })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            >
                                <option value="free">Ücretsiz</option>
                                <option value="premium">Premium</option>
                                <option value="restricted">Kısıtlı</option>
                            </select>
                        </div>

                        {/* Time Limit */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Süre Sınırı (dakika)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.timeLimit}
                                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                placeholder="0 = Sınırsız"
                            />
                            <p className="text-xs text-gray-500 mt-1">0 = Süre sınırı yok</p>
                        </div>

                        {/* Max Attempts */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maksimum Deneme
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maxAttempts}
                                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                placeholder="0 = Sınırsız"
                            />
                            <p className="text-xs text-gray-500 mt-1">0 = Sınırsız deneme</p>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="isRequired"
                                checked={formData.isRequired}
                                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="isRequired" className="flex-1 cursor-pointer">
                                <span className="font-medium text-gray-900 dark:text-white">Zorunlu Değerlendirme</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="showCorrectAnswers"
                                checked={formData.showCorrectAnswers}
                                onChange={(e) => setFormData({ ...formData, showCorrectAnswers: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="showCorrectAnswers" className="flex-1 cursor-pointer">
                                <span className="font-medium text-gray-900 dark:text-white">Doğru Cevapları Göster</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="shuffleQuestions"
                                checked={formData.shuffleQuestions}
                                onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="shuffleQuestions" className="flex-1 cursor-pointer">
                                <span className="font-medium text-gray-900 dark:text-white">Soruları Karıştır</span>
                            </label>
                        </div>
                    </div>

                    {/* Questions Section (only in edit mode) */}
                    {isEditMode && assessment && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Sorular ({questions.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Soru Ekle
                                </button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">Henüz soru eklenmemiş</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {questions.map((question, index) => (
                                        <div
                                            key={question.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">
                                                {index + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {question.questionText}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {question.questionType} • {question.points} puan
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleEditQuestion(question)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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

            {/* Add/Edit Question Modal */}
            {showAddQuestionModal && assessment && (
                <AddQuestionModal
                    assessmentId={assessment.id}
                    question={editingQuestion}
                    onClose={() => {
                        setShowAddQuestionModal(false);
                        setEditingQuestion(null);
                    }}
                    onSuccess={handleQuestionSaved}
                />
            )}
        </>
    );
};
