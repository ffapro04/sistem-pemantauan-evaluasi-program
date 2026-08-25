import { Component, lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ENABLE_UI_TRANSLATOR } from "./config/features";
import { PageState } from "./components/common";
import { clearAuthSession, getAuthToken, getAuthUser } from "./utils/authSession";
import { ROLE_ADMIN, ROLE_PENGURUS } from "./constants/roles.js";

const Onboarding = lazy(() => import("./page/onboarding/OnBoarding"));
const Login = lazy(() => import("./page/otorisasi/Login"));
const AccountSettings = lazy(() => import("./page/pengaturan/AccountSettings"));
const GlobalUiTranslator = lazy(() => import("./i18n/GlobalUiTranslator"));

const DashboardAdmin = lazy(() => import("./page/admin/dashboardadmin/DashboardAdmin"));
const AgendaAdmin = lazy(() => import("./page/admin/dashboardadmin/AgendaAdmin"));
const ReadUser = lazy(() => import("./page/admin/kelolamaster/masteruser/ReadUser"));
const CreateUser = lazy(() => import("./page/admin/kelolamaster/masteruser/CreateUser"));
const EditUser = lazy(() => import("./page/admin/kelolamaster/masteruser/EditUser"));
const DetailUser = lazy(() => import("./page/admin/kelolamaster/masteruser/DetailUser"));
const ReadPengurus = lazy(() => import("./page/admin/kelolamaster/masterpengurus/ReadPengurus"));
const CreatePengurus = lazy(() => import("./page/admin/kelolamaster/masterpengurus/CreatePengurus"));
const EditPengurus = lazy(() => import("./page/admin/kelolamaster/masterpengurus/EditPengurus"));
const DetailPengurus = lazy(() => import("./page/admin/kelolamaster/masterpengurus/DetailPengurus"));
const ReadHO = lazy(() => import("./page/admin/kelolamaster/masterho/ReadHO"));
const CreateHO = lazy(() => import("./page/admin/kelolamaster/masterho/CreateHO"));
const EditHO = lazy(() => import("./page/admin/kelolamaster/masterho/EditHO"));
const DetailHO = lazy(() => import("./page/admin/kelolamaster/masterho/DetailHO"));
const ReadAO = lazy(() => import("./page/admin/kelolamaster/masterao/ReadAO"));
const CreateAO = lazy(() => import("./page/admin/kelolamaster/masterao/CreateAO"));
const EditAO = lazy(() => import("./page/admin/kelolamaster/masterao/EditAO"));
const DetailAO = lazy(() => import("./page/admin/kelolamaster/masterao/DetailAO"));
const ReadWilayah = lazy(() => import("./page/admin/kelolamaster/masterWilayah/ReadWilayah"));
const CreateWilayah = lazy(() => import("./page/admin/kelolamaster/masterWilayah/CreateWilayah"));
const EditWilayah = lazy(() => import("./page/admin/kelolamaster/masterWilayah/EditWilayah"));
const DetailWilayah = lazy(() => import("./page/admin/kelolamaster/masterWilayah/DetailWilayah"));
const ReadSekolah = lazy(() => import("./page/admin/kelolamaster/mastersekolah/ReadSekolah"));
const CreateSekolah = lazy(() => import("./page/admin/kelolamaster/mastersekolah/CreateSekolah"));
const EditSekolah = lazy(() => import("./page/admin/kelolamaster/mastersekolah/EditSekolah"));
const DetailSekolah = lazy(() => import("./page/admin/kelolamaster/mastersekolah/DetailSekolah"));
const ReadOperatorSekolah = lazy(() => import("./page/admin/kelolamaster/masteroperatorsekolah/ReadOperatorSekolah"));
const CreateOperatorSekolah = lazy(() => import("./page/admin/kelolamaster/masteroperatorsekolah/CreateOperatorSekolah"));
const EditOperatorSekolah = lazy(() => import("./page/admin/kelolamaster/masteroperatorsekolah/EditOperatorSekolah"));
const DetailOperatorSekolah = lazy(() => import("./page/admin/kelolamaster/masteroperatorsekolah/DetailOperatorSekolah"));
const ReadVendor = lazy(() => import("./page/admin/kelolamaster/mastervendor/ReadVendor"));
const CreateVendor = lazy(() => import("./page/admin/kelolamaster/mastervendor/CreateVendor"));
const EditVendor = lazy(() => import("./page/admin/kelolamaster/mastervendor/EditVendor"));
const DetailVendor = lazy(() => import("./page/admin/kelolamaster/mastervendor/DetailVendor"));
const ReadKepalaSekolah = lazy(() => import("./page/admin/kelolamaster/masterkepalasekolah/ReadKepalaSekolah"));
const ReadKepalaDinas = lazy(() => import("./page/admin/kelolamaster/masterkepaladinas/ReadKepalaDinas"));
const CreateKepalaDinas = lazy(() => import("./page/admin/kelolamaster/masterkepaladinas/CreateKepalaDinas"));
const EditKepalaDinas = lazy(() => import("./page/admin/kelolamaster/masterkepaladinas/EditKepalaDinas"));
const DetailKepalaDinas = lazy(() => import("./page/admin/kelolamaster/masterkepaladinas/DetailKepalaDinas"));

const DashboardSekolah = lazy(() => import("./page/sekolah/DashboardSekolah"));
const AgendaSekolah = lazy(() => import("./page/sekolah/AgendaSekolah"));
const AssessmentSekolah = lazy(() => import("./page/sekolah/AssessmentSekolah"));
const IsiAssessmentSekolah = lazy(() => import("./page/sekolah/IsiAssessmentSekolah"));
const ProgramSekolah = lazy(() => import("./page/sekolah/ProgramSekolah"));
const DaftarGuru = lazy(() => import("./page/sekolah/DaftarGuru"));
const BeritaAcara = lazy(() => import("./page/sekolah/BeritaAcara"));
const DashboardKepalaSekolah = lazy(() => import("./page/kepalasekolah/DashboardKepalaSekolah"));
const DataKelas = lazy(() => import("./page/sekolah/DataKelas"));
const CreateGuru = lazy(() => import("./page/sekolah/CreateGuru"));
const EditGuru = lazy(() => import("./page/sekolah/EditGuru"));
const DetailGuru = lazy(() => import("./page/sekolah/DetailGuru"));
const CreateKepalaSekolah = lazy(() => import("./page/sekolah/CreateKepalaSekolah"));
const EditKepalaSekolah = lazy(() => import("./page/sekolah/EditKepalaSekolah"));
const CreateKelas = lazy(() => import("./page/sekolah/CreateKelas"));
const EditKelas = lazy(() => import("./page/sekolah/EditKelas"));
const DetailKelas = lazy(() => import("./page/sekolah/DetailKelas"));
const ReadJurusan = lazy(() => import("./page/sekolah/jurusan/ReadJurusan"));
const CreateJurusan = lazy(() => import("./page/sekolah/jurusan/CreateJurusan"));
const EditJurusan = lazy(() => import("./page/sekolah/jurusan/EditJurusan"));
const DetailJurusan = lazy(() => import("./page/sekolah/jurusan/DetailJurusan"));

const DashboardPengurus = lazy(() => import("./page/pengurus/DashboardPengurus"));
const AgendaPengurus = lazy(() => import("./page/pengurus/AgendaPengurus"));
const DashboardKepalaDinas = lazy(() => import("./page/kepaladinas/DashboardKepalaDinas"));
const AgendaKepalaDinas = lazy(() => import("./page/kepaladinas/AgendaKepalaDinas"));
const DaftarSekolahKepalaDinas = lazy(() => import("./page/kepaladinas/DaftarSekolahKepalaDinas"));
const DetailSekolahKepalaDinas = lazy(() => import("./page/kepaladinas/DetailSekolahKepalaDinas"));

const DashboardVendor = lazy(() => import("./page/vendor/DashboardVendor"));
const AgendaVendor = lazy(() => import("./page/vendor/AgendaVendor"));
const ListProgramVendor = lazy(() => import("./page/vendor/ListProgramVendor"));
const DetailProgramVendor = lazy(() => import("./page/vendor/DetailProgramVendor"));

const DashboardAkademik = lazy(() => import("./page/akademik/DashboardAkademik"));
const DashboardnonAkademik = lazy(() => import("./page/nonAkademik/DashboardnonAkademik"));
const ReadAssessmentAkademik = lazy(() => import("./page/akademik/assakademik/ReadAssessmentAkademik"));
const CreateAssessmentAkademik = lazy(() => import("./page/akademik/assakademik/CreateAssessmentAkademik"));
const DetailAssessmentAkademik = lazy(() => import("./page/akademik/assakademik/DetailAssessmentAkademik"));
const EditAssessmentAkademik = lazy(() => import("./page/akademik/assakademik/EditAssessmentAkademik"));
const ReadProgramAkademik = lazy(() => import("./page/akademik/proAkademik/ReadProgramAkademik"));
const ListProgramAkademik = lazy(() => import("./page/akademik/proAkademik/ListProgramAkademik"));
const CreateProgramAkademik = lazy(() => import("./page/akademik/proAkademik/CreateProgramAkademik"));
const DetailProgramAkademik = lazy(() => import("./page/akademik/proAkademik/DetailProgramAkademik"));
const EditProgramAkademik = lazy(() => import("./page/akademik/proAkademik/EditProgramAkademik"));
const CalendarOfEventakademik = lazy(() => import("./page/akademik/proAkademik/CalendarOfEventakademik"));
const ReadAssessmentNonAkademik = lazy(() => import("./page/nonAkademik/assnonakademik/ReadAssessmentnonAkademik"));
const CreateAssessmentNonAkademik = lazy(() => import("./page/nonAkademik/assnonakademik/CreateAssessmentnonAkademik"));
const DetailAssessmentNonAkademik = lazy(() => import("./page/nonAkademik/assnonakademik/DetailAssessmentnonAkademik"));
const EditAssessmentNonAkademik = lazy(() => import("./page/nonAkademik/assnonakademik/EditAssessmentnonAkademik"));
const ReadProgramNonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/ReadProgramnonAkademik"));
const ListProgramNonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/ListProgramnonAkademik"));
const CreateProgramNonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/CreateProgramnonAkademik"));
const DetailProgramNonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/DetailProgramnonAkademik"));
const EditProgramNonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/EditProgramnonAkademik"));
const CalendarOfEventnonAkademik = lazy(() => import("./page/nonAkademik/proNonAkademik/CalendarOfEventnonAkademik"));
const DaftarProgramPage = lazy(() => import("./components/program/DaftarProgramPage"));

const AODashboardPage = lazy(() => import("./components/ao/AODashboardPage"));
const AgendaAO = lazy(() => import("./page/ao/AgendaAO"));
const AOProgramDetailPage = lazy(() => import("./components/ao/AOProgramDetailPage"));

function RouteLoadingFallback() {
  return (
    <PageState
      loading
      title="Memuat halaman"
      description="Mohon tunggu sebentar."
      eyebrow="Sistem Monitoring Evaluasi"
    />
  );
}

function getDecodedUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      clearAuthSession();
      return null;
    }

    getAuthUser();
    return decoded;
  } catch {
    clearAuthSession();
    return null;
  }
}

function getDefaultRoute(user = {}) {
  const roleId = Number(user.id_role || user.role_id || 0);
  const role = String(user.role || user.nama_role || "").toLowerCase();
  const jabatan = String(user.jabatan || "").toLowerCase();
  const jenis = String(user.jenis || "").toLowerCase();

  if (roleId === 1 || role === ROLE_ADMIN) return "/admin/dashboard";
  if (roleId === 2 || role === ROLE_PENGURUS) return "/pengurus/dashboard";
  if (roleId === 3 || role.includes("head office")) {
    return jenis.includes("non")
      ? "/ho/dashboard/non-akademik"
      : "/ho/dashboard/akademik";
  }
  if (roleId === 4 || role.includes("area officer")) return "/ao/dashboard";
  if (roleId === 6 || role.includes("vendor")) return "/vendor/dashboard";
  if (roleId === 7 || role.includes("kepala dinas")) return "/kepala-dinas/dashboard";
  if (roleId === 10 || role.includes("kepala sekolah") || jabatan.includes("kepala sekolah")) {
    return "/kepala-sekolah/dashboard";
  }
  if (roleId === 5 || roleId === 8 || roleId === 9 || role.includes("sekolah") || role.includes("guru")) {
    return "/sekolah/dashboard";
  }

  return "/login";
}

function getAllowedPrefixes(user = {}) {
  const roleId = Number(user.id_role || user.role_id || 0);
  const role = String(user.role || user.nama_role || "").toLowerCase();
  const jabatan = String(user.jabatan || "").toLowerCase();
  const common = ["/pengaturan-akun", "/integrasi/google-drive"];

  if (roleId === 1 || role === ROLE_ADMIN) return ["/admin", ...common];
  if (roleId === 2 || role === ROLE_PENGURUS) return ["/pengurus", ...common];
  if (roleId === 3 || role.includes("head office")) return ["/ho", ...common];
  if (roleId === 4 || role.includes("area officer")) return ["/ao", ...common];
  if (roleId === 6 || role.includes("vendor")) return ["/vendor", ...common];
  if (roleId === 7 || role.includes("kepala dinas")) return ["/kepala-dinas", ...common];
  if (roleId === 10 || role.includes("kepala sekolah") || jabatan.includes("kepala sekolah")) {
    return ["/kepala-sekolah", "/sekolah", ...common];
  }
  if (roleId === 5 || roleId === 8 || roleId === 9 || role.includes("sekolah") || role.includes("guru")) {
    return ["/sekolah", ...common];
  }

  return common;
}

function RouteAccessGuard({ children }) {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    document.title = "Yayasan Pendidikan Astra Michael D. Ruslim";
    document.body.dataset.appRoute = pathname;

    return () => {
      delete document.body.dataset.appRoute;
    };
  }, [pathname]);

  if (pathname === "/" || pathname === "/login") {
    const user = getDecodedUser();

    if (user && pathname === "/login") {
      return <Navigate to={getDefaultRoute(user)} replace />;
    }

    return children;
  }

  const user = getDecodedUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = getAllowedPrefixes(user).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!allowed) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  return children;
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Halaman gagal dirender:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageState
          tone="error"
          title="Halaman gagal dimuat"
          description="Terjadi kendala saat membuka halaman ini. Silakan refresh, atau kembali ke halaman login jika sesi sudah habis."
          primaryAction={{
            label: "Refresh",
            onClick: () => window.location.reload(),
          }}
          secondaryAction={{
            label: "Login",
            onClick: () => {
              window.location.href = "/login";
            },
          }}
        />
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <Suspense fallback={<RouteLoadingFallback />}>
        {ENABLE_UI_TRANSLATOR && <GlobalUiTranslator />}
        <RouteAccessGuard>
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
              title="Review Upload Program"
              detailPathPrefix="/ao/program/detail"
              mode="review"
            />
          }
        />
        <Route path="/ao/program/detail/:id" element={<AOProgramDetailPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
        </RouteAccessGuard>
        </Suspense>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
