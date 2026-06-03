/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  ShieldCheck,
  User,
  FileText,
  RefreshCw,
  Tags,
  Eye,
  EyeOff,
  Lock,
  Database,
  Fingerprint,
  ChevronLeft,
  Save,
  XCircle,
  CheckCircle2,
  Phone,
  UploadCloud,
  Handshake,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";
import Button from "../../../../components/Button";
import Upload from "../../../../components/Upload";

const CORRECT_PATTERN = "1236";


const pilarOptions = [
  { label: "AKADEMIK", value: "Akademik" },
  { label: "KARAKTER", value: "Karakter" },
  { label: "SENI BUDAYA", value: "Seni Budaya" },
  { label: "KECAKAPAN HIDUP", value: "Kecakapan Hidup" },
];

const isMitraValue = (value) => {
  const raw = String(value || "").toLowerCase();

  return (
    raw === "bermitra" ||
    raw === "aktif" ||
    raw === "active" ||
    raw === "true" ||
    raw === "1"
  );
};

const normalizeStatus = (value) => {
  return isMitraValue(value) ? "Bermitra" : "Tidak Bermitra";
};

const normalizeVendor = (item) => ({
  nama_vendor:
    item?.nama_vendor ||
    item?.namaVendor ||
    item?.nama ||
    "Vendor Tidak Diketahui",
  no_register: item?.no_register || item?.noRegister || "UNSET",
  pilar: item?.pilar || "Akademik",
  alamat: item?.alamat || "",
  pj_1: item?.pj_1 || item?.pj1 || item?.penanggung_jawab || "",
  telp_pj_1:
    item?.telp_pj_1 ||
    item?.telpPj1 ||
    item?.email_pj_1 ||
    item?.kontak_pj_1 ||
    "",
  pj_2: item?.pj_2 || item?.pj2 || "",
  telp_pj_2:
    item?.telp_pj_2 ||
    item?.telpPj2 ||
    item?.email_pj_2 ||
    item?.kontak_pj_2 ||
    "",
  email: item?.email || item?.user?.email || "",
  password: item?.password || item?.user?.password || "",
  status: normalizeStatus(item?.status),
  npwp_file: item?.npwp_file || item?.npwpFile || "",
  ktp_pj_file: item?.ktp_pj_file || item?.ktpPjFile || "",
});

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const [formData, setFormData] = useState({
    nama_vendor: "",
    no_register: "",
    pilar: "Akademik",
    alamat: "",
    pj_1: "",
    telp_pj_1: "",
    pj_2: "",
    telp_pj_2: "",
    email: "",
    password: "",
    status: "Bermitra",
    npwp_file: "",
    ktp_pj_file: "",
    new_npwp_file: null,
    new_ktp_pj_file: null,
  });

  const selectedDocument = useMemo(
    () => ({
      npwp:
        formData.new_npwp_file?.name ||
        formData.npwp_file ||
        "Dokumen belum tersedia",
      ktp:
        formData.new_ktp_pj_file?.name ||
        formData.ktp_pj_file ||
        "Dokumen belum tersedia",
    }),
    [
      formData.new_npwp_file,
      formData.new_ktp_pj_file,
      formData.npwp_file,
      formData.ktp_pj_file,
    ],
  );

  const isBermitra = isMitraValue(formData.status);

  const setField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setFetching(true);

        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:3000/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = normalizeVendor(res.data);

        setFormData((prev) => ({
          ...prev,
          ...normalized,
          new_npwp_file: null,
          new_ktp_pj_file: null,
        }));
      } catch (err) {
        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil data vendor.",
        });

        setTimeout(() => navigate("/admin/vendor"), 1200);
      } finally {
        setFetching(false);
      }
    };

    fetchDetail();
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
        message: "Otoritas vendor ditolak. Pola keamanan tidak valid.",
      });

      setActivePattern([]);
    }
  };

  const validateForm = () => {
    if (!formData.nama_vendor.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama vendor wajib diisi.",
      });

      return false;
    }

    if (!formData.pilar) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Pilar program wajib dipilih.",
      });

      return false;
    }

    if (!formData.alamat.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Alamat operasional vendor wajib diisi.",
      });

      return false;
    }

    if (!formData.pj_1.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Nama PJ utama wajib diisi.",
      });

      return false;
    }

    if (!formData.telp_pj_1.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Kontak PJ utama wajib diisi.",
      });

      return false;
    }

    if (formData.password && formData.password.length < 8) {
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
        nama_vendor: formData.nama_vendor.trim(),
        pilar: formData.pilar,
        alamat: formData.alamat.trim(),

        pj_1: formData.pj_1.trim(),
        telp_pj_1: formData.telp_pj_1.trim(),
        pj_2: formData.pj_2.trim(),
        telp_pj_2: formData.telp_pj_2.trim(),

        email: formData.email,

        npwp_file:
          formData.new_npwp_file?.name ||
          formData.npwp_file ||
          "upload_pending_npwp.pdf",
        ktp_pj_file:
          formData.new_ktp_pj_file?.name ||
          formData.ktp_pj_file ||
          "upload_pending_ktp.pdf",
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await axios.patch(`http://localhost:3000/vendor/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data vendor berhasil diperbarui.",
      });

      setTimeout(() => navigate("/admin/vendor"), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Gagal memperbarui data vendor.";

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
                  Vendor Authorization
                </h2>

                <p className="text-sm leading-none text-slate-400">
                  Tarik pola otoritas untuk mengedit data vendor
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
                onClick={() => navigate("/admin/vendor")}
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
                  text="Educational Partner Registry"
                  className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                />

                <h1 className="text-xl font-black uppercase text-gray-800">
                  Edit Data <span className="text-[#0AC4E0]">Vendor</span>
                </h1>
              </div>

              <Button
                text="Kembali"
                icon={<ChevronLeft size={14} />}
                onClick={() => navigate("/admin/vendor")}
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
                      <Building2 size={21} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Identitas Vendor
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Perbarui data lembaga rekanan program.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        text="Nama Vendor"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.nama_vendor}
                          onChange={(e) =>
                            setField("nama_vendor", e.target.value)
                          }
                          placeholder="Nama perusahaan / lembaga"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <Building2
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 opacity-60">
                      <Label
                        text="No. Register"
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                        <FileText size={15} className="text-gray-300" />

                        <span className="truncate font-mono text-[11px] font-black tracking-widest text-slate-400">
                          {formData.no_register || "UNSET"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        text="Pilar Program"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <Dropdown
                        icon={Tags}
                        value={formData.pilar}
                        items={pilarOptions}
                        onChange={(value) => setField("pilar", value)}
                        className="!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                      />
                    </div>

                    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                      <Label
                        text="Status Kemitraan"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="flex items-center gap-2">
                        <Handshake
                          size={15}
                          className={
                            isBermitra ? "text-emerald-500" : "text-gray-300"
                          }
                        />

                        <span
                          className={`text-[11px] font-black uppercase ${isBermitra ? "text-emerald-600" : "text-gray-400"
                            }`}
                        >
                          {formData.status}
                        </span>
                      </div>

                      <p className="mt-2 text-[9px] font-bold text-gray-400">
                        Status dikontrol dari halaman Read Vendor.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label
                      text="Alamat Operasional"
                      required
                      className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />

                    <Textarea
                      value={formData.alamat}
                      onChange={(e) => setField("alamat", e.target.value)}
                      placeholder="Alamat lengkap operasional vendor..."
                      className="!min-h-[100px] !rounded-xl !bg-white !p-4 !text-[11px] font-bold"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                      <User size={21} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Penanggung Jawab
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Kontak utama dan kontak cadangan vendor.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        text="Nama PJ Utama"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.pj_1}
                          onChange={(e) => setField("pj_1", e.target.value)}
                          placeholder="Nama penanggung jawab"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Kontak PJ Utama"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.telp_pj_1}
                          onChange={(e) =>
                            setField("telp_pj_1", e.target.value)
                          }
                          placeholder="Nomor telepon / kontak"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Nama PJ 2 Opsional"
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.pj_2}
                          onChange={(e) => setField("pj_2", e.target.value)}
                          placeholder="Nama PJ cadangan"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Kontak PJ 2 Opsional"
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.telp_pj_2}
                          onChange={(e) =>
                            setField("telp_pj_2", e.target.value)
                          }
                          placeholder="Nomor telepon / kontak"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                        />

                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                      <ShieldCheck size={21} />
                    </div>

                    <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                      Perubahan status kemitraan tetap dilakukan dari halaman
                      Read Vendor agar alur kontrol data lebih konsisten.
                      Halaman edit ini berfokus pada profil, kontak, dokumen,
                      dan kredensial akses vendor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-l border-gray-100 p-7">
              <div className="mb-5">
                <Label
                  text="Access & Archive"
                  className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                />

                <h2 className="text-lg font-black uppercase text-gray-800">
                  Akun & Dokumen Vendor
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
                          Kredensial Login
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
                            {formData.email || "—"}
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
                            value={formData.password}
                            onChange={(e) =>
                              setField("password", e.target.value)
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
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                        <UploadCloud size={21} />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                          Arsip Dokumen
                        </p>

                        <p className="text-[9px] font-bold text-gray-400">
                          Perbarui dokumen jika ada revisi file.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          text="Dokumen NPWP"
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <Upload
                          onFileSelect={(file) =>
                            setField("new_npwp_file", file)
                          }
                        />

                        <p className="ml-1 truncate text-[9px] font-bold text-gray-400">
                          {selectedDocument.npwp}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          text="KTP PJ"
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <Upload
                          onFileSelect={(file) =>
                            setField("new_ktp_pj_file", file)
                          }
                        />

                        <p className="ml-1 truncate text-[9px] font-bold text-gray-400">
                          {selectedDocument.ktp}
                        </p>
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
                          Ringkasan sebelum disimpan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Nama Vendor"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-gray-800">
                          {formData.nama_vendor || "—"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4">
                          <Label
                            text="Pilar"
                            className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                          />

                          <p className="text-[12px] font-black uppercase text-[#0AC4E0]">
                            {formData.pilar || "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <Label
                            text="Status"
                            className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                          />

                          <p
                            className={`text-[12px] font-black uppercase ${isBermitra ? "text-emerald-600" : "text-gray-400"
                              }`}
                          >
                            {formData.status || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="PJ Utama"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-gray-800">
                          {formData.pj_1 || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Email Login"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[11px] font-bold lowercase text-gray-500">
                          {formData.email || "—"}
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
                  onClick={() => navigate("/admin/vendor")}
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

export default EditVendor;