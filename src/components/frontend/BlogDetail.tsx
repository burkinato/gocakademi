
import React from 'react';
import { BlogPost, Page } from '../../types';
import { Button } from '../shared/Button';

interface BlogDetailProps {
  post: BlogPost;
  onNavigate: (page: Page) => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ post, onNavigate }) => {
  return (
    <div className="flex justify-center w-full bg-background-light dark:bg-background-dark">
      <div className="layout-content-container flex flex-col w-full max-w-4xl px-4 py-5 sm:py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-subtext-light dark:text-subtext-dark mb-6">
          <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('home')}>Anasayfa</span>
          <span>/</span>
          <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('blog')}>Blog</span>
          <span>/</span>
          <span className="text-text-light dark:text-text-dark font-medium truncate max-w-[200px] sm:max-w-none">{post.title}</span>
        </div>

        {/* Headline */}
        <h1 className="text-text-light dark:text-text-dark tracking-tight text-3xl md:text-4xl font-black leading-tight text-left pb-4">
          {post.title}
        </h1>

        {/* Meta Data */}
        <div className="flex flex-wrap items-center gap-4 bg-transparent min-h-14 justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm"
              style={{ backgroundImage: `url("${post.author.avatar}")` }}
            ></div>
            <div className="flex flex-col">
              <p className="text-text-light dark:text-text-dark text-base font-bold leading-none">{post.author.name}</p>
              <p className="text-subtext-light dark:text-subtext-dark text-xs mt-1">{post.author.role}</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-[18px]">calendar_today</span>
            <p className="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">{post.date} · {post.readTime}</p>
          </div>
        </div>

        {/* Hero Image */}
        <div
          className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-64 md:min-h-[400px] mb-8 shadow-sm"
          style={{ backgroundImage: `url("${post.image}")` }}
        ></div>

        {/* Article Body */}
        <article
          className="prose prose-lg max-w-none dark:prose-invert text-text-light dark:text-text-dark prose-headings:text-text-light dark:prose-headings:text-text-dark prose-p:text-text-light dark:prose-p:text-gray-300 prose-strong:text-text-light dark:prose-strong:text-white prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social Share and Author Bio */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Social Share */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-text-light dark:text-text-dark">Paylaş:</span>
              <a className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.029A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </a>
              <a className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.72-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.81 1.91 3.58-.71-.02-1.37-.22-1.95-.54v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21c7.34 0 11.35-6.08 11.35-11.35 0-.17 0-.34-.01-.51.78-.56 1.45-1.26 1.99-2.05z"></path></svg>
              </a>
              <a className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
            </div>
          </div>

          {/* Author Bio Card */}
          <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <img alt={post.author.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20" src={post.author.avatar} />
            <div className="text-center sm:text-left">
              <p className="font-bold text-lg text-text-light dark:text-text-dark">{post.author.name}</p>
              <p className="text-sm text-primary font-medium uppercase tracking-wide">{post.author.role}</p>
              <p className="mt-3 text-sm text-subtext-light dark:text-subtext-dark leading-relaxed">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="my-12 p-8 sm:p-10 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl text-center border border-primary/5">
          <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">Zamanınızı Yönetmeyi Öğrenin!</h3>
          <p className="mt-3 text-subtext-light dark:text-gray-300 max-w-2xl mx-auto">
            Bu ilkeleri ve daha fazlasını derinlemesine öğrenmek için "Etkili Zaman Yönetimi" eğitimimize katılın ve potansiyelinizi en üst düzeye çıkarın.
          </p>
          <Button
            onClick={() => onNavigate('courses')}
            variant="primary"
            size="lg"
            className="mt-8 mx-auto shadow-lg hover:scale-105"
          >
            Eğitimi İncele
          </Button>
        </div>

        {/* Comments Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-8 flex items-center gap-2">
            <span>Yorumlar</span>
            <span className="text-base font-normal text-subtext-light dark:text-subtext-dark">(3)</span>
          </h2>

          {/* Comment Form */}
          <div className="mb-10">
            <textarea className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 focus:border-primary focus:ring-primary dark:text-white transition-colors" placeholder="Yorumunuzu buraya yazın..." rows={4}></textarea>
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                size="sm"
                className="shadow-md"
              >
                Yorum Yap
              </Button>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-8">
            {/* Comment 1 */}
            <div className="flex items-start gap-4">
              <img alt="User Mehmet Kaya" className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtavvGqE4i4jW68zdWkvlFsSVeD_Z3tTHeyiey9U5oat6sEjI72xKJQaQmg6fwzWu5m9I4gGahvdftsRL7kSS8d_x2fig7eCvsiNk1onqztE5FOBKCbFh7IFinwwabt4UOEt7DFAZOV2zM9SHASfQU1Z5FliCwqC-JW8xtFCglU5qlhTF6u1se6BsuforrrXheIWXL4jePY4dVtZuBIJy3a1vCbLuyXeMhygJXC3QCVQuGkWlvWACX578WeePoKtV0ZLVCfx6h8Gq_" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-text-light dark:text-text-dark">Mehmet Kaya</p>
                  <span className="text-xs text-subtext-light dark:text-subtext-dark">• 2 gün önce</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg rounded-tl-none">Harika bir yazı! Özellikle Eisenhower Matrisi hayatımı değiştirdi diyebilirim. Teşekkürler Ayşe Hanım.</p>
                <div className="flex gap-4 mt-2 text-xs font-medium text-subtext-light dark:text-subtext-dark">
                  <button className="hover:text-primary">Yanıtla</button>
                  <button className="hover:text-primary">Beğen</button>
                </div>
              </div>
            </div>

            {/* Comment 2 (Reply) */}
            <div className="flex items-start gap-4 pl-8 sm:pl-16 border-l-2 border-gray-100 dark:border-gray-800 ml-4">
              <img alt="Author Ayşe Yılmaz" className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTUGYAWjvZwk9c32OMyQBqPhvCYtO-NiWC1Z7QaNFXwJNY0FEobm9WDfu1fNFjbPvYx3Y1DoyqmOeaFqcSLth3dsM3zHL2r_HNG6ksbIyXO_gs0aOwjrxmDpx3VtWdLzogIvvbHm_53vDpWojJm-6PEGqAw0uWhsQa2fvoOTQSlMPMbG7_XZJ4_lxveg-6UdetMbLrFNahB6XvtS7Hf9AXA1nGnS902zFgN9sWssBsHWFucd3pADa7239ehKuoZh1NFXdltll48Z04" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-text-light dark:text-text-dark">Ayşe Yılmaz <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">YAZAR</span></p>
                  <span className="text-xs text-subtext-light dark:text-subtext-dark">• 1 gün önce</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg rounded-tl-none">Beğenmenize çok sevindim Mehmet Bey. Faydalı olabildiyse ne mutlu bana!</p>
                <div className="flex gap-4 mt-2 text-xs font-medium text-subtext-light dark:text-subtext-dark">
                  <button className="hover:text-primary">Yanıtla</button>
                  <button className="hover:text-primary">Beğen</button>
                </div>
              </div>
            </div>

            {/* Comment 3 */}
            <div className="flex items-start gap-4">
              <img alt="User Zeynep Demir" className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJMH0i-9El7F7iJ7Sy_6N0-WZOpSflxl0_MKJY1YZicDRumyn9kA_smALGLvZsFb6nAvf28OSBiER0Fw3ni1UYRz1XDPzSKodG6ECG-g4CmhjgR8902tjFKnJtTNaBJJJHW2XF2jwcffLonm2b-Jujq50oE1-JTM9xCmijWx0J5P-GOQMQZYrz-x9fJ9Spvjl4zhYIdfuLgFNUzmXU8ctMyLLui8NZ9qA4Uy01444AvZC6LP64UQVTgdIVwwIp_gagZFY2J53YNnF3" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-text-light dark:text-text-dark">Zeynep Demir</p>
                  <span className="text-xs text-subtext-light dark:text-subtext-dark">• 5 gün önce</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg rounded-tl-none">Pomodoro tekniğini deneyeceğim. Sürekli dikkatim dağılıyor, umarım işe yarar.</p>
                <div className="flex gap-4 mt-2 text-xs font-medium text-subtext-light dark:text-subtext-dark">
                  <button className="hover:text-primary">Yanıtla</button>
                  <button className="hover:text-primary">Beğen</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
