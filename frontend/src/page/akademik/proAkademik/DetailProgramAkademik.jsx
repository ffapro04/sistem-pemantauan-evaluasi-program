/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Eye, MessageSquare, X, FileText, ChevronRight,
  CheckCircle2, Clock, Send, Lock, UserCheck, MousePointer2,
  Printer, DownloadCloud, ArrowLeft, Building2, User, MapPin,
  Target, Calendar
} from "lucide-react";

// MENGGUNAKAN KOMPONEN MILIK ANDA
import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Button from "../../../components/Button";
import InformationCard from "../../../components/InformationCard";
import Table from "../../../components/Table";
import Input from "../../../components/Input";
import IconButton from "../../../components/IconButton";
import Divider from "../../../components/Divider";
import Label from "../../../components/Label";

// ─── DATA STATIC PROGRAM ──────────────────────────────────────────────────
const PROGRAM_INFO = {
  no_mou: "088/MOU/ASTRA-YPA/V/2026",
  nama_program: "DIGITALISASI KURIKULUM 2026",
  nama_sekolah: "SMK NEGERI 1 KARAWANG",
  head_office: "Bpk. Yusuf Tajiri",
  area_officer: "Bpk. Andri",
  wilayah: "Karawang, Jawa Barat",
  npsn: "20109321",
  tanggal_update: "08 May 2026",
};

const FASES = [
  { id: 0, nama: "Inisiasi" },
  { id: 1, nama: "Perencanaan" },
  { id: 2, nama: "Pelaksanaan" },
  { id: 3, nama: "Monitoring" },
  { id: 4, nama: "Evaluasi" },
  { id: 5, nama: "Pelaporan" },
];

export default function DetailProgramAkademik() {
  const navigate = useNavigate();

  const generateInitialData = () => {
    let data = {};
    FASES.forEach((f) => {
      data[f.id] = [
        {
          id: `G${f.id}`,
          isPhaseGate: true,
          kegiatan: `AKTIVASI FASE ${f.nama.toUpperCase()}`,
          persyaratan: [{ name: "Dokumen Otorisasi", aoAcc: true, file: "auth.pdf" }],
          aoStatus: "ACC",
          hoStatus: "PENDING",
        },
        {
          id: `A${f.id}1`,
          isPhaseGate: false,
          kegiatan: `Kegiatan Lapangan 01 - ${f.nama}`,
          persyaratan: [
            { name: "Laporan Teknis", aoAcc: true, file: "report1.pdf" },
            { name: "Absensi", aoAcc: true, file: "abs.pdf" },
          ],
          aoStatus: "ACC",
          hoStatus: "PENDING",
        },
        {
          id: `A${f.id}2`,
          isPhaseGate: false,
          kegiatan: `Kegiatan Akhir 02 - ${f.nama}`,
          persyaratan: [
            { name: "BAST Pekerjaan", aoAcc: true, file: "bast.pdf" },
            { name: "Dokumentasi", aoAcc: true, file: "foto.jpg" },
          ],
          aoStatus: "ACC",
          hoStatus: "PENDING",
        },
      ];
    });
    return data;
  };

  const [activeFase, setActiveFase] = useState(0);
  const [activities, setActivities] = useState(generateInitialData());
  const [chats, setChats] = useState([
    { sender: "System", text: "Gunakan 'ACC' atau 'REJECT' di kolom chat.", time: "08:00", isSystem: true },
  ]);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedAoVerif, setSelectedAoVerif] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [msg, setMsg] = useState("");
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [isAccTriggered, setIsAccTriggered] = useState(false);
  const [handPointerId, setHandPointerId] = useState(null);
  const [accNotif, setAccNotif] = useState({ show: false, title: "", msg: "" });
  const chatEndRef = useRef(null);

  const currentList = activities[activeFase] || [];
  const checkPhaseUnlocked = (faseId) => {
    if (faseId === 0) return true;
    const prevFase = activities[faseId - 1];
    return prevFase[prevFase.length - 1].hoStatus === "COMPLETED";
  };
  const currentPhaseAccessible = checkPhaseUnlocked(activeFase);
  const gateACC = currentList[0]?.hoStatus === "COMPLETED";

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, showChat, isRejectMode, isAccTriggered]);

  const handleSendChat = () => {
    if (!msg.trim()) return;
    if (msg === "REJECT") { setIsRejectMode(true); return; }
    if (msg === "ACC") { setIsAccTriggered(true); return; }
    setChats([...chats, { sender: "Anda (HO)", text: msg, time: "Now", self: true }]);
    setMsg("");
  };

  const confirmReject = () => {
    const updatedFase = currentList.map((item) => {
      if (!item.isPhaseGate && item.hoStatus !== "COMPLETED") {
        return { ...item, hoStatus: "PENDING", aoStatus: "PENDING", persyaratan: item.persyaratan.map(p => ({ ...p, aoAcc: false, file: null })) };
      }
      return item;
    });
    setActivities({ ...activities, [activeFase]: updatedFase });
    setChats([...chats, { text: "SYSTEM: REJECT BERHASIL. DATA RESET.", isSystem: true }]);
    setIsRejectMode(false);
    setMsg("");
  };

  const triggerAccHand = () => {
    setShowChat(false);
    setIsAccTriggered(false);
    setMsg("");
    const target = currentList.find((a) => a.hoStatus === "PENDING" && a.aoStatus === "ACC");
    if (target) setHandPointerId(target.id);
  };

  const handleHoAction = (item, idx) => {
    const updatedFase = currentList.map((act) => act.id === item.id ? { ...act, hoStatus: "COMPLETED" } : act);
    setActivities({ ...activities, [activeFase]: updatedFase });
    setHandPointerId(null);
    const isLast = idx === currentList.length - 1;
    setAccNotif({
      show: true,
      title: isLast ? "Fase Selesai" : "Verified",
      msg: isLast ? `Fase ${FASES[activeFase].nama} ditutup.` : `Unit ${item.kegiatan} berhasil di-ACC.`,
    });
    setTimeout(() => setAccNotif({ show: false, title: "", msg: "" }), 4000);
  };

  // Table columns definition
  const tableColumns = [
    {
      header: "No",
      accessor: "no",
      align: "text-center",
      render: (_, idx) => <span className="text-[12px] font-black text-slate-300">{idx + 1}</span>
    },
    {
      header: "Status & Deskripsi Unit",
      accessor: "kegiatan",
      render: (item, idx) => {
        const isRowLocked = !currentPhaseAccessible || (!item.isPhaseGate && !gateACC) || (idx > 0 && currentList[idx - 1].hoStatus !== "COMPLETED");
        const isCompleted = item.hoStatus === "COMPLETED";
        return (
          <div className="flex items-center gap-4 text-left">
            {isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : isRowLocked ? <Lock size={18} className="text-slate-300" /> : <Clock size={18} className="text-[#0AC4E0]" />}
            <p className={`text-[13px] ${item.isPhaseGate ? "font-black text-[#0AC4E0] uppercase tracking-tighter" : "font-bold text-slate-700"}`}>
              {item.kegiatan}
            </p>
          </div>
        );
      }
    },
    {
      header: "Output Persyaratan",
      accessor: "persyaratan",
      render: (item) => (
        <div className="flex flex-col gap-2">
          {item.persyaratan.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-400">
              {p.file ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-gray-200" />}
              <span className={p.file ? "text-emerald-600" : "text-slate-300"}>{p.name}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: "Berkas",
      accessor: "id",
      align: "text-center",
      render: (item) => (
        <IconButton icon={<Eye size={18} />} onClick={() => setSelectedActivity(item)} variant="light" className="!bg-transparent hover:!bg-gray-100" />
      )
    },
    {
      header: "Verifikasi AO",
      accessor: "aoStatus",
      align: "text-center",
      render: (item) => (
        <div className="flex justify-center">
          <IconButton
            icon={<UserCheck size={16} />}
            onClick={() => setSelectedAoVerif(item)}
            variant="light"
            className={`!rounded-2xl !px-5 !py-2.5 !text-[10px] !font-black ${item.aoStatus === "ACC"
              ? "!bg-emerald-50 !text-emerald-600"
              : "!bg-gray-50 !text-slate-300"
              }`}
            label={item.aoStatus === "ACC" ? "Verified" : "Wait AO"}
          />
        </div>
      )
    },
    {
      header: "Aksi HO",
      accessor: "hoStatus",
      align: "text-right",
      render: (item, idx) => {
        const isRowLocked = !currentPhaseAccessible || (!item.isPhaseGate && !gateACC) || (idx > 0 && currentList[idx - 1].hoStatus !== "COMPLETED");
        const isCompleted = item.hoStatus === "COMPLETED";

        if (isRowLocked) return null;

        return (
          <div className="flex justify-end gap-3">
            <IconButton
              icon={<X size={14} />}
              label="Hold"
              variant="light"
              className="!bg-red-50 !text-red-400 !border-red-100 !rounded-[1.2rem] !text-[10px] !px-4 !py-2.5"
            />
            <div className="relative">
              {handPointerId === item.id && (
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="absolute -top-14 left-1/2 -translate-x-1/2 text-orange-500 drop-shadow-xl z-50">
                  <MousePointer2 size={36} fill="currentColor" className="rotate-180" />
                </motion.div>
              )}
              <Button
                label={isCompleted ? "Selesai" : "Verify Step"}
                disabled={item.aoStatus !== "ACC" || isCompleted}
                onClick={() => handleHoAction(item, idx)}
                className={`!px-7 !py-2.5 !rounded-[1.2rem] !text-[10px] !font-black !uppercase ${isCompleted
                  ? "!bg-emerald-500 !text-white"
                  : "!bg-slate-800 !text-white hover:!bg-[#0AC4E0]"
                  }`}
              />
            </div>
          </div>
        );
      }
    }
  ];

  // Filter data berdasarkan row lock
  const getFilteredData = () => {
    return currentList.map((item, idx) => {
      const isRowLocked = !currentPhaseAccessible || (!item.isPhaseGate && !gateACC) || (idx > 0 && currentList[idx - 1].hoStatus !== "COMPLETED");
      return { ...item, isRowLocked, originalIndex: idx };
    });
  };

  return (
    <PageWrapper className="h-screen overflow-hidden flex bg-white !p-0 font-sans selection:bg-[#0AC4E0]/20">
      <Sidebar />

      <NotificationBadge accNotif={accNotif} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        {/* HEADER SECTION - FIXED NO SCROLL */}
        <header className="shrink-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-6">
            <IconButton icon={<ArrowLeft size={18} />} onClick={() => navigate(-1)} variant="light" />
            <div className="space-y-0.5">
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Progress Monitoring</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#0AC4E0] uppercase tracking-[0.2em]">
                <span>Head Office</span> <ChevronRight size={10} /> <span className="text-slate-400">Control Center</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Button
              label="Diskusi"
              icon={<MessageSquare size={14} />}
              onClick={() => setShowChat(true)}
              className="!rounded-full !px-6 !bg-[#0AC4E0] !text-white"
            />
            <Divider orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Astra HO Admin</p>
                <p className="text-[9px] font-bold text-[#0AC4E0] uppercase tracking-tighter">Verified Access</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0AC4E0]/20 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Astra&background=0AC4E0&color=fff" alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT - ONLY THIS PART SCROLLS */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          {/* BENTO INFO CARD */}
          <InformationCard className="border-2 border-[#0AC4E0]/40 !rounded-[3rem] overflow-hidden">
            <div className="p-10 bg-white">
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="w-24 h-24 bg-[#0AC4E0] rounded-[2.2rem] flex items-center justify-center shrink-0 shadow-2xl text-white font-black text-3xl italic border-4 border-white">
                  HO
                </div>
                <div className="flex-1">
                  <h2 className="text-[32px] font-black text-slate-800 leading-none uppercase tracking-tighter mb-2">
                    {PROGRAM_INFO.nama_program}
                  </h2>
                  <p className="text-[11px] font-bold text-[#0AC4E0] uppercase tracking-[0.3em] mb-8 leading-none">
                    MOU: {PROGRAM_INFO.no_mou}
                  </p>
                  <Divider className="mb-8 opacity-20" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    <InfoItem icon={<Building2 size={14} />} label="Institusi" value={PROGRAM_INFO.nama_sekolah} />
                    <InfoItem icon={<User size={14} />} label="Head Office" value={PROGRAM_INFO.head_office} isHO />
                    <InfoItem icon={<UserCheck size={14} />} label="Area Officer" value={PROGRAM_INFO.area_officer} />
                    <InfoItem icon={<MapPin size={14} />} label="Wilayah" value={PROGRAM_INFO.wilayah} />
                    <InfoItem icon={<Target size={14} />} label="NPSN" value={PROGRAM_INFO.npsn} />
                    <InfoItem icon={<Calendar size={14} />} label="Last Updated" value={PROGRAM_INFO.tanggal_update} />
                  </div>
                </div>
              </div>
            </div>
          </InformationCard>

          {/* FASE NAVIGATION */}
          <div className="bg-gray-50 p-1.5 rounded-[2.2rem] flex gap-1 border border-gray-100">
            {FASES.map((f, idx) => {
              const isLocked = !checkPhaseUnlocked(idx);
              const isActive = activeFase === f.id;
              return (
                <button
                  key={f.id}
                  disabled={isLocked}
                  onClick={() => { setActiveFase(f.id); setHandPointerId(null); }}
                  className={`flex-1 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isActive
                    ? "bg-white text-[#0AC4E0] shadow-lg shadow-[#0AC4E0]/10"
                    : isLocked
                      ? "text-slate-300 cursor-not-allowed bg-gray-50"
                      : "text-slate-500 hover:text-slate-700 bg-transparent"
                    }`}
                >
                  {isLocked && <Lock size={12} className="text-slate-300" />}
                  {f.nama}
                </button>
              );
            })}
          </div>

          {/* MONITORING TABLE - MENGGUNAKAN COMPONENT TABLE */}
          <div className="relative">
            {!currentPhaseAccessible && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-[3rem] flex items-center justify-center">
                <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Lock size={14} /> Selesaikan Fase Sebelumnya Terlebih Dahulu
                </div>
              </div>
            )}
            <Table
              columns={tableColumns}
              data={getFilteredData()}
            />
          </div>
        </div>

        {/* MODAL BERKAS */}
        <FileRepositoryModal selectedActivity={selectedActivity} onClose={() => setSelectedActivity(null)} onViewFile={setViewingFile} />

        {/* MODAL VERIFIKASI AO */}
        <AoVerificationModal selectedAoVerif={selectedAoVerif} onClose={() => setSelectedAoVerif(null)} onOpenChat={() => setShowChat(true)} />

        {/* QUICK LOOK PREVIEW */}
        <FilePreviewModal viewingFile={viewingFile} onClose={() => setViewingFile(null)} />

        {/* CHAT SYSTEM */}
        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed top-0 right-0 w-[420px] h-full bg-white z-[500] shadow-2xl flex flex-col border-l border-gray-100 text-left">
              <div className="px-10 py-8 bg-[#0AC4E0] text-white flex justify-between items-center shrink-0 shadow-lg leading-none">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xs uppercase">HO</div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-widest">Command Center</h4>
                    <p className="text-[10px] text-white/80 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">Online</p>
                  </div>
                </div>
                <IconButton icon={<X size={24} />} onClick={() => setShowChat(false)} variant="light" className="!text-white hover:!bg-white/20" />
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/50 no-scrollbar">
                {chats.map((c, i) => (
                  <div key={i} className={`flex flex-col ${c.self ? "items-end" : "items-start"} ${c.isSystem ? "items-center" : ""}`}>
                    {!c.isSystem && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 px-4">{c.sender}</span>}
                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-[13px] font-semibold shadow-sm transition-all
                      ${c.isSystem ? "bg-amber-50 text-amber-700 text-[10px] text-center border border-amber-200" : c.self ? "bg-[#0AC4E0] text-white rounded-tr-none shadow-lg shadow-[#0AC4E0]/20" : "bg-white text-slate-700 rounded-tl-none border border-gray-100"}`}>
                      {c.text}
                    </div>
                  </div>
                ))}

                {isRejectMode && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-10 shadow-2xl border border-red-100 text-center space-y-6">
                    <p className="text-[13px] font-black text-red-600 uppercase tracking-tighter leading-tight">Reject & reset data fase ini?</p>
                    <div className="flex flex-col gap-3">
                      <Button label="YA, REJECT DATA" onClick={confirmReject} className="!bg-red-600 !text-white !rounded-[1.5rem] !py-4" />
                      <Button label="BATAL" onClick={() => { setIsRejectMode(false); setMsg(""); }} className="!bg-gray-50 !text-slate-400 !rounded-[1.5rem] !py-4" />
                    </div>
                  </motion.div>
                )}

                {isAccTriggered && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[3rem] p-10 shadow-2xl border border-emerald-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl"><ShieldCheck size={40} /></div>
                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest leading-relaxed">Keputusan HO:<br /><span className="text-xl">ACC APPROVED</span></p>
                    <Button label="AKTIVASI POINTER TABEL" onClick={triggerAccHand} className="!bg-emerald-600 !text-white !rounded-[2rem] !py-5" />
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex items-center gap-4 shrink-0">
                <Input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ketik ACC / REJECT..."
                  className="flex-1 !rounded-full !py-5"
                />
                <IconButton
                  icon={<Send size={24} />}
                  onClick={handleSendChat}
                  variant="primary"
                  className="!w-14 !h-14 !rounded-full !bg-[#0AC4E0] !text-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </PageWrapper>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const NotificationBadge = ({ accNotif }) => (
  <AnimatePresence>
    {accNotif.show && (
      <motion.div initial={{ y: -100, x: "-50%", opacity: 0 }} animate={{ y: 20, x: "-50%", opacity: 1 }} exit={{ y: -100, x: "-50%", opacity: 0 }} className="fixed top-0 left-1/2 z-[600] w-[420px]">
        <div className="bg-white/95 backdrop-blur-2xl border border-[#0AC4E0]/30 shadow-2xl rounded-[2.5rem] p-5 flex gap-4">
          <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0AC4E0]/30"><ShieldCheck size={24} /></div>
          <div className="text-left">
            <h4 className="text-[13px] font-bold text-slate-800 leading-none mb-1">{accNotif.title}</h4>
            <p className="text-[11px] font-medium text-slate-500 leading-tight">{accNotif.msg}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InfoItem = ({ icon, label, value, isHO }) => (
  <div className="text-left space-y-2">
    <div className="flex items-center gap-2 text-slate-400 leading-none">
      <span className={isHO ? "text-slate-400" : "text-[#0AC4E0]"}>{icon}</span>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </div>
    <p className={`text-[12px] font-black leading-tight truncate ${isHO ? "text-slate-600" : "text-slate-800"}`}>
      {value || "-"}
    </p>
  </div>
);

const FileRepositoryModal = ({ selectedActivity, onClose, onViewFile }) => (
  <AnimatePresence>
    {selectedActivity && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm" />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 w-[420px] h-full bg-white z-[101] shadow-2xl flex flex-col border-l border-gray-100 text-left">
          <div className="p-8 bg-[#0AC4E0] text-white flex justify-between items-center shadow-lg shrink-0">
            <div className="text-left leading-none">
              <h4 className="text-[12px] font-black uppercase tracking-widest">Repository Dokumen</h4>
              <p className="text-[10px] text-white/80 font-bold uppercase mt-1 truncate max-w-[280px]">{selectedActivity.kegiatan}</p>
            </div>
            <IconButton icon={<X size={24} />} onClick={onClose} variant="light" className="!text-white hover:!bg-white/20" />
          </div>
          <div className="p-8 space-y-4 overflow-y-auto no-scrollbar bg-gray-50 flex-1">
            {selectedActivity.persyaratan.map((f, i) => (
              <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-[#0AC4E0] transition-all shadow-sm">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-[#0AC4E0]/10 text-[#0AC4E0] rounded-2xl flex items-center justify-center group-hover:bg-[#0AC4E0] group-hover:text-white transition-all"><FileText size={20} /></div>
                  <div>
                    <p className="text-[12px] font-black text-slate-800 uppercase leading-none mb-1">{f.name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Verified AO</p>
                  </div>
                </div>
                {f.file ? (
                  <Button label="Buka" onClick={() => onViewFile({ activity: selectedActivity.kegiatan, docName: f.name })} className="!px-5 !py-2 !bg-slate-800 !text-white !rounded-full !text-[9px]" />
                ) : (
                  <span className="text-[9px] font-black text-slate-300 uppercase italic">No File</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const AoVerificationModal = ({ selectedAoVerif, onClose, onOpenChat }) => (
  <AnimatePresence>
    {selectedAoVerif && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm" />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }} className="fixed top-0 right-0 w-[450px] h-full bg-white z-[101] shadow-2xl flex flex-col border-l border-gray-100 text-left">
          <div className="p-10 bg-emerald-600 text-white flex justify-between font-black text-[12px] uppercase items-center shrink-0">
            <span>Field Verification Report</span>
            <IconButton icon={<X size={24} />} onClick={onClose} variant="light" className="!text-white hover:!bg-white/20" />
          </div>
          <div className="p-10 space-y-8 text-center flex-1 bg-gray-50 overflow-y-auto no-scrollbar">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 mb-4"><UserCheck size={40} /></div>
            <div className="p-8 bg-white border border-gray-100 rounded-[3rem] shadow-sm text-left">
              <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Field Investigator</p>
              <p className="text-xl font-black text-slate-800 uppercase leading-none">{PROGRAM_INFO.area_officer}</p>
              <div className="mt-6 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full inline-block text-[11px] font-black uppercase">Status: {selectedAoVerif.aoStatus}</div>
            </div>
            <Button label="Diskusikan di Chat" icon={<MessageSquare size={20} />} onClick={onOpenChat} className="!w-full !py-5 !bg-white !text-[#0AC4E0] !border-2 !border-[#0AC4E0] !rounded-[2.2rem] !font-black !text-[11px] shadow-xl" />
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const FilePreviewModal = ({ viewingFile, onClose }) => (
  <AnimatePresence>
    {viewingFile && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-10">
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white w-full max-w-5xl h-full rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white">
          <div className="px-12 py-8 flex justify-between items-center border-b border-gray-100 bg-white shrink-0 text-left">
            <div className="flex items-center gap-5 leading-none">
              <div className="w-14 h-14 bg-[#0AC4E0] text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={28} /></div>
              <div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">{viewingFile.docName}</h4>
                <p className="text-[11px] text-[#0AC4E0] font-bold uppercase mt-1">{viewingFile.activity}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconButton icon={<Printer size={18} />} variant="light" />
              <Button label="Download" icon={<DownloadCloud size={18} />} className="!bg-[#0AC4E0] !text-white !rounded-full" />
              <IconButton icon={<X size={24} />} onClick={onClose} variant="light" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-16 bg-gray-100 flex justify-center no-scrollbar">
            <div className="bg-white w-[850px] min-h-[1100px] shadow-2xl p-24 text-left font-serif text-slate-800 border border-gray-50 relative">
              <div className="border-b-2 border-slate-800 pb-10 mb-12 text-center leading-tight">
                <h2 className="text-3xl font-bold uppercase tracking-tight">Yayasan Pendidikan Astra - Michael D. Ruslim</h2>
                <p className="text-[10px] font-sans font-black text-slate-400 uppercase mt-4">Gedung Astra International • Jakarta, Indonesia</p>
              </div>
              <div className="space-y-12 text-[14px] leading-loose">
                <div className="flex justify-between font-sans font-bold text-[12px] text-slate-400 uppercase">
                  <span>Ref: {PROGRAM_INFO.no_mou}/BAV/2026</span>
                  <span>Jakarta, {PROGRAM_INFO.tanggal_update}</span>
                </div>
                <h3 className="text-center font-bold text-2xl uppercase underline underline-offset-[12px] font-sans text-slate-900 leading-none">Berita Acara Verifikasi Digital</h3>
                <p className="text-justify indent-12">Menyatakan bahwa unit kegiatan <b>{viewingFile.activity}</b> telah divalidasi oleh tim Area Officer (AO). Dokumen pendukung <b>{viewingFile.docName}</b> telah memenuhi seluruh kriteria mutu operasional.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);