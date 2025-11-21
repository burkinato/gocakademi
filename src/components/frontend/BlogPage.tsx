
import React, { useState, useMemo } from 'react';
import { Button } from '../shared/Button';
import { BLOG_POSTS } from '../../constants';
import { BlogPost } from '../../types';

interface BlogPageProps {
  onPostClick: (post: BlogPost) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onPostClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mevcut yazılardan benzersiz kategorileri çıkar
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(BLOG_POSTS.map(post => post.category)));
    return ['Tümü', ...uniqueCategories];
  }, []);

  // Filtreleme Mantığı
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'Tümü' || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="flex justify-center w-full bg-background-light dark:bg-background-dark">
      <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 md:px-10 py-5">

        {/* Header Section */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              Blog & Haberler
            </h1>
            <p className="text-subtext-light dark:text-subtext-dark text-base font-normal leading-normal">
              Alanında uzman eğitmenlerimizden en son trendleri, ipuçlarını ve haberleri keşfedin.
            </p>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Main Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 px-4">

          {/* Main Content - Post Grid */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em]">
                {selectedCategory === 'Tümü' ? 'Tüm Yazılar' : `${selectedCategory} Yazıları`}
              </h2>
              <span className="text-sm text-subtext-light dark:text-subtext-dark">{filteredPosts.length} yazı listeleniyor</span>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {filteredPosts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group cursor-pointer" onClick={() => onPostClick(post)}>
                    <div className="overflow-hidden h-48">
                      <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={post.image} alt={post.title} />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{post.category}</span>
                      <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-subtext-light dark:text-subtext-dark flex-grow line-clamp-3">{post.summary}</p>

                      <div className="flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <img className="w-8 h-8 rounded-full mr-3 object-cover" src={post.author.avatar} alt={post.author.name} />
                        <div>
                          <p className="text-sm font-medium text-text-light dark:text-text-dark">{post.author.name}</p>
                          <p className="text-xs text-subtext-light dark:text-subtext-dark">{post.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Sonuç Bulunamadı</h3>
                <p className="text-gray-500 mt-2">Arama kriterlerinize uygun yazı bulunmamaktadır.</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tümü');
                  }}
                  variant="primary"
                  className="mt-6"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            )}

            {/* Pagination (Static for Demo - Hide if no results) */}
            {filteredPosts.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button className="flex items-center justify-center size-10 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="flex items-center justify-center size-10 rounded-lg bg-primary text-white text-sm font-bold">1</button>
                <button className="flex items-center justify-center size-10 rounded-lg text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors">2</button>
                <button className="flex items-center justify-center size-10 rounded-lg border border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 mt-5 lg:mt-0">
            <div className="sticky top-24">
              <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] pb-3 pt-2">
                Arama
              </h3>
              <div className="py-3">
                <label className="flex flex-col w-full h-12">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full ring-1 ring-transparent focus-within:ring-primary/50 transition-all">
                    <div className="text-subtext-light dark:text-subtext-dark flex bg-gray-200 dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none border-none bg-gray-200 dark:bg-gray-800 h-full placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      placeholder="Makalelerde ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pb-3 pt-5">
                <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
                  Kategoriler
                </h3>
                {selectedCategory !== 'Tümü' && (
                  <button
                    onClick={() => setSelectedCategory('Tümü')}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Temizle
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${selectedCategory === cat
                      ? 'bg-primary text-white shadow-md transform scale-105'
                      : 'bg-gray-200 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/10">
                <h4 className="font-bold text-lg text-primary dark:text-white mb-2">Bültene Abone Olun</h4>
                <p className="text-sm text-subtext-light dark:text-subtext-dark mb-4">En son makaleler ve eğitim haberleri e-postanıza gelsin.</p>
                <input type="email" placeholder="E-posta adresiniz" className="w-full p-3 rounded-lg mb-3 text-sm border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                <Button className="w-full py-3 shadow-md" variant="primary">Abone Ol</Button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};
