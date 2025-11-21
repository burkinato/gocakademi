# Database Setup Guide

## 1. Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE gocakademi;

# Veritabanına bağlan
\c gocakademi
```

## 2. Schema Yükleme

```bash
# Ana schema
psql -U postgres -d gocakademi -f api/database/schema.sql

# Extensions (permissions, activity logs vb.)
psql -U postgres -d gocakademi -f api/database/schema_extensions.sql

# Admin kullanıcı
psql -U postgres -d gocakademi -f api/database/create-admin.sql
```

## 3. Education Migrations

```bash
# Migration'ları çalıştır
npm run db:migrate
```

Bu komut otomatik olarak şu tabloları oluşturur:
- `units` - Kurs üniteleri
- `topics` - Konu içerikleri (video, PDF, quiz vb.)
- `assessments` - Sınavlar
- `questions` - Sınav soruları
- `course_enrollments` - Kayıtlar
- `student_topic_progress` - Konu ilerlemesi
- `assessment_results` - Sınav sonuçları

## 4. Veritabanını Sıfırlama (İsteğe Bağlı)

```bash
# Veritabanını sil ve yeniden oluştur
dropdb gocakademi
createdb gocakademi

# Tüm adımları tekrar et
psql -d gocakademi -f api/database/schema.sql
psql -d gocakademi -f api/database/schema_extensions.sql
psql -d gocakademi -f api/database/create-admin.sql
npm run db:migrate
```

## Default Admin Kullanıcı

```
Email: admin@gocakademi.com
Password: admin123
```

**⚠️ Üretim ortamında değiştirin!**
