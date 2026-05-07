/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Database,
  ShieldCheck,
  Edit3,
  Navigation,
  Calendar,
  Info,
  Users,
  GraduationCap,
  School,
  RefreshCcw,
  Layers,
  Globe2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

// --- SOLUSI AMPUH: Custom Icon dari CDN (Pasti Muncul) ---
const pinIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const DetailWilayah = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/wilayah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        Swal.fire("Error", "Gagal menyinkronkan data spasial", "error");
        navigate("/admin/wilayah");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5] font-black text-[10px] tracking-[0.3em] uppercase italic">
          <RefreshCcw className="animate-spin" size={40} />
          Fetching Regional Data...
        </div>
      </div>
    );

  const locationParts = data?.nama_wilayah?.split("/").filter(Boolean) || [];
  const mainTitle = locationParts[locationParts.length - 1] || "Unknown Area";

  // Konversi koordinat ke Float
  const lat = parseFloat(data?.latitude);
  const lng = parseFloat(data?.longitude);

  // Cek apakah koordinat valid (bukan NaN)
  const isValidCoords = !isNaN(lat) && !isNaN(lng);

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0 font-poppins">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative"
        >
          {/* HEADER BANNER */}
          <div className="px-8 md:px-16 pt-10 pb-12 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate("/admin/wilayah")}
                  className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
                >
                  <ArrowLeft size={18} strokeWidth={3} />
                </button>
                <div>
                  <h1 className="text-2xl font-[1000] text-white uppercase tracking-tighter leading-none">
                    Profil <span className="text-blue-200">Hub Wilayah</span>
                  </h1>
                  <p className="text-[9px] font-bold text-blue-100/70 tracking-[0.3em] uppercase italic mt-1.5">
                    Spatial Identification & Core Inventory
                  </p>
                </div>
              </div>
              <Button
                text="MODIFIKASI AREA"
                icon={<Edit3 size={14} />}
                onClick={() => navigate(`/admin/wilayah/edit/${id}`)}
                className="!bg-[#2E5AA7] !text-white !px-8 !py-4 !rounded-2xl !text-[10px] font-black tracking-widest shadow-2xl border-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-12 bg-white custom-scrollbar">
            <div className="max-w-6xl w-full mx-auto space-y-16">
              {/* IDENTITY SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-xl group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative w-48 h-48 bg-gray-50 rounded-[3rem] border-4 border-white shadow-2xl flex items-center justify-center text-[#1E5AA5]">
                      <Globe2
                        size={80}
                        strokeWidth={1}
                        className="animate-float"
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${data?.status ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${data?.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                    />
                    Status:{" "}
                    {data?.status ? "Operational Active" : "Disabled Area"}
                  </div>
                  <h2 className="text-5xl font-[1000] text-gray-900 uppercase tracking-tighter leading-none">
                    {mainTitle}
                  </h2>
                  <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.4em] leading-relaxed max-w-xl italic">
                    {data?.deskripsi ||
                      "Basis data deskripsi geografis belum tersedia."}
                  </p>
                </div>
              </div>

              {/* GRID INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-4">
                  <Label
                    text="Hierarki Registrasi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-bold text-gray-700 text-[12px] uppercase break-words">
                    {data?.nama_wilayah}
                  </span>
                </div>
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-4">
                  <Label
                    text="Koordinat Navigasi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-mono font-bold text-gray-700 text-[12px]">
                    {lat || 0}, {lng || 0}
                  </span>
                </div>
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-4">
                  <Label
                    text="Otoritas Klasifikasi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-black text-[#1E5AA5] text-[12px] uppercase tracking-widest">
                    {data?.keterangan || "ABSOLUTE"}
                  </span>
                </div>
              </div>

              {/* MAP & INVENTORY SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                {/* Visual Map */}
                <div className="lg:col-span-7 space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Live Geo-Reference
                  </h3>
                  <div className="h-[350px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl relative z-0 bg-gray-200">
                    {/* Menggunakan key agar map re-render saat data ID masuk */}
                    <MapContainer
                      key={isValidCoords ? `${lat}-${lng}` : "initial-map"}
                      center={isValidCoords ? [lat, lng] : [-2.5, 118]}
                      zoom={isValidCoords ? 13 : 5}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                      {/* Marker dengan custom icon CDN dan pengecekan koordinat yang benar */}
                      {isValidCoords && (
                        <Marker position={[lat, lng]} icon={pinIcon}>
                          <Popup>
                            <div className="font-black text-[10px] uppercase text-[#1E5AA5]">
                              {mainTitle} Hub
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>

                {/* Statistics Center (Inventory Summary) */}
                <div className="lg:col-span-5 space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Inventory Summary
                  </h3>
                  <div className="p-8 bg-[#1E5AA5] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-[350px] flex flex-col justify-between group">
                    <School
                      size={160}
                      className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="relative z-10 flex flex-col gap-8">
                      <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-8 text-center">
                        <div>
                          <p className="text-3xl font-black">
                            {data?.jumlah_sd || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SD
                          </p>
                        </div>
                        <div className="border-x border-white/10">
                          <p className="text-3xl font-black">
                            {data?.jumlah_smp || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SMP
                          </p>
                        </div>
                        <div>
                          <p className="text-3xl font-black">
                            {data?.jumlah_smk || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SMK
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                          <span>Total Tenaga Pendidik</span>
                          <span className="text-sm">
                            {data?.jumlah_guru || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                          <span>Total Siswa Binaan</span>
                          <span className="text-sm">
                            {data?.jumlah_siswa || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-10 pb-16">
                <button
                  onClick={() => navigate("/admin/wilayah")}
                  className="px-10 py-3 bg-white text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] border border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm"
                >
                  Back to Hub
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <style>{`
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .leaflet-container { z-index: 1 !important; border-radius: 2.5rem; }
      `}</style>
    </PageWrapper>
  );
};

export default DetailWilayah;
