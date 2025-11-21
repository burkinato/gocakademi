
import React, { useState, useMemo } from 'react';
import { Button } from '../shared/Button';
import { Course, Page } from '../../types';
import { COURSES } from '../../constants';
import { CourseCard } from './CourseCard';

interface CoursesPageProps {
  onCourseClick: (course: Course) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onCourseClick }) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);

  // Extract unique categories and levels from data
  const categories = useMemo(() => Array.from(new Set(COURSES.map(c => c.category))), []);
  const levels = useMemo(() => Array.from(new Set(COURSES.map(c => c.level))), []);

  // Filtering Logic
  const filteredCourses = useMemo(() => {
    return COURSES.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];
      const matchesRating = course.rating >= minRating;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });
  }, [searchTerm, selectedCategories, selectedLevels, priceRange, minRating]);

  // Handlers
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="flex justify-center w-full bg-gray-50 dark:bg-background-dark min-h-screen">
      <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 sm:px-6 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">Eğitimlerimiz</h1>
          <p className="text-subtext-light dark:text-subtext-dark">Geleceğinizi şekillendirecek {filteredCourses.length} eğitim bulundu.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark">Filtrele</h3>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                    setSelectedLevels([]);
                    setPriceRange([0, 1000]);
                    setMinRating(0);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:underline font-medium p-0 h-auto hover:bg-transparent"
                >
                  Temizle
                </Button>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                  <input
                    type="text"
                    placeholder="Eğitim ara..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-text-light dark:text-text-dark mb-3">Kategoriler</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                        {selectedCategories.includes(cat) && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-text-light dark:text-text-dark mb-3">Seviye</h4>
                <div className="space-y-2">
                  {levels.map(lvl => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedLevels.includes(lvl) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                        {selectedLevels.includes(lvl) && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedLevels.includes(lvl)}
                        onChange={() => toggleLevel(lvl)}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-text-light dark:text-text-dark mb-3">Minimum Puan</h4>
                <div className="flex flex-col gap-2">
                  {[4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(minRating === star ? 0 : star)}
                      className={`flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors ${minRating === star ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
                    >
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined !text-[18px]" style={{ fontVariationSettings: `'FILL' ${i < star ? 1 : 0}` }}>star</span>
                        ))}
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">& Üzeri</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range (Visual Only for now as simple inputs) */}
              <div>
                <h4 className="font-semibold text-sm text-text-light dark:text-text-dark mb-3">Fiyat Aralığı</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Min"
                    min="0"
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Max"
                    max="10000"
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* Results Grid */}
          <div className="w-full lg:w-3/4">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} onClick={() => onCourseClick(course)}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Sonuç Bulunamadı</h3>
                <p className="text-gray-500 mt-2">Arama kriterlerinize uygun eğitim bulunmamaktadır. Filtreleri temizlemeyi deneyin.</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                    setSelectedLevels([]);
                    setPriceRange([0, 1000]);
                    setMinRating(0);
                  }}
                  variant="primary"
                  className="mt-6"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
