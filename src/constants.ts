
import { Course, Feature, NavLink, HeroSlide, Testimonial, BlogPost } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Eğitimlerimiz', key: 'courses' },
  { label: 'Kurumsal', key: 'corporate' },
  { label: 'Blog', key: 'blog' },
  { label: 'İletişim', key: 'contact' },
];

export const FEATURES: Feature[] = [
  {
    icon: 'school',
    title: 'Uzman Eğitmenler',
    description: 'Sektörün önde gelen profesyonellerinden öğrenme fırsatı.'
  },
  {
    icon: 'update',
    title: 'Güncel İçerikler',
    description: 'Sürekli güncellenen, en yeni teknolojileri ve trendleri kapsayan eğitimler.'
  },
  {
    icon: 'schedule',
    title: 'Esnek Öğrenme',
    description: 'Kendi hızınızda, istediğiniz zaman ve yerden eğitimlere erişim imkanı.'
  }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt7J8pHpZD3vZF4Kikvqk1xo-t1y6XcBaujd9D473515hH7ItodxpHIl_PXnknG1nKSrmhYbzN2JptFoOeg46mcvYWYaWN4iqdD6pkegVwdaQbmIM3EgrodsdXALgq4V3qZRB1lvQd68Rg-aW2T01EV-UlWH2TzEW5IgKdrUOKhhocZEd-i7w1bt-GHst4jdBrvzWjPnZQCVg87UwGXMFwQtTisW5607ssBOcv2Q2dJxeohhKZQXe8XNMyCNdXENTA3Loe6wCzfqlB',
    title: 'Geleceğinize Yatırım Yapın',
    subtitle: 'Sektör liderlerinden uygulamalı eğitimlerle yeteneklerinizi geliştirin ve kariyerinizde bir sonraki adımı atın.',
    ctaText: 'Eğitimleri Keşfet'
  },
  {
    id: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-1Fb3zMOv0jC4FvaWVh4pBli3v0RqB6KPMAy0l4UYvPw9EMM4Nk3dJmCR_cw003L1S4SpRB4ntLPs34umNS2ZuBfRwPOil8y4opZyQ0TnLpRZqI_JfXSUMeZbkDoad1JSS94-7owXJO92j5Flz00NB1BUMZsc8PxPUkt7wL_HEbK4_MtZ7M5hDk9OsmEcDKU12k84em76zJBiMjBGkNdKDTye7g87PBwvMlNQ0cXXzY8ppPht_sYFAqt-ywcZCtLymKN53M3FrRbC',
    title: 'Teknolojiyi Yakından Takip Edin',
    subtitle: 'Modern web geliştirme, veri bilimi ve yapay zeka konularında en güncel içeriklerle kendinizi geliştirin.',
    ctaText: 'Yazılım Eğitimleri'
  },
  {
    id: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmtnUkvpbf0i8A7rDLW5pfNgZ8ZutZTnAdaDjE7JxXzMlxma7Gj7wfdeQA2UrqPiCRswnXwDcYkv35KjC4gRpgpHd-s_DAJ9P4vEE4J9LuA6SWj9XIzRZbhHVSD0NylFBj1DA1S33R8WgZ8wCb9TizdWmgcDg0W9TwXUgc64NRdfgatc7PBQd8glHwPts-rrkLh2d6MACNsbvksCDvgJcDSPDT6pv7zbxYCYmdatmuYJWYSIJqDGlHknGLn3KY09SRq8430hBsi6uN',
    title: 'Liderlik Becerilerinizi Artırın',
    subtitle: 'Ekip yönetimi, etkili iletişim ve stratejik düşünme becerileriyle iş hayatında fark yaratın.',
    ctaText: 'Kariyer Fırsatları'
  }
];

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Modern Web Geliştirme',
    instructor: 'Ahmet Yılmaz',
    rating: 4.8,
    reviewCount: 1250,
    price: 299.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-1Fb3zMOv0jC4FvaWVh4pBli3v0RqB6KPMAy0l4UYvPw9EMM4Nk3dJmCR_cw003L1S4SpRB4ntLPs34umNS2ZuBfRwPOil8y4opZyQ0TnLpRZqI_JfXSUMeZbkDoad1JSS94-7owXJO92j5Flz00NB1BUMZsc8PxPUkt7wL_HEbK4_MtZ7M5hDk9OsmEcDKU12k84em76zJBiMjBGkNdKDTye7g87PBwvMlNQ0cXXzY8ppPht_sYFAqt-ywcZCtLymKN53M3FrRbC',
    category: 'Yazılım',
    level: 'Orta'
  },
  {
    id: 2,
    title: 'Dijital Pazarlama Uzmanlığı',
    instructor: 'Ayşe Kaya',
    rating: 4.9,
    reviewCount: 980,
    price: 450.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJPgw-6DKH6FsdDaQVpreVGd6pA791b2hCX7t-hwRxqDnXpP2CWh7OSWSFmRleR5gjBskrrKQc8sEhzivAp0bIvkjqCCUb2jqLG-YHQxW0gXcMAmQM6wki0cgxW1AUabx5CwtkwDbweAtdCJpx_-8KdFBEEIXERGogf0esLvUaavHcoHJsjsw3iDIiFYD0lKvVsW9TNaLD5WRNGy64yfg34lcWzxwYuFh2BQAJ7fJSMU-gadZxX97_4qM_uPdVSg6UVOkjg28nFqVC',
    category: 'Pazarlama',
    level: 'İleri'
  },
  {
    id: 3,
    title: 'UX/UI Tasarım İlkeleri',
    instructor: 'Can Öztürk',
    rating: 4.7,
    reviewCount: 2300,
    price: 349.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLlKjWfvn56eqrhugxU53yKcrybYkJNEZ8dARDkX039n1XhwMRHcn62THVVnW0iyVa8Mo4SlgTjswlv95DgDp4wwQ2Igy16WK5NqyRSBd491QOUkFbhaKonxeSAWm_UKCPLiMllGaOPdi0QadIiqQlxDhsnxwZ0_Z-8ZMps9zSqsYe_rFi0flK32OqY4UghdduLQKRgSJVaS1XfX0M2ZhptDdUDWuJdU4oOMCH6umQaOGhY3eUAWvmQrHG5Z8QVhGGEGmKquRv5ISd',
    category: 'Tasarım',
    level: 'Başlangıç'
  },
  {
    id: 4,
    title: 'Veri Bilimi ve Makine Öğrenmesi',
    instructor: 'Mehmet Şahin',
    rating: 4.9,
    reviewCount: 3100,
    price: 599.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhQnTQgIogRzd0my8rFZC9o2Pf4DhH1hmNETFqfynAEhulVejpRuYPYU1E8_ydV4xmQMcuG-Hxx-123ZMhD6CjEp3ehl_1BymBncy5gb7vTH9kdelQQvSJgqBsLiU-XeeqIpD4DaIGXX3CTtjQwPOoxaJX8mUARQfJkHCbrmR-xOKLm6nH72SeNvA4Qh3rvBnTE9chpm_kXhJoB_trOAtF8iJP7u0UK-r83W9XjatdpEvBdLP7lFQotW7N0NZ9eOODfvfKXSMjDqro',
    category: 'Yazılım',
    level: 'İleri'
  },
  {
    id: 5,
    title: 'İleri Düzey Excel Becerileri',
    instructor: 'Fatma Arslan',
    rating: 4.6,
    reviewCount: 850,
    price: 199.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC5NC6-NeT0dVcwqFB7iLHBZzGY-b5sUX-sWsEEE38i9Un6081wp0bQjoxMV8YsuRcGngnKBVclrKRCEEo1ZnB7ctdk7tWWIJB7AZ6EITREf1aBFFZ4YHR3At34WTPIWVvAD7-BXkjWA19i27e3yiCSd8s1qlrhjHG6GJ6i2iAdzhlGAeJcg0e2zHtp33LotQy5KSRjNy33id6LuUt6HszyT9TLJ2pkZfYWc_U5JlQEkXHq_ekvC4Xz1dhswqgSK0vgfGxzNAJGAj_',
    category: 'Kişisel Gelişim',
    level: 'Orta'
  },
  {
    id: 6,
    title: 'Liderlik ve Ekip Yönetimi',
    instructor: 'Ali Vural',
    rating: 4.8,
    reviewCount: 1120,
    price: 499.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmtnUkvpbf0i8A7rDLW5pfNgZ8ZutZTnAdaDjE7JxXzMlxma7Gj7wfdeQA2UrqPiCRswnXwDcYkv35KjC4gRpgpHd-s_DAJ9P4vEE4J9LuA6SWj9XIzRZbhHVSD0NylFBj1DA1S33R8WgZ8wCb9TizdWmgcDg0W9TwXUgc64NRdfgatc7PBQd8glHwPts-rrkLh2d6MACNsbvksCDvgJcDSPDT6pv7zbxYCYmdatmuYJWYSIJqDGlHknGLn3KY09SRq8430hBsi6uN',
    category: 'Kişisel Gelişim',
    level: 'Orta'
  },
  {
    id: 7,
    title: 'Proje Yönetimi ve Scrum',
    instructor: 'Elif Demir',
    rating: 4.8,
    reviewCount: 1540,
    price: 379.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKmAy3ti_mQclx3x4zxIAHkkp2z9pxRfdu8T3ROVVHT3y2uB_PbVY0qBzSJ8RwysAOypwNCKPTxi_QcYbJTdBCs9Izwtt3k_wSfrOh1BjdeUWWjaOyJ2co4xxaeKJ1Ggt7fFkRTqLQwwBRWjWqmW5Kc5Vevoj0gLuiIHHINukI2apg6Khh-fcxI6_ZskEtRbs65sPcNjO0NVB7M3Rg1KYuTdn9jIzm-tkT2-dvUMrFdZgon1K1t41fLh5kN6QDzInRz-kCOE-_lBcA',
    category: 'İş Dünyası',
    level: 'Orta'
  },
  {
    id: 8,
    title: 'Sosyal Medya Stratejileri',
    instructor: 'Zeynep Çelik',
    rating: 4.7,
    reviewCount: 760,
    price: 249.99,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-uDi3RjqL0wceXLgM_ILeovG7ldfFMemvXhTG1W2wIor8Yff-FA9L8NgXqo0KY0Jm5lkTAxmPx4_oC9mYbY7oJKz5rFnMumcvDbjiYzfxnOXqGvEig1YRvqX2jtfww9b3MS7qbMiPzQY7GFBqd18fQ-WO42MTJ7YMXmNuQfAUk1Qc7zX24YK6SuRE2cGY4hHXeyfL5SVDUU7FLy2GLeNi1VOqFx21Oih9J5tbhgclnsPo439dz3G6UlwAua_-ZXENWYxI9Q3gj9Rb',
    category: 'Pazarlama',
    level: 'Başlangıç'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Selin Yılmaz',
    role: 'Front-end Geliştirici',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-1Fb3zMOv0jC4FvaWVh4pBli3v0RqB6KPMAy0l4UYvPw9EMM4Nk3dJmCR_cw003L1S4SpRB4ntLPs34umNS2ZuBfRwPOil8y4opZyQ0TnLpRZqI_JfXSUMeZbkDoad1JSS94-7owXJO92j5Flz00NB1BUMZsc8PxPUkt7wL_HEbK4_MtZ7M5hDk9OsmEcDKU12k84em76zJBiMjBGkNdKDTye7g87PBwvMlNQ0cXXzY8ppPht_sYFAqt-ywcZCtLymKN53M3FrRbC',
    content: 'Buradaki Web Geliştirme kursu sayesinde kariyerimde dev bir adım attım. Eğitmenlerin ilgisi ve içeriklerin güncelliği muazzam.',
    rating: 5
  },
  {
    id: 2,
    name: 'Mert Demir',
    role: 'Pazarlama Uzmanı',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmtnUkvpbf0i8A7rDLW5pfNgZ8ZutZTnAdaDjE7JxXzMlxma7Gj7wfdeQA2UrqPiCRswnXwDcYkv35KjC4gRpgpHd-s_DAJ9P4vEE4J9LuA6SWj9XIzRZbhHVSD0NylFBj1DA1S33R8WgZ8wCb9TizdWmgcDg0W9TwXUgc64NRdfgatc7PBQd8glHwPts-rrkLh2d6MACNsbvksCDvgJcDSPDT6pv7zbxYCYmdatmuYJWYSIJqDGlHknGLn3KY09SRq8430hBsi6uN',
    content: 'Dijital Pazarlama eğitimi beklediğimden çok daha detaylıydı. Teoriden çok pratik uygulamalar olması iş hayatımda hemen kullanmamı sağladı.',
    rating: 5
  },
  {
    id: 3,
    name: 'Ayşe Kara',
    role: 'Grafik Tasarımcı',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLlKjWfvn56eqrhugxU53yKcrybYkJNEZ8dARDkX039n1XhwMRHcn62THVVnW0iyVa8Mo4SlgTjswlv95DgDp4wwQ2Igy16WK5NqyRSBd491QOUkFbhaKonxeSAWm_UKCPLiMllGaOPdi0QadIiqQlxDhsnxwZ0_Z-8ZMps9zSqsYe_rFi0flK32OqY4UghdduLQKRgSJVaS1XfX0M2ZhptDdUDWuJdU4oOMCH6umQaOGhY3eUAWvmQrHG5Z8QVhGGEGmKquRv5ISd',
    content: 'Kendi hızımda öğrenebilmek harika. UX/UI dersleri ile portfolyomu geliştirdim ve ilk freelance işimi aldım!',
    rating: 4
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Etkili Zaman Yönetimi İçin 5 Altın Kural',
    summary: 'Ekibinizi motive etmek ve başarıya ulaşmak için kanıtlanmış liderlik teknikleri.',
    category: 'Liderlik',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6xke9udF9kNy3Z_IsACerTYup3sivwAuLcR1RIgoFXffxjGqCZajpR4w-4cpwkXhUX0rchLn3EeX8uyccrW6hZ8oyq2Xlgim2CelOPGKNNn_KkYZvcPZHs5rx58h6ssiWp6zJAAahRR1fKw86Z1U8r8CCVZskayFOyTQMqhSobeZqSj5CSra_7TzjCIskhmKENT08Wi4-VWbeID8fTTpLTMmwpNyZm7VRi4qUIRZ1OC10ym4oKaC0UrujWoQVS33GaeCdZvKZqH0',
    date: '15 Ağustos 2024',
    readTime: '7 dk okuma',
    author: {
      name: 'Ayşe Yılmaz',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbp4mIvsWwO2EpzCln0AtyvZwlJ2kOXrZiZ1EYyS55NIg25NZ9NAb5mdWP6NEHj9j_oAjn2AKS73QdNBESOKSh57uTBkJicHN18qchkW3629ddkYxkAkV-os8So6acHZ09CYnM7gOw_ubYeXzFOE6NzBbGyQM9H3i48Qr6wKC3V6pmI9IMcIlY9cqRWElbqKUeOlmoV0MGIMOBcPSPnA3P_CmSFwOci61u-kJBCA3lU_8hkLYH6XC24MR6s4_Jinmm4atxU0gADoad',
      role: 'Verimlilik Uzmanı',
      bio: 'Ayşe, 10 yılı aşkın süredir bireysel ve kurumsal verimlilik üzerine danışmanlık vermektedir. Zaman yönetimi ve üretkenlik konularında yazdığı makalelerle binlerce kişiye ilham olmuştur.'
    },
    content: `<p class="text-lg leading-relaxed">Zaman yönetimi, modern iş hayatının en kritik becerilerinden biridir. Bu yazıda, verimliliğinizi artıracak ve stresi azaltacak beş temel stratejiyi ele alacağız. Başarılı olmak sadece çok çalışmakla değil, aynı zamanda akıllıca çalışmakla da mümkündür. İşte bu yolculukta size rehberlik edecek o altın kurallar.</p>
<h2 class="text-[#111318] dark:text-white text-xl font-bold mt-6 mb-3">1. Önceliklendirme Matrisini Kullanın: Eisenhower Tekniği</h2>
<p class="mb-4">Dwight D. Eisenhower tarafından geliştirilen bu teknik, görevleri "acil" ve "önemli" olarak iki eksende sınıflandırmaya dayanır. Bu matris sayesinde neye odaklanmanız gerektiğini, neyi planlamanız, delege etmeniz veya eleminiz gerektiğini net bir şekilde görebilirsiniz.</p>
<ul class="list-disc list-inside mb-4 space-y-1">
<li><strong>Acil ve Önemli:</strong> Hemen yapın (krizler, son teslim tarihleri).</li>
<li><strong>Önemli ama Acil Değil:</strong> Planlayın (uzun vadeli hedefler, kişisel gelişim).</li>
<li><strong>Acil ama Önemli Değil:</strong> Delege edin (bazı toplantılar, kesintiler).</li>
<li><strong>Acil Değil ve Önemli Değil:</strong> Elemin edin (zaman kaybı aktiviteler, sosyal medya).</li>
</ul>
<h2 class="text-[#111318] dark:text-white text-xl font-bold mt-6 mb-3">2. Pomodoro Tekniği ile Odaklanın</h2>
<p class="mb-4">Bu teknik, çalışmayı kısa ve odaklanmış aralıklara bölerek dikkatin dağılmasını engeller. Geleneksel olarak, 25 dakikalık çalışma seansları ("Pomodoro" olarak adlandırılır) ve ardından 5 dakikalık kısa molalar şeklinde uygulanır. Dört Pomodoro'dan sonra daha uzun bir mola (15-30 dakika) verilir.</p>
<figure class="my-8">
<img alt="A person working focused on a laptop in a quiet environment" class="w-full rounded-xl shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuL0LcXWJucRVXV-_IO9IfrMuhMTOlKDmfqx-7jq_Yz3EJEC2X5g-3o9nVLzHsNLg_RhyFHuR_8pRqSi44qbYuVcyX94jO0Wv768xH-z5_MvfIidCoBg9DAj8AYvM2kXqqvNh0dtqPJxqj1kYjHJWzUrhwGl7_u-wuArQtETXJqvbpLBweyzfng0ro3EBP34R2QeSd8N5WcOoWKkf1EqoQpos1hvOlpT24dI1uh5HnE7pIA6BiII_9_LnN1xk4p3njcbv6jZojhZGh"/>
<figcaption class="text-center text-sm text-gray-500 mt-2">Odaklanmış çalışma, verimliliğin anahtarıdır.</figcaption>
</figure>
<h2 class="text-[#111318] dark:text-white text-xl font-bold mt-6 mb-3">3. "İki Dakika" Kuralını Benimseyin</h2>
<p class="mb-4">David Allen'ın "Getting Things Done" metodolojisinden gelen bu basit kural, eğer bir görev iki dakikadan daha az sürecekse, onu ertelemek yerine hemen yapmanız gerektiğini söyler. Bu, küçük işlerin birikip büyük bir strese dönüşmesini engeller.</p>
<blockquote class="border-l-4 border-primary bg-primary/10 dark:bg-primary/20 p-4 rounded-r-lg my-6">
<p class="font-semibold text-gray-900 dark:text-white">"En verimli insanlar, her günü, her saati ve her dakikayı en iyi şekilde değerlendirenlerdir."</p>
</blockquote>
<h2 class="text-[#111318] dark:text-white text-xl font-bold mt-6 mb-3">4. Haftalık Planlama ve Gözden Geçirme</h2>
<p class="mb-4">Her haftanın başında hedeflerinizi belirleyin ve takviminizi buna göre düzenleyin. Haftanın sonunda ise nelerin iyi gittiğini, nelerin geliştirilebileceğini gözden geçirin. Bu düzenli döngü, sürekli olarak rotanızı düzeltmenize ve hedeflerinize daha emin adımlarla ilerlemenize yardımcı olur.</p>
<h2 class="text-[#111318] dark:text-white text-xl font-bold mt-6 mb-3">5. Teknolojiyi Akıllıca Kullanın</h2>
<p>Görev yönetimi uygulamaları (Trello, Asana), takvimler ve not alma araçları (Evernote, Notion) gibi dijital araçlar, işlerinizi organize etmenize ve takip etmenize yardımcı olabilir. Ancak, teknolojinin aynı zamanda bir dikkat dağıtıcı olabileceğini unutmayın. Bildirimleri yönetin ve sosyal medya kullanımını sınırlayın.</p>`,
    featured: true
  },
  {
    id: 2,
    title: 'Yeni Başlayanlar İçin Python: İlk Adımlar',
    summary: 'Programlama dünyasına yeni adım atanlar için Python\'un temellerini ele alıyoruz.',
    category: 'Yazılım Geliştirme',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc6eEfab5wDtpBuYCHHUckp7jkFfqo4SuU4pFoK2S_3AyaNSvMtjXroWsptc8IGdEoCKQqdETE8SOZNNbW3D6z5ZGMcofF-bV_s4WBW9a_MAhwlB3H_z8y-Jy0vU_8mxQgtFdlvurR9s6AxvM7WnMW8yJzq1q3KdG9qQ97UZJ58lZiDEiZttLd405Gr6LHH1JhrpcbvY23qcu17fCJNTaeCTM5YqE8BzerzIpDS25KQUeRg5HOluJBkeGJwjldYFTf7eqSt4ciQHbL',
    date: '22 Ekim 2023',
    readTime: '10 dk okuma',
    author: {
      name: 'Ahmet Yılmaz',
      role: 'Yazılım Eğitmeni',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlmU7Jar2dHj6A0Fyp31ausioy1kzw50Rx401NAsVC7RNJXOrnCluBkjG0IB3cDq6--SmuhTeskFY8M4HbWzLle9kehF9zPyw2PSMYOh7AneRGV-bmosIvxsCq9PEjqHIL8N_8xc-gyesBN3UFbUEEl90rJlcEV8e2hQS_qAkAE937YfODYNcpZTiWW0ykypOuWsuiiuhZgEZvhwg0us7Qz7uYMhJx0sBGhFVXPF54jyLQ7xI3DvrSgMWZY_OdyKPdlT_u8SFPAqI',
      bio: 'Ahmet, yazılım dünyasına adım atmak isteyenlere rehberlik eden deneyimli bir eğitmendir.'
    },
    content: '<p>İçerik hazırlanıyor...</p>',
    featured: true
  },
  {
    id: 3,
    title: '2024\'te Dijital Pazarlamanın Geleceği',
    summary: 'Yapay zeka ve otomasyonun pazarlama stratejilerini nasıl şekillendirdiğini öğrenin.',
    category: 'Pazarlama',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn4RQt1v98m9dJA2RzkU5Tr2mvSXZPEQOVlGvgnL6BcwFpdwpoY7124VLA-P6fLTwvwKsvcVkexYc6RN376-rNRR681dztmj9wIuLxWg8L4eEAu96RyXXe4xlBd-vn-LODMa9luDQyymTGxEMVmoK9ic7n9VqqtWznkV8ttAT4dZ7YwJ77TciYHYBZzP4By39jkfxDuZHyu1XxL2GFJICh0_lnwtpqXZYO2OBjcvI0ebFBEXi538EyxJq0cUOqd7y1RrxIPAdSaTRV',
    date: '20 Ekim 2023',
    readTime: '8 dk okuma',
    author: {
      name: 'Zeynep Kaya',
      role: 'Pazarlama Uzmanı',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBekvZ0Frf7-1FeREkoo_eRURTVFiglG1dgqugB1tyhrw4xY6NiSD30ZrApc6KSf16WvIJ2RJTMM-FUfVaqWyATDbsnQKiEqGBLEzVlvlD3WD0cxykNypcmOoVtby8ipi3RHaeBISGBaCnOBN-lIYo9sQhE1EpUw9DM2nAhA4z6hFijK3vob-ST25ALYHUG9tim76zbef0fLf9_hm2FI8PBWeJ7-I3dTq03jJeBIjcZkflNFgmLCWZm71Fj3-MBmZ7XdRZNJrTy8yoQ',
      bio: 'Zeynep, dijital pazarlama trendlerini yakından takip eden ve markalara stratejik danışmanlık veren bir uzmandır.'
    },
    content: '<p>İçerik hazırlanıyor...</p>',
    featured: true
  },
  {
    id: 4,
    title: 'İçerik Pazarlamasında Başarının Sırları',
    summary: 'Hedef kitlenize ulaşmak ve etkileşim yaratmak için en etkili içerik stratejileri.',
    category: 'Pazarlama',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVtxtRtecEQrraUuxWk7YCCTwrrdLa5sxtDrfVLzYkKcRuiyzn-sa6hFWUoZ3xMOEXpbzCE8JzceZL1cAT4hsPBrXvZ5fZj-nTAmfbm2MuC--Xg0qFUgVCitKyQYmE1k9wZEJYr_iGZR5CzNbegcqJkuMiLuvul4boBpG4fpSG5N-fEtRVhSSIWMDvlucZpEZQCsTGGhXwERwl1zx8AP1rZvXst7u1cYyRxIO_tREBNJOflLpdy4x7RPBurUhbrG0Vfq40fgZyfbot',
    date: '22 Ekim 2023',
    readTime: '5 dk okuma',
    author: {
      name: 'Ayşe Korkmaz',
      role: 'İçerik Uzmanı',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCpWdzt8TH2_moFUcoSlm-2Q14LCfAh3HrW-psCR_yaSbk4MnwBFp7LF-axzTeX9ab1lkyH7afyVeZK8n5lFiBCpYjA2Ghdl2yKnTdlX-Kt4LdgTs9GKAMYu5qfL35nJR79eYH-M-7JjfojbdACQL0ivEsjVyGjJoz8eTBFF996cOQSQVeKNauAYDANxrRNEqEpnvlIQoc6oNOSSn2oc8oN2ye1s8Pt_GGQtNDXVb45GTFasPUpsfAu2y7YEZpXaOAAAH5_oogAfji',
      bio: 'Ayşe, markaların hikayelerini anlatmalarına yardımcı olan bir içerik stratejistidir.'
    },
    content: '<p>İçerik hazırlanıyor...</p>'
  },
  {
    id: 5,
    title: 'Hibrit Çalışma Modelinde Ekip Yönetimi',
    summary: 'Hem ofiste hem de uzaktan çalışan ekipler için verimliliği artırmanın yolları.',
    category: 'Liderlik',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6dqfAIpzHfXyOMrJPTSROWSNyRpp-iVwVPFFUY8OJxE-fS-E3V23iby3t_tarTio5vWW6xeyRVYvhj7O7QdUg4xpf-5LvWMAr31fatOxMDNjNE3lZwQyj0m9GbxrJy2AEjpTInekJkDEAMzX_RMSdvrBUVzqWz6xqXXDj9EtB6PNm5Sdc_56gSQJZvypf15VlMu0o_wAcwfpHRy3N362AuYuIIRxEYQ0K-nXYi7qVoYkChnCffqi6GSGWBx_bErDXevhmrEnca8LW',
    date: '18 Ekim 2023',
    readTime: '6 dk okuma',
    author: {
      name: 'Mehmet Öztürk',
      role: 'İK Müdürü',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBII4Igd27TqjPn6AUFRKSbEaFYFzXIjbwBv04JEwOOZu5dlYwFGbQDqmytbRks2nBSDecvI_GrkQHt84dYkOrIHenutn5iiDXbZQSmHHdbCAohfqcHZt6_Y1FG6wTDsF7osBW3T4Vb-2QaDNNbsD1Y95GVX24TmOX77LczkdVBelf-0wWOuigfmfIdTkOIawmvxoQ9kChMEZX3VCyR_Y7XNPj24jMuIrCXd1Oe89rq1LTaHqUJRkE3O7qH0lFUW-RgujrTx6jnHw-u',
      bio: 'Mehmet, modern çalışma modelleri üzerine uzmanlaşmış bir İnsan Kaynakları yöneticisidir.'
    },
    content: '<p>İçerik hazırlanıyor...</p>'
  },
  {
    id: 6,
    title: 'JavaScript Frameworkleri: Hangisini Seçmeli?',
    summary: 'React, Vue ve Angular karşılaştırması. Projeniz için en doğru seçimi yapın.',
    category: 'Yazılım Geliştirme',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBto7KBzMwQ0MfvuOKTXTu8mmaN98f2WmDqIvCM-eN4zmcH5gzKhP6-lJUJxXSeXt6v_PC33LEHZxbomplzusVZ2YAUIcSHEWaSbv5ypBmhew-W8Dd7hI0EWqNXZhQnjBmRg0fa59fE3ohvbe8-JjGMw0jRmQKMIbjDmtiNDKe0tFDrSNtblrHT8Rp0IC2JSFFaYmdqKg7lFDo-N6PtYvfpkRZ9AG2iGjmJijmsLDeA3wc_vOyxjKhLSlB-vETu7FuHKLRAPZVoI-Xk',
    date: '12 Ekim 2023',
    readTime: '12 dk okuma',
    author: {
      name: 'Ahmet Yılmaz',
      role: 'Yazılım Eğitmeni',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlmU7Jar2dHj6A0Fyp31ausioy1kzw50Rx401NAsVC7RNJXOrnCluBkjG0IB3cDq6--SmuhTeskFY8M4HbWzLle9kehF9zPyw2PSMYOh7AneRGV-bmosIvxsCq9PEjqHIL8N_8xc-gyesBN3UFbUEEl90rJlcEV8e2hQS_qAkAE937YfODYNcpZTiWW0ykypOuWsuiiuhZgEZvhwg0us7Qz7uYMhJx0sBGhFVXPF54jyLQ7xI3DvrSgMWZY_OdyKPdlT_u8SFPAqI',
      bio: 'Ahmet, karmaşık yazılım konularını basitleştirerek anlatan bir eğitmendir.'
    },
    content: '<p>İçerik hazırlanıyor...</p>'
  },
  {
    id: 7,
    title: 'E-Ticarette Müşteri Sadakati Oluşturma',
    summary: 'Müşterilerinizi tekrar tekrar sitenize çekecek etkili pazarlama yöntemleri ve ipuçları.',
    category: 'Pazarlama',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3O0c-RU9KTIVFJSwy5iAqBpYlFAzNH4vW831yezfWm6dt5ZKWHKzchk6MAdY_j5QMQ9KZKV_7MlSay4ELCaalGxt9EBoImPJT1JyYBq7fOc4yTJn_rrnlhfA3Uelsp88OJ3dMd1oEnHa1odVvz8OFHXPkd-j6JKbzJM8inxxI_vKhyaw4KhHpYIykddultGRjhMP3o3SqXY7OB27gB15Z47Dr9ENodEs3yK4DufVfycjkoRR7xGJZoRwBs5cmhcJ_NF-jVYybBvnK',
    date: '09 Ekim 2023',
    readTime: '7 dk okuma',
    author: {
      name: 'Zeynep Kaya',
      role: 'Pazarlama Uzmanı',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBekvZ0Frf7-1FeREkoo_eRURTVFiglG1dgqugB1tyhrw4xY6NiSD30ZrApc6KSf16WvIJ2RJTMM-FUfVaqWyATDbsnQKiEqGBLEzVlvlD3WD0cxykNypcmOoVtby8ipi3RHaeBISGBaCnOBN-lIYo9sQhE1EpUw9DM2nAhA4z6hFijK3vob-ST25ALYHUG9tim76zbef0fLf9_hm2FI8PBWeJ7-I3dTq03jJeBIjcZkflNFgmLCWZm71Fj3-MBmZ7XdRZNJrTy8yoQ',
      bio: 'Zeynep, e-ticaret markalarının büyümesine yardımcı olan bir danışmandır.'
    },
    content: '<p>İçerik hazırlanıyor...</p>'
  }
];
