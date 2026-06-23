/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  School, Globe2, X, Navigation, Eye
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import PageWrapper from "../../components/PageWrapper";
import Dropdown from "../../components/Dropdown";
import Table from "../../components/Table";

// --- Custom Marker ---
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #0AC4E0; width: 15px; height: 15px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 0 10px rgba(10, 196, 224, 0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// --- MODAL DETAIL (VERSI BERSIH TANPA TANGGAL/KALENDER) ---
const SchoolDetailModal = ({ isOpen, onClose, school }) => {
  if (!isOpen || !school) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 bg-[#0AC4E0] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <School size={30} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Informasi Profil Sekolah</h2>
                <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest italic text-white">Detail Institusi Binaan</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all text-white"><X /></button>
          </div>

          {/* Content Profil */}
          <div className="p-10 space-y-8 bg-white">
            <div>
              <h3 className="text-4xl font-[1000] text-black leading-none uppercase mb-4 tracking-tighter">{school.nama_sekolah}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-cyan-50 text-[#0AC4E0] rounded-lg font-black text-[10px] border border-cyan-100 uppercase">NPSN: {school.npsn}</span>
                <span className="px-3 py-1 bg-gray-100 text-black rounded-lg font-black text-[10px] border border-gray-200 uppercase">{school.jenjang} - {school.akreditasi}</span>
              </div>
              
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 italic">Alamat Lengkap</p>
                    <p className="text-sm font-black text-slate-700 uppercase leading-relaxed">{school.alamat}</p>
                 </div>
              </div>
            </div>

            {/* Statistik */}
            <div className="bg-[#0AC4E0] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-cyan-100/50">
              <Globe2 size={150} className="absolute -right-10 -bottom-10 opacity-10" />
              <div className="relative z-10 grid grid-cols-2 gap-8">
                <div className="border-l-4 border-white/30 pl-6">
                  <p className="text-5xl font-black text-white leading-none mb-1">{school.jumlah_guru || 0}</p>
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest text-white">Tenaga Pengajar</p>
                </div>
                <div className="border-l-4 border-white/30 pl-6">
                  <p className="text-5xl font-black text-white leading-none mb-1">{school.jumlah_siswa || 0}</p>
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest text-white">Siswa Terdaftar</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#0AC4E0] transition-all shadow-lg active:scale-95"
            >
              Tutup Detail
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- DATA SEKOLAH PAGE ---
const DataSekolahPengurus = () => {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([-2.5, 118]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resW, resS] = await Promise.all([
          axios.get("http://localhost:3000/wilayah"),
          axios.get("http://localhost:3000/sekolah"),
        ]);
        setWilayahList(resW.data.filter(w => w.status));
        setSekolahList(resS.data);
      } catch (err) {
        console.error("Gagal load data", err);
      }
    };
    fetchData();
  }, []);

  const filteredSekolah = sekolahList.filter(s => 
    selectedWilayah ? s.id_wilayah === selectedWilayah.id_wilayah : true
  );

  return (
    <PageWrapper className="h-screen bg-[#F0FBFF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 rounded-t-[2.5rem] bg-white flex flex-col overflow-hidden shadow-2xl border-none">
          
          <div className="h-[40%] relative border-b border-gray-100 shrink-0">
            <MapContainer center={mapCenter} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} zoom={selectedWilayah ? 12 : 5} />
              {wilayahList.map(w => (
                <Marker key={w.id_wilayah} position={[w.latitude, w.longitude]} icon={customIcon}>
                  <Popup><span className="font-black text-[#0AC4E0] uppercase tracking-tighter">{w.nama_wilayah.split("/").pop()}</span></Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="absolute top-6 left-6 z-[1000]">
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div className="w-10 h-10 bg-[#0AC4E0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-100"><Navigation size={20}/></div>
                <Dropdown 
                  items={[{value: "all", label: "SEMUA WILAYAH BINAAN"}, ...wilayahList.map(w => ({value: w.id_wilayah, label: w.nama_wilayah.split("/").pop().toUpperCase()}))]}
                  onChange={(val) => {
                    const found = wilayahList.find(w => w.id_wilayah === val);
                    setSelectedWilayah(found || null);
                    if (found) setMapCenter([found.latitude, found.longitude]);
                  }}
                  className="!border-none !bg-transparent font-black text-[11px] min-w-[200px] text-black"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4 text-black">
                 <div className="p-3 bg-cyan-50 text-[#0AC4E0] rounded-2xl border border-cyan-100"><School size={20}/></div>
                 <h2 className="text-sm font-black uppercase tracking-tighter text-black">Database Sekolah Binaan</h2>
               </div>
               <span className="px-4 py-1.5 bg-[#0AC4E0] text-white rounded-full text-[10px] font-black shadow-lg shadow-cyan-100">
                  {filteredSekolah.length} SEKOLAH TERDAFTAR
               </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Table 
                data={filteredSekolah}
                columns={[
                  { header: "NPSN", render: (r) => <span className="font-mono text-gray-400 font-bold text-[10px] uppercase">{r.npsn}</span> },
                  { header: "NAMA SEKOLAH", render: (r) => <span className="font-black text-black uppercase text-[11px] tracking-tight">{r.nama_sekolah}</span> },
                  { header: "JENJANG", render: (r) => <span className="bg-gray-100 px-3 py-1 rounded-md text-[9px] font-black text-black uppercase border border-gray-200">{r.jenjang}</span> },
                  { header: "AKREDITASI", render: (r) => <span className="text-[#0AC4E0] font-black bg-cyan-50 px-3 py-1 rounded-md border border-cyan-100">GRADE {r.akreditasi}</span> },
                  { header: "AKSI", render: (r) => (
                    <button 
                      onClick={() => { setSelectedSchool(r); setIsModalOpen(true); }}
                      className="p-2 hover:bg-[#0AC4E0] hover:text-white rounded-xl transition-all border border-gray-100 text-[#0AC4E0] shadow-sm active:scale-95"
                    >
                      <Eye size={16}/>
                    </button>
                  )}
                ]}
              />
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DIBAWAH INI SEKARANG AKTIF */}
      <SchoolDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        school={selectedSchool}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0AC4E0; border-radius: 10px; }
        .leaflet-container { z-index: 1; filter: grayscale(0.2) contrast(1.1); }
        .leaflet-popup-content-wrapper { border-radius: 15px; border: 2px solid #0AC4E0; font-family: 'Inter', sans-serif; }
      `}</style>
    </PageWrapper>
  );
};

export default DataSekolahPengurus;