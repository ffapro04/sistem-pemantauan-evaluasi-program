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
  ShieldAlert,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailPengurus = () => {
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
        Swal.fire("Error", "Gagal sinkronisasi data personil", "error");
        navigate("/admin/pengurus");
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

    // CUSTOM SWEETALERT - HIGH SECURITY UI
    const { value: inputKey } = await Swal.fire({
      title: `<div class="flex items-center justify-center gap-3 text-[#1E5AA5] mb-2">
                <div class="p-2 bg-blue-50 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <span class="text-lg font-black tracking-tighter">SECURITY VERIFICATION</span>
              </div>`,
      html: `<div class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 leading-relaxed">
               Sistem mendeteksi permintaan akses kredensial.<br/>Masukkan kunci otorisasi pusat untuk dekripsi.
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
      confirmButtonColor: "#1E5AA5",
      cancelButtonColor: "#F3F4F6",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2.5rem] border-none p-10 shadow-2xl",
        input:
          "focus:!ring-4 focus:!ring-blue-100 focus:!border-[#1E5AA5] transition-all !mx-0 !w-full",
        confirmButton:
          "px-8 py-4 bg-[#1E5AA5] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:bg-[#164a8a] active:scale-95 transition-all w-full mb-3",
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
        title: "Credential Decrypted Successfully",
      });
    } else if (inputKey) {
      Swal.fire({
        icon: "error",
        title: "ACCESS DENIED",
        text: "Master Authorization Key tidak valid!",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} />
          Retrieving Identity...
        </div>
      </div>
    );

  const isSuper = Number(data?.id_role) === 0 || data?.id_user === 1;

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/pengurus")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white transition-all border border-white/20 shadow-lg hover:bg-white hover:text-[#1E5AA5]"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  PROFIL <span className="text-blue-200">OTORITAS</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Verified Structural Identity
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="relative shrink-0">
                  <div
                    className={`absolute -inset-2 rounded-[2.5rem] blur opacity-10 ${isSuper ? "bg-amber-500" : "bg-blue-500"}`}
                  ></div>
                  <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#1E5AA5] overflow-hidden">
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
                  {isSuper && (
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-2xl shadow-xl border-4 border-white">
                      <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E5AA5] text-[8px] font-black uppercase tracking-widest">
                    <UserCheck size={12} /> Status:{" "}
                    {data?.status ? "Aktif" : "Nonaktif"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama}
                  </h2>
                  <div
                    className={`inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isSuper ? "bg-gray-900 border-gray-800 text-white" : "bg-blue-50/50 text-[#2E5AA7] border-blue-100"}`}
                  >
                    {isSuper
                      ? "SUPER ADMINISTRATOR"
                      : data?.jabatan || "PENGURUS"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <Label
                    text="Nama Lengkap Pengurus"
                    className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
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
                    text="Kontak Surat Elektronik"
                    className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
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
                    text="Kata Sandi Akun"
                    className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <Lock size={18} />
                      </div>
                      <span
                        className={`font-mono font-black text-sm tracking-widest ${showPassword ? "text-blue-600" : "text-gray-200"}`}
                      >
                        {/* Menampilkan password dari data API jika sudah direveal */}
                        {showPassword
                          ? data?.password || "PASSWORD_NOT_FOUND"
                          : "••••••••"}
                      </span>
                    </div>
                    <button
                      onClick={handleRevealRequest}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#1E5AA5] transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Posisi Struktural"
                    className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Briefcase size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-tight">
                      {data?.jabatan || "Pusat Otoritas"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-10 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/pengurus")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm"
                />
                <Button
                  text="MODIFIKASI DATA"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/pengurus/edit/${id}`)}
                  className="!bg-[#2E5AA7] !text-white !px-12 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailPengurus;
