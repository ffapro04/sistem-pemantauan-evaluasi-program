# 📡 API Endpoints - Manajemen Data Guru

## Base URL
```
http://localhost:3000
```

## Authentication
Semua endpoint (kecuali login) membutuhkan JWT token di header:
```
Authorization: Bearer [YOUR_JWT_TOKEN]
```

---

## 🔐 AUTHENTICATION

### **Login Guru**
Login guru assessment menggunakan ID Sekolah + Nama Guru + Password.

```http
POST /auth/login-guru
Content-Type: application/json
```

**Request Body:**
```json
{
  "id_sekolah": 1,
  "nama_guru": "Budi Santoso",
  "password": "guru123"
}
```

**Response Success (200):**
```json
{
  "message": "Login guru berhasil",
  "guru": {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "email_guru": "budi@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:30:00.000Z",
    "created_at": "2026-06-01T08:00:00.000Z",
    "updated_at": "2026-06-09T10:30:00.000Z"
  }
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Nama guru atau password salah",
  "error": "Unauthorized"
}
```

**Response Error - Akun Nonaktif (401):**
```json
{
  "statusCode": 401,
  "message": "Akun guru tidak aktif",
  "error": "Unauthorized"
}
```

**Business Rules:**
- `nama_guru` case-insensitive
- Password plain text (belum hash)
- `is_active` harus `true` untuk bisa login
- `last_login_at` otomatis diupdate saat login sukses

---

## 📝 CRUD OPERATIONS

### **1. Create Guru (Register)**
Mendaftarkan guru baru di sekolah tertentu.

```http
POST /assessment-guru/register
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Request Body:**
```json
{
  "id_sekolah": 1,
  "nama_guru": "John Doe",
  "email_guru": "john@sekolah.com",
  "no_telepon": "08123456789",
  "mata_pelajaran": "Matematika",
  "nip": "199001012020011001",
  "password": "password123"
}
```

**Field Requirements:**
- `id_sekolah` - **REQUIRED** (number, must exist in `sekolah` table)
- `nama_guru` - **REQUIRED** (string, trimmed, unique per sekolah)
- `password` - **REQUIRED** (string, min 4 chars)
- `email_guru` - OPTIONAL (string, email format)
- `no_telepon` - OPTIONAL (string, max 20 chars)
- `mata_pelajaran` - OPTIONAL (string, max 100 chars)
- `nip` - OPTIONAL (string, max 50 chars)

**Response Success (201):**
```json
{
  "message": "Guru berhasil didaftarkan",
  "data": {
    "id_guru_assessment": 10,
    "id_sekolah": 1,
    "nama_guru": "John Doe",
    "email_guru": "john@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:35:00.000Z",
    "created_at": "2026-06-09T10:35:00.000Z",
    "updated_at": "2026-06-09T10:35:00.000Z"
  }
}
```

**Response Error - Duplikat Nama (409):**
```json
{
  "statusCode": 409,
  "message": "Nama guru sudah terdaftar di sekolah ini. Silakan gunakan menu masuk guru.",
  "error": "Conflict"
}
```

**Response Error - Sekolah Tidak Ada (404):**
```json
{
  "statusCode": 404,
  "message": "Sekolah tidak ditemukan",
  "error": "Not Found"
}
```

---

### **2. Get All Guru by Sekolah (All Status)**
Mendapatkan **semua guru** (aktif + nonaktif) di sekolah tertentu.  
**Digunakan oleh:** Operator Sekolah (Role 9) untuk tabel Data Guru.

```http
GET /assessment-guru/sekolah/:id_sekolah
Authorization: Bearer [TOKEN]
```

**Example:**
```http
GET /assessment-guru/sekolah/1
```

**Response Success (200):**
```json
[
  {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "email_guru": "budi@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:30:00.000Z",
    "created_at": "2026-06-01T08:00:00.000Z",
    "updated_at": "2026-06-09T10:30:00.000Z"
  },
  {
    "id_guru_assessment": 2,
    "id_sekolah": 1,
    "nama_guru": "Ani Wijaya",
    "email_guru": "ani@sekolah.com",
    "no_telepon": "08198765432",
    "mata_pelajaran": "IPA",
    "nip": "199102022020022002",
    "is_active": false,
    "last_login_at": "2026-06-05T14:20:00.000Z",
    "created_at": "2026-06-02T09:00:00.000Z",
    "updated_at": "2026-06-08T11:15:00.000Z"
  }
]
```

**Response Error - ID Invalid (400):**
```json
{
  "statusCode": 400,
  "message": "ID sekolah tidak valid",
  "error": "Bad Request"
}
```

---

### **3. Get Active Guru by Sekolah**
Mendapatkan **hanya guru aktif** di sekolah tertentu.  
**Digunakan oleh:** Guru Assessment (Role 8) untuk Daftar Guru (view only).

```http
GET /assessment-guru/sekolah/:id_sekolah/aktif
Authorization: Bearer [TOKEN]
```

**Example:**
```http
GET /assessment-guru/sekolah/1/aktif
```

**Response Success (200):**
```json
[
  {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "email_guru": "budi@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:30:00.000Z",
    "created_at": "2026-06-01T08:00:00.000Z",
    "updated_at": "2026-06-09T10:30:00.000Z"
  }
]
```

**Note:** Guru dengan `is_active = false` **tidak muncul** di response ini.

---

### **4. Get Guru Detail by ID**
Mendapatkan detail lengkap guru berdasarkan ID.

```http
GET /assessment-guru/:id
Authorization: Bearer [TOKEN]
```

**Example:**
```http
GET /assessment-guru/1
```

**Response Success (200):**
```json
{
  "id_guru_assessment": 1,
  "id_sekolah": 1,
  "nama_guru": "Budi Santoso",
  "email_guru": "budi@sekolah.com",
  "no_telepon": "08123456789",
  "mata_pelajaran": "Matematika",
  "nip": "199001012020011001",
  "is_active": true,
  "last_login_at": "2026-06-09T10:30:00.000Z",
  "created_at": "2026-06-01T08:00:00.000Z",
  "updated_at": "2026-06-09T10:30:00.000Z"
}
```

**Response Error - Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "Guru tidak ditemukan",
  "error": "Not Found"
}
```

**Note:** `password_hash` **TIDAK pernah** dikirim ke frontend (security).

---

### **5. Update Guru**
Update data guru. Semua field opsional kecuali yang divalidasi.

```http
PATCH /assessment-guru/:id
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Example:**
```http
PATCH /assessment-guru/1
```

**Request Body (Partial Update):**
```json
{
  "nama_guru": "Budi Santoso Updated",
  "email_guru": "budi.updated@sekolah.com",
  "no_telepon": "08111222333",
  "mata_pelajaran": "Matematika & IPA",
  "nip": "199001012020011001",
  "password": "newpassword123",
  "is_active": true
}
```

**Field Rules:**
- `nama_guru` - Jika diubah, tidak boleh duplikat dengan guru lain di sekolah yang sama
- `password` - **OPTIONAL**. Jika kosong/undefined, password lama tetap dipakai. Jika diisi, min 4 chars
- `email_guru`, `no_telepon`, `mata_pelajaran`, `nip` - Opsional, bisa string kosong
- `is_active` - Boolean untuk toggle status

**Response Success (200):**
```json
{
  "message": "Data guru berhasil diperbarui",
  "data": {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso Updated",
    "email_guru": "budi.updated@sekolah.com",
    "no_telepon": "08111222333",
    "mata_pelajaran": "Matematika & IPA",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:30:00.000Z",
    "created_at": "2026-06-01T08:00:00.000Z",
    "updated_at": "2026-06-09T11:00:00.000Z"
  }
}
```

**Response Error - Duplikat Nama (409):**
```json
{
  "statusCode": 409,
  "message": "Nama guru sudah digunakan di sekolah ini",
  "error": "Conflict"
}
```

**Response Error - Password Terlalu Pendek (400):**
```json
{
  "statusCode": 400,
  "message": "Password minimal 4 karakter",
  "error": "Bad Request"
}
```

---

### **6. Delete Guru**
Hapus guru dari database (hard delete).

```http
DELETE /assessment-guru/:id
Authorization: Bearer [TOKEN]
```

**Example:**
```http
DELETE /assessment-guru/1
```

**Response Success (200):**
```json
{
  "message": "Guru berhasil dihapus"
}
```

**Response Error - Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "Guru tidak ditemukan",
  "error": "Not Found"
}
```

**Note:** Ini adalah **hard delete** (data benar-benar hilang dari database).

---

## 🔄 STATUS TOGGLE

### **Toggle Status via Update**
Untuk mengubah status Aktif/Nonaktif, gunakan endpoint Update:

```http
PATCH /assessment-guru/:id
Content-Type: application/json
Authorization: Bearer [TOKEN]

{
  "is_active": false
}
```

**Response:**
```json
{
  "message": "Data guru berhasil diperbarui",
  "data": {
    "id_guru_assessment": 1,
    "is_active": false,
    ...
  }
}
```

**Business Rule:**
- Guru dengan `is_active: false` **TIDAK BISA LOGIN**
- Error saat login: `"Akun guru tidak aktif"`

---

## 🔒 RESET PASSWORD

### **Reset Password Guru (via Credentials Sekolah)**
Reset password guru dengan verifikasi email + password Operator Sekolah.

```http
POST /assessment-guru/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "id_sekolah": 1,
  "nama_guru": "Budi Santoso",
  "email_sekolah": "operator@sekolah1.com",
  "password_sekolah": "operator123",
  "password_baru": "newguru123"
}
```

**Field Requirements:**
- `id_sekolah` - **REQUIRED** (number)
- `nama_guru` - **REQUIRED** (string, case-insensitive)
- `email_sekolah` - **REQUIRED** (email Operator Sekolah di tabel `sekolah.email_login`)
- `password_sekolah` - **REQUIRED** (password Operator Sekolah di tabel `sekolah.password_login`)
- `password_baru` - **REQUIRED** (string, min 4 chars)

**Response Success (200):**
```json
{
  "message": "Password guru berhasil diperbarui",
  "guru": {
    "id_guru_assessment": 1,
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "email_guru": "budi@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "199001012020011001",
    "is_active": true,
    "last_login_at": "2026-06-09T10:30:00.000Z",
    "created_at": "2026-06-01T08:00:00.000Z",
    "updated_at": "2026-06-09T11:30:00.000Z"
  }
}
```

**Response Error - Email Sekolah Salah (401):**
```json
{
  "statusCode": 401,
  "message": "Email sekolah tidak sesuai",
  "error": "Unauthorized"
}
```

**Response Error - Password Sekolah Salah (401):**
```json
{
  "statusCode": 401,
  "message": "Password sekolah salah",
  "error": "Unauthorized"
}
```

**Response Error - Guru Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "Guru tidak ditemukan di sekolah ini",
  "error": "Not Found"
}
```

---

## 🧪 Testing dengan cURL

### **Login Guru**
```bash
curl -X POST http://localhost:3000/auth/login-guru \
  -H "Content-Type: application/json" \
  -d '{
    "id_sekolah": 1,
    "nama_guru": "Budi Santoso",
    "password": "guru123"
  }'
```

### **Create Guru**
```bash
curl -X POST http://localhost:3000/assessment-guru/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "id_sekolah": 1,
    "nama_guru": "Test Guru",
    "email_guru": "test@sekolah.com",
    "no_telepon": "08123456789",
    "mata_pelajaran": "Matematika",
    "nip": "123456789",
    "password": "test123"
  }'
```

### **Get All Guru**
```bash
curl -X GET http://localhost:3000/assessment-guru/sekolah/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Update Guru**
```bash
curl -X PATCH http://localhost:3000/assessment-guru/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "mata_pelajaran": "Matematika & IPA",
    "email_guru": "updated@sekolah.com"
  }'
```

### **Delete Guru**
```bash
curl -X DELETE http://localhost:3000/assessment-guru/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request berhasil (GET, PATCH, DELETE) |
| 201 | Created | Guru berhasil dibuat (POST register) |
| 400 | Bad Request | Validasi gagal (field required, format salah) |
| 401 | Unauthorized | Token invalid/expired, password salah, akun nonaktif |
| 404 | Not Found | Guru/Sekolah tidak ditemukan |
| 409 | Conflict | Nama guru duplikat di sekolah yang sama |
| 500 | Internal Server Error | Server error (cek backend logs) |

---

## 🔐 JWT Token Payload (Guru Login)

Setelah login sukses via `/auth/login-guru`, backend akan mengirim JWT token dengan payload:

```json
{
  "id_role": 8,
  "role": "Guru Assessment",
  "nama": "Budi Santoso",
  "id_sekolah": 1,
  "id_guru_assessment": 1,
  "iat": 1749456000,
  "exp": 1752048000
}
```

**Field Explanation:**
- `id_role: 8` - Role ID untuk Guru Assessment
- `role: "Guru Assessment"` - Nama role
- `nama` - Nama lengkap guru
- `id_sekolah` - ID sekolah guru (untuk filter data)
- `id_guru_assessment` - ID unik guru di tabel assessment_guru
- `iat` - Token issued at (timestamp)
- `exp` - Token expiration (timestamp, default 30 hari)

---

## 🎯 Frontend Integration

### **guru.config.jsx - API Mapping**
```javascript
api: {
    list: ({ user }) => `/assessment-guru/sekolah/${user?.id_sekolah}`,
    detail: (id) => `/assessment-guru/${id}`,
    create: "/assessment-guru/register",
    update: (id) => `/assessment-guru/${id}`,
    delete: (id) => `/assessment-guru/${id}`,
}
```

### **Login Guru - AuthService.js**
```javascript
const loginGuru = async (id_sekolah, nama_guru, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login-guru`, {
    id_sekolah,
    nama_guru,
    password
  });
  
  // Save token to localStorage
  localStorage.setItem('token', response.data.token);
  
  return response.data;
};
```

---

## 📝 Notes & Best Practices

1. **Always** include `Authorization: Bearer [TOKEN]` header (kecuali login)
2. **Password** disimpan plain text (belum hash) - OK untuk development, **WAJIB hash untuk production**
3. **Nama guru** case-insensitive saat login & validasi duplikat
4. **Password update** opsional - kosongkan jika tidak ingin diubah
5. **Delete** adalah hard delete - data hilang permanen
6. **Status toggle** via endpoint Update dengan `{ is_active: true/false }`
7. **JWT expiration** default 30 hari - bisa dikonfigurasi di backend

---

**Last Updated:** 9 Juni 2026  
**API Version:** 1.0.0  
**Backend:** NestJS 10.x  
**Database:** PostgreSQL  
