/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Briefcase,
  RefreshCcw,
  User,
  Mail,
  Database,
  ShieldAlert,
  KeyRound,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

// Kode Otorisasi Rahasia (Sama dengan Create)
const MASTER_AUTH_KEY = "Y4y4s4n4str4";

const EditPengurus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    jabatan: "Ketua Pengurus",
    id_role: 1,
  });

  const jabatanOptions = [
    { value: "Admin", label: "SUPER ADMINISTRATOR" },
    { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
    { value: "Sekretaris", label: "SEKRETARIS" },
    { value: "Bendahara", label: "BENDAHARA" },
    { value: "Anggota Pengurus", label: "ANGGOTA PENGURUS" },
  ];

  // 1. Fetch Data Awal
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
            jabatan: res.data.jabatan || "Ketua Pengurus",
            id_role: res.data.id_role,
          });
        }
      } catch (err) {
        Swal.fire("Error", "Gagal sinkronisasi data server", "error");
        navigate("/admin/pengurus");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // 2. Sinkronisasi id_role saat jabatan berubah
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      id_role: formData.jabatan === "Admin" ? 0 : 1,
    }));
    if (formData.jabatan !== "Admin") setAdminKey("");
  }, [formData.jabatan]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Master Key jika mengubah jabatan menjadi Admin
    if (formData.jabatan === "Admin" && adminKey !== MASTER_AUTH_KEY) {
      return Swal.fire({
        icon: "error",
        title: "Otoritas Ditolak",
        text: "Master Authorization Key diperlukan untuk akses Super Admin!",
        confirmButtonColor: "#EF4444",
      });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire(
        "Berhasil",
        "Data Otoritas Struktural Telah Diperbarui",
        "success",
      );
      navigate("/admin/pengurus");
    } catch (err) {
      Swal.fire("Gagal", "Gagal memperbarui data ke database", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-widest uppercase italic">
          <RefreshCcw className="animate-spin" size={40} /> Syncing Data...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* Header Section */}
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/pengurus")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg backdrop-blur-md"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  PEMBARUAN <span className="text-blue-200">OTORITAS</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Structural Authority Update System
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-md z-10 shadow-inner">
              <Database size={14} className="text-blue-200" /> UID:{" "}
              {id?.substring(0, 8)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-6 flex-1">
                {/* Kolom Kiri: Data Terkunci */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap (Sistem Locked)"
                      className="!text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nama}
                        disabled
                        className="!py-4.5 !pl-12 !bg-gray-50/50 !border-gray-100 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl shadow-inner"
                      />
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Email Institusi (Sistem Locked)"
                      className="!text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.email}
                        disabled
                        className="!py-4.5 !pl-12 !bg-gray-50/50 !border-gray-100 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl shadow-inner"
                      />
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Update Jabatan & Security */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label
                      text="Update Posisi Struktural"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
                    />
                    <Dropdown
                      icon={Briefcase}
                      value={formData.jabatan}
                      onChange={(val) =>
                        setFormData({ ...formData, jabatan: val })
                      }
                      items={jabatanOptions}
                      className="!py-4.5 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold text-gray-700 shadow-sm"
                    />
                  </div>

                  {formData.jabatan === "Admin" ? (
                    <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-3 text-rose-600">
                        <ShieldAlert size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Master Otoritas Zone
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type="password"
                          value={adminKey}
                          onChange={(e) => setAdminKey(e.target.value)}
                          placeholder="Masukkan Master Key..."
                          className="!py-4 !pl-11 !bg-white !border-rose-200 !rounded-xl font-bold text-rose-600"
                          required
                        />
                        <KeyRound
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300"
                          size={18}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-[2rem] bg-blue-50/30 border border-blue-100 border-dashed">
                      <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
                        * Perubahan jabatan akan berdampak pada hak akses fitur
                        di dalam dashboard.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: COMPACT STYLE */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/pengurus")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 hover:!bg-gray-50 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                />

                <Button
                  text={loading ? "MENGIRIM..." : "SIMPAN PERUBAHAN"}
                  type="submit"
                  disabled={loading}
                  className={`!px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg active:scale-95 transition-all border-none uppercase tracking-[0.2em] ${
                    formData.jabatan === "Admin"
                      ? "!bg-rose-600"
                      : "!bg-[#2E5AA7]"
                  } !text-white`}
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditPengurus;
