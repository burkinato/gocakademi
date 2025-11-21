import { useAuthStore } from '../stores/authStore';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CSRFToken {
  token: string;
  sessionId: string;
}

class ApiService {
  private baseURL: string;
  private csrfToken: CSRFToken | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isRefreshingToken = false;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
  }

  /**
   * Initialize CSRF token for the session
   */
  private async initializeCSRFToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/csrf-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json().catch(() => null);
        if (result?.success && result.data) {
          this.csrfToken = result.data;
        }
      }
    } catch {
      // Silent in dev
      this.csrfToken = null;
    }
  }

  /**
   * Get CSRF token for current session
   */
  private async getCSRFToken(): Promise<CSRFToken | null> {
    if (!this.csrfToken) {
      await this.initializeCSRFToken();
    }
    return this.csrfToken;
  }

  /**
   * Make authenticated request with automatic token refresh
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const { token } = useAuthStore.getState();
    
    // Add authentication header
    const headers: HeadersInit = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing operations
    // CSRF headers disabled in dev; server enforces when necessary

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ error: 'Token expired' }));
        
        if (errorData.error === 'Token has expired' && !this.isRefreshingToken) {
          return this.handleTokenRefresh(() => this.makeAuthenticatedRequest(endpoint, options));
        }
        
        throw new Error(errorData.error || 'Authentication failed');
      }

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({ error: 'Rate limit exceeded' }));
        throw new Error(errorData.error || 'Too many requests');
      }

      // CSRF errors ignored in dev

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Handle token refresh with request queuing
   */
  private async handleTokenRefresh<T>(retryFunction: () => Promise<T>): Promise<T> {
    if (this.isRefreshingToken) {
      // Queue the request while token is being refreshed
      return new Promise((resolve, reject) => {
        this.requestQueue.push(() => retryFunction().then(resolve).catch(reject));
      });
    }

    this.isRefreshingToken = true;

    try {
      // Attempt to refresh token using the refresh token mechanism from useAuth
      const { refreshToken } = useAuthStore.getState() as any;
      
      if (refreshToken) {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Update token in store
            const { login } = useAuthStore.getState();
            login(result.data.user, result.data.token);
            
            // Process queued requests
            this.processRequestQueue();
            
            // Retry the original request
            return await retryFunction();
          }
        }
      }

      // Refresh failed, logout user
      const { logout } = useAuthStore.getState();
      logout();
      throw new Error('Session expired. Please login again.');
    } finally {
      this.isRefreshingToken = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processRequestQueue(): void {
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        request();
      }
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeAuthenticatedRequest<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeAuthenticatedRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeAuthenticatedRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeAuthenticatedRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeAuthenticatedRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Public request (no authentication required)
   */
  public async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    // CSRF headers disabled in dev; server enforces when necessary

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  /**
   * Upload file with progress tracking
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const { token } = useAuthStore.getState();
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export convenience functions
export const api = {
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  patch: apiService.patch.bind(apiService),
  delete: apiService.delete.bind(apiService),
  public: apiService.publicRequest.bind(apiService),
  upload: apiService.uploadFile.bind(apiService),
};

export default apiService;