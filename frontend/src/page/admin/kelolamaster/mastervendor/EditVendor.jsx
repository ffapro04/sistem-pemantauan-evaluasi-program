/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
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
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama_vendor: "",
    no_register: "",
    pilar: "Akademik",
    alamat: "",
    pj_1: "",
    email_pj_1: "",
    pj_2: "",
    email_pj_2: "",
    email: "",
    password: "",
    status: "Bermitra",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        setFormData({
          nama_vendor: d.nama_vendor || "",
          no_register: d.no_register || "",
          pilar: d.pilar || "Akademik",
          alamat: d.alamat || "",
          pj_1: d.pj_1 || "",
          email_pj_1: d.telp_pj_1 || "",
          pj_2: d.pj_2 || "",
          email_pj_2: d.telp_pj_2 || "",
          email: d.user?.email || "",
          password: d.user?.password || "", // ambil password dari relasi user
          status: d.status || "Bermitra",
        });
      } catch (err) {
        Swal.fire("Error", "Gagal mengambil data rekanan", "error");
        navigate("/admin/vendor");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        pilar: formData.pilar,
        alamat: formData.alamat,
        pj_1: formData.pj_1,
        telp_pj_1: formData.email_pj_1,
        pj_2: formData.pj_2,
        telp_pj_2: formData.email_pj_2,
        email: formData.email,
        status: formData.status,
      };
      if (formData.password) payload.password = formData.password;

      await axios.patch(`http://localhost:3000/vendor/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "UPDATE BERHASIL",
        text: "Profil vendor telah diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/vendor");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Gagal menyimpan perubahan";
      Swal.fire("Gagal", Array.isArray(errMsg) ? errMsg[0] : errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <RefreshCw className="animate-spin text-[#1E5AA5]" size={40} />
      </div>
    );

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
                onClick={() => navigate("/admin/vendor")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  MODIFIKASI <span className="text-blue-200">VENDOR</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Partner Data & Access Update
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
              <Database size={14} className="text-blue-200" /> ID: #
              {id?.slice(-6).toUpperCase()}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col overflow-hidden bg-white"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                {/* KIRI: DATA TERKUNCI + PASSWORD */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-[#1E5AA5] rounded-full"></div>
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Master Identity
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Nama Locked */}
                      <div className="space-y-2">
                        <Label
                          text="Nama Lembaga (Locked)"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <div className="relative">
                          <Input
                            value={formData.nama_vendor}
                            disabled
                            className="!py-4 !pl-12 !bg-white !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                          />
                          <Building2
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={18}
                          />
                        </div>
                      </div>

                      {/* No Register Locked */}
                      <div className="space-y-2">
                        <Label
                          text="No. Register (Locked)"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <div className="relative">
                          <Input
                            value={formData.no_register}
                            disabled
                            className="!py-4 !pl-12 !bg-white !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl font-mono"
                          />
                          <FileText
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={18}
                          />
                        </div>
                      </div>

                      {/* Password Editable */}
                      <div className="space-y-2">
                        <Label
                          text="Kata Sandi Login"
                          className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                        />
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            placeholder="Ketik password baru..."
                            className="!py-4 !pl-12 !pr-12 !bg-white !border-blue-100 focus:!border-blue-400 !text-gray-700 !font-bold !rounded-2xl shadow-sm transition-all"
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

                    <div className="p-5 bg-white rounded-3xl border border-gray-100 flex gap-3">
                      <ShieldCheck
                        size={18}
                        className="text-emerald-500 shrink-0"
                      />
                      <p className="text-[9px] text-gray-400 leading-relaxed italic">
                        Nama dan nomor register bersifat permanen. Password
                        vendor dapat diperbarui kapan saja.
                      </p>
                    </div>
                  </div>
                </div>

                {/* KANAN: UPDATE DATA */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest">
                      Update Konfigurasi Vendor
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        text="Pilar Program"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Dropdown
                        icon={Tags}
                        value={formData.pilar}
                        onChange={(val) =>
                          setFormData({ ...formData, pilar: val })
                        }
                        items={[
                          { label: "AKADEMIK", value: "Akademik" },
                          { label: "KARAKTER", value: "Karakter" },
                          { label: "SENI BUDAYA", value: "Seni Budaya" },
                          {
                            label: "KECAKAPAN HIDUP",
                            value: "Kecakapan Hidup",
                          },
                        ]}
                        className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="Status Kemitraan"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Dropdown
                        icon={ShieldCheck}
                        value={formData.status}
                        onChange={(val) =>
                          setFormData({ ...formData, status: val })
                        }
                        items={[
                          { label: "BERMITRA", value: "Bermitra" },
                          { label: "TIDAK BERMITRA", value: "Tidak Bermitra" },
                        ]}
                        className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Alamat Operasional"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Textarea
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[11px] font-bold"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        text="Nama PJ Utama"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          value={formData.pj_1}
                          onChange={(e) =>
                            setFormData({ ...formData, pj_1: e.target.value })
                          }
                          className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
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
                        text="Email Kontak PJ 1"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          type="email"
                          value={formData.email_pj_1}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email_pj_1: e.target.value,
                            })
                          }
                          className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                          required
                        />
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        text="Email Login Sistem"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
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
                        text="Nama PJ 2 (Opsional)"
                        className="!text-[9px] text-gray-400 uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          value={formData.pj_2}
                          onChange={(e) =>
                            setFormData({ ...formData, pj_2: e.target.value })
                          }
                          placeholder="PJ Pendamping"
                          className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        />
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0">
              <Button
                text="KEMBALI"
                onClick={() => navigate("/admin/vendor")}
                className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm transition-all uppercase tracking-widest"
              />
              <Button
                text={loading ? "SAVING..." : "SIMPAN PERUBAHAN"}
                type="submit"
                disabled={loading}
                className="!px-10 !py-2.5 !bg-[#2E5AA7] hover:!bg-[#1c4d94] !text-white !rounded-full !text-[9px] font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all border-none uppercase tracking-widest"
              />
            </div>
          </form>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditVendor;
