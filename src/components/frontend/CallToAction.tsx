import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { useAuthStore } from '../../stores/authStore';

export const CallToAction: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleCTAClick = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  const getTitle = () => {
    if (isAuthenticated && user) {
      return `Hoş Geldiniz, ${user.firstName}!`;
    }
    return 'Kariyerinize Bugün Yön Verin!';
  };

  const getDescription = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        return 'Admin panelinizden tüm sistemi yönetebilir, kullanıcıları ve kursları düzenleyebilirsiniz.';
      } else if (user.role === 'instructor') {
        return 'Eğitmen panelinizden kurslarınızı oluşturabilir ve öğrencilerinizi yönetebilirsiniz.';
      } else {
        return 'Öğrenci panelinizden kurslarınıza erişebilir ve öğrenme yolculuğunuza devam edebilirsiniz.';
      }
    }
    return 'Hayalinizdeki kariyere ulaşmak için ilk adımı atın. Binlerce öğrenci arasına katılın ve potansiyelinizi ortaya çıkarın.';
  };

  const getCTAText = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        return 'Admin Paneline Git';
      } else if (user.role === 'instructor') {
        return 'Eğitmen Paneline Git';
      } else {
        return 'Öğrenci Paneline Git';
      }
    }
    return 'Hemen Başla';
  };

  return (
    <section className="w-full mt-10 sm:mt-16">
      <div className="bg-gradient-to-r from-primary to-[#0F766E] dark:from-primary/90 dark:to-[#0F766E]/90 rounded-xl p-8 sm:p-12 text-center text-white flex flex-col items-center gap-6 shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-bold">{getTitle()}</h2>
        <p className="max-w-2xl text-gray-100 text-lg">
          {getDescription()}
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleCTAClick}
          className="hover:bg-white hover:text-[#0F766E] group"
        >
          <span>{getCTAText()}</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform ml-2">arrow_forward</span>
        </Button>
      </div>
    </section>
  );
};