import { create } from 'zustand';
import { Course } from '../types';

interface CourseStore {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
  setCourses: (courses: Course[]) => void;
  setSelectedCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
  setCourses: (courses) => set({ courses }),
  setSelectedCourse: (selectedCourse) => set({ selectedCourse }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));