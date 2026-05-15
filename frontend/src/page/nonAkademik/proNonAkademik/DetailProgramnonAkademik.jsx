/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Eye,
  MessageSquare,
  X,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  UserCheck,
  MousePointer2,
  Printer,
  DownloadCloud,
  ArrowLeft,
  Info,
  Calendar,
  Building2,
  User,
  MapPin,
  Target,
  AlertCircle,
  Sparkles,
  Briefcase,
  Edit3
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Button from "../../../components/Button"; // Import Component Button
import Label from "../../../components/Label";   // Import Component Label

const FASES = [
  { id: 0, nama: "Inisiasi" },
  { id: 1, nama: "Perencanaan" },
  { id: 2, nama: "Pelaksanaan" },
  { id: 3, nama: "Monitoring" },
  { id: 4, nama: "Evaluasi" },
  { id: 5, nama: "Pelaporan" },
];

export default function DetailProgramNonAkademik() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State Data Backend
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeFase, setActiveFase] = useState(0);
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

  const [activities, setActivities] = useState({});

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/program/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProgram(data);

        const initialActivities = {};
        FASES.forEach((f) => {
          initialActivities[f.id] = [
            {
              id: `G${f.id}`,
              isPhaseGate: true,
              kegiatan: `AKTIVASI FASE ${f.nama.toUpperCase()}`,
              persyaratan: [{ name: "Dokumen Otorisasi Non-Akademik", aoAcc: true, file: data.file_mou_nama }],
              aoStatus: "ACC",
              hoStatus: "PENDING",
            },
            {
              id: `A${f.id}1`,
              isPhaseGate: false,
              kegiatan: `Implementasi Lapangan - ${f.nama}`,
              persyaratan: [
                { name: "Laporan Dokumentasi", aoAcc: true, file: "doc.pdf" },
                { name: "Daftar Hadir", aoAcc: true, file: "absensi.pdf" },
              ],
              aoStatus: "ACC",
              hoStatus: "PENDING",
            }
          ];
        });
        setActivities(initialActivities);

      } catch (error) {
        console.error("Gagal mengambil detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const [chats, setChats] = useState([
    { sender: "System", text: "Dashboard Monitoring Non-Akademik Aktif.", time: "08:00", isSystem: true },
  ]);

  const currentList = activities[activeFase] || [];

  const checkPhaseUnlocked = (faseId) => {
    if (faseId === 0) return true;
    const prevFase = activities[faseId - 1];
    return prevFase && prevFase[prevFase.length - 1].hoStatus === "COMPLETED";
  };

  const currentPhaseAccessible = checkPhaseUnlocked(activeFase);
  const gateACC = currentList[0]?.hoStatus === "COMPLETED";

  const handleSendChat = () => {
    if (!msg.trim()) return;
    setChats([...chats, { sender: "Anda (HO)", text: msg, time: "Now", self: true }]);
    setMsg("");
  };

  const handleHoAction = (item, idx) => {
    const updatedFase = currentList.map((act) =>
      act.id === item.id ? { ...act, hoStatus: "COMPLETED" } : act
    );
    setActivities({ ...activities, [activeFase]: updatedFase });
    setAccNotif({
      show: true,
      title: "Verified",
      msg: `Unit ${item.kegiatan} berhasil divalidasi.`,
    });
    setTimeout(() => setAccNotif({ show: false, title: "", msg: "" }), 4000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="h-screen overflow-hidden flex bg-white !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />

      {/* NOTIFIKASI */}
      <AnimatePresence>
        {accNotif.show && (
          <motion.div
            initial={{ y: -100, x: "-50%", opacity: 0 }} animate={{ y: 20, x: "-50%", opacity: 1 }} exit={{ y: -100, x: "-50%", opacity: 0 }}
            className="fixed top-0 left-1/2 z-[600] w-[420px]"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-[#0AC4E0]/30 shadow-2xl rounded-[2.5rem] p-5 flex gap-4">
              <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0AC4E0]/30">
                <ShieldCheck size={24} />
              </div>
              <div className="text-left">
                <h4 className="text-[13px] font-bold text-slate-800 leading-none mb-1">{accNotif.title}</h4>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">{accNotif.msg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        {/* PROFESSIONAL HEADER SECTION */}
        <header className="shrink-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-10 py-5 flex items-center justify-between z-40 leading-none">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
              <Label
                text="Sistem Pemantauan dan Evaluasi Program"
                className="!text-[10px] !font-black !uppercase !tracking-[0.3em] !text-slate-400 !mb-0"
              />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              Monitoring Detail <span className="text-[#0AC4E0]">Non-Akademik</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              text="Kembali"
              icon={<ArrowLeft size={18} />}
              variant="outline"
              onClick={() => navigate(-1)}
              className="!rounded-2xl !px-6 !py-3.5 !text-sm !font-bold border-slate-100 !text-slate-500 hover:!bg-slate-50"
            />
            <Button
              text="Edit Program"
              icon={<Edit3 size={16} />}
              onClick={() => navigate(`/ho/program/non-akademik/edit/${id}`)}
              className="!bg-slate-800 hover:!bg-[#0AC4E0] !text-white !rounded-2xl !px-6 !py-3.5 !text-sm !font-bold shadow-xl transition-all"
            />
            <Button
              text="Diskusi"
              icon={<MessageSquare size={16} />}
              onClick={() => setShowChat(true)}
              className="!bg-[#0AC4E0] hover:!bg-[#09b3cc] !text-white !rounded-2xl !px-6 !py-3.5 !text-sm !font-bold shadow-xl shadow-[#0AC4E0]/20 transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 animate-in fade-in duration-700">

          {/* BENTO INFO CARD */}
          <section className="bg-white rounded-[3rem] border-2 border-[#0AC4E0]/40 p-10 shadow-[0_8px_30px_rgb(10,196,224,0.05)] relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
              <div className="w-24 h-24 bg-[#0AC4E0] rounded-[2.2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-[#0AC4E0]/30 text-white font-black text-3xl italic border-4 border-white uppercase">
                NA
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-[32px] font-black text-slate-800 leading-none uppercase tracking-tighter mb-2">
                  {program.nama_program}
                </h2>
                <p className="text-[11px] font-bold text-[#0AC4E0] uppercase tracking-[0.3em] mb-8 leading-none">
                  KODE: {program.kode_program} | TAHUN: {program.tahun}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pt-8 border-t border-[#0AC4E0]/20">
                  <InfoItem icon={<Building2 size={12} />} label="Institusi" value={program.sekolah} />
                  <InfoItem icon={<User size={12} />} label="Head Office" value={program.nama_pembuat} isHO />
                  <InfoItem icon={<UserCheck size={12} />} label="Area Officer" value={program.pengawas} />
                  <InfoItem icon={<MapPin size={12} />} label="Wilayah" value={`${program.wilayah_kota}, ${program.wilayah_provinsi}`} />
                  <InfoItem icon={<Briefcase size={12} />} label="Vendor" value={program.nama_vendor || "Internal"} />
                  <InfoItem icon={<Calendar size={12} />} label="Mulai" value={new Date(program.tanggal_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', day: 'numeric' })} />
                </div>
              </div>
            </div>
          </section>

          {/* FASE SWITCHER */}
          <div className="bg-gray-50 p-1.5 rounded-[2.2rem] flex gap-1 border border-gray-100">
            {FASES.map((f, idx) => {
              const isLocked = !checkPhaseUnlocked(idx);
              const isActive = activeFase === f.id;
              return (
                <button
                  key={f.id} disabled={isLocked}
                  onClick={() => { setActiveFase(f.id); setHandPointerId(null); }}
                  className={`flex-1 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                  ${isActive ? "bg-white text-[#0AC4E0] shadow-lg shadow-[#0AC4E0]/10" : isLocked ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {isLocked ? <Lock size={12} /> : <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[#0AC4E0] animate-pulse" : "bg-gray-300"}`} />}
                  {f.nama}
                </button>
              );
            })}
          </div>

          {/* TABLE MONITORING */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden mb-10">
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white/50">
              <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">Monitoring Unit - {FASES[activeFase].nama}</h3>
              {!currentPhaseAccessible && (
                <div className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Lock size={12} /> Fase Terkunci
                </div>
              )}
            </div>

            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-[#0AC4E0]">
                  <th className="px-10 py-6 text-center w-20 border-r border-white/10 rounded-tl-[3rem]">No</th>
                  <th className="px-10 py-6 border-r border-white/10">Deskripsi Unit</th>
                  <th className="px-10 py-6 border-r border-white/10">Output / Syarat</th>
                  <th className="px-10 py-6 text-center border-r border-white/10">Repository</th>
                  <th className="px-10 py-6 text-center border-r border-white/10">Verif AO</th>
                  <th className="px-10 py-6 text-right rounded-tr-[3rem]">Aksi Pusat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentList.map((item, idx) => {
                  let isRowLocked = !currentPhaseAccessible || (!item.isPhaseGate && !gateACC) || (idx > 0 && currentList[idx - 1].hoStatus !== "COMPLETED");
                  const isCompleted = item.hoStatus === "COMPLETED";

                  return (
                    <tr key={item.id} className={`transition-all ${item.isPhaseGate ? "bg-[#0AC4E0]/5" : "bg-white"} ${isRowLocked ? "opacity-30 grayscale pointer-events-none" : "hover:bg-[#0AC4E0]/5"}`}>
                      <td className="px-10 py-8 text-[12px] font-black text-slate-300 text-center">{idx + 1}</td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4 text-left">
                          {isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : isRowLocked ? <Lock size={18} className="text-red-300" /> : <Clock size={18} className="text-[#0AC4E0]" />}
                          <p className={`text-[13px] ${item.isPhaseGate ? "font-black text-[#0AC4E0] uppercase tracking-tighter" : "font-bold text-slate-700"}`}>
                            {item.kegiatan}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2 text-left">
                          {item.persyaratan.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-400">
                              {p.file ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-gray-200" />}
                              <span className={p.file ? "text-emerald-600" : "text-slate-300"}>{p.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <button onClick={() => setSelectedActivity(item)} className="p-3 bg-white border border-gray-100 text-slate-400 rounded-2xl hover:text-[#0AC4E0] hover:border-[#0AC4E0] transition-all flex items-center justify-center mx-auto active:scale-90 shadow-sm">
                          <Eye size={18} />
                        </button>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 mx-auto w-fit ${item.aoStatus === "ACC" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-slate-300"}`}>
                          <UserCheck size={16} /> {item.aoStatus === "ACC" ? "Verified" : "Waiting"}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right relative">
                        <div className="flex justify-end gap-3">
                          <button
                            disabled={item.aoStatus !== "ACC" || isCompleted}
                            onClick={() => handleHoAction(item, idx)}
                            className={`px-7 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95
                                  ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-800 text-white shadow-slate-200 hover:bg-[#0AC4E0]"}`}
                          >
                            {isCompleted ? "Selesai" : "Validasi HO"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL BERKAS (Drawer Kanan) */}
        <AnimatePresence>
          {selectedActivity && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedActivity(null)} className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 w-[420px] h-full bg-white z-[101] shadow-2xl flex flex-col border-l border-gray-100 text-left">
                <div className="p-8 bg-[#0AC4E0] text-white flex justify-between items-center shadow-lg shrink-0">
                  <div className="text-left leading-none">
                    <h4 className="text-[12px] font-black uppercase tracking-widest">Arsip Digital</h4>
                    <p className="text-[10px] text-white/80 font-bold uppercase mt-1 truncate max-w-[280px]">{selectedActivity.kegiatan}</p>
                  </div>
                  <button onClick={() => setSelectedActivity(null)}><X size={24} /></button>
                </div>
                <div className="p-8 space-y-4 overflow-y-auto no-scrollbar bg-gray-50 flex-1">
                  {selectedActivity.persyaratan.map((f, i) => (
                    <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-[#0AC4E0] transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0AC4E0]/10 text-[#0AC4E0] rounded-2xl flex items-center justify-center group-hover:bg-[#0AC4E0] group-hover:text-white transition-all"><FileText size={20} /></div>
                        <div className="leading-none">
                          <p className="text-[12px] font-black text-slate-800 uppercase mb-1">{f.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Verified by AO</p>
                        </div>
                      </div>
                      {f.file ? (
                        <button className="px-5 py-2 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase hover:bg-[#0AC4E0] transition-all">Buka</button>
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

        {/* MODAL DISKUSI (Chat Drawer) */}
        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed top-0 right-0 w-[420px] h-full bg-white z-[500] shadow-2xl flex flex-col border-l border-gray-100 text-left">
              <div className="px-10 py-8 bg-[#0AC4E0] text-white flex justify-between items-center shrink-0 shadow-lg leading-none">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xs uppercase">HO</div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-widest">Diskusi Program</h4>
                    <p className="text-[10px] text-white/80 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">Monitoring Active</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)}><X size={24} /></button>
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
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex items-center gap-4 shrink-0">
                <input
                  value={msg} onChange={(e) => setMsg(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ketik pesan diskusi..."
                  className="flex-1 bg-gray-50 rounded-full px-8 py-5 text-[14px] font-semibold outline-none border-none focus:ring-2 focus:ring-[#0AC4E0]/20 transition-all"
                />
                <button onClick={handleSendChat} className="w-16 h-16 bg-[#0AC4E0] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#0AC4E0]/30 hover:scale-105 active:scale-95 transition-all shrink-0">
                  <Send size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </PageWrapper>
  );
}

// HELPER COMPONENTS
const InfoItem = ({ icon, label, value, isHO }) => (
  <div className="text-left space-y-2">
    <div className="flex items-center gap-2 text-slate-300 leading-none">
      <div className={isHO ? "text-slate-200" : "text-[#0AC4E0]"}>{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
    </div>
    <p className={`text-[12px] font-black leading-tight truncate ${isHO ? "text-slate-200" : "text-slate-700"}`}>
      {value || "-"}
    </p>
  </div>
);