/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Edit3, School, Layers, Globe2,
  ChevronLeft, CheckCircle2, XCircle,
  CalendarDays, AlignLeft,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";

const pinIcon = new L.Icon({
  iconUrl: markerIcon, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
});

const PROVINCE_FLAG = {
  Aceh: "🏴", "Sumatera Utara": "🌋", "Sumatera Barat": "🏔️", Riau: "🌴",
  "Kepulauan Riau": "🏝️", Jambi: "🌿", Bengkulu: "🌊", "Sumatera Selatan": "🏞️",
  "Kepulauan Bangka Belitung": "🏖️", Lampung: "🌺", Banten: "🕌", "DKI Jakarta": "🏙️",
  "Jawa Barat": "🏯", "Jawa Tengah": "🎭", "DI Yogyakarta": "🎨", "Jawa Timur": "⛩️",
  Bali: "🌺", "Nusa Tenggara Barat": "🏔️", "Nusa Tenggara Timur": "🌊",
  "Kalimantan Barat": "🌳", "Kalimantan Tengah": "🦧", "Kalimantan Selatan": "💎",
  "Kalimantan Timur": "🛢️", "Kalimantan Utara": "🌲", "Sulawesi Utara": "🐠",
  Gorontalo: "🌾", "Sulawesi Tengah": "🏝️", "Sulawesi Barat": "🌴",
  "Sulawesi Selatan": "⛵", "Sulawesi Tenggara": "🐢", Maluku: "🌺",
  "Maluku Utara": "🏝️", "Papua Barat": "🦜", Papua: "🌿",
  "Papua Pegunungan": "⛰️", "Papua Selatan": "🌊", "Papua Tengah": "🌳",
};

const getProvince = (namaWilayah) => {
  const parts = namaWilayah?.split("/").filter(Boolean) || [];
  return parts[1] || "";
};
const getProvinceEmoji = (namaWilayah) => PROVINCE_FLAG[getProvince(namaWilayah)] || "🗺️";

const DetailWilayah = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
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
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-[200px] w-[500px] h-[400px] bg-[#0AC4E0]/3 rounded-full blur-[100px] -z-0 pointer-events-none" />

        {/* VALIDATION NOTE */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[45%] w-72 z-[100]`}
            >
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'System Alert' : 'System Success'}
                </h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  Got It
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. JUDUL */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-center z-10 shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50 block mb-1">
            Spatial Identification & Core Inventory
          </span>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase">Detail Wilayah</h1>
        </motion.div>

        {/* 2. MAIN SHEET */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-5xl bg-white rounded-t-[4rem] rounded-b-none shadow-[0_-20px_100px_rgba(10,196,224,0.1)] border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 155px)" }}
        >
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0AC4E0]/5 to-transparent pointer-events-none z-10" />

          {/* IDENTITY HEADER BAR */}
          <div className="px-10 pt-8 pb-5 shrink-0 flex items-center gap-5 border-b border-slate-50">
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[1.2rem] flex items-center justify-center text-2xl select-none">
                {provinceEmoji}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${data?.status ? "bg-emerald-500" : "bg-rose-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border mb-1.5 ${data?.status ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${data?.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {data?.status ? "Operational Active" : "Disabled Area"}
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none truncate">{mainTitle}</h2>
              {province && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{province} · Indonesia</p>}
            </div>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 ${data?.keterangan === "Independent" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-[#0AC4E0]/5 text-[#0AC4E0] border-[#0AC4E0]/10"}`}>
              <Layers size={10} className="inline mr-1.5 mb-0.5" />
              {data?.keterangan || "Absolute"}
            </div>
          </div>

          {/* 2 KOLOM KONTEN */}
          <div className="flex-1 flex overflow-hidden">

            {/* KOLOM KIRI */}
            <div className="w-[40%] shrink-0 px-10 py-5 flex flex-col gap-3.5 border-r border-slate-50">

              <div className="space-y-1.5">
                <Label text="Hierarki Registrasi" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1" />
                <div className="flex items-start gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <Layers size={15} className="text-[#0AC4E0] shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight break-all leading-relaxed">{data?.nama_wilayah}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label text="Koordinat Navigasi" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1" />
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <MapPin size={15} className="text-[#0AC4E0] shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-slate-700">
                    {isValidCoords ? `${lat}, ${lng}` : "Belum tersedia"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label text="Tahun Binaan" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1" />
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <CalendarDays size={14} className="text-[#0AC4E0] shrink-0" />
                    <span className="text-[12px] font-black text-slate-700">{data?.tahun_awal_binaan || "—"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label text="Klasifikasi" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1" />
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <Globe2 size={14} className="text-[#0AC4E0] shrink-0" />
                    <span className={`text-[10px] font-black uppercase ${data?.keterangan === "Independent" ? "text-purple-600" : "text-[#0AC4E0]"}`}>
                      {data?.keterangan || "Absolute"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label text="Deskripsi" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1" />
                <div className="flex items-start gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <AlignLeft size={15} className="text-[#0AC4E0] shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed line-clamp-2">
                    {data?.deskripsi || "Basis data deskripsi geografis belum tersedia."}
                  </p>
                </div>
              </div>

              {/* INVENTORY */}
              <div className="flex-1 mt-1 p-5 bg-[#0AC4E0]/5 border border-[#0AC4E0]/10 rounded-2xl relative overflow-hidden flex flex-col justify-start">
                <School size={90} className="absolute -bottom-3 -right-3 opacity-5 pointer-events-none" />
                <p className="text-[8px] font-black text-[#0AC4E0] uppercase tracking-widest mb-2">Inventory Summary</p>
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-[#0AC4E0]/10 text-center">
                  {[{ label: "SD", value: data?.jumlah_sd || 0 }, { label: "SMP", value: data?.jumlah_smp || 0 }, { label: "SMK", value: data?.jumlah_smk || 0 }].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xl font-black text-slate-800">{item.value}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 mt-2">
                  {[{ label: "Tenaga Pendidik", value: data?.jumlah_guru || 0 }, { label: "Siswa Binaan", value: data?.jumlah_siswa || 0 }].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-xl border border-[#0AC4E0]/10">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                      <span className="text-[13px] font-black text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            {/* ← TUTUP KOLOM KIRI */}

            {/* KOLOM KANAN — Map full height */}
            <div className="flex-1 flex flex-col px-8 py-5 gap-2">
              <Label text="Live Geo-Reference" className="!text-[8px] !font-black !text-slate-300 !uppercase !tracking-widest !ml-1 shrink-0" />
              <div className="flex-1 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm relative z-0 bg-slate-50">
                {isValidCoords ? (
                  <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lng]} icon={pinIcon}>
                      <Popup>
                        <div className="font-black text-[10px] uppercase text-[#0AC4E0]">{mainTitle} Hub</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-300">
                    <MapPin size={48} strokeWidth={1} />
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest">Koordinat Belum Tersedia</p>
                      <p className="text-[9px] font-bold italic text-gray-200">Edit wilayah untuk menambahkan lokasi</p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/wilayah/edit/${id}`)}
                      className="px-6 py-2.5 bg-[#0AC4E0] text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[#09b3cc] transition-all active:scale-95"
                    >
                      Set Koordinat
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* ← TUTUP KOLOM KANAN */}

          </div>
          {/* ← TUTUP 2 KOLOM KONTEN */}

        </motion.div>
        {/* ← TUTUP MAIN SHEET */}

        {/* 3. DOCK ACTION */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.2)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button
              onClick={() => navigate("/admin/wilayah")}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm"
            >
              <ChevronLeft size={16} /> Kembali
            </button>
            <button
              onClick={() => navigate(`/admin/wilayah/edit/${id}`)}
              className="flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc]"
            >
              <Edit3 size={18} /> Edit Data
            </button>
          </div>
        </motion.div>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `.leaflet-container { z-index: 1 !important; }`
      }} />
    </PageWrapper>
  );
};

export default DetailWilayah;