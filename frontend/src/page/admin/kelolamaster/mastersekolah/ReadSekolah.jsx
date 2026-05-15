/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search as SearchIcon,
  School,
  MapPin,
  Database,
  Filter,
  Award,
  Eye,
  Edit3,
  Trash2,
  Globe,
  Sparkles,
  LayoutGrid,
  ChevronRight,
  RotateCcw,
  CheckCircle
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

const ReadSekolah = () => {
  const navigate = useNavigate();

  // --- STATE DENGAN PERSISTENSI LOCAL STORAGE ---
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("sch_filter_search") || ""
  );
  const [filterWilayah, setFilterWilayah] = useState(
    localStorage.getItem("sch_filter_wilayah") || "all"
  );
  const [filterAkreditasi, setFilterAkreditasi] = useState(
    localStorage.getItem("sch_filter_akred") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("sch_filter_page")) || 1
  );

  const [sekolah, setSekolah] = useState([]);
  const [listWilayah, setListWilayah] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const filterAkreditasiOptions = [
    { value: "all", label: "SEMUA AKREDITASI" },
    { value: "A", label: "GRADE: A" },
    { value: "B", label: "GRADE: B" },
    { value: "C", label: "GRADE: C" },
  ];

  // --- SIMPAN SETIAP PERUBAHAN KE LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("sch_filter_search", searchTerm);
    localStorage.setItem("sch_filter_wilayah", filterWilayah);
    localStorage.setItem("sch_filter_akred", filterAkreditasi);
    localStorage.setItem("sch_filter_page", currentPage);
  }, [searchTerm, filterWilayah, filterAkreditasi, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [resSekolah, resWilayah] = await Promise.all([
        axios.get("http://localhost:3000/sekolah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSekolah(resSekolah.data);
      setListWilayah(resWilayah.data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !(currentStatus === true || currentStatus === "true" || Number(currentStatus) === 1);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/sekolah/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({ icon: "error", title: "Gagal memperbarui otoritas unit" });
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus Unit Sekolah?",
      text: `Unit ${name} akan dihapus permanen dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F43F5E",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: { popup: "rounded-[2.5rem] border-none shadow-2xl" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.fire({ icon: "success", title: "Unit berhasil dihapus" });
        fetchData();
      } catch (err) {
        Toast.fire({ icon: "error", title: "Gagal menghapus data" });
      }
    }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = sekolah
    .filter((s) => {
      const matchSearch = s.nama_sekolah?.toLowerCase().includes(searchTerm.toLowerCase()) || s.npsn?.includes(searchTerm);
      const matchWilayah = filterWilayah === "all" || s.wilayah?.nama_wilayah === filterWilayah;
      const matchAkreditasi = filterAkreditasi === "all" || s.akreditasi === filterAkreditasi;
      return matchSearch && matchWilayah && matchAkreditasi;
    })
    .sort((a, b) => b.id_sekolah - a.id_sekolah);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const wilayahOptions = [
    { value: "all", label: "SEMUA WILAYAH" },
    ...listWilayah.map((w) => ({
      value: w.nama_wilayah,
      label: w.nama_wilayah.split("/").filter(Boolean).pop().toUpperCase(),
    })),
  ];

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[80px]",
      render: (_, i) => (
        <div className="flex justify-center">
          <span className="text-left font-mono text-[10px] font-bold text-gray-400 min-w-[20px]">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "NPSN",
      align: "text-center w-[120px]",
      render: (row) => (
        <div className="flex justify-center">
          <span className="text-[11px] font-mono font-black text-white bg-slate-800 px-2 py-1 rounded-md tracking-widest leading-none">
            {row.npsn || "00000000"}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS INSTITUSI",
      align: "text-left w-[25%]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 py-2">
          <span className="font-black text-gray-800 uppercase text-[11px] leading-tight tracking-tight truncate max-w-[200px]">
            {row.nama_sekolah}
          </span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
            {row.jenjang} EDUCATION
          </span>
        </div>
      ),
    },
    {
      header: "HUB WILAYAH",
      align: "text-left w-[20%]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 py-2">
          <div className="flex items-center gap-1.5 leading-none">
            <MapPin size={10} className="text-[#0AC4E0] shrink-0" />
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight leading-none">
              {row.wilayah?.nama_wilayah?.split("/").filter(Boolean).pop() || "PUSAT"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "AKREDITASI",
      align: "text-center w-[15%]",
      render: (row) => (
        <div className="flex justify-center">
          <div className="text-left min-w-[80px]">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${row.akreditasi
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
              {row.akreditasi ? `Grade ${row.akreditasi}` : "Proses"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "AKSI KONTROL",
      align: "text-center w-[280px]",
      render: (row) => {
        const isActive = row.status === true || row.status === "true" || Number(row.status) === 1;
        return (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-4 text-left min-w-[200px]">
              {/* Action Group */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/admin/sekolah/detail/${row.id_sekolah}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0AC4E0] hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Detail"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => navigate(`/admin/sekolah/edit/${row.id_sekolah}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-500 hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(row.id_sekolah, row.nama_sekolah)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100 shrink-0" />

              {/* Toggle Status */}
              <div
                onClick={() => handleToggleStatus(row.id_sekolah, row.nama_sekolah, row.status)}
                className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-all"
              >
                <div
                  className={`relative w-8 h-4.5 rounded-full transition-all duration-500 p-0.5 ${isActive ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
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
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-10 pt-10 pb-6">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden relative leading-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[100px] -z-10" />

          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="relative group leading-none">
                  <div className="absolute -inset-1 bg-[#0AC4E0] rounded-2xl blur opacity-20 group-hover:opacity-40 transition animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-[#0AC4E0] to-[#09b3cc] rounded-2xl text-white shadow-xl">
                    <School size={24} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 leading-none">
                  <Label
                    text="Educational Hub Management System"
                    className="!text-[8px] !text-[#0AC4E0] !font-black !italic uppercase tracking-widest"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Master Data <span className="text-[#0AC4E0]">Unit Sekolah</span>
                  </h1>
                </div>
              </div>
              <Button
                text="TAMBAH UNIT BARU"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/sekolah/create")}
                className="!bg-[#0AC4E0] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95 transition-all"
              />
            </header>

            {/* BENTO CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-3 mb-6 leading-none">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Cari nama institusi atau NPSN..."
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
                  icon={Globe}
                  value={filterWilayah}
                  items={wilayahOptions}
                  onChange={(v) => {
                    setFilterWilayah(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <div className="w-56 leading-none">
                <Dropdown
                  icon={Award}
                  value={filterAkreditasi}
                  items={filterAkreditasiOptions}
                  onChange={(v) => {
                    setFilterAkreditasi(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterWilayah("all");
                  setFilterAkreditasi("all");
                  setCurrentPage(1);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:rotate-180 duration-500 shadow-sm border border-gray-200/50"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="px-4 py-2 bg-[#0AC4E0]/5 text-[#0AC4E0] rounded-lg border border-[#0AC4E0]/10 font-black text-[8px] uppercase tracking-widest w-fit leading-none">
              <Filter size={12} className="inline mr-2" /> Hasil Filter: {totalItems} Units
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
                  <Database size={64} className="mb-4" strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-widest">Data Tidak Ditemukan</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-10 py-5 mt-auto border-t border-gray-100 bg-gray-50/30">
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
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

export default ReadSekolah;