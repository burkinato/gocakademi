import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { apiClient } from '../../services/api';
import { CurriculumUnit, CurriculumItem, ContentType, QuizConfig, AttachmentResource } from '../../types';
import { toast } from 'react-hot-toast';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { RichTextEditor } from './RichTextEditor';
import { VideoDropzone } from './VideoDropzone';
import { QuizBuilder } from './QuizBuilder';

const createInitialCurriculum = (): CurriculumUnit[] => [
  {
    id: `unit-${Date.now()}`,
    title: 'Bölüm 1: Giriş',
    items: []
  }
];

interface AdminCourseBuilderProps {
  mode?: 'create' | 'edit';
  initialCourse?: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    price?: number | string;
    imageUrl?: string;
    isPublished?: boolean;
  };
  initialCurriculum?: CurriculumUnit[];
  courseId?: number;
}

export const AdminCreateCourse: React.FC<AdminCourseBuilderProps> = ({
  mode = 'create',
  initialCourse,
  initialCurriculum,
  courseId,
}) => {
  const navigate = useNavigate();
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80';
  const generateId = () => crypto.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const isEditMode = mode === 'edit';
  // Form States
  const [courseDetails, setCourseDetails] = useState({
    title: initialCourse?.title || '',
    description: initialCourse?.description || '',
    category: initialCourse?.category || 'Yazılım',
    level: initialCourse?.level || 'beginner',
    price: initialCourse?.price ? String(initialCourse.price) : '',
    image: null as File | null,
    imagePreview: initialCourse?.imageUrl || '',
  });

  // Curriculum State
  const [curriculum, setCurriculum] = useState<CurriculumUnit[]>(() =>
    initialCurriculum && initialCurriculum.length ? initialCurriculum : createInitialCurriculum()
  );

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<ContentType>('video');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; parentId?: number | null; order: number }>>([]);
  const [categoryError, setCategoryError] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ id: string; name: string; count: number } | null>(null);
  const [checkingCategoryCourses, setCheckingCategoryCourses] = useState(false);
  const [curriculumStats, setCurriculumStats] = useState({
    unitCount: 1,
    lessonCount: 0,
    requiredCount: 0,
    totalDurationMinutes: 0,
  });
  const [newItemRichText, setNewItemRichText] = useState('');
  const [newItemVideoAsset, setNewItemVideoAsset] = useState<CurriculumItem['videoAsset']>(null);
  const [newItemQuiz, setNewItemQuiz] = useState<QuizConfig>({ durationMinutes: 0, allowRetry: false, questions: [] });
  const [newItemAttachments, setNewItemAttachments] = useState<AttachmentResource[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [editingItem, setEditingItem] = useState<{ unitId: string; itemId: string } | null>(null);
  const [parentDrafts, setParentDrafts] = useState<Record<number, number | null>>({});
  const [saving, setSaving] = useState(false);
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const formatMinutes = (minutes: number) => {
    if (!minutes) return '0 dk';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!hours) return `${mins} dk`;
    if (!mins) return `${hours} sa`;
    return `${hours} sa ${mins} dk`;
  };

  const calculateStats = useCallback((data: CurriculumUnit[]) => {
    let lessonCount = 0;
    let requiredCount = 0;
    let totalMinutes = 0;

    data.forEach(unit => {
      unit.items.forEach(item => {
        lessonCount += 1;
        if (item.isRequired) requiredCount += 1;
        const asNumber = parseInt(item.duration || '0', 10);
        if (!Number.isNaN(asNumber) && asNumber > 0) {
          totalMinutes += asNumber;
        }
      });
    });

    return {
      unitCount: data.length,
      lessonCount,
      requiredCount,
      totalDurationMinutes: totalMinutes,
    };
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    if (result.type === 'UNIT') {
      setCurriculum(prev => {
        const next = Array.from(prev);
        const [removed] = next.splice(result.source.index, 1);
        next.splice(result.destination!.index, 0, removed);
        return next;
      });
      return;
    }

    const sourceUnitId = result.source.droppableId.replace('items-', '');
    const destinationUnitId = result.destination.droppableId.replace('items-', '');

    setCurriculum(prev => {
      const updated = prev.map(unit => ({ ...unit, items: [...unit.items] }));
      const sourceUnit = updated.find(unit => unit.id === sourceUnitId);
      const destinationUnit = updated.find(unit => unit.id === destinationUnitId);

      if (!sourceUnit || !destinationUnit) {
        return prev;
      }

      const [movedItem] = sourceUnit.items.splice(result.source.index, 1);
      destinationUnit.items.splice(result.destination!.index, 0, movedItem);
      return updated;
    });
  };

  const sanitizeCurriculumForStorage = useCallback((data: CurriculumUnit[]) => {
    return data.map(unit => ({
      ...unit,
      items: unit.items.map(item => {
        const sanitizedAttachments = (item.attachments || []).map(att => ({
          id: att.id,
          name: att.name,
          url: att.url,
          type: att.type,
        }));
        const sanitizedVideoAsset = item.videoAsset
          ? {
              source: item.videoAsset.source,
              name: item.videoAsset.name,
              size: item.videoAsset.size,
              mimeType: item.videoAsset.mimeType,
            }
          : null;
        const sanitizedMetadata = {
          quiz: item.quiz || null,
          richTextEnabled: Boolean(item.richTextContent),
          attachments: sanitizedAttachments,
          videoAsset: sanitizedVideoAsset,
        };

        return {
          ...item,
          videoAsset: sanitizedVideoAsset,
          attachments: sanitizedAttachments,
          metadata: sanitizedMetadata,
        };
      }),
    }));
  }, []);

  useEffect(() => {
    if (mode === 'edit') {
      if (initialCurriculum && initialCurriculum.length) {
        setCurriculum(initialCurriculum);
        setCurriculumStats(calculateStats(initialCurriculum));
      }
      if (initialCourse) {
        setCourseDetails(prev => ({
          ...prev,
          title: initialCourse.title || '',
          description: initialCourse.description || '',
          category: initialCourse.category || prev.category,
          level: initialCourse.level || prev.level,
          price: initialCourse.price ? String(initialCourse.price) : '',
          imagePreview: initialCourse.imageUrl || prev.imagePreview,
        }));
      }
    }
  }, [calculateStats, mode, initialCourse, initialCurriculum]);

  useEffect(() => {
    setCurriculumStats(calculateStats(curriculum));
  }, [curriculum, calculateStats]);

  const resetItemModal = () => {
    setNewItemType('video');
    setNewItemTitle('');
    setNewItemDuration('');
    setNewItemContent('');
    setNewItemRichText('');
    setNewItemVideoAsset(null);
    setNewItemQuiz({ durationMinutes: 0, allowRetry: false, questions: [] });
    setNewItemAttachments([]);
    setNewAttachmentName('');
    setNewAttachmentUrl('');
    setEditingItem(null);
  };

  const restoreLastVersion = () => {
    const versions = JSON.parse(localStorage.getItem('curriculum_versions') || '[]');
    if (versions.length) setCurriculum(versions[0].curriculum);
  };

  const onCategoryDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const onCategoryDrop = async (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const a = categories.findIndex(c => String(c.id) === draggedId);
    const b = categories.findIndex(c => c.id === targetId);
    if (a < 0 || b < 0) return;
    const next = [...categories];
    const [item] = next.splice(a, 1);
    next.splice(b, 0, item);
    const ordered = next.map((c, i) => ({ ...c, order: i }));
    setCategories(ordered);
    await apiClient.reorderCategories(ordered.map(c => ({ id: c.id, order_index: c.order })));
  };

  const handleAskDeleteCategory = async (cat: { id: number; name: string }) => {
    try {
      setCheckingCategoryCourses(true);
      const res = await apiClient.getCourses({ category: cat.name });
      const count = Array.isArray(res.data) ? res.data.length : 0;
      setDeleteCategoryConfirm({ id: String(cat.id), name: cat.name, count });
    } catch {
      setDeleteCategoryConfirm({ id: String(cat.id), name: cat.name, count: 0 });
    } finally {
      setCheckingCategoryCourses(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await apiClient.getCategories();
      const rows = Array.isArray(res.data) ? res.data : [];
      setCategories(rows.map((r: any) => ({ id: r.id, name: r.name, parentId: r.parent_id, order: r.order_index })));
      setCategoryError('');
    } catch (e: any) {
      setCategoryError(e?.message || 'Kategoriler yüklenemedi');
      if (categories.length === 0) {
        setCategories([
          { id: 1, name: 'Yazılım', parentId: null, order: 0 },
          { id: 2, name: 'Pazarlama', parentId: null, order: 1 },
          { id: 3, name: 'Tasarım', parentId: null, order: 2 },
        ]);
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    setParentDrafts(prev => {
      const next: Record<number, number | null> = {};
      categories.forEach(cat => {
        if (Object.prototype.hasOwnProperty.call(prev, cat.id)) {
          next[cat.id] = prev[cat.id];
        } else {
          next[cat.id] = cat.parentId ?? null;
        }
      });
      return next;
    });
    setCourseDetails(prev => {
      if (!prev.category || !categories.some(c => c.name === prev.category)) {
        return { ...prev, category: categories[0]?.name || '' };
      }
      return prev;
    });
  }, [categories]);

  const handleApplyParent = async (categoryId: number) => {
    const nextParent = parentDrafts[categoryId] ?? null;
    try {
      setCategories(prev => prev.map(cat => (
        cat.id === categoryId ? { ...cat, parentId: nextParent ?? null } : cat
      )));
      setParentDrafts(prev => ({ ...prev, [categoryId]: nextParent ?? null }));
      await apiClient.updateCategory(categoryId, { parent_id: nextParent });
      toast.success('Üst kategori güncellendi.');
    } catch (error) {
      console.error('Parent category update failed', error);
      toast.error('Üst kategori güncellenemedi.');
      await loadCategories();
    }
  };

  const handleSaveCourse = async (publish: boolean) => {
    const trimmedTitle = courseDetails.title.trim();
    const trimmedDescription = courseDetails.description.trim();

    if (!trimmedTitle) {
      toast.error('Eğitim adı zorunludur.');
      return;
    }
    if (!trimmedDescription) {
      toast.error('Açıklama alanı boş olamaz.');
      return;
    }

    const priceValue = Number(courseDetails.price || '0');
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast.error('Geçerli bir fiyat girin.');
      return;
    }

    if (curriculumStats.lessonCount === 0) {
      toast.error('En az bir içerik eklemelisiniz.');
      return;
    }
    if (curriculum.some(unit => unit.items.length === 0)) {
      toast.error('Her modülde en az bir içerik olmalıdır.');
      return;
    }

    const durationHours = Math.max(1, Math.round(curriculumStats.totalDurationMinutes / 60) || 0);

    const { user } = JSON.parse(localStorage.getItem('auth-storage') || '{}').state || {};
    const sanitizedCurriculumPayload = sanitizeCurriculumForStorage(curriculum);
    const coverImage = courseDetails.imagePreview && !courseDetails.imagePreview.startsWith('data:')
      ? courseDetails.imagePreview
      : undefined;

    const payload = {
      title: trimmedTitle,
      description: trimmedDescription,
      category: courseDetails.category,
      level: courseDetails.level,
      price: priceValue,
      duration: durationHours,
      imageUrl: coverImage || FALLBACK_IMAGE,
      isPublished: publish,
      instructorId: user?.id || 1,
      curriculum: sanitizedCurriculumPayload,
    };
    try {
      setSaving(true);
      if (isEditMode && courseId) {
        const result = await apiClient.updateCourse(courseId, payload);
        if (result.success) {
          toast.success(publish ? 'Eğitim güncellendi.' : 'Taslak güncellendi.');
          navigate('/admin/courses');
        } else {
          toast.error('Eğitim güncellenemedi. Lütfen tekrar deneyin.');
        }
      } else {
        const result = await apiClient.createCourse(payload);
        if (result.success) {
          toast.success(publish ? 'Eğitim oluşturuldu.' : 'Taslak kaydedildi.');
          navigate('/admin/courses');
        } else {
          toast.error('Eğitim oluşturulamadı. Lütfen tekrar deneyin.');
        }
      }
    } catch (e) {
      console.error('Course save error', e);
      toast.error('Eğitim kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  // Curriculum Handlers
  const addUnit = () => {
    const newUnit: CurriculumUnit = {
      id: `u${Date.now()}`,
      title: `Yeni Bölüm ${curriculum.length + 1}`,
      items: []
    };
    setCurriculum([...curriculum, newUnit]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleCoverFile(files[0]);
  };

  const handleCoverFile = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024;
    if (!allowed.includes(file.type)) {
      console.error('Desteklenmeyen dosya türü');
      return;
    }
    if (file.size > maxSize) {
      console.error('Dosya boyutu 10MB sınırını aşıyor');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCourseDetails(prev => ({ ...prev, image: file, imagePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const deleteUnit = (unitId: string) => {
    setCurriculum(curriculum.filter(u => u.id !== unitId));
  };

  const updateUnitTitle = (unitId: string, newTitle: string) => {
    setCurriculum(curriculum.map(u => u.id === unitId ? { ...u, title: newTitle } : u));
  };

  const openAddItemModal = (unitId: string, editItem?: CurriculumItem) => {
    setActiveUnitId(unitId);
    if (editItem) {
      setEditingItem({ unitId, itemId: editItem.id });
      setNewItemType(editItem.type);
      setNewItemTitle(editItem.title);
      setNewItemDuration(editItem.duration || '');
      setNewItemContent(editItem.type === 'pdf' ? editItem.contentUrl || editItem.textContent || '' : '');
      setNewItemRichText(editItem.richTextContent || '');
      setNewItemVideoAsset(editItem.videoAsset || (editItem.contentUrl && editItem.type === 'video'
        ? {
            source: 'url',
            name: editItem.contentUrl,
            size: 0,
            mimeType: 'text/url',
          }
        : null));
      setNewItemQuiz(editItem.quiz || { durationMinutes: 0, allowRetry: false, questions: [] });
      setNewItemAttachments(editItem.attachments || []);
    } else {
      setEditingItem(null);
      resetItemModal();
    }
    setIsModalOpen(true);
  };

  const addItem = () => {
    if (!activeUnitId) return;
    if (!newItemTitle.trim()) {
      toast.error('İçerik başlığı zorunludur.');
      return;
    }

    const itemId = generateId();
    const attachments = newItemAttachments.filter(att => att.name && (att.url || att.dataUrl));

    const videoContentUrl = newItemType === 'video'
      ? (newItemVideoAsset?.source === 'url' ? newItemVideoAsset.name : undefined)
      : undefined;

    const newItem: CurriculumItem = {
      id: itemId,
      title: newItemTitle,
      type: newItemType,
      duration: newItemDuration,
      isRequired: editingItem ? curriculum.find(u => u.id === editingItem.unitId)?.items.find(i => i.id === editingItem.itemId)?.isRequired ?? true : true,
      contentUrl: newItemType === 'video'
        ? videoContentUrl
        : (newItemType === 'pdf' ? newItemContent : undefined),
      textContent: newItemType === 'pdf' ? newItemContent : undefined,
      richTextContent: newItemType === 'text' ? newItemRichText : undefined,
      videoAsset: newItemType === 'video' ? newItemVideoAsset : null,
      attachments,
      quiz: newItemType === 'quiz' ? newItemQuiz : undefined,
      metadata: {
        attachments,
        quiz: newItemType === 'quiz' ? newItemQuiz : undefined,
      },
    };

    setCurriculum(curriculum.map(unit => {
      if (unit.id !== activeUnitId) return unit;
      if (editingItem && editingItem.unitId === unit.id) {
        return {
          ...unit,
          items: unit.items.map(item => (item.id === editingItem.itemId ? newItem : item)),
        };
      }
      return { ...unit, items: [...unit.items, newItem] };
    }));

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const deleteItem = (unitId: string, itemId: string) => {
    setCurriculum(curriculum.map(unit => {
      if (unit.id === unitId) {
        return { ...unit, items: unit.items.filter(i => i.id !== itemId) };
      }
      return unit;
    }));
  };

  const toggleRequired = (unitId: string, itemId: string) => {
    setCurriculum(curriculum.map(unit => {
      if (unit.id === unitId) {
        const updatedItems = unit.items.map(item => {
          if (item.id === itemId) {
            return { ...item, isRequired: !item.isRequired };
          }
          return item;
        });
        return { ...unit, items: updatedItems };
      }
      return unit;
    }));
  };

  const addAttachmentResource = () => {
    if (!newAttachmentName || !newAttachmentUrl) return;
    const resource: AttachmentResource = {
      id: generateId(),
      name: newAttachmentName,
      url: newAttachmentUrl,
      type: 'link',
    };
    setNewItemAttachments(prev => [...prev, resource]);
    setNewAttachmentName('');
    setNewAttachmentUrl('');
  };

  const removeAttachmentResource = (id: string) => {
    setNewItemAttachments(prev => prev.filter(att => att.id !== id));
  };


  const getIconForType = (type: ContentType) => {
    switch (type) {
      case 'video': return 'play_circle';
      case 'pdf': return 'picture_as_pdf';
      case 'text': return 'description';
      case 'quiz': return 'quiz';
      default: return 'article';
    }
  };

  const getColorForType = (type: ContentType) => {
    switch (type) {
      case 'video': return 'text-primary';
      case 'pdf': return 'text-red-500';
      case 'text': return 'text-blue-500';
      case 'quiz': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="px-4 py-8 md:px-6 lg:px-10 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm py-4 z-30 border-b border-transparent">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-3xl font-bold tracking-tight">{isEditMode ? 'Eğitimi Düzenle' : 'Yeni Eğitim Oluştur'}</p>
          <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">{isEditMode ? 'Var olan eğitimi güncelleyin ve müfredatı yeniden düzenleyin.' : 'Eğitim detaylarını girin ve profesyonel müfredatınızı oluşturun.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-text-light dark:text-text-dark"
            disabled={saving}
            onClick={() => handleSaveCourse(false)}
          >
            Taslak Olarak Kaydet
          </Button>
          <Button
            variant="primary"
            className="shadow-md"
            disabled={saving}
            onClick={() => handleSaveCourse(true)}
          >
            {isEditMode ? 'Yayınla / Güncelle' : 'Kaydet ve Yayınla'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Sidebar (Course Details) */}
        <div className="xl:col-span-1 flex flex-col gap-6">

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Eğitim Detayları</h3>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col w-full">
                <p className="text-sm font-medium pb-2">Eğitim Adı</p>
                <input
                  className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 h-11 px-3 text-sm dark:text-white"
                  placeholder="Örn: Profesyonel Web Geliştirme"
                  value={courseDetails.title}
                  onChange={(e) => setCourseDetails({ ...courseDetails, title: e.target.value })}
                />
              </label>
              <label className="flex flex-col w-full">
                <p className="text-sm font-medium pb-2">Açıklama</p>
                <textarea
                  className="form-textarea rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 min-h-32 p-3 text-sm dark:text-white"
                  placeholder="Eğitim hakkında kısa ve net bir açıklama girin."
                  value={courseDetails.description}
                  onChange={(e) => setCourseDetails({ ...courseDetails, description: e.target.value })}
                ></textarea>
              </label>
            </div>
          </div>

          {/* Media & Price */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Medya ve Fiyat</h3>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-col items-center gap-4 rounded-lg border-2 border-dashed px-6 py-8 transition-colors cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                onClick={openFileDialog}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={handleCoverDrop}
                role="button"
                aria-label="Kapak görseli yükle"
              >
                <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm font-medium">Kapak Görseli Yükle</p>
                  <p className="text-xs text-subtext-light dark:text-subtext-dark">PNG, JPG (max. 10MB)</p>
                </div>
                {courseDetails.imagePreview && (
                  <div className="mt-4 w-full max-w-md">
                    <img src={courseDetails.imagePreview} alt="Önizleme" className="w-full rounded-lg border" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverFile(file);
                  }}
                />
              </div>
              <label className="flex flex-col w-full">
                <p className="text-sm font-medium pb-2">Fiyat (TL)</p>
                <input
                  type="number"
                  className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 h-11 px-3 text-sm dark:text-white"
                  placeholder="0.00"
                  value={courseDetails.price}
                  onChange={(e) => setCourseDetails({ ...courseDetails, price: e.target.value })}
                />
              </label>
            </div>
          </div>

          {/* Program Summary */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Program Özeti</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-subtext-light dark:text-subtext-dark">Modül Sayısı</dt>
                <dd className="text-sm font-semibold text-text-light dark:text-text-dark">{curriculumStats.unitCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-subtext-light dark:text-subtext-dark">İçerik Sayısı</dt>
                <dd className="text-sm font-semibold text-text-light dark:text-text-dark">{curriculumStats.lessonCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-subtext-light dark:text-subtext-dark">Zorunlu İçerik</dt>
                <dd className="text-sm font-semibold text-text-light dark:text-text-dark">{curriculumStats.requiredCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-subtext-light dark:text-subtext-dark">Toplam Süre</dt>
                <dd className="text-sm font-semibold text-text-light dark:text-text-dark">{formatMinutes(curriculumStats.totalDurationMinutes)}</dd>
              </div>
            </dl>
          </div>

          {/* Organization */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Organizasyon</h3>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col w-full">
                <p className="text-sm font-medium pb-2">Kategori</p>
                {categoryError && <p className="text-xs text-red-600">{categoryError}</p>}
                <select
                  className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 h-11 px-3 text-sm dark:text-white"
                  value={courseDetails.category}
                  onChange={(e) => setCourseDetails({ ...courseDetails, category: e.target.value })}
                  disabled={!sortedCategories.length}
                >
                  {!sortedCategories.length && <option value="">Kategori bulunamadı</option>}
                  {sortedCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => setCategoryManagerOpen(true)}>
                    Kategori Yönetimi
                  </Button>
                </div>
              </label>
              <label className="flex flex-col w-full">
                <p className="text-sm font-medium pb-2">Zorluk Seviyesi</p>
                <select
                  className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 h-11 px-3 text-sm dark:text-white"
                  value={courseDetails.level}
                  onChange={(e) => setCourseDetails({ ...courseDetails, level: e.target.value })}
                >
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Right Content (Curriculum Editor) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Müfredat Editörü</h3>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">Sürükle bırak ile dersleri düzenleyin.</p>
              </div>
              <Button
                onClick={addUnit}
                variant="primary"
                size="sm"
                className="shadow-md"
                icon={<span className="material-symbols-outlined text-[20px]">add_circle</span>}
              >
                Yeni Bölüm
              </Button>
            </div>

            {/* Curriculum List */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="curriculum-units" type="UNIT">
                {(provided) => (
                  <div className="flex flex-col gap-6" ref={provided.innerRef} {...provided.droppableProps}>
                    {curriculum.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">library_add</span>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz bir bölüm eklenmedi.</p>
                      </div>
                    )}

                    {curriculum.map((unit, unitIndex) => (
                      <Draggable key={unit.id} draggableId={unit.id} index={unitIndex}>
                        {(unitProvided) => (
                          <div
                            className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden"
                            ref={unitProvided.innerRef}
                            {...unitProvided.draggableProps}
                          >
                            {/* Unit Header */}
                            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-3 w-full">
                                <span className="material-symbols-outlined text-gray-400 cursor-grab hover:text-gray-600" {...unitProvided.dragHandleProps}>drag_indicator</span>
                                <input
                                  className="font-bold text-text-light dark:text-text-dark bg-transparent border-none focus:ring-0 p-0 w-full"
                                  value={unit.title}
                                  onChange={(e) => updateUnitTitle(unit.id, e.target.value)}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                  {unit.items.length} İçerik
                                </span>
                                <button onClick={() => deleteUnit(unit.id)} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 transition-colors">
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </div>
                            </div>

                            {/* Items List */}
                            <Droppable droppableId={`items-${unit.id}`} type="ITEM">
                              {(itemProvided, snapshot) => (
                                <div
                                  className={`p-4 pt-2 flex flex-col gap-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                                  ref={itemProvided.innerRef}
                                  {...itemProvided.droppableProps}
                                >
                                  {unit.items.length === 0 && (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 py-6 text-center text-sm text-subtext-light dark:text-subtext-dark">
                                      <span className="material-symbols-outlined text-3xl text-gray-300">inventory_2</span>
                                      <p className="font-medium">Bu bölümde henüz içerik yok</p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">“İçerik ekle” butonunu kullanarak ders / sınav ekleyin.</p>
                                    </div>
                                  )}
                                  {unit.items.map((item, itemIndex) => (
                                    <Draggable key={item.id} draggableId={`${unit.id}-${item.id}`} index={itemIndex}>
                                      {(itemDragProvided) => (
                                        <div
                                          className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow group"
                                          ref={itemDragProvided.innerRef}
                                          {...itemDragProvided.draggableProps}
                                        >
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="material-symbols-outlined text-gray-300 cursor-grab hover:text-gray-500" {...itemDragProvided.dragHandleProps}>drag_indicator</span>
                                            <div className={`flex items-center justify-center size-9 rounded-lg ${item.type === 'quiz' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                              <span className={`material-symbols-outlined text-[20px] ${getColorForType(item.type)}`}>
                                                {getIconForType(item.type)}
                                              </span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                              <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{item.title}</p>
                                              <div className="flex items-center gap-2 text-[11px] text-subtext-light dark:text-subtext-dark">
                                                <span className="uppercase tracking-widest font-semibold">{item.type === 'text' ? 'Makale' : item.type}</span>
                                                {item.duration && <span>• {item.duration} dk</span>}
                                                {item.attachments && item.attachments.length > 0 && (
                                                  <span className="inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">attach_file</span>
                                                    {item.attachments.length} dosya
                                                  </span>
                                                )}
                                                {item.quiz && (
                                                  <span className="inline-flex items-center gap-1 text-amber-500">
                                                    <span className="material-symbols-outlined text-xs">quiz</span>
                                                    {item.quiz.questions.length} soru
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-4">
                                            {/* Required Toggle */}
                                            <div
                                              className="flex items-center gap-2 cursor-pointer group/toggle"
                                              onClick={() => toggleRequired(unit.id, item.id)}
                                            >
                                              <span className={`text-xs font-medium ${item.isRequired ? 'text-primary' : 'text-gray-400'}`}>
                                                {item.isRequired ? 'Zorunlu' : 'İsteğe Bağlı'}
                                              </span>
                                              <div className={`w-9 h-4 rounded-full relative transition-colors ${item.isRequired ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <div className={`absolute top-0.5 size-3 bg-white rounded-full shadow-sm transition-all ${item.isRequired ? 'left-4.5' : 'left-0.5'}`}></div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                                              <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" onClick={() => openAddItemModal(unit.id, item)}>
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                              </button>
                                              <button onClick={() => deleteItem(unit.id, item.id)} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {itemProvided.placeholder}

                                  {/* Add Item Button */}
                                  <Button
                                    onClick={() => openAddItemModal(unit.id)}
                                    variant="outline"
                                    className="w-full border-dashed border-2 border-gray-300 dark:border-gray-700 text-subtext-light dark:text-subtext-dark hover:border-primary hover:text-primary mt-2"
                                    icon={<span className="material-symbols-outlined text-[20px]">add</span>}
                                  >
                                    İçerik Ekle (Ders / Sınav)
                                  </Button>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn resize overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{editingItem ? 'İçeriği Düzenle' : 'Yeni İçerik Ekle'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetItemModal(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-text-light dark:text-text-dark">İçerik Türü</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['video', 'pdf', 'text', 'quiz'] as ContentType[]).map(type => (
                    <div
                      key={type}
                      onClick={() => setNewItemType(type)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${newItemType === type
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-subtext-light dark:text-subtext-dark'
                        }`}
                    >
                      <span className="material-symbols-outlined">{getIconForType(type)}</span>
                      <span className="text-xs font-bold uppercase">{type === 'text' ? 'Makale' : type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-text-light dark:text-text-dark">Başlık</span>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3 focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder="Örn: HTML Giriş Dersi"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                </label>

                {/* Conditional Fields Based on Type */}
                {newItemType === 'video' && (
                  <VideoDropzone value={newItemVideoAsset} onChange={setNewItemVideoAsset} />
                )}

                {newItemType === 'pdf' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-light dark:text-text-dark">PDF veya doküman bağlantısı</label>
                    <input
                      type="url"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3"
                      placeholder="https://docs.google.com/..."
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                    />
                    <p className="text-xs text-subtext-light dark:text-subtext-dark">İsterseniz dosya bağlantısını aşağıdaki kaynaklar bölümüne de ekleyebilirsiniz.</p>
                  </div>
                )}

                {newItemType === 'text' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light dark:text-text-dark">İçerik</label>
                    <RichTextEditor
                      value={newItemRichText}
                      onChange={setNewItemRichText}
                      placeholder="Metninizi buraya yazın..."
                    />
                  </div>
                )}

                {newItemType === 'quiz' && (
                  <QuizBuilder value={newItemQuiz} onChange={setNewItemQuiz} />
                )}

                {/* Attachment Resources */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">Ek Kaynaklar</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Kaynak adı"
                        value={newAttachmentName}
                        onChange={(e) => setNewAttachmentName(e.target.value)}
                        className="form-input text-xs rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                      <input
                        type="url"
                        placeholder="https://"
                        value={newAttachmentUrl}
                        onChange={(e) => setNewAttachmentUrl(e.target.value)}
                        className="form-input text-xs rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                      <Button size="sm" variant="outline" onClick={addAttachmentResource} disabled={!newAttachmentName || !newAttachmentUrl}>
                        Ekle
                      </Button>
                    </div>
                  </div>
                  {newItemAttachments.length > 0 && (
                    <ul className="space-y-2">
                      {newItemAttachments.map(att => (
                        <li key={att.id} className="flex items-center justify-between text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                          <span className="truncate">{att.name}</span>
                          <button className="text-xs text-red-500 hover:text-red-700" onClick={() => removeAttachmentResource(att.id)}>
                            Sil
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-text-light dark:text-text-dark">Süre / Soru Sayısı</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3 focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder="Dakika cinsinden süre"
                    value={newItemDuration}
                    onChange={(e) => setNewItemDuration(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button
                onClick={() => { setIsModalOpen(false); resetItemModal(); }}
                variant="outline"
              >
                İptal
              </Button>
              <Button
                onClick={addItem}
                variant="primary"
                className="shadow-md"
                disabled={!newItemTitle}
              >
                {editingItem ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {categoryManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kategori Yönetimi</h3>
              <button onClick={() => setCategoryManagerOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex gap-3 mb-3">
              <input className="flex-1 border rounded p-2" placeholder="Ara..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
              <input className="border rounded p-2 text-sm" placeholder="Yeni kategori" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              <Button size="sm" onClick={async () => {
                if (!newCategoryName.trim()) return;
                await apiClient.createCategory({ name: newCategoryName.trim(), parentId: null });
                setNewCategoryName('');
                await loadCategories();
              }}>Ekle</Button>
            </div>
            <div className="space-y-2">
              {categories
                .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .sort((a, b) => a.order - b.order)
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between border rounded p-2"
                    draggable
                    onDragStart={(e) => onCategoryDragStart(e, c.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onCategoryDrop(e, c.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400">drag_indicator</span>
                      <input className="border rounded px-2 py-1" value={c.name} onChange={async (e) => {
                        const v = e.target.value;
                        setCategories(prev => prev.map(x => x.id === c.id ? { ...x, name: v } : x));
                        await apiClient.updateCategory(c.id, { name: v });
                      }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={courseDetails.category === c.name ? 'primary' : 'outline'}
                        onClick={() => {
                          setCourseDetails(prev => ({ ...prev, category: c.name }));
                          setCategoryManagerOpen(false);
                        }}
                      >
                        {courseDetails.category === c.name ? 'Seçili' : 'Seç'}
                      </Button>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={(parentDrafts[c.id] ?? null) ?? ''}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const targetParent = pid === '' ? null : Number(pid);
                          setParentDrafts(prev => ({ ...prev, [c.id]: targetParent }));
                        }}
                      >
                        <option value="">Üst kategori yok</option>
                        {categories.filter(x => x.id !== c.id).map(x => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyParent(c.id)}
                        disabled={(parentDrafts[c.id] ?? null) === (c.parentId ?? null)}
                      >
                        Uygula
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAskDeleteCategory(c)}>Kaldır</Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {deleteCategoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Kategoriyi Kaldır</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emin misiniz? Bu işlem geri alınamaz.</p>
            </div>
            <div className="mb-4">
              <p className="text-sm">Seçilen kategori: <span className="font-medium">{deleteCategoryConfirm.name}</span></p>
              <p className="text-xs text-amber-600">Bu kategoride {deleteCategoryConfirm.count} eğitim bulundu. Mevcut eğitimler etkilenmez, sadece kategori listeden kaldırılır.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteCategoryConfirm(null)}>İptal</Button>
              <Button variant="primary" onClick={async () => {
                await apiClient.deleteCategory(Number(deleteCategoryConfirm.id));
                setDeleteCategoryConfirm(null);
                await loadCategories();
              }}>Kaldır</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
