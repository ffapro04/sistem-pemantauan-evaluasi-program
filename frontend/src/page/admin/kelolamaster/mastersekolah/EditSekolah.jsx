/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  Mail,
  MapPin,
  Award,
  Hash,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Save,
  ChevronLeft,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Fingerprint,
  ShieldAlert
} from "lucide-react";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

const CORRECT_PATTERN = "1236"; // Pola: Atas kiri -> tengah -> kanan -> bawah kanan

const EditSekolah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE OTORISASI POLA ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- STATE DATA ---
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama_sekolah: "",
    alamat: "",
    jenjang: "SD",
    npsn: "",
    akreditasi: "A",
    email_login: "",
    password_login: "",
    status: true,
  });

  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setFormData({
            nama_sekolah: res.data.nama_sekolah || "",
            alamat: res.data.alamat || "",
            jenjang: res.data.jenjang || "SD",
            npsn: res.data.npsn || "",
            akreditasi: res.data.akreditasi || "A",
            email_login: res.data.email_login || "",
            password_login: res.data.password_login || "",
            status: res.data.status,
          });
        }
      } catch (err) {
        navigate("/admin/sekolah");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // --- LOGIKA DRAWING PATTERN ---
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
        message: "Otoritas Ditolak: Pola enkripsi tidak sesuai."
      });
      setActivePattern([]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/sekolah/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusNote({ show: true, type: 'success', message: "Database Terupdate: Kredensial unit telah berhasil dimodifikasi." });
      setTimeout(() => navigate("/admin/sekolah"), 2500);
    } catch (err) {
      setLoading(false);
      setStatusNote({ show: true, type: 'error', message: "System Failure: Gagal mengunggah data ke server." });
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
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
              <div className="text-center mb-16 leading-none">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Unit Authorization</h2>
                <p className="text-sm text-slate-400">Verifikasi pola untuk memodifikasi data unit binaan</p>
              </div>

              <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10 select-none">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      onMouseDown={() => handleStart(num)}
                      onMouseEnter={() => handleEnter(num)}
                      className="relative w-12 h-12 flex items-center justify-center cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          scale: activePattern.includes(num) ? 1.5 : 1,
                          backgroundColor: activePattern.includes(num) ? "#0AC4E0" : "rgba(255,255,255,0.2)"
                        }}
                        className="w-4 h-4 rounded-full shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate(-1)} className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Emergency Exit</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LAYER 2: FORM CONTENT --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

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
                  {statusNote.type === 'error' ? 'ACCESS DENIED' : 'SYSTEM SUCCESS'}
                </h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>Got It</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="mb-8 text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-2 leading-none">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50 uppercase">Infrastructure Update Protocol</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">Edit Unit Binaan</h1>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-20px_100px_rgba(10,196,224,0.1)] p-12 pb-48 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-y-auto no-scrollbar"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

            {/* NPSN (Locked) */}
            <div className="space-y-3 opacity-60">
              <Label text="NPSN (Sistem Terkunci)" className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative cursor-not-allowed">
                <Hash className="text-slate-200" size={20} />
                <span className="text-[16px] font-bold text-slate-300 tracking-widest">{formData.npsn}</span>
              </div>
            </div>

            {/* Nama Sekolah */}
            <div className="space-y-3">
              <Label text="Nama Resmi Unit" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input value={formData.nama_sekolah} onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                <School className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            {/* Jenjang */}
            <div className="space-y-3">
              <Label text="Jenjang Pendidikan" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <Dropdown icon={BookOpen} value={formData.jenjang} onChange={(val) => setFormData({ ...formData, jenjang: val })} items={[{ label: "SD", value: "SD" }, { label: "SMP", value: "SMP" }, { label: "SMA", value: "SMA" }, { label: "SMK", value: "SMK" }]} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700" />
            </div>

            {/* Akreditasi */}
            <div className="space-y-3">
              <Label text="Grade Akreditasi" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <Dropdown icon={Award} value={formData.akreditasi} onChange={(val) => setFormData({ ...formData, akreditasi: val })} items={[{ label: "Grade A", value: "A" }, { label: "Grade B", value: "B" }, { label: "Grade C", value: "C" }]} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700" />
            </div>

            {/* Alamat (Full Width) */}
            <div className="md:col-span-2 space-y-3">
              <Label text="Alamat Operasional" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Textarea value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[3rem] !text-[14px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" rows={3} />
                <MapPin className="absolute left-6 top-8 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            {/* Email (Locked Style) */}
            <div className="space-y-3 opacity-60">
              <Label text="Email Login (Fixed)" className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative cursor-not-allowed">
                <Mail className="text-slate-200" size={20} />
                <span className="text-[15px] font-bold text-slate-300">{formData.email_login}</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label text="Update Access Code" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input type={showPassword ? "text" : "password"} value={formData.password_login} onChange={(e) => setFormData({ ...formData, password_login: e.target.value })} className="!py-5 !pl-14 !pr-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0AC4E0]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

          </form>
        </motion.div>

        {/* DOCK ACTION */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/sekolah")} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm">
              <ChevronLeft size={16} /> Batal
            </button>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc]`}>
              <Save size={18} /> {loading ? "Updating..." : "Commit Changes"}
            </button>
          </div>
        </motion.div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </PageWrapper>
  );
};

export default EditSekolah;