/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import Sidebar from "../../../components/Sidebar";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Search from "../../../components/Search";
import Dropdown from "../../../components/Dropdown";
import PageWrapper from "../../../components/PageWrapper";
import Label from "../../../components/Label";
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileText,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  X,
  School,
  ArrowRight,
  BookOpen,
  User,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";

function ReadProgramnonAkademik() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterWilayah, setFilterWilayah] = useState("Semua");
  const [programs, setPrograms] = useState([]);
  const [sekolahs, setSekolahs] = useState([]);
const [selectedSchool, setSelectedSchool] = useState(null); 
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const limit = 12;
  const start = (page - 1) * limit;
  const end = start + limit;

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Aktif" ? "Draft" : "Aktif";

      const res = await fetch(`http://localhost:3000/program/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_program: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status");

      toast.success(`Status program berhasil diubah menjadi ${newStatus}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status program");
    }
  };

  const openDrawer = (school) => {
  setSelectedSchool(school);
  setIsDrawerOpen(true);
};

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [resProgram, resSekolah] = await Promise.all([
        fetch("http://localhost:3000/program?kategori=NON_AKADEMIK", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/sekolah", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!resProgram.ok || !resSekolah.ok) throw new Error("Gagal mengambil data");

      const dataProgram = await resProgram.json();
      const dataSekolah = await resSekolah.json();
      
      setPrograms(Array.isArray(dataProgram) ? dataProgram : []);
      setSekolahs(Array.isArray(dataSekolah) ? dataSekolah : []);
      
      // Sinkronisasi data selectedSchool jika drawer sedang terbuka
      if (selectedSchool) {
        const updatedSchool = (Array.isArray(dataSekolah) ? dataSekolah : []).find(s => s.id_sekolah === selectedSchool.id_sekolah);
        if (updatedSchool) {
          const matchedPrograms = (Array.isArray(dataProgram) ? dataProgram : []).filter(p => p.sekolah === updatedSchool.nama_sekolah);
          setSelectedSchool({
            ...updatedSchool,
            program_list: matchedPrograms,
            total_program: matchedPrograms.length
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data master.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Master Sekolah
  const filteredSekolahs = sekolahs
    .filter((s) => {
      if (filterWilayah === "Semua") return true;
      return s.wilayah?.nama_wilayah === filterWilayah;
    })
    .filter((s) =>
      [s.nama_sekolah, s.npsn]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  // Mapping Program ke Sekolah
  const schoolsArray = filteredSekolahs.map(sekolah => {
    const matchedPrograms = programs.filter(p => {
      // Lebih aman mencocokkan id_sekolah jika ada, atau fallback ke nama sekolah (case-insensitive & trim)
      if (p.id_sekolah && sekolah.id_sekolah) {
        return String(p.id_sekolah) === String(sekolah.id_sekolah);
      }
      return p.sekolah?.trim().toLowerCase() === sekolah.nama_sekolah?.trim().toLowerCase();
    });
    
    return {
      ...sekolah,
      program_list: matchedPrograms,
      total_program: matchedPrograms.length || 0,
      aktif_count: matchedPrograms.filter(p => p.status_program === 'Aktif').length || 0,
      draft_count: matchedPrograms.filter(p => p.status_program === 'Draft').length || 0,
    };
  });

  const currentData = schoolsArray.slice(start, end);
  const totalPages = Math.ceil(schoolsArray.length / limit) || 1;

  // Dapatkan list wilayah unik dari data sekolah
  const uniqueWilayahs = [...new Set(sekolahs.map(s => s.wilayah?.nama_wilayah).filter(Boolean))];
  const filterOptions = [
    { label: "Semua Wilayah", value: "Semua" },
    ...uniqueWilayahs.map(w => ({ label: w.split("/").pop().toUpperCase(), value: w }))
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-t-[2.5rem] rounded-b-[2.5rem] border-none shadow-2xl bg-white overflow-hidden relative">
          <div className="px-8 pt-6 pb-6 shrink-0 z-10 bg-white">
            <header className="flex flex-row items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-[#2E5AA7] to-[#164a8a] rounded-2xl text-white shadow-xl">
                    <School size={22} strokeWidth={2} />
                  </div>
                </div>
                <div className="flex flex-col -space-y-1">
                  <Label
                    text="Sistem Monitoring dan Evaluasi Program"
                    className="!text-[8px] !text-[#1E5AA5] !font-black tracking-[0.3em] !mb-1 uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase leading-none">
                    Master Data{" "}
                    <span className="text-[#2E5AA7]">Program Non Akademik</span>
                  </h1>
                </div>
              </div>

              <Button
                text="+ Tambah Program"
                icon={<Plus size={14} />}
                onClick={() => navigate("/ho/program/non-akademik/create")}
                className="group !bg-[#2E5AA7] hover:!bg-[#1c5496] !rounded-xl !px-5 !py-2.5 !text-[10px] font-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
              />
            </header>

            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-[#1E5AA5] rounded-xl border border-blue-100 font-black text-[9px] uppercase tracking-[0.2em] shrink-0">
                <School size={14} /> Total: {schoolsArray.length} Sekolah Binaan
              </div>
              <div className="w-72">
                <Search
                  placeholder="Cari sekolah atau NPSN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!pl-12 !pr-4 !py-2.5 !bg-gray-50/80 !border-gray-200/50 !rounded-xl !text-[11px] !font-bold outline-none focus:!bg-white focus:!ring-4 focus:!ring-blue-100/50 transition-all shadow-sm"
                />
              </div>
              <div className="w-56">
                <Dropdown
                  label="Wilayah"
                  items={filterOptions}
                  value={filterWilayah}
                  onChange={setFilterWilayah}
                  className="!bg-gray-50/80 !border-gray-200/50 !rounded-xl !text-[11px] !font-bold focus:!bg-white focus:!ring-4 focus:!ring-blue-100/50 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8 py-8">
              {currentData.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40 text-gray-900 bg-white border-2 border-dashed border-gray-200 rounded-3xl h-64">
                  <School size={48} className="mb-4 text-[#2E5AA7]" />
                  <p className="text-sm font-black uppercase tracking-widest text-gray-500">
                    Tidak Ada Sekolah Ditemukan
                  </p>
                </div>
              ) : (
                currentData.map((item, index) => {
                  const imageUrl = `https://ui-avatars.com/api/?name=${item.nama_sekolah}&background=2E5AA7&color=fff&size=512&font-size=0.15&bold=true`;
                  
                  return (
                  <div key={item.id_sekolah || index} className="group relative bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(46,90,167,0.08)] transition-all duration-300 flex flex-col h-auto transform hover:-translate-y-1">
                    
                    {/* Header Image Section */}
                    <div className="h-40 relative overflow-hidden shrink-0 bg-[#f1f5f9]">
                      <img 
                        src={imageUrl} 
                        alt={item.nama_sekolah}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 blur-[0.5px] opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/30 to-transparent"></div>
                      
                      {/* Total Program Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border bg-white/20 text-white border-white/20 flex items-center gap-1.5">
                            <BookOpen size={12} /> {item.total_program} Program
                        </span>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md border border-white/10 text-white text-[8px] font-black tracking-[0.2em] uppercase mb-1.5">
                            NPSN: {item.npsn || "-"}
                        </div>
                        <h3 className="text-white font-black text-[18px] leading-snug line-clamp-2 drop-shadow-md">
                            {item.nama_sekolah}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body - Summary Stats */}
                    <div className="flex-1 p-5 flex flex-col gap-4 justify-center">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center">
                                <span className="text-[20px] font-black text-emerald-600 mb-1 leading-none">{item.aktif_count}</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Aktif</span>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center justify-center">
                                <span className="text-[20px] font-black text-amber-600 mb-1 leading-none">{item.draft_count}</span>
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Draft</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-3 border-t border-gray-100 bg-slate-50/50">
                      <button 
                        onClick={() => openDrawer(item)} 
                        className="w-full py-3 bg-[#2E5AA7] shadow-md shadow-[#2E5AA7]/20 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest hover:bg-[#1c5496] transition-all flex justify-center items-center gap-2 group/btn"
                      >
                          Lihat Daftar Program <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>

          <div className="px-10 py-5 bg-white shrink-0 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.01)] z-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="!justify-center"
            />
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}

export default ReadProgramnonAkademik;
