import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { PageLoader } from '../components/shared/PageLoader';
import { apiClient } from '../services/api';

export const AdminCourseContentPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const courseData = await apiClient.getCourse(Number(id));
        setCourse(courseData.data);
        const lessonData = await apiClient.client.get(`/courses/${id}/lessons`);
        setLessons(lessonData.data?.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const [unitTitle, setUnitTitle] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicType, setTopicType] = useState<'video' | 'pdf' | 'text'>('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [duration, setDuration] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const addTopic = async () => {
    try {
      const body = [{
        title: topicTitle,
        unitTitle: unitTitle || 'Bölüm',
        contentType: topicType,
        videoUrl: topicType === 'video' ? videoUrl : undefined,
        content: topicType === 'text' ? textContent : undefined,
        isRequired: true,
        duration: duration ? parseInt(duration) || null : null,
      }];
      await apiClient.client.post(`/courses/${id}/lessons`, { lessons: body });
      const lessonData = await apiClient.client.get(`/courses/${id}/lessons`);
      setLessons(lessonData.data?.data || []);
      setTopicTitle(''); setVideoUrl(''); setTextContent(''); setPdfUrl(''); setDuration('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course?.title} • İçerik Yönetimi</h1>
          <p className="text-sm text-gray-500">Üniteler, konular (video/PDF/metin) ve değerlendirmeler.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/courses')}>Geri</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Ünite ve Konu Ekle</h3>
          <div className="space-y-3">
            <input className="w-full border rounded-lg p-2" placeholder="Ünite Başlığı" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} />
            <input className="w-full border rounded-lg p-2" placeholder="Konu Başlığı" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} />
            <select className="w-full border rounded-lg p-2" value={topicType} onChange={(e) => setTopicType(e.target.value as any)}>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="text">Metin</option>
            </select>
            {topicType === 'video' && (
              <>
                <input className="w-full border rounded-lg p-2" placeholder="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <input className="w-full border rounded-lg p-2" placeholder="Süre (dk)" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </>
            )}
            {topicType === 'pdf' && (
              <input className="w-full border rounded-lg p-2" placeholder="PDF URL" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
            )}
            {topicType === 'text' && (
              <textarea className="w-full border rounded-lg p-2 min-h-24" placeholder="Metin İçerik" value={textContent} onChange={(e) => setTextContent(e.target.value)} />
            )}
            <Button variant="primary" onClick={addTopic}>Ekle</Button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Üniteler ve Konular</h3>
          <div className="space-y-4">
            {lessons.length === 0 && <div className="p-6 text-gray-500">Henüz içerik eklenmemiş.</div>}
            {lessons.map((l) => (
              <div key={l.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{l.unit_title || 'Bölüm'}</div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-gray-500">{l.content_type || '—'} {l.duration ? `• ${l.duration} dk` : ''}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Düzenle</Button>
                  <Button variant="ghost" size="sm">Sil</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};