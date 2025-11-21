
import React, { useRef } from 'react';
import { Button } from '../shared/Button';
import { BLOG_POSTS } from '../../constants';
import { BlogPost } from '../../types';

interface FeaturedBlogPostsProps {
  onPostClick: (post: BlogPost) => void;
}

export const FeaturedBlogPosts: React.FC<FeaturedBlogPostsProps> = ({ onPostClick }) => {
  const featuredPosts = BLOG_POSTS.filter(post => post.featured);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 320; // Approximate card width + gap

      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="w-full mt-10 sm:mt-16 relative group/slider">
      <div className="px-4 mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-text-light dark:text-text-dark text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em]">
            Öne Çıkan Blog Yazıları
          </h2>
          <p className="text-subtext-light dark:text-subtext-dark mt-2 max-w-3xl">
            Sektörden en son haberler, ipuçları ve kariyer tavsiyeleri.
          </p>
        </div>
        {/* Navigation Buttons */}
        <div className="hidden md:flex gap-2">
          <Button
            onClick={() => scroll('left')}
            variant="outline"
            className="rounded-full p-0 w-10 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white"
            aria-label="Sola kaydır"
            icon={<span className="material-symbols-outlined">chevron_left</span>}
          />
          <Button
            onClick={() => scroll('right')}
            variant="outline"
            className="rounded-full p-0 w-10 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white"
            aria-label="Sağa kaydır"
            icon={<span className="material-symbols-outlined">chevron_right</span>}
          />
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 p-4 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x"
      >
        {featuredPosts.map(post => (
          <div key={post.id} className="snap-start flex flex-col gap-4 rounded-xl bg-white dark:bg-background-dark/50 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 min-w-[300px] md:min-w-[380px] flex-shrink-0 h-full cursor-pointer group" onClick={() => onPostClick(post)}>
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-xl group-hover:opacity-90 transition-opacity"
              style={{ backgroundImage: `url("${post.image}")` }}
            ></div>
            <div className="flex flex-col flex-1 justify-between p-5 pt-1 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">{post.category}</span>
                  <span className="text-xs text-subtext-light dark:text-subtext-dark">{post.readTime}</span>
                </div>
                <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-relaxed mt-2 line-clamp-2">{post.summary}</p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <img className="size-8 rounded-full object-cover" src={post.author.avatar} alt={post.author.name} />
                <span className="text-sm font-medium text-text-light dark:text-text-dark">{post.author.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
