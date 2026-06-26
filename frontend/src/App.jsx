import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =========================================================================
// ONBOARDING & OTORISASI
// =========================================================================
import Onboarding from "./page/onboarding/OnBoarding";
import Login from "./page/otorisasi/Login";

// =========================================================================
// ADMIN - DASHBOARD & GLOBAL
// =========================================================================
import DashboardAdmin from "./page/admin/dashboardadmin/DashboardAdmin";
import AgendaAdmin from "./page/admin/dashboardadmin/AgendaAdmin";

// =========================================================================
// PENGATURAN AKUN
// =========================================================================
import AccountSettings from "./page/pengaturan/AccountSettings";
import GlobalUiTranslator from "./i18n/GlobalUiTranslator";
import { ENABLE_UI_TRANSLATOR } from "./config/features";
// =========================================================================
// PENGURUS ROLE
// =========================================================================
import DashboardPengurus from "./page/pengurus/DashboardPengurus";
import AgendaPengurus from "./page/pengurus/AgendaPengurus";

// =========================================================================
// KEPALA DINAS ROLE
// =========================================================================
import DashboardKepalaDinas from "./page/kepaladinas/DashboardKepalaDinas";
import AgendaKepalaDinas from "./page/kepaladinas/AgendaKepalaDinas";
import DaftarSekolahKepalaDinas from "./page/kepaladinas/DaftarSekolahKepalaDinas";
import DetailSekolahKepalaDinas from "./page/kepaladinas/DetailSekolahKepalaDinas";

// =========================================================================
// ADMIN - KELOLA MASTER DATA
// =========================================================================

// MASTER USER
import ReadUser from "./page/admin/kelolamaster/masteruser/ReadUser";
import CreateUser from "./page/admin/kelolamaster/masteruser/CreateUser";
import EditUser from "./page/admin/kelolamaster/masteruser/EditUser";
import DetailUser from "./page/admin/kelolamaster/masteruser/DetailUser";

// MASTER PENGURUS
import ReadPengurus from "./page/admin/kelolamaster/masterpengurus/ReadPengurus";
import CreatePengurus from "./page/admin/kelolamaster/masterpengurus/CreatePengurus";
import EditPengurus from "./page/admin/kelolamaster/masterpengurus/EditPengurus";
import DetailPengurus from "./page/admin/kelolamaster/masterpengurus/DetailPengurus";

// MASTER HO / HEAD OFFICE
import ReadHO from "./page/admin/kelolamaster/masterho/ReadHO";
import CreateHO from "./page/admin/kelolamaster/masterho/CreateHO";
import EditHO from "./page/admin/kelolamaster/masterho/EditHO";
import DetailHO from "./page/admin/kelolamaster/masterho/DetailHO";

// MASTER AO / AREA OFFICER
import ReadAO from "./page/admin/kelolamaster/masterao/ReadAO";
import CreateAO from "./page/admin/kelolamaster/masterao/CreateAO";
import EditAO from "./page/admin/kelolamaster/masterao/EditAO";
import DetailAO from "./page/admin/kelolamaster/masterao/DetailAO";

// MASTER WILAYAH
import ReadWilayah from "./page/admin/kelolamaster/masterWilayah/ReadWilayah";
import CreateWilayah from "./page/admin/kelolamaster/masterWilayah/CreateWilayah";
import EditWilayah from "./page/admin/kelolamaster/masterWilayah/EditWilayah";
import DetailWilayah from "./page/admin/kelolamaster/masterWilayah/DetailWilayah";

// MASTER SEKOLAH
import ReadSekolah from "./page/admin/kelolamaster/mastersekolah/ReadSekolah";
import CreateSekolah from "./page/admin/kelolamaster/mastersekolah/CreateSekolah";
import EditSekolah from "./page/admin/kelolamaster/mastersekolah/EditSekolah";
import DetailSekolah from "./page/admin/kelolamaster/mastersekolah/DetailSekolah";

// MASTER OPERATOR SEKOLAH
import ReadOperatorSekolah from "./page/admin/kelolamaster/masteroperatorsekolah/ReadOperatorSekolah";
import CreateOperatorSekolah from "./page/admin/kelolamaster/masteroperatorsekolah/CreateOperatorSekolah";
import EditOperatorSekolah from "./page/admin/kelolamaster/masteroperatorsekolah/EditOperatorSekolah";
import DetailOperatorSekolah from "./page/admin/kelolamaster/masteroperatorsekolah/DetailOperatorSekolah";

// MASTER VENDOR
import ReadVendor from "./page/admin/kelolamaster/mastervendor/ReadVendor";
import CreateVendor from "./page/admin/kelolamaster/mastervendor/CreateVendor";
import EditVendor from "./page/admin/kelolamaster/mastervendor/EditVendor";
import DetailVendor from "./page/admin/kelolamaster/mastervendor/DetailVendor";
import ManajemenVendor from "./page/admin/vendor/ManajemenVendor";

// MASTER KEPALA SEKOLAH
import ReadKepalaSekolah from "./page/admin/kelolamaster/masterkepalasekolah/ReadKepalaSekolah";

// MASTER KEPALA DINAS
import ReadKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/ReadKepalaDinas";
import CreateKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/CreateKepalaDinas";
import EditKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/EditKepalaDinas";
import DetailKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/DetailKepalaDinas";

// =========================================================================
// SEKOLAH SHARED - Role 5, 8, dan 9
// =========================================================================
import DashboardSekolah from "./page/sekolah/DashboardSekolah";
import AgendaSekolah from "./page/sekolah/AgendaSekolah";
import AssessmentSekolah from "./page/sekolah/AssessmentSekolah";
import IsiAssessmentSekolah from "./page/sekolah/IsiAssessmentSekolah";
import ProgramSekolah from "./page/sekolah/ProgramSekolah";
import DaftarGuru from "./page/sekolah/DaftarGuru";
import BeritaAcara from "./page/sekolah/BeritaAcara";
import DashboardKepalaSekolah from "./page/kepalasekolah/DashboardKepalaSekolah";

// DATA GURU
import DataGuru from "./page/sekolah/DataGuru";
import CreateGuru from "./page/sekolah/CreateGuru";
import EditGuru from "./page/sekolah/EditGuru";
import DetailGuru from "./page/sekolah/DetailGuru";
import CreateKepalaSekolah from "./page/sekolah/CreateKepalaSekolah";
import EditKepalaSekolah from "./page/sekolah/EditKepalaSekolah";

// DATA KELAS
import DataKelas from "./page/sekolah/DataKelas";
import CreateKelas from "./page/sekolah/CreateKelas";
import EditKelas from "./page/sekolah/EditKelas";
import DetailKelas from "./page/sekolah/DetailKelas";

// MINI MASTER JURUSAN
import ReadJurusan from "./page/sekolah/jurusan/ReadJurusan";
import CreateJurusan from "./page/sekolah/jurusan/CreateJurusan";
import EditJurusan from "./page/sekolah/jurusan/EditJurusan";
import DetailJurusan from "./page/sekolah/jurusan/DetailJurusan";

// =========================================================================
// VENDOR ROLE
// =========================================================================
import DashboardVendor from "./page/vendor/DashboardVendor";
import AgendaVendor from "./page/vendor/AgendaVendor";
import ListProgramVendor from "./page/vendor/ListProgramVendor";
import DetailProgramVendor from "./page/vendor/DetailProgramVendor";

// =========================================================================
// HO - DASHBOARD
// =========================================================================
import DashboardAkademik from "./page/akademik/DashboardAkademik";
import DashboardnonAkademik from "./page/nonAkademik/DashboardnonAkademik";

// =========================================================================
// AKADEMIK - ASSESSMENT
// =========================================================================
import ReadAssessmentAkademik from "./page/akademik/assakademik/ReadAssessmentAkademik";
import CreateAssessmentAkademik from "./page/akademik/assakademik/CreateAssessmentAkademik";
import DetailAssessmentAkademik from "./page/akademik/assakademik/DetailAssessmentAkademik";
import EditAssessmentAkademik from "./page/akademik/assakademik/EditAssessmentAkademik";

// =========================================================================
// AKADEMIK - PROGRAM
// =========================================================================
import ReadProgramAkademik from "./page/akademik/proAkademik/ReadProgramAkademik";
import ListProgramAkademik from "./page/akademik/proAkademik/ListProgramAkademik";
import CreateProgramAkademik from "./page/akademik/proAkademik/CreateProgramAkademik";
import DetailProgramAkademik from "./page/akademik/proAkademik/DetailProgramAkademik";
import EditProgramAkademik from "./page/akademik/proAkademik/EditProgramAkademik";
import CalendarOfEventakademik from "./page/akademik/proAkademik/CalendarOfEventakademik";

// =========================================================================
// NON-AKADEMIK - ASSESSMENT
// =========================================================================
import ReadAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/ReadAssessmentnonAkademik";
import CreateAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/CreateAssessmentnonAkademik";
import DetailAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/DetailAssessmentnonAkademik";
import EditAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/EditAssessmentnonAkademik";

// =========================================================================
// NON-AKADEMIK - PROGRAM
// =========================================================================
import ReadProgramNonAkademik from "./page/nonAkademik/proNonAkademik/ReadProgramnonAkademik";
import ListProgramNonAkademik from "./page/nonAkademik/proNonAkademik/ListProgramnonAkademik";
import CreateProgramNonAkademik from "./page/nonAkademik/proNonAkademik/CreateProgramnonAkademik";
import DetailProgramNonAkademik from "./page/nonAkademik/proNonAkademik/DetailProgramnonAkademik";
import EditProgramNonAkademik from "./page/nonAkademik/proNonAkademik/EditProgramnonAkademik";
import CalendarOfEventnonAkademik from "./page/nonAkademik/proNonAkademik/CalendarOfEventnonAkademik";

// HO - DAFTAR PROGRAM
import DaftarProgramPage from "./components/program/DaftarProgramPage";

// =========================================================================
// AO - DASHBOARD
// =========================================================================
import AODashboardPage from "./components/ao/AODashboardPage";
import AgendaAO from "./page/ao/AgendaAO";
import AOProgramDetailPage from "./components/ao/AOProgramDetailPage";


function App() {
  return (
    <BrowserRouter>
      {ENABLE_UI_TRANSLATOR && <GlobalUiTranslator />}
      <Routes>
        {/* OTORISASI */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />

        {/* PENGATURAN AKUN */}
        <Route path="/pengaturan-akun" element={<AccountSettings />} />

        {/* ALIAS LAMA - BIAR URL LAMA TIDAK ERROR */}
        <Route
          path="/integrasi/google-drive"
          element={<Navigate to="/pengaturan-akun" replace />}
        />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/agenda" element={<AgendaAdmin />} />

        {/* ADMIN - MASTER USER */}
        <Route path="/admin/users" element={<ReadUser />} />
        <Route path="/admin/users/create" element={<CreateUser />} />
        <Route path="/admin/users/detail/:id" element={<DetailUser />} />
        <Route path="/admin/users/edit/:id" element={<EditUser />} />

        {/* ADMIN - MASTER PENGURUS */}
        <Route path="/admin/pengurus" element={<ReadPengurus />} />
        <Route path="/admin/pengurus/create" element={<CreatePengurus />} />
        <Route path="/admin/pengurus/detail/:id" element={<DetailPengurus />} />
        <Route path="/admin/pengurus/edit/:id" element={<EditPengurus />} />

        {/* ADMIN - MASTER HO */}
        <Route path="/admin/ho" element={<ReadHO />} />
        <Route path="/admin/ho/create" element={<CreateHO />} />
        <Route path="/admin/ho/detail/:id" element={<DetailHO />} />
        <Route path="/admin/ho/edit/:id" element={<EditHO />} />

        {/* ADMIN - MASTER AO */}
        <Route path="/admin/ao" element={<ReadAO />} />
        <Route path="/admin/ao/create" element={<CreateAO />} />
        <Route path="/admin/ao/detail/:id" element={<DetailAO />} />
        <Route path="/admin/ao/edit/:id" element={<EditAO />} />

        {/* ADMIN - MASTER WILAYAH */}
        <Route path="/admin/wilayah" element={<ReadWilayah />} />
        <Route path="/admin/wilayah/create" element={<CreateWilayah />} />
        <Route path="/admin/wilayah/detail/:id" element={<DetailWilayah />} />
        <Route path="/admin/wilayah/edit/:id" element={<EditWilayah />} />

        {/* ADMIN - MASTER SEKOLAH */}
        <Route path="/admin/sekolah" element={<ReadSekolah />} />
        <Route path="/admin/sekolah/create" element={<CreateSekolah />} />
        <Route path="/admin/sekolah/detail/:id" element={<DetailSekolah />} />
        <Route path="/admin/sekolah/edit/:id" element={<EditSekolah />} />

        {/* ADMIN - MASTER OPERATOR SEKOLAH */}
        <Route path="/admin/operator-sekolah" element={<ReadOperatorSekolah />} />
        <Route
          path="/admin/operator-sekolah/create"
          element={<CreateOperatorSekolah />}
        />
        <Route
          path="/admin/operator-sekolah/detail/:id"
          element={<DetailOperatorSekolah />}
        />
        <Route
          path="/admin/operator-sekolah/edit/:id"
          element={<EditOperatorSekolah />}
        />

        {/* ADMIN - MASTER KEPALA SEKOLAH */}
        <Route path="/admin/kepala-sekolah" element={<ReadKepalaSekolah />} />

        {/* ADMIN - MASTER VENDOR */}
        <Route path="/admin/vendor" element={<ReadVendor />} />
        <Route path="/admin/vendor/create" element={<CreateVendor />} />
        <Route path="/admin/vendor/detail/:id" element={<DetailVendor />} />
        <Route path="/admin/vendor/edit/:id" element={<EditVendor />} />
        <Route path="/admin/manajemen-vendor" element={<ManajemenVendor />} />

        {/* ADMIN - MASTER KEPALA DINAS */}
        <Route path="/admin/kadin" element={<ReadKepalaDinas />} />
        <Route path="/admin/kadin/create" element={<CreateKepalaDinas />} />
        <Route path="/admin/kadin/detail/:id" element={<DetailKepalaDinas />} />
        <Route path="/admin/kadin/edit/:id" element={<EditKepalaDinas />} />

        {/* SEKOLAH ROUTES */}
        <Route path="/sekolah">
          <Route index element={<Navigate to="/sekolah/dashboard" replace />} />

          {/* Shared: Role 5, 8, 9 */}
          <Route path="dashboard" element={<DashboardSekolah />} />
          <Route path="agenda" element={<AgendaSekolah />} />
          <Route path="assessment" element={<AssessmentSekolah />} />
          <Route path="assessment/isi/:id" element={<IsiAssessmentSekolah />} />
          <Route path="program" element={<ProgramSekolah />} />
          <Route path="berita-acara" element={<BeritaAcara />} />

          {/* Daftar Guru: Role 8 */}
          <Route path="daftar-guru" element={<DaftarGuru />} />
          <Route path="daftar-kelas" element={<DataKelas />} />
          <Route path="daftar-jurusan" element={<ReadJurusan />} />

          {/* Kelas: Role 9 */}
          <Route path="kelas" element={<DataKelas />} />
          <Route path="kelas/create" element={<CreateKelas />} />
          <Route path="kelas/edit/:id" element={<EditKelas />} />
          <Route path="kelas/detail/:id" element={<DetailKelas />} />

          {/* Jurusan: Role 9, khusus SMK */}
          <Route path="jurusan" element={<ReadJurusan />} />
          <Route path="jurusan/create" element={<CreateJurusan />} />
          <Route path="jurusan/edit/:id" element={<EditJurusan />} />
          <Route path="jurusan/detail/:id" element={<DetailJurusan />} />

          {/* Data Guru: Role 9 */}
          <Route path="guru" element={<DaftarGuru />} />
          <Route path="guru/create" element={<CreateGuru />} />
          <Route path="guru/edit/:id" element={<EditGuru />} />
          <Route path="guru/detail/:id" element={<DetailGuru />} />
          <Route path="guru/kepala-sekolah/create" element={<CreateKepalaSekolah />} />
          <Route path="guru/kepala-sekolah/edit/:id" element={<EditKepalaSekolah />} />
        </Route>

        {/* KEPALA SEKOLAH */}
        <Route path="/kepala-sekolah/dashboard" element={<DashboardKepalaSekolah />} />

        {/* PENGURUS DASHBOARD */}
        <Route path="/pengurus/dashboard" element={<DashboardPengurus />} />
        <Route path="/pengurus/agenda" element={<AgendaPengurus />} />
        <Route path="/pengurus/manajemen-vendor" element={<ManajemenVendor />} />

        {/* MODUL KEPALA DINAS - CANONICAL ROUTE */}
        <Route path="/kepala-dinas/dashboard" element={<DashboardKepalaDinas />} />
        <Route path="/kepala-dinas/agenda" element={<AgendaKepalaDinas />} />
        <Route path="/kepala-dinas/sekolah" element={<DaftarSekolahKepalaDinas />} />
        <Route
          path="/kepala-dinas/sekolah/detail/:id"
          element={<DetailSekolahKepalaDinas />}
        />

        {/* MODUL KEPALA DINAS - ALIAS LAMA BIAR LINK LAMA TETAP AMAN */}
        <Route
          path="/kepaladinas/dashboard"
          element={<Navigate to="/kepala-dinas/dashboard" replace />}
        />
        <Route
          path="/kepaladinas/agenda"
          element={<Navigate to="/kepala-dinas/agenda" replace />}
        />
        <Route
          path="/kepaladinas/sekolah"
          element={<Navigate to="/kepala-dinas/sekolah" replace />}
        />
        <Route
          path="/kepaladinas/sekolah/detail/:id"
          element={<DetailSekolahKepalaDinas />}
        />

        {/* MODUL VENDOR */}
        <Route path="/vendor/dashboard" element={<DashboardVendor />} />
        <Route path="/vendor/agenda" element={<AgendaVendor />} />
        <Route path="/vendor/program" element={<ListProgramVendor />} />
        <Route path="/vendor/program/detail/:id" element={<DetailProgramVendor />} />

        {/* HO DASHBOARD */}
        <Route path="/ho/dashboard/akademik" element={<DashboardAkademik />} />
        <Route path="/ho/dashboard/non-akademik" element={<DashboardnonAkademik />} />

        {/* HO - DAFTAR PROGRAM */}
        <Route path="/ho/daftar-program" element={<DaftarProgramPage />} />
        <Route path="/ho/manajemen-vendor" element={<ManajemenVendor />} />
        <Route
          path="/ho/daftar-program/akademik"
          element={<DaftarProgramPage lockedBidang="AKADEMIK" />}
        />
        <Route
          path="/ho/daftar-program/non-akademik"
          element={<DaftarProgramPage lockedBidang="NON_AKADEMIK" />}
        />

        {/* HO AKADEMIK - ASSESSMENT */}
        <Route path="/ho/assessment/akademik" element={<ReadAssessmentAkademik />} />
        <Route
          path="/ho/assessment/akademik/create"
          element={<CreateAssessmentAkademik />}
        />
        <Route
          path="/ho/assessment/akademik/detail/:id"
          element={<DetailAssessmentAkademik />}
        />
        <Route
          path="/ho/assessment/akademik/edit/:id"
          element={<EditAssessmentAkademik />}
        />

        {/* HO AKADEMIK - PROGRAM */}
        <Route path="/ho/program/akademik" element={<ReadProgramAkademik />} />
        <Route path="/ho/program/akademik/list/:id" element={<ListProgramAkademik />} />
        <Route path="/ho/program/akademik/create" element={<CreateProgramAkademik />} />
        <Route
          path="/ho/program/akademik/detail/:id"
          element={<DetailProgramAkademik />}
        />
        <Route
          path="/ho/program/akademik/edit/:id"
          element={<EditProgramAkademik />}
        />
        <Route path="/ho/penjadwalan/akademik" element={<CalendarOfEventakademik />} />

        {/* HO NON-AKADEMIK - ASSESSMENT */}
        <Route
          path="/ho/assessment/non-akademik"
          element={<ReadAssessmentNonAkademik />}
        />
        <Route
          path="/ho/assessment/non-akademik/create"
          element={<CreateAssessmentNonAkademik />}
        />
        <Route
          path="/ho/assessment/non-akademik/detail/:id"
          element={<DetailAssessmentNonAkademik />}
        />
        <Route
          path="/ho/assessment/non-akademik/edit/:id"
          element={<EditAssessmentNonAkademik />}
        />

        {/* HO NON-AKADEMIK - PROGRAM */}
        <Route path="/ho/program/non-akademik" element={<ReadProgramNonAkademik />} />
        <Route
          path="/ho/program/non-akademik/list/:id"
          element={<ListProgramNonAkademik />}
        />
        <Route
          path="/ho/program/non-akademik/create"
          element={<CreateProgramNonAkademik />}
        />
        <Route
          path="/ho/program/non-akademik/detail/:id"
          element={<DetailProgramNonAkademik />}
        />
        <Route
          path="/ho/program/non-akademik/edit/:id"
          element={<EditProgramNonAkademik />}
        />
        <Route
          path="/ho/penjadwalan/non-akademik"
          element={<CalendarOfEventnonAkademik />}
        />

        {/* AO ROUTES */}
        <Route path="/ao/dashboard" element={<AODashboardPage />} />
        <Route path="/ao/agenda" element={<AgendaAO />} />
        <Route
          path="/ao/program"
          element={
            <AODashboardPage
              title="Program Area Officer"
              detailPathPrefix="/ao/program/detail"
            />
          }
        />
        <Route path="/ao/program/detail/:id" element={<AOProgramDetailPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
