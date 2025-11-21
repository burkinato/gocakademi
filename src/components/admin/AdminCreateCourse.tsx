import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { apiClient } from '../../services/api';
import { CurriculumUnit, CurriculumItem, ContentType } from '../../types';

export const AdminCreateCourse: React.FC = () => {
  const navigate = useNavigate();
  // Form States
  const [courseDetails, setCourseDetails] = useState({
    title: '',
    description: '',
    category: 'Yazılım',
    level: 'beginner',
    price: '',
    image: null as File | null,
    imagePreview: '' as string,
  });

  // Curriculum State
  const [curriculum, setCurriculum] = useState<CurriculumUnit[]>([
    {
      id: 'u1',
      title: 'Bölüm 1: Giriş',
      items: []
    }
  ]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<ContentType>('video');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('');
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{id:number; name:string; parentId?:number|null; order:number}>>([]);
  const [categoryError, setCategoryError] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{id:string; name:string; count:number}|null>(null);
  const [checkingCategoryCourses, setCheckingCategoryCourses] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      const version = { timestamp: Date.now(), curriculum };
      const versions = JSON.parse(localStorage.getItem('curriculum_versions') || '[]');
      versions.unshift(version);
      localStorage.setItem('curriculum_versions', JSON.stringify(versions.slice(0, 10)));
      localStorage.setItem('curriculum_draft', JSON.stringify(curriculum));
      setAutoSaveMessage('Taslak kaydedildi');
      setTimeout(()=>setAutoSaveMessage(''), 1500);
    }, 800);
    return () => clearTimeout(handler);
  }, [curriculum]);

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
    const a = categories.findIndex(c=>String(c.id)===draggedId);
    const b = categories.findIndex(c=>c.id===targetId);
    if (a < 0 || b < 0) return;
    const next = [...categories];
    const [item] = next.splice(a,1);
    next.splice(b,0,item);
    const ordered = next.map((c,i)=>({ ...c, order: i }));
    setCategories(ordered);
    await apiClient.reorderCategories(ordered.map(c=>({ id: c.id, order_index: c.order })));
  };

  const handleAskDeleteCategory = async (cat: {id:number; name:string}) => {
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
      setCategories(rows.map((r:any)=>({ id: r.id, name: r.name, parentId: r.parent_id, order: r.order_index })));
      setCategoryError('');
    } catch (e:any) {
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
    const allowed = ['image/png','image/jpeg','image/jpg'];
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

  const openAddItemModal = (unitId: string) => {
    setActiveUnitId(unitId);
    setNewItemType('video');
    setNewItemTitle('');
    setNewItemDuration('');
    setNewItemContent('');
    setIsModalOpen(true);
  };

  const addItem = () => {
    if (!activeUnitId || !newItemTitle) return;

    const newItem: CurriculumItem = {
      id: `i${Date.now()}`,
      title: newItemTitle,
      type: newItemType,
      duration: newItemDuration,
      isRequired: true, // Default to mandatory
      contentUrl: newItemType === 'video' ? newItemContent : undefined,
      textContent: newItemType === 'text' ? newItemContent : undefined,
    };

    setCurriculum(curriculum.map(unit => {
      if (unit.id === activeUnitId) {
        return { ...unit, items: [...unit.items, newItem] };
      }
      return unit;
    }));

    setIsModalOpen(false);
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
          <p className="text-3xl font-bold tracking-tight">Yeni Eğitim Oluştur</p>
          <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">Eğitim detaylarını girin ve profesyonel müfredatınızı oluşturun.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-text-light dark:text-text-dark"
          >
            Önizleme
          </Button>
          <Button
            variant="primary"
            className="shadow-md"
            onClick={async () => {
              const { user, token } = JSON.parse(localStorage.getItem('auth-storage') || '{}').state || {};
              const payload = {
                title: courseDetails.title,
                description: courseDetails.description,
                category: courseDetails.category,
                level: courseDetails.level,
                price: parseFloat(courseDetails.price || '0'),
                duration: 0,
                imageUrl: '',
                isPublished: true,
                instructorId: user?.id || 1,
                curriculum,
              };
              try {
                const res = await fetch('/api/courses', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('auth-storage') ? { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') as string).state.token}` } : {}),
                  },
                  body: JSON.stringify(payload),
                });
                const contentType = res.headers.get('content-type') || '';
                let data: any = null;
                if (contentType.includes('application/json')) {
                  const text = await res.text();
                  data = text ? JSON.parse(text) : null;
                }
                if (res.ok && data && data.success) {
                  navigate('/admin/courses');
                } else {
                  console.error('Create course failed', data || { status: res.status });
                }
              } catch (e) {
                console.error('Create course error', e);
              }
            }}
          >
            Kaydet ve Yayınla
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
                >
                  <option>Yazılım</option>
                  <option>Pazarlama</option>
                  <option>Tasarım</option>
                  <option>Kişisel Gelişim</option>
                  <option>İş Dünyası</option>
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
            <div className="flex flex-col gap-6">
              {curriculum.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                  <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">library_add</span>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz bir bölüm eklenmedi.</p>
                </div>
              )}

              {curriculum.map((unit) => (
                <div key={unit.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden">
                  {/* Unit Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400 cursor-grab hover:text-gray-600">drag_indicator</span>
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
                  <div className="p-4 pt-2 flex flex-col gap-2">
                    {unit.items.length === 0 && (
                      <p className="text-sm text-center text-gray-400 py-4 italic">Bu bölümde henüz içerik yok.</p>
                    )}
                    {unit.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="material-symbols-outlined text-gray-300 cursor-grab hover:text-gray-500">drag_indicator</span>
                          <div className={`flex items-center justify-center size-8 rounded-lg ${item.type === 'quiz' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            <span className={`material-symbols-outlined text-[20px] ${getColorForType(item.type)}`}>
                              {getIconForType(item.type)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{item.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-subtext-light dark:text-subtext-dark uppercase tracking-wider font-bold">{item.type === 'text' ? 'Makale' : item.type}</span>
                              {item.duration && <span className="text-[10px] text-gray-400">• {item.duration}</span>}
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
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${item.isRequired ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`absolute top-0.5 size-3 bg-white rounded-full shadow-sm transition-all ${item.isRequired ? 'left-4.5' : 'left-0.5'}`}></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => deleteItem(unit.id, item.id)} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Item Button */}
                    <Button
                      onClick={() => openAddItemModal(unit.id)}
                      variant="outline"
                      className="w-full border-dashed border-2 border-gray-300 dark:border-gray-700 text-subtext-light dark:text-subtext-dark hover:border-primary hover:text-primary"
                      icon={<span className="material-symbols-outlined text-[20px]">add</span>}
                    >
                      İçerik Ekle (Ders / Sınav)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn resize overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Yeni İçerik Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
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
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-sm font-medium text-text-light dark:text-text-dark">Video URL</span>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3 focus:ring-2 focus:ring-primary/50 dark:text-white"
                        placeholder="https://vimeo.com/..."
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                      />
                    </label>
                    <div
                      className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 text-center"
                      onDragOver={(e)=>e.preventDefault()}
                      onDrop={(e)=>{ e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) { const url = URL.createObjectURL(file); setNewItemContent(url);} }}
                    >
                      Video dosyasını buraya sürükleyin veya link girin.
                    </div>
                    {newItemContent && (
                      <video src={newItemContent} controls className="w-full rounded-lg" />
                    )}
                  </div>
                )}

                {newItemType === 'pdf' && (
                  <div className="space-y-2">
                    <input type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3" placeholder="PDF URL" onChange={(e)=>setNewItemContent(e.target.value)} />
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-500 text-center">
                      PDF dosyasını sürükleyip bırakın veya URL girin.
                    </div>
                    {newItemContent && (<a href={newItemContent} target="_blank" rel="noreferrer" className="text-primary text-sm">PDF Önizlemeyi aç</a>)}
                  </div>
                )}

                {newItemType === 'text' && (
                  <label className="block">
                  <span className="text-sm font-medium text-text-light dark:text-text-dark">İçerik</span>
                  <div className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 min-h-24 focus:ring-2 focus:ring-primary/50 dark:text-white" contentEditable role="textbox"
                    onInput={(e) => setNewItemContent((e.target as HTMLDivElement).innerHTML)}
                    suppressContentEditableWarning
                  >
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700" onClick={() => setNewItemContent(prev => prev + '<b>Kalın</b>')}>Kalın</button>
                    <button type="button" className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700" onClick={() => setNewItemContent(prev => prev + '<i>İtalik</i>')}>İtalik</button>
                    <button type="button" className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700" onClick={() => setNewItemContent(prev => prev + '<code>code</code>')}>Kod</button>
                  </div>
                </label>
                )}

                {newItemType === 'quiz' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      Sınav sorularını içerik eklendikten sonra düzenleyebilirsiniz.
                    </p>
                  </div>
                )}

              <label className="block">
                <span className="text-sm font-medium text-text-light dark:text-text-dark">Süre / Soru Sayısı</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-3 focus:ring-2 focus:ring-primary/50 dark:text-white"
                  placeholder="Örn: 15dk veya 10 Soru"
                  value={newItemDuration}
                  onChange={(e) => setNewItemDuration(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
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
              Ekle
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
              <button onClick={()=>setCategoryManagerOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex gap-3 mb-3">
              <input className="flex-1 border rounded p-2" placeholder="Ara..." value={categorySearch} onChange={(e)=>setCategorySearch(e.target.value)} />
              <input className="border rounded p-2 text-sm" placeholder="Yeni kategori" value={newCategoryName} onChange={(e)=>setNewCategoryName(e.target.value)} />
              <Button size="sm" onClick={async ()=>{
                if (!newCategoryName.trim()) return;
                await apiClient.createCategory({ name: newCategoryName.trim(), parentId: null });
                setNewCategoryName('');
                await loadCategories();
              }}>Ekle</Button>
            </div>
            <div className="space-y-2">
              {categories
                .filter(c=>c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .sort((a,b)=>a.order-b.order)
                .map(c=> (
                  <div key={c.id} className="flex items-center justify-between border rounded p-2"
                    draggable
                    onDragStart={(e)=>onCategoryDragStart(e,c.id)}
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={(e)=>onCategoryDrop(e,c.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400">drag_indicator</span>
                      <input className="border rounded px-2 py-1" value={c.name} onChange={async (e)=>{
                        const v = e.target.value;
                        setCategories(prev=>prev.map(x=>x.id===c.id?{...x,name:v}:x));
                        await apiClient.updateCategory(c.id, { name: v });
                      }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="border rounded px-2 py-1 text-sm" value={c.parentId || ''} onChange={async (e)=>{
                        const pid = e.target.value || '';
                        const parentId = pid === '' ? null : Number(pid);
                        setCategories(prev=>prev.map(x=>x.id===c.id?{...x,parentId}:x));
                        await apiClient.updateCategory(c.id, { parent_id: parentId });
                      }}>
                        <option value="">Üst kategori yok</option>
                        {categories.filter(x=>x.id!==c.id).map(x=> (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </select>
                      <Button size="sm" variant="ghost" onClick={()=>handleAskDeleteCategory(c)}>Kaldır</Button>
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
              <Button variant="outline" onClick={()=>setDeleteCategoryConfirm(null)}>İptal</Button>
              <Button variant="primary" onClick={async ()=>{
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
