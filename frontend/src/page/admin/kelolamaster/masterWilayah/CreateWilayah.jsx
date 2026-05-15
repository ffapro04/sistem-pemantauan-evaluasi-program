/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Search as SearchIcon,
  Database,
  Layers,
  Navigation,
  Sparkles,
  Map as MapIcon,
  ChevronDown,
  ChevronLeft, // FIX: Sudah ditambahkan di sini
  XCircle,
  CheckCircle2,
  Calendar,
  Globe
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Label from "../../../../components/Label";
import Input from "../../../../components/Input";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

// Fix Leaflet Marker Icon to Cyan Theme
const iconCyan = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== -6.2) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

const DEFAULT_LAT = -6.2;
const DEFAULT_LNG = 106.816666;

const CreateWilayah = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  // Form States
  const [formData, setFormData] = useState({
    nama_wilayah: "",
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    deskripsi: "",
    alamat_lengkap: "",
    tahun_awal_binaan: new Date().getFullYear(),
    status: true,
    tipe_wilayah: "Binaan",
    jenis_wilayah: "Absolute",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (query) => {
    if (!query || query.length < 3) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${query}, Indonesia&limit=8&accept-language=id&countrycodes=id`,
      );
      const data = await res.json();
      setSuggestions(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Pencarian gagal", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.length >= 3 && !formData.nama_wilayah.includes(searchValue)) {
        searchLocation(searchValue);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSelectLocation = async (loc) => {
    const { lat, lon, address, display_name } = loc;
    const prov = address.state || address.region || "";
    const kota = address.city || address.county || address.regency || "";
    const kec = address.city_district || address.suburb || address.district || "";

    let namaDetail = address.amenity || address.village || address.hamlet || kec || kota.replace("Kabupaten ", "").replace("Kota ", "");
    const formatNama = `Indonesia/${prov}/${kota}/${namaDetail}`.split("/").filter(Boolean).join("/");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/wilayah/check-name?nama=${encodeURIComponent(formatNama)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.isDuplicate) {
        setStatusNote({ show: true, type: 'error', message: `Wilayah "${namaDetail}" sudah terdaftar di sistem.` });
        return;
      }

      const deskripsiParts = [namaDetail, kec, kota, prov].filter((val, index, self) => val && self.indexOf(val) === index);

      setFormData((prev) => ({
        ...prev,
        nama_wilayah: formatNama,
        deskripsi: deskripsiParts.join(", ") + " - Indonesia",
        alamat_lengkap: display_name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      }));

      setIsLocationSelected(true);
      setSearchValue(namaDetail);
      setShowDropdown(false);
      setStatusNote({ show: false });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`);
      const data = await res.json();
      if (data.address) handleSelectLocation(data);
    } catch (err) { console.error(err); }
  };

  function MapEvents() {
    useMapEvents({ click(e) { fetchAddress(e.latlng.lat, e.latlng.lng); } });
    return null;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isLocationSelected || !formData.alamat_lengkap) {
      setStatusNote({ show: true, type: 'error', message: "Data Spasial Belum Lengkap: Mohon tentukan titik lokasi pada peta." });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        tahun_awal_binaan: parseInt(formData.tahun_awal_binaan),
      };

      await axios.post("http://localhost:3000/wilayah", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({ show: true, type: 'success', message: "Berhasil: Hub wilayah baru telah diaktifkan dalam sistem." });
      setTimeout(() => navigate("/admin/wilayah"), 2500);
    } catch (error) {
      setStatusNote({ show: true, type: 'error', message: error.response?.data?.message || "Internal Server Error." });
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        {/* --- VALIDATION SIDE NOTES --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[40%] w-72 z-[100]`}
            >
              <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'System Alert' : 'Success Sync'}
                </h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md">Dismiss</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center z-10 leading-none">
          <div className="flex items-center justify-center gap-2 mb-2 leading-none">
            <Sparkles size={16} className="text-[#0AC4E0]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0AC4E0]/50 leading-none">Spatial Intelligence</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase leading-none">Set Area Binaan</h1>
        </motion.div>

        {/* 2. MAIN BENTO BOX (Split Map & Form) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[90%] bg-white rounded-t-[4rem] border-2 border-[#0AC4E0]/20 shadow-[0_-20px_80px_rgba(10,196,224,0.06)] flex flex-col lg:flex-row h-[75vh] overflow-hidden z-10"
        >
          {/* SISI KIRI: MAP (FLEX-6) */}
          <div className="flex-[6] relative bg-slate-50 border-r border-slate-100">
            <MapContainer center={[formData.latitude, formData.longitude]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <ChangeView center={[formData.latitude, formData.longitude]} />
              <Marker position={[formData.latitude, formData.longitude]} icon={iconCyan} />
              <MapEvents />
            </MapContainer>

            {/* Map Overlay Badge */}
            <div className="absolute top-6 left-6 z-[1000] bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0AC4E0] rounded-xl flex items-center justify-center text-white shadow-lg"><Globe size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hub Status</p>
                <p className="text-[12px] font-black text-slate-800 uppercase leading-none">{isLocationSelected ? "Location Locked" : "Select Point"}</p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: FORM (FLEX-4) */}
          <div className="flex-[4] flex flex-col bg-white overflow-hidden leading-none">
            <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-8">

              {/* SECTION: SEARCH */}
              <div className="space-y-3" ref={dropdownRef}>
                <Label text="Search Location" required className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-1" />
                <div className="relative group">
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Ketik wilayah (e.g. Banyumas)..."
                    className="!py-4 !pl-12 !bg-slate-50/50 !border-slate-100 !rounded-[1.4rem] !text-[14px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all shadow-sm"
                  />
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={18} />

                  {/* Dropdown Suggestions */}
                  <AnimatePresence>
                    {showDropdown && suggestions.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 z-[1001] bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl mt-2 overflow-hidden">
                        <ul className="max-h-[200px] overflow-y-auto no-scrollbar p-2">
                          {suggestions.map((loc, i) => (
                            <li key={i} onClick={() => handleSelectLocation(loc)} className="px-5 py-3 hover:bg-[#0AC4E0]/5 rounded-xl cursor-pointer flex flex-col gap-1 border-b border-slate-50 last:border-none transition-all">
                              <span className="font-bold text-slate-800 text-[11px] uppercase">{loc.display_name.split(",")[0]}</span>
                              <span className="text-slate-400 text-[9px] truncate">{loc.display_name}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* SECTION: METADATA */}
              <div className="space-y-6 pt-6 border-t border-slate-50 leading-none text-left">
                <div className="space-y-2">
                  <Label text="Hierarki Wilayah" className="!text-[9px] !font-black !text-slate-300 !uppercase !tracking-widest" />
                  <div className="px-6 py-4 bg-[#0AC4E0]/5 rounded-2xl border border-[#0AC4E0]/10">
                    <p className="text-[12px] font-black text-[#0AC4E0] uppercase leading-snug">{formData.nama_wilayah || "Menunggu Input..."}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label text="Tahun Binaan" className="!text-[9px] !font-black !text-slate-300 !uppercase" />
                    <Input type="number" value={formData.tahun_awal_binaan} onChange={(v) => setFormData({ ...formData, tahun_awal_binaan: v })} className="!py-3 !rounded-xl !text-sm !font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label text="Jenis Area" className="!text-[9px] !font-black !text-slate-300 !uppercase" />
                    <Dropdown value={formData.jenis_wilayah} onChange={(val) => setFormData({ ...formData, jenis_wilayah: val })} items={[{ value: "Absolute", label: "ABSOLUTE" }, { value: "Independent", label: "INDEPENDENT" }]} className="!py-3 !rounded-xl !text-[11px] !font-black" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label text="Alamat Spesifik" required className="!text-[9px] !font-black !text-slate-300 !uppercase" />
                  <Textarea value={formData.alamat_lengkap} onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })} placeholder="Input detail alamat operasional..." className="!bg-slate-50/50 !border-slate-100 !rounded-[1.5rem] !text-[12px] font-semibold h-24" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. ACTION DOCK */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/wilayah")} className="flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none">
              <ChevronLeft size={16} /> Kembali
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none">
              <Database size={18} /> {loading ? "..." : "Simpan Area"}
            </button>
          </div>
        </motion.div>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .leaflet-container { border-radius: 0; cursor: crosshair !important; }
      `}} />
    </PageWrapper>
  );
};

export default CreateWilayah;