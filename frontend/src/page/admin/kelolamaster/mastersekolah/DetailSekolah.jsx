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
  Edit3,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  UserCheck,
  Lock,
  Mail,
  Hash,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailSekolah = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat profil unit", "error");
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
      title: `<span class="text-lg font-black uppercase tracking-tighter">Security Verification</span>`,
      html: `<p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Masukkan Master Otoritas Key untuk dekripsi password akses sekolah.</p>`,
      input: "password",
      inputPlaceholder: "••••••••••••",
      showCancelButton: true,
      confirmButtonText: "AUTHORIZE",
      cancelButtonText: "CANCEL",
      confirmButtonColor: "#1E5AA5",
      cancelButtonColor: "#EF4444",
      customClass: {
        popup: "rounded-[3rem] p-10 shadow-2xl",
        input:
          "rounded-2xl border-2 border-gray-100 text-center tracking-[0.5em] font-black focus:border-[#1E5AA5]",
        confirmButton:
          "rounded-full px-8 py-3 text-[10px] font-black tracking-widest uppercase",
        cancelButton:
          "rounded-full px-8 py-3 text-[10px] font-black tracking-widest uppercase",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);
      Swal.fire({
        icon: "success",
        title: "ACCESS GRANTED",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } else if (inputKey) {
      Swal.fire({
        icon: "error",
        title: "ACCESS DENIED",
        text: "Kunci Otoritas Tidak Valid!",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <RefreshCw className="animate-spin text-[#1E5AA5]" size={40} />
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/admin/sekolah")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter">
                  PROFIL <span className="text-blue-200">UNIT SEKOLAH</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic">
                  Verified Educational Hub Control Center
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#1E5AA5]">
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
                      <MapPin size={12} className="text-[#1E5AA5]" />{" "}
                      {data?.wilayah?.nama_wilayah
                        ?.split("/")
                        .filter(Boolean)
                        .pop()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-orange-500" /> Grade{" "}
                      {data?.akreditasi}
                    </div>
                  </div>
                </div>
                <Button
                  text="MODIFIKASI"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/sekolah/edit/${id}`)}
                  className="!bg-[#2E5AA7] !text-white !px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <Label
                    text="Nomor NPSN"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                      <Hash size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm tracking-widest font-mono">
                      {data?.npsn}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    text="Email Akses Terdaftar"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm lowercase">
                      {data?.email_login}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Kata Sandi Login"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <Lock size={18} />
                      </div>
                      <span
                        className={`font-mono font-black text-sm tracking-widest ${showPassword ? "text-blue-600" : "text-gray-300"}`}
                      >
                        {showPassword ? data?.password_login : "••••••••"}
                      </span>
                    </div>
                    <button
                      onClick={handleRevealRequest}
                      className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-[#1E5AA5] transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    text="Status Kelembagaan"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                      <ShieldCheck size={18} />
                    </div>
                    <span
                      className={`font-black text-sm uppercase ${data?.status ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {data?.status ? "Binaan YPAMDR" : "Bukan Binaan YPAMDR"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 pb-16">
                <Button
                  text="KEMBALI KE LIST"
                  onClick={() => navigate("/admin/sekolah")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailSekolah;
