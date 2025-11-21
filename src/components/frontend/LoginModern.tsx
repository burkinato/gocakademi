import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Page } from '../../types';
import { Button } from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

interface LoginProps {
  onNavigate: (page: Page) => void;
  onLogin?: (email: string, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Şifre gereklidir');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Real-time validation
  useEffect(() => {
    if (email && !isValidating) {
      const timer = setTimeout(() => {
        validateEmail(email);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [email, isValidating]);

  useEffect(() => {
    if (password && !isValidating) {
      const timer = setTimeout(() => {
        validatePassword(password);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [password, isValidating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setIsValidating(false);
      return;
    }

    const result = await login(email, password, false);
    setIsValidating(false);

    if (result.success) {
      // Success is handled by useAuth hook
    } else {
      // Error is handled by useAuth hook
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;

    const labels = ['', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
    const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669'];

    return {
      strength,
      label: labels[strength] || '',
      color: colors[strength] || ''
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className={`${styles['login-container']} flex min-h-screen items-center justify-center p-4`}>
      <div className={`${styles['login-card']} w-full max-w-md p-8`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h1>
          <p className="text-gray-600">Eğitim platformuna giriş yapın</p>
        </div>

        {/* Error Message */}
        {error?.message && (
          <div className={`${styles['error-message']} flex items-center gap-2`} role="alert" aria-live="assertive">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div className={`${styles['form-group']}`}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              className={`${styles['form-input']} ${emailError ? styles.error : ''} ${email && !emailError ? styles.success : ''}`}
              placeholder=" "
              disabled={loading}
              autoComplete="email"
              autoFocus
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            <label htmlFor="email" className={styles['form-label']}>
              E-posta Adresi
            </label>
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password Field */}
          <div className={`${styles['form-group']}`}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              className={`${styles['form-input']} ${passwordError ? styles.error : ''} ${password && !passwordError ? styles.success : ''}`}
              placeholder=" "
              disabled={loading}
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            <label htmlFor="password" className={styles['form-label']}>
              Şifre
            </label>
            <button
              type="button"
              className={styles['password-toggle']}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
            {passwordError && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Şifre Gücü:</span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(passwordStrength.strength / 5) * 100}%`,
                    backgroundColor: passwordStrength.color 
                  }}
                />
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
            </label>
            <button
              type="button"
              onClick={() => toast('Şifre sıfırlama özelliği yakında eklenecek!')}
              className="text-sm text-teal-600 hover:text-teal-500 font-medium"
            >
              Şifremi unuttum?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`${styles['submit-button']} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">veya</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => toast('Google ile giriş yakında eklenecek!')}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button
            type="button"
            onClick={() => toast('LinkedIn ile giriş yakında eklenecek!')}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">LinkedIn</span>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-teal-600 hover:text-teal-500 font-medium"
          >
            Kayıt olun
          </button>
        </p>
      </div>
    </div>
  );
};