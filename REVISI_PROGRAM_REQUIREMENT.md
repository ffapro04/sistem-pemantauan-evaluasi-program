# 🔄 Revisi Sistem Monitoring Program - Requirements Document

## 📋 Executive Summary

**Tujuan**: Redesign sistem monitoring program untuk mendukung 2 jenis program (Project & Reguler) dengan workflow approval multi-stage dan collaboration system yang lebih baik.

**Scope Perubahan**:
1. ✅ Program dibedakan: **Project** vs **Reguler**
2. ✅ Workflow baru: Upload Admin → Fase Terbuka → Kegiatan Bertahap → Comment & Approval
3. ✅ Role interaction: HO (ACC Final), AO (Comment/Monitor), Vendor (Upload), Guru (View + Rating)
4. ✅ Chat system tetap ada + Comment system per kegiatan
5. ✅ Sequential unlock dengan validation ketat

---

## 🎯 1. JENIS PROGRAM BARU

### **1.1 Program Project**
**Karakteristik**:
- Program berbasis proyek dengan deliverable jelas
- Ada vendor/narasumber eksternal
- Monitoring ketat per fase dan kegiatan
- Budget tracking per termin


**Database Changes**:
```sql
ALTER TABLE t_program ADD COLUMN jenis_program VARCHAR(20) DEFAULT 'PROJECT';
-- Values: 'PROJECT' or 'REGULER'
```

**Example**: Program Pelatihan Guru oleh Vendor X, Program Pembangunan Lab IPA

---

### **1.2 Program Reguler**
**Karakteristik**:
- Program rutin internal sekolah
- Tidak ada vendor eksternal (atau optional)
- Monitoring lebih sederhana
- Bisa recurring (tahunan)

**Database Changes**: Same field `jenis_program = 'REGULER'`

**Example**: Program Ekstrakurikuler Rutin, Program Literasi Bulanan

---

## 🔄 2. WORKFLOW BARU - SEQUENTIAL UNLOCK SYSTEM

### **2.1 Konsep Alur Kerja**

**Struktur Hierarki**:
```
Program
  └── Fase 1
        ├── Upload Admin (Termin Luar) → Syarat Pembuka Fase
        │     ├── Persyaratan 1 (upload)
        │     ├── Persyaratan 2 (upload)
        │     └── ... (beberapa upload)
        │
        └── Kegiatan Dalam Fase (Unlocked setelah Admin Approved)
              ├── Kegiatan 1
              │     ├── Upload Bukti Kegiatan
              │     ├── AO Comment
              │     ├── HO Review & ACC
              │     └── Guru Rating (setelah ACC)
              │
              ├── Kegiatan 2 (Unlocked setelah Kegiatan 1 selesai)
              │     └── ... (same flow)
              │
              └── Kegiatan N
  
  └── Fase 2 (Unlocked setelah Fase 1 ALL kegiatan selesai)
        └── ... (repeat)
```



### **2.2 Step-by-Step Flow Detail**

#### **STEP 1: Upload Administratif (Termin Luar)**
**Tujuan**: Upload dokumen pembuka fase (MOU, proposal, RAB, dll)

**Actor**: Vendor (Role 6) atau HO (Role 3) tergantung jenis program

**Process**:
1. Vendor/HO upload beberapa dokumen administratif
2. Status dokumen: `WAITING_UPLOAD` → `WAITING_HO`
3. **Catatan**: Bebaskan beberapa upload (bisa upload partial dulu)
4. Setelah ALL dokumen termin luar uploaded → HO review

**Validation**:
- Minimal 1 dokumen harus terupload
- Format file valid (PDF, DOC, ZIP, image)
- Size max per file: 10MB

**Status Change**:
- `WAITING_UPLOAD` (initial)
- `WAITING_HO` (setelah vendor upload)
- `APPROVED` (HO ACC) → **Fase Terbuka**
- `REJECTED` (HO tolak) → Upload ulang

---

#### **STEP 2: HO Approve Termin Luar**
**Actor**: HO (Role 3)

**Process**:
1. HO review semua dokumen administratif
2. Preview file satu per satu
3. ACC atau Reject dengan alasan
4. Jika ALL dokumen APPROVED → **Fase & Kegiatan 1 Unlocked**

**Business Rule**:
- Semua persyaratan termin luar HARUS APPROVED
- Jika 1 saja REJECTED, fase tetap LOCKED



---

#### **STEP 3: Kegiatan 1 Terbuka - Upload Bukti Kegiatan**
**Actor**: Vendor (Role 6) atau AO (Role 4) yang eksekusi kegiatan

**Process**:
1. Setelah termin luar APPROVED, **Kegiatan 1** unlocked
2. Vendor/AO upload bukti kegiatan (foto, video, dokumen, laporan)
3. **Catatan**: Bebaskan beberapa upload (misal: 3-5 file dokumentasi)
4. Status bukti: `WAITING_UPLOAD` → `WAITING_AO_COMMENT`

**Upload Fields**:
- Nama bukti kegiatan
- Deskripsi singkat
- File upload (multiple files)
- Tanggal pelaksanaan kegiatan

**Validation**:
- Minimal 1 bukti harus terupload
- Tanggal pelaksanaan tidak boleh > hari ini

---

#### **STEP 4: AO Comment & Review**
**Actor**: AO (Role 4)

**Process**:
1. AO assigned ke program review bukti kegiatan
2. AO bisa:
   - Lihat semua file yang diupload
   - Beri **comment/catatan** terkait kegiatan
   - Comment dijadikan referensi untuk HO
3. Status: `WAITING_AO_COMMENT` → `WAITING_HO_APPROVAL`

**Comment System** (NEW FEATURE):
- AO bisa comment berkali-kali
- Comment tersimpan dengan timestamp
- Comment bisa mention issue/perbaikan yang perlu
- HO bisa lihat history comment AO

**Database New Table**:
```sql
CREATE TABLE t_kegiatan_comment (
  id_comment SERIAL PRIMARY KEY,
  id_kegiatan INTEGER REFERENCES t_kegiatans(id_kegiatans),
  id_persyaratan INTEGER REFERENCES t_persyaratan_kegiatan(id_persyaratan),
  id_user INTEGER NOT NULL,
  nama_user VARCHAR(150),
  role_user VARCHAR(50),
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(20) DEFAULT 'AO_REVIEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Comment Types**:
- `AO_REVIEW` - AO review kegiatan
- `HO_APPROVAL` - HO comment saat approve/reject
- `GURU_RATING` - Guru beri feedback



---

#### **STEP 5: HO Review Comment AO & ACC/Reject**
**Actor**: HO (Role 3)

**Process**:
1. HO lihat bukti kegiatan yang diupload
2. HO **BACA comment dari AO** sebagai referensi
3. HO putuskan:
   - **ACC** → Kegiatan selesai, unlock kegiatan berikutnya
   - **REJECT** → Perlu upload ulang bukti + perbaikan

**Decision Factors**:
- Kualitas bukti kegiatan
- Comment AO (apakah ada issue?)
- Kesesuaian dengan rencana program

**Status Change**:
- `WAITING_HO_APPROVAL` → `APPROVED` (kegiatan selesai)
- `WAITING_HO_APPROVAL` → `REJECTED` (upload ulang)

**After ACC**:
- Kegiatan marked as COMPLETED
- **Kegiatan 2 Unlocked** (jika ada)
- Notifikasi ke Guru untuk beri rating

---

#### **STEP 6: Guru Beri Rating/Comment**
**Actor**: Guru (Role 8) dari sekolah yang menjalankan program

**Timing**: Setelah kegiatan **APPROVED by HO**

**Process**:
1. Guru notifikasi ada kegiatan selesai
2. Guru bisa:
   - Lihat dokumentasi kegiatan
   - Beri **rating** (1-5 stars atau score 1-100)
   - Beri **comment/feedback** tentang kegiatan
3. Rating & comment tersimpan per kegiatan

**Database New Fields**:
```sql
ALTER TABLE t_kegiatans 
ADD COLUMN guru_rating INTEGER DEFAULT NULL,
ADD COLUMN guru_comment TEXT DEFAULT NULL,
ADD COLUMN guru_rated_by INTEGER DEFAULT NULL,
ADD COLUMN guru_rated_at TIMESTAMP DEFAULT NULL;
```

**Validation**:
- Rating wajib (1-5 atau 1-100)
- Comment optional tapi disarankan
- Guru hanya bisa rating 1x per kegiatan
- Rating bisa diedit dalam 24 jam setelah submit

**Business Rule**:
- Rating TIDAK mempengaruhi unlock kegiatan berikutnya
- Rating untuk evaluasi & improvement program
- HO & AO bisa lihat rating guru



---

#### **STEP 7: Kegiatan Berikutnya (Sequential)**
**Rule**: Kegiatan dijalankan **satu per satu, bertahap**

**Process**:
1. Kegiatan 1 selesai (APPROVED) → Kegiatan 2 unlocked
2. Kegiatan 2 upload bukti → AO comment → HO ACC → Guru rating
3. Kegiatan 2 selesai → Kegiatan 3 unlocked
4. Repeat sampai semua kegiatan di fase selesai

**Unlock Logic**:
```javascript
function isKegiatanUnlocked(kegiatanIndex, kegiatanList) {
  if (kegiatanIndex === 0) {
    // Kegiatan pertama unlocked setelah termin luar APPROVED
    return isFaseOpened();
  }
  
  // Kegiatan N unlocked jika kegiatan N-1 APPROVED
  const prevKegiatan = kegiatanList[kegiatanIndex - 1];
  return prevKegiatan.status === 'APPROVED' && 
         prevKegiatan.all_persyaratan_approved === true;
}
```

---

#### **STEP 8: Fase Berikutnya (After All Kegiatan Selesai)**
**Rule**: Fase 2 unlock setelah **ALL kegiatan di Fase 1 APPROVED**

**Process**:
1. Check semua kegiatan di Fase 1: ALL = APPROVED?
2. Jika YES → **Upload Administratif Fase 2** unlocked
3. Repeat flow dari STEP 1 untuk Fase 2

**Validation**:
```javascript
function isFaseCompleted(fase) {
  // 1. Termin luar semua APPROVED
  const terminLuarApproved = fase.termin
    .filter(t => t.id_fase && !t.id_kegiatans)
    .every(t => t.persyaratan.every(p => p.status === 'APPROVED'));
  
  // 2. Semua kegiatan APPROVED
  const allKegiatanApproved = fase.kegiatans
    .every(k => k.status === 'APPROVED' && 
                k.persyaratan.every(p => p.status === 'APPROVED'));
  
  return terminLuarApproved && allKegiatanApproved;
}

function isNextFaseUnlocked(faseIndex, faseList) {
  if (faseIndex === 0) return true; // Fase 1 default unlocked
  
  const prevFase = faseList[faseIndex - 1];
  return isFaseCompleted(prevFase);
}
```



---

## 👥 3. ROLE & PERMISSIONS (UPDATED)

### **3.1 HO (Head Office) - Role 3**
**Responsibilities**:
- Create & manage program (Project/Reguler)
- **Approve/Reject** termin luar (upload administratif)
- **Approve/Reject** bukti kegiatan (final decision)
- Baca comment dari AO sebagai referensi
- Lihat rating dari Guru
- Chat dengan semua stakeholder

**Permissions**:
- ✅ CRUD Program
- ✅ Approve termin luar → Unlock fase
- ✅ Approve bukti kegiatan → Unlock kegiatan next
- ✅ Reject dengan alasan → Perlu upload ulang
- ✅ View AO comments
- ✅ View Guru ratings
- ✅ Chat global & contextual
- ❌ NO direct upload (kecuali program reguler internal)

---

### **3.2 AO (Area Officer) - Role 4**
**Responsibilities**:
- **Monitor** progress kegiatan di lapangan
- **Upload** bukti kegiatan (jika AO eksekutor)
- **Comment** tentang kualitas kegiatan
- Comment dijadikan **referensi HO** untuk ACC/Reject
- Chat dengan HO & Vendor

**Permissions**:
- ✅ View assigned programs
- ✅ Upload bukti kegiatan
- ✅ Add comment per kegiatan (multiple comments)
- ✅ View progress monitoring
- ✅ Chat dengan HO & Vendor
- ❌ NO approval authority
- ❌ NO reject authority

**NEW: Comment Feature**
- AO bisa comment kapan saja selama kegiatan WAITING_HO_APPROVAL
- Comment format: Text + optional attachment
- Comment visible untuk HO & Vendor
- Comment history tersimpan



---

### **3.3 Vendor/Narasumber - Role 6**
**Responsibilities**:
- **Upload** dokumen administratif (termin luar)
- **Upload** bukti kegiatan (dokumentasi pelaksanaan)
- **Bertanggung jawab** atas deliverable program
- Chat dengan HO & AO
- Lihat comment dari AO

**Permissions**:
- ✅ Upload termin luar (administratif)
- ✅ Upload bukti kegiatan (dokumentasi)
- ✅ Multiple upload per persyaratan
- ✅ View comment dari AO
- ✅ Chat dengan HO & AO
- ❌ NO approval authority
- ❌ NO comment authority (hanya chat)

**Upload Rules**:
- Vendor bisa upload partial (beberapa file dulu)
- Bisa upload ulang jika REJECTED
- Semua file harus approved sebelum lanjut

---

### **3.4 Guru - Role 8**
**Responsibilities**:
- **View** progress program di sekolahnya
- **Beri rating** setelah kegiatan selesai (APPROVED by HO)
- **Beri comment/feedback** tentang kegiatan
- Rating & comment untuk evaluasi program

**Permissions**:
- ✅ View program sekolahnya (GET /program/sekolah/:id_sekolah)
- ✅ View progress monitoring (read-only)
- ✅ View dokumentasi kegiatan yang sudah APPROVED
- ✅ Add rating (1-5 stars atau 1-100) per kegiatan
- ✅ Add comment/feedback per kegiatan
- ✅ Edit rating dalam 24 jam
- ❌ NO upload authority
- ❌ NO approval authority
- ❌ NO chat access (hanya rating & comment)

**NEW: Rating Feature**
- Rating mandatory: 1-5 stars (UI) atau 1-100 (backend)
- Comment optional: Textarea max 500 chars
- Rating visible untuk HO, AO, Vendor
- Rating aggregated per program (average)



---

### **3.5 Operator Sekolah - Role 9**
**Responsibilities**:
- Manage data guru (CRUD)
- View program sekolah (same as Guru)
- Koordinasi dengan guru terkait program

**Permissions**:
- ✅ CRUD data guru
- ✅ View program sekolah (read-only)
- ✅ View progress monitoring
- ❌ NO rating authority (guru yang rating)
- ❌ NO upload/approval authority

---

## 💬 4. COMMUNICATION SYSTEM (Chat + Comment)

### **4.1 Chat System (Existing - Keep)**
**Purpose**: Real-time discussion untuk koordinasi

**Features**:
- Contextual chat per program/fase/termin/kegiatan/persyaratan
- Multi-user: HO, AO, Vendor bisa chat
- Chat history tersimpan
- System message untuk approval events

**Implementation**: Tetap pakai `t_termin_chat` entity

**Access**:
- HO: Chat global + per context
- AO: Chat dengan HO & Vendor per program
- Vendor: Chat dengan HO & AO per program
- Guru: **NO chat access** (hanya rating & comment)

---

### **4.2 Comment System (NEW)**
**Purpose**: Structured feedback per kegiatan

**Features**:
- AO comment untuk review kegiatan (before HO approval)
- HO comment saat approve/reject
- Guru comment/feedback setelah kegiatan selesai
- Comment history per kegiatan
- Comment type: AO_REVIEW, HO_APPROVAL, GURU_RATING

**Database**: New table `t_kegiatan_comment`

**Access**:
- AO: Add comment saat review kegiatan
- HO: Read AO comment, add comment saat approve/reject
- Guru: Add comment/feedback setelah kegiatan APPROVED
- Vendor: Read comment (untuk improvement)



**Difference Chat vs Comment**:
| Aspect | Chat | Comment |
|--------|------|---------|
| Purpose | Real-time coordination | Structured feedback |
| Format | Informal, conversational | Formal, review-based |
| Participants | HO, AO, Vendor | HO, AO, Guru |
| Context | Program-wide, any context | Per kegiatan only |
| Timing | Anytime | Specific workflow stage |
| Visibility | All participants | All roles (read-only for some) |

---

## 🔐 5. ACCESS CONTROL & VISIBILITY

### **5.1 Chat Access Matrix**

| Role | Can Send Chat | Can Read Chat | Context Access |
|------|---------------|---------------|----------------|
| HO (3) | ✅ Yes | ✅ All chats | Global + Contextual |
| AO (4) | ✅ Yes | ✅ Assigned programs | Contextual (assigned) |
| Vendor (6) | ✅ Yes | ✅ Assigned programs | Contextual (assigned) |
| Guru (8) | ❌ No | ❌ No | - |
| Operator (9) | ❌ No | ❌ No | - |

**Business Rule**:
- Chat terbatas untuk **eksekutor program** (HO, AO, Vendor)
- Guru tidak perlu akses chat (fokus ke rating & comment)
- Chat per context: Hanya participants yang terlibat di context tsb

---

### **5.2 Comment Access Matrix**

| Role | Can Add Comment | Can Read Comment | Comment Type |
|------|-----------------|------------------|--------------|
| HO (3) | ✅ Yes | ✅ All comments | HO_APPROVAL |
| AO (4) | ✅ Yes | ✅ All comments | AO_REVIEW |
| Vendor (6) | ❌ No | ✅ Read only | - |
| Guru (8) | ✅ Yes | ✅ Read only | GURU_RATING |
| Operator (9) | ❌ No | ✅ Read only | - |

**Business Rule**:
- AO comment sebelum HO approval (review stage)
- HO comment saat approve/reject (decision stage)
- Guru comment setelah APPROVED (feedback stage)
- Vendor read-only (untuk perbaikan)



---

### **5.3 Connection Matrix (Who Can Connect)**

**Chat Connections**:
```
HO (3) ←→ AO (4) ←→ Vendor (6)
   ↓                    ↓
   └────────────────────┘
       (All connected via chat)
```

**Comment Flow**:
```
Vendor Upload Bukti
       ↓
AO Review + Comment (AO_REVIEW)
       ↓
HO Read AO Comment → Approve/Reject + Comment (HO_APPROVAL)
       ↓
Guru View Kegiatan → Rating + Comment (GURU_RATING)
```

**Business Rule**:
- Semua stakeholder yang terlibat dalam program **bisa saling terhubung** via chat
- Comment flow linear (sequential): AO → HO → Guru
- Guru hanya bisa comment SETELAH kegiatan APPROVED

---

## 📊 6. DATABASE SCHEMA CHANGES

### **6.1 New Fields in Existing Tables**

**t_program**:
```sql
ALTER TABLE t_program 
ADD COLUMN jenis_program VARCHAR(20) DEFAULT 'PROJECT' CHECK (jenis_program IN ('PROJECT', 'REGULER'));
```

**t_kegiatans**:
```sql
ALTER TABLE t_kegiatans 
ADD COLUMN status VARCHAR(50) DEFAULT 'LOCKED',
ADD COLUMN guru_rating INTEGER DEFAULT NULL CHECK (guru_rating >= 1 AND guru_rating <= 5),
ADD COLUMN guru_comment TEXT DEFAULT NULL,
ADD COLUMN guru_rated_by INTEGER DEFAULT NULL REFERENCES users(id_user),
ADD COLUMN guru_rated_at TIMESTAMP DEFAULT NULL,
ADD COLUMN completed_at TIMESTAMP DEFAULT NULL;

-- Status values: 'LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'WAITING_AO_COMMENT', 'WAITING_HO_APPROVAL', 'APPROVED', 'REJECTED'
```

**t_persyaratan_kegiatan**:
```sql
ALTER TABLE t_persyaratan_kegiatan
ADD COLUMN ao_reviewed_by INTEGER DEFAULT NULL REFERENCES users(id_user),
ADD COLUMN ao_reviewed_at TIMESTAMP DEFAULT NULL,
ADD COLUMN approved_by INTEGER DEFAULT NULL REFERENCES users(id_user),
ADD COLUMN approved_at TIMESTAMP DEFAULT NULL,
ADD COLUMN rejected_by INTEGER DEFAULT NULL REFERENCES users(id_user),
ADD COLUMN rejected_at TIMESTAMP DEFAULT NULL,
ADD COLUMN rejected_reason TEXT DEFAULT NULL;
```



---

### **6.2 New Table: t_kegiatan_comment**

```sql
CREATE TABLE t_kegiatan_comment (
  id_comment SERIAL PRIMARY KEY,
  
  -- Context
  id_kegiatan INTEGER NOT NULL REFERENCES t_kegiatans(id_kegiatans) ON DELETE CASCADE,
  id_persyaratan INTEGER DEFAULT NULL REFERENCES t_persyaratan_kegiatan(id_persyaratan) ON DELETE CASCADE,
  
  -- User info
  id_user INTEGER NOT NULL,
  nama_user VARCHAR(150) NOT NULL,
  role_user VARCHAR(50) NOT NULL,
  
  -- Comment content
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(20) NOT NULL DEFAULT 'AO_REVIEW' CHECK (comment_type IN ('AO_REVIEW', 'HO_APPROVAL', 'GURU_RATING')),
  
  -- Optional attachment
  attachment_file VARCHAR(255) DEFAULT NULL,
  attachment_original_name VARCHAR(255) DEFAULT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL
);

-- Indexes
CREATE INDEX idx_kegiatan_comment_kegiatan ON t_kegiatan_comment(id_kegiatan);
CREATE INDEX idx_kegiatan_comment_user ON t_kegiatan_comment(id_user);
CREATE INDEX idx_kegiatan_comment_type ON t_kegiatan_comment(comment_type);
```

**Comment Types**:
- `AO_REVIEW`: AO review kegiatan sebelum HO approval
- `HO_APPROVAL`: HO comment saat approve/reject
- `GURU_RATING`: Guru feedback setelah kegiatan selesai

---

### **6.3 New Table: t_guru_rating (Alternative)**

**Option**: Bisa juga buat table terpisah untuk rating jika perlu detail lebih

```sql
CREATE TABLE t_guru_rating (
  id_rating SERIAL PRIMARY KEY,
  
  -- Context
  id_program INTEGER NOT NULL REFERENCES t_program(id_program) ON DELETE CASCADE,
  id_fase INTEGER DEFAULT NULL REFERENCES t_fase(id_fase) ON DELETE CASCADE,
  id_kegiatan INTEGER NOT NULL REFERENCES t_kegiatans(id_kegiatans) ON DELETE CASCADE,
  
  -- Rating
  rating_score INTEGER NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
  rating_comment TEXT DEFAULT NULL,
  
  -- Guru info
  id_guru INTEGER NOT NULL,
  nama_guru VARCHAR(150) NOT NULL,
  id_sekolah INTEGER NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL,
  
  -- Ensure 1 guru only rate 1x per kegiatan
  UNIQUE(id_kegiatan, id_guru)
);

CREATE INDEX idx_guru_rating_kegiatan ON t_guru_rating(id_kegiatan);
CREATE INDEX idx_guru_rating_guru ON t_guru_rating(id_guru);
CREATE INDEX idx_guru_rating_program ON t_guru_rating(id_program);
```



---

## 🔧 7. API ENDPOINTS (NEW/UPDATED)

### **7.1 Program Endpoints (Updated)**

**Create Program dengan Jenis**:
```http
POST /program
Content-Type: multipart/form-data

{
  "nama_program": "Program X",
  "kategori": "AKADEMIK",
  "jenis_program": "PROJECT",  // NEW: PROJECT or REGULER
  "id_sekolah": 1,
  "id_vendor": [1, 2],
  ...
}
```

**Filter by Jenis**:
```http
GET /program?kategori=AKADEMIK&jenis_program=PROJECT
GET /program?jenis_program=REGULER
```

---

### **7.2 Comment Endpoints (NEW)**

**Add AO Comment**:
```http
POST /program/kegiatan/:id_kegiatan/comment
Authorization: Bearer [AO_TOKEN]
Content-Type: application/json

{
  "comment_text": "Kegiatan berjalan baik, namun perlu perbaikan di dokumentasi video.",
  "comment_type": "AO_REVIEW",
  "id_persyaratan": 123  // optional, jika comment untuk persyaratan tertentu
}
```

**Add HO Comment (saat approve/reject)**:
```http
POST /program/kegiatan/:id_kegiatan/comment
Authorization: Bearer [HO_TOKEN]
Content-Type: application/json

{
  "comment_text": "Kegiatan di-ACC, bukti sudah lengkap.",
  "comment_type": "HO_APPROVAL"
}
```

**Get Comments by Kegiatan**:
```http
GET /program/kegiatan/:id_kegiatan/comments
Authorization: Bearer [TOKEN]

Response:
[
  {
    "id_comment": 1,
    "comment_text": "...",
    "comment_type": "AO_REVIEW",
    "nama_user": "AO Budi",
    "role_user": "Area Officer",
    "created_at": "2026-06-09T10:00:00Z"
  },
  ...
]
```

