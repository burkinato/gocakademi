import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Page } from '../../types';
import { Button } from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import reactLogo from '../../assets/react.svg';

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

    // Backend will determine if this is an admin login based on credentials
    const result = await login(email, password, false);
    setIsValidating(false);

    if (result.success) {
      // Success toast is already shown by useAuth hook
      // Navigation is handled by useAuth hook based on user role
    } else {
      // Error toast is already shown by useAuth hook
      // No need to show duplicate notification
    }
  };

  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-80px)]">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#0F172A] lg:flex">
        <img
          alt="Illustration"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          src={reactLogo}
        />
        <div className="relative z-10 flex flex-col items-start p-16 text-white max-w-xl">
          <h2 className="text-3xl font-bold mb-8 cursor-pointer" onClick={() => onNavigate('home')}>Eğitim Platformu</h2>
          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">Geleceğin Becerilerini Bugün Öğrenin.</h1>
          <p className="text-lg text-gray-300">Kariyerinizi bir sonraki seviyeye taşıyacak, sektör liderleri tarafından hazırlanan kurslara katılın.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-1 items-center justify-center lg:w-1/2 bg-gradient-to-br from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex w-full max-w-md flex-col px-6 sm:px-8 py-10">
          <div className="w-full">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Tekrar Hoş Geldiniz!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Hesabınıza giriş yaparak öğrenmeye devam edin.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700 gap-8">
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-[13px] pt-4 px-2 transition-all duration-200">
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Giriş Yap</p>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-subtext-light dark:text-subtext-dark pb-[13px] pt-4 px-2 hover:text-text-light dark:hover:text-text-dark transition-all duration-200 hover:border-b-gray-300 dark:hover:border-b-gray-600"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Hesap Oluştur</p>
                </button>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {error?.message && (
                <div role="alert" aria-live="assertive" className="flex items-start gap-3 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg animate-pulse">
                  <span className="material-symbols-outlined text-red-600 flex-shrink-0 mt-0.5">error</span>
                  <div>
                    <p className="font-medium">Giriş Hatası</p>
                    <p className="mt-1">{error.message}</p>
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <input
                    id="email"
                    className={`form-input w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${emailError ? 'border-red-500 animate-shake' : 'border-gray-300 dark:border-gray-600'} ${email && !emailError ? 'border-green-500' : ''}`}
                    placeholder="ornek@eposta.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateEmail(email)}
                    disabled={loading}
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {email && !emailError && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p id="email-error" className="text-sm text-red-600 animate-fade-in">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    className={`form-input w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-300 dark:border-gray-600'} ${password && !passwordError ? 'border-green-500' : ''}`}
                    placeholder="Şifrenizi girin"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => validatePassword(password)}
                    disabled={loading}
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-teal-600 transition-colors duration-200" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    <span className="material-symbols-outlined transition-transform duration-200">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  {password && !passwordError && (
                    <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                    </div>
                  )}
                </div>
                {passwordError && (
                  <p id="password-error" className="text-sm text-red-600 animate-fade-in">{passwordError}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition-colors"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                  />
                  <span className="ml-2 block text-sm text-gray-600 dark:text-gray-400">Beni Hatırla</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast('Şifre sıfırlama özelliği yakında eklenecek!')}
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors duration-200"
                >
                  Şifremi unuttum?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading || !!emailError || !!passwordError}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">veya</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => toast('Google ile giriş yakında eklenecek!')}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path><path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"></path><path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"></path><path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.191,35.216,48,29.692,48,24C48,22.659,47.862,21.35,47.611,20.083z" fill="#1976D2"></path>
                </svg>
                <span>Google</span>
              </button>
              <button 
                onClick={() => toast('LinkedIn ile giriş yakında eklenecek!')}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" fill="#0288D1"></path><path d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" fill="#FFF"></path>
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-subtext-light dark:text-subtext-dark">
              Hesabınız yok mu?{' '}
              <button onClick={() => onNavigate('register')} className="font-semibold leading-6 text-primary hover:text-primary/80 transition-colors duration-200">
                Kayıt Olun
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
