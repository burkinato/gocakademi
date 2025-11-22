import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { toast } from 'react-hot-toast';

import { Course } from '../../types';
import { apiClient } from '../../services/api';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

const normalizeCourse = (raw: any): Course => ({
  id: raw.id,
  title: raw.title,
  instructor: raw.instructor || raw.instructorName || 'Bilinmiyor',
  rating: raw.rating ?? raw.averageRating ?? 0,
  reviewCount: raw.reviewCount ?? raw.studentCount ?? 0,
  price: Number(raw.price) || 0,
  imageUrl: raw.imageUrl || raw.image_url || FALLBACK_COVER,
  category: raw.category || 'Genel',
  level: LEVEL_LABELS[raw.level as keyof typeof LEVEL_LABELS] || raw.level || 'Başlangıç',
  description: raw.description || '',
  duration: raw.duration ?? null,
  isPublished: raw.isPublished ?? raw.is_published ?? true,
  createdAt: raw.createdAt || raw.created_at,
  updatedAt: raw.updatedAt || raw.updated_at,
});

export const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCourse, setConfirmCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getCourses({ includeAll: true });
        if (res?.success) {
          setCourses((res.data || []).map(normalizeCourse));
        } else {
          setError(res?.error || 'Eğitimler yüklenemedi');
        }
      } catch (e: any) {
        setError(e?.message || 'Eğitimler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        if (response?.success && Array.isArray(response.data)) {
          setCategories(response.data.map((cat: any) => ({ id: cat.id, name: cat.name })));
        }
      } catch {
        // silently ignore; categories optional
      }
    };

    fetchCourses();
    fetchCategories();
  }, []);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return courses.filter(course => {
      const matchesSearch =
        term.length === 0 ||
        course.title.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term);

      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' ? course.isPublished : !course.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, categoryFilter, statusFilter]);

  const handleDeleteCourse = async () => {
    if (!confirmCourse) return;
    setIsDeleting(true);
    try {
      const response = await apiClient.deleteCourse(confirmCourse.id);
      if (response?.success) {
        setCourses(prev => prev.filter(c => c.id !== confirmCourse.id));
        toast.success('Eğitim başarıyla silindi');
        setConfirmCourse(null);
      } else {
        throw new Error(response?.error || 'Delete failed');
      }
    } catch (err: any) {
      console.error('Course delete failed:', err);
      toast.error('Eğitim silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) =>
    `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;

  const formatDate = (value?: string) => {
    if (!value) return 'Tarih bulunamadı';
    return new Date(value).toLocaleDateString('tr-TR');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">Eğitim Yönetimi</h1>
          <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">Tüm eğitimlerinizi buradan yönetin, düzenleyin veya yeni eğitim ekleyin.</p>
        </div>
        <Button
          onClick={() => navigate('/admin/create-course')}
          variant="primary"
          className="shadow-md"
          icon={<span className="material-symbols-outlined">add</span>}
        >
          Yeni Eğitim Oluştur
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 shadow-sm space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Eğitim adı, kategori veya açıklama ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <select
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          >
            <option value="all">Durum: Tümü</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
      </div>

      {/* Courses Cards */}
      <div className="space-y-4">
        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse h-64" />
            ))}
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center text-sm text-subtext-light dark:text-subtext-dark">
            Filtrelerle eşleşen eğitim bulunamadı. Lütfen arama kriterlerini değiştirin.
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map(course => {
              const isPublished = course.isPublished ?? true;
              return (
                <div key={course.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={course.imageUrl || FALLBACK_COVER}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                      }}
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${isPublished
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {isPublished ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-subtext-light dark:text-subtext-dark">
                          {course.category}
                        </p>
                        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-500 hover:text-primary"
                          title="Düzenle"
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Sil"
                          onClick={() => setConfirmCourse(course)}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-subtext-light dark:text-subtext-dark line-clamp-3">
                      {course.description || 'Açıklama bulunamadı.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-text-light dark:text-text-dark">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                        <span>{formatPrice(course.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                        <span>{course.duration ? `${course.duration} saat` : 'Süre belirsiz'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                        <span>{formatDate(course.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-sm text-subtext-light dark:text-subtext-dark">
          Toplam {filteredCourses.length} eğitim listeleniyor
        </div>
      </div>
      {confirmCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">Eğitimi Sil</h3>
            <p className="text-sm text-subtext-light dark:text-subtext-dark mb-4">
              <span className="font-medium text-text-light dark:text-text-dark">"{confirmCourse.title}"</span> eğitimini silmek üzeresiniz.
              Bu işlem geri alınamaz. Emin misiniz?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => !isDeleting && setConfirmCourse(null)} disabled={isDeleting}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 border-red-600"
                isLoading={isDeleting}
                onClick={handleDeleteCourse}
              >
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
