/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Banknote,
  Landmark,
  CreditCard,
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

const EditFinance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_akun: "",
    nomor_rekening: "",
    bank: "Permata",
    keterangan: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/finance/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        Swal.fire("Gagal", "Data finance tidak ditemukan", "error");
        navigate("/admin/finance");
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
      await axios.patch(`http://localhost:3000/finance/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "UPDATE BERHASIL",
        text: "Data alokasi dana telah diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/finance");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat update data", "error");
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
                  MODIFIKASI <span className="text-blue-200">FINANCE</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Update Account Identity: #{id}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white custom-scrollbar">
            <form
              onSubmit={handleSubmit}
              className="max-w-5xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 pt-5">
                {/* KIRI */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Master Identity
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Nama Akun Alokasi"
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
                      text="Institusi Bank"
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

                {/* KANAN */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Config Transfer
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
                      text="Catatan / Memo"
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Textarea
                      value={formData.keterangan}
                      onChange={(e) =>
                        setFormData({ ...formData, keterangan: e.target.value })
                      }
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[11px] font-bold"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 mt-auto pt-12 pb-16">
                <Button
                  text="BATAL"
                  onClick={() => navigate("/admin/finance")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm transition-all"
                />
                <Button
                  text={loading ? "SAVING..." : "UPDATE DATA"}
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

export default EditFinance;
