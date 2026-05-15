/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Database,
  Lock,
  ShieldCheck,
  Edit3,
  RefreshCcw,
  ChevronLeft,
  XCircle,
  CheckCircle2,
  LockIcon,
  Fingerprint,
  Sparkles,
  Building2,
  Layers,
  Save
} from "lucide-react";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";
const CORRECT_PATTERN = "1236"; // Pola: L terbalik (Baris atas 1-2-3 lalu turun ke 6)

const EditHO = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE OTORISASI POLA ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- STATE DATA ---
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "",
    jenis: "akademik",
    sub_jenis: "",
  });

  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  const deptOptions = [
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const tingkatOptions = [
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        setFormData({
          nama: user.nama || "",
          email: user.email || "",
          password: user.password || "",
          jabatan: user.jabatan || "Staff Head Office",
          jenis: user.jenis || "akademik",
          sub_jenis: user.sub_jenis || "",
        });
      } catch (error) {
        navigate("/admin/ho");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, navigate]);

  // Logic: Reset sub_jenis jika pindah ke non-akademik
  useEffect(() => {
    if (formData.jenis === "non-akademik") {
      setFormData((prev) => ({ ...prev, sub_jenis: null }));
    }
  }, [formData.jenis]);

  // --- LOGIKA PATTERN LOCK ---
  const handleStart = (num) => {
    setIsDragging(true);
    setActivePattern([num]);
  };

  const handleEnter = (num) => {
    if (isDragging && !activePattern.includes(num)) {
      setActivePattern((prev) => [...prev, num]);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    const result = activePattern.join("");
    if (result === CORRECT_PATTERN) {
      setIsUnlocked(true);
      setStatusNote({ show: false });
    } else if (result.length > 0) {
      setStatusNote({
        show: true,
        type: 'error',
        message: "Anda bukan admin dan tak dikenal."
      });
      setActivePattern([]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/users/${id}`, { ...formData, id_role: 3 }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: 'success',
        message: "Update Berhasil: Kredensial HO telah disinkronkan."
      });

      setTimeout(() => navigate("/admin/ho"), 2500);
    } catch (error) {
      setStatusNote({ show: true, type: 'error', message: "Gagal menyimpan perubahan ke server." });
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
    </div>
  );

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end" onMouseUp={handleEnd}>

        {/* --- LAYER 1: PATTERN LOCK SCREEN --- */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ y: -1000, filter: "blur(40px)", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[200] bg-slate-900/80 backdrop-blur-3xl flex flex-col items-center justify-center text-white"
            >
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Security Authorization</h2>
                <p className="text-sm text-slate-400">Tarik pola otoritas untuk memodifikasi data HO</p>
              </div>

              <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10 select-none">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div key={num} onMouseDown={() => handleStart(num)} onMouseEnter={() => handleEnter(num)} className="relative w-12 h-12 flex items-center justify-center cursor-pointer">
                      <motion.div
                        animate={{ scale: activePattern.includes(num) ? 1.5 : 1, backgroundColor: activePattern.includes(num) ? "#0AC4E0" : "rgba(255,255,255,0.2)" }}
                        className="w-4 h-4 rounded-full shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate(-1)} className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Batalkan Otorisasi</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LAYER 2: EDIT FORM (SAMA PERSIS DETAIL) --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

        {/* Side Notes Validation */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[45%] w-72 z-[250]`}
            >
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'Access Denied' : 'System Sync'}
                </h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>Got It</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Judul Melayang */}
        <motion.div className="mb-8 text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-2 leading-none">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]/50 uppercase">Update HQ Personnel System</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">Edit Head Office</h1>
        </motion.div>

        {/* FORM BOX (UKURAN IDENTIK DENGAN DETAIL) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-3xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-30px_100px_rgba(10,196,224,0.1)] p-16 pb-48 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            {/* Field Nama (Locked - Identik Detail) */}
            <div className="space-y-3 opacity-60">
              <Label text="Nama Lengkap Personil (Sistem Terkunci)" className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
              <div className="flex items-center gap-6 px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative cursor-not-allowed">
                <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
                <span className="text-[16px] font-bold text-slate-300 uppercase tracking-tight">{formData.nama}</span>
              </div>
            </div>

            {/* Field Email (Editable) */}
            <div className="space-y-3">
              <Label text="Update Email Institusi" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            {/* Field Password (Editable) */}
            <div className="space-y-3">
              <Label text="Update Security Password" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            {/* Field Jabatan & Dept (2 Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label text="Jabatan Struktural" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[14px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                  <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={18} />
                </div>
              </div>
              <div className="space-y-3">
                <Label text="Divisi Department" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <Dropdown icon={Building2} value={formData.jenis} onChange={(val) => setFormData({ ...formData, jenis: val })} items={deptOptions} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-sm !font-black text-slate-700" />
              </div>
            </div>

            {/* Bidang/Tingkat */}
            <div className={`space-y-3 transition-all duration-500 ${formData.jenis !== "akademik" ? "opacity-20 grayscale pointer-events-none" : "opacity-100"}`}>
              <Label text="Fokus Bidang (Tingkat)" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <Dropdown icon={Layers} value={formData.sub_jenis} disabled={formData.jenis !== "akademik"} onChange={(val) => setFormData({ ...formData, sub_jenis: val })} items={tingkatOptions} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-sm !font-black text-slate-700" />
            </div>
          </form>
        </motion.div>

        {/* DOCK ACTION (Identik Detail) */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/ho")} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none">
              <ChevronLeft size={16} /> Kembali
            </button>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none`}>
              <Save size={18} /> {loading ? "..." : "Simpan Update"}
            </button>
          </div>
        </motion.div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </PageWrapper>
  );
};

export default EditHO;