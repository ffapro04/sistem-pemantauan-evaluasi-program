/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  MapPin,
  Award,
  Database,
  Edit3,
  ShieldCheck,
  Lock,
  Mail,
  Hash,
  Eye,
  EyeOff,
  ShieldAlert,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Fingerprint,
  Activity,
  BookOpen,
  CheckCircle2,
  Globe2,
  AlignLeft,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Label from "../../../../components/Label";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const isActiveValue = (value) =>
  value === true || value === "true" || Number(value) === 1;

const cleanWilayahName = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "Belum Ada Wilayah";

  if (raw.includes("/")) {
    return raw.split("/").filter(Boolean).pop() || raw;
  }

  return raw;
};

const normalizeSekolah = (item) => {
  const wilayah = item?.wilayah || {};

  return {
    ...item,
    id_sekolah: item?.id_sekolah ?? item?.idSekolah ?? item?.id,
    npsn: item?.npsn || "—",
    nama_sekolah:
      item?.nama_sekolah || item?.namaSekolah || item?.nama || "—",
    jenjang: item?.jenjang || "—",
    akreditasi: item?.akreditasi || "—",
    alamat: item?.alamat || "",
    email_login: item?.email_login || item?.emailLogin || "—",
    password_login: item?.password_login || item?.passwordLogin || "",
    status: item?.status ?? true,
    wilayah: {
      ...wilayah,
      id_wilayah:
        wilayah?.id_wilayah ??
        wilayah?.idWilayah ??
        item?.id_wilayah ??
        item?.idWilayah,
      nama_wilayah: cleanWilayahName(
        wilayah?.nama_wilayah ||
        wilayah?.namaWilayah ||
        wilayah?.nama ||
        item?.nama_wilayah ||
        item?.namaWilayah,
      ),
      kode_wilayah:
        wilayah?.kode_wilayah ||
        wilayah?.kodeWilayah ||
        item?.kode_wilayah ||
        "—",
      tipe_wilayah:
        wilayah?.tipe_wilayah || wilayah?.keterangan || "Absolute",
      jenis_wilayah: wilayah?.jenis_wilayah || "PROVINSI",
    },
  };
};

const DetailInfoCard = ({ icon, label, value, className = "" }) => (
  <div
    className={`rounded-3xl border border-gray-100 bg-gray-50/50 p-5 ${className}`}
  >
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
        {icon}
      </div>

      <Label
        text={label}
        className="!m-0 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
      />
    </div>

    <p className="break-words text-[12px] font-bold leading-relaxed text-gray-700">
      {value || "—"}
    </p>
  </div>
);

const DetailSekolah = () => {
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

        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(normalizeSekolah(res.data));
      } catch (err) {
        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil detail sekolah.",
        });

        setTimeout(() => navigate("/admin/sekolah"), 1200);
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
      title:
        '<span style="font-size:18px;font-weight:900;text-transform:uppercase;color:#0f172a;">Otorisasi Kredensial</span>',
      html: '<p style="font-size:10px;font-weight:800;color:#0AC4E0;text-transform:uppercase;letter-spacing:.2em;margin-bottom:12px;">Masukkan Master Key</p>',
      input: "password",
      inputPlaceholder: "••••••••••••",
      showCancelButton: true,
      confirmButtonText: "AUTHORIZE",
      cancelButtonText: "BATAL",
      confirmButtonColor: "#0AC4E0",
      cancelButtonColor: "#CBD5E1",
      customClass: {
        popup: "rounded-[3rem] p-10 shadow-2xl border border-slate-100",
        input:
          "rounded-2xl border border-slate-200 text-center tracking-[0.4em] font-black focus:border-[#0AC4E0] focus:ring-0",
        confirmButton:
          "rounded-full px-8 py-3 text-[10px] font-black tracking-widest uppercase",
        cancelButton:
          "rounded-full px-8 py-3 text-[10px] font-black tracking-widest uppercase",
      },
    });

    if (inputKey === MASTER_AUTH_KEY) {
      setShowPassword(true);

      setStatusNote({
        show: true,
        type: "success",
        message: "Akses kredensial berhasil dibuka.",
      });

      return;
    }

    if (inputKey) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Master Key tidak valid. Akses kredensial ditolak.",
      });
    }
  };

  const active = isActiveValue(data?.status);

  const passwordText = useMemo(() => {
    if (!data?.password_login) return "Tidak tersedia";
    return showPassword ? data.password_login : "••••••••";
  }, [data?.password_login, showPassword]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
      <Sidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
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
                  {statusNote.type === "error" ? "Sistem Alert" : "Berhasil"}
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
                  Detail Data <span className="text-[#0AC4E0]">Sekolah</span>
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

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden border-t border-gray-100 lg:grid-cols-[42%_58%]">
            <div className="no-scrollbar overflow-y-auto px-10 py-7">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                  <School size={30} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${active
                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                        : "border-rose-100 bg-rose-50 text-rose-600"
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                      />
                      {active ? "Aktif" : "Nonaktif"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                      <BookOpen size={10} />
                      {data?.jenjang || "—"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                      <Award size={10} />
                      Grade {data?.akreditasi || "—"}
                    </span>
                  </div>

                  <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-gray-900">
                    {data?.nama_sekolah || "—"}
                  </h2>

                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    NPSN: {data?.npsn || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <DetailInfoCard
                    icon={<Hash size={18} />}
                    label="NPSN"
                    value={data?.npsn}
                  />

                  <DetailInfoCard
                    icon={<BookOpen size={18} />}
                    label="Jenjang"
                    value={data?.jenjang}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DetailInfoCard
                    icon={<Award size={18} />}
                    label="Akreditasi"
                    value={`Grade ${data?.akreditasi || "—"}`}
                  />

                  <DetailInfoCard
                    icon={<ShieldCheck size={18} />}
                    label="Status"
                    value={active ? "Aktif" : "Nonaktif"}
                  />
                </div>

                <DetailInfoCard
                  icon={<Globe2 size={18} />}
                  label="Wilayah Provinsi"
                  value={`${data?.wilayah?.nama_wilayah || "—"} · ${data?.wilayah?.kode_wilayah || "—"
                    }`}
                />

                <DetailInfoCard
                  icon={<AlignLeft size={18} />}
                  label="Alamat Sekolah"
                  value={data?.alamat || "Alamat belum tersedia."}
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-5 border-l border-gray-100 p-7">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    text="Access Detail"
                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                  />

                  <h2 className="text-lg font-black uppercase text-gray-800">
                    Akun Login Sekolah
                  </h2>
                </div>

                <div className="rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                  <Fingerprint size={12} className="mr-2 inline" />
                  Protected
                </div>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto">
                <div className="space-y-5">
                  <div className="rounded-[2rem] border border-blue-100/60 bg-blue-50/40 p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                        <Mail size={22} />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                          Email Akses
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          Digunakan sekolah untuk login ke sistem.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5">
                      <Label
                        text="Email Login"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <p className="truncate text-[13px] font-bold lowercase text-slate-700">
                        {data?.email_login || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                        <Lock size={22} />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                          Password Akses
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          Password hanya bisa dilihat menggunakan Master Key.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900 p-5 text-white shadow-xl">
                      <div className="min-w-0 flex-1">
                        <Label
                          text="Protected Credential"
                          className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-cyan-300"
                        />

                        <p
                          className={`truncate font-mono text-sm font-black tracking-[0.35em] ${showPassword ? "text-white" : "text-slate-600"
                            }`}
                        >
                          {passwordText}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRevealRequest}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#0AC4E0] transition-all hover:bg-white/20 active:scale-90"
                        title={showPassword ? "Sembunyikan" : "Lihat Password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <Database size={21} />
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
                          Security Status
                        </p>

                        <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                          Data sekolah dan kredensial akses tersimpan dalam
                          sistem. Perubahan data dilakukan melalui halaman edit
                          dengan otorisasi pola keamanan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                        <MapPin size={21} />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                          Regional Binding
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          Sekolah ini terhubung dengan wilayah provinsi.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Provinsi"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-slate-800">
                          {data?.wilayah?.nama_wilayah || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <Label
                          text="Kode"
                          className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <p className="truncate text-[12px] font-black uppercase text-[#0AC4E0]">
                          {data?.wilayah?.kode_wilayah || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                <Button
                  text="Kembali"
                  icon={<ChevronLeft size={14} />}
                  onClick={() => navigate("/admin/sekolah")}
                  className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                />

                <Button
                  text="Edit Data"
                  icon={<Edit3 size={15} />}
                  onClick={() => navigate(`/admin/sekolah/edit/${id}`)}
                  className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                />
              </div>
            </div>
          </div>
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

export default DetailSekolah;