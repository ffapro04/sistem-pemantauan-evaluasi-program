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
  School,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Rocket,
  Mountain,
  Target,
  MoveRight,
  Filter,
  Globe2,
  X,
  Navigation,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Dropdown from "../../components/Dropdown";
import Footer from "../../components/Footer";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Label from "../../components/Label";

import picturependidikan from "../../assets/img/pichture_pendidikan 1.png";

// --- Leaflet Icon Setup ---
const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Sub-Component: Map Controller (Menggerakkan kamera peta) ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0])) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// --- Variabel Animasi Page Flip (Efek Buka Buku) ---
const pageVariants = {
  initial: (direction) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    transformOrigin: direction > 0 ? "left" : "right",
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1.0],
    },
  },
  exit: (direction) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    transformOrigin: direction > 0 ? "right" : "left",
    transition: {
      duration: 0.6,
    },
  }),
};

// --- Sub-Component: Modal Detail Sekolah dengan Page Flip ---
const SchoolDetailModal = ({
  isOpen,
  onClose,
  initialSchool,
  allSchools,
  wilayahList,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Filter sekolah yang ada dalam satu hub wilayah yang sama
  const schoolsInArea = allSchools.filter(
    (s) => s.id_wilayah === initialSchool?.id_wilayah,
  );

  useEffect(() => {
    if (initialSchool) {
      const idx = schoolsInArea.findIndex(
        (s) => s.id_sekolah === initialSchool.id_sekolah,
      );
      setCurrentIndex(idx !== -1 ? idx : 0);
    }
  }, [initialSchool, isOpen]);

  if (!isOpen || !initialSchool || schoolsInArea.length === 0) return null;

  const school = schoolsInArea[currentIndex];
  const wilayah = wilayahList.find((w) => w.id_wilayah === school.id_wilayah);
  const province = wilayah?.nama_wilayah?.split("/")[1] || "Indonesia";

  const paginate = (newDirection) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < schoolsInArea.length) {
      setDirection(newDirection);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 perspective-1000">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1E5AA5]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden shadow-blue-900/20"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Header Banner (Statik) */}
          <div className="px-8 py-8 bg-[#1E5AA5] relative shrink-0 z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent" />
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20 shadow-lg">
                  <School size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                    Profil Sekolah Binaan
                  </h2>
                  <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic">
                    Hub Wilayah:{" "}
                    {wilayah?.nama_wilayah?.split("/").pop() || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-rose-500 transition-all border border-white/10 active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Animating Pages Container (Diberikan Min-Height Agar Konten Muncul) */}
          <div className="relative bg-white min-h-[500px] md:min-h-[450px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={school?.id_sekolah || currentIndex}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 p-8 md:p-12 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-8">
                  {/* Judul & Badge */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <h3 className="text-4xl font-[1000] text-gray-900 uppercase tracking-tighter leading-none">
                        {school?.nama_sekolah}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        NPSN: {school?.npsn} • Jenjang {school?.jenjang}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-5 py-2 rounded-xl bg-blue-50 text-[#1E5AA5] border border-blue-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        Akreditasi {school?.akreditasi || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Konten Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                        <Label
                          text="Identitas Lokasi"
                          className="text-[#1E5AA5] font-black text-[9px] uppercase mb-3 block tracking-widest"
                        />
                        <p className="text-xs font-bold text-gray-600 uppercase leading-relaxed">
                          {school?.alamat ||
                            "Data alamat lengkap belum diperbarui dalam sistem."}
                        </p>
                      </div>
                      <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                        <Label
                          text="Visi & Ringkasan Binaan"
                          className="text-[#1E5AA5] font-black text-[9px] uppercase mb-3 block tracking-widest"
                        />
                        <p className="text-xs font-medium text-gray-400 italic leading-relaxed">
                          {school?.deskripsi ||
                            "Sekolah ini merupakan binaan aktif YPA-MDR yang menerapkan standar kualitas pendidikan nasional melalui program pilar transformasi."}
                        </p>
                      </div>
                    </div>

                    <div className="p-8 bg-[#1E5AA5] rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                      <Globe2
                        size={150}
                        className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-all duration-1000 group-hover:rotate-12"
                      />
                      <div className="relative z-10 space-y-8">
                        <div className="grid grid-cols-2 gap-6 border-b border-white/10 pb-8">
                          <div>
                            <p className="text-5xl font-black tracking-tighter">
                              {school?.jumlah_guru || 0}
                            </p>
                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest mt-1">
                              Tenaga Pengajar
                            </p>
                          </div>
                          <div>
                            <p className="text-5xl font-black tracking-tighter">
                              {school?.jumlah_siswa || 0}
                            </p>
                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest mt-1">
                              Siswa Terdaftar
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest">
                          <span className="text-blue-200">Provinsi Area</span>
                          <span className="text-base">{province}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigasi (Book Flip Controls) */}
          <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                Urutan {currentIndex + 1} Dari {schoolsInArea.length} Sekolah
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => paginate(-1)}
                disabled={currentIndex === 0}
                className="w-14 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-[#1E5AA5] hover:border-[#1E5AA5] transition-all disabled:opacity-20 active:scale-90 shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => paginate(1)}
                disabled={currentIndex === schoolsInArea.length - 1}
                className="w-14 h-12 flex items-center justify-center rounded-2xl bg-[#1E5AA5] text-white shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all disabled:opacity-20 active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Main Component: Onboarding ---
const Onboarding = () => {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [selectedJenis, setSelectedJenis] = useState("all");

  // Modal States
  const [selectedSchoolForModal, setSelectedSchoolForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [mapCenter, setMapCenter] = useState([-2.5, 118]);
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

  const filteredSekolah = sekolahList.filter((s) => {
    const wilayahInfo = wilayahList.find((w) => w.id_wilayah === s.id_wilayah);
    const matchWilayah = selectedWilayah
      ? s.id_wilayah === selectedWilayah.id_wilayah
      : true;
    const matchJenis =
      selectedJenis === "all"
        ? true
        : wilayahInfo?.jenis_wilayah === selectedJenis;
    return matchWilayah && matchJenis;
  });

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
          <span className="font-black text-[#1E5AA5] text-[10px] uppercase truncate w-36 leading-none mb-1">
            {row.nama_sekolah}
          </span>
          <span className="text-[8px] text-gray-400 font-bold uppercase italic tracking-wider">
            {row.jenjang} • NPSN {row.npsn}
          </span>
        </div>
      ),
    },
    {
      header: "AKREDITASI",
      align: "text-center",
      render: (row) => (
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black border border-blue-100 shadow-sm">
          {row.akreditasi || "N/A"}
        </span>
      ),
    },
    {
      header: "DETAIL",
      align: "text-center",
      render: (row) => (
        <button
          onClick={() => {
            setSelectedSchoolForModal(row);
            setIsModalOpen(true);
          }}
          className="p-2.5 bg-gray-50 text-[#1E5AA5] hover:bg-[#1E5AA5] hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm group active:scale-90"
        >
          <Eye
            size={14}
            className="group-hover:scale-110 transition-transform"
          />
        </button>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden selection:bg-[#1E5AA5] selection:text-white">
      <Navbar isDashboard />

      {/* HERO SECTION */}
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
              SATU <br /> <span className="text-[#1E5AA5]">INDONESIA</span>{" "}
              <br /> CERDAS
            </h1>
            <p className="text-gray-500 text-lg border-l-4 border-[#1E5AA5] pl-6 font-medium max-w-md italic">
              Transformasi pendidikan berkelanjutan untuk mewujudkan generasi
              emas Indonesia yang mandiri dan berprestasi.
            </p>
            <Button
              text="Selengkapnya Tentang YPA-MDR"
              icon={<MoveRight size={18} />}
              onClick={() =>
                window.open("https://yayasanastra-ypamdr.or.id/", "_blank")
              }
              className="bg-[#1E5AA5] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 border-none"
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

      {/* MAP & REGISTRY SECTION */}
      <section className="py-24 px-6 bg-[#EEF5FF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#1E5AA5] font-black text-[10px] uppercase tracking-[0.5em]">
              Global Sebaran Data Binaan
            </span>
            <h2 className="text-5xl font-[1000] text-gray-900 tracking-tighter uppercase leading-none">
              Mapping <span className="text-[#1E5AA5]">Sekolah Binaan</span>
            </h2>
          </div>

          <div className="bg-white rounded-[3rem] shadow-3xl border border-gray-100 overflow-hidden grid lg:grid-cols-12 min-h-[650px]">
            {/* Sisi Kiri: Peta */}
            <div className="lg:col-span-7 relative h-[500px] lg:h-auto border-r border-gray-100">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                <MapController center={mapCenter} zoom={zoom} />

                {wilayahList.map((w) => {
                  const lat = parseFloat(w.latitude);
                  const lng = parseFloat(w.longitude);
                  if (isNaN(lat) || isNaN(lng)) return null;

                  if (
                    selectedJenis !== "all" &&
                    w.jenis_wilayah !== selectedJenis
                  )
                    return null;

                  const isSelected =
                    selectedWilayah?.id_wilayah === w.id_wilayah;
                  return (
                    <Marker
                      key={`wilayah-${w.id_wilayah}`}
                      position={[lat, lng]}
                      icon={isSelected ? selectedIcon : defaultIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[160px] font-sans">
                          <p className="font-black text-[#1E5AA5] uppercase text-[10px] border-b pb-1 mb-2">
                            {w.nama_wilayah.split("/").pop()}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase">
                            Jenis: {w.jenis_wilayah || "-"}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase italic">
                            Unit Sekolah:{" "}
                            {
                              sekolahList.filter(
                                (s) => s.id_wilayah === w.id_wilayah,
                              ).length
                            }
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-white p-4 rounded-3xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1E5AA5] rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Navigation size={22} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 italic">
                    Spatial View
                  </p>
                  <p className="text-sm font-black text-[#1E5AA5] uppercase tracking-tighter leading-none">
                    {selectedWilayah
                      ? selectedWilayah.nama_wilayah.split("/").pop()
                      : "SELURUH INDONESIA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Panel Data */}
            <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
              <div className="p-10 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">
                      Regional Hubs
                    </span>
                    <h3 className="text-3xl font-[1000] text-gray-800 uppercase tracking-tighter leading-none">
                      REGISTRY
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWilayah(null);
                      setSelectedJenis("all");
                      setMapCenter([-2.5, 118]);
                      setZoom(5);
                      setCurrentPage(1);
                    }}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>

                <div className="space-y-4">
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
                        if (found) {
                          setSelectedWilayah(found);
                          setMapCenter([
                            parseFloat(found.latitude),
                            parseFloat(found.longitude),
                          ]);
                          setZoom(11);
                        }
                      }
                      setCurrentPage(1);
                    }}
                    className="!rounded-2xl !border-gray-200 !py-4 !text-[11px] font-black uppercase shadow-sm"
                  />

                  <Dropdown
                    icon={Filter}
                    items={[
                      { value: "all", label: "SEMUA JENIS AREA" },
                      { value: "Absolute", label: "ABSOLUTE" },
                      { value: "Independent", label: "INDEPENDENT" },
                    ]}
                    value={selectedJenis}
                    onChange={(val) => {
                      setSelectedJenis(val);
                      setCurrentPage(1);
                    }}
                    className="!rounded-2xl !border-gray-200 !py-4 !text-[11px] font-black uppercase shadow-sm"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <School size={20} className="text-[#1E5AA5]" />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
                      Inventory Records
                    </span>
                  </div>
                  <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black shadow-xl tracking-widest">
                    {filteredSekolah.length} SEKOLAH
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  {currentItems.length > 0 ? (
                    <Table
                      columns={schoolColumns}
                      data={currentItems}
                      className="min-w-full"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-300 py-10">
                      <School size={50} strokeWidth={1} />
                      <p className="text-[11px] font-black uppercase tracking-widest text-center italic leading-relaxed">
                        No records found matching <br /> current spatial hub
                        filters
                      </p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="pt-8 mt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Page {currentPage} / {totalPages}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors shadow-sm active:scale-90"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors shadow-sm active:scale-90"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION FOOTER SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
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
              className="p-12 border border-gray-50 rounded-[3rem] hover:bg-white hover:shadow-3xl transition-all group border-none bg-gray-50/30"
            >
              <div className="text-[#1E5AA5] mb-8 group-hover:scale-110 transition-transform duration-500">
                {m.i}
              </div>
              <h4 className="text-2xl font-[1000] uppercase tracking-tighter mb-4 text-gray-900">
                {m.t}
              </h4>
              <p className="text-gray-400 text-xs font-bold leading-relaxed italic uppercase tracking-widest">
                {m.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Modal Detail Sekolah (Buku Flip) */}
      <SchoolDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSchool={selectedSchoolForModal}
        allSchools={sekolahList}
        wilayahList={wilayahList}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 10px; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25px); } }
        .leaflet-container { border-radius: 0; font-family: inherit; z-index: 1; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default Onboarding;