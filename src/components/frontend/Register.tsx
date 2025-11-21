
import React from 'react';
import { Button } from '../shared/Button';
import { Page } from '../../types';

interface RegisterProps {
  onNavigate: (page: Page) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-80px)]">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#0F172A] lg:flex">
        <img
          alt="Students studying"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKmAy3ti_mQclx3x4zxIAHkkp2z9pxRfdu8T3ROVVHT3y2uB_PbVY0qBzSJ8RwysAOypwNCKPTxi_QcYbJTdBCs9Izwtt3k_wSfrOh1BjdeUWWjaOyJ2co4xxaeKJ1Ggt7fFkRTqLQwwBRWjWqmW5Kc5Vevoj0gLuiIHHINukI2apg6Khh-fcxI6_ZskEtRbs65sPcNjO0NVB7M3Rg1KYuTdn9jIzm-tkT2-dvUMrFdZgon1K1t41fLh5kN6QDzInRz-kCOE-_lBcA"
        />
        <div className="relative z-10 flex flex-col items-start p-16 text-white max-w-xl">
          <h2 className="text-3xl font-bold mb-8 cursor-pointer" onClick={() => onNavigate('home')}>Eğitim Platformu</h2>
          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">Potansiyelini Keşfet.</h1>
          <p className="text-lg text-gray-300">Hemen aramıza katılın ve binlerce profesyonel eğitim içeriğine sınırsız erişim sağlayın.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-1 items-center justify-center lg:w-1/2 bg-background-light dark:bg-background-dark">
        <div className="flex w-full max-w-md flex-col px-6 sm:px-8 py-10">
          <div className="w-full">
            <h1 className="text-text-light dark:text-text-dark tracking-tight text-[32px] font-bold leading-tight text-left pb-1 pt-6">
              Hesap Oluştur
            </h1>
            <p className="text-subtext-light dark:text-subtext-dark text-base font-normal leading-normal pb-6">
              Ücretsiz hesabınızı oluşturun ve öğrenmeye başlayın.
            </p>

            {/* Tabs */}
            <div className="pb-3">
              <div className="flex border-b border-gray-200 dark:border-gray-700 gap-8">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-subtext-light dark:text-subtext-dark pb-[13px] pt-4 px-2 hover:text-text-light dark:hover:text-text-dark transition-colors"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Giriş Yap</p>
                </button>
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-[13px] pt-4 px-2">
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Hesap Oluştur</p>
                </button>
              </div>
            </div>

            <form className="space-y-5 py-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">Ad Soyad</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-[15px] text-base font-normal leading-normal"
                    placeholder="Adınız ve Soyadınız"
                    type="text"
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">E-posta Adresi</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-[15px] text-base font-normal leading-normal"
                    placeholder="ornek@eposta.com"
                    type="email"
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">Şifre</p>
                  <div className="relative flex w-full flex-1 items-stretch">
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-[15px] text-base font-normal leading-normal pr-12"
                      placeholder="En az 8 karakter"
                      type="password"
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-subtext-light dark:text-subtext-dark hover:text-primary" type="button">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Kayıt Ol
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background-light dark:bg-background-dark px-2 text-subtext-light dark:text-subtext-dark">Veya şununla kayıt olun:</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-4 text-sm font-medium text-text-light dark:text-text-dark shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path><path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"></path><path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"></path><path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.191,35.216,48,29.692,48,24C48,22.659,47.862,21.35,47.611,20.083z" fill="#1976D2"></path>
                </svg>
                <span>Google</span>
              </button>
              <button className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-4 text-sm font-medium text-text-light dark:text-text-dark shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" fill="#0288D1"></path><path d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" fill="#FFF"></path>
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-subtext-light dark:text-subtext-dark">
              Zaten bir hesabınız var mı?{' '}
              <button onClick={() => onNavigate('login')} className="font-semibold leading-6 text-primary hover:text-primary/80">
                Giriş Yap
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
