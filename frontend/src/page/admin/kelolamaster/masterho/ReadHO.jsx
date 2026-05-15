/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Building2,
  Database,
  UserCheck,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Users,
  Sparkles,
  LayoutGrid,
  Mail,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadHO = () => {
  // --- STATE DENGAN PERSISTENSI LOCAL STORAGE (Sesuai Konsep ReadPengurus) ---
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("ho_filter_search") || ""
  );
  const [filterDept, setFilterDept] = useState(
    localStorage.getItem("ho_filter_dept") || "all"
  );
  const [filterTingkat, setFilterTingkat] = useState(
    localStorage.getItem("ho_filter_tingkat") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("ho_filter_page")) || 1
  );

  const [hos, setHos] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const filterDeptOptions = [
    { value: "all", label: "SEMUA DEPARTMENT" },
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const filterTingkatOptions = [
    { value: "all", label: "SEMUA TINGKAT" },
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  // --- SIMPAN SETIAP PERUBAHAN KE LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("ho_filter_search", searchTerm);
    localStorage.setItem("ho_filter_dept", filterDept);
    localStorage.setItem("ho_filter_tingkat", filterTingkat);
    localStorage.setItem("ho_filter_page", currentPage);
  }, [searchTerm, filterDept, filterTingkat, currentPage]);

  const fetchHO = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/users/ho", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter role HO (ID 3)
      const data = response.data.filter((u) => {
        const actualRoleId = u.id_role || (u.role && u.role.id_role);
        return Number(actualRoleId) === 3;
      });

      setHos(data);
    } catch (error) {
      console.error("Fetch HO Error:", error);
      Toast.fire({ icon: "error", title: "Gagal memuat data Head Office" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHO();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !(currentStatus === true || currentStatus === "true" || Number(currentStatus) === 1);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/users/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchHO();
      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({ icon: "error", title: "Gagal update otoritas" });
    }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = hos
    .filter((ho) => {
      const matchesSearch =
        ho.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ho.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "all" ? true : ho.jenis === filterDept;
      const matchesTingkat = filterTingkat === "all" ? true : ho.sub_jenis === filterTingkat;
      return matchesSearch && matchesDept && matchesTingkat;
    })
    .sort((a, b) => b.id_user - a.id_user);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[80px]", // Header Tengah
      render: (_, i) => (
        <div className="flex justify-center"> {/* Container Tengah */}
          <span className="text-left font-mono text-[12px] font-bold text-slate-300 min-w-[25px]">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS HEAD OFFICE",
      align: "text-center w-[30%]", // Header Tengah
      render: (row) => (
        <div className="flex justify-center py-1"> {/* Container Tengah */}
          <div className="text-left flex flex-col gap-1 min-w-[180px]"> {/* Teks Kiri */}
            <span className="font-bold text-slate-800 text-[13.5px] tracking-tight leading-none uppercase">
              {row.nama}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 leading-none">
              <Mail size={10} />
              <span className="text-[10px] font-medium lowercase">{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "DEPARTMENT & BIDANG",
      align: "text-center w-[30%]", // Header Tengah
      render: (row) => (
        <div className="flex justify-center"> {/* Container Tengah */}
          <div className="text-left flex items-center gap-2 min-w-[160px]"> {/* Teks Kiri */}
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${row.jenis === "akademik" ? "bg-[#0AC4E0]/10 text-[#0AC4E0]" : "bg-emerald-50 text-emerald-600"
              }`}>
              {row.jenis || "UMUM"}
            </span>
            {row.sub_jenis && (
              <div className="flex items-center gap-2 leading-none">
                <ChevronRight size={12} className="text-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase">{row.sub_jenis}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "AKSI KONTROL",
      align: "text-center w-[280px]", // Header Tengah
      render: (row) => {
        const isActive = row.status === true || row.status === "true" || Number(row.status) === 1;
        return (
          <div className="flex justify-center py-1"> {/* Container Tengah */}
            <div className="flex items-center gap-4 text-left min-w-[210px]"> {/* Konten Kiri */}
              {/* Action Group */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate(`/admin/ho/detail/${row.id_user}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0AC4E0] hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Detail"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => navigate(`/admin/ho/edit/${row.id_user}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-500 hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              {/* Toggle Status Group */}
              <div
                onClick={() => handleToggleStatus(row.id_user, row.nama, row.status)}
                className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all select-none"
              >
                <div className={`relative w-8 h-4.5 rounded-full transition-all duration-500 p-0.5 ${isActive ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-slate-200"
                  }`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? "translate-x-3.5" : "translate-x-0"
                    }`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest w-12 ${isActive ? "text-emerald-600" : "text-slate-400"
                  }`}>
                  {isActive ? "Aktif" : "Off"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-10 pt-10 pb-6">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden relative leading-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[100px] -z-10" />

          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 leading-none">
                  <Label
                    text="Sistem Pemantauan dan Evaluasi Program"
                    className="!text-[8px] !text-[#0AC4E0] !font-black !italic uppercase tracking-widest"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Manajemen Data <span className="text-[#0AC4E0]">Head Office</span>
                  </h1>
                </div>
              </div>
              <Button
                text="TAMBAH PERSONEL"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/ho/create")}
                className="!bg-[#0AC4E0] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95 transition-all"
              />
            </header>

            {/* BENTO CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-3 mb-6 leading-none">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Cari nama atau email ho..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-3 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[11px] font-bold focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/10 transition-all outline-none"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0AC4E0] transition-colors"
                  size={16}
                />
              </div>
              <div className="w-56 leading-none">
                <Dropdown
                  icon={Users}
                  value={filterDept}
                  items={filterDeptOptions}
                  onChange={(v) => {
                    setFilterDept(v);
                    setFilterTingkat("all");
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <div className="w-56 leading-none">
                <Dropdown
                  icon={CheckCircle}
                  value={filterTingkat}
                  items={filterTingkatOptions}
                  disabled={filterDept !== "akademik"}
                  onChange={(v) => {
                    setFilterTingkat(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDept("all");
                  setFilterTingkat("all");
                  setCurrentPage(1);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:rotate-180 duration-500 shadow-sm border border-gray-200/50"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="px-4 py-2 bg-[#0AC4E0]/5 text-[#0AC4E0] rounded-lg border border-[#0AC4E0]/10 font-black text-[8px] uppercase tracking-widest w-fit leading-none">
              <Filter size={12} className="inline mr-2" /> Hasil Filter: {totalItems} Personnel
            </div>
          </div>

          <div className="flex-1 px-10 pb-4 overflow-hidden flex flex-col">
            <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden no-scrollbar">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-separate border-spacing-0"
              />
              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 opacity-20 text-gray-900">
                  <LayoutGrid size={64} className="mb-4" strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-widest">Data Tidak Ditemukan</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-10 py-5 mt-auto border-t border-gray-50 bg-gray-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
              className="!gap-1"
            />
          </div>
        </Card>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* MacBook Style Table Customization */
        table { border-collapse: separate; border-spacing: 0; width: 100%; }
        
        thead th { 
          background-color: #0AC4E0 !important; 
          color: white !important; 
          font-size: 10px !important; 
          font-weight: 900 !important; 
          text-transform: uppercase !important;
          letter-spacing: 0.12em !important; 
          padding: 1.5rem 1.5rem !important;
          border: none !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        thead th:first-child { border-top-left-radius: 1.8rem !important; }
        thead th:last-child { border-top-right-radius: 1.8rem !important; }

        tbody td { 
          padding: 1rem 1.5rem !important; 
          border-bottom: 1px solid #F8FAFC !important; 
          vertical-align: middle !important;
        }
        tbody tr:last-child td { border-bottom: none !important; }
        tbody tr:hover td { background-color: #0AC4E0/5 !important; transition: all 0.2s ease; }
      `}} />
    </PageWrapper>
  );
};

export default ReadHO;