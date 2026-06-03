/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Lock,
  ShieldCheck,
  Save,
  ChevronLeft,
  XCircle,
  CheckCircle2,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Button from "../../../../components/Button";

const ROLE_AO = 4;

const isActiveValue = (value) =>
  value === true || value === "true" || Number(value) === 1;

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.wilayah)) return payload.wilayah;
  return [];
};

const cleanWilayahName = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "Wilayah Tidak Diketahui";

  if (raw.includes("/")) {
    return raw.split("/").filter(Boolean).pop() || raw;
  }

  return raw;
};

const normalizeWilayah = (item) => ({
  id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
  nama_wilayah: cleanWilayahName(
    item?.nama_wilayah || item?.namaWilayah || item?.nama,
  ),
  kode_wilayah:
    item?.kode_wilayah || item?.kodeWilayah || item?.kode_provinsi || "—",
  jenis_wilayah: item?.jenis_wilayah || "PROVINSI",
  tipe_wilayah: item?.tipe_wilayah || "Absolute",
  status: item?.status ?? true,
});

const CreateAO = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingWilayah, setLoadingWilayah] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [searchWilayah, setSearchWilayah] = useState("");

  const [wilayahList, setWilayahList] = useState([]);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: ROLE_AO,
    jabatan: "Area Officer",
    id_wilayahs: [],
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const selectedWilayah = useMemo(() => {
    return wilayahList.filter((wilayah) =>
      formData.id_wilayahs.includes(Number(wilayah.id_wilayah)),
    );
  }, [wilayahList, formData.id_wilayahs]);

  const filteredWilayah = useMemo(() => {
    const search = searchWilayah.toLowerCase();

    return wilayahList.filter((wilayah) => {
      return (
        wilayah.nama_wilayah?.toLowerCase().includes(search) ||
        wilayah.kode_wilayah?.toLowerCase().includes(search) ||
        wilayah.tipe_wilayah?.toLowerCase().includes(search)
      );
    });
  }, [wilayahList, searchWilayah]);

  const setField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchWilayah = async () => {
      try {
        setLoadingWilayah(true);

        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = getArrayPayload(res.data)
          .map(normalizeWilayah)
          .filter(
            (wilayah) =>
              wilayah.id_wilayah &&
              isActiveValue(wilayah.status) &&
              String(wilayah.jenis_wilayah || "").toUpperCase() === "PROVINSI",
          )
          .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah));

        setWilayahList(data);
      } catch (error) {
        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil data wilayah provinsi.",
        });
      } finally {
        setLoadingWilayah(false);
      }
    };

    fetchWilayah();
  }, []);

  const handleToggleWilayah = (idWilayah) => {
    const wilayahId = Number(idWilayah);

    setFormData((prev) => {
      const exists = prev.id_wilayahs.includes(wilayahId);

      return {
        ...prev,
        id_wilayahs: exists
          ? prev.id_wilayahs.filter((id) => id !== wilayahId)
          : [...prev.id_wilayahs, wilayahId],
      };
    });
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama Area Officer wajib diisi.",
      });

      return false;
    }

    if (!formData.email.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Email Area Officer wajib diisi.",
      });

      return false;
    }

    if (formData.password.length < 8) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Password minimal 8 karakter.",
      });

      return false;
    }

    if (formData.id_wilayahs.length === 0) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Pilih minimal satu wilayah provinsi penugasan AO.",
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setStatusNote({ show: false, type: null, message: "" });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        password: formData.password,
        id_role: ROLE_AO,
        jabatan: "Area Officer",
        id_wilayahs: formData.id_wilayahs.map(Number),
        status: true,
      };

      await axios.post("http://localhost:3000/users/register_ao", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Akun Area Officer berhasil didaftarkan.",
      });

      setTimeout(() => navigate("/admin/ao"), 1800);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Terjadi kesalahan koneksi server.";

      setStatusNote({
        show: true,
        type: "error",
        message: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
      });
    } finally {
      setIsLoading(false);
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
              className={`fixed ${
                statusNote.type === "error" ? "left-[320px]" : "right-12"
              } top-[45%] z-[100] w-72`}
            >
              <div className="rounded-[3rem] border border-slate-100 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div
                  className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
                    statusNote.type === "error"
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
                  className={`mb-3 text-[10px] font-black uppercase tracking-widest ${
                    statusNote.type === "error"
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
                  className={`w-full rounded-2xl py-4 text-[10px] font-black uppercase transition-all active:scale-95 ${
                    statusNote.type === "error"
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
            Registrasi Area Officer
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
                    text="Nama Lengkap Area Officer"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <div className="group relative">
                    <Input
                      value={formData.nama}
                      onChange={(e) => setField("nama", e.target.value)}
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
                    text="Email Login"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <div className="group relative">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="ao@mail.com"
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
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="••••••••"
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !pr-16 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/5"
                    />

                    <Lock
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 transition-all hover:text-[#0AC4E0] active:scale-90"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
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
                      disabled
                      placeholder="Area Officer"
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm opacity-60"
                    />

                    <Briefcase
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Cari Wilayah Penugasan"
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  <div className="group relative">
                    <Input
                      value={searchWilayah}
                      onChange={(e) => setSearchWilayah(e.target.value)}
                      placeholder="Cari provinsi..."
                      className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-4 !pl-14 !text-[16px] !font-bold shadow-sm transition-all focus:!border-[#0AC4E0] focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/5"
                    />

                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Pilih Provinsi Penugasan (Minimal 1)"
                    required
                    className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />

                  {loadingWilayah ? (
                    <div className="rounded-[2.2rem] bg-slate-50/50 p-6 text-center text-xs font-black uppercase tracking-widest text-[#0AC4E0] border border-slate-100">
                      Memuat data wilayah...
                    </div>
                  ) : (
                    <div className="no-scrollbar grid max-h-[160px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                      {filteredWilayah.map((wilayah) => {
                        const selected = formData.id_wilayahs.includes(
                          Number(wilayah.id_wilayah),
                        );

                        return (
                          <button
                            type="button"
                            key={wilayah.id_wilayah}
                            onClick={() =>
                              handleToggleWilayah(wilayah.id_wilayah)
                            }
                            className={`flex items-center gap-3 rounded-[1.8rem] border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                              selected
                                ? "border-[#0AC4E0] bg-[#0AC4E0]/5 shadow-sm"
                                : "border-slate-100 bg-slate-50/30 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                                selected
                                  ? "border-[#0AC4E0] bg-[#0AC4E0]"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              {selected && (
                                <CheckCircle2 size={12} className="text-white" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-xs font-black uppercase tracking-tight ${
                                  selected ? "text-slate-800" : "text-slate-400"
                                }`}
                              >
                                {wilayah.nama_wilayah}
                              </p>

                              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-widest text-slate-300">
                                {wilayah.kode_wilayah || "—"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                  Area Officer akan mendapatkan akses pemantauan program pada wilayah provinsi yang ditugaskan.
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
              onClick={() => navigate("/admin/ao")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />

            <Button
              text={isLoading ? "Menyimpan..." : "Simpan Data"}
              icon={<Save size={18} />}
              onClick={handleSubmit}
              disabled={isLoading}
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

export default CreateAO;