import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CourseDetail } from '../components/frontend/CourseDetail';
import { Course } from '../types';
// In a real app, we would fetch this from an API
import { COURSES } from '../constants';

export const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (id) {
            const foundCourse = COURSES.find(c => c.id === Number(id));
            setCourse(foundCourse || null);
        }
    }, [id]);

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            {course ? (
                <CourseDetail course={course} />
            ) : (
                <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-500">
                    Kurs bulunamadı.
                </div>
            )}
        </div>
    );
};
