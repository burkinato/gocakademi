/**
 * API Configuration
 * Merkezi API yapılandırma dosyası - tüm API bağlantıları buradan yönetilir
 */

// API Base URL - Production ve Development ortamları için
export const API_CONFIG = {
    // Backend API URL
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

    // Timeout ayarları (milisaniye)
    TIMEOUT: 30000,

    // Retry ayarları
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,

    // Token ayarları
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer',

    // Endpoints
    ENDPOINTS: {
        // Auth
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            PROFILE: '/auth/profile',
            CHANGE_PASSWORD: '/auth/change-password',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
        },

        // Users
        USERS: {
            LIST: '/admin/users',
            GET: (id: number) => `/admin/users/${id}`,
            CREATE: '/admin/users',
            UPDATE: (id: number) => `/admin/users/${id}`,
            DELETE: (id: number) => `/admin/users/${id}`,
        },

        // Students
        STUDENTS: {
            LIST: '/admin/students',
            GET: (id: number) => `/admin/students/${id}`,
            CREATE: '/admin/students',
            UPDATE: (id: number) => `/admin/students/${id}`,
            DELETE: (id: number) => `/admin/students/${id}`,
            ENROLLMENTS: (id: number) => `/admin/students/${id}/enrollments`,
        },

        // Courses
        COURSES: {
            LIST: '/courses',
            GET: (id: number) => `/courses/${id}`,
            CREATE: '/admin/courses',
            UPDATE: (id: number) => `/admin/courses/${id}`,
            DELETE: (id: number) => `/admin/courses/${id}`,
            PUBLISH: (id: number) => `/admin/courses/${id}/publish`,
            UNPUBLISH: (id: number) => `/admin/courses/${id}/unpublish`,
        },

        // Lessons/Units
        LESSONS: {
            LIST: (courseId: number) => `/courses/${courseId}/lessons`,
            GET: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}`,
            CREATE: (courseId: number) => `/admin/courses/${courseId}/lessons`,
            UPDATE: (courseId: number, lessonId: number) => `/admin/courses/${courseId}/lessons/${lessonId}`,
            DELETE: (courseId: number, lessonId: number) => `/admin/courses/${courseId}/lessons/${lessonId}`,
            REORDER: (courseId: number) => `/admin/courses/${courseId}/lessons/reorder`,
        },

        // Assessments/Exams
        ASSESSMENTS: {
            LIST: (courseId: number) => `/courses/${courseId}/assessments`,
            GET: (courseId: number, assessmentId: number) => `/courses/${courseId}/assessments/${assessmentId}`,
            CREATE: (courseId: number) => `/admin/courses/${courseId}/assessments`,
            UPDATE: (courseId: number, assessmentId: number) => `/admin/courses/${courseId}/assessments/${assessmentId}`,
            DELETE: (courseId: number, assessmentId: number) => `/admin/courses/${courseId}/assessments/${assessmentId}`,
            SUBMIT: (courseId: number, assessmentId: number) => `/courses/${courseId}/assessments/${assessmentId}/submit`,
            RESULTS: (courseId: number, assessmentId: number) => `/courses/${courseId}/assessments/${assessmentId}/results`,
        },

        // Categories
        CATEGORIES: {
            LIST: '/categories',
            GET: (id: number) => `/categories/${id}`,
            CREATE: '/admin/categories',
            UPDATE: (id: number) => `/admin/categories/${id}`,
            DELETE: (id: number) => `/admin/categories/${id}`,
            REORDER: '/admin/categories/reorder',
        },

        // Activity Logs
        ACTIVITY_LOGS: {
            LIST: '/admin/activity-logs',
            GET: (id: number) => `/admin/activity-logs/${id}`,
        },

        // File Upload
        FILES: {
            UPLOAD: '/files/upload',
            DELETE: (id: string) => `/files/${id}`,
        },
    },
} as const;

// API Status Messages (Türkçe)
export const API_MESSAGES = {
    // Success messages
    SUCCESS: {
        LOGIN: 'Giriş başarılı!',
        LOGOUT: 'Çıkış başarılı.',
        REGISTER: 'Kayıt başarılı!',
        UPDATE: 'Güncelleme başarılı.',
        DELETE: 'Silme işlemi başarılı.',
        CREATE: 'Oluşturma işlemi başarılı.',
        UPLOAD: 'Dosya yükleme başarılı.',
    },

    // Error messages
    ERROR: {
        NETWORK: 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
        TIMEOUT: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
        UNAUTHORIZED: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        FORBIDDEN: 'Bu işlem için yetkiniz bulunmuyor.',
        NOT_FOUND: 'İstenen kaynak bulunamadı.',
        SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
        VALIDATION: 'Lütfen tüm alanları doğru şekilde doldurun.',
        UNKNOWN: 'Bilinmeyen bir hata oluştu.',
    },

    // Loading messages
    LOADING: {
        DEFAULT: 'Yükleniyor...',
        LOGIN: 'Giriş yapılıyor...',
        SAVING: 'Kaydediliyor...',
        DELETING: 'Siliniyor...',
        UPLOADING: 'Yükleniyor...',
    },
} as const;

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if URL is API URL
export const isApiUrl = (url: string): boolean => {
    return url.startsWith(API_CONFIG.BASE_URL);
};

export default API_CONFIG;
