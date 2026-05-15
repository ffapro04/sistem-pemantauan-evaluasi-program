/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  MapPin,
  Award,
  Database,
  Edit3,
  ShieldCheck,
  Lock,
  Mail,
  Hash,
  Eye,
  EyeOff,
  ShieldAlert,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Fingerprint,
  Activity
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailSekolah = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Side Notes (Strict Cyan)
  const [statusNote, setStatusNote] = useState({
    show: false,
    message: ""
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        navigate("/admin/sekolah");
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
      title: `<span class="text-xl font-black uppercase tracking-tighter text-[#083344]">Otoritas Unit</span>`,
      html: `<p class="text-[10px] font-bold text-[#0AC4E0] uppercase tracking-[0.2em] mb-4">Input Master Key Protokol Cyan</p>`,
      input: "password",
      inputPlaceholder: "••••••••••••",
      showCancelButton: true,
      confirmButtonText: "AUTHORIZE",
      confirmButtonColor: "#0AC4E0",
      cancelButtonColor: "#CFFAFE",
      customClass: {
        popup: "rounded-[3rem] p-10 shadow-2xl border-2 border-[#0AC4E0] bg-white",
        input: "rounded-2xl border-2 border-[#CFFAFE] text-center tracking-[0.5em] font-black focus:border-[#0AC4E0] focus:ring-0 text-[#083344]",
        confirmButton: "rounded-full px-10 py-4 text-[10px] font-black tracking-widest uppercase shadow-xl shadow-cyan-200",
        cancelButton: "rounded-full px-10 py-4 text-[10px] font-black tracking-widest uppercase text-[#0AC4E0]",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);
    } else if (inputKey) {
      setStatusNote({
        show: true,
        message: "Akses Ditolak: Kunci Otoritas Unit Tidak Valid."
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );

  const isBinaan = data?.status === true;

  return (
    <PageWrapper className="h-screen bg-[#F0FDFA] flex overflow-hidden !p-0 font-sans text-[#083344] leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-40 left-20 w-[300px] h-[300px] bg-[#0AC4E0]/5 rounded-full blur-[80px] -z-0" />

        {/* --- SECURITY ALERT NOTIFICATION --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-10 right-10 z-[100] w-80"
            >
              <div className="bg-white border-2 border-[#0AC4E0] p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                  <ShieldAlert size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">Security Alert</p>
                  <p className="text-xs font-bold text-[#083344] leading-tight">{statusNote.message}</p>
                </div>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="text-[#0AC4E0] hover:scale-110 transition-transform">
                  <XCircle size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl px-12 mb-8 flex items-end justify-between relative z-10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-[#CFFAFE] text-[#0AC4E0]">
                <Activity size={16} className="animate-pulse" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]">Educational Hub Protocol</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[#083344] uppercase leading-none">
              Profil <span className="text-[#0AC4E0]">Unit</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 ${isBinaan ? 'bg-[#0AC4E0] text-white border-[#0AC4E0]' : 'bg-white text-[#0AC4E0] border-[#0AC4E0]'}`}>
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{isBinaan ? 'Unit Binaan Aktif' : 'Non-Binaan Protocol'}</span>
            </div>
          </div>
        </motion.div>

        {/* 2. DATA BOX SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-5xl bg-white rounded-t-[5rem] shadow-[0_-20px_80px_rgba(10,196,224,0.1)] p-16 pb-44 border-t border-x border-[#CFFAFE] relative z-10 overflow-y-auto no-scrollbar"
        >
          <div className="grid grid-cols-12 gap-16">

            {/* LEFT SIDE: PRIMARY IDENTIFIER */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="relative">
                <div className="w-44 h-44 bg-[#F0FDFA] rounded-[3.5rem] border-2 border-[#CFFAFE] flex items-center justify-center text-[#0AC4E0] shadow-inner">
                  <School size={80} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 p-4 rounded-3xl shadow-xl bg-[#083344] text-white border-4 border-white">
                  <Fingerprint size={24} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label text="Nama Institusi" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-2" />
                  <div className="p-6 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-[2.5rem]">
                    <h2 className="text-2xl font-black tracking-tight uppercase text-[#083344] leading-tight">{data?.nama_sekolah}</h2>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label text="Regional Protocol" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-2" />
                  <div className="flex items-center gap-4 p-5 bg-white border-2 border-[#CFFAFE] rounded-[2.2rem]">
                    <MapPin size={18} className="text-[#0AC4E0]" />
                    <span className="text-sm font-black text-[#083344] uppercase">{data?.wilayah?.nama_wilayah?.split("/").pop()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: SPECIFICATIONS */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 self-start">

              <div className="space-y-2">
                <Label text="NPSN Database" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center gap-4 p-6 bg-white border-2 border-[#CFFAFE] rounded-[2.5rem] shadow-sm">
                  <Hash size={18} className="text-[#0AC4E0]" />
                  <span className="text-sm font-mono font-black text-[#083344] tracking-widest">{data?.npsn}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label text="Akreditasi Grade" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center gap-4 p-6 bg-white border-2 border-[#CFFAFE] rounded-[2.5rem] shadow-sm">
                  <Award size={18} className="text-[#0AC4E0]" />
                  <span className="text-sm font-black text-[#083344] uppercase tracking-widest">Grade: {data?.akreditasi}</span>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label text="Email Akses Unit" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center gap-4 p-6 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-[2.5rem]">
                  <Mail size={18} className="text-[#0AC4E0]" />
                  <span className="text-sm font-bold text-[#083344] lowercase truncate">{data?.email_login}</span>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label text="Kredensial Password" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center justify-between p-6 bg-[#083344] rounded-[2.5rem] shadow-xl border border-[#083344]">
                  <div className="flex items-center gap-4 text-white">
                    <Lock size={18} className="text-[#0AC4E0]" />
                    <span className={`font-mono text-sm tracking-[0.4em] font-black ${showPassword ? 'text-white' : 'text-[#164e63]'}`}>
                      {showPassword ? data?.password_login : "••••••••"}
                    </span>
                  </div>
                  <button onClick={handleRevealRequest} className="p-2 bg-[#164e63] rounded-xl text-[#0AC4E0] hover:bg-[#24717d] transition-all">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2 p-8 bg-[#0AC4E0]/5 border border-[#0AC4E0]/20 rounded-[3rem] flex items-start gap-6 mt-4">
                <Database size={24} className="text-[#0AC4E0] shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest">Security Status</p>
                  <p className="text-xs font-bold text-[#083344]/60 leading-relaxed uppercase">
                    Data unit terenkripsi secara otomatis. Segala perubahan akan dicatat dalam log sistem YPAMDR.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* 3. DOCK ACTION */}
        <div className="absolute bottom-[-10px] w-[450px] h-[110px] bg-white border-t-2 border-x-2 border-[#CFFAFE] rounded-t-[150px] z-30 shadow-2xl shadow-cyan-100 flex items-center justify-center px-10 pb-4">
          <div className="flex items-center gap-4 w-full justify-center">
            <button
              onClick={() => navigate("/admin/sekolah")}
              className="group flex items-center gap-3 px-8 py-4 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-full text-[#0AC4E0] hover:bg-[#E0F2FE] transition-all"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kembali</span>
            </button>

            <button
              onClick={() => navigate(`/admin/sekolah/edit/${id}`)}
              className="flex items-center gap-3 px-10 py-4 bg-[#0AC4E0] rounded-full text-white shadow-xl shadow-cyan-200 hover:bg-[#09b3cc] transition-all"
            >
              <Edit3 size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Modifikasi</span>
            </button>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </PageWrapper>
  );
};

export default DetailSekolah;