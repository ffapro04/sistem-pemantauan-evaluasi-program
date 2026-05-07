/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Search as SearchIcon,
  Database,
  Layers,
  Navigation,
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

import Sidebar from "../../../../components/Sidebar";
import Button from "../../../../components/Button";
import Label from "../../../../components/Label";
import Input from "../../../../components/Input";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== -6.2) {
      map.flyTo(center, 16, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
}

const DEFAULT_LAT = -6.2;
const DEFAULT_LNG = 106.816666;

const CreateWilayah = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  const [formData, setFormData] = useState({
    nama_wilayah: "",
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    deskripsi: "",
    alamat_lengkap: "",
    tahun_awal_binaan: new Date().getFullYear(),
    status: true,
    tipe_wilayah: "Binaan",
    jenis_wilayah: "Absolute", // ✅ Default Absolute
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
      if (
        searchValue.length >= 3 &&
        !formData.nama_wilayah.includes(searchValue)
      ) {
        searchLocation(searchValue);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSelectLocation = async (loc) => {
    const { lat, lon, address, display_name } = loc;

    const prov = address.state || address.region || "";
    const kota = address.city || address.county || address.regency || "";
    const kec =
      address.city_district ||
      address.suburb ||
      address.municipality ||
      address.district ||
      "";

    let namaDetail =
      address.amenity ||
      address.village ||
      address.hamlet ||
      address.suburb ||
      address.road ||
      kec ||
      kota.replace("Kabupaten ", "").replace("Kota ", "");

    const formatNama = `Indonesia/${prov}/${kota}/${namaDetail}`
      .split("/")
      .filter(Boolean)
      .join("/");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/wilayah/check-name?nama=${encodeURIComponent(formatNama)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.isDuplicate) {
        Swal.fire({
          icon: "warning",
          title: "WILAYAH TERDUPLIKASI",
          text: `Area "${namaDetail}" sudah terdaftar di sistem.`,
          confirmButtonColor: "#1E5AA5",
        });
        return;
      }

      const deskripsiParts = [
        namaDetail,
        address.village || address.hamlet || "",
        kec,
        kota,
        prov,
      ].filter((val, index, self) => val && self.indexOf(val) === index);

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
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
      );
      const data = await res.json();
      if (data.address) handleSelectLocation(data);
    } catch (err) {
      console.error(err);
    }
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLocationSelected) {
      return Swal.fire({
        icon: "warning",
        title: "LOKASI BELUM DIPILIH",
        text: "Mohon pilih lokasi terlebih dahulu melalui kotak pencarian atau klik langsung di peta!",
        confirmButtonColor: "#1E5AA5",
      });
    }

    if (!formData.alamat_lengkap) {
      return Swal.fire({
        icon: "warning",
        title: "DATA TIDAK LENGKAP",
        text: "Mohon isi Alamat Lengkap spesifik wilayah!",
        confirmButtonColor: "#1E5AA5",
      });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ Tulis field satu per satu, jangan pakai ...formData
      const payload = {
        nama_wilayah: formData.nama_wilayah,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        deskripsi: formData.deskripsi,
        alamat_lengkap: formData.alamat_lengkap,
        tahun_awal_binaan: parseInt(formData.tahun_awal_binaan),
        status: formData.status,
        tipe_wilayah: formData.tipe_wilayah,
        jenis_wilayah: formData.jenis_wilayah,
      };

      await axios.post("http://localhost:3000/wilayah", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "BERHASIL",
        text: "Area Binaan Baru Telah Didaftarkan",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/admin/wilayah");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "GAGAL SIMPAN",
        text: error.response?.data?.message || "Kesalahan sistem",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <div className="flex-1 !m-0 !p-0 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {/* HEADER */}
          <div className="px-8 md:px-16 pt-10 pb-8 bg-[#1E5AA5] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => navigate("/admin/wilayah")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white hover:text-[#1E5AA5] transition-all border border-white/20"
              >
                <ArrowLeft size={16} strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  SET <span className="text-blue-200">AREA BINAAN</span>
                </h1>
                <p className="text-[8px] font-bold text-blue-100/70 tracking-widest uppercase italic mt-1.5">
                  Spatial Data Management & Geolocation System
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* MAP SIDE */}
            <div className="flex-[6] relative bg-gray-50 border-r border-gray-100 min-h-[300px]">
              <MapContainer
                center={[formData.latitude, formData.longitude]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView center={[formData.latitude, formData.longitude]} />
                <Marker position={[formData.latitude, formData.longitude]} />
                <MapEvents />
              </MapContainer>
              <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-xl border border-blue-100 flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${isLocationSelected ? "bg-emerald-500 animate-pulse" : "bg-orange-400 animate-pulse"}`}
                ></div>
                <span className="text-[9px] font-black text-[#1E5AA5] uppercase tracking-widest">
                  {isLocationSelected
                    ? "Lokasi Terpilih"
                    : "Belum Ada Lokasi Dipilih"}
                </span>
              </div>
            </div>

            {/* FORM SIDE */}
            <div className="flex-[4] flex flex-col h-full overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Banner peringatan */}
                  {!isLocationSelected && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-2xl">
                      <MapPin
                        size={14}
                        className="text-orange-500 shrink-0 mt-0.5"
                      />
                      <p className="text-[9px] font-bold text-orange-600 leading-relaxed">
                        Pilih lokasi terlebih dahulu dengan mengetik di kotak
                        pencarian, atau klik langsung pada peta.
                      </p>
                    </div>
                  )}

                  {/* Geo-Search */}
                  <div className="space-y-3" ref={dropdownRef}>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#1E5AA5] rounded-full"></div>
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Geo-Search
                      </h3>
                    </div>
                    <div className="relative">
                      <Label
                        text="Cari Lokasi / Alamat"
                        required
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black mb-1.5"
                      />
                      <div className="relative">
                        <Input
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder="Ketik wilayah (contoh: Banyumas)..."
                          className="!py-3.5 !pl-12 !bg-gray-50/50 !border-gray-200 !rounded-2xl font-bold"
                        />
                        <SearchIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E5AA5]"
                          size={15}
                        />
                      </div>
                      {showDropdown && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 z-[1001] bg-white border border-blue-100 rounded-2xl shadow-2xl mt-1 overflow-hidden border-t-4 border-t-[#1E5AA5]">
                          <ul className="max-h-[220px] overflow-y-auto custom-scrollbar">
                            {suggestions.map((suggestion, i) => (
                              <li
                                key={i}
                                onClick={() => handleSelectLocation(suggestion)}
                                className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 flex flex-col gap-0.5 transition-colors"
                              >
                                <span className="font-black text-[#1E5AA5] text-[10px] uppercase">
                                  {suggestion.display_name.split(",")[0]}
                                </span>
                                <span className="text-gray-400 text-[8px] truncate italic">
                                  {suggestion.display_name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Nama Wilayah */}
                    <div className="space-y-1.5">
                      <Label
                        text="Label Nama Wilayah"
                        className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                      />
                      <Input
                        value={
                          formData.nama_wilayah || "Pilih lokasi di peta..."
                        }
                        readOnly
                        className="!py-2.5 !bg-blue-50/30 !border-blue-100 !text-[#1E5AA5] !font-black !text-[10px] !rounded-xl"
                      />
                    </div>

                    {/* Tahun & Jenis */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          text="Tahun Awal Binaan"
                          className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                        />
                        <Input
                          type="number"
                          value={formData.tahun_awal_binaan}
                          onChange={(v) =>
                            setFormData({ ...formData, tahun_awal_binaan: v })
                          }
                          className="!py-2.5 !rounded-xl font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          text="Jenis Wilayah"
                          className="!text-[9px] text-[#1E5AA5] uppercase font-black"
                        />
                        {/* ✅ Dropdown jenis_wilayah ganti keterangan */}
                        <Dropdown
                          icon={Layers}
                          value={formData.jenis_wilayah}
                          onChange={(val) =>
                            setFormData({ ...formData, jenis_wilayah: val })
                          }
                          items={[
                            { value: "Absolute", label: "ABSOLUTE" },
                            { value: "Independent", label: "INDEPENDENT" },
                          ]}
                          className="!py-2.5 !rounded-xl font-black text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Alamat */}
                    <div className="space-y-1.5">
                      <Label
                        text="Alamat Lengkap Spesifik"
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
                        placeholder="Detail alamat: No, RT/RW, Kecamatan..."
                        className="!bg-white !border-gray-200 !rounded-2xl !text-[10px] font-bold shadow-sm"
                        rows={3}
                      />
                    </div>

                    {/* Koordinat */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex gap-3">
                      <Navigation
                        size={14}
                        className="text-[#1E5AA5] shrink-0 mt-0.5"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-gray-800 uppercase tracking-tight">
                          Geo-Reference
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 italic leading-tight">
                          {isLocationSelected
                            ? `${formData.latitude}, ${formData.longitude}`
                            : "Koordinat akan muncul setelah lokasi dipilih"}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* ACTION BAR */}
              <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <Button
                  text="BATALKAN"
                  onClick={() => navigate("/admin/wilayah")}
                  className="!px-8 !py-2.5 !bg-white !text-gray-400 !rounded-full !text-[9px] font-black border border-gray-200 active:scale-95 transition-all shadow-sm"
                />
                <Button
                  text={loading ? "SAVING..." : "SIMPAN AREA"}
                  icon={<Database size={14} />}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="!bg-[#2E5AA7] !text-white !px-10 !py-2.5 !rounded-full !text-[9px] font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all border-none"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default CreateWilayah;
