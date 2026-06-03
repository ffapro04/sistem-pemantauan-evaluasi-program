/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  Save,
  School,
  Award,
  MapPin,
  Database,
  BookOpen,
  Hash,
  User,
  LockKeyhole,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Globe2,
  Mail,
  AlignLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import Dropdown from "../../../../components/Dropdown";
import PageWrapper from "../../../../components/PageWrapper";
import Textarea from "../../../../components/Textarea";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

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

const CreateSekolah = () => {
  const navigate = useNavigate();

  const [wilayahList, setWilayahList] = useState([]);
  const [loadingWilayah, setLoadingWilayah] = useState(true);
  const [loading, setLoading] = useState(false);

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const [formData, setFormData] = useState({
    npsn: "",
    nama_sekolah: "",
    jenjang: "SD",
    akreditasi: "A",
    id_wilayah: "",
    alamat: "",
    email_login: "",
    password_login: "",
    id_role: 5,
    area: "",
    kriteria_2022: "",
    sertifikat_iso: "Belum",
    adiwiyata: "Belum",
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
      } catch (err) {
        Toast.fire({
          icon: "error",
          title: "Gagal mengambil data wilayah",
        });
      } finally {
        setLoadingWilayah(false);
      }
    };

    fetchWilayah();
  }, []);

  const validateForm = () => {
    if (!formData.npsn.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "NPSN sekolah wajib diisi.",
      });

      return false;
    }

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
        message: "Alamat lengkap sekolah wajib diisi.",
      });

      return false;
    }

    if (!formData.email_login.trim()) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Email login sekolah wajib diisi.",
      });

      return false;
    }

    if (formData.password_login.length < 8) {
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
        npsn: formData.npsn.trim(),
        nama_sekolah: formData.nama_sekolah.trim(),
        jenjang: formData.jenjang,
        akreditasi: formData.akreditasi,
        id_wilayah: Number(formData.id_wilayah),
        alamat: formData.alamat.trim(),
        email_login: formData.email_login.trim(),
        password_login: formData.password_login,
        id_role: 5,
        status: true,
      };

      await axios.post("http://localhost:3000/sekolah", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data sekolah dan akun akses berhasil ditambahkan.",
      });

      setTimeout(() => navigate("/admin/sekolah"), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Gagal menambahkan data sekolah.";

      setStatusNote({
        show: true,
        type: "error",
        message: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

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
                  Tambah Data <span className="text-[#0AC4E0]">Sekolah</span>
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
                        Data dasar unit sekolah yang akan didaftarkan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        text="NPSN"
                        required
                        className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <div className="relative">
                        <Input
                          value={formData.npsn}
                          onChange={(e) => setField("npsn", e.target.value)}
                          placeholder="8 Digit"
                          className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-black"
                        />

                        <Hash
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={15}
                        />
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
                        Sekolah harus terhubung ke provinsi wilayah aktif.
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
                      className="!min-h-[95px] !rounded-xl !bg-white !p-4 !text-[11px] font-bold"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                      <ShieldCheck size={21} />
                    </div>

                    <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                      Setelah sekolah dibuat, sistem akan menyimpan unit sekolah
                      sekaligus akun login sekolah. Status awal sekolah otomatis
                      aktif dan dapat dikontrol dari halaman Read Sekolah.
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

              <div className="flex-1 overflow-y-auto no-scrollbar">
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
                          Digunakan sekolah untuk masuk ke sistem.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          text="Email Login"
                          required
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <div className="relative">
                          <Input
                            type="email"
                            value={formData.email_login}
                            onChange={(e) =>
                              setField("email_login", e.target.value)
                            }
                            placeholder="admin@sekolah.sch.id"
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
                          text="Password Login"
                          required
                          className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                        />

                        <div className="relative">
                          <Input
                            type="password"
                            value={formData.password_login}
                            onChange={(e) =>
                              setField("password_login", e.target.value)
                            }
                            placeholder="Minimal 8 karakter"
                            className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                          />

                          <LockKeyhole
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={15}
                          />
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
                          Preview Data
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
                  text={loading ? "Menyimpan..." : "Simpan Sekolah"}
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

export default CreateSekolah;