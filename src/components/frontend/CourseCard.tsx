import React from 'react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm training-card group cursor-pointer h-full">
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover transform group-hover:scale-105 transition-transform duration-500"
        style={{ backgroundImage: `url("${course.imageUrl}")` }}
      ></div>
      <div className="p-4 flex flex-col flex-grow relative z-10 bg-white dark:bg-gray-900">
        <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-normal mb-1 flex-grow group-hover:text-primary dark:group-hover:text-secondary transition-colors">
          {course.title}
        </h3>
        <p className="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">
          {course.instructor}
        </p>
        <div className="flex items-center gap-1 mt-2">
          <span className="font-bold text-amber-500">{course.rating}</span>
          <span className="material-symbols-outlined text-amber-500 !text-[18px]">star</span>
          <span className="text-subtext-light dark:text-subtext-dark text-sm ml-1">({course.reviewCount})</span>
        </div>
        <p className="text-text-light dark:text-text-dark text-xl font-bold mt-3">
          {course.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </p>
      </div>
    </div>
  );
};