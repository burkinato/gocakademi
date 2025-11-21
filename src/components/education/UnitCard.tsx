import React from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Unit, Topic, Assessment } from '../../types/education.types';
import { TopicList } from './TopicList';
import { AssessmentList } from './AssessmentList';

interface UnitCardProps {
    unit: Unit;
    isExpanded: boolean;
    topics: Topic[];
    assessments: Assessment[];
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddTopic: () => void;
    onAddAssessment: () => void;
    onEditTopic: (topic: Topic) => void;
    onDeleteTopic: (topic: Topic) => void;
    onEditAssessment: (assessment: Assessment) => void;
    onDeleteAssessment: (assessment: Assessment) => void;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const UnitCard: React.FC<UnitCardProps> = ({
    unit,
    isExpanded,
    topics,
    assessments,
    onToggle,
    onEdit,
    onDelete,
    onAddTopic,
    onAddAssessment,
    onEditTopic,
    onDeleteTopic,
    onEditAssessment,
    onDeleteAssessment,
    dragHandleProps,
}) => {
    const getAccessLevelBadge = (level: string) => {
        const styles = {
            free: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            premium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            restricted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels = {
            free: 'Ücretsiz',
            premium: 'Premium',
            restricted: 'Kısıtlı',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${styles[level as keyof typeof styles]}`}>
                {labels[level as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Unit Header */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div
                        {...dragHandleProps}
                        className="flex-shrink-0 mt-1 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <span className="material-symbols-outlined">drag_indicator</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {unit.title}
                                    </h3>
                                    {unit.isRequired && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                                            Zorunlu
                                        </span>
                                    )}
                                    {getAccessLevelBadge(unit.accessLevel)}
                                </div>
                                {unit.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {unit.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">article</span>
                                        {topics.length} Konu
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">quiz</span>
                                        {assessments.length} Değerlendirme
                                    </span>
                                    {unit.estimatedDuration && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {unit.estimatedDuration} dk
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onEdit}
                                    className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                    title="Düzenle"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                    title="Sil"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                                <button
                                    onClick={onToggle}
                                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                    title={isExpanded ? 'Daralt' : 'Genişlet'}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    <div className="space-y-6">
                        {/* Topics Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">article</span>
                                    Konular
                                </h4>
                                <button
                                    onClick={onAddTopic}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Konu Ekle
                                </button>
                            </div>
                            <TopicList
                                topics={topics}
                                onEdit={onEditTopic}
                                onDelete={onDeleteTopic}
                                unitId={unit.id}
                            />
                        </div>

                        {/* Assessments Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                    Değerlendirmeler
                                </h4>
                                <button
                                    onClick={onAddAssessment}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary text-white rounded hover:bg-secondary/90 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Değerlendirme Ekle
                                </button>
                            </div>
                            <AssessmentList
                                assessments={assessments}
                                onEdit={onEditAssessment}
                                onDelete={onDeleteAssessment}
                                unitId={unit.id}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
