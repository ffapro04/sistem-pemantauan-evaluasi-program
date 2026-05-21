/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  School,
  MapPin,
  Award,
  Database,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  UserCheck,
  Mail,
  Hash,
  Users,
  GraduationCap,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import Label from "../../components/Label";

const DetailSekolahKadin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat profil unit sekolah", "error");
        navigate("/kadin/dashboard"); 
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#0AC4E0] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate("/kadin/dashboard")} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#0AC4E0] transition-all border-none cursor-pointer"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                </button>
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-tighter">
                    MONITORING <span className="text-cyan-100">PROFIL Sekolah</span>
                  </h1>
                  
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-white font-black text-[9px] uppercase tracking-widest">
                {/* 🌟 WARNA BARU DI SINI: text-cyan-100 */}
                <Database size={12} className="text-cyan-100" /> READ-ONLY ACCESS
              </div>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white custom-scrollbar">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              
              {/* TOP PROFILE CARD */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                {/* 🌟 WARNA BARU DI SINI: text-[#0AC4E0] */}
                <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#0AC4E0]">
                  <School size={48} strokeWidth={1.5} />
                </div>
                <div className="text-center md:text-left space-y-4 flex-1">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${data?.status ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <UserCheck size={12} />{" "}
                    {data?.status ? "Binaan YPAMDR" : "Bukan Binaan YPAMDR"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama_sekolah}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest italic">
                    <div className="flex items-center gap-1.5">
                      {/* 🌟 WARNA BARU DI SINI: text-[#0AC4E0] */}
                      <MapPin size={12} className="text-[#0AC4E0]" />{" "}
                      {data?.wilayah?.nama_wilayah
                        ?.split("/")
                        .filter(Boolean)
                        .pop()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-blue-500" /> Jenjang {data?.jenjang}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-orange-500" /> Grade {data?.akreditasi}
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID DATA INFORMASI & STATISTIK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                
                {/* 1. NPSN */}
                <div className="space-y-3">
                  <Label
                    text="Nomor NPSN Lembaga"
                    className="!text-[9px] text-[#0AC4E0] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                      <Hash size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm tracking-widest font-mono">
                      {data?.npsn || "-"}
                    </span>
                  </div>
                </div>

                {/* 2. EMAIL INSTITUSI */}
                <div className="space-y-3">
                  <Label
                    text="Email Resmi Lembaga"
                    className="!text-[9px] text-[#0AC4E0] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm lowercase">
                      {data?.email_login || "-"}
                    </span>
                  </div>
                </div>

                {/* 3. JUMLAH GURU BINAAN */}
                <div className="space-y-3">
                  <Label
                    text="Kapasitas Tenaga Pendidik (Guru)"
                    className="!text-[9px] text-[#0AC4E0] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                      <GraduationCap size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-gray-800 text-base">
                        {data?.jumlah_guru || 0} <span className="text-[10px] text-gray-400 font-bold uppercase">Personel</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. JUMLAH SISWA AKTIF */}
                <div className="space-y-3">
                  <Label
                    text="Total Siswa Didik Aktif"
                    className="!text-[9px] text-[#0AC4E0] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <Users size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-gray-800 text-base">
                        {data?.jumlah_siswa || 0} <span className="text-[10px] text-gray-400 font-bold uppercase">Siswa</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. ALAMAT LENGKAP (FULL WIDTH BARIS BARU) */}
                <div className="md:col-span-2 space-y-3">
                  <Label
                    text="Alamat Detail Entitas"
                    /* 🌟 WARNA BARU DI SINI: text-[#0AC4E0] */
                    className="!text-[9px] text-[#0AC4E0] uppercase font-black"
                  />
                  <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 min-h-[80px]">
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed uppercase">
                      {data?.alamat || "Alamat belum diinput ke pangkalan data."}
                    </p>
                  </div>
                </div>

              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end pt-6 pb-16">
                <Button
                  text="KEMBALI KE MAP JURISDIKSI"
                  onClick={() => navigate("/kadin/wilayahsekolah")}
                  className="!px-10 !py-2.5 !bg-[#0AC4E0] !text-black !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm active:scale-95 transition-all"
                />
              </div>

            </div>
          </div>
        </div>
      </main>
      
    
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10, 196, 224, 0.3); border-radius: 10px; }
      `}</style>
    </PageWrapper>
  );
};

export default DetailSekolahKadin;