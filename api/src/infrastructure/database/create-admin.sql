-- Admin kullanıcısı oluşturma scripti
-- Şifre: Admin123! (bcrypt hash)

-- Önce kullanıcının var olup olmadığını kontrol et
DO $$
BEGIN
    -- Eğer admin kullanıcısı yoksa oluştur
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gocakademi.com') THEN
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name,
            role,
            is_active,
            email_verified
        ) VALUES (
            'admin@gocakademi.com',
            '$2a$10$YourHashedPasswordHere', -- Bu backend tarafından oluşturulacak
            'Admin',
            'User',
            'admin',
            true,
            true
        );
        
        RAISE NOTICE 'Admin kullanıcısı oluşturuldu!';
    ELSE
        RAISE NOTICE 'Admin kullanıcısı zaten mevcut.';
    END IF;
END $$;

-- Admin kullanıcısını kontrol et
SELECT id, email, first_name, last_name, role, is_active, email_verified
FROM users
WHERE email = 'admin@gocakademi.com';
