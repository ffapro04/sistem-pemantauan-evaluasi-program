/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Wallet,
  Mail,
  Phone,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Edit3,
  UserCheck,
  Activity,
  History,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const DetailFinance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat personil finance", "error");
        navigate("/admin/finance");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <RefreshCw className="animate-spin text-[#1E5AA5]" size={40} />
      </div>
    );

  const isActive = data?.status === true || data?.status === "true";

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0 font-poppins">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER BANNER */}
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/finance")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  OTORITAS <span className="text-blue-200">KEUANGAN</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Personnel Finance Control Unit
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 bg-white custom-scrollbar">
            <div className="max-w-6xl w-full mx-auto space-y-12">
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] border-4 border-white shadow-2xl flex items-center justify-center text-emerald-600 text-4xl font-black uppercase">
                    {data?.nama?.charAt(0)}
                  </div>
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div
                      className={`w-4 h-4 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
                    />
                  </div>
                </div>
                <div className="text-center md:text-left space-y-4 flex-1">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isActive ? "bg-blue-50 text-[#1E5AA5] border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <ShieldCheck size={12} />{" "}
                    {isActive ? "Verified Controller" : "Access Suspended"}
                  </div>
                  <h2 className="text-4xl font-[900] text-gray-800 uppercase tracking-tighter leading-none">
                    {data?.nama}
                  </h2>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                    ID Personnel: #{data?.id_user?.toString().padStart(4, "0")}
                  </p>
                </div>
                <Button
                  text="EDIT PERSONEL"
                  icon={<Edit3 size={12} />}
                  onClick={() => navigate(`/admin/finance/edit/${id}`)}
                  className="!bg-[#2E5AA7] !text-white !px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg"
                />
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Info 1 */}
                <div className="space-y-4">
                  <Label
                    text="Role & Otoritas"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase"
                  />
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      Jabatan
                    </span>
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tight">
                      {data?.jabatan || "Finance Specialist"}
                    </span>
                  </div>
                </div>

                {/* Info 2 */}
                <div className="space-y-4">
                  <Label
                    text="Media Korespondensi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase"
                  />
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Email Resmi
                    </span>
                    <span className="text-sm font-bold text-gray-700 lowercase">
                      {data?.email}
                    </span>
                  </div>
                </div>

                {/* Info 3 */}
                <div className="space-y-4">
                  <Label
                    text="Status Sistem"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase"
                  />
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      Status Akses
                    </span>
                    <span
                      className={`text-sm font-black uppercase ${isActive ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isActive ? "ACTIVE SESSION" : "REVOKED"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 pb-16">
                <Button
                  text="KEMBALI KE LIST"
                  onClick={() => navigate("/admin/finance")}
                  className="!px-10 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 hover:!bg-gray-50 transition-all uppercase tracking-[0.2em] shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default DetailFinance;
