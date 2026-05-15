/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Edit3,
  RefreshCcw,
  ChevronLeft,
  Database,
  Sparkles,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  Fingerprint,
  Activity
} from "lucide-react";
import Swal from "sweetalert2";

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
        Swal.fire("Error", "Gagal mengambil data personil AO", "error");
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
      title: `<span class="text-xl font-black uppercase tracking-tighter text-[#083344]">Otoritas Keamanan</span>`,
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
        type: "error",
        message: "Akses Ditolak: Kunci Otoritas Tidak Valid.",
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );

  const displayWilayah = data?.wilayah?.length > 0
    ? data.wilayah.map((w) => w.nama_wilayah?.split("/").pop()).join(", ")
    : "Belum Ditugaskan";

  return (
    <PageWrapper className="h-screen bg-[#F0FDFA] flex overflow-hidden !p-0 font-sans text-[#083344]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-40 left-20 w-[300px] h-[300px] bg-[#0AC4E0]/5 rounded-full blur-[80px] -z-0" />

        {/* --- ALERT NOTIFICATION --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-10 right-10 z-[100] w-80"
            >
              <div className="bg-white border-2 border-[#0AC4E0] p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-200">
                  <ShieldAlert size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">Security Alert</p>
                  <p className="text-xs font-bold text-slate-600 leading-tight">{statusNote.message}</p>
                </div>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="text-slate-300 hover:text-[#0AC4E0]">
                  <XCircle size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl px-12 mb-8 flex items-end justify-between relative z-10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-[#CFFAFE] text-[#0AC4E0]">
                <Sparkles size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]">Personnel Bureau v2.0</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[#083344] uppercase leading-none">
              Identity <span className="text-[#0AC4E0]">Archive</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-[#0AC4E0]/10 border border-[#0AC4E0]/20 rounded-2xl">
            <Activity size={16} className="text-[#0AC4E0] animate-pulse" />
            <span className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest">Status: Active Node</span>
          </div>
        </motion.div>

        {/* MAIN DATA CARD */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
          className="w-full max-w-5xl bg-white rounded-t-[5rem] shadow-[0_-20px_80px_rgba(10,196,224,0.1)] border-t border-x border-[#CFFAFE] p-16 pb-40 relative z-10 overflow-y-auto no-scrollbar"
        >
          <div className="grid grid-cols-12 gap-16">

            {/* LEFT: AVATAR & PRIMARY */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="relative">
                <div className="w-44 h-44 bg-[#F0FDFA] rounded-[3.5rem] border-2 border-[#CFFAFE] flex items-center justify-center text-6xl font-black text-[#0AC4E0] shadow-inner">
                  {data?.nama?.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 p-4 rounded-3xl shadow-xl bg-[#083344] text-white border-4 border-white">
                  <Fingerprint size={24} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label text="Nama Lengkap" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-2" />
                  <div className="p-6 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-[2.5rem]">
                    <h2 className="text-2xl font-black tracking-tight uppercase text-[#083344]">{data?.nama}</h2>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label text="Keamanan Akses" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-2" />
                  <div className="flex items-center justify-between p-6 bg-[#083344] rounded-[2.5rem] shadow-xl border border-[#083344]">
                    <div className="flex items-center gap-4 text-white">
                      <Lock size={18} className="text-[#0AC4E0]" />
                      <span className={`font-mono text-sm tracking-[0.3em] font-black ${showPassword ? 'text-white' : 'text-[#164e63]'}`}>
                        {showPassword ? data?.password : "••••••••"}
                      </span>
                    </div>
                    <button onClick={handleRevealRequest} className="p-2 bg-[#164e63] rounded-xl text-[#0AC4E0] hover:bg-[#24717d] transition-all">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: DETAILS GRID */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 self-start">

              <div className="space-y-2">
                <Label text="Email Institusi" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center gap-4 p-6 bg-white border-2 border-[#CFFAFE] rounded-[2.5rem] shadow-sm">
                  <Mail size={18} className="text-[#0AC4E0]" />
                  <span className="text-sm font-bold text-[#083344] lowercase truncate">{data?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label text="Jabatan Struktural" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-center gap-4 p-6 bg-white border-2 border-[#CFFAFE] rounded-[2.5rem] shadow-sm">
                  <Briefcase size={18} className="text-[#0AC4E0]" />
                  <span className="text-sm font-black text-[#083344] uppercase">{data?.jabatan || "Area Officer Specialist"}</span>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label text="Regional Assignment" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                <div className="flex items-start gap-4 p-8 bg-[#0AC4E0]/5 border-2 border-[#0AC4E0]/20 rounded-[3rem]">
                  <MapPin size={24} className="text-[#0AC4E0] shrink-0" />
                  <div>
                    <h4 className="text-lg font-black text-[#083344] uppercase tracking-tighter leading-tight mb-1">{displayWilayah}</h4>
                    <p className="text-[10px] font-bold text-[#0AC4E0] uppercase tracking-widest">Cakupan Wilayah Tugas Aktif</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2 pt-4">
                <div className="flex items-center gap-6 p-6 bg-[#F0FDFA] border border-[#CFFAFE] rounded-[2.5rem]">
                  <Database size={20} className="text-[#0AC4E0]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">System Reference ID</span>
                    <span className="text-xs font-mono font-black text-[#083344]">UUID: {data?.id_user}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ACTION DOCK */}
        <div className="absolute bottom-[-10px] w-[450px] h-[110px] bg-white border-t-2 border-x-2 border-[#CFFAFE] rounded-t-[150px] z-20 flex items-center justify-center px-10 pb-4 shadow-2xl shadow-cyan-100">
          <div className="flex items-center gap-4 w-full justify-center">
            <button
              onClick={() => navigate("/admin/ao")}
              className="group flex items-center gap-3 px-8 py-4 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-full text-[#0AC4E0] hover:bg-[#E0F2FE] transition-all"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kembali</span>
            </button>

            <button
              onClick={() => navigate(`/admin/ao/edit/${id}`)}
              className="flex items-center gap-3 px-10 py-4 bg-[#0AC4E0] rounded-full text-white shadow-xl shadow-cyan-200 hover:bg-[#09b3cc] transition-all"
            >
              <Edit3 size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Edit Data</span>
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

export default DetailAO;