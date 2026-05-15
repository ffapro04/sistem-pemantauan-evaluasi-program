/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Lock,
  Mail,
  User,
  X,
  Plus as PlusIcon,
  Database,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Save,
  XCircle,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Internal
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import Dropdown from "../../../../components/Dropdown";
import PageWrapper from "../../../../components/PageWrapper";

const Create_AO = () => {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);
  const [wilayah_options, set_wilayah_options] = useState([]);
  const [form_data, set_form_data] = useState({
    nama: "",
    email: "",
    password: "",
    id_role: 4,
    jabatan: "Area Officer",
    wilayah_ids: [""],
  });

  // State untuk Validasi Side Notes
  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: ""
  });

  useEffect(() => {
    const fetch_wilayah = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        });

        set_wilayah_options(
          res.data
            .filter((i) => i.status === true)
            .map((i) => ({
              value: i.id_wilayah,
              label: i.nama_wilayah.split("/").filter(Boolean).pop().toUpperCase(),
            })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetch_wilayah();
  }, []);

  const addWilayahField = () =>
    set_form_data({ ...form_data, wilayah_ids: [...form_data.wilayah_ids, ""] });

  const removeWilayahField = (i) => {
    const updated = [...form_data.wilayah_ids];
    updated.splice(i, 1);
    set_form_data({ ...form_data, wilayah_ids: updated });
  };

  const handleWilayahChange = (i, val) => {
    const updated = [...form_data.wilayah_ids];
    updated[i] = val;
    set_form_data({ ...form_data, wilayah_ids: updated });
  };

  const validateForm = () => {
    const finalWilayahIds = form_data.wilayah_ids.filter((id) => id !== "");
    if (!form_data.nama || !form_data.email || !form_data.password) {
      setStatusNote({ show: true, type: 'error', message: "Otoritas Ditolak: Field identitas wajib diisi." });
      return false;
    }
    if (finalWilayahIds.length === 0) {
      setStatusNote({ show: true, type: 'error', message: "Penugasan Gagal: Pilih minimal satu wilayah kerja." });
      return false;
    }
    return true;
  };

  const handle_form_submit = async (e) => {
    if (e) e.preventDefault();
    setStatusNote({ show: false, type: null, message: "" });

    if (!validateForm()) return;

    set_is_loading(true);
    try {
      const token = localStorage.getItem("token");
      const finalWilayahIds = form_data.wilayah_ids.filter((id) => id !== "");
      const payload = {
        ...form_data,
        id_wilayahs: finalWilayahIds.map(Number),
      };

      await axios.post("http://localhost:3000/users/register_ao", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({ show: true, type: 'success', message: "Akses Aktif: Akun Area Officer berhasil didaftarkan." });
      setTimeout(() => navigate("/admin/ao"), 2500);
    } catch (err) {
      setStatusNote({ show: true, type: 'error', message: err.response?.data?.message || "Terjadi kesalahan koneksi server." });
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end p-10">

        {/* Background Mesh Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

        {/* --- VALIDATION SIDE NOTES --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[40%] w-72 z-[100]`}
            >
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'System Alert' : 'Success Sync'}
                </h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. JUDUL FORM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2 leading-none">
            <Sparkles size={20} className="text-[#0AC4E0]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]/60">Regional Field Authority</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase leading-none">
            Registrasi Area Officer
          </h1>
        </motion.div>

        {/* 2. FORM BOX (GROUNDED / NEMPEL DASAR) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-6xl bg-white rounded-t-[5rem] rounded-b-none shadow-[0_-30px_100px_rgba(10,196,224,0.1)] p-16 pb-44 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none" />

          <form onSubmit={handle_form_submit} className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">

              {/* KOLOM KIRI: IDENTITY */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <Label text="Nama Lengkap Personil" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      onChange={(e) => set_form_data({ ...form_data, nama: e.target.value })}
                      placeholder="Input AO Name..."
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label text="Email Korespondensi" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      type="email"
                      onChange={(e) => set_form_data({ ...form_data, email: e.target.value })}
                      placeholder="ao@ypamdr.astra.co.id"
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label text="Security Password" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                  <div className="relative group">
                    <Input
                      type="password"
                      onChange={(e) => set_form_data({ ...form_data, password: e.target.value })}
                      placeholder="••••••••"
                      className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: ASSIGNMENT */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2 mb-4 leading-none">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-[#0AC4E0]" size={18} />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Wilayah Kerja</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addWilayahField}
                    className="px-4 py-2 bg-[#0AC4E0]/10 text-[#0AC4E0] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#0AC4E0] hover:text-white transition-all active:scale-95"
                  >
                    + Tambah Hub
                  </button>
                </div>

                <div className="space-y-4 max-h-[320px] overflow-y-auto no-scrollbar pr-2 pb-4">
                  <AnimatePresence>
                    {form_data.wilayah_ids.map((id, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-3"
                      >
                        <div className="flex-1">
                          <Dropdown
                            icon={MapPin}
                            value={id}
                            onChange={(v) => handleWilayahChange(idx, v)}
                            items={wilayah_options.filter(
                              (o) => !form_data.wilayah_ids.includes(o.value) || o.value === id,
                            )}
                            className="!py-4.5 !bg-slate-50/50 !border-slate-100 !rounded-[1.8rem] !text-sm !font-black text-slate-700"
                          />
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeWilayahField(idx)}
                            className="w-14 h-14 flex items-center justify-center bg-rose-50 text-rose-500 rounded-[1.4rem] border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-6 bg-[#0AC4E0]/5 border-2 border-[#0AC4E0]/10 border-dashed rounded-[2.5rem] flex items-center gap-6 shadow-sm mt-4">
                  <ShieldCheck className="text-[#0AC4E0] shrink-0" size={24} />
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                    Akun AO memiliki otoritas penuh untuk memantau program akademik pada setiap Hub wilayah yang ditugaskan.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* 3. DOCK ACTION (OVERLAP DI FRONT) */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button
              onClick={() => navigate("/admin/ao")}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none"
            >
              <ChevronLeft size={16} /> Kembali
            </button>

            <button
              onClick={handle_form_submit}
              disabled={is_loading}
              className="flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none"
            >
              <Save size={18} />
              {is_loading ? "..." : "Simpan Data"}
            </button>
          </div>
        </motion.div>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </PageWrapper>
  );
};

export default Create_AO;