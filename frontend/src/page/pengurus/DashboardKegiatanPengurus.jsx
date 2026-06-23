/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "./../../components/Sidebar";
import Card from "./../../components/Card";
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  PlayCircle,
  Timer,
  X,
  MapPin,
  Tag,
  School as SchoolIcon
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardKegiatanPengurus() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/program", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data");

        const data = await res.json();
        const todayStr = new Date().toISOString().split('T')[0];

        const mappedEvents = data.map((item) => {
          const isDone = item.status_program === "Selesai";
          const isToday = item.tgl_pelaksanaan === todayStr || item.tanggal_mulai === todayStr;

          let statusTheme = {
            label: "Akan Datang",
            color: "#ea580c", 
            icon: <Timer size={12} className="text-white" />
          };

          if (isDone) {
            statusTheme = {
              label: "Selesai",
              color: "#10b981", 
              icon: <CheckCircle2 size={12} className="text-white" />
            };
          } else if (isToday || item.status_program === "Berjalan") {
            statusTheme = {
              label: "Sedang Berjalan",
              color: "#3b82f6", 
              icon: <PlayCircle size={12} className="text-white" />
            };
          }

          return {
            id: item.id_program,
            title: item.nama_program,
            start: item.tgl_pelaksanaan || item.tanggal_mulai,
            backgroundColor: statusTheme.color,
            borderColor: statusTheme.color,
            extendedProps: { 
              ...statusTheme,
              category: item.kode_program || "Program Astra",
              nama_sekolah: item.sekolah?.nama_sekolah || "Sekolah Umum",
              alamat_sekolah: item.sekolah?.alamat || item.alamat || "Alamat belum terdaftar",
              deskripsi: item.deskripsi || "Tidak ada deskripsi tambahan."
            },
          };
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-hidden">
        {/* Header Section */}
        <header className="flex-none flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0AC4E0] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-100">
              <LayoutDashboard size={28} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-[1000] tracking-tight text-black uppercase leading-none mb-1">
                Kegiatan  <span className="text-[#0AC4E0]">sekolah</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Program sekolah 2026
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
              <span className="text-[10px] font-black uppercase text-slate-600">Sedang Berjalan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
              <span className="text-[10px] font-black uppercase text-slate-600">Akan Datang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <span className="text-[10px] font-black uppercase text-slate-600">Selesai</span>
            </div>
          </div>
        </header>

        {/* Calendar Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Card className="!p-8 !rounded-[3rem] bg-white border-none shadow-2xl shadow-slate-200/40 min-h-[750px]">
            <style>{`
              .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9 !important; }
              .fc-header-toolbar { margin-bottom: 2rem !important; }
              .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 900 !important; text-transform: uppercase; color: black; letter-spacing: -0.05em; }
              .fc-button { background: #fff !important; border: 1px solid #e2e8f0 !important; color: #000 !important; font-weight: 900 !important; border-radius: 12px !important; text-transform: uppercase !important; font-size: 0.75rem !important; padding: 8px 16px !important; }
              .fc-button-active { background: #0AC4E0 !important; color: white !important; border-color: #0AC4E0 !important; }
              
              /* Tanda Real-time Hari Ini - DIBIKIN LEBIH KLAYATAN */
              .fc-day-today { 
                background: #dcf3ee !important; 
                position: relative;
              }
              
              .fc-day-today .fc-daygrid-day-number {
                background-color: #0AC4E0 !important;
                color: white !important;
                border-radius: 8px;
                padding: 4px 8px !important;
                margin: 4px;
                box-shadow: 0 4px 10px rgba(10, 196, 224, 0.4);
              }

              .fc-daygrid-day-events { margin: 0 !important; padding: 4px !important; }
              .fc-h-event { border: none !important; border-radius: 8px !important; cursor: pointer !important; transition: all 0.2s; }
              .fc-h-event:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
              .fc-event-main { padding: 6px !important; }
            `}</style>

            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              headerToolbar={{ left: "title", right: "prev,next today" }}
              height="auto"
              eventClick={handleEventClick}
              eventContent={(eventInfo) => (
                <div className="flex flex-col overflow-hidden px-1">
                  <div className="flex items-center gap-1 mb-1">
                    {eventInfo.event.extendedProps.icon}
                    <span className="text-[8px] font-black text-white/90 uppercase truncate">
                      {eventInfo.event.extendedProps.category}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-white uppercase leading-tight truncate">
                    {eventInfo.event.title}
                  </div>
                </div>
              )}
            />
          </Card>
        </div>

        {/* Modal Detail Event */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div 
                  className="p-10 text-white flex justify-between items-start"
                  style={{ backgroundColor: selectedEvent.backgroundColor }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                      {selectedEvent.extendedProps.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        {selectedEvent.extendedProps.label}
                      </span>
                    </div>
                    <h2 className="text-3xl font-[1000] uppercase leading-none tracking-tighter mt-2">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl transition-all border border-white/20 text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                      <div className="p-3 bg-white rounded-2xl text-[#0AC4E0] shadow-sm"><SchoolIcon size={22} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 leading-none">Sekolah</p>
                        <p className="text-sm font-black text-black uppercase">{selectedEvent.extendedProps.nama_sekolah}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                      <div className="p-3 bg-white rounded-2xl text-[#0AC4E0] shadow-sm"><Clock size={22} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 leading-none">Tanggal</p>
                       <p className="text-sm font-black text-black uppercase">
                        {formatDate(selectedEvent.startStr)}
                      </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                    <div className="p-3 bg-white rounded-2xl text-[#0AC4E0] shadow-sm"><MapPin size={22} /></div>
                    <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 leading-none">Alamat</p>
                    {/* UBAH DISINI: dari .alamat menjadi .alamat_sekolah */}
                    <p className="text-xs font-black text-slate-600 uppercase">
                      {selectedEvent.extendedProps.alamat_sekolah} 
                    </p>
                  </div>
                </div>

                  <div className="p-8 bg-[#F0FBFF] rounded-[2.5rem] border border-cyan-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag size={18} className="text-[#0AC4E0]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Program</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase">{selectedEvent.extendedProps.deskripsi}</p>
                  </div>

                  <button onClick={() => setSelectedEvent(null)} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95">Tutup Detail</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0AC4E0; border-radius: 10px; }
      `}</style>
    </div>
  );
}