/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Banknote,
  CreditCard,
  Landmark,
  FileText,
  Database,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

const CreateFinance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_akun: "",
    nomor_rekening: "",
    bank: "Permata",
    keterangan: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/finance", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "REGISTRASI BERHASIL",
        text: "Sumber dana baru telah diaktifkan dalam sistem.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/admin/finance");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "GAGAL SIMPAN",
        text: "Pastikan nomor rekening unik dan koneksi stabil.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0 font-poppins">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER BANNER */}
          <div className="px-8 md:px-16 pt-12 pb-10 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/finance")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  REGISTRASI <span className="text-blue-200">FINANCE</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Budget Allocation & Funding Registry
                </p>
              </div>
            </div>
          </div>

          {/* FORM AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-5xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 pt-5">
                {/* KOLOM KIRI: SUMBER DANA */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Identitas Sumber Dana
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Nama Akun / Alokasi Dana"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nama_akun}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_akun: e.target.value,
                          })
                        }
                        placeholder="Contoh: CSR ASTRA 2026"
                        className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        required
                      />
                      <Database
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                        size={14}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Pilih Institusi Perbankan"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Dropdown
                      icon={Landmark}
                      value={formData.bank}
                      onChange={(val) =>
                        setFormData({ ...formData, bank: val })
                      }
                      items={[
                        { label: "BANK PERMATA", value: "Permata" },
                        { label: "BCA", value: "BCA" },
                        { label: "MANDIRI", value: "Mandiri" },
                        { label: "BNI", value: "BNI" },
                      ]}
                      className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                    />
                  </div>
                </div>

                {/* KOLOM KANAN: REKENING */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Detail Rekening & Catatan
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Nomor Rekening"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nomor_rekening}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nomor_rekening: e.target.value,
                          })
                        }
                        placeholder="Masukan angka tanpa spasi..."
                        className="!py-4 !pl-10 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold font-mono tracking-widest"
                        required
                      />
                      <CreditCard
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                        size={14}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Keterangan / Memo (Opsional)"
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Textarea
                      value={formData.keterangan}
                      onChange={(e) =>
                        setFormData({ ...formData, keterangan: e.target.value })
                      }
                      placeholder="Input informasi tambahan alokasi..."
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[11px] font-bold"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center gap-3 mt-auto pt-12 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/finance")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm transition-all"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN SUMBER DANA"}
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

export default CreateFinance;
