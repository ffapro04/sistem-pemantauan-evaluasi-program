import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Calendar, Clock, PlayCircle, FileText, ChevronRight, Globe2, LayoutGrid } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import PageWrapper from "../../components/PageWrapper";

const ProgramKegiatan = () => {
  const [data, setData] = useState({ sekolah: "", programs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.sub;

        const res = await axios.get(`http://localhost:3000/sekolah/programs/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Error load program:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const draftPrograms = data.programs.filter(p => p.status_program === 'Draft');
  const aktifPrograms = data.programs.filter(p => p.status_program === 'Aktif');

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#0AC4E0] tracking-widest uppercase italic bg-[#F0FBFF]">SYNCING PROGRAMS...</div>;

  return (
    <PageWrapper className="h-screen bg-[#F0FBFF] flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0] selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-t-[3rem] rounded-b-[0rem] border-none shadow-3xl bg-white overflow-auto custom-scrollbar">
          
          {/* HEADER BIRU CERAH #0AC4E0 */}
          <div className="px-10 py-12 bg-[#0AC4E0] relative shrink-0 overflow-hidden">
            {/* Overlay Gradient halus */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-transparent" />
            <Globe2 size={180} className="absolute -bottom-10 -right-10 opacity-20 rotate-12 text-white" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-xl backdrop-blur-md">
                  <LayoutGrid size={32} />
                </div>
                <div>
                  <h2 className="text-4xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                    Agenda Kegiatan
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-white/50 rounded-full"></span>
                    <p className="text-[11px] font-bold text-cyan-50 uppercase tracking-[0.3em] italic">
                      {data.sekolah || "Sekolah Binaan YPA-MDR"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* --- SECTION: SEDANG DIJALANKAN (AKTIF) --- */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl animate-pulse shadow-sm border border-emerald-100">
                    <PlayCircle size={22} />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm text-gray-700">Program Sedang Dijalankan</h3>
                </div>
                <div className="space-y-5">
                  {aktifPrograms.length > 0 ? aktifPrograms.map(p => <ProgramCard key={p.id_program} program={p} type="aktif" />) : <EmptyState text="Belum ada program yang sedang berjalan" />}
                </div>
              </section>

              {/* --- SECTION: AKAN DATANG (DRAFT) --- */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2.5 bg-cyan-50 text-[#0AC4E0] rounded-xl shadow-sm border border-cyan-100">
                    <Calendar size={22} />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm text-gray-700">Program Mendatang</h3>
                </div>
                <div className="space-y-5">
                  {draftPrograms.length > 0 ? draftPrograms.map(p => <ProgramCard key={p.id_program} program={p} type="draft" />) : <EmptyState text="Belum ada rencana program mendatang" />}
                </div>
              </section>
            </div>
          </div>
          
          {/* Footer Line Decor */}
          <div className="mt-auto h-2 bg-[#0AC4E0] opacity-50 shrink-0"></div>
        </Card>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </PageWrapper>
  );
};

const ProgramCard = ({ program, type }) => (
  // Border kiri pake warna #0AC4E0
  <div className={`relative p-7 rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 group flex items-center justify-between border-l-4 border-l-[#0AC4E0] ${type === 'aktif' ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-gray-100'}`}>
    
    <div className="flex gap-6 items-center relative z-10 pl-2">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${type === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-[#0AC4E0] border-gray-100'}`}>
        <FileText size={24} />
      </div>
      <div>
        <h4 className="font-[1000] text-gray-900 uppercase text-[13px] tracking-tight mb-1.5 leading-tight">{program.nama_program}</h4>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#0AC4E0]" /> {program.tanggal_mulai ? new Date(program.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
          <span className="bg-cyan-50 text-[#0AC4E0] px-2 py-0.5 rounded-md text-[9px] font-black">{program.kategori || "Umum"}</span>
        </div>
      </div>
    </div>
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:bg-[#0AC4E0] group-hover:text-white transition-all shadow-inner shrink-0">
        <ChevronRight size={18} className="text-gray-300 group-hover:text-white transition-colors" />
    </div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="p-12 border-4 border-dashed border-gray-100 rounded-[2rem] text-center bg-gray-50/30">
    <FileText size={40} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
    <p className="text-[11px] font-black text-gray-300 uppercase italic tracking-widest">{text || "Tidak ada program ditemukan"}</p>
  </div>
);

export default ProgramKegiatan;