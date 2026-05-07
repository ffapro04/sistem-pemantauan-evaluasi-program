/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import Sidebar from "../../../components/Sidebar";
import Card from "../../../components/Card";
import Table from "../../../components/Table";

// Icons
import {
  Calendar as CalendarIcon,
  Clock,
  LayoutDashboard,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileText,
  Plus,
  Zap,
  ChevronRight,
} from "lucide-react";

// FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function DashboardAdmin() {
  const events = [
    {
      id: "1",
      title: "Kunjungan Bogor",
      start: "2026-04-12",
      extendedProps: { category: "Visit", time: "09:00", status: "Upcoming" },
    },
    {
      id: "2",
      title: "Audit SMK 1",
      start: "2026-04-15",
      extendedProps: { category: "Audit", time: "13:00", status: "Pending" },
    },
  ];

  const tableHeaders = ["AGENDA", "KATEGORI", "WAKTU", "STATUS"];
  const tableData = events.map((ev) => ({
    agenda: (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-700 text-[12px] leading-tight">
          {ev.title}
        </span>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
          YPA-MDR
        </span>
      </div>
    ),
    category: (
      <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-[#1E5AA5] border border-blue-100/50 uppercase tracking-wider">
        {ev.extendedProps.category}
      </span>
    ),
    time: (
      <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
        <Clock size={12} className="text-blue-400" />
        {ev.extendedProps.time}
      </div>
    ),
    status: (
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${ev.extendedProps.status === "Upcoming" ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        <span
          className={`font-bold text-[10px] uppercase tracking-widest ${ev.extendedProps.status === "Upcoming" ? "text-emerald-600" : "text-amber-600"}`}
        >
          {ev.extendedProps.status}
        </span>
      </div>
    ),
  }));

  const stats = [
    {
      title: "24",
      sub: "Total Agenda",
      icon: <CalendarIcon />,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "08",
      sub: "Visit Cabang",
      icon: <Briefcase />,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      title: "03",
      sub: "Urgent Task",
      icon: <AlertCircle />,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      title: "12",
      sub: "Completed",
      icon: <CheckCircle2 />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  return (
    <>
      <style>{`
        html, body { background-color: #F9FBFF; font-family: 'Poppins', sans-serif; overflow: hidden; }
        
        .fc { border: none !important; font-size: 0.75rem; }
        .fc-toolbar-title { font-weight: 800 !important; font-size: 1.1rem !important; color: #1e293b; }
        .fc-button-primary { background: #fff !important; border: 1px solid #e2e8f0 !important; color: #64748b !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 11px !important; text-transform: uppercase !important; padding: 6px 12px !important; }
        .fc-button-primary:hover { background: #f8fafc !important; color: #1E5AA5 !important; }
        .fc-button-active { background: #1E5AA5 !important; border-color: #1E5AA5 !important; color: white !important; }
        .fc-theme-standard th { background: transparent; padding: 10px !important; border: none !important; color: #94a3b8; font-weight: 700; font-size: 9px; text-transform: uppercase; }
        .fc-daygrid-day { border-color: #f1f5f9 !important; }
        .fc-event { background: #1E5AA5 !important; border: none !important; border-radius: 4px !important; padding: 2px 4px !important; font-size: 9px !important; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      <div className="flex h-screen w-full bg-[#F9FBFF] overflow-hidden">
        <Sidebar />

        <motion.main
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col h-screen overflow-hidden p-5 gap-5"
        >
          {/* COMPACT HEADER */}
          <motion.header
            variants={itemVars}
            className="flex-none flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#1E5AA5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                  Central Of Excellent
                </h1>
                <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-[0.1em]">
                  YPA-MDR Operational Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-[1px] bg-slate-100 mx-2" />
              <button className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-[11px] font-bold border border-slate-100 hover:bg-slate-100 transition-all">
                System Status
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </div>
          </motion.header>

          {/* COMPACT STATS */}
          <div className="flex-none grid grid-cols-4 gap-5">
            {stats.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVars}
                whileHover={{ y: -4 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 ${item.bg} ${item.color} rounded-lg flex items-center justify-center transition-colors`}
                >
                  {React.cloneElement(item.icon, {
                    size: 18,
                    strokeWidth: 2.5,
                  })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-none">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    {item.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 pb-2">
            {/* CALENDAR */}
            <motion.div
              variants={itemVars}
              className="col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col"
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: "title", right: "prev,next today" }}
                events={events}
                height="100%"
              />
            </motion.div>

            {/* TABLE AREA */}
            <motion.div
              variants={itemVars}
              className="col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-50">
                <div>
                  <h3 className="text-slate-800 font-bold text-[14px]">
                    Recent Schedule
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">
                    Monitoring Log
                  </p>
                </div>
                <button className="h-8 w-8 bg-blue-50 text-[#1E5AA5] rounded-lg flex items-center justify-center hover:bg-[#1E5AA5] hover:text-white transition-all">
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar p-3">
                <Table
                  headers={tableHeaders}
                  data={tableData}
                  className="compact-table"
                />
              </div>

              <div className="p-3 bg-slate-50/50 flex justify-between items-center px-5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Data Secured
                </span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>

      <style>{`
        /* Refined Table Scaling */
        .compact-table thead th { 
          color: #94a3b8 !important; 
          background: #f8fafc !important; 
          font-size: 9px !important;
          font-weight: 800 !important;
          padding: 10px 15px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .compact-table tbody td { 
          font-size: 11px !important;
          padding: 12px 15px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .compact-table tbody tr:hover { background: #fbfcfe !important; }
      `}</style>
    </>
  );
}
