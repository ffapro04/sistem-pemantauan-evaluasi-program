/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  RefreshCcw,
  Database,
  ShieldCheck,
  Mail,
  User,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Checkbox from "../../../../components/Checkbox";

const EditAO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [wilayahList, setWilayahList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "", // Menampung password baru/lama
    id_wilayahs: [],
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Ambil daftar wilayah aktif
        const resWilayah = await axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWilayahList(resWilayah.data.filter((w) => w.status === true));

        // 2. Ambil detail AO (Memanggil findOne yang sudah kita addSelect('password') di backend)
        const resAO = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = resAO.data;
        setFormData({
          nama: user.nama || "",
          email: user.email || "",
          password: user.password || "", // Mengambil password dari database
          id_wilayahs: Array.isArray(user.wilayah)
            ? user.wilayah.map((w) => w.id_wilayah)
            : [],
        });
      } catch (error) {
        Swal.fire("Error", "Gagal sinkronisasi data otoritas AO", "error");
        navigate("/admin/ao");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, navigate]);

  const handleToggleWilayah = (wilayahId) => {
    setFormData((prev) => {
      const isExist = prev.id_wilayahs.includes(wilayahId);
      if (isExist) {
        return {
          ...prev,
          id_wilayahs: prev.id_wilayahs.filter((item) => item !== wilayahId),
        };
      } else {
        return { ...prev, id_wilayahs: [...prev.id_wilayahs, wilayahId] };
      }
    });
  };

  const filteredWilayah = wilayahList.filter((w) =>
    w.nama_wilayah.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.id_wilayahs.length === 0) {
      return Swal.fire(
        "Otoritas Kosong",
        "AO wajib memiliki minimal satu wilayah penugasan!",
        "warning",
      );
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Payload lengkap termasuk password dan wilayah
      const payload = {
        password: formData.password,
        id_wilayahs: formData.id_wilayahs.map(Number),
      };

      await axios.patch(`http://localhost:3000/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Update Berhasil",
        text: "Kredensial dan Penugasan AO telah diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/ao");
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat memperbarui data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} /> Synchronizing Area
          Assignments...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* Header Banner */}
          <div className="px-8 md:px-16 pt-12 pb-10 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/ao")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  MODIFIKASI <span className="text-blue-200">OTORITAS AO</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 uppercase italic mt-2 tracking-widest">
                  Structural & Credential Update System
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col overflow-hidden bg-white"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                {/* Kiri: Identitas & Password */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-[#1E5AA5] rounded-full"></div>
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Account & Security
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Nama (Locked) */}
                      <div className="space-y-2">
                        <Label
                          text="Nama Personnel"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <div className="relative">
                          <Input
                            value={formData.nama}
                            disabled
                            className="!py-4 !pl-12 !bg-white !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                          />
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={18}
                          />
                        </div>
                      </div>

                      {/* Email (Locked) */}
                      <div className="space-y-2">
                        <Label
                          text="Email Sistem"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <div className="relative">
                          <Input
                            value={formData.email}
                            disabled
                            className="!py-4 !pl-12 !bg-white !border-gray-200 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                          />
                          <Mail
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={18}
                          />
                        </div>
                      </div>

                      {/* Password (Editable) */}
                      <div className="space-y-2">
                        <Label
                          text="Update Kata Sandi"
                          className="!text-[9px] text-[#1E5AA5] uppercase font-black tracking-widest"
                        />
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
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

                    <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-3">
                      <ShieldCheck
                        size={18}
                        className="text-[#1E5AA5] shrink-0"
                      />
                      <p className="text-[9px] text-[#1E5AA5] font-medium leading-relaxed italic">
                        Perubahan password akan langsung berpengaruh pada akses
                        login personil.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kanan: Seleksi Wilayah */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest">
                        Seleksi Wilayah Kerja
                      </h3>
                    </div>
                    <div className="relative w-full md:w-80">
                      <input
                        type="text"
                        placeholder="Cari nama wilayah..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl font-bold text-[10px] outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                      />
                      <Search
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar px-1">
                    {filteredWilayah.map((w) => (
                      <div key={w.id_wilayah} className="group">
                        <Checkbox
                          label={w.nama_wilayah
                            .split("/")
                            .filter(Boolean)
                            .pop()
                            .toUpperCase()}
                          value={w.id_wilayah}
                          checked={formData.id_wilayahs.includes(w.id_wilayah)}
                          onChange={handleToggleWilayah}
                          className={`!py-4 !px-6 !rounded-3xl !border-2 !transition-all ${
                            formData.id_wilayahs.includes(w.id_wilayah)
                              ? "!border-[#1E5AA5] !bg-blue-50/30"
                              : "!border-transparent !bg-gray-50 hover:!bg-gray-100"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1E5AA5] shadow-md border border-gray-100">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="text-xs font-black text-gray-800 uppercase tracking-tight block">
                    {formData.id_wilayahs.length} Wilayah Terpilih
                  </span>
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1 block italic">
                    Data siap diperbarui
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/ao")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 transition-all shadow-sm"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN PERUBAHAN"}
                  type="submit"
                  disabled={loading}
                  className="!px-10 !py-2.5 !bg-[#2E5AA7] hover:!bg-[#1c4d94] !text-white !rounded-full !text-[9px] font-black shadow-lg active:scale-95 transition-all border-none"
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditAO;
