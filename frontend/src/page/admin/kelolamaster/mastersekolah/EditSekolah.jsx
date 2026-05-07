/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  School,
  RefreshCw,
  Lock,
  Award,
  Mail,
  Eye,
  EyeOff,
  Hash,
  BookOpen,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Textarea from "../../../../components/Textarea";
import Dropdown from "../../../../components/Dropdown";

const EditSekolah = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama_sekolah: "",
    alamat: "",
    jenjang: "SD",
    npsn: "",
    akreditasi: "A",
    email_login: "",
    password_login: "",
    status: true,
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setFormData({
            nama_sekolah: res.data.nama_sekolah || "",
            alamat: res.data.alamat || "",
            jenjang: res.data.jenjang || "SD",
            npsn: res.data.npsn || "",
            akreditasi: res.data.akreditasi || "A",
            email_login: res.data.email_login || "",
            password_login: res.data.password_login || "",
            status: res.data.status,
          });
        }
      } catch (err) {
        Swal.fire("Error", "Gagal load data", "error");
        navigate("/admin/sekolah");
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
      await axios.patch(`http://localhost:3000/sekolah/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kredensial Unit Telah Diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/sekolah");
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan perubahan", "error");
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
          <div className="px-8 md:px-16 pt-12 pb-10 bg-[#1E5AA5] shrink-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/admin/sekolah")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  EDIT <span className="text-blue-200">UNIT BINAAN</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Access Management & Identity Update
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 flex-1">
                {/* KIRI: IDENTITAS DASAR */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="NPSN (Locked)"
                      className="!text-[9px] text-gray-400 uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.npsn}
                        disabled
                        className="!py-4 !bg-gray-50 !text-gray-400 !rounded-2xl"
                      />
                      <Hash
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Jenjang Pendidikan"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Dropdown
                      icon={BookOpen}
                      value={formData.jenjang}
                      onChange={(v) => setFormData({ ...formData, jenjang: v })}
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
                      text="Grade Akreditasi"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <Dropdown
                      icon={Award}
                      value={formData.akreditasi}
                      onChange={(v) =>
                        setFormData({ ...formData, akreditasi: v })
                      }
                      items={[
                        { label: "Grade A", value: "A" },
                        { label: "Grade B", value: "B" },
                        { label: "Grade C", value: "C" },
                      ]}
                      className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Email Login (Fixed)"
                      className="!text-[9px] text-gray-400 uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.email_login}
                        disabled
                        className="!py-4 !bg-gray-50 !text-gray-400 !rounded-2xl"
                      />
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* KANAN: UPDATE DATA & PASSWORD */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Nama Resmi Unit"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        value={formData.nama_sekolah}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_sekolah: e.target.value,
                          })
                        }
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                      />
                      <School
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
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
                      className="!bg-gray-50/50 !border-gray-200 !rounded-2xl !text-[11px]"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Update Kata Sandi"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password_login}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password_login: e.target.value,
                          })
                        }
                        className="!py-4 !pl-12 !pr-12 !bg-white !border-blue-100 !rounded-2xl font-bold"
                      />
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E5AA5] opacity-30"
                        size={18}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
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
              </div>

              <div className="flex justify-end gap-3 pt-12 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/sekolah")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN PERUBAHAN"}
                  type="submit"
                  disabled={loading}
                  className="!px-10 !py-2.5 !bg-[#2E5AA7] !text-white !rounded-full !text-[9px] font-black shadow-lg"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditSekolah;
