import React from 'react';
import { FEATURES } from '../../constants';

export const Features: React.FC = () => {
  return (
    <section className="w-full mt-10 sm:mt-16">
      <div className="text-center px-4">
        <h2 className="text-text-light dark:text-text-dark text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em]">
          Neden Biz?
        </h2>
        <p className="text-subtext-light dark:text-subtext-dark mt-2 max-w-3xl mx-auto">
          Kariyer hedeflerinize ulaşmanız için en doğru adres. Alanında uzman eğitmenler, güncel içerikler ve esnek öğrenme imkanları ile fark yaratıyoruz.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 mt-8">
        {FEATURES.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center size-12 rounded-full bg-secondary/20 text-secondary mb-4">
              <span className="material-symbols-outlined">{feature.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{feature.title}</h3>
            <p className="text-subtext-light dark:text-subtext-dark mt-2 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};