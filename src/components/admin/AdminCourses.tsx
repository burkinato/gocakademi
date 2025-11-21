import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';

import { Course } from '../../types';
import { apiClient } from '../../services/api';

export const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getCourses();
        setCourses(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Eğitimler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course as any).instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Eğitim adı veya eğitmen ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50">
            <option>Tüm Kategoriler</option>
            <option>Yazılım</option>
            <option>Pazarlama</option>
            <option>Tasarım</option>
          </select>
          <select className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50">
            <option>Durum: Tümü</option>
            <option>Yayında</option>
            <option>Taslak</option>
            <option>Arşiv</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Eğitim Adı</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Kategori</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Fiyat</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Öğrenci</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Puan</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark">Durum</th>
                <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && (
                <tr><td className="px-6 py-4" colSpan={7}>Yükleniyor...</td></tr>
              )}
              {error && (
                <tr><td className="px-6 py-4 text-red-600" colSpan={7}>{error}</td></tr>
              )}
              {!loading && !error && filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-10 rounded-md bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url("${(course as any).imageUrl || ''}")` }}
                      ></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-light dark:text-text-dark line-clamp-1">{course.title}</span>
                        <span className="text-xs text-subtext-light dark:text-subtext-dark">{(course as any).instructor || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-light dark:text-text-dark">
                    {(course.price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </td>
                  <td className="px-6 py-4 text-subtext-light dark:text-subtext-dark">
                    {course.reviewCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="font-bold text-text-light dark:text-text-dark mr-1">{course.rating}</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Yayında
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-primary" title="Düzenle" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Sil">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-subtext-light dark:text-subtext-dark">Toplam {filteredCourses.length} eğitim gösteriliyor</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Önceki</Button>
            <Button variant="outline" size="sm">Sonraki</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
