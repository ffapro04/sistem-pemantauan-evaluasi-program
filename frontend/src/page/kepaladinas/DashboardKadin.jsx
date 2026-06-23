/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./../../components/Sidebar";
import Card from "./../../components/Card";
import Input from "./../../components/Input";
import { jwtDecode } from "jwt-decode"; 
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  TrendingUp,
  School as SchoolIcon,
  Search as SearchIcon,
  Filter,
  RefreshCcw,
  Navigation,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 📍 ICON 1: Pusat Wilayah Terpilih (Oranye)
const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 📍 ICON 2: Pusat Wilayah Biasa (Biru)
const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 📍 ICON 3: Penanda Titik Sekolah Binaan (KEMBALI KE HIJAU WAL`A 🟢)
const sekolahIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png", // 🌟 Tetap Hijau sesuai request
 shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 32], 
  iconAnchor: [10, 32],
  popupAnchor: [1, -30],
  shadowSize: [32, 32],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom]);
  return null;
}

export default function DashboardKadin() {
  const navigate = useNavigate();  
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahData, setSekolahData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [selectedJenis, setSelectedJenis] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedJenjang, setSelectedJenjang] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [mapCenter, setMapCenter] = useState([-6.2349, 107.0014]); 
  const [zoom, setZoom] = useState(10);
  const [kadinWilayahId, setKadinWilayahId] = useState(null);

  const jenjangOptions = [
    { value: "ALL", label: "🔍 Semua Jenjang" },
    { value: "SD", label: " SD" },
    { value: "SMP", label: " SMP" },
    { value: "SMA", label: " SMA" },
    { value: "SMK", label: " SMK" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const resU = await fetch("http://localhost:3000/users", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (!resU.ok) throw new Error("Gagal memuat basis data pengguna");
        const dataUsers = await resU.json();
        const rawUsers = Array.isArray(dataUsers) ? dataUsers : dataUsers.users || [];
        
        const decodedToken = token ? jwtDecode(token) : {};
        const loginEmail = decodedToken.email || decodedToken.username;
        const currentKadinProfile = rawUsers.find((u) => u.email === loginEmail);

        let targetWilayahId = currentKadinProfile?.sub_jenis || currentKadinProfile?.subJenis || null;
        if (targetWilayahId) {
          targetWilayahId = Number(targetWilayahId);
        }
        setKadinWilayahId(targetWilayahId);

        const resW = await fetch("http://localhost:3000/wilayah", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (!resW.ok) throw new Error("Gagal memuat basis data wilayah");
        const dataWilayah = await resW.json();
        const rawWilayah = Array.isArray(dataWilayah) ? dataWilayah : dataWilayah.data || [];

        const activeWilayah = rawWilayah.filter((w) => w.status === true || w.status === 1);
        
        const kepinganWilayahDinas = targetWilayahId 
          ? activeWilayah.filter((w) => Number(w.id_wilayah) === targetWilayahId)
          : activeWilayah;

        setWilayahList(kepinganWilayahDinas);

        const filteredSekolah = rawUsers.filter((u) => Number(u.id_role) === 5);
        setSekolahData(filteredSekolah);

        if (kepinganWilayahDinas.length > 0) {
          const wilayahKadinAktif = kepinganWilayahDinas[0];
          setSelectedWilayah(wilayahKadinAktif);
          
          const lat = parseFloat(wilayahKadinAktif.latitude);
          const lng = parseFloat(wilayahKadinAktif.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setZoom(11); 
          }
        }
      } catch (err) {
        console.error("Bypass Dashboard Kadin Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  const getFilteredSekolah = () => {
    let listSekolahMurni = []; 

    wilayahList.forEach((w) => {
      if (selectedJenis !== "all" && w.jenis_wilayah !== selectedJenis) return;
      if (selectedWilayah && w.id_wilayah !== selectedWilayah.id_wilayah) return;

      if (Array.isArray(w.sekolah)) {
        w.sekolah.forEach((sch) => {
          const matchJenjang = 
            selectedJenjang === "ALL" || 
            (sch.jenjang && sch.jenjang.toUpperCase() === selectedJenjang.toUpperCase());

          const matchSearch = 
            !searchTerm || 
            (sch.nama_sekolah && sch.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (sch.npsn && sch.npsn.includes(searchTerm));

          if (matchJenjang && matchSearch) {
            listSekolahMurni.push({
              ...sch,
              nama_wilayah_induk: w.nama_wilayah.split("/").pop(),
            });
          }
        });
      }
    });

    return listSekolahMurni; 
  };

  const displayedSekolah = getFilteredSekolah();
  const totalSekolahBinaan = displayedSekolah.length;
  const activeLabel = jenjangOptions.find(o => o.value === selectedJenjang)?.label;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-hidden">
        {/* Header Panel */}
        <header className="flex-none flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0AC4E0] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/10">
              <Compass size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-[1000] tracking-tight text-black uppercase leading-none mb-1">
                Yurisdiksi Wilayah <span className="text-[#0AC4E0]">Kepala Dinas</span>
              </h1>
              <p className="text-[10px] font-black text-BLACK-400 uppercase tracking-widest italic">
                Portal Monitoring Wilayah Kerja Dinas Pendidikan 2026
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-cyan-50/50 px-6 py-3 rounded-2xl border border-cyan-100/50 text-[#0AC4E0]">
            <SchoolIcon size={16} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Sekolah Terpaku: {totalSekolahBinaan} Instansi
            </span>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-hidden min-h-0">
          
          {/* PETA CONTAINER LEAFLET */}
          <div className="xl:col-span-7 flex flex-col gap-6 h-full relative rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 bg-white">
            <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Navigation size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 italic">
                  Otoritas Teritori Dinas
                </p>
                <p className="text-sm font-black text-[#0AC4E0] uppercase tracking-tighter leading-none">
                  {selectedWilayah ? selectedWilayah.nama_wilayah.split("/").pop() : "MEMUAT PETA..."}
                </p>
              </div>
            </div>

            <div className="w-full h-full z-10 relative">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                <MapController center={mapCenter} zoom={zoom} />

                {/* 1. RENDER PIN UTAMA (MARKER WILAYAH KOORDINATOR) */}
                {wilayahList.map((w) => {
                  const lat = parseFloat(w.latitude);
                  const lng = parseFloat(w.longitude);
                  if (isNaN(lat) || isNaN(lng)) return null;
                  if (selectedJenis !== "all" && w.jenis_wilayah !== selectedJenis) return null;

                  const isSelected = selectedWilayah?.id_wilayah === w.id_wilayah;
                  const countInsideMap = sekolahData.filter((s) => Number(s.id_wilayah) === Number(w.id_wilayah)).length;

                  return (
                    <Marker
                      key={`kadin-map-${w.id_wilayah}`}
                      position={[lat, lng]}
                      icon={isSelected ? selectedIcon : defaultIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[160px] font-sans">
                          <p className="font-black text-[#0AC4E0] uppercase text-[10px] border-b pb-1 mb-2">
                            {w.nama_wilayah.split("/").pop()}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase">
                            Hub Tipe: {w.jenis_wilayah || "Absolute"}
                          </p>
                          <p className="text-[9px] font-black text-slate-800 uppercase mt-1">
                            Lembaga Binaan: {countInsideMap} Sekolah
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* 2. MAPPING PIN INDIVIDU TIAP SEKOLAH (HIJAU KONTRAST 🟢) */}
                {displayedSekolah.map((sch) => {
                  const schLat = parseFloat(sch.latitude || sch.lat);
                  const schLng = parseFloat(sch.longitude || sch.lng);
                  if (isNaN(schLat) || isNaN(schLng)) return null;

                  return (
                    <Marker
                      key={`pin-sekolah-${sch.id_sekolah}`}
                      position={[schLat, schLng]}
                      icon={sekolahIcon} // Menggunakan penanda hijau asli Leaflet
                    >
                      <Popup>
                        <div className="p-2 min-w-[180px] font-sans text-slate-800">
                          <span className="bg-cyan-100 text-[#0AC4E0] text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">
                            {sch.jenjang}
                          </span>
                          <h4 className="font-black text-xs text-slate-900 uppercase leading-snug mb-1">
                            {sch.nama_sekolah}
                          </h4>
                          <p className="text-[9px] text-gray-500 font-bold">
                            NPSN: {sch.npsn}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium italic mt-1 border-t pt-1">
                            Wilayah: {sch.nama_wilayah_induk}
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate(`/kadin/detailsekolahkadin/detail/${sch.id_sekolah}`)}
                            className="mt-2 w-full py-1 bg-[#0AC4E0] text-white text-[9px] font-black uppercase rounded-lg text-center flex items-center justify-center gap-1 hover:bg-cyan-500 transition-all border-none cursor-pointer"
                          >
                            Lihat Detail <ArrowRight size={10} />
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* PANEL DAFTAR SEKOLAH BINAAN */}
          <div className="xl:col-span-5 flex flex-col bg-white border border-slate-100 rounded-[3rem] shadow-xl overflow-hidden h-full">
            <div className="p-8 bg-gray-50/50 border-b border-gray-100 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                 
                  <h3 className="text-2xl font-[1000] text-gray-800 uppercase tracking-tighter leading-none">
                    SEKOLAH DI WILAYAH
                  </h3>
                </div>
              </div>

              {/* DROPDOWN FILTER JENJANG */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl text-[11px] font-black text-slate-700 border border-gray-200 shadow-sm hover:border-cyan-300 transition-all text-left uppercase tracking-wider"
                >
                  <span>{activeLabel}</span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-[2000] w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden p-1.5"
                    >
                      {jenjangOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedJenjang(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-all mb-0.5 last:mb-0 flex items-center justify-between border-none cursor-pointer ${
                            selectedJenjang === opt.value
                              ? "bg-cyan-50 text-[#0AC4E0] font-black"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedJenjang === opt.value && (
                            <div className="w-1.5 h-1.5 bg-[#0AC4E0] rounded-full" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative">
                <Input
                  placeholder="Cari nama SMAN atau NPSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full !pl-10 !py-2.5 !bg-white !rounded-xl !text-[11px] font-bold border-gray-200 shadow-sm focus:!border-[#0AC4E0]"
                />
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              </div>
            </div>

            {/* LIST DAFTAR SEKOLAH */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar bg-slate-50/30">
              {displayedSekolah.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-300 py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <SchoolIcon size={44} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center italic">
                    Belum ada sekolah binaan <br /> di teritori wilayah dinas ini
                  </p>
                </div>
              ) : (
                displayedSekolah.map((sch) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`sch-kadin-${sch.id_sekolah}`}
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-cyan-200/60 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 font-mono font-black text-xs flex items-center justify-center uppercase shrink-0 group-hover:bg-cyan-50 group-hover:text-[#0AC4E0] transition-colors">
                        {sch.nama_sekolah?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 uppercase truncate leading-tight mb-1">
                          {sch.nama_sekolah}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 truncate tracking-wide">
                          NPSN {sch.npsn} • JENJANG {sch.jenjang}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/kadin/detailsekolahkadin/detail/${sch.id_sekolah}`)}
                      className="p-2 bg-slate-50 text-slate-400 group-hover:bg-[#0AC4E0] group-hover:text-white rounded-xl transition-all shadow-sm shrink-0 border-none cursor-pointer flex items-center justify-center"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              Yurisdiksi: {selectedWilayah ? selectedWilayah.nama_wilayah.split("/").pop() : "-"}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10, 196, 224, 0.3); border-radius: 10px; }
        .leaflet-container { border-radius: 2.5rem; font-family: inherit; width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}