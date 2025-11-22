# GocAkademi · Eğitim Yönetim Sistemi

Modern, full-stack eğitim platformu. Frontend: **React 18 + TypeScript + Vite + Tailwind**. Backend: **Node.js + Express + PostgreSQL**. Yönetici, eğitmen ve öğrenci rolleriyle kurs, içerik, sınav, yetki ve aktivite kayıtlarını uçtan uca yönetir.

## İçindekiler
- [Özellikler](#özellikler)
- [Mimari](#mimari)
- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
- [Environment Değerleri](#environment-değerleri)
- [Veritabanı Kurulumu](#veritabanı-kurulumu)
- [Geliştirme ve Build](#geliştirme-ve-build)
- [Test ve Lint](#test-ve-lint)
- [Klasör Yapısı](#klasör-yapısı)
- [Hazır Giriş Bilgileri](#hazır-giriş-bilgileri)

## Özellikler
- Çok rollü kimlik doğrulama (Admin, Instructor, Student) ve JWT tabanlı oturum.
- Kurs, kategori, bölüm (unit), ders (lesson), konu ve assessment yönetimi.
- Öğrenci kayıt, ilerleme takibi, değerlendirme ve aktivite logları.
- Yönetici panelleri: kullanıcı, öğrenci, kurs, izin ve log ekranları.
- Temel güvenlik katmanları: CORS, rate limit, security headers, role-based guard.

## Mimari
- **Frontend (`/src`)**: React Router ile lazy-loaded sayfalar; Zustand store, Tailwind stil; axios tabanlı API istemcisi (`src/lib/axios.ts`, `src/services/*`).
- **Backend (`/api/src`)**: Express app (`app.ts`), modüler router/controller/service/repository katmanları; PG pool (`infrastructure/database/connection.ts`); JWT + bcrypt yardımcıları (`utils/auth.ts`).
- **Veritabanı**: PostgreSQL; şema ve uzantılar `api/src/infrastructure/database/{schema.sql,schema_extensions.sql}`; migration ve scriptler `migrations/` ve `run-migrations.ts`.
- **Konfigürasyon**: `.env` ve `.env.local` okuyan `api/src/core/config/env.ts`; Vite/TSC ayarları `vite.config.ts`, `tsconfig.json`.

## Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm (veya yarn/pnpm tercih edilebilir)

## Kurulum
```bash
git clone <repo-url>
cd GocAkademi

# Bağımlılıkları kur
npm install

# Environment kopyası
cp .env.example .env
# .env içini kendi değerlerinle doldur (DB, JWT, admin bilgileri vb.)
```

## Environment Değerleri
`.env.example` tamamı listeler. Öne çıkanlar:
```env
# DB
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gocakademi
DB_USER=postgres
DB_PASSWORD=...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Admin varsayılanı (ilk kullanıcıyı oluştururken kullanılır)
ADMIN_EMAIL=admin@gocakademi.com
ADMIN_PASSWORD=admin123
```
> Üretimde örnek değerleri mutlaka değiştirin.

## Veritabanı Kurulumu
```bash
# Veritabanı oluştur
createdb gocakademi

# Şema ve uzantıları yükle
psql -d gocakademi -f api/src/infrastructure/database/schema.sql
psql -d gocakademi -f api/src/infrastructure/database/schema_extensions.sql

# Admin kullanıcı
psql -d gocakademi -f api/src/infrastructure/database/create-admin.sql

# Ek tablolar/migration scriptleri
npm run db:migrate
```
> İsteğe bağlı: `api/src/scripts/init-db.ts` ve migration TS dosyaları veriyi tekrar oluşturmak için kullanılabilir.

## Geliştirme ve Build
```bash
# Frontend + backend birlikte (concurrently)
npm run dev

# Sadece frontend
npm run client:dev

# Sadece backend (nodemon)
npm run server:dev

# Production build
npm run build

# Tip kontrol
npm run check
```

## Test ve Lint
```bash
# Unit/component testleri (Vitest)
npm run test
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage

# ESLint
npm run lint

# Manuel auth testi
node test-auth.js        # /api/auth register/login/me akışı

# Profesyonel sınav içerikli demo kursu oluştur
node scripts/create-pro-exam-course.mjs
```

## Klasör Yapısı
```
GocAkademi/
├── api/                     # Backend
│   ├── src/
│   │   ├── api/             # Routes, controllers, middleware, validators
│   │   ├── application/     # Services (iş kuralları)
│   │   ├── core/            # Config, domain, errors
│   │   ├── infrastructure/  # DB bağlantısı, repository imple., migrations
│   │   └── utils/           # Auth, validation, logger
├── src/                     # Frontend
│   ├── components/          # UI parçaları (admin, education, frontend)
│   ├── pages/               # Route bileşenleri
│   ├── layouts/             # Main & Admin layout
│   ├── services/            # API istemcileri
│   ├── stores/              # Zustand store'ları
│   └── lib/                 # axios instance ve yardımcılar
└── public/                  # Statik varlıklar
```

## Hazır Giriş Bilgileri
- Admin: `admin@gocakademi.com` / `admin123`
- Uyarı: Üretimde bu bilgileri değiştirin ve güçlü JWT secret kullanın.

Katkı göndermek için PR açabilirsiniz. Sorular için issue açmanız yeterli.
