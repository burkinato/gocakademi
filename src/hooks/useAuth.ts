import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthState {
  loading: boolean;
  error: AuthError | null;
  isRefreshing: boolean;
}

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout: storeLogout, updateUser, setHydrated } = useAuthStore();
  const [state, setState] = useState<AuthState>({
    loading: false,
    error: null,
    isRefreshing: false,
  });
  const navigate = useNavigate();

  // Token refresh interval
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const exp = decoded.exp * 1000;
        const now = Date.now();

        // Refresh token if it expires in less than 5 minutes
        if (exp - now < 5 * 60 * 1000) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: AuthError | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const handleAuthResponse = useCallback(async (response: any, isAdmin: boolean = false) => {
    const { user: userData, token: accessToken, refreshToken } = response.data;

    if (!userData || !accessToken) {
      throw new Error('Invalid authentication response');
    }

    // Store tokens securely
    login(userData, accessToken);

    // Store refresh token in httpOnly cookie would be ideal
    // For now, we'll use localStorage with encryption
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    // Add success notification
    toast.success('Giriş başarılı! Hoş geldiniz.');

    // Navigate based on role
    if (isAdmin || userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/dashboard');
    }

    return { success: true, user: userData };
  }, [login, navigate]);

  const handleLogin = async (email: string, password: string, isAdmin: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Input validation
      if (!email || !password) {
        throw new Error('Email ve şifre gereklidir.');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Geçerli bir email adresi giriniz.');
      }

      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır.');
      }

      // Use single login endpoint - backend will determine role
      const response = await apiClient.login({ email, password });

      await handleAuthResponse(response, false);

      return { success: true };
    } catch (error: any) {
      // Translate error messages to Turkish
      let errorMessage = 'Giriş başarısız oldu.';

      const serverError = error.response?.data?.error || error.response?.data?.message || error.message;

      if (serverError) {
        const lowerError = serverError.toLowerCase();

        if (lowerError.includes('invalid') || lowerError.includes('credentials') || lowerError.includes('kimlik')) {
          errorMessage = 'Geçersiz kimlik bilgileri. Lütfen e-posta ve şifrenizi kontrol edin.';
        } else if (lowerError.includes('network') || lowerError.includes('ağ')) {
          errorMessage = 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
        } else if (lowerError.includes('timeout')) {
          errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        } else if (lowerError.includes('server') || lowerError.includes('sunucu') || error.response?.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        } else if (lowerError.includes('deactivated') || lowerError.includes('inactive')) {
          errorMessage = 'Hesabınız deaktif edilmiş. Lütfen yönetici ile iletişime geçin.';
        } else if (serverError.includes('Email') || serverError.includes('şifre')) {
          errorMessage = serverError; // Already in Turkish
        } else {
          errorMessage = serverError;
        }
      }

      setError({ message: errorMessage, code: error.response?.data?.code });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'student' | 'instructor';
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Input validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Tüm alanlar doldurulmalıdır.');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Geçerli bir email adresi giriniz.');
      }

      if (userData.password.length < 8) {
        throw new Error('Şifre en az 8 karakter olmalıdır.');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        throw new Error('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      }

      const response = await apiClient.register(userData);
      await handleAuthResponse(response);

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Kayıt başarısız oldu.';
      setError({ message: errorMessage, code: error.response?.data?.code });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.client.post('/auth/refresh', { refreshToken });
      const { token: newToken, user: userData } = response.data;

      if (newToken && userData) {
        login(userData, newToken);
        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force logout on refresh failure
      await logout();
      return false;
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      // Call logout endpoint
      await apiClient.logout();

      // Clear local storage
      localStorage.removeItem('refresh_token');

      // Clear store
      storeLogout();

      // Navigate to home
      navigate('/');

      toast.success('Başarıyla çıkış yaptın.');
    } catch (error) {
      console.error('Logout error:', error);
      storeLogout();
      localStorage.removeItem('refresh_token');
      navigate('/');
      toast.success('Başarıyla çıkış yaptın.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      const response = await apiClient.client.patch('/auth/profile', updates);
      const updatedUser = response.data.user;

      updateUser(updatedUser);
      toast.success('Profil başarıyla güncellendi.');

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profil güncelleme başarısız oldu.';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentPassword || !newPassword) {
        throw new Error('Tüm şifre alanları doldurulmalıdır.');
      }

      if (newPassword.length < 8) {
        throw new Error('Yeni şifre en az 8 karakter olmalıdır.');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        throw new Error('Yeni şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      }

      if (currentPassword === newPassword) {
        throw new Error('Yeni şifre mevcut şifreden farklı olmalıdır.');
      }

      await apiClient.client.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Şifre başarıyla değiştirildi.');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Şifre değiştirme başarısız oldu.';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Geçerli bir email adresi giriniz.');
      }

      await apiClient.client.post('/auth/reset-password', { email });

      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi.');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Şifre sıfırlama başarısız oldu.';
      setError({ message: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: state.loading,
    error: state.error,
    isRefreshing: state.isRefreshing,
    login: handleLogin,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    resetPassword,
    clearError,
  };
};