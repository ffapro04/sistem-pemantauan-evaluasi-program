# 🚀 Quick Start Guide - Manajemen Data Guru

## ⚡ Start Development Servers

### 1. Start Backend (Terminal 1)
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run start:dev
```
**Wait for:** `Nest application successfully started` di port **3000**

### 2. Start Frontend (Terminal 2)
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run dev
```
**Wait for:** `Local: http://localhost:5173/`

---

## 🔐 Login Credentials

### **Operator Sekolah (Role 9 - Full CRUD)**
1. Buka: `http://localhost:5173/login`
2. Dropdown role → **"Operator Sekolah"**
3. Kredensial:
   ```
   Email: operator@sekolah1.com
   Password: [check database atau tanya admin]
   ```
4. Setelah login → redirect ke `/sekolah/dashboard`

### **Guru Assessment (Role 8 - View Only)**
1. Buka: `http://localhost:5173/login`
2. Dropdown role → **"Guru Assessment"**
3. Form berubah:
   ```
   ID Sekolah: 1
   Nama Guru: [nama guru yang sudah didaftarkan]
   Password: [password guru]
   ```
4. Setelah login → redirect ke `/sekolah/dashboard`

---

## 🎯 Quick Test Flow (5 Menit)

### **Step 1: Tambah Guru Baru**
1. Login sebagai **Operator Sekolah**
2. Sidebar → **Data Guru** (di section "Kelola Data")
3. Klik **"Tambah Guru"**
4. Isi form:
   ```
   Nama: Test Guru 001
   Email: test@sekolah.com
   Telepon: 08123456789
   Mata Pelajaran: Matematika
   NIP: 123456789
   Password: test123
   ```
5. Klik **"Simpan Guru"**
6. ✅ **Expect:** Redirect ke tabel, guru baru muncul

### **Step 2: Edit Guru**
1. Di tabel, klik icon **Edit** (pensil) di guru yang baru dibuat
2. Ubah:
   ```
   Mata Pelajaran: Matematika & IPA
   Email: test.updated@sekolah.com
   ```
3. Klik **"Update Guru"**
4. ✅ **Expect:** Redirect ke tabel, data terupdate

### **Step 3: Toggle Status**
1. Di tabel, lihat kolom **Status**
2. Klik toggle switch → Aktif → Nonaktif
3. ✅ **Expect:** Status berubah merah, toast notification muncul

### **Step 4: Login Sebagai Guru**
1. Logout dari Operator Sekolah
2. Login dengan kredensial guru:
   ```
   Dropdown: Guru Assessment
   ID Sekolah: 1
   Nama Guru: Test Guru 001
   Password: test123
   ```
3. ✅ **Expect:** Redirect ke `/sekolah/dashboard`
4. ✅ **Sidebar menu:**
   - Dashboard
   - Assessment
   - Program Sekolah
   - **Daftar Guru** (view only - NO button Tambah/Edit/Delete)
   - Berita Acara

### **Step 5: View Daftar Guru (Role 8)**
1. Klik menu **Daftar Guru**
2. ✅ **Expect:** Tabel guru aktif muncul (read-only)
3. ✅ **NO button:** Tambah/Edit/Delete

### **Step 6: Delete Guru**
1. Logout, login kembali sebagai **Operator Sekolah**
2. Sidebar → **Data Guru**
3. Klik icon **Delete** (trash) di guru test
4. Konfirmasi **"Ya, Hapus"**
5. ✅ **Expect:** Guru hilang dari tabel

---

## 🐛 Quick Troubleshooting

### **Error: "ID Sekolah tidak ditemukan di token Anda"**
**Fix:** Logout → Login ulang (token corrupt/expired)

### **Error: Build gagal**
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
```

### **Error: Database column not found**
```bash
# Manual migration
cd backend\src\migrations
psql -U postgres -d sistem_monitoring_evaluasi_program -f add-guru-fields.sql
```

### **Error: Port sudah digunakan**
```bash
# Backend (port 3000)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

---

## 📊 Quick Database Check

### **Check Guru Data**
```sql
-- Connect to database
psql -U postgres -d sistem_monitoring_evaluasi_program

-- View all guru
SELECT 
    id_guru_assessment,
    nama_guru,
    email_guru,
    mata_pelajaran,
    is_active,
    last_login_at
FROM assessment_guru
ORDER BY nama_guru;

-- Check table structure
\d assessment_guru;
```

### **Sample Insert (Manual)**
```sql
INSERT INTO assessment_guru (
    id_sekolah, nama_guru, email_guru, no_telepon, 
    mata_pelajaran, nip, password_hash, is_active
) VALUES (
    1, 'Manual Guru', 'manual@sekolah.com', '08111222333',
    'IPA', '999888777', 'password123', true
);
```

---

## 🔍 Quick API Test (Postman/Thunder Client)

### **1. Login Guru**
```http
POST http://localhost:3000/auth/login-guru
Content-Type: application/json

{
  "id_sekolah": 1,
  "nama_guru": "Test Guru 001",
  "password": "test123"
}
```

### **2. Get Guru by Sekolah**
```http
GET http://localhost:3000/assessment-guru/sekolah/1
Authorization: Bearer [YOUR_TOKEN]
```

### **3. Create Guru**
```http
POST http://localhost:3000/assessment-guru/register
Content-Type: application/json
Authorization: Bearer [YOUR_TOKEN]

{
  "id_sekolah": 1,
  "nama_guru": "API Test Guru",
  "email_guru": "api@test.com",
  "no_telepon": "08999888777",
  "mata_pelajaran": "Kimia",
  "nip": "1234567890",
  "password": "apitest123"
}
```

### **4. Update Guru**
```http
PATCH http://localhost:3000/assessment-guru/1
Content-Type: application/json
Authorization: Bearer [YOUR_TOKEN]

{
  "mata_pelajaran": "Fisika & Kimia",
  "email_guru": "updated@test.com"
}
```

### **5. Delete Guru**
```http
DELETE http://localhost:3000/assessment-guru/1
Authorization: Bearer [YOUR_TOKEN]
```

---

## 📁 Key Files Reference

### **Backend**
```
backend/
├── src/
│   ├── assessment-guru/
│   │   ├── entities/assessment-guru.entity.ts    # 12 kolom
│   │   ├── assessment-guru.service.ts            # 10 methods
│   │   └── assessment-guru.controller.ts         # 7 endpoints
│   ├── auth/
│   │   ├── auth.service.ts                       # Login guru logic
│   │   └── auth.controller.ts                    # POST /auth/login-guru
│   └── migrations/
│       └── add-guru-fields.sql                   # Manual migration
```

### **Frontend**
```
frontend/
├── src/
│   ├── config/masterCrud/
│   │   └── guru.config.jsx                       # 400+ lines config
│   ├── components/masterCrud/
│   │   ├── MasterReadPage.jsx                    # Updated untuk user context
│   │   └── MasterFormPage.jsx                    # Updated untuk user context
│   └── page/sekolah/
│       ├── DataGuru.jsx                          # Tabel (Role 9)
│       ├── CreateGuru.jsx                        # Form Create
│       ├── EditGuru.jsx                          # Form Edit
│       ├── DetailGuru.jsx                        # Detail View
│       └── DaftarGuru.jsx                        # View Only (Role 8)
```

---

## 🎯 5 Most Common Tasks

### **1. Tambah Guru Baru**
Operator Sekolah → Data Guru → Tambah Guru → Isi form → Simpan

### **2. Edit Data Guru**
Operator Sekolah → Data Guru → Edit icon → Update → Simpan

### **3. Nonaktifkan Guru**
Operator Sekolah → Data Guru → Toggle Status → Confirm

### **4. Login Sebagai Guru**
Login page → Guru Assessment → Input ID + Nama + Password → Masuk

### **5. Lihat Daftar Guru (Guru)**
Guru login → Menu Daftar Guru → View table (read-only)

---

## ✅ Quick Checklist Before Testing

- [ ] Backend running di port 3000
- [ ] Frontend running di port 5173
- [ ] Database PostgreSQL aktif
- [ ] Tabel `assessment_guru` punya 12 kolom
- [ ] Token JWT tersimpan di localStorage setelah login
- [ ] Browser console (F12) terbuka untuk debug

---

## 📞 Help & Documentation

- **Full Implementation:** `STATUS_IMPLEMENTATION.md`
- **Comprehensive Testing:** `TESTING_CHECKLIST.md`
- **User Guide:** `GURU_MANAGEMENT_GUIDE.md`
- **Struktur Sekolah:** `REVISI_STRUKTUR_SEKOLAH.md`

---

**Happy Testing! 🎉**

Jika ada issue, cek console browser + backend terminal untuk error message.
