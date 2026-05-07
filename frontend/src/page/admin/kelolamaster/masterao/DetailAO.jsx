/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Mail,
  ShieldCheck,
  Database,
  Edit3,
  RefreshCcw,
  UserCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Premium
import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailAO = () => {
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
      title: `<div class="flex items-center justify-center gap-3 text-[#1E5AA5] mb-2"><div class="p-2 bg-blue-50 rounded-xl"><ShieldCheck size={24} /></div><span class="text-lg font-black uppercase tracking-tighter">SECURITY VERIFICATION</span></div>`,
      html: `<p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Masukkan Master Otoritas Key untuk dekripsi password.</p>`,
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
          "rounded-2xl border-2 border-gray-100 text-center tracking-[0.5em] font-black",
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
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} /> Retrieving
          Identity...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/ao")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white transition-all border border-white/20 shadow-lg hover:bg-white hover:text-[#1E5AA5]"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  PROFIL <span className="text-blue-200">AREA OFFICER</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Verified Field Identity Control
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 bg-blue-500 rounded-[2.5rem] blur opacity-10"></div>
                  <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#1E5AA5] overflow-hidden uppercase text-5xl font-black">
                    {data?.nama?.charAt(0)}
                  </div>
                </div>
                <div className="text-center md:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                    <UserCheck size={12} /> Status:{" "}
                    {data?.status ? "Aktif" : "Nonaktif"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama}
                  </h2>
                  <div className="px-4 py-1.5 rounded-lg bg-blue-50 text-[#2E5AA7] border border-blue-100 text-[9px] font-black uppercase tracking-widest inline-block">
                    AREA OFFICER SPECIALIST
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <Label
                    text="Nama Lengkap Personnel"
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
                    text="Email Korporat"
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
                    text="Kredensial Akses"
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
                        {showPassword
                          ? data?.password || "API_LOCKED"
                          : "••••••••"}
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
                    text="Wilayah Penugasan"
                    className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
                  />
                  <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    {data?.wilayah?.length > 0 ? (
                      data.wilayah.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border border-blue-100 text-[#1E5AA5] text-[9px] font-black rounded-lg uppercase shadow-sm"
                        >
                          {w.nama_wilayah?.split("/").pop()}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-gray-300 italic font-bold">
                        No assigned areas
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-10 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/ao")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm"
                />
                <Button
                  text="MODIFIKASI TUGAS"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/ao/edit/${id}`)}
                  className="!bg-[#2E5AA7] !text-white !px-12 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg active:scale-95"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailAO;
