/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  RefreshCcw,
  Database,
  ShieldCheck,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Layers,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const EditHO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jabatan: "",
    jenis: "akademik", // akademik / non-akademik
    sub_jenis: "", // SD & SMP / SMK
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
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        setFormData({
          nama: user.nama || "",
          email: user.email || "",
          password: user.password || "", // Data password ditarik dari backend
          jabatan: user.jabatan || "Staff Head Office",
          jenis: user.jenis || "akademik",
          sub_jenis: user.sub_jenis || "",
        });
      } catch (error) {
        Swal.fire("Error", "Gagal mengambil data personil HO", "error");
        navigate("/admin/ho");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, navigate]);

  // Logic: Reset sub_jenis jika pindah ke non-akademik
  useEffect(() => {
    if (formData.jenis === "non-akademik") {
      setFormData((prev) => ({ ...prev, sub_jenis: null }));
    }
  }, [formData.jenis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Update data HO (id_role tetap 3)
      const payload = {
        ...formData,
        id_role: 3,
      };

      await axios.patch(`http://localhost:3000/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Update Berhasil",
        text: "Kredensial dan Otoritas HO telah diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/ho");
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem saat menyimpan", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} />
          Synchronizing HQ Personnel...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* Banner Header */}
          <div className="px-8 md:px-16 pt-12 pb-10 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/ho")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  MODIFIKASI <span className="text-blue-200">OTORITAS HO</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 uppercase italic mt-2 tracking-widest">
                  Structural & Credential Update System
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-6 flex-1">
                {/* Kolom Kiri: Profil & Kredensial */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap Personnel"
                      className="!text-[9px] text-gray-400 uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nama}
                        disabled
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                      />
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Email Korporat"
                      className="!text-[9px] text-gray-400 uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        value={formData.email}
                        disabled
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                      />
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Update Kata Sandi"
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Ketik password baru..."
                        className="!py-4 !pl-12 !pr-12 !bg-white !border-blue-100 focus:!border-blue-400 !text-gray-700 !font-bold !rounded-2xl shadow-sm transition-all"
                        required
                      />
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E5AA5] opacity-40"
                        size={18}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1E5AA5] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Jabatan & Department */}
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
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold focus:!bg-white"
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
                    className={`space-y-2 transition-all duration-500 ${formData.jenis !== "akademik" ? "opacity-30 pointer-events-none scale-[0.98]" : "opacity-100 scale-100"}`}
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
                      <p className="text-[9px] text-blue-400 font-medium leading-relaxed italic">
                        Perubahan Department akan mengubah cakupan data yang
                        dapat diakses oleh personil di dashboard HO.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/ho")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 hover:!bg-gray-50 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                />

                <Button
                  text={loading ? "SAVING..." : "SIMPAN PERUBAHAN"}
                  type="submit"
                  disabled={loading}
                  className="!px-10 !py-2.5 !bg-[#2E5AA7] hover:!bg-[#1c4d94] !text-white !rounded-full !text-[9px] font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all border-none uppercase tracking-[0.2em]"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditHO;
