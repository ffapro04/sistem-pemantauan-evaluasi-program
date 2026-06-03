/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Briefcase,
  Database,
  Lock,
  Save,
  ChevronLeft,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  LockIcon,
  Fingerprint,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Button from "../../../../components/Button";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";
const CORRECT_PATTERN = "1236";

const EditPengurus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "Ketua Pengurus",
    id_role: 2,
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
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setFormData({
            nama: res.data.nama || "",
            email: res.data.email || "",
            password: res.data.password || "",
            jabatan:
              Number(res.data.id_role) === 1
                ? "Admin"
                : res.data.jabatan || "Ketua Pengurus",
            id_role: res.data.id_role,
          });
        }
      } catch (err) {
        navigate("/admin/pengurus");
      } finally {
        setFetching(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  useEffect(() => {
    if (formData.jabatan !== "Admin") setAdminKey("");
  }, [formData.jabatan]);

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
    } else if (result.length > 0) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Akses ditolak. Pola otoritas tidak valid.",
      });

      setActivePattern([]);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.jabatan) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Email, password, dan jabatan wajib diisi.",
      });

      return false;
    }

    if (formData.jabatan === "Admin" && adminKey !== MASTER_AUTH_KEY) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Master Key tidak valid. Perubahan ke Super Admin ditolak.",
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

      await axios.patch(`http://localhost:3000/users/${id}`, finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data pengurus berhasil diperbarui.",
      });

      setTimeout(() => navigate("/admin/pengurus"), 1800);
    } catch (err) {
      setStatusNote({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal menyimpan perubahan data pengurus.",
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
                  Tarik pola otoritas untuk mengedit data pengurus
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
                onClick={() => navigate(-1)}
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
            Edit Pengurus
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-t-[5rem] rounded-b-none border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-20px_100px_rgba(10,196,224,0.1)]"
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
                  {formData.nama}
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
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold transition-all focus:!border-[#0AC4E0] focus:!bg-white"
                />

                <Lock
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                  size={20}
                />
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

            <AnimatePresence>
              {formData.jabatan === "Admin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-6 rounded-[2.5rem] border border-rose-100 bg-rose-50/50 p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-200">
                    <Database size={22} />
                  </div>

                  <div className="flex-1 space-y-2">
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
          className="absolute bottom-[-15px] z-30 flex h-[120px] w-[550px] items-center justify-center rounded-t-[250px] border-x-2 border-t-2 border-white bg-white/80 px-16 pt-6 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] backdrop-blur-3xl"
        >
          <div className="mb-2 flex w-full items-center justify-between">
            <Button
              text="Batal"
              icon={<ChevronLeft size={16} />}
              onClick={() => navigate("/admin/pengurus")}
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

export default EditPengurus;