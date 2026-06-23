/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Button from "../../../../components/Button";

<<<<<<< HEAD
const API_BASE = "http://localhost:3000";

const getRoleName = (idRole, fallback = "") => {
  const roles = {
    1: "Admin",
    2: "Pengurus",
    3: "Head Office",
    4: "Area Officer",
    5: "Sekolah",
    6: "Vendor",
    7: "Kepala Dinas",
    8: "Institusi",
  };

  return roles[Number(idRole)] || fallback || "-";
};
=======
const MASTER_AUTH_KEY = "P3n9uru5";
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95

const DetailPengurus = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    id_role: 2,
    nama_role: "",
    jabatan: "",
    no_telp: "",
    status: true,
  });

  const roleName = useMemo(
    () => getRoleName(formData.id_role, formData.nama_role),
    [formData.id_role, formData.nama_role],
  );

  const statusText = formData.status ? "Aktif" : "Nonaktif";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_BASE}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data;

        setFormData({
          nama: data?.nama || "",
          email: data?.email || "",
          id_role: data?.id_role || data?.role?.id_role || 2,
          nama_role: data?.role?.nama_role || data?.nama_role || "",
          jabatan: data?.jabatan || "-",
          no_telp: data?.no_telp || "-",
          status: data?.status ?? true,
        });
      } catch (error) {
        console.error("Gagal mengambil detail pengurus:", error);
        alert("Gagal mengambil detail pengurus");
        navigate("/admin/pengurus");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <PageWrapper className="flex h-screen items-center justify-center bg-white !p-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={44} className="animate-spin text-[#0AC4E0]" />

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
            Memuat detail pengurus
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#FBFBFD] !p-0 font-sans leading-none text-slate-800">
      <Sidebar />

      <main className="relative flex h-full flex-1 flex-col items-center justify-end overflow-hidden">
        <div className="absolute right-0 top-0 -z-0 h-[600px] w-[600px] rounded-full bg-[#0AC4E0]/5 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 mb-6 text-center"
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50">
              Sistem Pemantauan dan Evaluasi Program
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tighter text-[#0AC4E0]">
            Detail Pengurus
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-b-none rounded-t-[5rem] border-x border-t border-[#0AC4E0]/10 bg-white p-16 pb-40 shadow-[0_-20px_100px_rgba(10,196,224,0.1)]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[#0AC4E0]/5 to-transparent" />

          <div className="relative z-10 space-y-10">
            <div className="rounded-[2.5rem] border border-cyan-100 bg-cyan-50/50 p-7">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[#0AC4E0] text-white shadow-xl shadow-cyan-100">
                  <ShieldCheck size={30} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                    Informasi Akun
                  </p>

                  <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900">
                    {formData.nama || "Pengurus"}
                  </h2>

                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {roleName} · {statusText}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                text="Nama Lengkap"
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
              />

              <div className="group relative">
                <Input
                  value={formData.nama}
                  readOnly
                  placeholder="Nama belum tersedia"
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm"
                />

                <User
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                text="Email Institusi"
                className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
              />

              <div className="group relative">
                <Input
                  type="email"
                  value={formData.email}
                  readOnly
                  placeholder="Email belum tersedia"
                  className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm"
                />

                <Mail
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                  size={20}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label
                  text="Posisi Jabatan"
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="group relative">
                  <Input
                    value={formData.jabatan || "-"}
                    readOnly
                    placeholder="Jabatan belum tersedia"
                    className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm"
                  />

                  <Briefcase
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                    size={20}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  text="Role Sistem"
                  className="!ml-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                />

                <div className="group relative">
                  <Input
                    value={roleName}
                    readOnly
                    placeholder="Role belum tersedia"
                    className="!rounded-[2.2rem] !border-slate-100 !bg-slate-50/50 !py-5 !pl-14 !text-[16px] !font-bold shadow-sm"
                  />

                  <ShieldCheck
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] z-30 flex h-[120px] w-[550px] items-center justify-center rounded-t-[250px] border-x-2 border-t-2 border-white bg-white/80 px-16 pt-6 shadow-[0_-20px_80px_rgba(10,196,224,0.2)] backdrop-blur-3xl"
        >
          <div className="mb-2 flex w-full items-center justify-center">
            <Button
              text="Kembali"
              icon={<ChevronLeft size={16} />}
              onClick={() => navigate("/admin/pengurus")}
              className="!rounded-full !border !border-slate-100 !bg-white !px-8 !py-4 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400 shadow-sm hover:!text-slate-800 active:scale-90"
            />
          </div>
        </motion.div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </PageWrapper>
  );
};

export default DetailPengurus;