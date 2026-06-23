# ✅ Pre-Testing Verification Checklist

## 📋 Sebelum Memulai Testing

Checklist ini memastikan semua komponen sistem sudah siap untuk testing manual.

---

## 🔧 1. ENVIRONMENT SETUP

### **Backend Environment**
- [ ] Node.js 18.x or higher installed
- [ ] PostgreSQL 14.x or higher running
- [ ] Database `sistem_monitoring_evaluasi_program` exists
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Environment variables configured (if using `.env`)

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\backend
node --version        # Should be v18.x or higher
npm list             # Should show all dependencies
```

---

### **Frontend Environment**
- [ ] Node.js 18.x or higher installed
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Vite configured properly

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
node --version        # Should be v18.x or higher
npm list             # Should show all dependencies
```

---

## 🗄️ 2. DATABASE VERIFICATION

### **Table Structure**
- [ ] Table `assessment_guru` exists
- [ ] Table has 12 columns (id, id_sekolah, nama_guru, email_guru, no_telepon, mata_pelajaran, nip, password_hash, is_active, last_login_at, created_at, updated_at)
- [ ] Table `sekolah` exists (for FK reference)

**Verify via psql:**
```sql
-- Connect to database
psql -U postgres -d sistem_monitoring_evaluasi_program

-- Check table exists
\dt assessment_guru

-- Check table structure
\d assessment_guru

-- Expected output:
--  id_guru_assessment | integer | PRIMARY KEY
--  id_sekolah         | integer | REFERENCES sekolah(id_sekolah)
--  nama_guru          | varchar(150)
--  email_guru         | varchar(255)
--  no_telepon         | varchar(20)
--  mata_pelajaran     | varchar(100)
--  nip                | varchar(50)
--  password_hash      | text
--  is_active          | boolean | default true
--  last_login_at      | timestamp
--  created_at         | timestamp
--  updated_at         | timestamp
```

**If columns missing, run migration:**
```bash
cd backend\src\migrations
psql -U postgres -d sistem_monitoring_evaluasi_program -f add-guru-fields.sql
```

---

### **Sample Data**
- [ ] At least 1 sekolah exists in `sekolah` table
- [ ] At least 1 operator sekolah account exists

**Verify:**
```sql
-- Check sekolah data
SELECT id_sekolah, nama_sekolah, email_login 
FROM sekolah 
LIMIT 3;

-- If empty, insert sample:
INSERT INTO sekolah (nama_sekolah, email_login, password_login)
VALUES ('Sekolah Test', 'operator@sekolah1.com', 'operator123');

-- Get id_sekolah for testing
SELECT id_sekolah FROM sekolah WHERE email_login = 'operator@sekolah1.com';
```

---

## 🏗️ 3. BUILD VERIFICATION

### **Backend Build**
- [ ] Backend builds without errors
- [ ] All TypeScript files compile successfully
- [ ] No missing module errors

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run build
```

**Expected Output:**
```
> backend@0.0.1 build
> nest build

[SUCCESS] Build completed
```

**If Failed:**
- Check for TypeScript errors
- Run `npm install` to ensure all dependencies installed
- Check `tsconfig.json` configuration

---

### **Frontend Build**
- [ ] Frontend builds without errors
- [ ] All React components compile successfully
- [ ] Warnings (if any) are only about chunk size

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run build
```

**Expected Output:**
```
> frontend@0.0.0 build
> vite build

✓ 3110 modules transformed.
✓ built in X.XXs

(!) Some chunks are larger than 500 kB ... [OK to ignore]
```

**If Failed:**
- Check for JSX/syntax errors
- Run `npm install` to ensure all dependencies installed
- Check import paths are correct

---

## 🔌 4. API ENDPOINTS VERIFICATION

### **Backend Controller Check**
- [ ] `AssessmentGuruController` has 6+ endpoints
- [ ] `AuthController` has `POST /auth/login-guru` endpoint

**Verify via grep:**
```bash
cd c:\sistem-monitoring-evaluasi\backend\src

# Check assessment-guru controller
type assessment-guru\assessment-guru.controller.ts | findstr "@Get @Post @Patch @Delete"

# Expected: @Get(), @Post('register'), @Patch(':id'), @Delete(':id')
```

---

### **Backend Service Check**
- [ ] `AssessmentGuruService` has `register()` method
- [ ] `AssessmentGuruService` has `login()` method
- [ ] `AssessmentGuruService` has `findBySekolah()` method
- [ ] `AssessmentGuruService` has `findAktifBySekolah()` method
- [ ] `AssessmentGuruService` has `update()` method
- [ ] `AssessmentGuruService` has `remove()` method

**Verify via grep:**
```bash
cd c:\sistem-monitoring-evaluasi\backend\src
type assessment-guru\assessment-guru.service.ts | findstr "async register async login async findBySekolah"
```

---

## 🎨 5. FRONTEND COMPONENTS VERIFICATION

### **Config File**
- [ ] `guru.config.jsx` exists in `frontend/src/config/masterCrud/`
- [ ] Config has 400+ lines
- [ ] Config exports `guruConfig` object

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend\src\config\masterCrud
dir guru.config.jsx
type guru.config.jsx | find "export const guruConfig"
```

---

### **Page Components**
- [ ] `DataGuru.jsx` exists in `frontend/src/page/sekolah/`
- [ ] `CreateGuru.jsx` exists
- [ ] `EditGuru.jsx` exists
- [ ] `DetailGuru.jsx` exists
- [ ] `DaftarGuru.jsx` exists

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend\src\page\sekolah
dir /b *.jsx | findstr Guru

# Expected output:
# CreateGuru.jsx
# DataGuru.jsx
# DaftarGuru.jsx
# DetailGuru.jsx
# EditGuru.jsx
```

---

### **Routing Check**
- [ ] `App.jsx` has routes for `/sekolah/guru`
- [ ] `App.jsx` has routes for `/sekolah/guru/create`
- [ ] `App.jsx` has routes for `/sekolah/guru/edit/:id`
- [ ] `App.jsx` has routes for `/sekolah/guru/detail/:id`
- [ ] `App.jsx` has routes for `/sekolah/daftar-guru`

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend\src
type App.jsx | findstr "/sekolah/guru"

# Expected:
# <Route path="guru" element={<DataGuru />} />
# <Route path="guru/create" element={<CreateGuru />} />
# <Route path="guru/edit/:id" element={<EditGuru />} />
# <Route path="guru/detail/:id" element={<DetailGuru />} />
# <Route path="daftar-guru" element={<DaftarGuru />} />
```

---

### **Sidebar Menu Check**
- [ ] Sidebar has "Data Guru" menu for Role 9
- [ ] Sidebar has "Daftar Guru" menu for Role 8

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend\src\components
type Sidebar.jsx | findstr "Data Guru"

# Expected: { label: "Data Guru", path: "/sekolah/guru", ...
```

---

## 🚀 6. DEVELOPMENT SERVERS

### **Start Backend**
- [ ] Backend server starts without errors
- [ ] Listens on port 3000
- [ ] Database connection successful
- [ ] Swagger docs available (optional)

**Start:**
```bash
cd c:\sistem-monitoring-evaluasi\backend
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO [RoutesResolver] AssessmentGuruController {/assessment-guru}
[Nest] INFO [RoutesResolver] Mapped {POST, /auth/login-guru}
[Nest] INFO [NestApplication] Nest application successfully started
```

**Verify in Browser:**
- Open: `http://localhost:3000`
- Should see: `Hello World!` or API response

---

### **Start Frontend**
- [ ] Frontend server starts without errors
- [ ] Listens on port 5173
- [ ] Hot-reload works

**Start:**
```bash
cd c:\sistem-monitoring-evaluasi\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify in Browser:**
- Open: `http://localhost:5173`
- Should see: Login page

---

## 🧪 7. QUICK API TEST (Before UI Testing)

### **Test 1: Backend Health Check**
```bash
curl http://localhost:3000
```
**Expected:** `Hello World!` or similar response

---

### **Test 2: Login Operator (Get Token)**
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"operator@sekolah1.com\",\"password\":\"operator123\",\"id_role\":9}"
```
**Expected:** JWT token in response

---

### **Test 3: Get Guru List (with Token)**
```bash
curl -X GET http://localhost:3000/assessment-guru/sekolah/1 ^
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Expected:** Array of guru (bisa empty `[]` jika belum ada data)

---

## 🔐 8. AUTHENTICATION FLOW CHECK

### **Login Forms**
- [ ] Login page has dropdown for role selection
- [ ] Dropdown has "Operator Sekolah" option
- [ ] Dropdown has "Guru Assessment" option
- [ ] Form fields change based on selected role

**Verify:**
- Open: `http://localhost:5173/login`
- Check dropdown options
- Select "Guru Assessment" → Should show: ID Sekolah, Nama Guru, Password
- Select "Operator Sekolah" → Should show: Email, Password

---

### **JWT Token Structure**
After login, check localStorage:

**Role 9 (Operator) Token:**
```json
{
  "id_role": 9,
  "role": "Operator Sekolah",
  "id_sekolah": 1,
  "email": "operator@sekolah1.com"
}
```

**Role 8 (Guru) Token:**
```json
{
  "id_role": 8,
  "role": "Guru Assessment",
  "id_sekolah": 1,
  "id_guru_assessment": 1,
  "nama": "Nama Guru"
}
```

**Verify in Browser:**
1. Login as Operator/Guru
2. Open DevTools (F12)
3. Application → Local Storage → `http://localhost:5173`
4. Check `token` key
5. Copy token value
6. Decode at [jwt.io](https://jwt.io)
7. Verify payload has required fields

---

## 📊 9. DOCUMENTATION VERIFICATION

### **Files Exist**
- [ ] `STATUS_IMPLEMENTATION.md` exists
- [ ] `QUICK_START_GUIDE.md` exists
- [ ] `API_ENDPOINTS_GURU.md` exists
- [ ] `TESTING_CHECKLIST.md` exists
- [ ] `GURU_MANAGEMENT_GUIDE.md` exists
- [ ] `README_GURU_SYSTEM.md` exists
- [ ] `PRE_TESTING_VERIFICATION.md` exists (this file)

**Verify:**
```bash
cd c:\sistem-monitoring-evaluasi
dir *.md

# Expected: 7 markdown files listed
```

---

## 🎯 10. FINAL PRE-FLIGHT CHECK

### **All Systems Ready**
- [ ] ✅ Database: PostgreSQL running, table ready
- [ ] ✅ Backend: Build passed, server running on port 3000
- [ ] ✅ Frontend: Build passed, server running on port 5173
- [ ] ✅ API: Endpoints responding correctly
- [ ] ✅ Login: Both role forms working
- [ ] ✅ JWT: Token structure correct
- [ ] ✅ Documentation: All 7 files available

---

## 🚦 STATUS INDICATORS

### **System Status**
```
🟢 READY TO TEST     - All checks passed, proceed to testing
🟡 PARTIAL READY     - Some checks failed, review and fix
🔴 NOT READY         - Critical issues, do not proceed
```

### **Component Status**
| Component | Status | Note |
|-----------|--------|------|
| Database | 🟢 | Table assessment_guru ready |
| Backend Build | 🟢 | Compiled successfully |
| Backend Server | 🟢 | Running on port 3000 |
| Frontend Build | 🟢 | Compiled successfully |
| Frontend Server | 🟢 | Running on port 5173 |
| API Endpoints | 🟢 | 7 endpoints available |
| Authentication | 🟢 | JWT working for 2 roles |
| Documentation | 🟢 | 7 docs complete |

---

## 📝 NEXT STEPS

### **If All Checks Passed (🟢)**
✅ Proceed to **manual testing** using `TESTING_CHECKLIST.md`

**Start Testing:**
1. Open `TESTING_CHECKLIST.md`
2. Follow Scenario 1-11 sequentially
3. Mark each test as passed/failed
4. Report any issues

---

### **If Some Checks Failed (🟡)**
⚠️ **Review failed items and fix before testing**

**Common Fixes:**
1. Missing columns → Run migration SQL
2. Build errors → Check error logs, fix code
3. Server not starting → Check port availability
4. API not responding → Check backend logs
5. Login not working → Check database credentials

---

### **If Critical Issues (🔴)**
🛑 **DO NOT PROCEED TO TESTING**

**Critical Issues:**
- Database not accessible
- Backend cannot start
- Frontend cannot build
- API endpoints return 500 errors

**Action Required:**
1. Review error logs in detail
2. Check all prerequisites
3. Verify configurations
4. Consult documentation
5. Fix critical issues first

---

## 🆘 QUICK TROUBLESHOOTING

### **Backend Won't Start**
```bash
# Check port 3000 is free
netstat -ano | findstr :3000

# If occupied, kill process
taskkill /PID [PID_NUMBER] /F

# Restart backend
cd backend
npm run start:dev
```

---

### **Frontend Won't Start**
```bash
# Check port 5173 is free
netstat -ano | findstr :5173

# If occupied, kill process
taskkill /PID [PID_NUMBER] /F

# Restart frontend
cd frontend
npm run dev
```

---

### **Database Connection Failed**
```bash
# Check PostgreSQL service
sc query postgresql-x64-14

# Start if stopped
net start postgresql-x64-14

# Test connection
psql -U postgres -d sistem_monitoring_evaluasi_program -c "SELECT 1;"
```

---

### **Table Not Found**
```bash
# Run migration
cd backend\src\migrations
psql -U postgres -d sistem_monitoring_evaluasi_program -f add-guru-fields.sql

# Verify
psql -U postgres -d sistem_monitoring_evaluasi_program -c "\d assessment_guru"
```

---

## 📞 SUPPORT

**Jika masih ada issue setelah verifikasi:**
1. Check error messages di browser console (F12)
2. Check error messages di backend terminal
3. Review documentation files
4. Check common issues di `TESTING_CHECKLIST.md`

**Documentation:**
- Implementation: `STATUS_IMPLEMENTATION.md`
- Quick Start: `QUICK_START_GUIDE.md`
- API Docs: `API_ENDPOINTS_GURU.md`
- Testing: `TESTING_CHECKLIST.md`

---

**Last Updated:** 9 Juni 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Verification

---

## ✅ VERIFICATION COMPLETE

Jika semua checklist di atas sudah ✅, maka sistem **SIAP UNTUK TESTING**!

**Next Step:**  
👉 Open `TESTING_CHECKLIST.md` dan mulai testing Scenario 1-11

**Good Luck! 🚀**
