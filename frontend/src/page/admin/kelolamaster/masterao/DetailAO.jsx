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
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const DetailAO = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        Swal.fire("Gagal", "Gagal mengambil data Area Officer", "error");
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
                <div class="p-3 bg-[#0AC4E0]/10 rounded-2xl text-[#0AC4E0]"></div>
                <span class="text-lg font-black text-slate-800 uppercase">Verifikasi Keamanan</span>
              </div>`,
      html: `<p class="text-xs font-medium text-slate-500">Otorisasi diperlukan untuk melihat kredensial pengguna.</p>`,
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: "MASTER_KEY",
        style:
          "text-align: center; font-weight: 800; border-radius: 1rem; border: 2px solid #F1F5F9; background: #F8FAFC; padding: 0.8rem;",
      },
      showCancelButton: true,
      confirmButtonText: "Otorisasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0AC4E0",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2.5rem] border-none shadow-2xl p-8",
        confirmButton:
          "w-full py-3.5 bg-[#0AC4E0] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg mb-2 active:scale-95",
        cancelButton:
          "w-full py-3.5 bg-gray-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);
    } else if (inputKey) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Akses ditolak. Master Key tidak valid.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );
  }

  const displayWilayah =
    data?.wilayah?.length > 0
      ? data.wilayah
        .map((w) => w.nama_wilayah?.split("/").filter(Boolean).pop())
        .join(", ")
      : "Belum Ditugaskan";

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#FBFBFD] !p-0 font-sans leading-none text-slate-800">
      <Sidebar />

      <main className="relative flex h-full flex-1 flex-col items-center justify-end overflow-hidden">
        <div className="absolute right-0 top-0 -z-0 h-[600px] w-[600px] rounded-full bg-[#0AC4E0]/5 blur-[120px]" />

        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{
                x: statusNote.type === "error" ? -100 : 100,
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: statusNote.type === "error" ? -100 : 100,
                opacity: 0,
              }}
              className={`fixed ${statusNote.type === "error" ? "left-[320px]" : "right-12"
                } top-[45%] z-[100] w-72`}
            >
              <div className="rounded-[3rem] border border-slate-100 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
                  <ShieldAlert size={28} />
                </div>

                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  Peringatan Keamanan
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-600">
                  {statusNote.message}
                </p>

                <button
                  onClick={() => setStatusNote({ ...statusNote, show: false })}
                  className="w-full rounded-2xl bg-rose-50 py-4 text-[10px] font-black uppercase text-rose-600 transition-all active:scale-95"
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 mb-6 text-center"
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50">
              Sistem Pemantauan dan Evaluasi Program
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-[#0AC4E0]">
            Detail Area Officer
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-5xl overflow-hidden rounded-t-[5rem] rounded-b-none border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-30px_100px_rgba(10,196,224,0.1)]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[#0AC4E0]/5 to-transparent" />

          <div className="relative z-10 grid grid-cols-12 gap-16">
            <div className="col-span-12 space-y-8 lg:col-span-4">
              <div className="relative mx-auto w-fit lg:mx-0">
                <div className="flex h-44 w-44 items-center justify-center rounded-[3.5rem] border-2 border-cyan-100 bg-cyan-50 text-6xl font-black uppercase text-[#0AC4E0] shadow-inner">
                  {data?.nama?.charAt(0)}
                </div>

                <div className="absolute -bottom-2 -right-2 rounded-3xl border-4 border-white bg-slate-900 p-4 text-white shadow-xl">
                  <Fingerprint size={24} />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  text="Nama Lengkap"
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    {data?.nama}
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  text="Kode Keamanan Password"
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="flex items-center justify-between rounded-[2.5rem] border border-slate-900 bg-slate-900 p-6 shadow-xl">
                  <div className="flex items-center gap-4 text-white">
                    <Lock size={18} className="text-[#0AC4E0]" />

                    <span
                      className={`font-mono text-sm font-black tracking-[0.3em] ${showPassword ? "text-white" : "text-slate-700"
                        }`}
                    >
                      {showPassword ? data?.password : "••••••••"}
                    </span>
                  </div>

                  <button
                    onClick={handleRevealRequest}
                    className="rounded-xl bg-slate-800 p-2 text-[#0AC4E0] transition-all hover:bg-slate-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-1 gap-7 self-start md:grid-cols-2 lg:col-span-8">
              <div className="space-y-2">
                <Label
                  text="Email Institusi"
                  className="!ml-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="flex items-center gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <Mail size={18} className="text-[#0AC4E0]" />

                  <span className="truncate text-sm font-bold lowercase text-slate-700">
                    {data?.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  text="Jabatan Struktural"
                  className="!ml-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="flex items-center gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <Briefcase size={18} className="text-[#0AC4E0]" />

                  <span className="text-sm font-black uppercase text-slate-800">
                    {data?.jabatan || "Area Officer"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label
                  text="Wilayah Penugasan"
                  className="!ml-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="flex items-start gap-4 rounded-[3rem] border-2 border-[#0AC4E0]/20 bg-[#0AC4E0]/5 p-8">
                  <MapPin size={24} className="shrink-0 text-[#0AC4E0]" />

                  <div>
                    <h4 className="mb-1 text-lg font-black uppercase leading-tight tracking-tighter text-slate-900">
                      {displayWilayah}
                    </h4>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0AC4E0]">
                      Cakupan wilayah tugas aktif
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 md:col-span-2">
                <div className="flex items-center gap-6 rounded-[2.5rem] border border-cyan-100 bg-cyan-50/50 p-6">
                  <Database size={20} className="text-[#0AC4E0]" />

                  <div className="flex flex-col">
                    <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                      Nomor Referensi Sistem
                    </span>

                    <span className="font-mono text-xs font-black text-slate-800">
                      ID Pengguna: {data?.id_user}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-5 rounded-[2.5rem] border-2 border-dashed border-[#0AC4E0]/10 bg-[#0AC4E0]/5 p-6">
                  <ShieldCheck className="shrink-0 text-[#0AC4E0]" size={28} />

                  <p className="text-left text-[11px] font-medium italic leading-relaxed text-slate-400">
                    Identitas Area Officer bersifat rahasia dan digunakan untuk
                    penugasan wilayah pada sistem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] z-30 flex h-[120px] w-[550px] items-center justify-center rounded-t-[250px] border-x-2 border-t-2 border-white bg-white/80 px-16 pt-6 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] backdrop-blur-3xl"
        >
          <div className="mb-2 flex w-full items-center justify-between">
            <Button
              text="Kembali"
              icon={<ChevronLeft size={16} />}
              onClick={() => navigate("/admin/ao")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />

            <Button
              text="Edit Data"
              icon={<Edit3 size={18} />}
              onClick={() => navigate(`/admin/ao/edit/${id}`)}
              className="!rounded-full !bg-[#0AC4E0] !px-10 !py-4 !text-[11px] !font-black !uppercase !tracking-widest !text-white shadow-2xl shadow-[#0AC4E0]/30 hover:!bg-[#09b3cc] active:scale-95"
            />
          </div>
        </motion.div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </PageWrapper>
  );
};

export default DetailAO;