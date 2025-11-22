import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLoader } from '../components/shared/PageLoader';
import { AdminCreateCourse } from '../components/admin/AdminCreateCourse';
import { apiClient } from '../services/api';
import { CurriculumUnit, CurriculumItem, ContentType } from '../types';

const transformLessonsToCurriculum = (lessons: any[]): CurriculumUnit[] => {
  const units = new Map<string, CurriculumUnit>();
  lessons
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .forEach((lesson) => {
      const unitKey = lesson.unit_title || 'Bölüm';
      if (!units.has(unitKey)) {
        units.set(unitKey, {
          id: `unit-${unitKey}-${units.size + 1}`,
          title: unitKey,
          items: [],
        });
      }
      const item: CurriculumItem = {
        id: `lesson-${lesson.id}`,
        title: lesson.title,
        type: (lesson.content_type || 'video') as ContentType,
        duration: lesson.duration ? String(lesson.duration) : '',
        isRequired: lesson.is_required ?? true,
        contentUrl: lesson.video_url || (lesson.content_type === 'pdf' ? lesson.content : undefined),
        textContent: lesson.content_type === 'pdf' ? lesson.content : undefined,
        richTextContent: lesson.content_type === 'text' ? lesson.content : undefined,
        videoAsset: lesson.content_type === 'video' && lesson.video_url
          ? {
              source: 'url',
              name: lesson.video_url,
              size: 0,
              mimeType: 'text/url',
            }
          : null,
        attachments: Array.isArray(lesson.metadata?.attachments) ? lesson.metadata.attachments : [],
        quiz: lesson.metadata?.quiz || undefined,
        metadata: lesson.metadata || {},
      };
      units.get(unitKey)?.items.push(item);
    });

  return Array.from(units.values()).map(unit => ({
    ...unit,
    items: unit.items,
  }));
};

export const AdminCourseContentPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<CurriculumUnit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [courseRes, lessonsRes] = await Promise.all([
          apiClient.getCourse(Number(id)),
          apiClient.client.get(`/courses/${id}/lessons`),
        ]);
        setCourseData(courseRes.data);
        setCurriculum(transformLessonsToCurriculum(lessonsRes.data?.data || []));
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Eğitim yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const initialCourse = useMemo(() => {
    if (!courseData) return undefined;
    return {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      level: courseData.level,
      price: courseData.price,
      imageUrl: courseData.image_url,
      isPublished: courseData.is_published,
    };
  }, [courseData]);

  if (loading) return <PageLoader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!courseData) return null;

  return (
    <AdminCreateCourse
      mode="edit"
      courseId={Number(id)}
      initialCourse={initialCourse}
      initialCurriculum={curriculum}
    />
  );
};
