/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  ShieldCheck,
  User,
  FileText,
  RefreshCcw,
  Tags,
  Eye,
  EyeOff,
  Lock,
  Database,
  Fingerprint,
  ChevronLeft,
  Save,
  XCircle,
  CheckCircle2,
  MapPin,
  ShieldAlert
} from "lucide-react";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

const CORRECT_PATTERN = "1236"; // Pola rahasia konsisten

const EditVendor = () => {
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
    nama_vendor: "",
    no_register: "",
    pilar: "Akademik",
    alamat: "",
    pj_1: "",
    email_pj_1: "",
    pj_2: "",
    email_pj_2: "",
    email: "",
    password: "",
    status: "Bermitra",
  });

  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        setFormData({
          nama_vendor: d.nama_vendor || "",
          no_register: d.no_register || "",
          pilar: d.pilar || "Akademik",
          alamat: d.alamat || "",
          pj_1: d.pj_1 || "",
          email_pj_1: d.telp_pj_1 || "",
          pj_2: d.pj_2 || "",
          email_pj_2: d.telp_pj_2 || "",
          email: d.user?.email || "",
          password: d.user?.password || "",
          status: d.status || "Bermitra",
        });
      } catch (err) {
        navigate("/admin/vendor");
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
        message: "Otoritas Vendor Ditolak: Pola tidak valid."
      });
      setActivePattern([]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        pilar: formData.pilar,
        alamat: formData.alamat,
        pj_1: formData.pj_1,
        telp_pj_1: formData.email_pj_1,
        pj_2: formData.pj_2,
        telp_pj_2: formData.email_pj_2,
        email: formData.email,
        status: formData.status,
      };
      if (formData.password) payload.password = formData.password;

      await axios.patch(`http://localhost:3000/vendor/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusNote({ show: true, type: 'success', message: "Sinkronisasi Berhasil: Data rekanan telah diperbarui." });
      setTimeout(() => navigate("/admin/vendor"), 2500);
    } catch (err) {
      setLoading(false);
      setStatusNote({ show: true, type: 'error', message: "Database Error: Gagal mengupdate profil vendor." });
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
              <div className="text-center mb-16 leading-none">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Vendor Authorization</h2>
                <p className="text-sm text-slate-400">Gunakan pola otoritas untuk memodifikasi data rekanan</p>
              </div>

              <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10 select-none">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div key={num} onMouseDown={() => handleStart(num)} onMouseEnter={() => handleEnter(num)} className="relative w-12 h-12 flex items-center justify-center cursor-pointer">
                      <motion.div animate={{ scale: activePattern.includes(num) ? 1.5 : 1, backgroundColor: activePattern.includes(num) ? "#0AC4E0" : "rgba(255,255,255,0.2)" }} className="w-4 h-4 rounded-full shadow-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate(-1)} className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Abnormal Abort</button>
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

        <motion.div className="mb-8 text-center z-10 leading-none">
          <div className="flex items-center justify-center gap-2 mb-2 leading-none">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50">Partner Database Protocol</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">Edit Vendor</h1>
        </motion.div>

        <motion.div
          className="w-full max-w-5xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-20px_100px_rgba(10,196,224,0.1)] p-12 pb-44 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-y-auto no-scrollbar"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

            {/* --- LEFT SIDE: IDENTITY (LOCKED) --- */}
            <div className="space-y-8">
              <div className="space-y-3 opacity-60">
                <Label text="Nama Lembaga (Sistem Terkunci)" className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] relative cursor-not-allowed">
                  <Building2 className="text-slate-200" size={20} />
                  <span className="text-[16px] font-bold text-slate-300 uppercase tracking-tight">{formData.nama_vendor}</span>
                </div>
              </div>

              <div className="space-y-3 opacity-60">
                <Label text="Nomor Register (Fixed)" className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] relative cursor-not-allowed">
                  <Database className="text-slate-200" size={20} />
                  <span className="text-[16px] font-bold text-slate-300 tracking-widest uppercase">{formData.no_register}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Email Login Sistem" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Update Password" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0AC4E0]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* --- RIGHT SIDE: CONFIGURATION (ACTIVE) --- */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label text="Pilar Program" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <Dropdown icon={Tags} value={formData.pilar} onChange={(val) => setFormData({ ...formData, pilar: val })} items={[{ label: "AKADEMIK", value: "Akademik" }, { label: "KARAKTER", value: "Karakter" }, { label: "SENI BUDAYA", value: "Seni Budaya" }, { label: "KECAKAPAN HIDUP", value: "Kecakapan Hidup" }]} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[13px] !font-black text-slate-700" />
                </div>
                <div className="space-y-3">
                  <Label text="Status Kemitraan" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <Dropdown icon={ShieldCheck} value={formData.status} onChange={(val) => setFormData({ ...formData, status: val })} items={[{ label: "BERMITRA", value: "Bermitra" }, { label: "NON-MITRA", value: "Tidak Bermitra" }]} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[13px] !font-black text-slate-700" />
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Nama PJ Utama" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input value={formData.pj_1} onChange={(e) => setFormData({ ...formData, pj_1: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold" />
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Kontak PJ Utama" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input value={formData.email_pj_1} onChange={(e) => setFormData({ ...formData, email_pj_1: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold" />
                  <ShieldAlert className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Alamat Operasional" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Textarea value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.5rem] !text-[14px] !font-bold min-h-[100px]" />
                  <MapPin className="absolute left-6 top-8 text-slate-300" size={20} />
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* --- DOCK ACTION --- */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/vendor")} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none">
              <ChevronLeft size={16} /> Batal
            </button>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none`}>
              <Save size={18} /> {loading ? "..." : "Commit Update"}
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

export default EditVendor;