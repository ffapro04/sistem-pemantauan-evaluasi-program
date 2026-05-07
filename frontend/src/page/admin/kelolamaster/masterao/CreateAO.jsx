/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Info,
  Lock,
  Mail,
  User,
  X,
  Plus as PlusIcon,
  Database,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Internal
import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
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
              // Tambahkan .filter(Boolean) untuk membuang elemen kosong akibat "/" di akhir string
              label: i.nama_wilayah
                .split("/")
                .filter(Boolean)
                .pop()
                .toUpperCase(),
            })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetch_wilayah();
  }, []);

  const addWilayahField = () =>
    set_form_data({
      ...form_data,
      wilayah_ids: [...form_data.wilayah_ids, ""],
    });
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

  const handle_form_submit = async (e) => {
    e.preventDefault();
    const finalWilayahIds = form_data.wilayah_ids.filter((id) => id !== "");
    if (finalWilayahIds.length === 0)
      return Swal.fire("Peringatan", "Pilih minimal satu wilayah!", "warning");

    set_is_loading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form_data,
        id_wilayahs: finalWilayahIds.map(Number),
      };
      await axios.post("http://localhost:3000/users/register_ao", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Akun AO telah diaktifkan",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/ao");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Kesalahan server",
        "error",
      );
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#1E5AA5] shrink-0">
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/ao")}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all"
              >
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  REGISTRASI <span className="text-blue-200">AREA OFFICER</span>
                </h1>
                <p className="text-[9px] font-bold text-blue-100/70 uppercase mt-2 italic tracking-widest">
                  Field Monitoring & Area Management
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-md z-10 shadow-inner">
              <Database size={14} className="text-blue-200" /> SYSTEM CORE V.2
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white">
            <form
              onSubmit={handle_form_submit}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 pt-6 flex-1">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        onChange={(e) =>
                          set_form_data({ ...form_data, nama: e.target.value })
                        }
                        placeholder="Nama lengkap..."
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
                      text="Email Korporat"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        type="email"
                        onChange={(e) =>
                          set_form_data({ ...form_data, email: e.target.value })
                        }
                        placeholder="ao@ypamdr.or.id"
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
                      text="Access Password"
                      required
                      className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                    />
                    <div className="relative">
                      <Input
                        type="password"
                        onChange={(e) =>
                          set_form_data({
                            ...form_data,
                            password: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="!py-4 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        required
                      />
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed text-blue-400 text-[10px] italic font-medium leading-relaxed">
                    * Akun AO memiliki wewenang untuk monitoring penuh pada
                    wilayah yang ditugaskan.
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Assignment Area
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addWilayahField}
                      className="text-[9px] font-black text-[#1E5AA5] hover:text-blue-700 flex items-center gap-1 transition-all"
                    >
                      {" "}
                      <PlusIcon size={12} /> TAMBAH WILAYAH?
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {form_data.wilayah_ids.map((id, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="flex-1">
                          <Dropdown
                            icon={MapPin}
                            value={id}
                            onChange={(v) => handleWilayahChange(idx, v)}
                            items={wilayah_options.filter(
                              (o) =>
                                !form_data.wilayah_ids.includes(o.value) ||
                                o.value === id,
                            )}
                            className="!py-4 !bg-gray-50/50 !rounded-2xl font-bold"
                          />
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeWilayahField(idx)}
                            className="w-12 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 pt-12 pb-16">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/ao")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 shadow-sm"
                />
                <Button
                  text={is_loading ? "PROCESSING..." : "SIMPAN DATA AO"}
                  type="submit"
                  disabled={is_loading}
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

export default Create_AO;
