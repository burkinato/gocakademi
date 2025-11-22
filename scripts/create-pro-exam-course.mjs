import { config } from 'dotenv';

config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@platform.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PORT = process.env.PORT || '3001';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const API_URL = process.env.API_URL || `${SERVER_URL}/api`;

const professionalExamCurriculum = [
  {
    id: 'unit-strategy',
    title: 'Modül 1 · Yetkinlik Analizi ve Planlama',
    items: [
      {
        id: 'item-101',
        title: 'Profesyonel sınav formatına genel bakış',
        type: 'video',
        duration: '18',
        isRequired: true,
        contentUrl: 'https://cdn.gocakademi.com/courses/pro-exam/intro.mp4'
      },
      {
        id: 'item-102',
        title: 'Kişisel seviye haritalama ve eksiklerin tespiti',
        type: 'text',
        duration: '25',
        isRequired: true,
        textContent: 'Çekirdek yetkinlik matrisini indir, kendi puanını çıkar ve gelişim hedeflerini belirle.'
      },
      {
        id: 'item-103',
        title: 'Sınav stratejisi kanvası (PDF)',
        type: 'pdf',
        duration: '10',
        isRequired: true,
        textContent: 'Haftalık çalışma sprintlerini planlamak için 4 sayfalık kanvas.'
      }
    ]
  },
  {
    id: 'unit-core-tech',
    title: 'Modül 2 · İleri Teknik Beceriler',
    items: [
      {
        id: 'item-201',
        title: 'Kurumsal mimari soruları için sistem tasarımı',
        type: 'video',
        duration: '32',
        isRequired: true,
        contentUrl: 'https://cdn.gocakademi.com/courses/pro-exam/system-design.mp4'
      },
      {
        id: 'item-202',
        title: 'Performans, ölçekleme ve gözlemlenebilirlik',
        type: 'text',
        duration: '40',
        isRequired: true,
        textContent: 'Gerçek sınav senaryolarından seçilmiş 6 vaka. Çözümleri ve kritik noktaları içerir.'
      },
      {
        id: 'item-203',
        title: 'Regülasyon & güvenlik gereksinimleri özeti',
        type: 'pdf',
        duration: '15',
        isRequired: false,
        textContent: 'KVKK, ISO 27001 ve finans kurumları için gerekli güvenlik başlıkları.'
      }
    ]
  },
  {
    id: 'unit-soft-skills',
    title: 'Modül 3 · Liderlik ve analitik iletişim',
    items: [
      {
        id: 'item-301',
        title: 'Vaka analizi: Kritik karar alma',
        type: 'video',
        duration: '22',
        isRequired: true,
        contentUrl: 'https://cdn.gocakademi.com/courses/pro-exam/leadership-case.mp4'
      },
      {
        id: 'item-302',
        title: 'Değerlendirici panel soruları',
        type: 'text',
        duration: '30',
        isRequired: true,
        textContent: 'İnsan kaynakları ve teknik jürinin sorduğu 25 gerçek soru ve ideal cevap formatı.'
      }
    ]
  },
  {
    id: 'unit-simulation',
    title: 'Modül 4 · Profesyonel Sınav Simülasyonları',
    items: [
      {
        id: 'item-401',
        title: 'Tam kapsamlı teknik sınav (120 soru)',
        type: 'quiz',
        duration: '120',
        isRequired: true,
        textContent: 'Gerçek zamanlı skor kartı ve detaylı çözüm videoları ile birlikte gelir.'
      },
      {
        id: 'item-402',
        title: 'Yönetim paneli vaka sınavı',
        type: 'quiz',
        duration: '75',
        isRequired: true,
        textContent: 'Çok aşamalı vaka. Katılımcı raporu PDF olarak indirilebilir.'
      },
      {
        id: 'item-403',
        title: 'Sınav sonrası bireysel geribildirim oturumu',
        type: 'text',
        duration: '15',
        isRequired: false,
        textContent: 'Mentorun doldurduğu güçlü yönler / gelişim alanları listesi.'
      }
    ]
  },
  {
    id: 'unit-career',
    title: 'Modül 5 · Kariyer & Sertifikasyon',
    items: [
      {
        id: 'item-501',
        title: 'Sınav sonrası kariyer yolculuğu',
        type: 'video',
        duration: '16',
        isRequired: true,
        contentUrl: 'https://cdn.gocakademi.com/courses/pro-exam/career-roadmap.mp4'
      },
      {
        id: 'item-502',
        title: 'Portföy & rapor şablonları',
        type: 'pdf',
        duration: '12',
        isRequired: true,
        textContent: 'Vaka raporu, sınav sonuç özetleri ve referans mektupları için hazır şablon seti.'
      }
    ]
  }
];

function extractAuthPayload(loginResponse) {
  const rawData = loginResponse?.data ?? loginResponse;
  const payload = rawData?.data ?? rawData;
  const user = payload?.user;
  const token =
    payload?.accessToken ||
    payload?.token ||
    payload?.tokens?.accessToken ||
    payload?.tokens?.token;
  if (!token || !user?.id) {
    throw new Error('Oturum açma yanıtından token alınamadı.');
  }
  return { token, user };
}

async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error || 'Admin girişi başarısız oldu');
  }
  return extractAuthPayload(body);
}

async function createCourse(token, instructorId) {
  const coursePayload = {
    title: 'Profesyonel Teknik Yetkinlik Sınavı Hazırlık Programı',
    description:
      '6 haftalık hızlandırılmış program; ileri seviye teknik, yönetimsel ve iletişim sınavlarına yönelik tam kapsamlı müfredat ile üç ayrı profesyonel sınav simülasyonu içerir.',
    category: 'Profesyonel Gelişim',
    level: 'advanced',
    price: 1490,
    duration: 54,
    imageUrl: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    instructorId,
    curriculum: professionalExamCurriculum
  };

  const response = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(coursePayload)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    throw new Error(body.error || body.message || 'Eğitim oluşturulamadı');
  }

  return body.data;
}

async function main() {
  try {
    console.log('🔐 Admin girişi yapılıyor...');
    const { token, user } = await login();
    console.log(`✅ Giriş başarılı. Kullanıcı ID: ${user.id}`);

    console.log('📚 Profesyonel sınav eğitim içeriği gönderiliyor...');
    const course = await createCourse(token, user.id);
    console.log(`🎉 Eğitim oluşturuldu. Course ID: ${course.id}, Başlık: ${course.title}`);
  } catch (error) {
    console.error('❌ İşlem başarısız:', error.message || error);
    process.exit(1);
  }
}

main();
