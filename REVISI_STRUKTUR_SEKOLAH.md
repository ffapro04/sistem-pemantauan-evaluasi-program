# 📚 Revisi Struktur Halaman Sekolah

## 🎯 Tujuan Revisi
Menyederhanakan struktur folder dan routing untuk **Role 8 (Guru Assessment)** dan **Role 9 (Operator Sekolah)** dengan menggabungkan semua halaman ke satu folder `src/page/sekolah/` yang shared, lalu membedakan akses dan tampilan berdasarkan `id_role` dari JWT token.

---

## 🗂️ Struktur Folder Baru

### Frontend
```
src/page/sekolah/
├── DashboardSekolah.jsx       ← Shared (Role 8 & 9) - Welcome banner
├── AssessmentSekolah.jsx      ← Shared - Role 8 bisa isi, Role 9 view only
├── IsiAssessmentSekolah.jsx   ← Shared - Form pengisian assessment
├── ProgramSekolah.jsx         ← Shared - Daftar program sekolah
├── DaftarGuru.jsx             ← Role 8 only - View guru aktif
├── DataGuru.jsx               ← Role 9 only - CRUD guru (aktif + nonaktif)
├── BeritaAcara.jsx            ← Shared - Coming soon page
├── CreateGuru.jsx             ← Role 9 only - Form tambah guru
├── EditGuru.jsx               ← Role 9 only - Form edit guru
└── DetailGuru.jsx             ← Role 9 only - Detail guru
```

### Backend
```
src/
├── auth/
│   ├── auth.service.ts        ← Ada method login() & loginGuru()
│   ├── auth.controller.ts     ← POST /auth/login & /auth/login-guru
│   └── auth.module.ts         ← Import AssessmentGuru entity
├── assessment-guru/
│   ├── assessment-guru.service.ts  ← CRUD lengkap + findAktifBySekolah
│   ├── assessment-guru.controller.ts
│   └── entities/assessment-guru.entity.ts
└── program/
    ├── program.service.ts     ← Tambah findBySekolah(id_sekolah)
    └── program.controller.ts  ← GET /program/sekolah/:id_sekolah
```

---

## 🔐 Role & Hak Akses

### **Role 8 - Guru Assessment**
**Login:** POST `/auth/login-guru`
- Body: `{ id_sekolah, nama_guru, password }`
- Return: JWT dengan `id_role: 8`

**Menu Akses:**
| Halaman | Path | Akses |
|---------|------|-------|
| Dashboard | `/sekolah/dashboard` | ✅ View |
| Assessment | `/sekolah/assessment` | ✅ Bisa isi assessment |
| Isi Assessment | `/sekolah/assessment/isi/:id` | ✅ Form isi soal |
| Program | `/sekolah/program` | ✅ View program sekolah |
| Daftar Guru | `/sekolah/daftar-guru` | ✅ View guru aktif saja |
| Berita Acara | `/sekolah/berita-acara` | ✅ Coming soon |

### **Role 9 - Operator Sekolah**
**Login:** POST `/auth/login`
- Body: `{ email, password }`
- Return: JWT dengan `id_role: 9`

**Menu Akses:**
| Halaman | Path | Akses |
|---------|------|-------|
| Dashboard | `/sekolah/dashboard` | ✅ View |
| Assessment | `/sekolah/assessment` | 👁️ View only (no tombol "Isi") |
| Program | `/sekolah/program` | ✅ View program sekolah |
| Data Guru | `/sekolah/guru` | ✅ CRUD penuh (aktif + nonaktif) |
| Tambah Guru | `/sekolah/guru/create` | ✅ Form create |
| Edit Guru | `/sekolah/guru/edit/:id` | ✅ Form edit |
| Detail Guru | `/sekolah/guru/detail/:id` | ✅ Detail info |
| Berita Acara | `/sekolah/berita-acara` | ✅ Coming soon |

---

## 🛠️ Backend Endpoints

### **Auth**
```typescript
POST /auth/login
Body: { email, password }
Return: { access_token: "..." }  // id_role: 1-7, 9

POST /auth/login-guru
Body: { id_sekolah, nama_guru, password }
Return: { access_token: "..." }  // id_role: 8
```

### **Assessment**
```typescript
GET /assessment/sekolah/:id_sekolah
Return: [{ id_assessment, nama, status, ... }]

GET /assessment/:id
Return: { id_assessment, nama, pertanyaan: [...] }

POST /assessment/:id/jawab
Body: { id_guru_assessment, answers: [{ id_pertanyaan, jawaban, skor }] }
```

### **Assessment Guru (CRUD)**
```typescript
GET /assessment-guru/sekolah/:id_sekolah
Return: [{ id_guru_assessment, nama_guru, is_active, ... }]  // Semua guru

GET /assessment-guru/sekolah/:id_sekolah/aktif
Return: [{ id_guru_assessment, nama_guru, ... }]  // Hanya aktif

GET /assessment-guru/:id
Return: { id_guru_assessment, nama_guru, id_sekolah, ... }

POST /assessment-guru/register
Body: { id_sekolah, nama_guru, password }
Return: { message: "Guru berhasil didaftarkan", data: {...} }

PATCH /assessment-guru/:id
Body: { nama_guru?, password?, is_active? }
Return: { message: "Data guru berhasil diperbarui", data: {...} }

DELETE /assessment-guru/:id
Return: { message: "Guru berhasil dihapus" }
```

### **Program**
```typescript
GET /program/sekolah/:id_sekolah
Return: [{ id_program, nama_program, status_program, ... }]
```

---

## 🎨 Sidebar Menu

### **Role 8 (Guru Assessment)**
```
Ikhtisar
  └─ Dashboard
Akademik
  ├─ Assessment
  ├─ Program Sekolah
  ├─ Daftar Guru
  └─ Berita Acara
```

### **Role 9 (Operator Sekolah)**
```
Ikhtisar
  └─ Dashboard
Akademik
  ├─ Assessment
  ├─ Program Sekolah
  └─ Berita Acara
Kelola Data
  └─ Data Guru
```

---

## ✅ Checklist Perubahan

### **Backend**
- [x] `auth.service.ts` - Tambah method `loginGuru()`
- [x] `auth.controller.ts` - Tambah endpoint `POST /auth/login-guru`
- [x] `auth.module.ts` - Import `AssessmentGuru` entity
- [x] `assessment-guru.service.ts` - Tambah method:
  - [x] `findOne(id)` - GET by ID
  - [x] `findAktifBySekolah(id_sekolah)` - GET guru aktif
  - [x] `update(id, body)` - PATCH guru
  - [x] `remove(id)` - DELETE guru
- [x] `assessment-guru.controller.ts` - Tambah endpoint:
  - [x] `GET /assessment-guru/:id`
  - [x] `GET /assessment-guru/sekolah/:id_sekolah/aktif`
  - [x] `PATCH /assessment-guru/:id`
  - [x] `DELETE /assessment-guru/:id`
- [x] `program.service.ts` - Tambah method `findBySekolah(id_sekolah)`
- [x] `program.controller.ts` - Tambah endpoint `GET /program/sekolah/:id_sekolah`

### **Frontend**
- [x] `App.jsx` - Update routing `/sekolah/...`
  - [x] Import `DataGuru` untuk role 9
  - [x] Hapus import `GuruAccess` (tidak dipakai)
  - [x] Route `/sekolah/daftar-guru` → `DaftarGuru`
  - [x] Route `/sekolah/guru` → `DataGuru`
  - [x] Hapus route `/guru/akses/:token`
- [x] `Sidebar.jsx` - Update menu role 8 & 9
  - [x] Role 8: path ke `/sekolah/...`
  - [x] Role 9: path ke `/sekolah/...` + section "Kelola Data"
- [x] `Login.jsx` - Tambah dropdown role dengan form adaptif
- [x] Folder `src/page/sekolah/` - Buat semua file:
  - [x] `DashboardSekolah.jsx`
  - [x] `AssessmentSekolah.jsx`
  - [x] `IsiAssessmentSekolah.jsx`
  - [x] `ProgramSekolah.jsx`
  - [x] `DaftarGuru.jsx` (Role 8)
  - [x] `DataGuru.jsx` (Role 9)
  - [x] `BeritaAcara.jsx`
  - [x] `CreateGuru.jsx`
  - [x] `EditGuru.jsx`
  - [x] `DetailGuru.jsx`

---

## 🚀 Cara Testing

### 1. **Testing Backend**
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run build        # Pastikan tidak ada error
npm run start:dev    # Jalankan backend di port 3000
```

### 2. **Testing Login Guru**
```bash
# Di Postman atau Thunder Client
POST http://localhost:3000/auth/login-guru
Content-Type: application/json

{
  "id_sekolah": 1,
  "nama_guru": "Ahmad Supardi",
  "password": "guru123"
}

# Expected response:
{
  "access_token": "eyJhbGc..."  # JWT dengan id_role: 8
}
```

### 3. **Testing Login Operator Sekolah**
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "operator@sekolah1.com",
  "password": "operator123"
}

# Expected response:
{
  "access_token": "eyJhbGc..."  # JWT dengan id_role: 9
}
```

### 4. **Testing Frontend**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run dev    # Jalankan frontend

# Buka browser: http://localhost:5173
# Test login dengan dropdown role:
# 1. Pilih "Guru Assessment" → isi ID Sekolah, Nama Guru, Password
# 2. Pilih "Operator Sekolah" → isi Email, Password
# 3. Verifikasi redirect ke /sekolah/dashboard
# 4. Cek sidebar menu sesuai role
```

---

## 📝 Catatan Penting

### **Password Storage**
⚠️ **PERINGATAN:** Saat ini password disimpan **plain text** (tidak di-hash).
```typescript
// ❌ SEKARANG - TIDAK AMAN
if (user.password !== passwordInput) { ... }

// ✅ SEHARUSNYA - GUNAKAN BCRYPT
import * as bcrypt from 'bcrypt';
const isValid = await bcrypt.compare(passwordInput, user.password);
```

**TODO:** Implementasi bcrypt untuk hashing password di:
- `auth.service.ts` (login & loginGuru)
- `assessment-guru.service.ts` (register & update password)
- `users.service.ts` (create & update user)

### **Database Migrations**
Gunakan TypeORM migrations untuk production:
```bash
npm run typeorm migration:generate -- -n CreateAssessmentGuruTable
npm run typeorm migration:run
```

### **Environment Variables**
Pindahkan konfigurasi ke `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ypamdr17
DB_DATABASE=sistem_monitoring_evaluasi_program
JWT_SECRET=SECRET_KEY_GANTI_INI
```

---

## 🎉 Hasil Akhir

### **Struktur Sebelum:**
```
❌ src/page/admin/operatorsekolah/...  (salah tempat)
❌ src/page/guru/GuruAccess.jsx        (login via token)
```

### **Struktur Sesudah:**
```
✅ src/page/sekolah/...  (semua halaman sekolah di satu folder)
✅ Login via form dropdown role (tidak pakai token lagi)
✅ Backend support 2 endpoint login terpisah
✅ Sidebar menu sesuai hak akses role
```

---

## 🐛 Troubleshooting

### **Error: "Nama guru atau password salah"**
- Pastikan `id_sekolah` benar
- Cek `nama_guru` case-sensitive atau tidak (backend pakai LOWER())
- Verifikasi password match dengan data di database

### **Error: "Akun guru tidak aktif"**
- Cek kolom `is_active` di tabel `assessment_guru`
- Aktifkan via endpoint PATCH `/assessment-guru/:id` dengan body `{ is_active: true }`

### **Role tidak muncul di Sidebar**
- Cek JWT token di localStorage
- Decode token, pastikan `id_role: 8` atau `id_role: 9`
- Refresh browser setelah login

---

## 📞 Support
Jika ada bug atau error, cek:
1. Console browser (F12) untuk error frontend
2. Terminal backend untuk error API
3. Database untuk data guru / assessment

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 9 Juni 2026  
**Versi:** 1.0.0
