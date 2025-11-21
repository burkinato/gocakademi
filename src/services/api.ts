import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { apiService } from './apiService';

class EnhancedApiClient {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // CSRF headers disabled in dev; server enforces when necessary

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        if (!error.response) {
          return Promise.reject(new Error('Ağ bağlantı hatası'));
        }
        if (error.response?.status === 401) {
          const errorData = (error.response.data as any) || {};
          // Attempt silent refresh only if explicitly expired
          if (errorData.error === 'Token has expired') {
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              if (refreshToken) {
                const refreshResponse = await this.client.post('/auth/refresh', { refreshToken });
                if (refreshResponse.data.success) {
                  const { token: newToken, user: userData } = refreshResponse.data.data;
                  useAuthStore.getState().login(userData, newToken);
                  const originalRequest = error.config;
                  if (originalRequest) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return this.client(originalRequest);
                  }
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          // Do not force navigation; let UI handle with notifications
          return Promise.reject(error);
        }

        // Handle CSRF errors
        if (error.response?.status === 403 && ((error.response.data as any)?.error || '').includes('CSRF')) {
          console.warn('CSRF token validation failed, retrying...');
          // Retry the request once
          const originalRequest = error.config;
          if (originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            return this.client(originalRequest);
          }
        }

        const message = (error.response.data as any)?.error || `İstek başarısız oldu (${error.response.status})`;
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth methods
  async register(userData: any) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: any) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async adminLogin(credentials: any) {
    const response = await this.client.post('/auth/admin/login', credentials);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  // Course methods
  async getCourses(params?: any) {
    const response = await this.client.get('/courses', { params });
    return response.data;
  }

  async getCourse(id: number) {
    const response = await this.client.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(courseData: any) {
    const response = await this.client.post('/courses', courseData);
    return response.data;
  }

  async updateCourse(id: number, courseData: any) {
    const response = await this.client.put(`/courses/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: number) {
    const response = await this.client.delete(`/courses/${id}`);
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async createCategory(payload: { name: string; parentId?: number | null }) {
    const response = await this.client.post('/admin/categories', payload);
    return response.data;
  }

  async updateCategory(id: number, payload: Partial<{ name: string; parent_id: number | null; order_index: number }>) {
    const response = await this.client.put(`/admin/categories/${id}`, payload);
    return response.data;
  }

  async deleteCategory(id: number) {
    const response = await this.client.delete(`/admin/categories/${id}`);
    return response.data;
  }

  async reorderCategories(order: Array<{ id: number; order_index: number }>) {
    const response = await this.client.patch('/admin/categories/reorder', { order });
    return response.data;
  }

  // ============================================
  // Education Management - Units
  // ============================================
  async getUnitsByCourse(courseId: number) {
    const response = await this.client.get(`/education/courses/${courseId}/units`);
    return response.data;
  }

  async getUnit(id: number) {
    const response = await this.client.get(`/education/units/${id}`);
    return response.data;
  }

  async createUnit(unitData: any) {
    const response = await this.client.post('/education/units', unitData);
    return response.data;
  }

  async updateUnit(id: number, unitData: any) {
    const response = await this.client.put(`/education/units/${id}`, unitData);
    return response.data;
  }

  async deleteUnit(id: number) {
    const response = await this.client.delete(`/education/units/${id}`);
    return response.data;
  }

  async reorderUnits(items: Array<{ id: number; orderIndex: number }>) {
    const response = await this.client.post('/education/units/reorder', { items });
    return response.data;
  }

  // ============================================
  // Education Management - Topics
  // ============================================
  async getTopicsByUnit(unitId: number) {
    const response = await this.client.get(`/education/units/${unitId}/topics`);
    return response.data;
  }

  async getTopic(id: number) {
    const response = await this.client.get(`/education/topics/${id}`);
    return response.data;
  }

  async createTopic(topicData: any) {
    const response = await this.client.post('/education/topics', topicData);
    return response.data;
  }

  async updateTopic(id: number, topicData: any) {
    const response = await this.client.put(`/education/topics/${id}`, topicData);
    return response.data;
  }

  async deleteTopic(id: number) {
    const response = await this.client.delete(`/education/topics/${id}`);
    return response.data;
  }

  async reorderTopics(unitId: number, items: Array<{ id: number; orderIndex: number }>) {
    const response = await this.client.post(`/education/units/${unitId}/topics/reorder`, { items });
    return response.data;
  }

  // ============================================
  // Education Management - Assessments
  // ============================================
  async getAssessmentsByUnit(unitId: number) {
    const response = await this.client.get(`/education/units/${unitId}/assessments`);
    return response.data;
  }

  async getAssessment(id: number, includeQuestions = false) {
    const response = await this.client.get(`/education/assessments/${id}`, {
      params: { includeQuestions }
    });
    return response.data;
  }

  async createAssessment(assessmentData: any) {
    const response = await this.client.post('/education/assessments', assessmentData);
    return response.data;
  }

  async updateAssessment(id: number, assessmentData: any) {
    const response = await this.client.put(`/education/assessments/${id}`, assessmentData);
    return response.data;
  }

  async deleteAssessment(id: number) {
    const response = await this.client.delete(`/education/assessments/${id}`);
    return response.data;
  }

  // ============================================
  // Education Management - Questions
  // ============================================
  async getQuestionsByAssessment(assessmentId: number) {
    const response = await this.client.get(`/education/assessments/${assessmentId}/questions`);
    return response.data;
  }

  async getQuestion(id: number) {
    const response = await this.client.get(`/education/questions/${id}`);
    return response.data;
  }

  async createQuestion(questionData: any) {
    const response = await this.client.post('/education/questions', questionData);
    return response.data;
  }

  async updateQuestion(id: number, questionData: any) {
    const response = await this.client.put(`/education/questions/${id}`, questionData);
    return response.data;
  }

  async deleteQuestion(id: number) {
    const response = await this.client.delete(`/education/questions/${id}`);
    return response.data;
  }

  async reorderQuestions(assessmentId: number, items: Array<{ id: number; orderIndex: number }>) {
    const response = await this.client.post(`/education/assessments/${assessmentId}/questions/reorder`, { items });
    return response.data;
  }

  // ============================================
  // Student Progress Tracking
  // ============================================
  async getCourseProgress(courseId: number) {
    const response = await this.client.get(`/education/courses/${courseId}/progress`);
    return response.data;
  }

  async enrollCourse(courseId: number) {
    const response = await this.client.post(`/education/courses/${courseId}/enroll`);
    return response.data;
  }

  async updateTopicProgress(topicId: number, progressData: { status: string; watchedDuration?: number }) {
    const response = await this.client.post(`/education/topics/${topicId}/progress`, progressData);
    return response.data;
  }

  async submitAssessment(assessmentId: number, submissionData: any) {
    const response = await this.client.post(`/education/assessments/${assessmentId}/submit`, submissionData);
    return response.data;
  }

  async getAssessmentResults(assessmentId: number) {
    const response = await this.client.get(`/education/assessments/${assessmentId}/results`);
    return response.data;
  }
}

export const apiClient = new EnhancedApiClient();