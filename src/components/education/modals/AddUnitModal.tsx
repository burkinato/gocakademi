import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal';
import { FormField } from '../../shared/FormField';
import { Button } from '../../shared/Button';
import { Unit, AccessLevel, CreateUnitDto, UpdateUnitDto } from '../../../types/education.types';
import { toast } from 'react-hot-toast';

interface AddUnitModalProps {
    courseId: number;
    unit?: Unit | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({
    courseId,
    unit,
    onClose,
    onSuccess
}) => {
    const isEditMode = !!unit;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isRequired: true,
        accessLevel: 'free' as AccessLevel,
        estimatedDuration: 0
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (unit) {
            setFormData({
                title: unit.title,
                description: unit.description || '',
                isRequired: unit.isRequired,
                accessLevel: unit.accessLevel,
                estimatedDuration: unit.estimatedDuration || 0
            });
        }
    }, [unit]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Ünite başlığı gereklidir';
        }

        if (formData.title.length > 255) {
            newErrors.title = 'Başlık çok uzun (max 255 karakter)';
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
        setErrors({});

        try {
            if (isEditMode && unit) {
                // Update existing unit
                const updateData: UpdateUnitDto = {
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    isRequired: formData.isRequired,
                    accessLevel: formData.accessLevel,
                    estimatedDuration: formData.estimatedDuration > 0 ? formData.estimatedDuration : undefined
                };

                const { apiClient } = await import('../../../services/api');
                await apiClient.updateUnit(unit.id, updateData);

                toast.success('✓ Ünite başarıyla güncellendi');
            } else {
                // Create new unit
                const createData: CreateUnitDto = {
                    courseId,
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    isRequired: formData.isRequired,
                    accessLevel: formData.accessLevel,
                    estimatedDuration: formData.estimatedDuration > 0 ? formData.estimatedDuration : undefined
                };

                const { apiClient } = await import('../../../services/api');
                await apiClient.createUnit(createData);

                toast.success('✓ Ünite başarıyla oluşturuldu');
            }

            // Call success callback to refresh data
            onSuccess();

            // Close modal after a short delay for UX
            setTimeout(() => {
                onClose();
            }, 300);

        } catch (error: any) {
            console.error('Unit save error:', error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                toast.error('Geçersiz veri. Lütfen formu kontrol edin.');
                if (error.response.data?.errors) {
                    setErrors(error.response.data.errors);
                }
            } else if (error.response?.status === 401) {
                toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            } else if (error.response?.status === 403) {
                toast.error('Bu işlem için yetkiniz yok.');
            } else if (error.response?.status === 404) {
                toast.error(isEditMode ? 'Ünite bulunamadı.' : 'Kurs bulunamadı.');
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error(isEditMode ? 'Ünite güncellenemedi. Lütfen tekrar deneyin.' : 'Ünite oluşturulamadı. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isEditMode ? 'Üniteyi Düzenle' : 'Yeni Ünite Ekle'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <FormField
                    label="Ünite Başlığı"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    required
                    placeholder="Örn: Temel Kavramlar"
                />

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Açıklama
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Ünite hakkında kısa açıklama..."
                    />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Estimated Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tahmini Süre (dakika)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Konu sürelerine göre otomatik hegaplanabilir
                        </p>
                    </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <input
                        type="checkbox"
                        id="isRequired"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <label htmlFor="isRequired" className="flex-1 cursor-pointer">
                        <span className="font-medium text-gray-900 dark:text-white">Zorunlu Ünite</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bu ünite kurs tamamlanması için gereklidir
                        </p>
                    </label>
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
                        isLoading={loading}
                    >
                        {isEditMode ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
