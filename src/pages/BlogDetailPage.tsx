import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogDetail } from '../components/frontend/BlogDetail';
import { BlogPost } from '../types';
// In a real app, we would fetch this from an API
import { BLOG_POSTS } from '../constants';

export const BlogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        if (id) {
            const foundPost = BLOG_POSTS.find(p => p.id === Number(id));
            setPost(foundPost || null);
        }
    }, [id]);

    const handleNavigate = (page: string) => {
        if (page === 'home') navigate('/');
        else if (page === 'blog') navigate('/blog');
        else navigate(`/${page}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            {post ? (
                <BlogDetail post={post} onNavigate={handleNavigate} />
            ) : (
                <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-500">
                    Blog yazısı bulunamadı.
                </div>
            )}
        </div>
    );
};
