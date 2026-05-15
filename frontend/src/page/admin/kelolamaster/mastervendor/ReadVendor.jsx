/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Database,
  Handshake,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Tags,
  Phone,
  RotateCcw,
  LayoutGrid
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

const ReadVendor = () => {
  const navigate = useNavigate();

  // --- STATE DENGAN PERSISTENSI LOCAL STORAGE (Sesuai ReadPengurus) ---
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("vnd_filter_search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("vnd_filter_status") || "all"
  );
  const [pilarFilter, setPilarFilter] = useState(
    localStorage.getItem("vnd_filter_pilar") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("vnd_filter_page")) || 1
  );

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "Bermitra", label: "STATUS: BERMITRA" },
    { value: "Tidak Bermitra", label: "STATUS: NON-AKTIF" },
  ];

  const filterPilarOptions = [
    { value: "all", label: "SEMUA PILAR" },
    { value: "Akademik", label: "PILAR: AKADEMIK" },
    { value: "Karakter", label: "PILAR: KARAKTER" },
    { value: "Seni Budaya", label: "PILAR: SENI BUDAYA" },
    { value: "Kecakapan Hidup", label: "PILAR: KECAKAPAN" },
  ];

  // --- SIMPAN SETIAP PERUBAHAN KE LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("vnd_filter_search", searchTerm);
    localStorage.setItem("vnd_filter_status", statusFilter);
    localStorage.setItem("vnd_filter_pilar", pilarFilter);
    localStorage.setItem("vnd_filter_page", currentPage);
  }, [searchTerm, statusFilter, pilarFilter, currentPage]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Gagal memuat data mitra vendor" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const isBermitra = currentStatus === "Bermitra";
    const nextStatus = isBermitra ? "Tidak Bermitra" : "Bermitra";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/vendor/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchVendors();
      Toast.fire({
        icon: "success",
        title: `${name} kini ${nextStatus}`,
      });
    } catch {
      Toast.fire({ icon: "error", title: "Gagal memperbarui otoritas mitra" });
    }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = vendors
    .filter((v) => {
      const matchSearch =
        v.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.pj_1?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      const matchPilar = pilarFilter === "all" || v.pilar === pilarFilter;
      return matchSearch && matchStatus && matchPilar;
    })
    .sort((a, b) => b.id_vendor - a.id_vendor);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      header: "LEMBAGA VENDOR",
      align: "text-left w-[30%]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 py-2">
          <span className="font-black text-gray-800 uppercase text-[11px] leading-tight tracking-tight">
            {row.nama_vendor}
          </span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            REG: {row.no_register || "UNSET"}
          </span>
        </div>
      ),
    },
    {
      header: "BIDANG / PILAR",
      align: "text-center w-[20%]",
      render: (row) => (
        <div className="flex justify-center">
          <div className="text-left min-w-[100px]">
            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#0AC4E0]/5 text-[#0AC4E0] border border-[#0AC4E0]/10">
              {row.pilar?.toUpperCase() || "GENERAL"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "PENANGGUNG JAWAB",
      align: "text-left w-[25%]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 py-2">
          <span className="font-black text-gray-800 uppercase text-[11px] leading-tight">
            {row.pj_1 || "-"}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 leading-none">
            <Phone size={10} />
            <span className="text-[9px] font-bold">{row.telp_pj_1 || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-center w-[280px]",
      render: (row) => {
        const isBermitra = row.status === "Bermitra";
        return (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-4 text-left min-w-[180px]">
              {/* Action Group */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/admin/vendor/detail/${row.id_vendor}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0AC4E0] hover:bg-white rounded-lg transition-all active:scale-90"
                  title="View"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => navigate(`/admin/vendor/edit/${row.id_vendor}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-500 hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              {/* Toggle Status */}
              <div
                onClick={() => handleToggleStatus(row.id_vendor, row.nama_vendor, row.status)}
                className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-all"
              >
                <div
                  className={`relative w-8 h-4.5 rounded-full transition-all duration-500 p-0.5 ${isBermitra ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isBermitra ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isBermitra ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {isBermitra ? "Mitra" : "Inactive"}
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

                <div className="flex flex-col gap-1">
                  <Label
                    text="Educational Partner Registry"
                    className="!text-[8px] !text-[#0AC4E0] !font-black !italic uppercase tracking-widest"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Manajemen <span className="text-[#0AC4E0]">Mitra Vendor</span>
                  </h1>
                </div>
              </div>
              <Button
                text="REGISTRASI VENDOR"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/vendor/create")}
                className="!bg-[#0AC4E0] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95 transition-all"
              />
            </header>

            {/* BENTO CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Cari nama vendor atau penanggung jawab..."
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
                  icon={CheckCircle}
                  value={statusFilter}
                  items={filterStatusOptions}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <div className="w-56 leading-none">
                <Dropdown
                  icon={Tags}
                  value={pilarFilter}
                  items={filterPilarOptions}
                  onChange={(v) => {
                    setPilarFilter(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPilarFilter("all");
                  setCurrentPage(1);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:rotate-180 duration-500 shadow-sm border border-gray-200/50"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="px-4 py-2 bg-[#0AC4E0]/5 text-[#0AC4E0] rounded-lg border border-[#0AC4E0]/10 font-black text-[8px] uppercase tracking-widest w-fit">
              <Filter size={12} className="inline mr-2" /> Hasil Filter: {totalItems} Entities
            </div>
          </div>

          <div className="flex-1 px-10 pb-4 overflow-hidden flex flex-col">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-separate border-spacing-0"
              />
              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 opacity-20 text-gray-900">
                  <Database size={80} className="mb-4 text-slate-300" strokeWidth={1} />
                  <p className="mt-4 font-black uppercase tracking-widest text-slate-400">Data Tidak Ditemukan</p>
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
          font-size: 11px !important; 
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
          padding: 1.25rem 1.5rem !important; 
          border-bottom: 1px solid #F8FAFC !important; 
          vertical-align: middle !important;
        }
        tbody tr:last-child td { border-bottom: none !important; }
        tbody tr:hover td { background-color: #0AC4E0/5 !important; transition: all 0.2s ease; }
      `}} />
    </PageWrapper>
  );
};

export default ReadVendor;