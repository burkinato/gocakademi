# GocAkademi - Eğitim Yönetim Sistemi

Modern, full-stack eğitim platformu. React + TypeScript frontend, Node.js + Express + PostgreSQL backend.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### 2. Kurulum

```bash
# Projeyi klonla
git clone <repo-url>
cd GocAkademi

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle ve veritabanı bilgilerini gir
```

### 3. Veritabanı Kurulumu

```bash
# PostgreSQL'de veritabanı oluştur
createdb gocakademi

# Schema'yı yükle
psql -d gocakademi -f api/database/schema.sql
psql -d gocakademi -f api/database/schema_extensions.sql

# Admin kullanıcı oluştur
psql -d gocakademi -f api/database/create-admin.sql

# Education tabloları için migrations
npm run db:migrate
```

### 4. Uygulamayı Çalıştır

```bash
# Development mode (frontend + backend)
npm run dev

# Sadece frontend
npm run client:dev

# Sadece backend
npm run server:dev
```

## 📦 Proje Yapısı

```
GocAkademi/
├── api/                    # Backend (Node.js + Express)
│   ├── controllers/       # API controllers
│   ├── repositories/      # Database repositories
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation vb.
│   ├── database/         # Database schema & migrations
│   └── types/            # TypeScript types
├── src/                   # Frontend (React + TypeScript)
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # API client
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript types
└── public/               # Static assets
```

## 🛠️ Available Scripts

```bash
npm run dev            # Development mode (frontend + backend)
npm run build          # Production build
npm run db:migrate     # Run database migrations
npm run test           # Run tests
npm run lint           # Run ESLint
```

## 🔐 Default Admin Login

```
Email: admin@gocakademi.com
Password: admin123
```

**⚠️ Üretim ortamında mutlaka değiştirin!**

## 📚 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🎓 Features

- ✅ User Management (Admin, Instructor, Student)
- ✅ Course Management
- ✅ Category Management
- ✅ Activity Logging
- ✅ Advanced Permissions System
- ✅ Education Content (Units, Topics, Assessments)
- ✅ Progress Tracking
- ✅ Assessment & Quiz System

## 📝 Environment Variables

Tüm gerekli environment variables `.env.example` dosyasında listelenmiştir.

## 🤝 Contributing

Katkıda bulunmak için pull request açabilirsiniz.

## 📄 License

MIT
