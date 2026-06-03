/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Lock,
  Building2,
  Layers,
  ShieldCheck,
  Save,
  ChevronLeft,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Button from "../../../../components/Button";

const CreateHO = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "Staff Head Office",
    id_role: 3,
    jenis: "akademik",
    sub_jenis: "SD & SMP",
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const deptOptions = [
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const tingkatOptions = [
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  useEffect(() => {
    if (formData.jenis === "non-akademik") {
      setFormData((prev) => ({ ...prev, sub_jenis: null }));
    } else if (formData.jenis === "akademik" && !formData.sub_jenis) {
      setFormData((prev) => ({ ...prev, sub_jenis: "SD & SMP" }));
    }
  }, [formData.jenis]);

  const validateForm = () => {
    if (!formData.nama || !formData.email || !formData.password) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama lengkap, email, dan password wajib diisi.",
      });

      return false;
    }

    if (!formData.jabatan) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Jabatan Head Office wajib diisi.",
      });

      return false;
    }

    if (formData.jenis === "akademik" && !formData.sub_jenis) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Fokus bidang akademik wajib dipilih.",
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

      await axios.post(
        "http://localhost:3000/users/register",
        {
          ...formData,
          id_role: 3,
          sub_jenis: formData.jenis === "akademik" ? formData.sub_jenis : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setStatusNote({
        show: true,
        type: "success",
        message: "Data Head Office berhasil disimpan.",
      });

      setTimeout(() => navigate("/admin/ho"), 1800);
    } catch (err) {
      setStatusNote({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal menyimpan data Head Office ke database.",
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
              <div className="rounded-[3rem] border border-slate-100 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div
                  className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${statusNote.type === "error"
                    ? "bg-rose-500 shadow-rose-200"
                    : "bg-emerald-500 shadow-emerald-200"
                    }`}
                >
                  {statusNote.type === "error" ? (
                    <XCircle size={28} />
                  ) : (
                    <CheckCircle2 size={28} />
                  )}
                </div>

                <h4
                  className={`mb-3 text-[10px] font-black uppercase tracking-widest ${statusNote.type === "error"
                    ? "text-rose-600"
                    : "text-emerald-600"
                    }`}
                >
                  {statusNote.type === "error"
                    ? "Peringatan Validasi"
                    : "Berhasil"}
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-600">
                  {statusNote.message}
                </p>

                <button
                  onClick={() => setStatusNote({ ...statusNote, show: false })}
                  className={`w-full rounded-2xl py-4 text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                    }`}
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
            Registrasi Head Office
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-6xl overflow-hidden rounded-t-[5rem] rounded-b-none border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-30px_100px_rgba(10,196,224,0.1)]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[#0AC4E0]/5 to-transparent" />

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 gap-x-20 gap-y-7 lg:grid-cols-2">
              <div className="space-y-7">
                <div className="space-y-2">
                  <Label
                    text="Nama Lengkap Personel"
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
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/5"
                    />

                    <User
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
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
                      placeholder="ho@ypamdr.astra.co.id"
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/5"
                    />

                    <Mail
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Kode Keamanan Password"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <div className="group relative">
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/5"
                    />

                    <Lock
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-7">
                <div className="space-y-2">
                  <Label
                    text="Jabatan Struktural"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <div className="group relative">
                    <Input
                      value={formData.jabatan}
                      onChange={(e) =>
                        setFormData({ ...formData, jabatan: e.target.value })
                      }
                      placeholder="Staff / Manager Head Office"
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                    />

                    <Briefcase
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Departemen"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <Dropdown
                    icon={Building2}
                    value={formData.jenis}
                    onChange={(val) =>
                      setFormData({ ...formData, jenis: val })
                    }
                    items={deptOptions}
                    className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !text-base !font-black text-slate-700"
                  />
                </div>

                <div
                  className={`space-y-2 transition-all duration-500 ${formData.jenis !== "akademik"
                    ? "pointer-events-none opacity-20 grayscale"
                    : "opacity-100"
                    }`}
                >
                  <Label
                    text="Fokus Bidang"
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <Dropdown
                    icon={Layers}
                    value={formData.sub_jenis}
                    disabled={formData.jenis !== "akademik"}
                    onChange={(val) =>
                      setFormData({ ...formData, sub_jenis: val })
                    }
                    items={tingkatOptions}
                    className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !text-base !font-black text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-8 rounded-[2.5rem] border-2 border-dashed border-[#0AC4E0]/10 bg-[#0AC4E0]/5 p-7 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-xl shadow-[#0AC4E0]/30">
                <ShieldCheck size={24} />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase leading-none tracking-widest text-[#0AC4E0]">
                  Kebijakan Akses
                </p>

                <p className="text-sm font-bold uppercase tracking-tighter text-slate-400">
                  Personel Head Office akan mendapatkan akses dashboard sesuai
                  departemen yang dipilih.
                </p>
              </div>
            </div>
          </form>
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
              onClick={() => navigate("/admin/ho")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />

            <Button
              text={loading ? "Menyimpan..." : "Simpan Data"}
              icon={<Save size={18} />}
              onClick={handleSubmit}
              disabled={loading}
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

export default CreateHO;