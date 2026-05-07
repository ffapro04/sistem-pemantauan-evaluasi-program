/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  Mail,
  ShieldCheck,
  User,
  LockKeyhole,
  FileText,
  Database,
  Tags,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import Dropdown from "../../../../components/Dropdown";
import PageWrapper from "../../../../components/PageWrapper";
import Textarea from "../../../../components/Textarea";
import Upload from "../../../../components/Upload";

const CreateVendor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    npwp_file: null,
    ktp_pj_file: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        nama_vendor: formData.nama_vendor,
        no_register: formData.no_register,
        pilar: formData.pilar,
        alamat: formData.alamat,
        pj_1: formData.pj_1,
        pj_2: formData.pj_2,
        email: formData.email,
        password: formData.password,
        telp_pj_1: formData.email_pj_1,
        telp_pj_2: formData.email_pj_2,
        npwp_file: formData.npwp_file?.name || "upload_pending_npwp.pdf",
        ktp_pj_file: formData.ktp_pj_file?.name || "upload_pending_ktp.pdf",
      };

      await axios.post("http://localhost:3000/vendor", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "REGISTRASI BERHASIL",
        text: "Vendor berhasil didaftarkan ke sistem.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/admin/vendor");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan server";
      Swal.fire({
        icon: "error",
        title: "GAGAL SIMPAN",
        html: `<div style="font-size:12px">${Array.isArray(errMsg) ? errMsg.join("<br>") : errMsg}</div>`,
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
                onClick={() => navigate("/admin/vendor")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  REGISTRASI <span className="text-blue-200">VENDOR</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Partner Registry & Access Management
                </p>
              </div>
            </div>
          </div>

          {/* FORM AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 pt-5 flex-1">
                {/* KOLOM KIRI: IDENTITAS VENDOR */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Identitas Vendor
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Nama Perusahaan / Lembaga"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nama_vendor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_vendor: e.target.value,
                          })
                        }
                        placeholder="Input nama resmi..."
                        className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        required
                      />
                      <Building2
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                        size={14}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        text="No. Register"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          value={formData.no_register}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              no_register: e.target.value,
                            })
                          }
                          placeholder="NIB / Reg"
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold font-mono"
                          required
                        />
                        <FileText
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
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
                      placeholder="Alamat lengkap..."
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[10px]"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        text="NPWP (PDF)"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Upload
                        onFileSelect={(f) =>
                          setFormData({ ...formData, npwp_file: f })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="KTP PJ (JPG/PDF)"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Upload
                        onFileSelect={(f) =>
                          setFormData({ ...formData, ktp_pj_file: f })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: PJ & AKSES */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Penanggung Jawab & Akses
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                          placeholder="Nama PJ 1"
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
                        text="Email Kontak PJ"
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
                          placeholder="email@vendor.com"
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                          required
                        />
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                  </div>

                  {/* LOGIN BOX */}
                  <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                      <h4 className="text-[10px] font-black uppercase text-[#1E5AA5] tracking-widest">
                        Kredensial Login Sistem
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          text="Email Login"
                          required
                          className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                        />
                        <div className="relative">
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="email@login.com"
                            className="!py-4 !pl-10 !bg-white !border-blue-100 !rounded-2xl font-bold"
                            required
                          />
                          <Mail
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E5AA5] opacity-40"
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
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="!py-4 !pl-10 !bg-white !border-blue-100 !rounded-2xl font-bold"
                            required
                          />
                          <LockKeyhole
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E5AA5] opacity-40"
                            size={14}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 opacity-70">
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
                          placeholder="PJ 2"
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        />
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="Email Kontak PJ 2"
                        className="!text-[9px] text-gray-400 uppercase font-black"
                      />
                      <div className="relative">
                        <Input
                          type="email"
                          value={formData.email_pj_2}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email_pj_2: e.target.value,
                            })
                          }
                          placeholder="email@pj2.com"
                          className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        />
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                          size={14}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed flex gap-4">
                    <ShieldCheck
                      size={20}
                      className="text-[#1E5AA5] shrink-0 mt-1"
                    />
                    <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
                      Data vendor akan disinkronkan ke sistem kemitraan YPA-MDR
                      dan akun akses akan segera diaktifkan.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/vendor")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm transition-all"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN VENDOR"}
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

export default CreateVendor;
