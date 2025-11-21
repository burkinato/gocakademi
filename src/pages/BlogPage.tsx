import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPage as BlogComponent } from '../components/frontend/BlogPage';
import { BlogPost } from '../types';

export const BlogPage: React.FC = () => {
    const navigate = useNavigate();

    const handlePostClick = (post: BlogPost) => {
        navigate(`/blog/${post.id}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <BlogComponent onPostClick={handlePostClick} />
        </div>
    );
};
