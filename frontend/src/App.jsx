import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================================================================
// ONBOARDING & OTORISASI
// =========================================================================
import Onboarding from "./page/onboarding/OnBoarding";
import Login from "./page/otorisasi/Login";

// =========================================================================
// ADMIN - DASHBOARD & GLOBAL
// =========================================================================
import DashboardAdmin from "./page/admin/dashboardadmin/DashboardAdmin";

// =========================================================================
// ADMIN - KELOLA MASTER DATA
// =========================================================================

// MASTER USER
import ReadUser from "./page/admin/kelolamaster/masteruser/ReadUser";
import CreateUser from "./page/admin/kelolamaster/masteruser/CreateUser";
import EditUser from "./page/admin/kelolamaster/masteruser/EditUser";
import DetailUser from "./page/admin/kelolamaster/masteruser/DetailUser";

// MASTER SEKOLAH
import ReadSekolah from "./page/admin/kelolamaster/mastersekolah/ReadSekolah";
import CreateSekolah from "./page/admin/kelolamaster/mastersekolah/CreateSekolah";
import EditSekolah from "./page/admin/kelolamaster/mastersekolah/EditSekolah";
import DetailSekolah from "./page/admin/kelolamaster/mastersekolah/DetailSekolah";

// MASTER VENDOR
import ReadVendor from "./page/admin/kelolamaster/mastervendor/ReadVendor";
import CreateVendor from "./page/admin/kelolamaster/mastervendor/CreateVendor";
import EditVendor from "./page/admin/kelolamaster/mastervendor/EditVendor";
import DetailVendor from "./page/admin/kelolamaster/mastervendor/DetailVendor";

// MASTER AO (AREA OFFICER)
import ReadAO from "./page/admin/kelolamaster/masterao/ReadAO";
import CreateAO from "./page/admin/kelolamaster/masterao/CreateAO";
import EditAO from "./page/admin/kelolamaster/masterao/EditAO";
import DetailAO from "./page/admin/kelolamaster/masterao/DetailAO";

// MASTER HO (HEAD OFFICE)
import ReadHO from "./page/admin/kelolamaster/masterho/ReadHO";
import CreateHO from "./page/admin/kelolamaster/masterho/CreateHO";
import EditHO from "./page/admin/kelolamaster/masterho/EditHO";
import DetailHO from "./page/admin/kelolamaster/masterho/DetailHO";

// MASTER WILAYAH
import ReadWilayah from "./page/admin/kelolamaster/masterWilayah/ReadWilayah";
import CreateWilayah from "./page/admin/kelolamaster/masterWilayah/CreateWilayah";
import EditWilayah from "./page/admin/kelolamaster/masterWilayah/EditWilayah";
import DetailWilayah from "./page/admin/kelolamaster/masterWilayah/DetailWilayah";

// MASTER PENGURUS
import ReadPengurus from "./page/admin/kelolamaster/masterpengurus/ReadPengurus";
import CreatePengurus from "./page/admin/kelolamaster/masterpengurus/CreatePengurus";
import EditPengurus from "./page/admin/kelolamaster/masterpengurus/EditPengurus";
import DetailPengurus from "./page/admin/kelolamaster/masterpengurus/DetailPengurus";


// MASTER KADIN
import CreateKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/CreateKepalaDinas";
import ReadKepalaPengurus from "./page/admin/kelolamaster/masterkepaladinas/ReadKepalaDinas";
import DetailKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/DetailKelapaDinas";
import EditKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/EditKepalaDinas";




// MASTER FINANCE
import ReadFinance from "./page/admin/kelolamaster/masterfinance/ReadFinance";
import CreateFinance from "./page/admin/kelolamaster/masterfinance/CreateFinance";
import EditFinance from "./page/admin/kelolamaster/masterfinance/EditFinance";
import DetailFinance from "./page/admin/kelolamaster/masterfinance/DetailFinance";

// =========================================================================
// SEKOLAH OPS
// =========================================================================
import DashboardSekolah from "./page/sekolah/DashboardSekolah";
import IsiAssessmentSekolah from "./page/sekolah/IsiAssessmentSekolah";
import ProfilSekolah from "./page/sekolah/ProfilSekolah";
import ProgramKegiatan from "./page/sekolah/ProgramKegiatan";



// =========================================================================
// PENGURUS OPS
// =========================================================================
import DashboardPengurus from "./page/pengurus/DashboardPengurus";
import DashboardSekolahPengurus from "./page/pengurus/DashboardSekolahPengurus";
import DashboardKegiatanPengurus from "./page/pengurus/DashboardKegiatanPengurus";

// =========================================================================
// KADIN OPS
// =========================================================================
import DashboardKadin from "./page/kepaladinas/DashboardKadin";
import DetailSekolahKadin from "./page/kepaladinas/DetailSekolahKadin";


// =========================================================================
// HO - DASHBOARD (dipisah per jenis)
// =========================================================================
import DashboardAkademik from "./page/akademik/DashboardAkademik";
import DashboardnonAkademik from "./page/nonAkademik/DashboardnonAkademik";

// =========================================================================
// AKADEMIK (HO ROLE)
// =========================================================================
import ReadAssessmentAkademik from "./page/akademik/assakademik/ReadAssessmentAkademik";
import CreateAssessmentAkademik from "./page/akademik/assakademik/CreateAssessmentAkademik";
import DetailAssessmentAkademik from "./page/akademik/assakademik/DetailAssessmentAkademik";
import EditAssessmentAkademik from "./page/akademik/assakademik/EditAssessmentAkademik";

import ReadProgramAkademik from "./page/akademik/proAkademik/ReadProgramAkademik";
import ListProgramAkademik from "./page/akademik/proAkademik/ListProgramAkademik";
import CreateProgramAkademik from "./page/akademik/proAkademik/CreateProgramAkademik";
import DetailProgramAkademik from "./page/akademik/proAkademik/DetailProgramAkademik";
import EditProgramAkademik from "./page/akademik/proAkademik/EditProgramAkademik";
import CalendarOfEventakademik from "./page/akademik/proAkademik/CalendarOfEventakademik";

// =========================================================================
// NON-AKADEMIK (HO ROLE)
// =========================================================================
import ReadAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/ReadAssessmentnonAkademik";
import CreateAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/CreateAssessmentnonAkademik";
import DetailAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/DetailAssessmentnonAkademik";
import EditAssessmentNonAkademik from "./page/nonAkademik/assnonakademik/EditAssessmentnonAkademik";

import ReadProgramNonAkademik from "./page/nonAkademik/proNonAkademik/ReadProgramnonAkademik";
import ListProgramNonAkademik from "./page/nonAkademik/proNonAkademik/ListProgramnonAkademik";
import CreateProgramNonAkademik from "./page/nonAkademik/proNonAkademik/CreateProgramnonAkademik";
import DetailProgramNonAkademik from "./page/nonAkademik/proNonAkademik/DetailProgramnonAkademik";
import EditProgramNonAkademik from "./page/nonAkademik/proNonAkademik/EditProgramnonAkademik";
import CalendarOfEventnonAkademik from "./page/nonAkademik/proNonAkademik/CalendarOfEventnonAkademik";
import ReadKepalaDinas from "./page/admin/kelolamaster/masterkepaladinas/ReadKepalaDinas";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- OTORISASI --- */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />

        {/* --- ADMIN DASHBOARD --- */}
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />

        {/* --- MASTER USER --- */}
        <Route path="/admin/users" element={<ReadUser />} />
        <Route path="/admin/users/create" element={<CreateUser />} />
        <Route path="/admin/users/detail/:id" element={<DetailUser />} />
        <Route path="/admin/users/edit/:id" element={<EditUser />} />

        {/* --- MASTER SEKOLAH --- */}
        <Route path="/admin/sekolah" element={<ReadSekolah />} />
        <Route path="/admin/sekolah/create" element={<CreateSekolah />} />
        <Route path="/admin/sekolah/detail/:id" element={<DetailSekolah />} />
        <Route path="/admin/sekolah/edit/:id" element={<EditSekolah />} />

        {/* --- MASTER VENDOR --- */}
        <Route path="/admin/vendor" element={<ReadVendor />} />
        <Route path="/admin/vendor/create" element={<CreateVendor />} />
        <Route path="/admin/vendor/detail/:id" element={<DetailVendor />} />
        <Route path="/admin/vendor/edit/:id" element={<EditVendor />} />

        {/* --- MASTER AO --- */}
        <Route path="/admin/ao" element={<ReadAO />} />
        <Route path="/admin/ao/create" element={<CreateAO />} />
        <Route path="/admin/ao/detail/:id" element={<DetailAO />} />
        <Route path="/admin/ao/edit/:id" element={<EditAO />} />

        {/* --- MASTER HO --- */}
        <Route path="/admin/ho" element={<ReadHO />} />
        <Route path="/admin/ho/create" element={<CreateHO />} />
        <Route path="/admin/ho/detail/:id" element={<DetailHO />} />
        <Route path="/admin/ho/edit/:id" element={<EditHO />} />

        {/* --- MASTER WILAYAH --- */}
        <Route path="/admin/wilayah" element={<ReadWilayah />} />
        <Route path="/admin/wilayah/create" element={<CreateWilayah />} />
        <Route path="/admin/wilayah/detail/:id" element={<DetailWilayah />} />
        <Route path="/admin/wilayah/edit/:id" element={<EditWilayah />} />

        {/* --- MASTER PENGURUS --- */}
        <Route path="/admin/pengurus" element={<ReadPengurus />} />
        <Route path="/admin/pengurus/create" element={<CreatePengurus />} />
        <Route path="/admin/pengurus/detail/:id" element={<DetailPengurus />} />
        <Route path="/admin/pengurus/edit/:id" element={<EditPengurus />} />


        {/* --- MASTER KEPALA DINAS --- */}
      <Route path="/admin/kadin/create" element={<CreateKepalaDinas />} />
      <Route path="/admin/kadin" element={<ReadKepalaDinas />} /> 
      <Route path="/admin/kadin/detail/:id" element={ <DetailKepalaDinas/>} />
      <Route path="/admin/kadin/edit/:id" element={<EditKepalaDinas />} />


        {/* --- MASTER FINANCE --- */}
        <Route path="/admin/finance" element={<ReadFinance />} />
        <Route path="/admin/finance/create" element={<CreateFinance />} />
        <Route path="/admin/finance/detail/:id" element={<DetailFinance />} />
        <Route path="/admin/finance/edit/:id" element={<EditFinance />} />

        {/* --- MODUL SEKOLAH --- */}
        <Route path="/sekolah/dashboard" element={<DashboardSekolah />} />
        <Route
          path="/sekolah/assessment/isi/:id"
          element={<IsiAssessmentSekolah />}
        />
         {/* --- MODUL SEKOLAH --- */}
        <Route path="/sekolah/dashboard" element={<DashboardSekolah />} />
        <Route
          path="/sekolah/assessment/isi/:id"
          element={<IsiAssessmentSekolah />}
        />
        <Route path="/sekolah/ProfilSekolah/:id" element={<ProfilSekolah />} />
        <Route path="/sekolah/ProfilSekolah" element={<ProfilSekolah />} />
        <Route path="/sekolah/ProgramKegiatan" element={<ProgramKegiatan />} />




         {/* --- MODUL pengurus --- */}        
        <Route path="/pengurus/dashboard" element={<DashboardPengurus />} />
        <Route path="/pengurus/dashboardsekolahpengurus" element={<DashboardSekolahPengurus />} />
        <Route path="/pengurus/dashboardkegiatanpengurus" element={<DashboardKegiatanPengurus/>} />



         {/* --- MODUL kadin --- */}        
        <Route path="/kadin/wilayahsekolah" element={<DashboardKadin/>} />
        <Route path="/kadin/dashboard" element={<DashboardKadin/>} />
        <Route path="/kadin/detailsekolahkadin/detail/:id" element={<DetailSekolahKadin/>} />


        {/* --- HO DASHBOARD (dipisah per jenis) --- */}
        <Route path="/ho/dashboard/akademik" element={<DashboardAkademik />} />
        <Route
          path="/ho/dashboard/non-akademik"
          element={<DashboardnonAkademik />}
        />

        {/* --- HO AKADEMIK --- */}
        <Route
          path="/ho/assessment/akademik"
          element={<ReadAssessmentAkademik />}
        />
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
        <Route path="/ho/program/akademik" element={<ReadProgramAkademik />} />
        <Route
          path="/ho/program/akademik/list/:id"
          element={<ListProgramAkademik />}
        />
        <Route
          path="/ho/program/akademik/create"
          element={<CreateProgramAkademik />}
        />
        <Route
          path="/ho/program/akademik/detail/:id"
          element={<DetailProgramAkademik />}
        />
        <Route
          path="/ho/program/akademik/edit/:id"
          element={<EditProgramAkademik />}
        />
        <Route
          path="/ho/penjadwalan/akademik"
          element={<CalendarOfEventakademik />}
        />

        {/* --- HO NON-AKADEMIK --- */}
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
        <Route
          path="/ho/program/non-akademik"
          element={<ReadProgramNonAkademik />}
        />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
