/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
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

// IMPORT ICONS
import {
  MapPin,
  Navigation,
  School,
  Layers,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Activity,
  Globe,
  Sparkles,
  MoveRight,
  Eye,
  Rocket,
  Mountain,
  Target,
} from "lucide-react";

// IMPORT COMPONENTS
import Navbar from "../../components/Navbar";
import Dropdown from "../../components/Dropdown";
import Footer from "../../components/Footer";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Card from "../../components/Card";

// ASSETS
import seniImg from "../../assets/img/senibudaya.jpg";
import picturependidikan from "../../assets/img/pichture_pendidikan 1.png";

// FIX MARKER ICON (Wajib agar Pin Muncul & Tidak Error Path)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const schoolIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const wilayahIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- KOMPONEN KONTROL MAP (FIX NaN ERROR) ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    // Validasi super ketat agar tidak Invalid LatLng (NaN)
    if (
      center &&
      Array.isArray(center) &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const Onboarding = () => {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [mapCenter, setMapCenter] = useState([-2.5, 118]); // Default Tengah Indo
  const [zoom, setZoom] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resW, resS] = await Promise.all([
          axios.get("http://localhost:3000/wilayah"),
          axios.get("http://localhost:3000/sekolah"),
        ]);
        // Filter wilayah yang statusnya aktif
        setWilayahList(
          resW.data.filter((w) => w.status === true || w.status === 1),
        );
        setSekolahList(resS.data);
      } catch (err) {
        console.error("Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Data
  const filteredSekolah = selectedWilayah
    ? sekolahList.filter((s) => s.id_wilayah === selectedWilayah.id_wilayah)
    : sekolahList;

  const currentItems = filteredSekolah.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredSekolah.length / itemsPerPage);

  const schoolColumns = [
    {
      header: "INSTITUSI",
      render: (row) => (
        <div className="flex flex-col py-1">
          <span className="font-black text-[#1E5AA5] text-[10px] uppercase truncate w-36">
            {row.nama_sekolah}
          </span>
          <span className="text-[8px] text-gray-400 font-bold uppercase">
            {row.jenjang} • NPSN {row.npsn}
          </span>
        </div>
      ),
    },
    {
      header: "AKREDITASI",
      align: "text-center",
      render: (row) => (
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black border border-blue-100">
          {row.akreditasi || "N/A"}
        </span>
      ),
    },
    {
      header: "LOC",
      align: "text-right",
      render: (row) => {
        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);
        return (
          <button
            onClick={() => {
              if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter([lat, lng]);
                setZoom(16);
              }
            }}
            className="p-1.5 hover:bg-blue-100 text-[#1E5AA5] rounded-lg transition-all"
          >
            <MapPin size={14} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden selection:bg-[#1E5AA5] selection:text-white">
      <Navbar isDashboard />

      {/* --- HERO SECTION --- */}
      <section className="bg-[#F7F8F0] pt-32 pb-20 px-6 min-h-[80vh] flex items-center relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1 bg-white rounded-full border border-blue-100 text-[9px] font-black text-[#1E5AA5] uppercase tracking-[0.3em]">
              Corporate Social Impact
            </span>
            <h1 className="text-7xl font-[1000] text-gray-900 leading-none tracking-tighter uppercase">
              SATU <br />
              <span className="text-[#1E5AA5]">INDONESIA</span>
              <br /> CERDAS
            </h1>
            <p className="text-gray-500 text-lg border-l-4 border-[#1E5AA5] pl-6 font-medium max-w-md">
              Transformasi pendidikan berkelanjutan untuk mewujudkan generasi
              emas Indonesia yang mandiri.
            </p>
            <Button
              text="Selengkapnya Tentang YPA-MDR"
              icon={<MoveRight size={18} />}
              className="bg-[#1E5AA5] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
            />
          </motion.div>
          <div className="hidden lg:block text-right">
            <img
              src={picturependidikan}
              alt="Hero"
              className="w-[500px] inline-block drop-shadow-2xl animate-float"
            />
          </div>
        </div>
      </section>

      {/* --- GEOSPATIAL SECTION --- */}
      <section className="py-24 px-6 bg-[#EEF5FF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#1E5AA5] font-black text-[10px] uppercase tracking-[0.5em]">
              Global Sebaran Data Binaan
            </span>
            <h2 className="text-5xl font-[1000] text-gray-900 tracking-tighter uppercase">
              Mapping <span className="text-[#1E5AA5]">Sekolah Binaan</span>
            </h2>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden grid lg:grid-cols-12 min-h-[650px]">
            {/* MAP VIEW */}
            <div className="lg:col-span-7 relative h-[500px] lg:h-auto border-r border-gray-100">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <ZoomControl position="bottomright" />
                <MapController center={mapCenter} zoom={zoom} />

                {/* Render PIN SEKOLAH */}
                {sekolahList.map((s) => {
                  const lat = parseFloat(s.latitude);
                  const lng = parseFloat(s.longitude);
                  if (isNaN(lat) || !lat || isNaN(lng) || !lng) return null;
                  return (
                    <Marker
                      key={`sekolah-${s.id_sekolah}`}
                      position={[lat, lng]}
                      icon={schoolIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[150px] font-sans">
                          <p className="font-black text-[#1E5AA5] uppercase text-[10px] border-b pb-1 mb-2">
                            {s.nama_sekolah}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase">
                            Jenjang: {s.jenjang}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase">
                            Akreditasi: {s.akreditasi || "-"}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Render PIN WILAYAH (Tampil jika Nasional) */}
                {!selectedWilayah &&
                  wilayahList.map((w) => {
                    const lat = parseFloat(w.latitude);
                    const lng = parseFloat(w.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    return (
                      <Marker
                        key={`wilayah-${w.id_wilayah}`}
                        position={[lat, lng]}
                        icon={wilayahIcon}
                      >
                        <Popup>
                          <div className="p-1 text-center">
                            <p className="font-black text-orange-600 uppercase text-[10px]">
                              {w.nama_wilayah.split("/").pop()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>

              <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-white p-3 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1E5AA5] rounded-xl flex items-center justify-center text-white">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Focus Mode
                  </p>
                  <p className="text-xs font-black text-[#1E5AA5] uppercase tracking-tighter">
                    {selectedWilayah
                      ? selectedWilayah.nama_wilayah.split("/").pop()
                      : "SELURUH INDONESIA"}
                  </p>
                </div>
              </div>
            </div>

            {/* PANEL DATA */}
            <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic leading-none">
                      Resource Center
                    </span>
                    <h3 className="text-2xl font-[1000] text-gray-800 uppercase tracking-tighter leading-none">
                      REGISTRY
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWilayah(null);
                      setMapCenter([-2.5, 118]);
                      setZoom(5);
                      setCurrentPage(1);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <RefreshCcw size={18} />
                  </button>
                </div>

                <Dropdown
                  items={[
                    { value: "all", label: "TAMPILKAN SEMUA WILAYAH" },
                    ...wilayahList.map((w) => ({
                      value: w.id_wilayah,
                      label: w.nama_wilayah.split("/").pop().toUpperCase(),
                    })),
                  ]}
                  value={selectedWilayah?.id_wilayah || "all"}
                  onChange={(val) => {
                    if (val === "all") {
                      setSelectedWilayah(null);
                      setMapCenter([-2.5, 118]);
                      setZoom(5);
                    } else {
                      const found = wilayahList.find(
                        (w) => w.id_wilayah === val,
                      );
                      if (found && !isNaN(parseFloat(found.latitude))) {
                        setSelectedWilayah(found);
                        setMapCenter([
                          parseFloat(found.latitude),
                          parseFloat(found.longitude),
                        ]);
                        setZoom(11);
                        setCurrentPage(1);
                      }
                    }
                  }}
                  className="!rounded-xl !border-gray-200 !py-3 !text-[10px] font-black uppercase shadow-sm"
                />
              </div>

              <div className="flex-1 flex flex-col p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <School size={16} className="text-[#1E5AA5]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Inventory List
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black shadow-lg">
                    {filteredSekolah.length} SEKOLAH
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <Table
                    columns={schoolColumns}
                    data={currentItems}
                    className="min-w-full"
                  />
                </div>

                {totalPages > 1 && (
                  <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase">
                      Page {currentPage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER MISSION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            {
              t: "Vision",
              i: <Eye />,
              d: "Lembaga sosial kredibel untuk mutu pendidikan daerah binaan.",
            },
            {
              t: "Mission",
              i: <Rocket />,
              d: "Mendorong pembinaan sekolah melalui 4 Pilar Pendidikan Utama.",
            },
            {
              t: "Goal",
              i: <Mountain />,
              d: "Mewujudkan sekolah binaan mandiri, unggul, dan berprestasi.",
            },
            {
              t: "Aim",
              i: <Target />,
              d: "Melahirkan generasi muda kompeten demi Indonesia sejahtera.",
            },
          ].map((m, i) => (
            <div
              key={i}
              className="p-10 border border-gray-50 rounded-[2rem] hover:bg-white hover:shadow-2xl transition-all group"
            >
              <div className="text-[#1E5AA5] mb-6 group-hover:scale-110 transition-transform">
                {m.i}
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4">
                {m.t}
              </h4>
              <p className="text-gray-400 text-xs font-bold leading-relaxed italic uppercase">
                {m.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .leaflet-container { border-radius: 0; font-family: inherit; z-index: 1; }
      `}</style>
    </div>
  );
};

export default Onboarding;
