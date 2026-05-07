/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Lock,
  Database,
  Globe,
  MapPin,
  Layers,
  Info,
  Navigation,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

// IMPORT KOMPONEN UI PREMIUM
import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import Label from "../../../../components/Label";
import Input from "../../../../components/Input";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

// Fix icon Marker Leaflet agar muncul dengan benar
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function EditWilayah() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // 1. Ambil Data Wilayah dari Server
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/wilayah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setFormData({
          nama_wilayah: data.nama_wilayah || "",
          deskripsi: data.deskripsi || "",
          alamat_lengkap: data.alamat_lengkap || "",
          latitude: parseFloat(data.latitude) || -6.2,
          longitude: parseFloat(data.longitude) || 106.816666,
          keterangan: data.keterangan || "Absolute",
          tahun_awal_binaan: data.tahun_awal_binaan || "",
        });
      } catch (err) {
        Swal.fire("Error", "Gagal sinkronisasi data wilayah", "error");
        navigate("/admin/wilayah");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  // 2. Handle Submit Perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Update data yang diizinkan (Klasifikasi dan Alamat Spesifik)
      const payload = {
        keterangan: formData.keterangan,
        alamat_lengkap: formData.alamat_lengkap,
      };

      await axios.patch(`http://localhost:3000/wilayah/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "BERHASIL",
        text: "Konfigurasi Wilayah Telah Diperbarui!",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/wilayah");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "GAGAL",
        text: error.response?.data?.message || "Internal Server Error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF5FF]">
        <div className="flex flex-col items-center gap-4 text-[#1E5AA5]">
          <RefreshCw className="animate-spin" size={48} />
          <span className="font-black text-[10px] tracking-[0.3em] uppercase italic">
            Syncing Spatial Data...
          </span>
        </div>
      </div>
    );

  // Parsing nama wilayah untuk tampilan header (Ambil Kota/Kab)
  const cityLabel =
    formData.nama_wilayah.split("/").filter(Boolean).pop() || "Area";

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER BANNER - BIRU ASTRA */}
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/wilayah")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  MODIFIKASI{" "}
                  <span className="text-blue-200">WILAYAH {cityLabel}</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Regional Authority Synchronization System
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
            {/* LEFT SIDE: MAP (LOCKED VISUAL) */}
            <div className="flex-[6] relative bg-gray-50 border-r border-gray-100 min-h-[300px] opacity-90">
              <MapContainer
                key={`${formData.latitude}-${formData.longitude}`}
                center={[formData.latitude, formData.longitude]}
                zoom={12}
                dragging={false}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[formData.latitude, formData.longitude]} />
              </MapContainer>
              <div className="absolute top-6 right-6 z-[1000] bg-[#1E5AA5] text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 shadow-2xl border border-white/20 backdrop-blur-md">
                <Lock size={12} strokeWidth={3} /> Geo-Spatial Locked
              </div>
            </div>

            {/* RIGHT SIDE: FORM (EDITABLE) */}
            <div className="flex-[4] flex flex-col h-full overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Metadata Section (Locked) */}
                  <div className="space-y-6 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Metadata Wilayah
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Label Registrasi"
                        className="!text-[9px] text-gray-400 uppercase font-black"
                      />
                      <Input
                        value={formData.nama_wilayah}
                        disabled
                        className="!py-4 !pl-12 !bg-gray-50 !border-gray-100 !text-gray-400 !font-bold cursor-not-allowed !rounded-2xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          text="Area / Provinsi"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <Input
                          value={formData.deskripsi.split(",").pop()}
                          disabled
                          className="!py-3 !bg-gray-50 !text-gray-400 !font-bold !rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          text="Tahun Binaan"
                          className="!text-[9px] text-gray-400 uppercase font-black"
                        />
                        <Input
                          value={formData.tahun_awal_binaan}
                          disabled
                          className="!py-3 !bg-gray-50 !text-gray-400 !font-bold !rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration Section (Editable) */}
                  <div className="space-y-6 pt-10 border-t-2 border-dashed border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                      <h3 className="text-[10px] font-black uppercase text-[#1E5AA5] tracking-widest">
                        Update Configuration
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <Label
                        text="Status Independensi"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Dropdown
                        icon={Layers}
                        value={formData.keterangan}
                        onChange={(val) =>
                          setFormData({ ...formData, keterangan: val })
                        }
                        items={[
                          { value: "Absolute", label: "ABSOLUTE" },
                          { value: "Independent", label: "INDEPENDENT" },
                        ]}
                        className="!py-4 !rounded-2xl font-black text-gray-700 shadow-sm border-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        text="Alamat Lengkap (Spesifik)"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Textarea
                        value={formData.alamat_lengkap}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            alamat_lengkap: e.target.value,
                          })
                        }
                        placeholder="Detail alamat: No Rumah, RT/RW, Patokan..."
                        className="!bg-white !border-gray-200 !rounded-2xl !text-[10px] font-bold shadow-sm focus:!border-blue-400"
                        rows={4}
                      />
                    </div>

                    <div className="p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
                      <Info
                        size={18}
                        className="text-[#1E5AA5] shrink-0 mt-0.5"
                      />
                      <p className="text-[9px] text-blue-600/70 font-bold leading-relaxed italic">
                        Pembaruan alamat dan status independensi akan
                        memengaruhi laporan pemantauan berkala oleh Area
                        Officer.
                      </p>
                    </div>
                  </div>
                </form>
              </div>

              {/* ACTION BUTTONS - COMPACT CAPSULE */}
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0">
                <Button
                  text="KEMBALI"
                  onClick={() => navigate("/admin/wilayah")}
                  className="!bg-white !text-gray-400 !px-8 !py-2.5 !rounded-full !text-[9px] font-black border border-gray-200 uppercase tracking-widest shadow-sm active:scale-95"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN PERUBAHAN"}
                  icon={<Navigation size={14} />}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="!bg-[#2E5AA7] !text-white !px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all border-none uppercase tracking-widest"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
