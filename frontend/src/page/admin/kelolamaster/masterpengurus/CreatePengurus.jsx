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
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const CreatePengurus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: 1,
    jabatan: "Ketua Pengurus",
  });

  const jabatanOptions = [
    { value: "Admin", label: "SUPER ADMINISTRATOR" },
    { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
    { value: "Sekretaris", label: "SEKRETARIS" },
    { value: "Bendahara", label: "BENDAHARA" },
    { value: "Anggota Pengurus", label: "ANGGOTA PENGURUS" },
  ];

  useEffect(() => {
    // Sinkronisasi id_role: 0 untuk Admin, 1 untuk lainnya
    setFormData((prev) => ({
      ...prev,
      id_role: formData.jabatan === "Admin" ? 0 : 1,
    }));
    if (formData.jabatan !== "Admin") setAdminKey("");
  }, [formData.jabatan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.jabatan === "Admin" && adminKey !== MASTER_AUTH_KEY) {
      return Swal.fire({
        icon: "error",
        title: "Akses Otoritas Ditolak",
        text: "Master Key tidak valid!",
      });
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/users/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Akun telah diaktifkan.",
      });
      navigate("/admin/pengurus");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Kesalahan server",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden">
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#1E5AA5] shrink-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/admin/pengurus")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  REGISTRASI <span className="text-blue-200">PENGURUS</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 uppercase italic mt-2">
                  Identity & Access Management
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
              <Database size={14} className="text-blue-200" /> SYSTEM CORE V.2
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        placeholder="Ketik nama lengkap..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
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
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        type="email"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="nama@ypamdr.or.id"
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
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
                      text="Password"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        type="password"
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Buat password manual..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
                        required
                      />
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Jabatan"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Dropdown
                      icon={Briefcase}
                      value={formData.jabatan}
                      onChange={(val) =>
                        setFormData({ ...formData, jabatan: val })
                      }
                      items={jabatanOptions}
                      className="!py-4 !bg-gray-50/50 !rounded-2xl font-extrabold"
                    />
                  </div>
                  {formData.jabatan === "Admin" && (
                    <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-3 text-rose-600 font-black text-[10px] uppercase">
                        <ShieldAlert size={18} /> CRITICAL SECURITY ZONE
                      </div>
                      <div className="relative">
                        <Input
                          type="password"
                          value={adminKey}
                          onChange={(e) => setAdminKey(e.target.value)}
                          placeholder="Master Authorization Key..."
                          className="!py-4 !pl-12 !bg-white !border-rose-200 !rounded-2xl font-black text-rose-600"
                          required
                        />
                        <KeyRound
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300"
                          size={18}
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-6 rounded-[2rem] bg-blue-50/30 border border-blue-100 border-dashed italic text-[10px] text-blue-400 font-medium leading-relaxed">
                    * Pastikan data sesuai dengan SK Pengangkatan Pengurus.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-12 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/pengurus")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm"
                />
                <Button
                  text={loading ? "MENGIRIM..." : "SIMPAN DATA"}
                  type="submit"
                  disabled={loading}
                  className={`!px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg ${formData.jabatan === "Admin" ? "!bg-rose-600 shadow-rose-900/10" : "!bg-[#2E5AA7] shadow-blue-900/10"} !text-white border-none`}
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default CreatePengurus;
