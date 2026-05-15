/* eslint-disable react/prop-types */
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

import {
  School, RefreshCcw, ChevronLeft, ChevronRight, Eye, Rocket,
  Mountain, Target, MoveRight, Filter, Globe2, X, Navigation, Sparkles,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Dropdown from "../../components/Dropdown";
import Footer from "../../components/Footer";

import picturependidikan from "../../assets/img/pichture_pendidikan 1.png";

// ==================== MARKER CUSTOM SVG ====================
const makePinSVG = (mainColor, shadowColor) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
      <ellipse cx="50" cy="112" rx="18" ry="7" fill="${shadowColor}" opacity="0.85"/>
      <path d="M50 8 C28 8 12 26 12 48 C12 72 50 108 50 108 C50 108 88 72 88 48 C88 26 72 8 50 8 Z" fill="${mainColor}"/>
      <circle cx="50" cy="46" r="18" fill="white"/>
    </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Pin Cyan — default
const cyanPinIcon = L.icon({
  iconUrl: makePinSVG("#0AC4E0", "#0077aa"),
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40],
});

// Pin Orange — selected
const orangePinIcon = L.icon({
  iconUrl: makePinSVG("#F97316", "#c2410c"),
  iconSize: [42, 52],
  iconAnchor: [21, 52],
  popupAnchor: [0, -48],
});

// ==================== MAP CONTROLLER ====================
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && center[0] !== 0 && map) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// ==================== MODAL DETAIL SEKOLAH ====================
const SchoolDetailModal = ({ isOpen, onClose, initialSchool, allSchools, wilayahList }) => {
  const schoolsInArea = allSchools.filter((s) => s.id_wilayah === initialSchool?.id_wilayah);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialSchool) {
      const idx = schoolsInArea.findIndex((s) => s.id_sekolah === initialSchool.id_sekolah);
      setCurrentIndex(idx !== -1 ? idx : 0);
    }
  }, [initialSchool, isOpen]);

  if (!isOpen || !initialSchool || schoolsInArea.length === 0) return null;

  const school = schoolsInArea[currentIndex];
  const wilayah = wilayahList.find((w) => w.id_wilayah === school.id_wilayah);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white"
        >
          <div className="bg-[#0AC4E0] p-8 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                <School size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase">Detail Profil Sekolah</h2>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                  Hub Wilayah: {wilayah?.nama_wilayah?.split("/").pop()}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-10 md:p-14 overflow-y-auto no-scrollbar bg-white">
            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">
                  {school?.nama_sekolah}
                </h3>
                <div className="flex gap-3">
                  <span className="px-4 py-1.5 bg-[#0AC4E0]/10 text-[#0AC4E0] rounded-xl text-[10px] font-black uppercase">
                    NPSN: {school?.npsn}
                  </span>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase border border-emerald-100">
                    Akreditasi {school?.akreditasi || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-widest">Alamat Lengkap</p>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">
                      "{school?.alamat || "Informasi alamat lengkap belum diperbarui."}"
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-[#0AC4E0] uppercase mb-2 tracking-widest">Visi Transformasi</p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      {school?.deskripsi || "Sekolah binaan aktif Astra YPA-MDR dengan fokus pada keunggulan akademik."}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center gap-8 relative overflow-hidden shadow-2xl">
                  <Globe2 size={150} className="absolute -bottom-10 -right-10 opacity-5" />
                  <div className="grid grid-cols-2 gap-4 text-center relative z-10">
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-[#0AC4E0]">{school?.jumlah_guru || 0}</p>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Guru</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-white">{school?.jumlah_siswa || 0}</p>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Siswa</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[9px] font-bold text-[#0AC4E0] uppercase tracking-widest mb-1">Status Program</p>
                    <p className="text-sm font-black uppercase">Mandiri & Unggul</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-black text-slate-300 uppercase">
              Sekolah {currentIndex + 1} dari {schoolsInArea.length}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(schoolsInArea.length - 1, prev + 1))}
                className="w-12 h-12 rounded-2xl bg-[#0AC4E0] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==================== MAIN COMPONENT ====================
const Onboarding = () => {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [selectedJenis, setSelectedJenis] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolModal, setSelectedSchoolModal] = useState(null);
  const [mapCenter, setMapCenter] = useState([-2.5, 118]);
  const [zoom, setZoom] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resW, resS] = await Promise.all([
          axios.get("http://localhost:3000/wilayah"),
          axios.get("http://localhost:3000/sekolah"),
        ]);
        setWilayahList(resW.data.filter((w) => w.status === true || w.status === 1));
        setSekolahList(resS.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSekolah = sekolahList.filter((s) => {
    const wilayahInfo = wilayahList.find((w) => w.id_wilayah === s.id_wilayah);
    const matchWilayah = selectedWilayah ? s.id_wilayah === selectedWilayah.id_wilayah : true;
    const matchJenis = selectedJenis === "all" ? true : wilayahInfo?.jenis_wilayah === selectedJenis;
    return matchWilayah && matchJenis;
  });

  const totalPages = Math.ceil(filteredSekolah.length / itemsPerPage);
  const currentItems = filteredSekolah.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FBFBFD] font-sans selection:bg-[#0AC4E0]/20">
      <Navbar isDashboard />

      {/* HERO */}
      <section className="pt-40 pb-24 px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-10 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
              <Sparkles size={14} className="text-[#0AC4E0]" />
              <span className="text-[10px] font-black text-[#0AC4E0] uppercase tracking-widest">Social Impact Intelligence</span>
            </div>
            <h1 className="text-7xl xl:text-8xl font-black text-slate-800 tracking-tighter leading-[0.9] uppercase">
              SATU <br /> <span className="text-[#0AC4E0]">INDONESIA</span> <br /> CERDAS
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg border-l-4 border-[#0AC4E0] pl-8 italic">
              "Mentransformasi sekolah binaan untuk masa depan bangsa yang mandiri dan kompeten."
            </p>
            <button
              onClick={() => window.open("https://yayasanastra-ypamdr.or.id/", "_blank")}
              className="px-10 py-5 bg-slate-800 hover:bg-[#0AC4E0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-4 active:scale-95"
            >
              Explore Our Vision <MoveRight size={18} />
            </button>
          </motion.div>
          <div className="hidden lg:block relative text-right">
            <img src={picturependidikan} alt="Hero" className="w-[550px] inline-block relative z-10 drop-shadow-2xl animate-float" />
          </div>
        </div>
      </section>

      {/* MAP & REGISTRY */}
      <section className="py-20 px-10 bg-gray-50/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-[11px] font-black text-[#0AC4E0] uppercase tracking-[0.4em]">Spatial View</p>
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Mapping Institusi</h2>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#0AC4E0]/20 shadow-2xl shadow-slate-200/40 overflow-hidden grid lg:grid-cols-12 min-h-[700px]">

            {/* PETA */}
            <div className="lg:col-span-7 relative h-[500px] lg:h-auto border-r border-gray-100">
              <MapContainer
                center={mapCenter} zoom={zoom}
                style={{ height: "100%", width: "100%", background: "#aad3df" }}
                zoomControl={false} scrollWheelZoom={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                <MapController center={mapCenter} zoom={zoom} />

                {wilayahList.map((w) => {
                  const lat = parseFloat(w.latitude);
                  const lng = parseFloat(w.longitude);
                  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;
                  if (selectedJenis !== "all" && w.jenis_wilayah !== selectedJenis) return null;
                  const isSelected = selectedWilayah?.id_wilayah === w.id_wilayah;

                  return (
                    <Marker
                      key={w.id_wilayah}
                      position={[lat, lng]}
                      icon={isSelected ? orangePinIcon : cyanPinIcon}
                      eventHandlers={{
                        click: () => {
                          setSelectedWilayah(w);
                          setMapCenter([lat, lng]);
                          setZoom(11);
                          setCurrentPage(1);
                        },
                      }}
                    >
                      <Popup>
                        <div className="p-3 font-sans text-center min-w-[170px]">
                          <p className="font-black text-[#0AC4E0] text-sm uppercase mb-2">
                            {w.nama_wilayah?.split("/").pop() || w.nama_wilayah}
                          </p>
                          <p className="text-[10px] text-slate-500 mb-3 font-semibold">
                            {w.jenis_wilayah || "Area Binaan"}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedWilayah(w);
                              setMapCenter([lat, lng]);
                              setZoom(13);
                              setCurrentPage(1);
                            }}
                            className="w-full py-2 bg-[#0AC4E0] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                          >
                            Lihat Sekolah
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Legend */}
              <div className="absolute bottom-8 left-8 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-6 bg-[#0AC4E0] rounded-full shadow-sm" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Area Binaan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-7 bg-[#F97316] rounded-full shadow-sm" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Area Terpilih</span>
                </div>
              </div>

              {/* Info bubble */}
              <div className="absolute top-8 left-8 z-[1000] bg-white/90 backdrop-blur-xl border border-white/50 p-5 rounded-[2rem] shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0AC4E0] rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Navigation size={22} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Hub Status</p>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                    {selectedWilayah ? selectedWilayah.nama_wilayah?.split("/").pop() : "SELURUH INDONESIA"}
                  </p>
                </div>
              </div>
            </div>

            {/* REGISTRY */}
            <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
              <div className="p-10 bg-slate-50/50 border-b border-gray-100 space-y-6 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Registry</h3>
                  <button
                    onClick={() => {
                      setSelectedWilayah(null);
                      setSelectedJenis("all");
                      setMapCenter([-2.5, 118]);
                      setZoom(5);
                      setCurrentPage(1);
                    }}
                    className="w-12 h-12 bg-white rounded-2xl border border-gray-100 text-red-400 flex items-center justify-center shadow-sm hover:bg-red-50 transition-all active:scale-90"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <Dropdown
                    items={[
                      { value: "all", label: "PILIH SEMUA WILAYAH" },
                      ...wilayahList.map((w) => ({
                        value: w.id_wilayah,
                        label: w.nama_wilayah?.split("/").pop()?.toUpperCase() || w.nama_wilayah,
                      })),
                    ]}
                    value={selectedWilayah?.id_wilayah || "all"}
                    onChange={(val) => {
                      if (val === "all") {
                        setSelectedWilayah(null);
                        setMapCenter([-2.5, 118]);
                        setZoom(5);
                      } else {
                        const found = wilayahList.find((w) => w.id_wilayah === val);
                        if (found) {
                          setSelectedWilayah(found);
                          setMapCenter([parseFloat(found.latitude), parseFloat(found.longitude)]);
                          setZoom(11);
                        }
                      }
                      setCurrentPage(1);
                    }}
                    className="!rounded-2xl !py-4 !text-[11px] !font-black !border-gray-100 shadow-sm"
                  />
                  <Dropdown
                    icon={Filter}
                    items={[
                      { value: "all", label: "SEMUA JENIS AREA" },
                      { value: "Absolute", label: "ABSOLUTE" },
                      { value: "Independent", label: "INDEPENDENT" },
                    ]}
                    value={selectedJenis}
                    onChange={(val) => { setSelectedJenis(val); setCurrentPage(1); }}
                    className="!rounded-2xl !py-4 !text-[11px] !font-black !border-gray-100 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="px-10 py-5 bg-[#0AC4E0] text-white text-[10px] font-black uppercase tracking-widest text-left">Institusi Binaan</th>
                        <th className="px-10 py-5 bg-[#0AC4E0] text-white text-[10px] font-black uppercase tracking-widest text-left">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#0AC4E0]/5 transition-colors">
                          <td className="px-10 py-7 border-b border-slate-50">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-slate-800 text-[13px] uppercase">{row.nama_sekolah}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {row.jenjang} • NPSN {row.npsn}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-7 border-b border-slate-50">
                            <button
                              onClick={() => { setSelectedSchoolModal(row); setIsModalOpen(true); }}
                              className="w-10 h-10 bg-slate-50 text-[#0AC4E0] border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-[#0AC4E0] hover:text-white transition-all active:scale-90 shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {currentItems.length === 0 && (
                    <div className="py-24 text-center opacity-30">
                      <School size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Data Sekolah Tidak Ditemukan</p>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <span className="text-[10px] font-black text-slate-300 uppercase">
                    Record {currentPage} dari {totalPages || 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 disabled:opacity-20 active:scale-90 transition-all shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 disabled:opacity-20 active:scale-90 transition-all shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-32 px-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ValueCard icon={<Eye />} title="Vision" desc="Lembaga sosial kredibel untuk mutu pendidikan daerah binaan." />
          <ValueCard icon={<Rocket />} title="Mission" desc="Mendorong pembinaan sekolah melalui 4 Pilar Utama." />
          <ValueCard icon={<Mountain />} title="Goal" desc="Mewujudkan sekolah binaan mandiri, unggul, dan berprestasi." />
          <ValueCard icon={<Target />} title="Aim" desc="Melahirkan generasi muda kompeten demi Indonesia sejahtera." />
        </div>
      </section>

      <Footer />

      <SchoolDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSchool={selectedSchoolModal}
        allSchools={sekolahList}
        wilayahList={wilayahList}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-25px)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .leaflet-container { font-family: inherit; z-index: 1; border: none !important; width: 100%; height: 100%; background: #aad3df !important; }
        .leaflet-control-zoom a { background: white !important; color: #0AC4E0 !important; border-radius: 12px !important; margin: 4px !important; width: 36px !important; height: 36px !important; line-height: 36px !important; }
        .leaflet-popup-content-wrapper { border-radius: 20px !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
      `}} />
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="p-10 bg-white border-2 border-[#0AC4E0]/10 rounded-[3rem] hover:border-[#0AC4E0] hover:shadow-2xl transition-all duration-500 group text-left">
    <div className="text-[#0AC4E0] mb-8 group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">{title}</h4>
    <p className="text-sm font-medium text-slate-400 leading-relaxed italic">{desc}</p>
  </div>
);

export default Onboarding;