import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { HERO_SLIDES } from '../../constants';
import { useAuthStore } from '../../stores/authStore';

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

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
    <section
      className="w-full relative h-[500px] md:h-[700px] overflow-hidden group bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
            }`}
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${slide.image}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background-dark/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/20" /> {/* Additional slight darkening for text pop */}
          </div>

          {/* Content */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 sm:px-16 max-w-5xl mx-auto gap-6 sm:gap-8">
            <h1 className={`text-white text-4xl sm:text-5xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-2xl transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              {slide.title}
            </h1>
            <p className={`text-gray-100 text-base sm:text-lg md:text-2xl font-medium leading-relaxed max-w-3xl drop-shadow-lg transition-all duration-700 delay-500 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              {slide.subtitle}
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="mt-4 sm:mt-6 delay-700 translate-y-0 opacity-100"
            >
              {getCTAText()}
            </Button>
          </div>
        </div>
      ))}

      {/* Navigation Arrows (Hidden on Mobile) */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 size-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95 group/arrow focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Önceki Slayt"
      >
        <span className="material-symbols-outlined text-4xl transition-transform group-hover/arrow:-translate-x-1">chevron_left</span>
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 size-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95 group/arrow focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Sonraki Slayt"
      >
        <span className="material-symbols-outlined text-4xl transition-transform group-hover/arrow:translate-x-1">chevron_right</span>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4 p-3 rounded-full">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-transparent ${index === currentSlide
              ? 'w-12 bg-secondary shadow-[0_0_10px_rgba(0,196,154,0.6)] scale-100 cursor-default'
              : 'w-3 bg-white/40 hover:bg-white hover:w-4 hover:scale-110 cursor-pointer'
              }`}
            aria-label={`Slayt ${index + 1}'e git`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  );
};