/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  Mail,
  MapPin,
  Award,
  Hash,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Save,
  ChevronLeft,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Fingerprint,
  Globe2,
  Database,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";
import Button from "../../../../components/Button";

const CORRECT_PATTERN = "1236";

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

const normalizeSekolah = (item) => {
  const wilayah = item?.wilayah || {};

  return {
    nama_sekolah: item?.nama_sekolah || item?.namaSekolah || item?.nama || "",
    alamat: item?.alamat || "",
    jenjang: item?.jenjang || "SD",
    npsn: item?.npsn || "",
    akreditasi: item?.akreditasi || "A",
    email_login: item?.email_login || item?.emailLogin || "",
    password_login: item?.password_login || item?.passwordLogin || "",
    id_wilayah:
      item?.id_wilayah ??
      item?.idWilayah ??
      wilayah?.id_wilayah ??
      wilayah?.idWilayah ??
      wilayah?.id ??
      "",
  };
};

const EditSekolah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loadingWilayah, setLoadingWilayah] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [wilayahList, setWilayahList] = useState([]);

  const [formData, setFormData] = useState({
    nama_sekolah: "",
    alamat: "",
    jenjang: "SD",
    npsn: "",
    akreditasi: "A",
    email_login: "",
    password_login: "",
    id_wilayah: "",
  });

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const jenjangOptions = [
    { label: "SD", value: "SD" },
    { label: "SMP", value: "SMP" },
    { label: "SMK", value: "SMK" },
  ];

  const akreditasiOptions = [
    { label: "GRADE A", value: "A" },
    { label: "GRADE B", value: "B" },
    { label: "GRADE C", value: "C" },
  ];

  const wilayahOptions = useMemo(
    () =>
      wilayahList.map((wilayah) => ({
        value: String(wilayah.id_wilayah),
        label: `${wilayah.nama_wilayah.toUpperCase()} (${wilayah.kode_wilayah || "—"})`,
      })),
    [wilayahList],
  );

  const selectedWilayah = useMemo(() => {
    return wilayahList.find(
      (wilayah) => String(wilayah.id_wilayah) === String(formData.id_wilayah),
    );
  }, [wilayahList, formData.id_wilayah]);

  const setField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetching(true);
        setLoadingWilayah(true);

        const token = localStorage.getItem("token");

        const [resDetail, resWilayah] = await Promise.all([
          axios.get(`http://localhost:3000/sekolah/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/wilayah", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const normalizedSekolah = normalizeSekolah(resDetail.data);

        const wilayahData = getArrayPayload(resWilayah.data)
          .map(normalizeWilayah)
          .filter(
            (wilayah) =>
              wilayah.id_wilayah &&
              isActiveValue(wilayah.status) &&
              String(wilayah.jenis_wilayah || "").toUpperCase() === "PROVINSI",
          )
          .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah));

        setFormData({
          ...normalizedSekolah,
          id_wilayah: normalizedSekolah.id_wilayah
            ? String(normalizedSekolah.id_wilayah)
            : "",
        });

        setWilayahList(wilayahData);
      } catch (err) {
        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil data sekolah.",
        });

        setTimeout(() => navigate("/admin/sekolah"), 1200);
      } finally {
        setFetching(false);
        setLoadingWilayah(false);
      }
    };

    fetchInitialData();
  }, [id, navigate]);

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
        message: "Otoritas ditolak. Pola keamanan tidak sesuai.",
      });

      setActivePattern([]);
    }
  };

  const validateForm = () => {
    if (!formData.nama_sekolah.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama sekolah wajib diisi.",
      });

      return false;
    }

    if (!formData.id_wilayah) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Wilayah provinsi wajib dipilih.",
      });

      return false;
    }

    if (!formData.alamat.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Alamat sekolah wajib diisi.",
      });

      return false;
    }

    if (formData.password_login && formData.password_login.length < 8) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Password login minimal 8 karakter.",
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
        npsn: formData.npsn,
        nama_sekolah: formData.nama_sekolah.trim(),
        alamat: formData.alamat.trim(),
        jenjang: formData.jenjang,
        akreditasi: formData.akreditasi,
        email_login: formData.email_login,
        password_login: formData.password_login,
        id_wilayah: Number(formData.id_wilayah),
      };

      await axios.patch(`http://localhost:3000/sekolah/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data sekolah berhasil diperbarui.",
      });

      setTimeout(() => navigate("/admin/sekolah"), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Gagal memperbarui data sekolah.";

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
        <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
      <Sidebar />

      <main
        className="relative flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10"
        onMouseUp={handleEnd}
      >
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ y: -1000, filter: "blur(40px)", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[300] flex flex-col items-center justify-center bg-slate-900/80 text-white backdrop-blur-3xl"
            >
              <div className="mb-16 text-center leading-none">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>

                <h2 className="mb-2 text-3xl font-black uppercase leading-none tracking-tighter">
                  Unit Authorization
                </h2>

                <p className="text-sm leading-none text-slate-400">
                  Tarik pola otoritas untuk mengedit data sekolah
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
                onClick={() => navigate("/admin/sekolah")}
                className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 transition-all hover:text-white"
              >
                Batalkan Perubahan
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                } top-[45%] z-[350] w-72`}
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

        <Card className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 shadow-2xl">
          <div className="shrink-0 px-10 pb-6 pt-8">
            <header className="flex items-center justify-between">
              <div>
                <Label
                  text="Sistem Pemantauan Program"
                  className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                />

                <h1 className="text-xl font-black uppercase text-gray-800">
                  Edit Data <span className="text-[#0AC4E0]">Sekolah</span>
                </h1>
              </div>

              <Button
                text="Kembali"
                icon={<ChevronLeft size={14} />}
                onClick={() => navigate("/admin/sekolah")}
                className="!rounded-full !border !border-slate-100 !bg-white !px-6 !py-2.5 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
              />
            </header>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden border-t border-gray-100 lg:grid-cols-[58%_42%]"
          >
            <div className="no-scrollbar overflow-y-auto px-10 py-7 pb-10">
              <div className="space-y-6">
                <div className="rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                      <School size={21} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Identitas Sekolah
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Edit data dasar unit sekolah.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2 opacity-60">
                      <Label
                        text="NPSN"
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                        <Hash size={15} className="text-gray-300" />

                        <span className="font-mono text-[11px] font-black tracking-widest text-slate-400">
                          {formData.npsn || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        text="Nama Sekolah"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.nama_sekolah}
                          onChange={(e) =>
                            setField("nama_sekolah", e.target.value)
                          }
                          placeholder="Contoh: SDN Mekar Jaya 01"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <School
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        text="Jenjang Pendidikan"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <Dropdown
                        icon={BookOpen}
                        value={formData.jenjang}
                        items={jenjangOptions}
                        onChange={(value) => setField("jenjang", value)}
                        className="!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Akreditasi"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <Dropdown
                        icon={Award}
                        value={formData.akreditasi}
                        items={akreditasiOptions}
                        onChange={(value) => setField("akreditasi", value)}
                        className="!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                      <MapPin size={21} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Wilayah & Alamat
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Hubungkan sekolah ke wilayah provinsi aktif.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        text="Wilayah Provinsi"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <Dropdown
                        icon={Globe2}
                        value={formData.id_wilayah}
                        items={wilayahOptions}
                        onChange={(value) => setField("id_wilayah", value)}
                        className="!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                      />

                      {loadingWilayah && (
                        <p className="ml-1 mt-2 text-[9px] font-bold text-[#0AC4E0]">
                          Memuat data wilayah...
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                      <Label
                        text="Wilayah Terpilih"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-[#0AC4E0]" />

                        <span className="text-[11px] font-black uppercase text-gray-800">
                          {selectedWilayah?.nama_wilayah || "Belum dipilih"}
                        </span>
                      </div>

                      <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {selectedWilayah?.kode_wilayah || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label
                      text="Alamat Lengkap Sekolah"
                      required
                      className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />

                    <Textarea
                      value={formData.alamat}
                      onChange={(e) => setField("alamat", e.target.value)}
                      placeholder="Input alamat lengkap sekolah..."
                      className="!min-h-[100px] !rounded-xl !bg-white !p-4 !text-[11px] font-bold"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                      <ShieldCheck size={21} />
                    </div>

                    <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                      Status aktif atau nonaktif sekolah tetap dikontrol dari
                      halaman Read Sekolah. Halaman edit ini hanya untuk
                      memperbarui identitas, wilayah, alamat, dan kredensial
                      akses sekolah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-l border-gray-100 p-7">
              <div className="mb-5">
                <Label
                  text="Access Management"
                  className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                />

                <h2 className="text-lg font-black uppercase text-gray-800">
                  Akun Login Sekolah
                </h2>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto">
                <div className="space-y-5">
                  <div className="rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                        <Mail size={21} />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                          Kredensial Akses
                        </p>

                        <p className="text-[9px] font-bold text-gray-400">
                          Email dikunci. Password dapat diperbarui.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2 opacity-60">
                        <Label
                          text="Email Login"
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                          <Mail size={15} className="text-gray-300" />

                          <span className="truncate text-[11px] font-bold lowercase text-slate-400">
                            {formData.email_login || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          text="Password Login"
                          required
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.password_login}
                            onChange={(e) =>
                              setField("password_login", e.target.value)
                            }
                            placeholder="Minimal 8 karakter"
                            className="w-full !rounded-xl !bg-white !py-3 !pl-10 !pr-12 !text-[11px] font-bold"
                          />

                          <Lock
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={15}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 transition-all hover:text-[#0AC4E0] active:scale-90"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                        <Database size={19} />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                          Preview Perubahan
                        </p>

                        <p className="text-[9px] font-bold text-gray-400">
                          Ringkasan data sebelum disimpan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Nama Sekolah"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-gray-800">
                          {formData.nama_sekolah || "—"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4">
                          <Label
                            text="Jenjang"
                            className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                          />

                          <p className="text-[12px] font-black uppercase text-[#0AC4E0]">
                            {formData.jenjang || "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <Label
                            text="Akreditasi"
                            className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                          />

                          <p className="text-[12px] font-black uppercase text-emerald-600">
                            Grade {formData.akreditasi || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Wilayah"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-gray-800">
                          {selectedWilayah?.nama_wilayah || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Email Login"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[11px] font-bold lowercase text-gray-500">
                          {formData.email_login || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                <Button
                  text="Batal"
                  icon={<ChevronLeft size={14} />}
                  onClick={() => navigate("/admin/sekolah")}
                  className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                />

                <Button
                  text={loading ? "Menyimpan..." : "Simpan Perubahan"}
                  icon={<Save size={15} />}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                />
              </div>
            </div>
          </form>
        </Card>
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

export default EditSekolah;