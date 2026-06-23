# ✅ Testing Checklist - Manajemen Data Guru

## 🎯 Persiapan Testing

### **1. Start Backend**
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run start:dev
```

**Expected Output:**
```
Nest application successfully started
Listening on port 3000
```

### **2. Start Frontend**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run dev
```

**Expected Output:**
```
VITE ready in xxx ms
Local: http://localhost:5173/
```

### **3. Cek Database (Opsional)**
Jika backend tidak auto-sync, jalankan migration:
```bash
cd c:\sistem-monitoring-evaluasi\backend\src\migrations
psql -U postgres -d sistem_monitoring_evaluasi_program -f add-guru-fields.sql
```

---

## ✅ Testing Scenario

### **Scenario 1: Login Operator Sekolah**

**Steps:**
1. Buka browser → `http://localhost:5173/login`
2. Pilih dropdown role → **"Operator Sekolah"**
3. Form berubah menjadi Email + Password
4. Input:
   - Email: `operator@sekolah1.com` (sesuai data di database)
   - Password: `[password_operator]`
5. Klik **"Masuk"**

**Expected Result:**
- ✅ Redirect ke `/sekolah/dashboard`
- ✅ Sidebar muncul dengan menu:
  - Dashboard
  - Assessment
  - Program Sekolah
  - Berita Acara
  - Section "Kelola Data" → **Data Guru**

**If Failed:**
- Cek console browser (F12)
- Cek apakah JWT di localStorage ada `id_sekolah` dan `id_role: 9`

---

### **Scenario 2: Akses Halaman Data Guru**

**Steps:**
1. Setelah login sebagai Operator Sekolah
2. Klik menu **"Data Guru"** di sidebar (di section "Kelola Data")

**Expected Result:**
- ✅ Redirect ke `/sekolah/guru`
- ✅ Halaman menampilkan:
  - Title: **"Manajemen Data Guru"**
  - Button: **"Refresh"** dan **"Tambah Guru"**
  - Tabel dengan kolom: No, Nama Guru, Info Tambahan, Status, Aksi
  - Filter: **Status (All/Aktif/Nonaktif)**
  - Summary cards: **Guru Aktif** dan **Guru Nonaktif**

**If Empty Table:**
- ✅ Tampil pesan: "Belum ada guru terdaftar."
- ✅ Button: **"Tambah Guru Pertama"**

---

### **Scenario 3: Tambah Guru Baru (Create)**

**Steps:**
1. Di halaman Data Guru, klik **"Tambah Guru"**
2. Redirect ke `/sekolah/guru/create`
3. Form muncul dengan field:
   - **Nama Lengkap Guru** (required)
   - **Email Guru** (optional)
   - **No. Telepon** (optional)
   - **NIP** (optional)
   - **Mata Pelajaran** (optional)
   - **Password** (required, min 4 char)
4. Isi form:
   ```
   Nama: Budi Santoso
   Email: budi@sekolah.com
   Telepon: 08123456789
   NIP: 199001012020011001
   Mata Pelajaran: Matematika
   Password: guru123
   ```
5. Klik **"Simpan Guru"**

**Expected Result:**
- ✅ Loading state muncul (button disabled)
- ✅ Alert success: **"Data Guru berhasil ditambahkan."**
- ✅ **Otomatis redirect** ke `/sekolah/guru` (tabel) dalam 1 detik
- ✅ Guru baru muncul di tabel
- ✅ Data lengkap terlihat:
  - Nama: Budi Santoso
  - Email: budi@sekolah.com
  - Telepon: 08123456789
  - Mata Pelajaran: Matematika (badge cyan)
  - NIP: 199001012020011001
  - Status: **Aktif** (hijau)
  - Login Terakhir: (timestamp saat dibuat)

**If Failed:**
- Cek console browser untuk error
- Cek Network tab → Request payload
- Cek backend terminal untuk error log
- Cek database: `SELECT * FROM assessment_guru;`

---

### **Scenario 4: Edit Data Guru**

**Steps:**
1. Di tabel Data Guru, pilih guru yang baru dibuat
2. Klik icon **Edit** (pensil)
3. Redirect ke `/sekolah/guru/edit/:id`
4. Form pre-filled dengan data guru
5. Ubah data:
   ```
   Mata Pelajaran: Matematika & IPA
   Email: budi.santoso@sekolah.com
   Password: [kosongkan - tidak diubah]
   ```
6. Klik **"Update Guru"**

**Expected Result:**
- ✅ Alert success: **"Data Guru berhasil diperbarui."**
- ✅ **Otomatis redirect** ke `/sekolah/guru` (tabel)
- ✅ Data terupdate di tabel:
  - Email: budi.santoso@sekolah.com
  - Mata Pelajaran: Matematika & IPA
- ✅ Password **tidak berubah** (karena dikosongkan)

**Test Password Not Changed:**
1. Logout
2. Login sebagai guru dengan password lama (`guru123`)
3. Harus berhasil login

---

### **Scenario 5: View Detail Guru**

**Steps:**
1. Di tabel Data Guru, klik nama guru atau icon **View**
2. Redirect ke `/sekolah/guru/detail/:id`

**Expected Result:**
- ✅ Halaman detail muncul dengan sections:
  - **Identitas Guru**: Nama, Email, Telepon, NIP, Mata Pelajaran, Status
  - **Informasi Akun**: Login Terakhir, Akun Dibuat
- ✅ Badges: Status (Aktif/Nonaktif), Mata Pelajaran
- ✅ Button **"Kembali"** dan **"Edit Data"**

---

### **Scenario 6: Toggle Status Guru (Aktif/Nonaktif)**

**Steps:**
1. Di tabel Data Guru, lihat kolom **Status**
2. Klik toggle switch di salah satu guru (Aktif → Nonaktif)
3. Konfirmasi popup muncul

**Expected Result:**
- ✅ Status berubah dari **Aktif** (hijau) → **Nonaktif** (merah)
- ✅ Toast notification: **"[Nama Guru] sekarang Nonaktif"**
- ✅ Di summary cards, count **Guru Nonaktif** bertambah

**Test Login Guru Nonaktif:**
1. Logout
2. Login sebagai guru yang di-nonaktifkan
3. Expected: **Error "Akun guru tidak aktif"**

---

### **Scenario 7: Delete Guru**

**Steps:**
1. Di tabel Data Guru, klik icon **Delete** (trash) di salah satu guru
2. SweetAlert popup muncul:
   ```
   Title: Hapus Data Guru?
   Text: Akun guru "[Nama]" akan dihapus permanen dari sistem.
          Guru tidak akan bisa login lagi.
   ```
3. Klik **"Ya, Hapus"**

**Expected Result:**
- ✅ Loading indicator muncul
- ✅ Alert success: **"Data Guru berhasil dihapus."**
- ✅ Guru hilang dari tabel
- ✅ Summary cards count update
- ✅ Data terhapus dari database

**Verify Database:**
```sql
SELECT * FROM assessment_guru WHERE id_guru_assessment = [id_yang_dihapus];
-- Expected: 0 rows
```

---

### **Scenario 8: Login Guru Assessment (Role 8)**

**Steps:**
1. Logout dari Operator Sekolah
2. Buka `/login`
3. Pilih dropdown role → **"Guru Assessment"**
4. Form berubah menjadi:
   - **ID Sekolah** (number)
   - **Nama Guru** (text)
   - **Password** (password)
5. Input:
   ```
   ID Sekolah: 1
   Nama Guru: Budi Santoso
   Password: guru123
   ```
6. Klik **"Masuk"**

**Expected Result:**
- ✅ Request ke `POST /auth/login-guru`
- ✅ JWT token diterima dengan:
  ```json
  {
    "id_role": 8,
    "role": "Guru Assessment",
    "nama": "Budi Santoso",
    "id_sekolah": 1,
    "id_guru_assessment": [id]
  }
  ```
- ✅ **Redirect ke `/sekolah/dashboard`**
- ✅ Sidebar muncul dengan menu:
  - Dashboard
  - Assessment
  - Program Sekolah
  - **Daftar Guru** (view only)
  - Berita Acara
- ✅ **TIDAK ADA menu "Data Guru"** (no CRUD)

---

### **Scenario 9: Akses Daftar Guru (Role 8 - View Only)**

**Steps:**
1. Login sebagai Guru (role 8)
2. Klik menu **"Daftar Guru"** di sidebar
3. Redirect ke `/sekolah/daftar-guru`

**Expected Result:**
- ✅ Tabel menampilkan **hanya guru aktif** (endpoint: `/assessment-guru/sekolah/:id/aktif`)
- ✅ Kolom: No, Nama Guru, Email, Status
- ✅ **TIDAK ADA kolom Aksi** (no Edit/Delete button)
- ✅ **TIDAK ADA button "Tambah Guru"**

---

### **Scenario 10: Filter & Search**

**Steps:**
1. Login sebagai Operator Sekolah
2. Buka halaman Data Guru
3. Test filter **Status**:
   - Pilih "Status: Aktif" → Only active guru shown
   - Pilih "Status: Nonaktif" → Only inactive guru shown
   - Pilih "Semua Status" → All guru shown
4. Test **Search**:
   - Ketik nama guru → Real-time filter
   - Ketik email → Filter by email
   - Ketik mata pelajaran → Filter by subject

**Expected Result:**
- ✅ Filter dan search bekerja real-time
- ✅ Counter di summary cards update sesuai filter
- ✅ Filter state tersimpan di localStorage

---

### **Scenario 11: Pagination**

**Steps:**
1. Tambah lebih dari 10 guru (via Postman atau form)
2. Refresh halaman Data Guru

**Expected Result:**
- ✅ Pagination muncul di bawah tabel
- ✅ Max 10 guru per halaman (sesuai `itemsPerPage: 10`)
- ✅ Button **Previous** dan **Next** berfungsi
- ✅ Page number tersimpan di localStorage

---

## 🐛 Common Issues & Solutions

### **Issue 1: "ID Sekolah tidak ditemukan di token Anda"**

**Penyebab:** JWT token tidak punya field `id_sekolah`

**Solusi:**
1. Logout dan login ulang
2. Cek JWT di localStorage (F12 → Application → Local Storage)
3. Decode token di [jwt.io](https://jwt.io)
4. Pastikan ada field: `id_sekolah: [number]`

---

### **Issue 2: Redirect tidak jalan setelah Create/Edit**

**Penyebab:** Config `routes.read` salah atau tidak sesuai dengan App.jsx

**Solusi:**
- Cek `guru.config.jsx`:
  ```javascript
  routes: {
      read: "/sekolah/guru",  // Harus sesuai dengan route di App.jsx
  }
  ```

---

### **Issue 3: Form field tidak muncul/kosong saat Create**

**Penyebab:** `user` context belum ready saat form di-init

**Solusi:** Sudah diperbaiki dengan:
```javascript
const [userReady, setUserReady] = useState(false);
useEffect(() => {
    if (userReady && isCreate) {
        setFormData(getInitialFormData(config, mode, user));
    }
}, [userReady, user]);
```

---

### **Issue 4: Guru tidak bisa login - "Nama guru atau password salah"**

**Penyebab:**
- Password salah
- Nama guru typo (case-insensitive tapi spasi harus sama)
- `is_active: false`

**Solusi:**
1. Cek data di database:
   ```sql
   SELECT * FROM assessment_guru WHERE nama_guru ILIKE '%[nama]%';
   ```
2. Pastikan `is_active = true`
3. Cek password_hash cocok

---

### **Issue 5: Backend error "column does not exist"**

**Penyebab:** Tabel `assessment_guru` belum punya kolom baru

**Solusi:**
1. Jika `synchronize: true` di `app.module.ts`, restart backend
2. Jika manual migration, jalankan:
   ```bash
   psql -U postgres -d sistem_monitoring_evaluasi_program -f src/migrations/add-guru-fields.sql
   ```

---

## 📊 Database Verification

### **Check Table Structure**
```sql
\d assessment_guru;
```

**Expected Columns:**
- `id_guru_assessment` (PK)
- `id_sekolah`
- `nama_guru`
- `email_guru` ✨
- `no_telepon` ✨
- `mata_pelajaran` ✨
- `nip` ✨
- `password_hash`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

### **Check Data**
```sql
SELECT 
    id_guru_assessment,
    nama_guru,
    email_guru,
    no_telepon,
    mata_pelajaran,
    nip,
    is_active,
    last_login_at
FROM assessment_guru
WHERE id_sekolah = 1
ORDER BY nama_guru;
```

---

## ✅ Final Checklist

- [ ] Backend build sukses (`npm run build`)
- [ ] Frontend build sukses (`npm run build`)
- [ ] Backend running di port 3000
- [ ] Frontend running di port 5173
- [ ] Database tabel `assessment_guru` punya 12 kolom
- [ ] Login Operator Sekolah berhasil
- [ ] Menu "Data Guru" muncul di sidebar role 9
- [ ] Form Create Guru lengkap (6 field)
- [ ] Create Guru berhasil → redirect ke tabel
- [ ] Data tersimpan dengan field lengkap
- [ ] Edit Guru berhasil → redirect ke tabel
- [ ] Delete Guru berhasil → data terhapus
- [ ] Login Guru (role 8) berhasil
- [ ] Menu "Daftar Guru" (view only) muncul di sidebar role 8
- [ ] Filter & Search berfungsi
- [ ] Pagination berfungsi (jika > 10 data)

---

**Status Testing:** ⏳ Ready to Test  
**Last Updated:** 9 Juni 2026  
**Tester:** [Your Name]
