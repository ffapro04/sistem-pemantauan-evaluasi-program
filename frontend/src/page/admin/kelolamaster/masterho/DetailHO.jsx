/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  ShieldCheck,
  Edit3,
  RefreshCcw,
  ChevronLeft,
  Sparkles,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  LockIcon
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailAO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Side Notes
  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        navigate("/admin/ao");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleRevealRequest = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }

    const { value: inputKey } = await Swal.fire({
      title: `<div class="flex flex-col items-center gap-3 mb-2">
                <div class="p-3 bg-[#0AC4E0]/10 rounded-2xl text-[#0AC4E0]">
                   <ShieldAlert size={32} />
                </div>
                <span class="text-lg font-black text-slate-800 uppercase">Verification</span>
              </div>`,
      html: `<p class="text-xs font-medium text-slate-500">Otorisasi Master diperlukan untuk dekripsi.</p>`,
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: "MASTER_KEY",
        style: "text-align: center; font-weight: 800; border-radius: 1rem; border: 2px solid #F1F5F9; background: #F8FAFC; padding: 0.8rem;"
      },
      showCancelButton: true,
      confirmButtonText: "Authorize",
      confirmButtonColor: "#0AC4E0",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2.5rem] border-none shadow-2xl p-8",
        confirmButton: "w-full py-3.5 bg-[#0AC4E0] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg mb-2 active:scale-95",
        cancelButton: "w-full py-3.5 bg-gray-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);
    } else if (inputKey) {
      setStatusNote({ show: true, type: 'error', message: "Akses Ditolak: Key tidak valid." });
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayWilayah = data?.wilayah?.length > 0
    ? data.wilayah.map(w => w.nama_wilayah?.split("/").pop()).join(", ")
    : "BELUM DITUGASKAN";

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Background Mesh Decor */}
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
              <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 bg-slate-900 text-white shadow-xl">Got It</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. JUDUL FORM (MELAYANG DI ATAS FORM) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-2 leading-none">
            <Sparkles size={16} className="text-[#0AC4E0]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]/50 leading-none">Identity Information</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">Detail Area Officer</h1>
        </motion.div>

        {/* 2. DATA BOX (GROUNDED - RATA BAWAH) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-5xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-30px_100px_rgba(10,196,224,0.1)] p-16 pb-48 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          {/* GRID LAYOUT (2 KOLOM) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">

            {/* KOLOM KIRI */}
            <div className="space-y-10">
              {/* Field Nama - Rata Kiri */}
              <div className="space-y-3">
                <Label text="Nama Lengkap Database" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative">
                  <User size={20} className="text-slate-300" />
                  <span className="text-[16px] font-bold text-slate-800 uppercase tracking-tight leading-none">{data?.nama}</span>
                </div>
              </div>

              {/* Field Email - Rata Kiri */}
              <div className="space-y-3">
                <Label text="Email Korporat Otoritas" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative">
                  <Mail size={20} className="text-slate-300" />
                  <span className="text-[16px] font-bold text-slate-700 lowercase leading-none">{data?.email}</span>
                </div>
              </div>

              {/* Field Password - Rata Kiri */}
              <div className="space-y-3">
                <Label text="Security Code (Password)" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center justify-between px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative group transition-all hover:bg-white">
                  <div className="flex items-center gap-6 leading-none">
                    <Lock size={20} className="text-[#0AC4E0]" />
                    <span className={`font-mono text-xl font-black tracking-[0.3em] leading-none ${showPassword ? 'text-[#0AC4E0]' : 'text-slate-200'}`}>
                      {showPassword ? data?.password : "••••••••"}
                    </span>
                  </div>
                  <button
                    onClick={handleRevealRequest}
                    className="p-2 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-[#0AC4E0] transition-all active:scale-90"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-10">
              {/* Field Jabatan - Rata Kiri */}
              <div className="space-y-3">
                <Label text="Posisi Jabatan Struktural" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative">
                  <Briefcase size={20} className="text-slate-300" />
                  <span className="text-[16px] font-bold text-slate-700 uppercase tracking-tight leading-none">{data?.jabatan || "AREA OFFICER"}</span>
                </div>
              </div>

              {/* Field Wilayah - Rata Kiri */}
              <div className="space-y-3">
                <Label text="Wilayah Penugasan Regional" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="flex items-center gap-6 px-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.2rem] relative overflow-hidden">
                  <MapPin size={20} className="text-[#0AC4E0] shrink-0" />
                  <span className="text-[16px] font-black text-[#0AC4E0] uppercase truncate leading-none">{displayWilayah}</span>
                </div>
              </div>

              {/* Security Guideline Badge */}
              <div className="pt-4">
                <div className="flex items-center gap-5 p-7 bg-[#0AC4E0]/5 border-2 border-[#0AC4E0]/10 border-dashed rounded-[2.5rem]">
                  <ShieldCheck className="text-[#0AC4E0] shrink-0" size={28} />
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic text-left">
                    Identitas Area Officer (AO) bersifat rahasia dan <br /> terverifikasi secara resmi dalam sistem pilar.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 3. DOCK ACTION (FRONT OVERLAP) */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.2)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            {/* Tombol Kembali */}
            <button
              onClick={() => navigate("/admin/ao")}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none"
            >
              <ChevronLeft size={16} /> Kembali
            </button>

            {/* Tombol Edit */}
            <button
              onClick={() => navigate(`/admin/ao/edit/${id}`)}
              className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none`}
            >
              <Edit3 size={18} /> Edit Data
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

export default DetailAO;