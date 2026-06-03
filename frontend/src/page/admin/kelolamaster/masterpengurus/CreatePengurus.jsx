/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Database,
  Lock,
  Save,
  ChevronLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Button from "../../../../components/Button";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const CreatePengurus = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: 2,
    jabatan: "Ketua Pengurus",
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const jabatanOptions = [
    { value: "Admin", label: "SUPER ADMINISTRATOR" },
    { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
    { value: "Sekretaris", label: "SEKRETARIS" },
    { value: "Bendahara", label: "BENDAHARA" },
    { value: "Anggota Pengurus", label: "ANGGOTA PENGURUS" },
  ];

  useEffect(() => {
    if (formData.jabatan !== "Admin") setAdminKey("");
  }, [formData.jabatan]);

  const validateForm = () => {
    if (!formData.nama || !formData.email || !formData.password) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama lengkap, email, dan password wajib diisi.",
      });

      return false;
    }

    if (formData.jabatan === "Admin" && adminKey !== MASTER_AUTH_KEY) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Master Key tidak valid. Akses pembuatan Super Admin ditolak.",
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const finalData = {
        ...formData,
        id_role: formData.jabatan === "Admin" ? 1 : 2,
      };

      await axios.post("http://localhost:3000/users/register", finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data pengurus berhasil disimpan.",
      });

      setTimeout(() => navigate("/admin/pengurus"), 1800);
    } catch (err) {
      setStatusNote({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal memproses pendaftaran pengurus.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#FBFBFD] !p-0 font-sans leading-none text-slate-800">
      <Sidebar />

      <main className="relative flex h-full flex-1 flex-col items-center justify-end overflow-hidden">
        <div className="absolute right-0 top-0 -z-0 h-[600px] w-[600px] rounded-full bg-[#0AC4E0]/5 blur-[120px]" />

        <AnimatePresence>
          {statusNote.show && statusNote.type === "error" && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="fixed left-[320px] top-[45%] z-[100] w-72"
            >
              <div className="rounded-[3rem] border border-rose-100 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
                  <XCircle size={28} />
                </div>

                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  Peringatan Validasi
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-600">
                  {statusNote.message}
                </p>

                <button
                  onClick={() => setStatusNote({ ...statusNote, show: false })}
                  className="w-full rounded-2xl bg-rose-50 py-4 text-[10px] font-black uppercase text-rose-600 transition-all active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {statusNote.show && statusNote.type === "success" && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="fixed right-12 top-[45%] z-[100] w-72"
            >
              <div className="rounded-[3rem] border border-emerald-100 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={28} />
                </div>

                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  Berhasil
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-600">
                  {statusNote.message}
                </p>

                <button
                  onClick={() => setStatusNote({ ...statusNote, show: false })}
                  className="w-full rounded-2xl bg-emerald-50 py-4 text-[10px] font-black uppercase text-emerald-600 transition-all active:scale-95"
                >
                  Lanjut
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

          <h1 className="text-5xl font-black uppercase tracking-tighter text-[#0AC4E0]">
            Registrasi Pengurus
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-t-[5rem] rounded-b-none border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-20px_100px_rgba(10,196,224,0.1)]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[#0AC4E0]/5 to-transparent" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            <div className="space-y-3">
              <Label
                text="Nama Lengkap"
                required
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
              />

              <div className="group relative">
                <Input
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap..."
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                />

                <User
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                text="Email Institusi"
                required
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
              />

              <div className="group relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@ypamdr.astra.co.id"
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                />

                <Mail
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                text="Kode Keamanan Password"
                required
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-300"
              />

              <div className="group relative">
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                />

                <Lock
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                text="Posisi Jabatan"
                required
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
              />

              <Dropdown
                icon={Briefcase}
                value={formData.jabatan}
                onChange={(val) =>
                  setFormData({ ...formData, jabatan: val })
                }
                items={jabatanOptions}
                className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !text-base !font-black text-slate-700"
              />
            </div>

            <AnimatePresence>
              {formData.jabatan === "Admin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-8 rounded-[2.5rem] border border-rose-100 bg-rose-50/50 p-8 shadow-sm"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-200">
                    <Database size={24} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                      Master Key Wajib Diisi
                    </p>

                    <Input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Masukkan Master Key..."
                      className="!rounded-xl !border-rose-200 !bg-white !py-3 text-center font-black tracking-[0.3em] text-rose-600"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] z-30 flex h-[120px] w-[550px] items-center justify-center rounded-t-[250px] border-x-2 border-t-2 border-white bg-white/80 px-16 pt-6 shadow-[0_-20px_80px_rgba(10,196,224,0.2)] backdrop-blur-3xl"
        >
          <div className="mb-2 flex w-full items-center justify-between">
            <Button
              text="Kembali"
              icon={<ChevronLeft size={16} />}
              onClick={() => navigate("/admin/pengurus")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />

            <Button
              text={loading ? "Menyimpan..." : "Simpan"}
              icon={<Save size={18} />}
              onClick={handleSubmit}
              disabled={loading}
              className={`!rounded-full !px-10 !py-4 !text-[11px] !font-black !uppercase !tracking-widest !text-white shadow-2xl active:scale-95 ${formData.jabatan === "Admin"
                ? "!bg-rose-600 shadow-rose-200"
                : "!bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:!bg-[#09b3cc]"
                }`}
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

export default CreatePengurus;