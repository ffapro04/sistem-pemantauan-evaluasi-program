# 📚 Panduan Manajemen Data Guru

## ✅ Fitur yang Sudah Selesai

### **Backend**
- ✅ Entity `AssessmentGuru` dengan field lengkap:
  - `id_guru_assessment`
  - `id_sekolah`
  - `nama_guru`
  - `email_guru` (opsional)
  - `no_telepon` (opsional)
  - `mata_pelajaran` (opsional)
  - `nip` (opsional)
  - `password_hash`
  - `is_active`
  - `last_login_at`
  - `created_at`, `updated_at`

- ✅ Endpoint lengkap:
  ```
  GET  /assessment-guru/sekolah/:id_sekolah        → List semua guru
  GET  /assessment-guru/sekolah/:id_sekolah/aktif  → List guru aktif
  GET  /assessment-guru/:id                        → Detail guru
  POST /assessment-guru/register                   → Tambah guru
  PATCH /assessment-guru/:id                       → Update guru
  DELETE /assessment-guru/:id                      → Hapus guru
  ```

- ✅ Login guru via:
  ```
  POST /auth/login-guru
  Body: { id_sekolah, nama_guru, password }
  Return: JWT dengan id_role: 8
  ```

### **Frontend**
- ✅ Config file `guru.config.jsx` dengan Master CRUD pattern
- ✅ Halaman CRUD lengkap:
  - `DataGuru.jsx` → List/Read (tabel)
  - `CreateGuru.jsx` → Form tambah
  - `EditGuru.jsx` → Form edit
  - `DetailGuru.jsx` → Detail info

- ✅ Form field lengkap:
  - Nama Guru (required)
  - Email (opsional)
  - No Telepon (opsional)
  - NIP (opsional)
  - Mata Pelajaran (opsional)
  - Password (required saat create, opsional saat edit)

- ✅ Login guru via dropdown role "Guru Assessment"

---

## 🚀 Cara Pakai

### **1. Akses Halaman Data Guru (Operator Sekolah - Role 9)**

Login sebagai Operator Sekolah:
```
Email: operator@sekolah1.com
Password: (sesuai data)
```

Setelah login, klik menu **"Data Guru"** di sidebar.

### **2. Tambah Guru Baru**

1. Klik tombol **"Tambah Guru"**
2. Isi form:
   - **Nama Lengkap Guru** (wajib)
   - **Email Guru** (opsional)
   - **No. Telepon** (opsional)
   - **NIP** (opsional)
   - **Mata Pelajaran** (opsional)
   - **Password** (wajib, minimal 4 karakter)
3. Klik **"Simpan Guru"**
4. Jika berhasil, otomatis redirect ke halaman **Data Guru** (tabel)

### **3. Login sebagai Guru**

1. Buka halaman login: `/login`
2. Di dropdown role, pilih **"Guru Assessment"**
3. Form akan berubah:
   - **ID Sekolah** (number)
   - **Nama Guru** (sesuai saat registrasi)
   - **Password**
4. Klik **"Masuk"**
5. Redirect ke `/sekolah/dashboard`

### **4. Edit Data Guru**

1. Di halaman **Data Guru**, klik icon **Edit** (pensil)
2. Ubah data yang diperlukan
3. Password: **kosongkan jika tidak ingin diubah**
4. Klik **"Update Guru"**
5. Redirect ke halaman **Data Guru**

### **5. Hapus Guru**

1. Di halaman **Data Guru**, klik icon **Delete** (trash)
2. Konfirmasi popup SweetAlert
3. Klik **"Ya, Hapus"**
4. Data guru terhapus dari database

---

## 🔧 Struktur File

### **Backend**
```
backend/src/assessment-guru/
├── entities/
│   └── assessment-guru.entity.ts          ← Entity dengan field lengkap
├── dto/
│   ├── register-guru.dto.ts               ← DTO untuk POST register
│   ├── login-guru.dto.ts
│   └── reset-password-guru.dto.ts
├── assessment-guru.controller.ts          ← Endpoint controller
├── assessment-guru.service.ts             ← Business logic
└── assessment-guru.module.ts
```

### **Frontend**
```
frontend/src/
├── config/masterCrud/
│   └── guru.config.jsx                    ← Config Master CRUD
├── page/sekolah/
│   ├── DataGuru.jsx                       ← Read (tabel)
│   ├── CreateGuru.jsx                     ← Create form
│   ├── EditGuru.jsx                       ← Edit form
│   └── DetailGuru.jsx                     ← Detail view
└── components/masterCrud/
    ├── MasterReadPage.jsx                 ← Updated: handle user context
    └── MasterFormPage.jsx                 ← Updated: handle user context
```

---

## 🧪 Testing

### **Test Backend**
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run start:dev
```

### **Test Register Guru (via Postman)**
```http
POST http://localhost:3000/assessment-guru/register
Content-Type: application/json
Authorization: Bearer <TOKEN_OPERATOR_SEKOLAH>

{
  "id_sekolah": 1,
  "nama_guru": "Budi Santoso",
  "email_guru": "budi@sekolah.com",
  "no_telepon": "08123456789",
  "mata_pelajaran": "Matematika",
  "nip": "199001012020011001",
  "password": "guru123"
}
```

**Expected Response:**
```json
{
  "message": "Guru berhasil didaftarkan",
  "data": {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "email_guru": "budi@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T...",
    "created_at": "2026-06-09T...",
    "updated_at": "2026-06-09T..."
  }
}
```

### **Test Login Guru**
```http
POST http://localhost:3000/auth/login-guru
Content-Type: application/json

{
  "id_sekolah": 1,
  "nama_guru": "Budi Santoso",
  "password": "guru123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Decode JWT-nya, pastikan:
```json
{
  "sub": 1,
  "id_guru_assessment": 1,
  "nama": "Budi Santoso",
  "id_role": 8,
  "role": "Guru Assessment",
  "id_sekolah": 1,
  "iat": ...,
  "exp": ...
}
```

### **Test Frontend**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run dev
```

**Skenario Test:**
1. ✅ Login sebagai Operator Sekolah → Klik "Data Guru" di sidebar
2. ✅ Klik "Tambah Guru" → Isi form → Submit → Redirect ke tabel
3. ✅ Lihat data guru muncul di tabel
4. ✅ Klik Edit → Ubah data → Submit → Data terupdate
5. ✅ Logout → Login sebagai Guru → Masuk ke dashboard
6. ✅ Klik "Daftar Guru" di sidebar (role 8) → Lihat list guru aktif
7. ✅ Kembali ke Operator → Hapus guru → Konfirmasi → Data terhapus

---

## ⚠️ Catatan Penting

### **1. Password Plain Text**
⚠️ Saat ini password disimpan **plain text** (tidak di-hash dengan bcrypt).

**TODO:** Implementasi bcrypt di:
- `assessment-guru.service.ts` → method `register` dan `update`
- `auth.service.ts` → method `loginGuru`

### **2. Navigasi Setelah Submit**
Setelah berhasil **Create** atau **Update** guru, sistem otomatis redirect ke:
```
/sekolah/guru  ← Halaman tabel Data Guru
```

Ini dikontrol oleh `MasterFormPage` dengan logic:
```javascript
// Di handleSubmit setelah success
setTimeout(() => {
    navigate(config.routes.read);  // → /sekolah/guru
}, 1000);
```

### **3. User Context di Config**
Config `guru.config.jsx` menggunakan function untuk endpoint list:
```javascript
api: {
    list: ({ user }) => `/assessment-guru/sekolah/${user?.id_sekolah}`,
    // ...
}
```

`MasterReadPage` dan `MasterFormPage` sudah update untuk decode JWT dan pass `user` context.

---

## 🐛 Troubleshooting

### **Error: "ID Sekolah tidak ditemukan di token Anda"**
**Penyebab:** JWT token tidak punya `id_sekolah`

**Solusi:**
1. Cek JWT token di localStorage (F12 → Application → Local Storage)
2. Decode token, pastikan ada field `id_sekolah`
3. Jika tidak ada, login ulang sebagai Operator Sekolah

### **Error: "Nama guru sudah terdaftar di sekolah ini"**
**Penyebab:** Nama guru duplikat di sekolah yang sama

**Solusi:** Gunakan nama yang berbeda atau edit nama guru yang sudah ada

### **Guru tidak bisa login**
**Penyebab:** Password salah atau `is_active: false`

**Solusi:**
1. Cek password yang diinput
2. Di tabel Data Guru, pastikan status guru **Aktif**
3. Jika nonaktif, edit guru dan set `is_active: true`

### **Redirect tidak jalan setelah submit**
**Penyebab:** Config `routes.read` tidak sesuai

**Solusi:** Pastikan di `guru.config.jsx`:
```javascript
routes: {
    read: "/sekolah/guru",  ← Harus sesuai dengan route di App.jsx
    // ...
}
```

---

## 📞 Support

Jika ada bug atau error:
1. Cek console browser (F12)
2. Cek terminal backend untuk error log
3. Cek database tabel `assessment_guru`

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 9 Juni 2026  
**Versi:** 1.0.0
