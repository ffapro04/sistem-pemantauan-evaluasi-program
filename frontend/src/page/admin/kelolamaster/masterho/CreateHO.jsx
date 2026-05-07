/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Database,
  Lock,
  Building2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const CreateHO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "Staff Head Office",
    id_role: 3, // FIX: Selalu 3 untuk Head Office
    jenis: "akademik", // akademik / non-akademik
    sub_jenis: "SD & SMP", // SD & SMP / SMK / null
  });

  const deptOptions = [
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const tingkatOptions = [
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  // Logic: Jika pilih Non-Akademik, sub_jenis dikosongkan
  useEffect(() => {
    if (formData.jenis === "non-akademik") {
      setFormData((prev) => ({ ...prev, sub_jenis: null }));
    } else if (formData.jenis === "akademik" && !formData.sub_jenis) {
      setFormData((prev) => ({ ...prev, sub_jenis: "SD & SMP" }));
    }
  }, [formData.jenis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Kirim data dengan id_role murni angka 3
      const payload = {
        ...formData,
        id_role: 3,
      };

      await axios.post("http://localhost:3000/users/register", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: "Personil Head Office telah terdaftar di sistem.",
      });
      navigate("/admin/ho");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan pada server",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* Header Banner (Konsisten dengan CreatePengurus) */}
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/ho")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg backdrop-blur-md"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  REGISTRASI <span className="text-blue-200">HEAD OFFICE</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 uppercase italic mt-2 tracking-widest">
                  Personnel Management System
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
              <Database size={14} className="text-blue-200" /> SYSTEM CORE V.2
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1">
                {/* Kolom Kiri: Kredensial Login */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap Personil"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        placeholder="Ketik nama lengkap..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold focus:!bg-white transition-all"
                        required
                      />
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Email Institusi"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        type="email"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="nama.ho@ypamdr.or.id"
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold focus:!bg-white transition-all"
                        required
                      />
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Kata Sandi (Password)"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        type="password"
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Buat password keamanan..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold focus:!bg-white transition-all"
                        required
                      />
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Penempatan & Jabatan */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Jabatan Struktural"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        value={formData.jabatan}
                        onChange={(e) =>
                          setFormData({ ...formData, jabatan: e.target.value })
                        }
                        placeholder="Misal: Staff HO / Manager..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold focus:!bg-white transition-all"
                        required
                      />
                      <Briefcase
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Department (Jenis)"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <Dropdown
                      icon={Building2}
                      value={formData.jenis}
                      onChange={(val) =>
                        setFormData({ ...formData, jenis: val })
                      }
                      items={deptOptions}
                      className="!py-4 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold"
                    />
                  </div>

                  <div
                    className={`space-y-2 transition-all duration-500 ${formData.jenis !== "akademik" ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                  >
                    <Label
                      text="Fokus Bidang (Tingkat)"
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <Dropdown
                      icon={Layers}
                      value={formData.sub_jenis}
                      disabled={formData.jenis !== "akademik"}
                      onChange={(val) =>
                        setFormData({ ...formData, sub_jenis: val })
                      }
                      items={tingkatOptions}
                      className="!py-4 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold"
                    />
                  </div>

                  <div className="p-5 rounded-[2rem] bg-blue-50/30 border border-blue-100 border-dashed">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={16}
                        className="text-blue-400 shrink-0 mt-0.5"
                      />
                      <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
                        Personil HO akan mendapatkan akses dashboard sesuai
                        dengan Department yang dipilih (Akademik/Non-Akademik).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Compact & Consistent) */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/ho")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm active:scale-95 transition-all"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN DATA"}
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

export default CreateHO;
