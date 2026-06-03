/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Briefcase,
  Lock,
  Save,
  ChevronLeft,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  LockIcon,
  Fingerprint,
  Layers,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Button from "../../../../components/Button";

const API_BASE = "http://localhost:3000";
const CORRECT_PATTERN = "1236";
const ROLE_HEAD_OFFICE = 3;

const normalizeUser = (payload) => {
  const data = payload?.data || payload;

  return {
    nama: data?.nama || "",
    email: data?.email || "",
    password: data?.password || "",
    jabatan: data?.jabatan || "Supervisor Head Office",
    jenis: data?.jenis || "akademik",
    sub_jenis: data?.sub_jenis || "",
    id_role: data?.id_role || data?.role?.id_role || ROLE_HEAD_OFFICE,
    status: data?.status ?? true,
  };
};

const EditHO = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "Supervisor Head Office",
    jenis: "akademik",
    sub_jenis: "",
    id_role: ROLE_HEAD_OFFICE,
    status: true,
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const jabatanOptions = [
    { value: "Supervisor Head Office", label: "SUPERVISOR HEAD OFFICE" },
    { value: "Head Office Akademik", label: "HEAD OFFICE AKADEMIK" },
    { value: "Head Office Non-Akademik", label: "HEAD OFFICE NON-AKADEMIK" },
    { value: "Koordinator Head Office", label: "KOORDINATOR HEAD OFFICE" },
  ];

  const jenisOptions = [
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const fokusOptions = [
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setFetching(true);

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_BASE}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData(normalizeUser(res.data));
      } catch (error) {
        console.error("Gagal mengambil detail Head Office:", error);

        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil data Head Office.",
        });

        setTimeout(() => navigate("/admin/ho"), 1200);
      } finally {
        setFetching(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  useEffect(() => {
    if (formData.jenis !== "akademik" && formData.sub_jenis !== "") {
      setFormData((prev) => ({
        ...prev,
        sub_jenis: "",
      }));
    }
  }, [formData.jenis, formData.sub_jenis]);

  const handleStart = (num) => {
    setIsDragging(true);
    setActivePattern([num]);
  };

  const handleEnter = (num) => {
    if (isDragging && !activePattern.includes(num)) {
      setActivePattern((prev) => [...prev, num]);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);

    const result = activePattern.join("");

    if (result === CORRECT_PATTERN) {
      setIsUnlocked(true);
      setStatusNote({ show: false, type: null, message: "" });
      setActivePattern([]);
      return;
    }

    if (result.length > 0) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Akses ditolak. Pola otoritas tidak valid.",
      });

      setActivePattern([]);
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Email Head Office wajib diisi.",
      });

      return false;
    }

    if (!formData.password.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Password Head Office wajib diisi.",
      });

      return false;
    }

    if (formData.password.trim().length < 4) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Password minimal 4 karakter.",
      });

      return false;
    }

    if (!formData.jabatan.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Jabatan Head Office wajib diisi.",
      });

      return false;
    }

    if (!formData.jenis.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Departemen Head Office wajib dipilih.",
      });

      return false;
    }

    if (formData.jenis === "akademik" && !formData.sub_jenis.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Fokus akademik wajib dipilih.",
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

      const payload = {
        nama: formData.nama,
        email: formData.email.trim(),
        password: formData.password.trim(),
        jabatan: formData.jabatan,
        jenis: formData.jenis,
        sub_jenis: formData.jenis === "akademik" ? formData.sub_jenis : "",
        id_role: ROLE_HEAD_OFFICE,
      };

      await axios.patch(`${API_BASE}/users/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data Head Office berhasil diperbarui.",
      });

      setTimeout(() => navigate("/admin/ho"), 1600);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Gagal menyimpan perubahan data Head Office.";

      setStatusNote({
        show: true,
        type: "error",
        message: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );
  }
  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#FBFBFD] !p-0 font-sans leading-none text-slate-800">
      <Sidebar />

      <main
        className="relative flex h-full flex-1 flex-col items-center justify-end overflow-hidden"
        onMouseUp={handleEnd}
      >
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ y: -1000, filter: "blur(40px)", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/80 text-white backdrop-blur-3xl"
            >
              <div className="mb-16 text-center leading-none">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>

                <h2 className="mb-2 text-3xl font-black uppercase leading-none tracking-tighter">
                  Akses Keamanan
                </h2>

                <p className="text-sm leading-none text-slate-400">
                  Tarik pola otoritas untuk mengedit data Head Office
                </p>
              </div>

              <div className="relative select-none rounded-[3rem] border border-white/10 bg-white/5 p-10">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      onMouseDown={() => handleStart(num)}
                      onMouseEnter={() => handleEnter(num)}
                      className="relative flex h-12 w-12 cursor-pointer items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          scale: activePattern.includes(num) ? 1.5 : 1,
                          backgroundColor: activePattern.includes(num)
                            ? "#0AC4E0"
                            : "rgba(255,255,255,0.2)",
                        }}
                        className="h-4 w-4 rounded-full shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/ho")}
                className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 transition-all hover:text-white"
              >
                Batalkan Perubahan
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                } top-[45%] z-[250] w-72`}
            >
              <div className="rounded-[3rem] border border-slate-200 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
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
                  {statusNote.type === "error" ? "Akses Ditolak" : "Berhasil"}
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-700">
                  {statusNote.message}
                </p>

                <button
                  type="button"
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
          className="z-10 mb-6 text-center leading-none"
        >
          <div className="mb-1 flex items-center justify-center gap-2 leading-none">
            <span className="text-[11px] font-black uppercase leading-none tracking-[0.4em] text-[#1C0770]/50">
              Sistem Pemantauan dan Evaluasi Program
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-[#0AC4E0]">
            Edit Head Office
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-b-none rounded-t-[5rem] border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-20px_100px_rgba(10,196,224,0.1)]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[#0AC4E0]/5 to-transparent" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-7">
            <div className="space-y-2 opacity-60">
              <Label
                text="Nama Lengkap Terkunci"
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-300"
              />

              <div className="relative flex cursor-not-allowed items-center gap-6 rounded-[2.2rem] border border-slate-100 bg-slate-50/50 px-14 py-4">
                <LockIcon
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200"
                  size={20}
                />

                <span className="text-[16px] font-bold uppercase tracking-tight text-slate-300">
                  {formData.nama || "-"}
                </span>
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
                  placeholder="head.office@ypamdr.or.id"
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold transition-all focus:!border-[#0AC4E0] focus:!bg-white"
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
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Masukkan password..."
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !pr-14 !text-[16px] !font-bold transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                />

                <Lock
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                  size={20}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-[#0AC4E0] active:scale-90"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
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
                className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !text-base !font-black text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  text="Departemen"
                  required
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <Dropdown
                  icon={Layers}
                  value={formData.jenis}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      jenis: val,
                      sub_jenis: val === "akademik" ? formData.sub_jenis : "",
                    })
                  }
                  items={jenisOptions}
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !text-base !font-black text-slate-700"
                />
              </div>

              <div
                className={`space-y-2 ${formData.jenis !== "akademik" ? "opacity-40" : ""
                  }`}
              >
                <Label
                  text="Fokus Akademik"
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <Dropdown
                  icon={GraduationCap}
                  value={formData.sub_jenis || ""}
                  onChange={(val) =>
                    setFormData({ ...formData, sub_jenis: val })
                  }
                  items={fokusOptions}
                  disabled={formData.jenis !== "akademik"}
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !text-base !font-black text-slate-700"
                />
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
              text="Batal"
              icon={<ChevronLeft size={16} />}
              onClick={() => navigate("/admin/ho")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />

            <Button
              text={loading ? "Menyimpan..." : "Simpan Perubahan"}
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

export default EditHO;