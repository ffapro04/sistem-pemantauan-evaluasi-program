/* eslint-disable no-unused-vars */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import Search from "../../../components/Search";
import Table from "../../../components/Table";
import Toggle from "../../../components/Toggle";
import Dropdown from "../../../components/Dropdown";
import PageWrapper from "../../../components/PageWrapper";
import Label from "../../../components/Label";
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Send,
  ClipboardCheck,
  FileText,
  Sparkles,
  Plus,
  Users,
  Clock,
  School,
  History,
  LayoutGrid
} from "lucide-react";

import { useState, useEffect } from "react";

function ReadAssessmentAkademik() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("aktif");
  const [toggling, setToggling] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const start = (page - 1) * limit;

  const hitungRemaining = (sent_at, tenggat) => {
    if (!sent_at) return "-";
    const deadline = new Date(sent_at);
    deadline.setDate(deadline.getDate() + (tenggat ?? 7));
    const now = new Date();
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} Hari Lagi` : "Tenggat Habis";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const id_ho = decoded.sub;

      const res = await fetch(
        `http://localhost:3000/assessment?jenis=akademik&id_ho=${id_ho}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal");

      const mapped = data.map((item) => ({
        id: item.id_assessment,
        nama: item.nama ?? "-",
        ho: item.ho ?? "-",
        sekolah: item.daftar_sekolah ?? "-",
        jumlah_pengisi: item.jumlah_pengisi ?? item.jumlah_guru_mengisi ?? 0,
        sent: item.status === "Proses Pengisian",
        sent_at: item.sent_at,
        tenggat: item.tenggat ?? 7,
        aktif: item.aktif ?? true,
      }));

      setAssessments(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat riwayat assessment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssessments = assessments
    .filter((item) => {
      if (filterStatus === "aktif") return item.aktif;
      if (filterStatus === "nonaktif") return !item.aktif;
      return true;
    })
    .filter((item) =>
      [item.nama, item.ho, item.sekolah]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const currentData = filteredAssessments.slice(start, start + limit);
  const totalPages = Math.ceil(filteredAssessments.length / limit) || 1;

  const handleSend = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/assessment/${id}/send`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      toast.success("Assessment berhasil dikirim!");
      fetchData();
    } catch (err) {
      toast.error("Gagal mengirim assessment");
    }
  };

  const handleToggleAktif = async (id) => {
    try {
      if (toggling[id]) return;
      setToggling((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/assessment/${id}/toggle-aktif`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      setAssessments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, aktif: !item.aktif } : item))
      );
    } catch (err) {
      toast.error("Gagal mengubah status aktif");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filterOptions = [
    { label: "Seluruh Data", value: "semua" },
    { label: "Status Aktif", value: "aktif" },
    { label: "Status Nonaktif", value: "nonaktif" },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 flex flex-col px-8 pt-10 pb-4 overflow-hidden leading-none gap-8">

          <header className="flex flex-row items-center justify-between animate-in fade-in duration-1000 leading-none">
            <div className="space-y-3">
              {/* Sub-label dengan penanda aksen bar vertikal */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Sistem Pemantauan dan Evaluasi Program
                </span>
              </div>

              {/* Judul Utama */}
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                Riwayat Assessment <span className="text-[#0AC4E0]">Akademik</span>
              </h1>
            </div>

            {/* Menggunakan Component Button.jsx */}
            <Button
              text="Buat Assessment"
              icon={<Plus size={18} />}
              onClick={() => navigate("/ho/assessment/akademik/create")}
              className="!bg-slate-800 hover:!bg-[#0AC4E0] !text-white !rounded-2xl !px-8 !py-4 !text-sm !font-bold shadow-xl transition-all duration-300 active:scale-95 leading-none"
            />
          </header>

          {/* BENTO CONTROL BAR */}
          <div className="bg-white/80 backdrop-blur-3xl border border-gray-100 p-3 rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-full border border-gray-100 shrink-0">
              <ClipboardCheck size={16} className="text-[#0AC4E0]" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{filteredAssessments.length} Dokumen</span>
            </div>

            <div className="relative flex-1 group">
              <Search
                placeholder="Cari assessment, ho, atau sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!pl-12 !pr-4 !py-4 !bg-transparent !border-none !rounded-full !text-[14px] !font-semibold focus:!ring-0 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="h-8 w-px bg-gray-100" />

            <div className="w-56">
              <Dropdown
                items={filterOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                className="!bg-transparent !border-none !rounded-full !py-3.5 !text-[12px] !font-bold !text-slate-500"
              />
            </div>
          </div>

          {/* TABLE CONTAINER - WITH BLUE FRAME & BLUE HEADER */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Table
                columns={[
                  {
                    header: "NO",
                    align: "text-center w-16",
                    render: (_, idx) => (
                      <span className="text-slate-300 text-xs font-bold font-mono">
                        {String(start + idx + 1).padStart(2, '0')}
                      </span>
                    ),
                  },
                  {
                    header: "NAMA ASSESSMENT",
                    render: (row) => (
                      <div className="flex flex-col gap-1 py-1">
                        <span className="font-bold text-slate-800 text-[13.5px] tracking-tight leading-snug">{row.nama}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${row.aktif ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akademik</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "PERSONIL HO",
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0AC4E0] border border-gray-100">
                          <Users size={14} />
                        </div>
                        <span className="text-slate-600 text-xs font-bold">{row.ho}</span>
                      </div>
                    )
                  },
                  {
                    header: "INSTITUSI TUJUAN",
                    render: (row) => {
                      const daftarSekolah = row.sekolah && row.sekolah !== "-" ? row.sekolah.split(",") : [];
                      return (
                        <div className="flex flex-wrap gap-1.5 max-w-[220px] py-1">
                          {daftarSekolah.length > 0 ? (
                            daftarSekolah.map((nama, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-[#0AC4E0]/5 text-[#0AC4E0] rounded-lg text-[9px] font-black uppercase tracking-tight border border-[#0AC4E0]/10">
                                {nama.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">Empty</span>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    header: "PROGRESS",
                    align: "text-center",
                    render: (row) => (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-slate-700 text-xs font-black">{row.jumlah_pengisi} Guru</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0AC4E0]" style={{ width: row.jumlah_pengisi > 0 ? '100%' : '0%' }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "DEADLINE",
                    align: "text-center",
                    render: (row) => (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-gray-100">
                        <Clock size={12} className={row.sent_at ? "text-[#0AC4E0]" : "text-slate-300"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${row.sent_at ? "text-slate-700" : "text-slate-400"}`}>
                          {row.sent_at ? hitungRemaining(row.sent_at, row.tenggat) : `${row.tenggat} Hari`}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: "AKSI KONTROL",
                    align: "text-right w-48",
                    render: (row) => (
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => navigate(`/ho/assessment/akademik/detail/${row.id}`)}
                          className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-gray-100 rounded-xl text-slate-400 hover:text-[#0AC4E0] transition-all shadow-sm active:scale-90"
                        >
                          <Eye size={16} />
                        </button>

                        {!row.sent && (
                          <button
                            onClick={() => navigate(`/ho/assessment/akademik/edit/${row.id}`)}
                            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-gray-100 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm active:scale-90"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        {!row.sent && (
                          <button
                            onClick={() => handleSend(row.id)}
                            className="w-9 h-9 flex items-center justify-center bg-[#0AC4E0] hover:bg-[#09b3cc] rounded-xl text-white transition-all shadow-lg shadow-[#0AC4E0]/20 active:scale-90"
                          >
                            <Send size={15} />
                          </button>
                        )}

                        <div className="ml-2 pl-2 border-l border-gray-100">
                          <Toggle
                            checked={row.aktif}
                            onChange={() => handleToggleAktif(row.id)}
                            disabled={toggling[row.id]}
                          />
                        </div>
                      </div>
                    ),
                  },
                ]}
                data={currentData}
                className="min-w-full border-separate border-spacing-0"
              />

              {filteredAssessments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 opacity-20">
                  <LayoutGrid size={64} className="text-slate-300" strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-[0.3em] mt-6 text-slate-400">Data Tidak Ditemukan</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINATION FOOTER */}
          <footer className="mt-2 flex justify-center py-5 bg-white/60 backdrop-blur-xl rounded-[2.2rem] border border-gray-100 shadow-sm leading-none shrink-0">
            <div className="w-full max-w-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredAssessments.length}
                itemsPerPage={limit}
                onPageChange={setPage}
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
          from { opacity: 0; transform: translateY(15px); }
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
        
        thead th:first-child { border-top-left-radius: 2.2rem !important; }
        thead th:last-child { border-top-right-radius: 2.2rem !important; }

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
}

export default ReadAssessmentAkademik;