/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Briefcase,
  Edit3,
  RefreshCcw,
  UserCheck,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

// Master Key khusus Otoritas Dinas Pendidikan
const MASTER_AUTH_KEY = "D1n4sP3nd1d1k4n";

const DetailKepalaDinas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal sinkronisasi data aparatur dinas", "error");
        navigate("/admin/kadin");
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

    // CUSTOM SWEETALERT - GOVERNMENT HIGH SECURITY UI
    const { value: inputKey } = await Swal.fire({
      title: `<div class="flex items-center justify-center gap-3 text-[#0F4C81] mb-2">
                <div class="p-2 bg-blue-50 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <span class="text-lg font-black tracking-tighter">SECURE VERIFICATION</span>
              </div>`,
      html: `<div class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 leading-relaxed">
               Sistem mendeteksi dekripsi kredensial Pejabat.<br/>Masukkan kunci otorisasi pusat Dinas Pendidikan.
             </div>`,
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
        style:
          "text-align: center; letter-spacing: 0.5em; font-weight: 900; border-radius: 1rem; border: 2px solid #E5E7EB; background: #F9FAFB; padding: 1rem; font-size: 14px;",
      },
      showCancelButton: true,
      confirmButtonText: "AUTHORIZE ACCESS",
      cancelButtonText: "CANCEL",
      reverseButtons: true,
      confirmButtonColor: "#0F4C81",
      cancelButtonColor: "#F3F4F6",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2.5rem] border-none p-10 shadow-2xl",
        input:
          "focus:!ring-4 focus:!ring-blue-100 focus:!border-[#0F4C81] transition-all !mx-0 !w-full",
        confirmButton:
          "px-8 py-4 bg-[#0F4C81] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:bg-[#0b3860] active:scale-95 transition-all w-full mb-3",
        cancelButton:
          "px-8 py-4 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all w-full",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: "Dinas Credential Decrypted Successfully",
      });
    } else if (inputKey) {
      Swal.fire({
        icon: "error",
        title: "ACCESS DENIED",
        text: "Master Authorization Key Dinas tidak valid!",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0F4F8]">
        <div className="flex flex-col items-center gap-4 text-[#0F4C81] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} />
          Retrieving Government Identity...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#F0F4F8] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          
          {/* Header Instansi Pemerintah */}
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#0F4C81] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/kadin")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white transition-all border border-white/20 shadow-lg hover:bg-white hover:text-[#0F4C81]"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  PROFIL <span className="text-cyan-200">KEPALA DINAS</span>
                </h1>
                <p className="text-[8px] font-bold text-cyan-100/70 tracking-widest uppercase italic mt-1.5">
                  Verified Government Structural Identity
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 rounded-[2.5rem] blur opacity-10 bg-blue-600"></div>
                  <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#0F4C81] overflow-hidden">
                    {data?.foto ? (
                      <img
                        src={`http://localhost:3000/uploads/${data.foto}`}
                        alt={data.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-black opacity-10 uppercase">
                        {data?.nama?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#0F4C81] text-white p-2 rounded-2xl shadow-xl border-4 border-white">
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="text-center md:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0F4C81] text-[8px] font-black uppercase tracking-widest">
                    <UserCheck size={12} /> Status Otoritas:{" "}
                    {data?.status ? "Aktif" : "Nonaktif"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama}
                  </h2>
                  <div className="inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-blue-50/50 text-[#0F4C81] border-blue-100">
                    {data?.jabatan || "KEPALA DINAS"}
                  </div>
                </div>
              </div>

              {/* Grid Input Tampilan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <Label
                    text="Nama Lengkap & Gelar Pejabat"
                    className="!text-[9px] text-[#0F4C81] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <User size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-tight">
                      {data?.nama}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Surat Elektronik Resmi (Email)"
                    className="!text-[9px] text-[#0F4C81] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm lowercase">
                      {data?.email}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Kata Sandi Akses Portal"
                    className="!text-[9px] text-[#0F4C81] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <Lock size={18} />
                      </div>
                      <span
                        className={`font-mono font-black text-sm tracking-widest ${showPassword ? "text-blue-600" : "text-gray-200"}`}
                      >
                        {showPassword
                          ? data?.password || "PASSWORD_NOT_FOUND"
                          : "••••••••"}
                      </span>
                    </div>
                    <button
                      onClick={handleRevealRequest}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#0F4C81] transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Kedudukan Struktural"
                    className="!text-[9px] text-[#0F4C81] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Briefcase size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-tight">
                      {data?.jabatan || "KEPALA DINAS"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel Aksi Bawah */}
              <div className="flex justify-end items-center gap-3 pt-10 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/kadin")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm"
                />
                <Button
                  text="MODIFIKASI PEJABAT"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/kadin/edit/${id}`)}
                  className="!bg-[#0F4C81] !text-white !px-12 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg border-none"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailKepalaDinas;