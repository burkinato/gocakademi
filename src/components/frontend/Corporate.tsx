
import React from 'react';
import { Button } from '../shared/Button';
import { Page } from '../../types';

interface CorporateProps {
  onNavigate: (page: Page) => void;
}

export const Corporate: React.FC<CorporateProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Width */}
      <div className="w-full relative">
        <div
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7Cy8PYWkKJvJz9NawDPaFk_6WMgPYedyuW7Ig5mg7_gwZcFdYTTZhDNC0VXCOcupcjsGu75nuYhnduQg7Xh63ChWtxcr908OzjfU8vWZqKfU9-_vsysWD8QA_SiGJHDwPnWp-1rkksQWztwhxHHljJqRwRV_pedEg_86euMPXaAjmMhDpNl1WYM90f9FypgqqBb4IWOSlOjKEV8zHrshg8GZWZb8r2yDFGj536a6_jF0xfC_N16CsynBBr6OKEAIP_vaSV2Taxjdg")'
          }}
        >
          <div className="flex flex-col gap-4 text-center max-w-3xl relative z-10">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl drop-shadow-lg">
              Eğitimle Geleceği Şekillendiriyoruz
            </h1>
            <h2 className="text-white/90 text-base font-normal leading-normal md:text-lg drop-shadow-md">
              Sektör lideri uzmanlardan oluşan kadromuzla kariyer hedeflerinize ulaşmanızı sağlıyoruz.
            </h2>
          </div>
          <Button
            onClick={() => onNavigate('courses')}
            variant="primary"
            size="lg"
            className="relative z-10 min-w-[200px] max-w-[480px] shadow-lg hover:scale-105"
          >
            Eğitimleri Keşfet
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center w-full bg-background-light dark:bg-background-dark">
        <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 sm:px-6 py-8">

          {/* Introduction */}
          <div className="py-10 max-w-4xl mx-auto text-center sm:text-left">
            <h2 className="text-text-light dark:text-text-dark text-[28px] font-bold leading-tight tracking-[-0.015em] pb-4">Hakkımızda</h2>
            <p className="text-subtext-light dark:text-subtext-dark text-lg font-normal leading-relaxed">
              Kuruluşumuzdan bu yana, en güncel bilgilerle donatılmış, pratik ve uygulamalı eğitimler sunarak bireylerin ve kurumların potansiyellerini en üst düzeye çıkarmayı hedefliyoruz. Eğitim felsefemiz, sadece teorik bilgi aktarmak değil, aynı zamanda gerçek dünya problemlerine çözüm üretebilecek yetkinlikler kazandırmaktır.
            </p>
          </div>

          {/* Vision & Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-5">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-4 flex-[2_2_0px]">
                <p className="text-text-light dark:text-text-dark text-xl font-bold leading-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                  Vizyonumuz
                </p>
                <p className="text-subtext-light dark:text-subtext-dark text-base font-normal leading-relaxed">
                  Eğitim alanında yenilikçi yaklaşımlarla global standartları belirleyen, yaşam boyu öğrenmeyi teşvik eden lider bir kurum olmaktır.
                </p>
              </div>
              <div
                className="w-full md:w-auto bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex-1 min-w-[120px]"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoizQt2cUxj6mJuv4KYJOxNYvoalOIdBAmmVzwxe6KkfGFMaSpTv_fAI17ZlcTACCxh-LKZD9Ua5gGHB9BzW1Axg8HH1yyNqb-NIRHB5AG8hM_KltexwDRqpPPikFL1wyG-yEyJGF_EPvy0mAMmLopQXW5-vpGmgpYCJPCKNXwv_FANEYL3vH-bgDz544x3S_2nJebpGl7xSFIFYjwBQ7tSdDY6-uMPfRtchECiqHamzHLmnkFLgGbvTZ2rxUnUYNm6msOAxYBjZsx")' }}
              ></div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-4 flex-[2_2_0px]">
                <p className="text-text-light dark:text-text-dark text-xl font-bold leading-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">flag</span>
                  Misyonumuz
                </p>
                <p className="text-subtext-light dark:text-subtext-dark text-base font-normal leading-relaxed">
                  Katılımcılarımıza, kariyer hedeflerine ulaşmaları için gereken en güncel bilgi, beceri ve bakış açısını kazandırarak onların profesyonel gelişimlerine katkıda bulunmaktır.
                </p>
              </div>
              <div
                className="w-full md:w-auto bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex-1 min-w-[120px]"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB06cf6IKH4htuFBo335MrHbQ0YZjXJrcmfggsbv8XBr3OLxu0v-qDPP_whiwfGP4RZfMN5mlOeiwR6vigyVB9zLCWFZpjg61A17Os9ZjNVRVRapGDUgXJrHYZz66g8s1xtfgpBBPPL77xUfetTiFG4sejgHQsKngG3ajIu8APBV9whvxh3HLJIwYqGhVKq7aZHoPeFF58lsOui_TaWc1tepizKdazMaYbm4t79-wL3VQDz1RKKLFBtDZ7ZFflFidY3EfaNZJLxHnOj")' }}
              ></div>
            </div>
          </div>

          {/* Why Us */}
          <div className="py-16">
            <h2 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-[-0.015em] pb-10 text-center">Neden Bizi Seçmelisiniz?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'school', title: 'Uzman Eğitmenler', desc: 'Sektörün içinden gelen, tecrübeli ve alanında lider profesyonellerden öğrenin.' },
                { icon: 'laptop_mac', title: 'Uygulamalı Eğitim', desc: 'Teorik bilgiyi, gerçek dünya projeleri ve vaka çalışmalarıyla pekiştirin.' },
                { icon: 'trending_up', title: 'Sektör Odaklı İçerik', desc: 'Kariyerinizde anında fark yaratacak en güncel ve talep gören konuları öğrenin.' },
                { icon: 'support_agent', title: 'Sürekli Destek', desc: 'Eğitim süresince ve sonrasında kariyerinize yön verecek mentorluk desteği alın.' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary dark:text-white dark:bg-primary/30">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg text-text-light dark:text-text-dark">{item.title}</h3>
                  <p className="text-sm text-subtext-light dark:text-subtext-dark leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Instructors */}
          <div className="py-10 pb-20">
            <h2 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-[-0.015em] pb-10 text-center">Eğitmenlerimiz</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Ahmet Yılmaz', role: 'Yazılım Geliştirme Eğitmeni', desc: '10+ yıl deneyimle full-stack geliştirme ve bulut teknolojileri uzmanı.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDKhpeX2be9yO1ZE39FhJAlST6wqqiU3hbWCLSlGLWbHnRwky19qJSxWvRIp2k4yrtLE9E4iqONnXKoLTNhjHcKmwa3XHiQo_wZTlNUIsoMuLBe4H9qLM1EB474Ai7_ZuMS8Y_hl8L0rei8-W3RHV_baIcBKt-lVswN1WowMysh9NJeqDp2a228wH9POJSwK3ccNuHameQMJwpAqn4qkojDknwURTFhNgkIsaV3qBtYluRaUQWlg6vnvMP7c1c39RncPxgt8N72X4o' },
                { name: 'Zeynep Kaya', role: 'Dijital Pazarlama Uzmanı', desc: 'Veri odaklı pazarlama stratejileri ve SEO konusunda ödüllü kampanyalar yönetti.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlszCCRNFENoqU1bp_eIkHXz2WTQdp3MAKqJnAQv-ViY09UA9N1LaV_dTaXXF0M52Yy1hIBek7De1sUDFA3IdImN0vuqzGR2bKlMYnFH10xw_te1FL5mS4Hj_COSrWTomoUwcHHyLuD8tK9RLgEPkgxRYkpaKBn6iCAjQRDhu_H2mVktkekxOJ16bzhH3AFFArkQjHP81sgWnPzOeUL_3TUyrcVl5F_bzwBNCrHsyj0EwWYI3zLCDux0kozDoHPNOnIKMqpsVfEIQK' },
                { name: 'Can Öztürk', role: 'UI/UX Tasarım Lideri', desc: 'Kullanıcı merkezli tasarım prensipleriyle global markalar için arayüzler tasarladı.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeRBRpe64k4NxHmvnGXDptEJbwyRRI1xO1v-poE5Zr8uZDFqyVsfOwujCY-Kc0RT6WW-EfHFeAjLebcHHcJtRJ3GQD8TxewgULoDsTO8JgqaChFI__krZQuskpyjM-j8LVmvvsWktxfVxVRsibGgwiktRtQsbajRSbKDcZunL828nSjuYdvcJZidJkLgEdgfG-TIDNnBBr7JKKgm_E_coaxXXU04Pos1UTWEXKcVke2Bl30uzbbo6AwyYmsWbgIr8GrsrA56KEpIhf' }
              ].map((inst, idx) => (
                <div key={idx} className="flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="w-full h-64 overflow-hidden">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={inst.img} alt={inst.name} />
                  </div>
                  <div className="p-6 flex flex-col items-center gap-2">
                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{inst.name}</h3>
                    <p className="text-sm text-primary dark:text-secondary font-bold uppercase tracking-wider">{inst.role}</p>
                    <p className="text-sm text-subtext-light dark:text-subtext-dark mt-2">{inst.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-primary/10 dark:bg-primary/20 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">
            <span className="block">Kariyerinize Yatırım Yapmaya Hazır mısınız?</span>
            <span className="block text-primary mt-2">Bugün yeni bir başlangıç yapın.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 justify-center">
            <div className="inline-flex rounded-md shadow">
              <Button
                onClick={() => onNavigate('courses')}
                variant="primary"
                size="lg"
              >
                Popüler Eğitimler
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
