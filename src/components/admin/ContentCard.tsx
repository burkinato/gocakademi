import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    FileVideo,
    FileText,
    FileQuestion,
    File,
    MoreVertical,
    Edit,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    GripVertical,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ContentType } from '../../types';

interface ContentCardProps {
    content: {
        id: string;
        title: string;
        type: ContentType;
        duration?: string;
        lastEdited?: Date;
        isPublished?: boolean;
    };
    onEdit: () => void;
    onDuplicate: () => void;
    onTogglePublish: () => void;
    onDelete: () => void;
    dragHandleProps?: any;
    isDragging?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
    content,
    onEdit,
    onDuplicate,
    onTogglePublish,
    onDelete,
    dragHandleProps,
    isDragging,
}) => {
    const getTypeIcon = (type: ContentType) => {
        switch (type) {
            case 'video':
                return <FileVideo className="w-5 h-5" />;
            case 'pdf':
                return <FileText className="w-5 h-5" />;
            case 'text':
                return <File className="w-5 h-5" />;
            case 'quiz':
                return <FileQuestion className="w-5 h-5" />;
            default:
                return <File className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: ContentType) => {
        switch (type) {
            case 'video':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'pdf':
                return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'text':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            case 'quiz':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getTypeLabel = (type: ContentType) => {
        switch (type) {
            case 'video':
                return 'Video';
            case 'pdf':
                return 'PDF';
            case 'text':
                return 'Metin';
            case 'quiz':
                return 'Quiz';
            default:
                return 'İçerik';
        }
    };

    const formatDuration = (duration?: string) => {
        if (!duration) return null;

        const minutes = parseInt(duration);
        if (isNaN(minutes)) return duration;

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours} sa ${mins} dk`;
        }
        return `${mins} dk`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.01 }}
            className={cn(
                'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all',
                'hover:shadow-md hover:border-primary/50',
                isDragging && 'opacity-50 shadow-lg'
            )}
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Type Icon */}
                <div className={cn('p-2 rounded-lg', getTypeColor(content.type))}>
                    {getTypeIcon(content.type)}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {content.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getTypeColor(content.type))}>
                            {getTypeLabel(content.type)}
                        </span>
                        {formatDuration(content.duration) && (
                            <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span>{formatDuration(content.duration)}</span>
                            </>
                        )}
                        {content.lastEdited && (
                            <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span>
                                    {format(content.lastEdited, 'd MMM yyyy', { locale: tr })}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Publish Status */}
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            content.isPublished
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        )}
                    >
                        {content.isPublished ? 'Yayında' : 'Taslak'}
                    </span>

                    {/* Actions Menu */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="İşlemler"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
                                sideOffset={5}
                            >
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
                                    onSelect={onEdit}
                                >
                                    <Edit className="w-4 h-4" />
                                    Düzenle
                                </DropdownMenu.Item>

                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
                                    onSelect={onDuplicate}
                                >
                                    <Copy className="w-4 h-4" />
                                    Kopyala
                                </DropdownMenu.Item>

                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
                                    onSelect={onTogglePublish}
                                >
                                    {content.isPublished ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Yayından Kaldır
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Yayına Al
                                        </>
                                    )}
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer outline-none"
                                    onSelect={onDelete}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Sil
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>
        </motion.div>
    );
};
