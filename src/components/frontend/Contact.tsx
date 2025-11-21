
import React from 'react';
import { Button } from '../shared/Button';

export const Contact: React.FC = () => {
  return (
    <div className="flex justify-center w-full bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* PageHeading */}
        <div className="text-center mb-12">
          <h1 className="text-text-light dark:text-text-dark text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Bizimle İletişime Geçin</h1>
          <p className="mt-4 max-w-2xl mx-auto text-subtext-light dark:text-subtext-dark text-lg font-normal leading-normal">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için aşağıdaki formu doldurabilir veya iletişim bilgilerimizden bize ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-900/50 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <form action="#" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-base font-medium leading-normal pb-2 text-text-light dark:text-text-dark" htmlFor="name">Ad Soyad</label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-4 text-base font-normal leading-normal"
                  id="name"
                  name="name"
                  placeholder="Adınızı ve soyadınızı girin"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-base font-medium leading-normal pb-2 text-text-light dark:text-text-dark" htmlFor="email">E-posta Adresi</label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-4 text-base font-normal leading-normal"
                  id="email"
                  name="email"
                  placeholder="E-posta adresinizi girin"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-base font-medium leading-normal pb-2 text-text-light dark:text-text-dark" htmlFor="subject">Konu</label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark h-14 placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-4 text-base font-normal leading-normal"
                  id="subject"
                  name="subject"
                  placeholder="Mesajınızın konusunu girin"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-base font-medium leading-normal pb-2 text-text-light dark:text-text-dark" htmlFor="message">Mesajınız</label>
                <textarea
                  className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark p-4 text-base font-normal leading-normal"
                  id="message"
                  name="message"
                  placeholder="Mesajınızı buraya yazın..."
                  rows={5}
                ></textarea>
              </div>
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Mesajı Gönder
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Adres</h3>
                  <p className="text-subtext-light dark:text-subtext-dark">Teknoloji Parkı, A Blok, No: 123, 34768 İstanbul, Türkiye</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Telefon</h3>
                  <p className="text-subtext-light dark:text-subtext-dark">+90 (216) 123 45 67</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">E-posta</h3>
                  <p className="text-subtext-light dark:text-subtext-dark">destek@egitimplatformu.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video shadow-md">
              <img
                alt="Ofisin konumunu gösteren harita"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCoH4MrfVpo6xsUqFuLAHdGoghx3VdRE0lQrOSvBHuDOWKXc6mTDlOt_Tnt8P_ZRbb9kfs23SxbS2ofKDt1AiqVW3qwRXvhu-IPX0Da8gWCgflTcguw6mDE-p1lO6j9RfNBic3plSOzukvT3YXuXI8k_Fe62nTtOBB0AEitya_pW2EtlF5nJ51x5LvTqHxPfBrsgz9YTVlknRZyp_4Y00gH5tU4gj5UAch3x7pHNVvjH1dGx528jh5CXNM87NYFJyIn7t2C6E5_Psh"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Bizi Takip Edin</h3>
              <div className="flex items-center space-x-4">
                <a className="text-subtext-light dark:text-subtext-dark hover:text-primary dark:hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" href="#">
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path></svg>
                </a>
                <a className="text-subtext-light dark:text-subtext-dark hover:text-primary dark:hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" href="#">
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a className="text-subtext-light dark:text-subtext-dark hover:text-primary dark:hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" href="#">
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
