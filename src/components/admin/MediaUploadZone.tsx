import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileVideo, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface MediaUploadZoneProps {
    type: 'video' | 'pdf';
    value?: {
        source: 'file' | 'url';
        file?: File;
        url?: string;
        preview?: string;
        duration?: number;
    } | null;
    onChange: (value: MediaUploadZoneProps['value']) => void;
    maxSize?: number; // in MB
    className?: string;
}

export const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
    type,
    value,
    onChange,
    maxSize = 500,
    className,
}) => {
    const [useUrl, setUseUrl] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const acceptedFileTypes = type === 'video'
        ? { 'video/*': ['.mp4', '.webm', '.ogg'] }
        : { 'application/pdf': ['.pdf'] };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > maxSize) {
            toast.error(`Dosya boyutu ${maxSize}MB'dan küçük olmalıdır`);
            return;
        }

        setIsProcessing(true);

        try {
            const preview = URL.createObjectURL(file);

            if (type === 'video') {
                // Get video duration
                const video = document.createElement('video');
                video.preload = 'metadata';

                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src);
                    const duration = Math.round(video.duration);

                    onChange({
                        source: 'file',
                        file,
                        preview,
                        duration,
                    });

                    setIsProcessing(false);
                    toast.success('Video yüklendi');
                };

                video.onerror = () => {
                    setIsProcessing(false);
                    toast.error('Video yüklenirken hata oluştu');
                };

                video.src = preview;
            } else {
                // PDF
                onChange({
                    source: 'file',
                    file,
                    preview,
                });

                setIsProcessing(false);
                toast.success('PDF yüklendi');
            }
        } catch (error) {
            setIsProcessing(false);
            toast.error('Dosya yüklenirken hata oluştu');
        }
    }, [type, maxSize, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles: 1,
        disabled: isProcessing,
    });

    const handleUrlSubmit = () => {
        if (!urlInput.trim()) {
            toast.error('Lütfen bir URL girin');
            return;
        }

        let duration: number | undefined;
        let embedUrl = urlInput;

        if (type === 'video') {
            // YouTube URL parsing
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
            const youtubeMatch = urlInput.match(youtubeRegex);

            if (youtubeMatch) {
                embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
            } else {
                // Vimeo URL parsing
                const vimeoRegex = /vimeo\.com\/(\d+)/;
                const vimeoMatch = urlInput.match(vimeoRegex);

                if (vimeoMatch) {
                    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
            }
        }

        onChange({
            source: 'url',
            url: embedUrl,
            duration,
        });

        toast.success(`${type === 'video' ? 'Video' : 'PDF'} linki eklendi`);
    };

    const handleRemove = () => {
        if (value?.preview) {
            URL.revokeObjectURL(value.preview);
        }
        onChange(null);
        setUrlInput('');
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours} sa ${minutes} dk`;
        }
        return `${minutes} dk ${secs} sn`;
    };

    const formatFileSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toggle between file upload and URL */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setUseUrl(false)}
                    className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        !useUrl
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Dosya Yükle
                </button>
                <button
                    type="button"
                    onClick={() => setUseUrl(true)}
                    className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        useUrl
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    URL Kullan
                </button>
            </div>

            {/* Content */}
            {value ? (
                // Preview
                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-start gap-4">
                        {type === 'video' && value.preview && (
                            <video
                                src={value.preview}
                                controls
                                className="w-48 h-32 object-cover rounded"
                            />
                        )}
                        {type === 'pdf' && (
                            <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {value.source === 'file' ? value.file?.name : 'URL'}
                                    </p>
                                    {value.source === 'file' && value.file && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatFileSize(value.file.size)}
                                            {value.file.size > maxSize * 1024 * 1024 && (
                                                <span className="text-orange-500 ml-2">
                                                    ⚠️ Dosya boyutu {maxSize}MB'ı aşıyor
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    {value.duration && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Süre: {formatDuration(value.duration)}
                                        </p>
                                    )}
                                    {value.source === 'url' && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                                            {value.url}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Kaldır"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {useUrl ? (
                        // URL Input
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder={
                                    type === 'video'
                                        ? 'YouTube veya Vimeo URL\'si girin...'
                                        : 'PDF URL\'si girin...'
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                URL Ekle
                            </button>
                        </div>
                    ) : (
                        // Dropzone
                        <div
                            {...getRootProps()}
                            className={cn(
                                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                                isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900',
                                isProcessing && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <input {...getInputProps()} />
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                    <p className="text-gray-600 dark:text-gray-400">İşleniyor...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    {type === 'video' ? (
                                        <FileVideo className="w-12 h-12 text-gray-400" />
                                    ) : (
                                        <FileText className="w-12 h-12 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {isDragActive
                                                ? `${type === 'video' ? 'Videoyu' : 'PDF\'i'} buraya bırakın`
                                                : `${type === 'video' ? 'Video' : 'PDF'} dosyası sürükleyin veya tıklayın`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Maksimum dosya boyutu: {maxSize}MB
                                        </p>
                                        {type === 'video' && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                Desteklenen formatlar: MP4, WebM, OGG
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
