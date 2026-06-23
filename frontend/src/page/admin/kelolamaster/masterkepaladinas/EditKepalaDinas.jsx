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
  MapPin, 
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const EditKepalaDinas = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [namaWilayahText, setNamaWilayahText] = useState(""); 

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    jabatan: "Kepala Dinas",
    id_role: 7,
    id_sekolah: null, // <--- Kolom DB pengalih ID Wilayah Kepala Dinas
  });

  const jabatanOptions = [
    { value: "Kepala Dinas", label: "KEPALA DINAS" },
    { value: "Wakil Kepala Dinas", label: "WAKIL KEPALA DINAS" },
    { value: "Sekretaris Dinas", label: "SEKRETARIS DINAS" },
    { value: "Staff Dinas", label: "STAFF DINAS" },
  ];

  // Fetch detail user beserta master data wilayah secara bersamaan
  useEffect(() => {
    const fetchAllEditData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [resWilayah, resUser] = await Promise.all([
          axios.get("http://localhost:3000/wilayah", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3000/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // 1. Ekstraksi master data wilayah dari backend
        let listMasterWilayah = [];
        if (Array.isArray(resWilayah.data)) {
          listMasterWilayah = resWilayah.data;
        } else if (resWilayah.data && Array.isArray(resWilayah.data.data)) {
          listMasterWilayah = resWilayah.data.data;
        }

        // 2. Map data user kepingan form utama
        const userDbData = resUser.data;
        if (userDbData) {
          setFormData({
            nama: userDbData.nama || "",
            email: userDbData.email || "",
            jabatan: userDbData.jabatan || "Kepala Dinas",
            id_role: userDbData.id_role || 7,
            id_sekolah: userDbData.id_sekolah || null, // Nilai ID Wilayah yang tersimpan di DB
          });

          // 3. TRIK SINKRONISASI: Cari nama wilayah berdasarkan id_sekolah yang tersimpan
          const targetWilayahId = userDbData.id_sekolah ? Number(userDbData.id_sekolah) : null;
          
          if (targetWilayahId && listMasterWilayah.length > 0) {
            const wilayahCocok = listMasterWilayah.find(
              (w) => Number(w.id_wilayah) === targetWilayahId
            );
            
            if (wilayahCocok && wilayahCocok.nama_wilayah) {
              // Potong teks path "Indonesia/Bali" menjadi "BALI"
              const namaBersih = String(wilayahCocok.nama_wilayah).split("/").pop().toUpperCase();
              setNamaWilayahText(namaBersih);
            } else {
              setNamaWilayahText("WILAYAH TIDAK DIKENALI");
            }
          } else {
            setNamaWilayahText("BELUM MEMILIKI WILAYAH KERJA");
          }
        }
      } catch (err) {
        console.error("Gagal melakukan sinkronisasi data edit:", err);
        Swal.fire("Error", "Gagal mengambil data Kepala Dinas", "error");
        navigate("/admin/kadin");
      } finally {
        setFetching(false);
      }
    };

    fetchAllEditData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Kirim formData apa adanya (id_sekolah tetap mempertahankan ID Wilayah aslinya)
      await axios.patch(`http://localhost:3000/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Berhasil", "Data Kepala Dinas berhasil diperbarui", "success");
      navigate("/admin/kadin");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat update data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-widest uppercase italic">
          <RefreshCcw className="animate-spin" size={40} />
          Syncing Data...
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          
          {/* HEADER */}
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>

            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/kadin")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg backdrop-blur-md"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>

              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  EDIT <span className="text-blue-200">KEPALA DINAS</span>
                </h1>

                <p className="text-[9px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-2">
                  Dinas Authority Update System
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-md z-10 shadow-inner">
              <Database size={14} className="text-blue-200" />
              UID: {id?.substring(0, 8)}
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handleSubmit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-6 flex-1">
                
                {/* LEFT COLUMN */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap"
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
                      text="Email Dinas"
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

                  {/* KOTAK INPUT TEXT WILAYAH TERKUNCI (READ-ONLY) */}
                  <div className="space-y-2">
                    <Label
                      text="Wilayah Otoritas Kerja (Kunci Sistem)"
                      className="!text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black"
                    />
                    <div className="relative">
                      <Input
                        value={namaWilayahText}
                        disabled
                        className="!py-4.5 !pl-12 !bg-gray-50/50 !border-gray-100 !text-gray-400 !font-black cursor-not-allowed !rounded-2xl shadow-inner uppercase"
                      />
                      <MapPin
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label
                      text="Update Jabatan Dinas"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase tracking-[0.2em] font-black"
                    />
                    <Dropdown
                      icon={Briefcase}
                      value={formData.jabatan}
                      onChange={(val) =>
                        setFormData({
                          ...formData,
                          jabatan: val,
                        })
                      }
                      items={jabatanOptions}
                      className="!py-4.5 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="p-6 rounded-[2rem] bg-blue-50/30 border border-blue-100 border-dashed">
                    <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
                      * Perubahan jabatan akan mempengaruhi hak akses dan
                      Otoritas pengguna pada sistem dinas. Wilayah kerja bersifat statis/absolut dan tidak dapat diubah demi validitas monitoring.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center gap-3 pt-12 pb-16 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/kadin")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 hover:!bg-gray-50 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                />
                <Button
                  text={loading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                  type="submit"
                  disabled={loading}
                  className="!px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg active:scale-95 transition-all border-none uppercase tracking-[0.2em] !bg-[#2E5AA7] !text-white"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default EditKepalaDinas;