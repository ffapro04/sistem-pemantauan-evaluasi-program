/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import {
  Calendar as CalendarIcon,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  MapPin,
  Info
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarOfEventakademik() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:3000/program?kategori=AKADEMIK",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal mengambil data program");

        const data = await res.json();

        const mappedEvents = data.map((item, index) => {
          const today = new Date();
          const fallbackDay = (today.getDate() + (index % 5)).toString().padStart(2, "0");
          const fallbackMonth = (today.getMonth() + 1).toString().padStart(2, "0");
          const fallbackDate = `${today.getFullYear()}-${fallbackMonth}-${fallbackDay}`;

          return {
            id: item.id_program,
            title: item.nama_program || "Program Tanpa Nama",
            start: item.tgl_pelaksanaan || fallbackDate,
            backgroundColor: item.status_program === "Aktif" ? "#0AC4E0" : "#FFFFFF",
            borderColor: item.status_program === "Aktif" ? "transparent" : "#E2E8F0",
            textColor: item.status_program === "Aktif" ? "#FFFFFF" : "#64748B",
            extendedProps: {
              category: item.kode_program || "Akademik",
              status: item.status_program || "Draft",
              sekolah: item.sekolah || "-"
            },
          };
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <PageWrapper className="h-screen bg-[#F0F9FF] flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/30">
      <Sidebar />

      {/* Background Decor - Blue Dominant */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0AC4E0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[20%] w-[400px] h-[400px] bg-[#0AC4E0]/5 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden px-6 py-6 animate-in fade-in duration-700">

        {/* Header - Blue Theme */}
        <header className="flex flex-row items-center justify-between mb-6 bg-[#0AC4E0] p-6 rounded-[2rem] shadow-xl shadow-[#0AC4E0]/20 border border-white/20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-inner">
              <CalendarIcon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Academic <span className="opacity-70 font-medium italic text-sm normal-case tracking-normal">Schedule</span>
              </h1>
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Kalender Operasional Sistem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right mr-2">
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">Total Agenda</span>
              <span className="text-white text-xl font-black leading-none mt-1">{events.length}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Calendar Section - Compact View */}
          <div className="xl:col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 overflow-hidden flex flex-col">
              <style>{`
                /* COMPACT CALENDAR STYLING */
                .fc { height: 100% !important; font-family: 'Inter', sans-serif !important; }
                .fc .fc-toolbar { margin-bottom: 1.5rem !important; }
                .fc-toolbar-title { font-weight: 800 !important; color: #1E293B !important; font-size: 1.1rem !important; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .fc-theme-standard th { border: none !important; padding: 10px 0 !important; color: #94A3B8; font-size: 10px; text-transform: uppercase; font-weight: 800; }
                .fc-theme-standard td { border-color: #F1F5F9 !important; }
                
                /* Ukuran Sel Per Tanggal (Compact) */
                .fc .fc-daygrid-day { height: 75px !important; } 
                .fc .fc-daygrid-day-frame { padding: 4px !important; }
                .fc-daygrid-day-number { color: #1E293B !important; font-weight: 800 !important; font-size: 12px !important; padding: 4px 8px !important; }
                .fc-day-today { background-color: #0AC4E0/5 !important; }
                
                /* Event Styling */
                .fc-event { border-radius: 8px !important; padding: 2px 6px !important; font-size: 9px !important; font-weight: 700 !important; border: none !important; margin: 1px 0 !important; }
                .fc-h-event .fc-event-main { color: inherit; }

                /* Button Styling */
                .fc-button-primary { background: #F8FAFC !important; color: #64748B !important; border: none !important; font-weight: 800 !important; border-radius: 10px !important; font-size: 9px !important; text-transform: uppercase; transition: 0.3s; }
                .fc-button-primary:hover { background: #0AC4E0 !important; color: white !important; }
                .fc-button-active { background: #0AC4E0 !important; color: white !important; }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: "title", right: "prev,next today" }}
                events={events}
                height="100%"
              />
            </div>
          </div>

          {/* Agenda Section - Blue Sidebar Card */}
          <div className="xl:col-span-4 flex flex-col h-full overflow-hidden">
            <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0AC4E0] flex items-center justify-center text-white shadow-lg shadow-[#0AC4E0]/20">
                    <FileText size={18} />
                  </div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Detail Agenda</h3>
                </div>
                <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-gray-100 text-slate-400">Next Up</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-10 h-10 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Syncing Agenda...</p>
                  </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                      <Info size={40} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-xs font-bold text-slate-400">BELUM ADA JADWAL</p>
                    </div>
                  ) : (
                      events.slice(0, 8).map((ev) => (
                        <div
                          key={ev.id}
                      className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#0AC4E0]/40 hover:bg-[#0AC4E0]/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${ev.extendedProps.status === 'Aktif' ? 'bg-[#0AC4E0] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {ev.extendedProps.category}
                        </span>
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-[#0AC4E0] transition-colors" />
                      </div>

                      <h4 className="text-[12px] font-bold text-slate-800 group-hover:text-[#0AC4E0] transition-colors leading-tight mb-3">
                        {ev.title}
                      </h4>

                      <div className="flex flex-col gap-1.5 border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                          <Clock size={12} className="text-[#0AC4E0]" />
                          <span>{new Date(ev.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                          <MapPin size={12} className="text-[#0AC4E0]" />
                          <span className="truncate max-w-[180px]">{ev.extendedProps.sekolah}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Decorative Footer Area in Sidebar */}
              <div className="p-6 bg-gradient-to-tr from-[#0AC4E0] to-[#58e2f3] m-4 rounded-3xl text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Update Information</p>
                  <p className="text-xs font-medium leading-snug">Seluruh program akan disinkronkan otomatis dengan Sistem Penjadwalan Pusat.</p>
                </div>
                <Sparkles size={60} className="absolute -right-4 -bottom-4 opacity-20 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </PageWrapper>
  );
}