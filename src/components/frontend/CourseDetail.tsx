
import React from 'react';
import { Course } from '../../types';
import { Button } from '../shared/Button';

interface CourseDetailProps {
  course: Course;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  return (
    <div className="flex justify-center w-full bg-background-light dark:bg-background-dark">
      <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a className="text-subtext-light dark:text-subtext-dark text-sm font-medium leading-normal hover:text-primary" href="#">Anasayfa</a>
          <span className="text-subtext-light dark:text-subtext-dark text-sm font-medium leading-normal">/</span>
          <a className="text-subtext-light dark:text-subtext-dark text-sm font-medium leading-normal hover:text-primary" href="#">{course.category}</a>
          <span className="text-subtext-light dark:text-subtext-dark text-sm font-medium leading-normal">/</span>
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Left Column (Course Details) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* PageHeading */}
            <div className="flex flex-col gap-3">
              <h1 className="text-text-light dark:text-text-dark text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                {course.title}
              </h1>
              <p className="text-subtext-light dark:text-subtext-dark text-lg font-normal leading-normal">
                Sıfırdan ileri seviyeye modern yetkinlikler kazanın ve kariyerinize yön verin. Bu eğitim {course.level} seviyesindedir.
              </p>
            </div>

            {/* ProfileHeader */}
            <div className="flex p-0 @container">
              <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD0cVDGlbZKRfQBilT4HxG28R0txbw_K8_EZLgy2vnMp3wE2b_MhuGUQffw5ksEYaeBpBy863t2okIuFt__mytetQ6fNR_Hp6H7Jutbr9_JaTYNiv63Y_iOvfsj8JQy8i5jfetQ_ZMubCSiuIr1lcjZpfJLR3NCoFR8KLGVyt9sNy-OJ9tx-IUbjdibIW3oajWF2AA_gGBqvzgvIjDXy9bQ2MNLgcKHMdHXRC1LHNuPvnLU8rfpkspssLSQ3F69QCyK_pyOEAMuMg8q")' }}></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">{course.instructor}</p>
                    <p className="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">Kıdemli Eğitmen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: `'FILL' ${i < Math.floor(course.rating) ? 1 : 0}` }}>star</span>
                    ))}
                  </div>
                  <span className="text-subtext-light dark:text-subtext-dark text-sm ml-1 font-medium">{course.rating} ({course.reviewCount} öğrenci)</span>
                </div>
              </div>
            </div>

            {/* Video Player / Course Thumbnail */}
            <div className="w-full aspect-video rounded-xl bg-gray-900 flex items-center justify-center relative overflow-hidden group shadow-lg">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                src={course.imageUrl}
                alt={course.title}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
              <button className="absolute z-10 text-white bg-primary/90 rounded-full p-5 hover:bg-primary hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,51,102,0.5)]">
                <span className="material-symbols-outlined text-5xl">play_arrow</span>
              </button>
            </div>

            {/* Tabs (About, Curriculum, etc.) */}
            <div className="w-full">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-6 -mb-px overflow-x-auto">
                  <a className="py-4 px-1 border-b-2 border-primary text-primary font-bold text-base whitespace-nowrap" href="#">Müfredat</a>
                  <a className="py-4 px-1 border-b-2 border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark hover:border-gray-300 dark:hover:border-gray-600 font-medium text-base whitespace-nowrap transition-colors" href="#">Hakkında</a>
                  <a className="py-4 px-1 border-b-2 border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark hover:border-gray-300 dark:hover:border-gray-600 font-medium text-base whitespace-nowrap transition-colors" href="#">Eğitmen</a>
                  <a className="py-4 px-1 border-b-2 border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark hover:border-gray-300 dark:hover:border-gray-600 font-medium text-base whitespace-nowrap transition-colors" href="#">Yorumlar</a>
                </nav>
              </div>

              {/* Curriculum Content (Accordion) */}
              <div className="mt-8 space-y-4">
                {/* Unit 1 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-background-dark/50">
                  <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-text-light dark:text-text-dark">Ünite 1: Giriş ve Temeller</span>
                        <span className="text-sm text-subtext-light dark:text-subtext-dark">3 Ders • 45dk</span>
                      </div>
                      <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                    </summary>
                    <ul className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark/30">
                      <li className="flex justify-between items-center p-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-primary">play_circle</span>
                          <span className="text-text-light dark:text-text-dark text-sm sm:text-base font-medium">1.1 - Eğitime Genel Bakış</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="hidden sm:block text-xs font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">Önizleme</button>
                          <span className="text-sm text-subtext-light dark:text-subtext-dark">10:32</span>
                        </div>
                      </li>
                      <li className="flex justify-between items-center p-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-subtext-light">lock</span>
                          <span className="text-text-light dark:text-text-dark text-sm sm:text-base font-medium">1.2 - Temel Kavramlar</span>
                        </div>
                        <span className="text-sm text-subtext-light dark:text-subtext-dark">15:10</span>
                      </li>
                      <li className="flex justify-between items-center p-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-secondary">quiz</span>
                          <span className="text-text-light dark:text-text-dark text-sm sm:text-base font-medium">Quiz: Bölüm Sonu Değerlendirme</span>
                        </div>
                        <span className="text-sm text-subtext-light dark:text-subtext-dark">5 Soru</span>
                      </li>
                    </ul>
                  </details>
                </div>

                {/* Unit 2 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-background-dark/50">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-text-light dark:text-text-dark">Ünite 2: İleri Teknikler</span>
                        <span className="text-sm text-subtext-light dark:text-subtext-dark">5 Ders • 2sa 15dk</span>
                      </div>
                      <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                    </summary>
                    <ul className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark/30 p-4">
                      <p className="text-sm text-subtext-light dark:text-subtext-dark italic">Bu bölümü görüntülemek için eğitimi satın almalısınız.</p>
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Purchase Box) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-6 shadow-lg">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="text-4xl font-black text-text-light dark:text-text-dark">
                    {course.price.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} TL
                  </p>
                  <p className="text-lg text-subtext-light dark:text-subtext-dark line-through decoration-2 decoration-red-400">
                    {(course.price * 1.5).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} TL
                  </p>
                  <span className="ml-auto text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded uppercase tracking-wide">
                    %33 İndirim
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Sepete Ekle
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Hemen Satın Al
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-subtext-light dark:text-subtext-dark">
                  <span className="material-symbols-outlined !text-[16px] text-secondary">verified_user</span>
                  <span>30 Gün İçinde Para İade Garantisi</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-bold text-lg mb-4 text-text-light dark:text-text-dark">Bu Eğitim İçeriği:</h3>
                  <ul className="space-y-3 text-sm text-subtext-light dark:text-subtext-dark font-medium">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">play_circle</span>
                      <span>12 Saat Video İçerik</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                      <span>25 İndirilebilir Kaynak</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">smartphone</span>
                      <span>Mobil ve TV'den Erişim</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">workspace_premium</span>
                      <span>Bitirme Sertifikası</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">all_inclusive</span>
                      <span>Ömür Boyu Erişim</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
