import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CoursesPage as CoursesComponent } from '../components/frontend/CoursesPage';
import { Course } from '../types';

export const CoursesPage: React.FC = () => {
    const navigate = useNavigate();

    const handleCourseClick = (course: Course) => {
        navigate(`/courses/${course.id}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <CoursesComponent onCourseClick={handleCourseClick} />
        </div>
    );
};
