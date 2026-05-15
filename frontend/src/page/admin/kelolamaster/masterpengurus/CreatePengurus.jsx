/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Database,
  Lock,
  ShieldAlert,
  KeyRound,
  Sparkles,
  Save,
  ChevronLeft,
  CheckCircle2,
  XCircle
} from "lucide-react";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const CreatePengurus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: 2,
    jabatan: "Ketua Pengurus",
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: ""
  });

  const jabatanOptions = [
    { value: "Admin", label: "SUPER ADMINISTRATOR" },
    { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
    { value: "Sekretaris", label: "SEKRETARIS" },
    { value: "Bendahara", label: "BENDAHARA" },
    { value: "Anggota Pengurus", label: "ANGGOTA PENGURUS" },
  ];

  useEffect(() => {
    if (formData.jabatan !== "Admin") setAdminKey("");
  }, [formData.jabatan]);

  const validateForm = () => {
    if (!formData.nama || !formData.email || !formData.password) {
      setStatusNote({
        show: true,
        type: 'error',
        message: "Otentikasi Gagal: Field identitas tidak boleh kosong."
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const finalData = { ...formData, id_role: formData.jabatan === "Admin" ? 1 : 2 };
      await axios.post("http://localhost:3000/users/register", finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusNote({ show: true, type: 'success', message: "Data Sinkron: Personil berhasil diaktifkan." });
      setTimeout(() => navigate("/admin/pengurus"), 2500);
    } catch (err) {
      setStatusNote({ show: true, type: 'error', message: "System Error: Gagal memproses pendaftaran." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

        {/* --- ERROR NOTE (KIRI) --- */}
        <AnimatePresence>
          {statusNote.show && statusNote.type === 'error' && (
            <motion.div
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
              className="fixed left-[320px] top-[45%] w-72 z-[100]"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-rose-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-rose-200"><XCircle size={28} /></div>
                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Validation Alert</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95">Dismiss</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SUCCESS NOTE (KANAN) --- */}
        <AnimatePresence>
          {statusNote.show && statusNote.type === 'success' && (
            <motion.div
              initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
              className="fixed right-12 top-[45%] w-72 z-[100]"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-emerald-200"><CheckCircle2 size={28} /></div>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Success Sync</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95">Continue</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. JUDUL FORM */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50">Sistem Pemantauan dan Evaluasi Program</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase">Registrasi Pengurus</h1>
        </motion.div>

        {/* 2. FORM BOX (GROUNDED / NEMPEL DASAR) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-3xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-20px_100px_rgba(10,196,224,0.1)] p-16 pb-40 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            <div className="space-y-3">
              <Label text="Nama Lengkap Database" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Input Full Name..." className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all shadow-sm" />
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <Label text="Email Institusi Otoritas" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@ypamdr.astra.co.id" className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all shadow-sm" />
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <Label text="Security Code (Password)" required className="!text-[10px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-2" />
              <div className="relative group">
                <Input type="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all shadow-sm" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <Label text="Posisi Jabatan" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
              <Dropdown icon={Briefcase} value={formData.jabatan} onChange={(val) => setFormData({ ...formData, jabatan: val })} items={jabatanOptions} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700" />
            </div>

            <AnimatePresence>
              {formData.jabatan === "Admin" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-8 bg-rose-50/50 border border-rose-100 rounded-[2.5rem] flex items-center gap-8 shadow-sm">
                  <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 shrink-0"><Database size={24} /></div>
                  <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Security Key Required</p>
                    <Input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Enter Auth Key..." className="!py-3 !bg-white !border-rose-200 !rounded-xl font-black text-rose-600 text-center tracking-[0.3em]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* 3. DOCK ACTION (OVERLAP DI FRONT) */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.2)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/pengurus")} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm">
              <ChevronLeft size={16} /> Kembali
            </button>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white ${formData.jabatan === "Admin" ? "bg-rose-600 shadow-rose-200" : "bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc]"}`}>
              <Save size={18} /> {loading ? "..." : "Simpan"}
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

export default CreatePengurus;