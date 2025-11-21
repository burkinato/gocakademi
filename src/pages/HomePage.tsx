import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/frontend/Hero';
import { Features } from '../components/frontend/Features';
import { CourseGrid } from '../components/frontend/CourseGrid';
import { Testimonials } from '../components/frontend/Testimonials';
import { FeaturedBlogPosts } from '../components/frontend/FeaturedBlogPosts';
import { CallToAction } from '../components/frontend/CallToAction';
import { Course, BlogPost } from '../types';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleCourseClick = (course: Course) => {
        navigate(`/courses/${course.id}`);
    };

    const handleBlogPostClick = (post: BlogPost) => {
        navigate(`/blog/${post.id}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            {/* Hero Section - Full Width */}
            <Hero />

            {/* Main Content - Centered Container */}
            <div className="flex justify-center w-full">
                <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 sm:px-10 pb-10">
                    <Features />
                    <CourseGrid onCourseClick={handleCourseClick} />
                    <Testimonials />
                    <FeaturedBlogPosts onPostClick={handleBlogPostClick} />
                    <CallToAction />
                </div>
            </div>
        </div>
    );
};
