import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useCourseStore } from '../stores/courseStore';
import { useAuthStore } from '../stores/authStore';

export const useCourses = () => {
  const { courses, loading, error, setCourses, setLoading, setError } = useCourseStore();

  const fetchCourses = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getCourses(params);
      if (response.success) {
        setCourses(response.data);
      } else {
        setError(response.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, []);

  return { courses, loading, error, fetchCourses };
};

export const useCourse = (id: number) => {
  const { selectedCourse, loading, error, setSelectedCourse, setLoading, setError } = useCourseStore();
  const { isAuthenticated } = useAuthStore.getState();

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getCourse(id);
      if (response.success) {
        setSelectedCourse(response.data);
      } else {
        setError(response.error || 'Failed to fetch course');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Lütfen giriş yapın');
      setSelectedCourse(null as any);
      return;
    }
    fetchCourse();
  }, [id, isAuthenticated]);

  return { course: selectedCourse, loading, error };
};