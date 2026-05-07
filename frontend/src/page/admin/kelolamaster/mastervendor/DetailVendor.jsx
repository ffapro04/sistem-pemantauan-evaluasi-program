/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
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
        console.log("VENDOR DATA:", JSON.stringify(res.data));
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat data vendor", "error");
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
      title: `<span class="text-lg font-black uppercase tracking-tighter">Security Verification</span>`,
      html: `<p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Masukkan Master Otoritas Key untuk dekripsi password akses vendor.</p>`,
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
        <RefreshCw className="animate-spin text-[#1E5AA5]" size={40} />
      </div>
    );

  const isBermitra = data?.status === "Bermitra";

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER BANNER */}
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/vendor")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  PROFIL <span className="text-blue-200">VENDOR</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Authorized Partnership Data
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white custom-scrollbar">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              {/* Profile Card */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#1E5AA5] text-4xl font-black uppercase shrink-0">
                  {data?.nama_vendor?.charAt(0)}
                </div>
                <div className="text-center md:text-left space-y-4 flex-1">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isBermitra ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <ShieldCheck size={12} />{" "}
                    {isBermitra ? "Bermitra Aktif" : "Tidak Bermitra"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama_vendor}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest italic">
                    <div className="flex items-center gap-1.5">
                      <Tags size={12} className="text-[#1E5AA5]" />{" "}
                      {data?.pilar}
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                      <MapPin size={12} className="text-rose-400" />{" "}
                      {data?.alamat?.substring(0, 40)}
                    </div>
                  </div>
                </div>
                <Button
                  text="MODIFIKASI"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/vendor/edit/${id}`)}
                  className="!bg-[#2E5AA7] !text-white !px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg shrink-0"
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* 1. Identitas Lembaga */}
                <div className="space-y-3">
                  <Label
                    text="Identitas Lembaga"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-700 text-sm uppercase tracking-tight leading-none truncate">
                        {data?.nama_vendor}
                      </span>
                      <span className="text-[10px] font-mono font-black text-[#1E5AA5] mt-1 tracking-widest">
                        REG: {data?.no_register}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Email Login */}
                <div className="space-y-3">
                  <Label
                    text="Email Login Sistem"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm lowercase truncate">
                      {data?.user?.email || "-"}
                    </span>
                  </div>
                </div>

                {/* 3. Password Reveal */}
                <div className="space-y-3">
                  <Label
                    text="Kata Sandi Login"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                        <Lock size={18} />
                      </div>
                      <span
                        className={`font-mono font-black text-sm tracking-widest ${showPassword ? "text-blue-600" : "text-gray-300"}`}
                      >
                        {showPassword
                          ? data?.user?.password || "HIDDEN_BY_SERVER"
                          : "••••••••"}
                      </span>
                    </div>
                    <button
                      onClick={handleRevealRequest}
                      className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-[#1E5AA5] transition-all shrink-0"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 4. PJ Utama */}
                <div className="space-y-3">
                  <Label
                    text="Penanggung Jawab Utama"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <User size={18} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-gray-700 text-sm uppercase tracking-tight">
                        {data?.pj_1 || "-"}
                      </span>
                      <span className="font-bold text-[#1E5AA5] text-[11px] lowercase italic">
                        {data?.telp_pj_1 || "Email kontak belum diatur"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Dokumen Legalitas */}
                <div className="space-y-3">
                  <Label
                    text="Dokumen Legalitas"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <FileText size={18} className="text-rose-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black text-gray-400 uppercase">
                          NPWP
                        </span>
                        <span className="text-[9px] font-bold text-gray-600 truncate">
                          {data?.npwp_file || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <FileText size={18} className="text-blue-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black text-gray-400 uppercase">
                          KTP PJ
                        </span>
                        <span className="text-[9px] font-bold text-gray-600 truncate">
                          {data?.ktp_pj_file || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Status Kemitraan */}
                <div className="space-y-3">
                  <Label
                    text="Status Kemitraan"
                    className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <span
                      className={`font-black text-sm uppercase ${isBermitra ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {data?.status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 pb-16">
                <Button
                  text="KEMBALI KE LIST"
                  onClick={() => navigate("/admin/vendor")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 hover:!bg-gray-50 transition-all uppercase tracking-[0.2em] shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailVendor;
