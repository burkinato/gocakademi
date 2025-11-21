
import React from 'react';
import { COURSES } from '../../constants';
import { CourseCard } from './CourseCard';
import { Course } from '../../types';

interface CourseGridProps {
  onCourseClick: (course: Course) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ onCourseClick }) => {
  return (
    <section className="w-full mt-10 sm:mt-16">
      <h2 className="text-text-light dark:text-text-dark text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5">
        En Popüler Eğitimler
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {COURSES.map((course) => (
          <div key={course.id} onClick={() => onCourseClick(course)} className="cursor-pointer h-full">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </section>
  );
};
