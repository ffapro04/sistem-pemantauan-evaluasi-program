/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  School,
  Award,
  MapPin,
  Info,
  Database,
  BookOpen,
  Hash,
  User,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Atomik Premium
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import Dropdown from "../../../../components/Dropdown";
import PageWrapper from "../../../../components/PageWrapper";
import Textarea from "../../../../components/Textarea";

const CreateSekolah = () => {
  const navigate = useNavigate();
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    npsn: "",
    nama_sekolah: "",
    jenjang: "SD",
    akreditasi: "A",
    id_wilayah: "",
    alamat: "",
    email_login: "",
    password_login: "",
    id_role: 5, // Sesuai mapping: Role Sekolah adalah ID 5
  });

  useEffect(() => {
    const fetchWilayah = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // FIX: Parsing nama wilayah agar tidak kosong (Lampung, bukan Indonesia/Lampung/)
        const formatted = res.data
          .filter((w) => w.status === true)
          .map((w) => ({
            value: w.id_wilayah,
            label: w.nama_wilayah
              .split("/")
              .filter(Boolean)
              .pop()
              .toUpperCase(),
          }));
        setWilayahList(formatted);
      } catch (err) {
        console.error("Gagal ambil wilayah", err);
      }
    };
    fetchWilayah();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_wilayah) {
      return Swal.fire(
        "Peringatan",
        "Pilih wilayah penugasan unit!",
        "warning",
      );
    }

    if (formData.password_login.length < 8) {
      return Swal.fire(
        "Peringatan",
        "Password minimal 8 karakter demi keamanan!",
        "warning",
      );
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        id_wilayah: Number(formData.id_wilayah),
      };

      await axios.post("http://localhost:3000/sekolah", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "REGISTRASI BERHASIL",
        text: "Unit sekolah dan akun akses telah diaktifkan.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/admin/sekolah");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Terjadi kesalahan server";
      Swal.fire({
        icon: "error",
        title: "GAGAL SIMPAN",
        html: `<div style="text-align: left; font-size: 12px;">${Array.isArray(errorMsg) ? errorMsg.join("<br>") : errorMsg}</div>`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER BANNER */}
          <div className="px-8 md:px-16 pt-12 pb-10 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/sekolah")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  REGISTRASI <span className="text-blue-200">UNIT SEKOLAH</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Educational Entity Registry & Access Management
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
              <Database size={14} className="text-blue-200" /> SYSTEM CORE V.2
            </div>
          </div>

          {/* FORM AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 pt-5 flex-1">
                {/* KOLOM KIRI: IDENTITAS SEKOLAH */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      School Identity
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-2">
                      <Label
                        text="NPSN"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          placeholder="8 Digit"
                          value={formData.npsn}
                          onChange={(e) =>
                            setFormData({ ...formData, npsn: e.target.value })
                          }
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-mono font-bold"
                          required
                        />
                        <Hash
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label
                        text="Nama Lengkap Unit"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          placeholder="Ketik nama sekolah..."
                          value={formData.nama_sekolah}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nama_sekolah: e.target.value,
                            })
                          }
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                          required
                        />
                        <School
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        text="Jenjang Pendidikan"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Dropdown
                        icon={BookOpen}
                        value={formData.jenjang}
                        onChange={(val) =>
                          setFormData({ ...formData, jenjang: val })
                        }
                        items={[
                          { label: "SD", value: "SD" },
                          { label: "SMP", value: "SMP" },
                          { label: "SMA", value: "SMA" },
                          { label: "SMK", value: "SMK" },
                        ]}
                        className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="Akreditasi"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Dropdown
                        icon={Award}
                        value={formData.akreditasi}
                        onChange={(val) =>
                          setFormData({ ...formData, akreditasi: val })
                        }
                        items={[
                          { label: "Grade A", value: "A" },
                          { label: "Grade B", value: "B" },
                          { label: "Grade C", value: "C" },
                        ]}
                        className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed flex gap-4">
                    <ShieldCheck
                      size={20}
                      className="text-[#1E5AA5] shrink-0 mt-1"
                    />
                    <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
                      Data identitas unit sekolah akan disinkronkan dengan
                      pangkalan data pendidikan pusat YPA-MDR.
                    </p>
                  </div>
                </div>

                {/* KOLOM KANAN: PENEMPATAN & AKSES */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Regional & Auth
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Wilayah Operasional"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Dropdown
                      icon={MapPin}
                      label="PILIH WILAYAH BINAAN"
                      value={formData.id_wilayah}
                      onChange={(val) =>
                        setFormData({ ...formData, id_wilayah: val })
                      }
                      items={wilayahList}
                      className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Alamat Lengkap Unit"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Textarea
                      placeholder="Input alamat detail..."
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[10px]"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        text="Email Login Akun"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="admin@sekolah.com"
                          value={formData.email_login}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email_login: e.target.value,
                            })
                          }
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                          required
                        />
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="Password Login"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password_login}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password_login: e.target.value,
                            })
                          }
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                          required
                        />
                        <LockKeyhole
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/sekolah")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm transition-all"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN UNIT"}
                  type="submit"
                  disabled={loading}
                  className="!px-10 !py-2.5 !bg-[#2E5AA7] hover:!bg-[#1c4d94] !text-white !rounded-full !text-[9px] font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all border-none"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default CreateSekolah;
