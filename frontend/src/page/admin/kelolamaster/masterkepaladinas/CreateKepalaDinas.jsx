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
  MapPin, 
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";

const CreateKepalaDinas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wilayahOptions, setWilayahOptions] = useState([]); 
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: 7, 
    jabatan: "Kepala Dinas",
    id_wilayah: "", 
  });

  const jabatanOptions = [
    { value: "Kepala Dinas", label: "KEPALA DINAS" },
    { value: "Wakil Kepala Dinas", label: "WAKIL KEPALA DINAS" },
    { value: "Sekretaris Dinas", label: "SEKRETARIS DINAS" },
    { value: "Staff Dinas", label: "STAFF DINAS" },
  ];

  useEffect(() => {
    const fetchWilayah = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const mappedWilayah = res.data
          .filter((w) => w.status === true || w.status === 1) 
          .map((w) => ({
            value: w.id_wilayah,
            label: w.nama_wilayah.split("/").pop().toUpperCase(), 
          }));
          
        setWilayahOptions(mappedWilayah);

        if (mappedWilayah.length > 0) {
          setFormData((prev) => ({ ...prev, id_wilayah: mappedWilayah[0].value }));
        }
      } catch (err) {
        console.error("Gagal memuat master data wilayah:", err);
      }
    };

    fetchWilayah();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // MASUKKAN ID WILAYAH KE KOLOM SUB_JENIS AGAR BEBAS DARI BENTROK FOREIGN KEY
      const finalPayload = {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        id_role: formData.id_role,
        jabatan: formData.jabatan,
        sub_jenis: formData.id_wilayah ? String(formData.id_wilayah) : null, 
        id_sekolah: null 
      };

      await axios.post("http://localhost:3000/users/register", finalPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: "Akun Kepala Dinas telah berhasil diaktifkan dengan yurisdiksi wilayah kerja.",
      });
      navigate("/admin/kadin");
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan data Kepala Dinas", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#F0F4F8] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#0F4C81] shrink-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/admin/kadin")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#0F4C81] transition-all"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  REGISTRASI <span className="text-cyan-200">KEPALA DINAS</span>
                </h1>
                <p className="text-[9px] font-bold text-cyan-100/70 uppercase italic mt-2">
                  Government Identity & Access Management
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
              <Database size={14} className="text-cyan-200" /> DISDIK CORE PORTAL
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1">
                
                {/* Kolom Kiri */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label text="Nama Lengkap" required className="!text-[9px] text-[#0F4C81] uppercase font-black" />
                    <div className="relative">
                      <Input
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Ketik nama lengkap beserta gelar..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
                        required
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label text="Email Resmi Dinas" required className="!text-[9px] text-[#0F4C81] uppercase font-black" />
                    <div className="relative">
                      <Input
                        type="email"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="namapejabat@disdik.go.id"
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label text="Wilayah Otoritas Kerja" required className="!text-[9px] text-[#0F4C81] uppercase font-black" />
                    <Dropdown
                      icon={MapPin}
                      value={formData.id_wilayah}
                      onChange={(val) => setFormData({ ...formData, id_wilayah: val })}
                      items={wilayahOptions.length > 0 ? wilayahOptions : [{ value: "", label: "MEMUAT WILAYAH..." }]}
                      className="!py-4.5 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold text-gray-700 shadow-sm"
                    />
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label text="Jabatan Sistem" className="!text-[9px] text-[#0F4C81] uppercase font-black" />
                    <Dropdown
                      icon={Briefcase}
                      value={formData.jabatan}
                      onChange={(val) => setFormData({ ...formData, jabatan: val })}
                      items={jabatanOptions}
                      className="!py-4.5 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-extrabold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label text="Password Akun" required className="!text-[9px] text-[#0F4C81] uppercase font-black" />
                    <div className="relative">
                      <Input
                        type="password"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Buat kunci sandi akun..."
                        className="!py-4 !pl-12 !bg-gray-50/50 !rounded-2xl font-bold"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-blue-50/30 border border-blue-100 border-dashed italic text-[10px] text-blue-400 font-medium leading-relaxed">
                    * Akun ini memiliki hak akses penuh untuk memantau data seluruh sekolah binaan di wilayah kerja Dinas Pendidikan.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-12 pb-16">
                <Button text="Kembali" onClick={() => navigate("/admin/kadin")} className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 shadow-sm" />
                <Button text={loading ? "MENYIMPAN..." : "SIMPAN DATA KEPALA DINAS"} type="submit" disabled={loading} className="!px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg !bg-[#0F4C81] shadow-blue-900/10 !text-white border-none" />
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default CreateKepalaDinas;