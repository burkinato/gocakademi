import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { Unit, Topic, Assessment, ContentType, AccessLevel } from '../../types/education.types';
import { UnitCard } from './UnitCard';
import { TopicCard } from './TopicCard';
import { AssessmentCard } from './AssessmentCard';
import { AddUnitModal } from './modals/AddUnitModal';
import { AddTopicModal } from './modals/AddTopicModal';
import { AddAssessmentModal } from './modals/AddAssessmentModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface CourseContentManagerProps {
    courseId: number;
    courseName: string;
}

export const CourseContentManager: React.FC<CourseContentManagerProps> = ({ courseId, courseName }) => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [topics, setTopics] = useState<Record<number, Topic[]>>({});
    const [assessments, setAssessments] = useState<Record<number, Assessment[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

    // Modal states
    const [showAddUnitModal, setShowAddUnitModal] = useState(false);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    // Edit states
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<{
        show: boolean;
        type: 'unit' | 'topic' | 'assessment';
        id: number;
        name: string;
    } | null>(null);

    useEffect(() => {
        loadCourseContent();
    }, [courseId]);

    const loadCourseContent = async () => {
        try {
            setLoading(true);
            // TODO: API çağrısı yapılacak
            // const response = await apiClient.getCourseContent(courseId);
            // setUnits(response.units);
            // setTopics(response.topics);
            // setAssessments(response.assessments);

            // Geçici mock data
            setUnits([]);
            setTopics({});
            setAssessments({});
        } catch (error) {
            toast.error('İçerik yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUnit = (unitId: number) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'unit') {
            const newUnits = Array.from(units);
            const [removed] = newUnits.splice(source.index, 1);
            newUnits.splice(destination.index, 0, removed);

            // Update order indices
            const updatedUnits = newUnits.map((unit, index) => ({
                ...unit,
                orderIndex: index,
            }));

            setUnits(updatedUnits);

            try {
                // TODO: API çağrısı
                // await apiClient.reorderUnits(courseId, updatedUnits.map((u, i) => ({ id: u.id, orderIndex: i })));
                toast.success('Ünite sıralaması güncellendi');
            } catch (error) {
                toast.error('Sıralama güncellenirken hata oluştu');
                loadCourseContent(); // Revert
            }
        } else if (type.startsWith('topic-')) {
            const unitId = parseInt(type.split('-')[1]);
            const unitTopics = topics[unitId] || [];
            const newTopics = Array.from(unitTopics);
            const [removed] = newTopics.splice(source.index, 1);
            newTopics.splice(destination.index, 0, removed);

            const updatedTopics = newTopics.map((topic, index) => ({
                ...topic,
                orderIndex: index,
            }));

            setTopics({ ...topics, [unitId]: updatedTopics });

            try {
                // TODO: API çağrısı
                toast.success('Konu sıralaması güncellendi');
            } catch (error) {
                toast.error('Sıralama güncellenirken hata oluştu');
                loadCourseContent();
            }
        }
    };

    const handleAddUnit = () => {
        setEditingUnit(null);
        setShowAddUnitModal(true);
    };

    const handleEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setShowAddUnitModal(true);
    };

    const handleDeleteUnit = (unit: Unit) => {
        setDeleteConfirm({
            show: true,
            type: 'unit',
            id: unit.id,
            name: unit.title,
        });
    };

    const handleAddTopic = (unitId: number) => {
        setSelectedUnitId(unitId);
        setEditingTopic(null);
        setShowAddTopicModal(true);
    };

    const handleEditTopic = (topic: Topic) => {
        setSelectedUnitId(topic.unitId);
        setEditingTopic(topic);
        setShowAddTopicModal(true);
    };

    const handleDeleteTopic = (topic: Topic) => {
        setDeleteConfirm({
            show: true,
            type: 'topic',
            id: topic.id,
            name: topic.title,
        });
    };

    const handleAddAssessment = (unitId: number) => {
        setSelectedUnitId(unitId);
        setEditingAssessment(null);
        setShowAddAssessmentModal(true);
    };

    const handleEditAssessment = (assessment: Assessment) => {
        setSelectedUnitId(assessment.unitId);
        setEditingAssessment(assessment);
        setShowAddAssessmentModal(true);
    };

    const handleDeleteAssessment = (assessment: Assessment) => {
        setDeleteConfirm({
            show: true,
            type: 'assessment',
            id: assessment.id,
            name: assessment.title,
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            // TODO: API çağrısı
            toast.success(`${deleteConfirm.type === 'unit' ? 'Ünite' : deleteConfirm.type === 'topic' ? 'Konu' : 'Değerlendirme'} silindi`);
            loadCourseContent();
        } catch (error) {
            toast.error('Silme işlemi başarısız oldu');
        } finally {
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        İçerik Yönetimi
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {courseName}
                    </p>
                </div>
                <button
                    onClick={handleAddUnit}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Yeni Ünite Ekle
                </button>
            </div>

            {/* Content */}
            {units.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                        school
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Henüz ünite eklenmemiş
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Kursa içerik eklemek için ilk üniteyi oluşturun
                    </p>
                    <button
                        onClick={handleAddUnit}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        İlk Üniteyi Ekle
                    </button>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="units" type="unit">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {units.map((unit, index) => (
                                    <Draggable key={unit.id} draggableId={`unit-${unit.id}`} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={snapshot.isDragging ? 'opacity-50' : ''}
                                            >
                                                <UnitCard
                                                    unit={unit}
                                                    isExpanded={expandedUnits.has(unit.id)}
                                                    topics={topics[unit.id] || []}
                                                    assessments={assessments[unit.id] || []}
                                                    onToggle={() => toggleUnit(unit.id)}
                                                    onEdit={() => handleEditUnit(unit)}
                                                    onDelete={() => handleDeleteUnit(unit)}
                                                    onAddTopic={() => handleAddTopic(unit.id)}
                                                    onAddAssessment={() => handleAddAssessment(unit.id)}
                                                    onEditTopic={handleEditTopic}
                                                    onDeleteTopic={handleDeleteTopic}
                                                    onEditAssessment={handleEditAssessment}
                                                    onDeleteAssessment={handleDeleteAssessment}
                                                    dragHandleProps={provided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Modals */}
            {showAddUnitModal && (
                <AddUnitModal
                    courseId={courseId}
                    unit={editingUnit}
                    onClose={() => {
                        setShowAddUnitModal(false);
                        setEditingUnit(null);
                    }}
                    onSuccess={() => {
                        setShowAddUnitModal(false);
                        setEditingUnit(null);
                        loadCourseContent();
                    }}
                />
            )}

            {showAddTopicModal && selectedUnitId && (
                <AddTopicModal
                    unitId={selectedUnitId}
                    topic={editingTopic}
                    onClose={() => {
                        setShowAddTopicModal(false);
                        setEditingTopic(null);
                        setSelectedUnitId(null);
                    }}
                    onSuccess={() => {
                        setShowAddTopicModal(false);
                        setEditingTopic(null);
                        setSelectedUnitId(null);
                        loadCourseContent();
                    }}
                />
            )}

            {showAddAssessmentModal && selectedUnitId && (
                <AddAssessmentModal
                    unitId={selectedUnitId}
                    assessment={editingAssessment}
                    onClose={() => {
                        setShowAddAssessmentModal(false);
                        setEditingAssessment(null);
                        setSelectedUnitId(null);
                    }}
                    onSuccess={() => {
                        setShowAddAssessmentModal(false);
                        setEditingAssessment(null);
                        setSelectedUnitId(null);
                        loadCourseContent();
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmDialog
                    title={`${deleteConfirm.type === 'unit' ? 'Ünite' : deleteConfirm.type === 'topic' ? 'Konu' : 'Değerlendirme'} Sil`}
                    message={`"${deleteConfirm.name}" ${deleteConfirm.type === 'unit' ? 'ünitesini' : deleteConfirm.type === 'topic' ? 'konusunu' : 'değerlendirmesini'} silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                    confirmText="Sil"
                    cancelText="İptal"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    variant="danger"
                />
            )}
        </div>
    );
};
