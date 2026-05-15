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
  Building2,
  Layers,
  ShieldCheck,
  Sparkles,
  Save,
  ChevronLeft,
  XCircle,
  CheckCircle2
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const CreateHO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "Staff Head Office",
    id_role: 3,
    jenis: "akademik",
    sub_jenis: "SD & SMP",
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
    if (formData.jenis === "non-akademik") {
      setFormData((prev) => ({ ...prev, sub_jenis: null }));
    } else if (formData.jenis === "akademik" && !formData.sub_jenis) {
      setFormData((prev) => ({ ...prev, sub_jenis: "SD & SMP" }));
    }
  }, [formData.jenis]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nama || !formData.email) {
      setStatusNote({ show: true, type: 'error', message: "Otoritas Ditolak: Mohon lengkapi identitas personil." });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/users/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusNote({ show: true, type: 'success', message: "Berhasil: Personil HO telah terdaftar." });
      setTimeout(() => navigate("/admin/ho"), 2500);
    } catch (err) {
      setStatusNote({ show: true, type: 'error', message: "Gagal menyimpan data ke database." });
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

        {/* --- VALIDATION SIDE NOTES --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[40%] w-72 z-[100]`}
            >
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'Validation Alert' : 'System Success'}
                </h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. JUDUL FORM (Ditarik kebawah mendekati form) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2 leading-none">
            <Sparkles size={20} className="text-[#0AC4E0]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]/60">Identity & Access Management</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">
            Registrasi Head Office
          </h1>
        </motion.div>

        {/* 2. FORM BOX (Nempel Dasar Layar) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-6xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-30px_100px_rgba(10,196,224,0.1)] p-16 pb-44 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          {/* Top Gradient Glass Effect */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">

              {/* KOLOM KIRI */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <Label text="Nama Lengkap Personil" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Input Full Name..."
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label text="Email Institusi" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      type="email"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ho@ypamdr.astra.co.id"
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label text="Security Password" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      type="password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <Label text="Jabatan Struktural" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      placeholder="Staff / Manager Head Office"
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all shadow-sm"
                    />
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label text="Department (Jenis)" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <Dropdown
                    icon={Building2}
                    value={formData.jenis}
                    onChange={(val) => setFormData({ ...formData, jenis: val })}
                    items={deptOptions}
                    className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700"
                  />
                </div>

                <div className={`space-y-3 transition-all duration-500 ${formData.jenis !== "akademik" ? "opacity-20 grayscale pointer-events-none" : "opacity-100"}`}>
                  <Label text="Fokus Bidang (Tingkat)" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <Dropdown
                    icon={Layers}
                    value={formData.sub_jenis}
                    disabled={formData.jenis !== "akademik"}
                    onChange={(val) => setFormData({ ...formData, sub_jenis: val })}
                    items={tingkatOptions}
                    className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* POLICY NOTE */}
            <div className="mt-12 p-8 bg-[#0AC4E0]/5 border-2 border-[#0AC4E0]/10 border-dashed rounded-[2.5rem] flex items-center gap-8 shadow-sm">
              <div className="w-14 h-14 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#0AC4E0]/30 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest leading-none">Security Access Policy</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Personil HO akan mendapatkan akses dashboard sesuai dengan Department yang dipilih (Akademik/Non-Akademik).</p>
              </div>
            </div>
          </form>
        </motion.div>

        {/* 3. DOCK ACTION (OVERLAP DI FRONT) */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button
              onClick={() => navigate("/admin/ho")}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none"
            >
              <ChevronLeft size={16} /> Kembali
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none"
            >
              <Save size={18} />
              {loading ? "..." : "Simpan Data"}
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

export default CreateHO;