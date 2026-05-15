/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Database,
  Edit3,
  ShieldCheck,
  User,
  Tags,
  FileText,
  RefreshCcw,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  ShieldAlert,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        navigate("/admin/vendor");
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
      Swal.fire({
        icon: "error",
        title: "DITOLAK",
        text: "Kunci Otoritas Salah",
        confirmButtonColor: "#0AC4E0",
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );

  const isBermitra = data?.status === "Bermitra";

  return (
    <PageWrapper className="h-screen bg-[#F0FDFA] flex overflow-hidden !p-0 font-sans text-[#083344]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Dekorasi Background - Hanya Cyan/Putih */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-40 left-20 w-[300px] h-[300px] bg-[#0AC4E0]/5 rounded-full blur-[80px] -z-0" />

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl px-12 mb-8 flex items-end justify-between relative z-10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/vendor")}
                className="p-2 bg-white rounded-xl shadow-sm border border-[#CFFAFE] text-[#0AC4E0] hover:bg-[#E0F2FE]"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]">Cyan Protocol v2.0</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[#083344] uppercase">
              Vendor <span className="text-[#0AC4E0]">Profile</span>
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/admin/vendor/edit/${id}`)}
            className="flex items-center gap-3 px-8 py-4 bg-[#083344] text-white rounded-[2rem] shadow-2xl shadow-cyan-900/20"
          >
            <Edit3 size={16} className="text-[#0AC4E0]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Edit Protokol</span>
          </motion.button>
        </motion.div>

        {/* MAIN CONTENT CARD */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
          className="w-full max-w-6xl bg-white rounded-t-[5rem] shadow-[0_-20px_100px_rgba(10,196,224,0.05)] border-t border-x border-[#CFFAFE] p-16 pb-32 relative z-10 overflow-y-auto no-scrollbar"
        >
          <div className="grid grid-cols-12 gap-16">

            {/* LEFT: PRIMARY INFO */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="relative inline-block">
                <div className="w-48 h-48 bg-[#F0FDFA] rounded-[4rem] border-2 border-[#CFFAFE] flex items-center justify-center text-6xl font-black text-[#0AC4E0]">
                  {data?.nama_vendor?.charAt(0)}
                </div>
                <div className={`absolute -bottom-2 -right-2 p-4 rounded-3xl shadow-xl bg-[#0AC4E0] text-white border-4 border-white`}>
                  <ShieldCheck size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 ${isBermitra ? 'bg-[#0AC4E0] text-white border-[#0AC4E0]' : 'bg-white text-[#0AC4E0] border-[#0AC4E0]'}`}>
                  ● {isBermitra ? "Mitra Terverifikasi" : "Status Non-Aktif"}
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] text-[#083344]">
                  {data?.nama_vendor}
                </h2>
                <div className="flex items-center gap-2 text-[#0AC4E0]">
                  <Fingerprint size={16} />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">ID: {data?.no_register}</span>
                </div>
              </div>

              <div className="pt-8 space-y-4 border-t border-[#CFFAFE]">
                <Label text="Kredensial Akses" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest" />
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-5 bg-[#F0FDFA] rounded-[2rem] border border-[#CFFAFE]">
                    <Mail size={18} className="text-[#0AC4E0]" />
                    <span className="text-sm font-bold text-[#083344]">{data?.user?.email || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-[#083344] rounded-[2rem] border border-[#083344] shadow-xl">
                    <div className="flex items-center gap-4">
                      <Lock size={18} className="text-[#0AC4E0]" />
                      <span className={`font-mono text-sm tracking-[0.3em] font-black ${showPassword ? 'text-white' : 'text-[#164e63]'}`}>
                        {showPassword ? data?.user?.password : "••••••••"}
                      </span>
                    </div>
                    <button onClick={handleRevealRequest} className="p-2 bg-[#164e63] rounded-xl text-[#0AC4E0] hover:bg-[#24717d]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SECONDARY INFO GRID */}
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Pilar & Alamat */}
                <div className="col-span-2 grid grid-cols-2 gap-8">
                  <div className="p-8 rounded-[3rem] bg-[#0AC4E0]/10 border-2 border-[#0AC4E0]/20 flex flex-col justify-between h-40">
                    <Tags className="text-[#0AC4E0]" size={28} />
                    <div>
                      <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">Pilar Program</p>
                      <h4 className="text-xl font-black text-[#083344] uppercase tracking-tighter">{data?.pilar}</h4>
                    </div>
                  </div>
                  <div className="p-8 rounded-[3rem] bg-white border-2 border-[#CFFAFE] flex flex-col justify-between h-40 shadow-sm">
                    <MapPin className="text-[#0AC4E0]" size={28} />
                    <div>
                      <p className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">Domisili Operasional</p>
                      <h4 className="text-xs font-bold text-[#164e63] leading-relaxed uppercase">{data?.alamat}</h4>
                    </div>
                  </div>
                </div>

                {/* Penanggung Jawab */}
                <div className="space-y-4">
                  <Label text="Otoritas Representatif" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                  <div className="p-8 rounded-[3rem] bg-white border-2 border-[#CFFAFE] shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#CFFAFE] flex items-center justify-center text-[#0AC4E0]">
                        <User size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-[#083344] uppercase tracking-tight leading-none">{data?.pj_1 || "-"}</h5>
                        <p className="text-[10px] font-bold text-[#0AC4E0] uppercase mt-1 italic">PJ Utama</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-black text-[#083344] bg-[#CFFAFE] p-4 rounded-2xl border border-[#0AC4E0]/20">
                      <ShieldAlert size={14} className="text-[#0AC4E0]" />
                      {data?.telp_pj_1 || "DATA_NULL"}
                    </div>
                  </div>
                </div>

                {/* Dokumen */}
                <div className="space-y-4">
                  <Label text="Arsip Dokumen Cyan" className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest ml-4" />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-6 bg-[#F0FDFA] border border-[#CFFAFE] rounded-[2.5rem] group hover:bg-white hover:border-[#0AC4E0] transition-all">
                      <div className="flex items-center gap-4">
                        <FileText className="text-[#0AC4E0]" size={20} />
                        <div>
                          <p className="text-[10px] font-black text-[#0AC4E0] uppercase leading-none">Dokumen NPWP</p>
                          <p className="text-[11px] font-bold text-[#083344] mt-1 uppercase">{data?.npwp_file || "NPWP_MISSING"}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-[#0AC4E0]" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#F0FDFA] border border-[#CFFAFE] rounded-[2.5rem] group hover:bg-white hover:border-[#0AC4E0] transition-all">
                      <div className="flex items-center gap-4">
                        <Database className="text-[#0AC4E0]" size={20} />
                        <div>
                          <p className="text-[10px] font-black text-[#0AC4E0] uppercase leading-none">Scan KTP PJ</p>
                          <p className="text-[11px] font-bold text-[#083344] mt-1 uppercase">{data?.ktp_pj_file || "KTP_MISSING"}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-[#0AC4E0]" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM DOCK */}
        <div className="absolute bottom-[-10px] w-[450px] h-[100px] bg-white border-t-2 border-x-2 border-[#CFFAFE] rounded-t-[150px] z-20 flex items-center justify-center px-10 pb-4 shadow-2xl shadow-cyan-100">
          <button
            onClick={() => navigate("/admin/vendor")}
            className="group flex items-center gap-3 px-12 py-4 bg-[#F0FDFA] border-2 border-[#CFFAFE] rounded-full text-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white transition-all shadow-sm"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Kembali</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
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

export default DetailVendor;