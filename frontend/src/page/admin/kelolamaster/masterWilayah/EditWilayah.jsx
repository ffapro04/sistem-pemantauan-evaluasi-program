/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Database,
  Lock,
  Save,
  ChevronLeft,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  LockIcon,
  Fingerprint,
  Layers,
  Map as MapIcon,
  Calendar,
  Globe,
  Info
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Komponen Custom
import Sidebar from "../../../../components/Sidebar";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

// Fix icon Marker Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CORRECT_PATTERN = "1236"; // Pola rahasia (Atas kiri -> kanan -> tengah kanan)

const EditWilayah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE OTORISASI POLA ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- STATE DATA ---
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_wilayah: "",
    deskripsi: "",
    alamat_lengkap: "",
    latitude: -6.2,
    longitude: 106.816666,
    keterangan: "Absolute",
    tahun_awal_binaan: "",
  });

  const [statusNote, setStatusNote] = useState({ show: false, type: null, message: "" });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/wilayah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setFormData({
            nama_wilayah: res.data.nama_wilayah || "",
            deskripsi: res.data.deskripsi || "",
            alamat_lengkap: res.data.alamat_lengkap || "",
            latitude: parseFloat(res.data.latitude) || -6.2,
            longitude: parseFloat(res.data.longitude) || 106.816666,
            keterangan: res.data.keterangan || "Absolute",
            tahun_awal_binaan: res.data.tahun_awal_binaan || "",
          });
        }
      } catch (err) {
        navigate("/admin/wilayah");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // --- LOGIKA DRAWING PATTERN ---
  const handleStart = (num) => {
    setIsDragging(true);
    setActivePattern([num]);
  };

  const handleEnter = (num) => {
    if (isDragging && !activePattern.includes(num)) {
      setActivePattern((prev) => [...prev, num]);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    const result = activePattern.join("");
    if (result === CORRECT_PATTERN) {
      setIsUnlocked(true);
      setStatusNote({ show: false });
    } else if (result.length > 0) {
      setStatusNote({ show: true, type: 'error', message: "Otoritas Pola Gagal." });
      setActivePattern([]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/wilayah/${id}`, {
        keterangan: formData.keterangan,
        alamat_lengkap: formData.alamat_lengkap,
        tahun_awal_binaan: formData.tahun_awal_binaan
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusNote({ show: true, type: 'success', message: "Database Wilayah Berhasil Disinkronkan." });
      setTimeout(() => navigate("/admin/wilayah"), 2000);
    } catch (err) {
      setStatusNote({ show: true, type: 'error', message: "Gagal Update Database." });
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
    </div>
  );

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans text-slate-800 leading-none">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative items-center justify-end" onMouseUp={handleEnd}>

        {/* --- LAYER 1: PATTERN LOCK --- */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ y: -1000, filter: "blur(40px)", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[200] bg-slate-900/80 backdrop-blur-3xl flex flex-col items-center justify-center text-white"
            >
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Spatial Security</h2>
                <p className="text-sm text-slate-400">Verifikasi otoritas untuk modifikasi wilayah</p>
              </div>
              <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10 select-none">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div key={num} onMouseDown={() => handleStart(num)} onMouseEnter={() => handleEnter(num)} className="relative w-12 h-12 flex items-center justify-center cursor-pointer">
                      <motion.div animate={{ scale: activePattern.includes(num) ? 1.5 : 1, backgroundColor: activePattern.includes(num) ? "#0AC4E0" : "rgba(255,255,255,0.2)" }} className="w-4 h-4 rounded-full shadow-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate(-1)} className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Cancel Access</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- BACKGROUND BLOOM --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-0" />

        {/* --- STATUS NOTIFICATION --- */}
        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: statusNote.type === 'error' ? -100 : 100, opacity: 0 }}
              className={`fixed ${statusNote.type === 'error' ? 'left-[320px]' : 'right-12'} top-[45%] w-72 z-[250]`}
            >
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-[3rem] shadow-2xl text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg ${statusNote.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                  {statusNote.type === 'error' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${statusNote.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {statusNote.type === 'error' ? 'SYNC FAILED' : 'SYNC SUCCESS'}
                </h4>
                <p className="text-xs font-bold text-slate-700 mb-8">{statusNote.message}</p>
                <button onClick={() => setStatusNote({ ...statusNote, show: false })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase ${statusNote.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>Got It</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HEADER --- */}
        <motion.div className="mb-8 text-center z-10 leading-none">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1C0770]/50">Geospatial Database Protocol</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0AC4E0] uppercase">Edit Wilayah</h1>
        </motion.div>

        {/* --- MAIN FORM CONTAINER --- */}
        <motion.div
          className="w-full max-w-5xl bg-white rounded-t-[5rem] shadow-[0_-20px_100px_rgba(10,196,224,0.1)] p-12 pb-44 border-t border-x border-[#0AC4E0]/10 relative z-10 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">

            {/* SISI KIRI: METADATA (LOCKED) */}
            <div className="space-y-10">
              <div className="h-56 rounded-[3rem] overflow-hidden border-4 border-slate-50 shadow-inner relative group">
                <MapContainer key={`${formData.latitude}-${formData.longitude}`} center={[formData.latitude, formData.longitude]} zoom={12} dragging={false} zoomControl={false} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[formData.latitude, formData.longitude]} />
                </MapContainer>
                <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md text-[9px] text-white px-4 py-2 rounded-full font-black uppercase tracking-widest border border-white/20">
                  <LockIcon size={10} className="inline mr-2" /> Static Core Locked
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-[#0AC4E0] rounded-full"></div>
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Metadata Wilayah (Sistem Terkunci)</h3>
                </div>

                <div className="space-y-4 opacity-50 grayscale transition-all hover:grayscale-0">
                  <div className="space-y-2">
                    <Label text="Label Registrasi" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                    <div className="flex items-center gap-4 px-8 py-5 bg-slate-100/50 border border-slate-200 rounded-[2.2rem] cursor-not-allowed">
                      <Database className="text-slate-300" size={18} />
                      <span className="text-[14px] font-bold text-slate-500 uppercase tracking-tight">{formData.nama_wilayah}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label text="Area / Provinsi" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                    <div className="flex items-center gap-4 px-8 py-5 bg-slate-100/50 border border-slate-200 rounded-[2.2rem] cursor-not-allowed">
                      <Globe className="text-slate-300" size={18} />
                      <span className="text-[14px] font-bold text-slate-500 uppercase tracking-tight">{formData.deskripsi.split(",").pop()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SISI KANAN: CONFIGURATION (EDITABLE) */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 bg-[#0AC4E0] rounded-full"></div>
                <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Update Configuration</h3>
              </div>

              <div className="space-y-3">
                <Label text="Tahun Awal Binaan" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Input type="number" value={formData.tahun_awal_binaan} onChange={(e) => setFormData({ ...formData, tahun_awal_binaan: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[16px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all" />
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <Label text="Status Independensi" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <Dropdown icon={Layers} value={formData.keterangan} onChange={(val) => setFormData({ ...formData, keterangan: val })} items={[{ value: "Absolute", label: "ABSOLUTE" }, { value: "Independent", label: "INDEPENDENT" }]} className="!py-5 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-base !font-black text-slate-700" />
              </div>

              <div className="space-y-3">
                <Label text="Alamat Lengkap (Spesifik)" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                <div className="relative group">
                  <Textarea value={formData.alamat_lengkap} onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })} className="!py-5 !pl-14 !bg-slate-50/50 !border-slate-100 !rounded-[2.2rem] !text-[14px] !font-bold focus:!bg-white focus:!border-[#0AC4E0] transition-all min-h-[120px]" />
                  <MapPin className="absolute left-6 top-8 text-slate-300 group-focus-within:text-[#0AC4E0]" size={20} />
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* --- DOCK ACTION --- */}
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="absolute bottom-[-15px] w-[550px] h-[120px] bg-white/80 backdrop-blur-3xl border-t-2 border-x-2 border-white rounded-t-[250px] z-30 shadow-[0_-20px_80px_rgba(10,196,224,0.15)] flex items-center justify-center px-16 pt-6"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigate("/admin/wilayah")} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-sm leading-none">
              <ChevronLeft size={16} /> Batal
            </button>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-white bg-[#0AC4E0] shadow-[#0AC4E0]/30 hover:bg-[#09b3cc] leading-none`}>
              <Save size={18} /> {loading ? "..." : "Simpan Update"}
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
      `}} />
    </PageWrapper>
  );
};

export default EditWilayah;