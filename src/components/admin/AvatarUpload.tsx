import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Upload, X, User, Loader2, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAssetUrl } from '../../utils/media';

interface AvatarUploadProps {
    currentAvatar?: string | null;
    onUpload: (file: File) => Promise<string>;
    onRemove?: () => Promise<void>;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    onUpload,
    onRemove,
    size = 'lg',
    disabled = false
}) => {
    const [preview, setPreview] = useState<string | null>(currentAvatar ? (getAssetUrl(currentAvatar) || currentAvatar) : null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(currentAvatar ? (getAssetUrl(currentAvatar) || currentAvatar) : null);
    }, [currentAvatar]);

    const sizeClasses = {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-40 h-40'
    };

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 32
    };

    const validateFile = (file: File): boolean => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Sadece JPEG, PNG ve WebP formatları destekleniyor');
            return false;
        }

        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Dosya boyutu en fazla 5MB olabilir');
            return false;
        }

        return true;
    };

    const handleFile = async (file: File) => {
        if (!validateFile(file)) return;

        setIsUploading(true);
        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload file
            const url = await onUpload(file);
            setPreview(getAssetUrl(url) || url);
            toast.success('Profil resmi başarıyla yüklendi');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Resim yüklenirken hata oluştu');
            setPreview(currentAvatar ? (getAssetUrl(currentAvatar) || currentAvatar) : null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleRemove = async () => {
        if (!onRemove) return;

        setIsUploading(true);
        try {
            await onRemove();
            setPreview(null);
            toast.success('Profil resmi kaldırıldı');
        } catch (error: any) {
            console.error('Remove error:', error);
            toast.error(error.message || 'Resim kaldırılırken hata oluştu');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Profil Fotoğrafı</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Minimum 400x400px, JPEG/PNG/WebP</p>
            </div>

            {/* Avatar Preview/Upload Area */}
            <div
                className={`
          ${sizeClasses[size]}
          relative rounded-full overflow-hidden
          border-4 border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isDragging ? 'border-blue-500 scale-105' : ''}
          ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <User size={iconSizes[size]} className="text-gray-400 dark:text-gray-600" />
                    </div>
                )}

                {/* Upload Overlay */}
                {!disabled && !isUploading && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/60 transition-all duration-300 flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 px-4 text-center">
                        {preview ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 rounded-full px-4 py-1.5 hover:bg-white/20 transition"
                                >
                                    <Pencil size={14} />
                                    Düzenle
                                </button>
                                {onRemove && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove();
                                        }}
                                        className="flex items-center gap-2 text-xs font-medium text-white/90 bg-red-500/60 rounded-full px-4 py-1.5 hover:bg-red-500/80 transition"
                                    >
                                        <X size={14} />
                                        Kaldır
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-white">
                                <Upload size={iconSizes[size]} />
                                <span className="text-xs font-medium">Tıkla veya sürükle</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <Loader2 size={iconSizes[size]} className="text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
            />

            {/* Instructions & Remove Button */}
            <div className="flex flex-col items-center gap-2 text-center">
                {!disabled && !isUploading && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tıklayın veya sürükleyip bırakın
                        <br />
                        <span className="text-xs">Maksimum 5MB</span>
                    </p>
                )}
                {preview && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Kaydettikten sonra değişiklikler uygulanır.
                    </p>
                )}
            </div>
        </div>
    );
};
