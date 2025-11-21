import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal';
import { FormField } from '../../shared/FormField';
import { Button } from '../../shared/Button';
import { Topic, ContentType, AccessLevel, CreateTopicDto, UpdateTopicDto } from '../../../types/education.types';
import { toast } from 'react-hot-toast';

interface AddTopicModalProps {
    unitId: number;
    topic?: Topic | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: string }[] = [
    { value: 'video', label: 'Video', icon: 'play_circle' },
    { value: 'pdf', label: 'PDF Doküman', icon: 'picture_as_pdf' },
    { value: 'document', label: 'Doküman', icon: 'description' },
    { value: 'link', label: 'Harici Link', icon: 'link' },
    { value: 'quiz', label: 'Quiz/Test', icon: 'quiz' },
    { value: 'assignment', label: 'Ödev', icon: 'assignment' }
];

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
    unitId,
    topic,
    onClose,
    onSuccess
}) => {
    const isEditMode = !!topic;
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        contentType: 'video' as ContentType,
        contentUrl: '',
        externalLink: '',
        content: '',
        isRequired: true,
        accessLevel: 'free' as AccessLevel,
        duration: 0,
        fileSize: 0,
        mimeType: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (topic) {
            setFormData({
                title: topic.title,
                description: topic.description || '',
                contentType: topic.contentType,
                contentUrl: topic.contentUrl || '',
                externalLink: topic.externalLink || '',
                content: topic.content || '',
                isRequired: topic.isRequired,
                accessLevel: topic.accessLevel,
                duration: topic.duration || 0,
                fileSize: topic.fileSize || 0,
                mimeType: topic.mimeType || ''
            });
        }
    }, [topic]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Konu başlığı gereklidir';
        }

        if (formData.title.length > 255) {
            newErrors.title = 'Başlık çok uzun (max 255 karakter)';
        }

        // Content type specific validation
        if (formData.contentType === 'link' && !formData.externalLink.trim()) {
            newErrors.externalLink = 'Link URL gereklidir';
        }

        if (formData.contentType === 'link' && formData.externalLink) {
            try {
                new URL(formData.externalLink);
            } catch {
                newErrors.externalLink = 'Geçerli bir URL girin';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const contentType = formData.contentType;
        const validTypes: Record<ContentType, string[]> = {
            video: ['video/mp4', 'video/webm', 'video/ogg'],
            pdf: ['application/pdf'],
            document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            link: [],
            quiz: [],
            assignment: []
        };

        if (contentType in validTypes && validTypes[contentType].length > 0) {
            if (!validTypes[contentType].includes(file.type)) {
                toast.error(`Geçersiz dosya tipi. İzin verilen: ${validTypes[contentType].join(', ')}`);
                return;
            }
        }

        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            toast.error('Dosya boyutu çok büyük (max 500MB)');
            return;
        }

        setUploading(true);

        try {
            // TODO: Implement file upload to cloud storage
            // const uploadedUrl = await uploadFile(file);

            // For now, create object URL for preview
            const objectUrl = URL.createObjectURL(file);

            setFormData({
                ...formData,
                contentUrl: objectUrl,
                fileSize: file.size,
                mimeType: file.type
            });

            // If video, try to get duration
            if (contentType === 'video') {
                const video = document.createElement('video');
                video.src = objectUrl;
                video.onloadedmetadata = () => {
                    setFormData(prev => ({
                        ...prev,
                        duration: Math.ceil(video.duration / 60) // Convert to minutes
                    }));
                };
            }

            toast.success('Dosya yüklendi');
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Dosya yüklenemedi');
        } finally {
            setUploading(false);
        }
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
            if (isEditMode && topic) {
                // Update existing topic
                const updateData: UpdateTopicDto = {
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    contentType: formData.contentType,
                    contentUrl: formData.contentUrl || undefined,
                    externalLink: formData.externalLink.trim() || undefined,
                    content: formData.content.trim() || undefined,
                    isRequired: formData.isRequired,
                    accessLevel: formData.accessLevel,
                    duration: formData.duration > 0 ? formData.duration : undefined,
                    fileSize: formData.fileSize > 0 ? formData.fileSize : undefined,
                    mimeType: formData.mimeType || undefined
                };

                const { apiClient } = await import('../../../services/api');
                await apiClient.updateTopic(topic.id, updateData);

                toast.success('✓ Konu başarıyla güncellendi');
            } else {
                // Create new topic
                const createData: CreateTopicDto = {
                    unitId,
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    contentType: formData.contentType,
                    contentUrl: formData.contentUrl || undefined,
                    externalLink: formData.externalLink.trim() || undefined,
                    content: formData.content.trim() || undefined,
                    isRequired: formData.isRequired,
                    accessLevel: formData.accessLevel,
                    duration: formData.duration > 0 ? formData.duration : undefined,
                    fileSize: formData.fileSize > 0 ? formData.fileSize : undefined,
                    mimeType: formData.mimeType || undefined
                };

                const { apiClient } = await import('../../../services/api');
                await apiClient.createTopic(createData);

                toast.success('✓ Konu başarıyla oluşturuldu');
            }

            // Call success callback
            onSuccess();

            // Close modal with delay
            setTimeout(() => {
                onClose();
            }, 300);

        } catch (error: any) {
            console.error('Topic save error:', error);

            // Handle specific errors
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
                toast.error(isEditMode ? 'Konu bulunamadı.' : 'Ünite bulunamadı.');
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error(isEditMode ? 'Konu güncellenemedi. Lütfen tekrar deneyin.' : 'Konu oluşturulamadı. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderContentTypeInput = () => {
        switch (formData.contentType) {
            case 'video':
            case 'pdf':
            case 'document':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dosya Yükle
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept={formData.contentType === 'video' ? 'video/*' : formData.contentType === 'pdf' ? '.pdf' : '.pdf,.doc,.docx'}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-primary">
                                    {uploading ? 'sync' : 'upload_file'}
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {uploading ? 'Yükleniyor...' : formData.contentUrl ? 'Dosyayı Değiştir' : 'Dosya Seç'}
                                </span>
                            </label>
                            {formData.contentUrl && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Dosya yüklendi ({(formData.fileSize / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 'link':
                return (
                    <FormField
                        label="Link URL"
                        value={formData.externalLink}
                        onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                        error={errors.externalLink}
                        required
                        placeholder="https://example.com/video"
                    />
                );

            case 'quiz':
            case 'assignment':
                return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            {formData.contentType === 'quiz' ? 'Quiz' : 'Ödev'} içeriği kaydedildikten sonra düzenlenebilir
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
            title={isEditMode ? 'Konuyu Düzenle' : 'Yeni Konu Ekle'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Content Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        İçerik Tipi
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {CONTENT_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, contentType: type.value })}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${formData.contentType === type.value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-2xl">{type.icon}</span>
                                <span className="text-sm font-medium">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <FormField
                    label="Konu Başlığı"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    required
                    placeholder="Örn: Giriş Videosu"
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
                        placeholder="Konu hakkında kısa açıklama..."
                    />
                </div>

                {/* Content Type Specific Input */}
                {renderContentTypeInput()}

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

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Süre (dakika)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <input
                        type="checkbox"
                        id="topicRequired"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <label htmlFor="topicRequired" className="flex-1 cursor-pointer">
                        <span className="font-medium text-gray-900 dark:text-white">Zorunlu Konu</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bu konu ünite tamamlanması için gereklidir
                        </p>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading || uploading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                        disabled={uploading}
                    >
                        {isEditMode ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
