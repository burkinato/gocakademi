import React from 'react';
import { Page } from '../../types';
export const Footer: React.FC = () => {
  return (
    <footer className="w-full flex justify-center border-t border-gray-200 dark:border-gray-800 mt-10 sm:mt-16 bg-white dark:bg-background-dark/50">
      <div className="flex flex-col gap-10 px-5 py-12 @container w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">

          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
              <div className="size-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Eğitim Platformu</h2>
            </div>
            <p className="text-subtext-light dark:text-subtext-dark text-sm">
              Geleceğinizi şekillendirmek için en iyi eğitimler bir tık uzağınızda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-text-light dark:text-text-dark">Hızlı Bağlantılar</h3>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Hakkımızda</a>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Eğitimler</a>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Blog</a>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Yardım Merkezi</a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-text-light dark:text-text-dark">Yasal</h3>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Kullanım Koşulları</a>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Gizlilik Politikası</a>
            <a className="text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="#">Çerez Politikası</a>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-text-light dark:text-text-dark">İletişim</h3>
            <a className="flex items-center justify-center md:justify-start gap-2 text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="mailto:destek@egitimplatformu.com">
              <span className="material-symbols-outlined !text-[18px]">email</span>
              <span>destek@egitimplatformu.com</span>
            </a>
            <a className="flex items-center justify-center md:justify-start gap-2 text-subtext-light dark:text-subtext-dark text-sm hover:text-primary dark:hover:text-secondary transition-colors" href="tel:+902121234567">
              <span className="material-symbols-outlined !text-[18px]">call</span>
              <span>+90 212 123 45 67</span>
            </a>
            <div className="flex items-center justify-center md:justify-start gap-2 text-subtext-light dark:text-subtext-dark text-sm">
              <span className="material-symbols-outlined !text-[18px]">location_on</span>
              <span>Bilgi Sk. No:123, İstanbul, Türkiye</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">
            © 2024 Eğitim Platformu. Tüm hakları saklıdır.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:scale-110 transition-transform">
              <img alt="Facebook" className="w-6 h-6 dark:invert opacity-70 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB50Mg03VPp-zdqXBou4zYABwBfzEkQmMejn1utUnJQZYgFjurM25LF2L9X1wGtifgUdJkI-OakxASglW6X4HUE2PnZgTNfFJFk9_9zHXKdf_rA2I5PnnYbn10k7yjZUqy-BS50SnxPl2e0-T01IIUCCXP1GWr9G4-weVmnlwLnHO6WBgVtIcNAejFnh2fckmivczy5PryQQQlqMKrUrcYb3wQiP17PnR4O-Az5C1RqnK4SaqGNP5sSutPAp_ccmGgTnC4dMPt9sFMb" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img alt="Twitter X" className="w-6 h-6 dark:invert opacity-70 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfvaSJJKyphaS3brxTo0QenzOx8JSMtrFDS5lPaylPWULOxPLwnpiUA8MtM2BlR1ptJ5UUmNbmjYeuFmxYF1HceDrm_Fx9wfwS5LPQ7B734RENUhyRAoT5HnNUPHzBS__f3glwNdGJfynhMge-VXH7aaLmmDB0zuCZIktI4eJVhL5gzWbE_jWXiy_R48kSWiqlwmRS4QdioJdB56GUy0PRLexq_WdRtki8tYT0wTU1f0Hv2TjJ6xsc3Xk6M0wbBp4PMISSdkTI3YGn" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img alt="LinkedIn" className="w-6 h-6 dark:invert opacity-70 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXpG-gv_HiUblyHlF96KR0RaD_y9D1Qc0HtfSzlo84GeDlpEoRnO1AmFouMfLw6al4dOnELrKy-IoMAJ0DloLg6R_y5wf05-1Gq-sRxTR4KpL-Y-8_AAs97LVoz7pFQAxhTFozXlnuBuHjacs4hwsejuw7t83OT06NJ5niOZYCJ_nakGeiOq2GYgq3ARhpD0uK2UYydNuUaYegljCza3VtdkrteEYSpNQjr8HCbIZ2gBBLcvKB06tARuLiA_Ebjy21S1jv2aU7eU6d" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img alt="Instagram" className="w-6 h-6 dark:invert opacity-70 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9H59CeL4663Nx4nScw4M_X5Bas2h2xvJyDAgBkEgl0YflcEb42l6vZuQoQh7M5TfedlVndJSdbfNs-_CsfvYxabTMYHlSd-xtDFsD2vEHxdS07buadPhyv_QfcPOSxTso-y8DrtmnGFe1UAya5ko2pOCPf52grqx7cREQ0zUscKt0R-O3MunTeOQ199akRvEtdgsoZkNEL1NcX19oS-D36cW-LuLtoQrOVhYOi6k84yyQxzSXBht8e9owS9XSsNcFVLQoRmkYdEXG" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};