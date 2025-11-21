
import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light/90 dark:bg-background-dark/95 backdrop-blur-md transition-all duration-500 ease-in-out">
      <div className="relative flex items-center justify-center mb-6">
        {/* Glowing Background Effect */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-primary/20 dark:bg-primary/30 animate-pulse transform scale-150"></div>
        
        {/* Main Spinner Container */}
        <div className="relative w-24 h-24">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-800"></div>
          
          {/* Animated Spinner */}
          <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent border-r-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Inner Reverse Spinner */}
          <div className="absolute inset-3 rounded-full border-[3px] border-secondary/50 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-primary dark:text-white animate-bounce" style={{ animationDuration: '2s' }}>school</span>
          </div>
        </div>
      </div>
      
      {/* Loading Text & Brand */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <h3 className="text-xl font-bold text-text-light dark:text-text-dark tracking-tight">Eğitim Platformu</h3>
        <div className="flex items-center gap-1.5 h-6">
           <span className="text-sm font-medium text-subtext-light dark:text-subtext-dark">Yükleniyor</span>
           <div className="flex gap-1 pt-1">
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
           </div>
        </div>
      </div>
    </div>
  );
};
