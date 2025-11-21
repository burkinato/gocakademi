
import React from 'react';
import { Button } from '../shared/Button';
import { TESTIMONIALS } from '../../constants';

export const Testimonials: React.FC = () => {
  return (
    <section className="w-full mt-10 sm:mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end px-4 mb-10 gap-4">
        <div>
          <h2 className="text-text-light dark:text-text-dark text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em]">
            Öğrencilerimiz Ne Diyor?
          </h2>
          <p className="text-subtext-light dark:text-subtext-dark mt-2 max-w-2xl text-sm sm:text-base">
            Mezunlarımızın başarı hikayelerine göz atın ve siz de binlerce mutlu öğrencimiz arasına katılın.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-secondary font-bold text-sm cursor-pointer hover:underline">
          <span>Tüm Hikayeleri Gör</span>
          <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.id}
            className="flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-background-dark/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative group overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="material-symbols-outlined absolute top-6 right-6 text-6xl text-primary/5 dark:text-white/5 rotate-12 select-none group-hover:scale-110 transition-transform">format_quote</span>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined !text-[20px] ${i < testimonial.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                    style={{ fontVariationSettings: `'FILL' ${i < testimonial.rating ? 1 : 0}` }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-text-light dark:text-text-dark text-base italic leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="size-12 rounded-full object-cover ring-2 ring-secondary/20"
              />
              <div>
                <h4 className="text-text-light dark:text-text-dark font-bold text-sm">{testimonial.name}</h4>
                <p className="text-subtext-light dark:text-subtext-dark text-xs font-medium">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile only link */}
      <div className="flex md:hidden justify-center mt-6">
        <Button
          variant="ghost"
          className="text-secondary hover:text-secondary/80"
          icon={<span className="material-symbols-outlined !text-[20px]">arrow_forward</span>}
          iconPosition="right"
        >
          Tüm Hikayeleri Gör
        </Button>
      </div>
    </section>
  );
};
