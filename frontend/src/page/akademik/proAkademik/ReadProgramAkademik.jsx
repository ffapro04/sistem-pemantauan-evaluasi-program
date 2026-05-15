/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Layers,
  ChevronRight,
  Filter,
  School,
  ArrowRight,
  ShieldCheck,
  Database,
  LayoutGrid,
  Search as SearchIcon
} from "lucide-react";

// PEMANGGILAN COMPONENTS KONSISTEN
import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Pagination from "../../../components/Pagination";
import Dropdown from "../../../components/Dropdown";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Search from "../../../components/Search";
import Label from "../../../components/Label";

function ReadProgramAkademik() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterWilayah, setFilterWilayah] = useState("Semua");
  const [programs, setPrograms] = useState([]);
  const [sekolahs, setSekolahs] = useState([]);
  const [loading, setLoading] = useState(true);

  const limit = 6;
  const start = (page - 1) * limit;

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch sekolah dan program akademik secara paralel
      const [resSekolah, resProgram] = await Promise.all([
        fetch("http://localhost:3000/sekolah", { headers }),
        fetch("http://localhost:3000/program?kategori=AKADEMIK", { headers })
      ]);

      const dataSekolah = await resSekolah.json();
      const dataProgram = await resProgram.json();

      setSekolahs(Array.isArray(dataSekolah) ? dataSekolah : []);
      setPrograms(Array.isArray(dataProgram) ? dataProgram : []);
    } catch (err) {
      toast.error("Gagal sinkronisasi data master.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Mapping Logic
  const filteredData = sekolahs.filter(s =>
    (filterWilayah === "Semua" || s.wilayah?.nama_wilayah === filterWilayah) &&
    [s.nama_sekolah, s.npsn].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const schoolsArray = filteredData.map(sekolah => {
    const matchedPrograms = programs.filter(p => String(p.id_sekolah) === String(sekolah.id_sekolah));
    return {
      ...sekolah,
      aktif_count: matchedPrograms.filter(p => p.status_program === 'Aktif').length || 0,
      draft_count: matchedPrograms.filter(p => p.status_program === 'Draft').length || 0,
    };
  });

  const currentData = schoolsArray.slice(start, start + limit);
  const totalItems = schoolsArray.length || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const uniqueWilayahs = [...new Set(sekolahs.map(s => s.wilayah?.nama_wilayah).filter(Boolean))];
  const filterOptions = [
    { label: "Seluruh Wilayah", value: "Semua" },
    ...uniqueWilayahs.map(w => ({ label: w.split("/").pop().toUpperCase(), value: w }))
  ];

  return (
    <PageWrapper className="h-screen bg-[#F8FAFC] flex overflow-hidden !p-0 font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* ─── HEADER AREA (DISAMAKAN DENGAN NON-AKADEMIK) ─── */}
        <div className="px-12 pt-12 pb-8 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-6 bg-[#0AC4E0] rounded-full" />
                <Label
                  text="Sistem Pemantauan dan Evaluasi Program"
                  className="!text-[11px] !font-black !uppercase !tracking-[0.3em] !text-slate-400 !mb-0"
                />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Program <span className="text-[#0AC4E0]">Akademik</span>
              </h1>
            </div>

            <Button
              text="Inisiasi Program"
              icon={<Plus size={18} strokeWidth={3} />}
              onClick={() => navigate("/ho/program/akademik/create")}
              className="!bg-[#0AC4E0] hover:!bg-[#08b0c9] !text-white !rounded-2xl !px-8 !py-4 !text-xs !font-black !uppercase !tracking-widest shadow-lg shadow-[#0AC4E0]/20 transition-all active:scale-95 border-none"
            />
          </div>

          {/* CONTROL BAR */}
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Search
                placeholder="Cari NPSN atau Nama Institusi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="!text-[#0AC4E0] !font-black"
              />
            </div>

            <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl px-6 py-1 h-[58px] shadow-sm">
              <Filter size={16} className="text-slate-400 mr-4" />
              <Dropdown
                items={filterOptions}
                value={filterWilayah}
                onChange={(val) => {
                  setFilterWilayah(val);
                  setPage(1);
                }}
                className="!bg-transparent !border-none !text-[11px] !font-black !uppercase !tracking-widest !text-slate-500 !py-0"
              />
            </div>

            <div className="flex items-center bg-slate-900 rounded-2xl px-8 py-1 h-[58px] shadow-xl">
              <Database size={16} className="text-[#0AC4E0] mr-4" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">{totalItems} Entitas</span>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-12 py-10 no-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">
              Sinkronisasi Data...
            </div>
          ) : currentData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <LayoutGrid size={80} className="text-slate-300" strokeWidth={1} />
              <p className="mt-4 font-black uppercase tracking-widest text-slate-400">Data Tidak Ditemukan</p>
            </div>
          ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {currentData.map((item) => (
                    <Card
                      key={item.id_sekolah}
                      className="group !bg-white !rounded-[2.5rem] !p-10 border-2 border-slate-50 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(10,196,224,0.06)] hover:border-[#0AC4E0]/30 transition-all duration-700 flex flex-col h-[420px] relative overflow-hidden"
                    >
                      <School size={120} className="absolute -bottom-6 -right-6 text-slate-50 group-hover:text-[#0AC4E0]/5 transition-colors duration-700 pointer-events-none" />

                  <div className="flex justify-between items-start mb-8 z-10">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 p-1 group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={`https://ui-avatars.com/api/?name=${item.nama_sekolah}&background=F5F5F7&color=0AC4E0&bold=true&size=128`}
                        alt="logo"
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>

                    <div className="flex gap-2 leading-none">
                      <div className="flex flex-col items-center px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-black text-emerald-600">{item.aktif_count}</span>
                        <span className="text-[7px] font-bold text-emerald-400 uppercase">Aktif</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-black text-slate-600">{item.draft_count}</span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase">Draft</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-auto z-10 text-left">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-2">NPSN: {item.npsn}</p>
                    <h3 className="text-2xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-[#0AC4E0] transition-colors">
                      {item.nama_sekolah}
                    </h3>
                  </div>

                  <div className="pt-8 border-t border-slate-100 z-10 mt-6">
                    <button
                      onClick={() => navigate(`/ho/program/akademik/list/${item.id_sekolah}`)}
                      className="w-full flex items-center justify-between group/btn"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 group-hover/btn:text-[#0AC4E0] transition-colors">Akses Detail Program</span>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover/btn:bg-[#0AC4E0] group-hover/btn:text-white transition-all shadow-sm">
                        <ArrowRight size={16} />
                      </div>
                    </button>
                  </div>
                </Card>
              ))}
                </div>
          )}
        </div>

        {/* PAGINATION AREA */}
        <div className="px-12 py-8 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Menampilkan {currentData.length} dari {totalItems} Institusi
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="!gap-3"
          />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </PageWrapper>
  );
}

export default ReadProgramAkademik;