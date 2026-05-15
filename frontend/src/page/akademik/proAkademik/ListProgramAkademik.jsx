/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import Search from "../../../components/Search";
import Dropdown from "../../../components/Dropdown";
import PageWrapper from "../../../components/PageWrapper";
import Label from "../../../components/Label";
import Pagination from "../../../components/Pagination";
import Table from "../../../components/Table";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Plus,
  LayoutGrid,
  UserCheck,
  Calendar,
  ChevronRight,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";

function ListProgramAkademik() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sekolahDetail, setSekolahDetail] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [masterUsers, setMasterUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const limit = 7;

  const filterOptions = [
    { label: "Semua Status", value: "Semua" },
    { label: "Aktif", value: "Aktif" },
    { label: "Draft", value: "Draft" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resProgram, resSekolah, resUsers] = await Promise.all([
        fetch("http://localhost:3000/program?kategori=AKADEMIK", { headers }),
        fetch(`http://localhost:3000/sekolah/${id}`, { headers }),
        fetch("http://localhost:3000/users/ho", { headers }),
      ]);

      const dataProgram = await resProgram.json();
      const dataSekolah = await resSekolah.json();
      const dataUsers = await resUsers.json();

      setSekolahDetail(dataSekolah);
      const pureUserArray = Array.isArray(dataUsers) ? dataUsers : dataUsers.data || [];
      setMasterUsers(pureUserArray);

      const schoolPrograms = (
        Array.isArray(dataProgram) ? dataProgram : dataProgram.data || []
      ).filter((p) => String(p.id_sekolah) === String(id));

      setPrograms(schoolPrograms);
    } catch (err) {
      console.error(err);
      toast.error("Gagal sinkronisasi data master.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredPrograms = programs
    .filter((p) => (filterStatus === "Semua" ? true : p.status_program === filterStatus))
    .filter((p) =>
      [p.nama_program, p.kode_program].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  const totalItems = filteredPrograms?.length || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const start = (page - 1) * limit;
  const currentData = filteredPrograms.slice(start, start + limit);

  const handleToggleStatus = async (programId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Aktif" ? "Draft" : "Aktif";
      const res = await fetch(`http://localhost:3000/program/${programId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_program: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status diperbarui ke ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      toast.error("Gagal update status");
    }
  };

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[70px]",
      render: (_, index) => (
        <span className="text-[12px] font-bold text-slate-300">
          {String(start + index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "PROGRAM AKADEMIK",
      align: "text-left",
      render: (row) => (
        <div className="flex flex-col gap-1 py-1 text-left">
          <span className="font-bold text-slate-800 text-[13.5px] tracking-tight leading-snug">
            {row.nama_program || "-"}
          </span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            {row.kode_program || "PGR-NEW"}
          </span>
        </div>
      ),
    },
    {
      header: "HO RESPONSIBLE",
      align: "text-left",
      render: (row) => {
        const pic = masterUsers.find((u) => String(u.id_user || u.id) === String(row.id_ho || row.dibuat_oleh));
        return (
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-[#0AC4E0] border border-slate-100 shadow-sm shrink-0">
              <UserCheck size={14} />
            </div>
            <span className="text-slate-600 text-[12px] font-semibold truncate max-w-[150px]">
              {pic ? pic.nama : row.user?.nama || "Unassigned"}
            </span>
          </div>
        );
      },
    },
    {
      header: "TAHUN",
      align: "text-center",
      render: (row) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 text-[11px] font-black rounded-lg border border-slate-100">
          <Calendar size={12} className="text-[#0AC4E0]" />
          {row.tahun || "-"}
        </div>
      ),
    },
    {
      header: "STATUS",
      align: "text-left",
      render: (row) => (
        <div className="flex items-center gap-2 text-left">
          <div className={`w-2 h-2 rounded-full ${row.status_program === "Aktif" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${row.status_program === "Aktif" ? "text-emerald-600" : "text-slate-400"}`}>
            {row.status_program || "Draft"}
          </span>
        </div>
      ),
    },
    {
      header: "AKSI",
      align: "text-right w-[160px]",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/ho/program/akademik/detail/${row.id_program}`)}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-[#0AC4E0] transition-all shadow-sm active:scale-90"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/ho/program/akademik/edit/${row.id_program}`)}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm active:scale-90"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id_program, row.status_program)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 border ${row.status_program === "Aktif"
              ? "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-500 hover:text-white"
              }`}
          >
            {row.status_program === "Aktif" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Loading Data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative leading-none">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[100px] -z-10" />

        <div className="flex-1 flex flex-col px-6 md:px-10 pt-10 pb-4 overflow-hidden leading-none">

          {/* PROFESSIONAL HEADER SECTION */}
          <header className="flex flex-row items-center justify-between mb-10 animate-in fade-in duration-1000 leading-none">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Button
                  icon={<ArrowLeft size={18} />}
                  variant="outline"
                  onClick={() => navigate("/ho/program/akademik")}
                  className="!w-10 !h-10 !flex !items-center !justify-center !bg-white !border-slate-100 !rounded-full hover:!bg-[#0AC4E0] hover:!text-white transition-all shadow-sm group active:scale-90 shrink-0"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
                    <Label
                      text="Sistem Pemantauan dan Evaluasi Program"
                      className="!text-[10px] !font-black !uppercase !tracking-[0.3em] !text-slate-400 !mb-0"
                    />
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight">
                    {sekolahDetail?.nama_sekolah || "Detail Sekolah"} <span className="text-[#0AC4E0]">Akademik</span>
                  </h1>
                </div>
              </div>
            </div>

            <Button
              text="Tambah Program"
              icon={<Plus size={18} />}
              onClick={() => navigate("/ho/program/akademik/create")}
              className="!bg-slate-900 hover:!bg-[#0AC4E0] !text-white !rounded-2xl !px-8 !py-4 !text-sm !font-bold shadow-xl transition-all duration-300 active:scale-95 leading-none border-none"
            />
          </header>

          {/* Floating Control Bar Island */}
          <div className="bg-white/80 backdrop-blur-2xl border border-slate-100 p-3 rounded-[2.2rem] shadow-sm flex flex-col md:flex-row items-center gap-4 mb-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative flex-1 w-full">
              <Search
                placeholder="Cari nama program atau kode program..."
                className="!bg-slate-50/50 !border-none !rounded-full !py-4 !pl-12 !text-[14px] !font-semibold !text-slate-700 focus:!ring-2 focus:!ring-[#0AC4E0]/10 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-100" />

            <div className="w-full md:w-56">
              <Dropdown
                items={filterOptions}
                value={filterStatus}
                onChange={(val) => { setFilterStatus(val); setPage(1); }}
                className="!bg-slate-50/50 !border-none !rounded-full !py-3.5 !text-[12px] !font-bold !text-slate-600 shadow-none"
              />
            </div>

            <div className="px-6 py-4 bg-white rounded-full flex items-center gap-3 border border-[#0AC4E0]/20 shrink-0 shadow-sm">
              <LayoutGrid size={16} className="text-[#0AC4E0]" />
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{totalItems} Data</span>
            </div>
          </div>

          {/* Table Container Bento */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-separate border-spacing-0"
              />

              {totalItems === 0 && (
                <div className="flex flex-col items-center justify-center py-44 opacity-20">
                  <LayoutGrid size={64} className="text-slate-300" strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-[0.3em] mt-6 text-slate-400">
                    Data tidak tersedia
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Footer Island */}
          <footer className="mt-6 flex justify-center py-4 bg-white/40 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-full max-w-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                onPageChange={setPage}
                totalItems={totalItems}
                itemsPerPage={limit}
                className="!gap-1"
              />
            </div>
          </footer>
        </div>
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

        /* MacBook Table Header Styling */
        table { border-collapse: separate; border-spacing: 0; width: 100%; }
        
        thead th { 
          background-color: #0AC4E0 !important; 
          color: white !important; 
          font-size: 11px !important; 
          font-weight: 800 !important; 
          text-transform: uppercase !important;
          letter-spacing: 0.12em !important; 
          padding: 1.5rem 1.5rem !important;
          position: sticky;
          top: 0;
          z-index: 20;
          border: none !important;
          text-align: center !important;
        }
        
        thead th:first-child { border-top-left-radius: 2.4rem !important; }
        thead th:last-child { border-top-right-radius: 2.4rem !important; }

        tbody td { 
          padding: 1.25rem 1.5rem !important; 
          border-bottom: 1px solid #F8FAFC !important; 
          vertical-align: middle !important;
        }
        tbody tr:last-child td { border-bottom: none !important; }
        tbody tr:hover td { background-color: #0AC4E0/5 !important; transition: background 0.3s ease; }
      `}} />
    </PageWrapper>
  );
}

export default ListProgramAkademik;