# Fresh Database Setup Script
# This script drops and recreates the database with all schemas and admin user

$DB_NAME = "gocakademi"
$DB_USER = "postgres"
$PSQL_PATH = "C:\Program Files\PostgreSQL\18\bin\psql.exe" # PostgreSQL'in yolunu buraya ekle

Write-Host "`n🔄 Starting fresh database setup...`n" -ForegroundColor Cyan

# 1. Drop existing database (if exists)
Write-Host "1️⃣ Dropping existing database (if exists)..." -ForegroundColor Yellow
& $PSQL_PATH -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1 | Out-Null

# 2. Create fresh database
Write-Host "2️⃣ Creating fresh database..." -ForegroundColor Yellow
& $PSQL_PATH -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database created successfully`n" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Failed to create database`n" -ForegroundColor Red
    exit 1
}

# 3. Load main schema
Write-Host "3️⃣ Loading main schema..." -ForegroundColor Yellow
& $PSQL_PATH -U $DB_USER -d $DB_NAME -f "api/database/schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Schema loaded successfully`n" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Failed to load schema`n" -ForegroundColor Red
    exit 1
}

# 4. Load schema extensions
Write-Host "4️⃣ Loading schema extensions..." -ForegroundColor Yellow
& $PSQL_PATH -U $DB_USER -d $DB_NAME -f "api/database/schema_extensions.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Extensions loaded successfully`n" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Failed to load extensions`n" -ForegroundColor Red
    exit 1
}

# 5. Create admin user
Write-Host "5️⃣ Creating admin user..." -ForegroundColor Yellow
& $PSQL_PATH -U $DB_USER -d $DB_NAME -f "api/database/create-admin.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Admin user created successfully`n" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Failed to create admin user`n" -ForegroundColor Red
    exit 1
}

# 6. Run education migrations
Write-Host "6️⃣ Running education migrations..." -ForegroundColor Yellow
npm run db:migrate

Write-Host "`n✅ Database setup completed!`n" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 Admin Credentials:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Email:    admin@gocakademi.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
