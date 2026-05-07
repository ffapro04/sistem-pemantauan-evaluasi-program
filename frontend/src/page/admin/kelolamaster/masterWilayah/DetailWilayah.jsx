/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Edit3,
  School,
  RefreshCcw,
  Globe2,
  Layers,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const pinIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

// ✅ Map nama provinsi ke kode bendera/emoji
const PROVINCE_FLAG = {
  Aceh: "🏴",
  "Sumatera Utara": "🌋",
  "Sumatera Barat": "🏔️",
  Riau: "🌴",
  "Kepulauan Riau": "🏝️",
  Jambi: "🌿",
  Bengkulu: "🌊",
  "Sumatera Selatan": "🏞️",
  "Kepulauan Bangka Belitung": "🏖️",
  Lampung: "🌺",
  Banten: "🕌",
  "DKI Jakarta": "🏙️",
  "Jawa Barat": "🏯",
  "Jawa Tengah": "🎭",
  "DI Yogyakarta": "🎨",
  "Jawa Timur": "⛩️",
  Bali: "🌺",
  "Nusa Tenggara Barat": "🏔️",
  "Nusa Tenggara Timur": "🌊",
  "Kalimantan Barat": "🌳",
  "Kalimantan Tengah": "🦧",
  "Kalimantan Selatan": "💎",
  "Kalimantan Timur": "🛢️",
  "Kalimantan Utara": "🌲",
  "Sulawesi Utara": "🐠",
  Gorontalo: "🌾",
  "Sulawesi Tengah": "🏝️",
  "Sulawesi Barat": "🌴",
  "Sulawesi Selatan": "⛵",
  "Sulawesi Tenggara": "🐢",
  Maluku: "🌺",
  "Maluku Utara": "🏝️",
  "Papua Barat": "🦜",
  Papua: "🌿",
  "Papua Pegunungan": "⛰️",
  "Papua Selatan": "🌊",
  "Papua Tengah": "🌳",
};

// ✅ Ambil provinsi dari nama_wilayah (posisi index 1)
const getProvince = (namaWilayah) => {
  const parts = namaWilayah?.split("/").filter(Boolean) || [];
  return parts[1] || "";
};

const getProvinceEmoji = (namaWilayah) => {
  const prov = getProvince(namaWilayah);
  return PROVINCE_FLAG[prov] || "🗺️";
};

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
  const province = getProvince(data?.nama_wilayah);
  const provinceEmoji = getProvinceEmoji(data?.nama_wilayah);

  const lat = parseFloat(data?.latitude);
  const lng = parseFloat(data?.longitude);
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
          {/* HEADER */}
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

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-8 bg-white custom-scrollbar">
            <div className="max-w-6xl w-full mx-auto space-y-8">
              {/* IDENTITY SECTION */}
              <div className="flex items-center gap-8">
                {/* ✅ Logo Provinsi — emoji besar, compact */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl border-2 border-blue-100 shadow-lg flex items-center justify-center text-5xl select-none">
                    {provinceEmoji}
                  </div>
                  {/* Badge status */}
                  <div
                    className={`absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-white shadow ${data?.status ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                </div>

                {/* Info Utama */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Status badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${data?.status ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${data?.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                    />
                    {data?.status ? "Operational Active" : "Disabled Area"}
                  </div>

                  <h2 className="text-3xl font-[1000] text-gray-900 uppercase tracking-tighter leading-none truncate">
                    {mainTitle}
                  </h2>

                  {province && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {province} · Indonesia
                    </p>
                  )}

                  <p className="text-[10px] font-bold text-gray-400 italic leading-relaxed max-w-xl">
                    {data?.deskripsi ||
                      "Basis data deskripsi geografis belum tersedia."}
                  </p>
                </div>

                {/* Jenis Wilayah Badge */}
                <div className="shrink-0">
                  <div
                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${data?.jenis_wilayah === "Absolute" ? "bg-blue-50 text-[#1E5AA5] border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}
                  >
                    <Layers size={12} className="inline mr-1.5 mb-0.5" />
                    {data?.jenis_wilayah || "Absolute"}
                  </div>
                </div>
              </div>

              {/* GRID INFO — 3 kolom compact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-2">
                  <Label
                    text="Hierarki Registrasi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-bold text-gray-700 text-[11px] uppercase break-words leading-relaxed">
                    {data?.nama_wilayah}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-2">
                  <Label
                    text="Koordinat Navigasi"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-mono font-bold text-gray-700 text-[11px]">
                    {isValidCoords ? `${lat}, ${lng}` : "Belum tersedia"}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-2">
                  <Label
                    text="Tahun Awal Binaan"
                    className="!text-[9px] text-[#1E5AA5] font-black uppercase tracking-widest"
                  />
                  <span className="block font-black text-gray-700 text-[11px]">
                    {data?.tahun_awal_binaan || "-"}
                  </span>
                </div>
              </div>

              {/* MAP & INVENTORY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Map */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Live Geo-Reference
                  </h3>
                  <div className="h-[300px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl relative z-0 bg-gray-100">
                    {isValidCoords ? (
                      <MapContainer
                        center={[lat, lng]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]} icon={pinIcon}>
                          <Popup>
                            <div className="font-black text-[10px] uppercase text-[#1E5AA5]">
                              {mainTitle} Hub
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                        <MapPin size={32} strokeWidth={1.5} />
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            Koordinat Belum Tersedia
                          </p>
                          <p className="text-[9px] font-bold italic">
                            Edit wilayah untuk menambahkan lokasi di peta
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/admin/wilayah/edit/${id}`)}
                          className="px-5 py-2 bg-[#1E5AA5] text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-blue-700 transition-all"
                        >
                          Set Koordinat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory */}
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Inventory Summary
                  </h3>
                  <div className="p-6 bg-[#1E5AA5] rounded-[2rem] text-white shadow-xl relative overflow-hidden h-[300px] flex flex-col justify-between group">
                    <School
                      size={120}
                      className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="relative z-10 flex flex-col gap-6">
                      <div className="grid grid-cols-3 gap-3 border-b border-white/10 pb-6 text-center">
                        <div>
                          <p className="text-2xl font-black">
                            {data?.jumlah_sd || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SD
                          </p>
                        </div>
                        <div className="border-x border-white/10">
                          <p className="text-2xl font-black">
                            {data?.jumlah_smp || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SMP
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-black">
                            {data?.jumlah_smk || 0}
                          </p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">
                            SMK
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
                          <span>Total Tenaga Pendidik</span>
                          <span className="text-sm">
                            {data?.jumlah_guru || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
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

              {/* FOOTER */}
              <div className="flex justify-end pb-8">
                <button
                  onClick={() => navigate("/admin/wilayah")}
                  className="px-8 py-2.5 bg-white text-gray-400 font-black text-[9px] uppercase tracking-[0.3em] border border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm"
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
        .leaflet-container { z-index: 1 !important; border-radius: 2rem; }
      `}</style>
    </PageWrapper>
  );
};

export default DetailWilayah;
