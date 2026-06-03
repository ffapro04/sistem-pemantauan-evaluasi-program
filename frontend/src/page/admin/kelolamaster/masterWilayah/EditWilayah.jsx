/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  XCircle,
  CheckCircle2,
  MapPin,
  Layers,
  Navigation,
  Save,
  Fingerprint,
  RefreshCcw,
  Globe2,
  Map,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Label from "../../../../components/Label";
import Input from "../../../../components/Input";
import PageWrapper from "../../../../components/PageWrapper";
import Dropdown from "../../../../components/Dropdown";
import Textarea from "../../../../components/Textarea";
import Button from "../../../../components/Button";

import {
  INDONESIA_PROVINCES,
  PROVINCE_OPTIONS,
  findProvinceByName,
} from "../../../../data/indonesiaProvinces";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const pinIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CORRECT_PATTERN = "1236";
const DEFAULT_PROVINCE = "Jawa Barat";

const normalizeKlasifikasi = (value) => {
  const raw = String(value || "").toLowerCase();

  if (
    raw.includes("independent") ||
    raw.includes("bukan") ||
    raw.includes("mandiri") ||
    raw.includes("non")
  ) {
    return "Independent";
  }

  return "Absolute";
};

const parseBounds = (bounds) => {
  if (!bounds) return null;

  if (Array.isArray(bounds)) return bounds;

  try {
    const parsed = JSON.parse(bounds);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};

const normalizeWilayah = (item) => {
  const namaWilayah =
    item?.nama_wilayah ||
    item?.namaWilayah ||
    item?.nama_provinsi ||
    item?.nama ||
    DEFAULT_PROVINCE;

  const matchedProvince =
    findProvinceByName(namaWilayah) ||
    findProvinceByName(DEFAULT_PROVINCE) ||
    INDONESIA_PROVINCES[0];

  return {
    provinsi: matchedProvince?.name || DEFAULT_PROVINCE,
    tipe_wilayah: normalizeKlasifikasi(
      item?.tipe_wilayah || item?.keterangan || item?.jenis_wilayah,
    ),
    deskripsi: item?.deskripsi || "",
    bounds: parseBounds(item?.bounds),
  };
};

function ProvinceMapController({ province }) {
  const map = useMap();

  useEffect(() => {
    if (!province) return;

    if (province.bounds) {
      map.fitBounds(province.bounds, {
        padding: [45, 45],
        animate: true,
        duration: 1,
      });

      return;
    }

    map.flyTo([province.latitude, province.longitude], 8, {
      animate: true,
      duration: 1,
    });
  }, [province, map]);

  return null;
}

const EditWilayah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePattern, setActivePattern] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);


  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const [formData, setFormData] = useState({
    provinsi: DEFAULT_PROVINCE,
    tipe_wilayah: "Absolute",
    deskripsi: "",
  });

  const klasifikasiOptions = [
    { value: "Absolute", label: "ABSOLUTE" },
    { value: "Independent", label: "INDEPENDENT" },
  ];

  const selectedProvince = useMemo(() => {
    return (
      findProvinceByName(formData.provinsi) ||
      findProvinceByName(DEFAULT_PROVINCE) ||
      INDONESIA_PROVINCES[0]
    );
  }, [formData.provinsi]);

  const setField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:3000/wilayah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = normalizeWilayah(res.data);
        setFormData(normalized);
      } catch (error) {
        setStatusNote({
          show: true,
          type: "error",
          message: "Gagal mengambil data wilayah.",
        });

        setTimeout(() => navigate("/admin/wilayah"), 1200);
      } finally {
        setFetching(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

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
      setStatusNote({ show: false, type: null, message: "" });
      setActivePattern([]);
      return;
    }

    if (result.length > 0) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Akses ditolak. Pola otoritas tidak valid.",
      });

      setActivePattern([]);
    }
  };

  const validateForm = () => {
    if (!formData.provinsi) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Provinsi wajib dipilih.",
      });

      return false;
    }

    if (!selectedProvince) {
      setStatusNote({
        show: true,
        type: "error",
        message: "Data provinsi tidak ditemukan pada master provinsi.",
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const klasifikasi = normalizeKlasifikasi(formData.tipe_wilayah);

      const payload = {
        kode_wilayah: selectedProvince.code,
        nama_wilayah: selectedProvince.name,

        tipe_wilayah: klasifikasi,
        jenis_wilayah: "PROVINSI",

        deskripsi: formData.deskripsi || "",

        latitude: Number(selectedProvince.latitude),
        longitude: Number(selectedProvince.longitude),

        luas_wilayah: selectedProvince.luasWilayah,
        letak_geografis: selectedProvince.letakGeografis,
        letak_astronomis: selectedProvince.letakAstronomis,
        bounds: selectedProvince.bounds,
      };

      await axios.patch(`http://localhost:3000/wilayah/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusNote({
        show: true,
        type: "success",
        message: "Data wilayah berhasil diperbarui.",
      });

      setTimeout(() => navigate("/admin/wilayah"), 1500);
    } catch (error) {
      setStatusNote({
        show: true,
        type: "error",
        message:
          error.response?.data?.message || "Gagal memperbarui data wilayah.",
      });
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = [
    Number(selectedProvince?.latitude) || -2.548926,
    Number(selectedProvince?.longitude) || 118.0148634,
  ];

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <RefreshCcw className="animate-spin text-[#0AC4E0]" size={40} />
      </div>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
      <Sidebar />

      <main
        className="relative flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10"
        onMouseUp={handleEnd}
      >
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ y: -1000, filter: "blur(40px)", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[300] flex flex-col items-center justify-center bg-slate-900/80 text-white backdrop-blur-3xl"
            >
              <div className="mb-16 text-center leading-none">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl">
                  <Fingerprint size={40} className="text-[#0AC4E0]" />
                </div>

                <h2 className="mb-2 text-3xl font-black uppercase leading-none tracking-tighter">
                  Akses Keamanan
                </h2>

                <p className="text-sm leading-none text-slate-400">
                  Tarik pola otoritas untuk mengedit data wilayah
                </p>
              </div>

              <div className="relative select-none rounded-[3rem] border border-white/10 bg-white/5 p-10">
                <div className="grid grid-cols-3 gap-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      onMouseDown={() => handleStart(num)}
                      onMouseEnter={() => handleEnter(num)}
                      className="relative flex h-12 w-12 cursor-pointer items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          scale: activePattern.includes(num) ? 1.5 : 1,
                          backgroundColor: activePattern.includes(num)
                            ? "#0AC4E0"
                            : "rgba(255,255,255,0.2)",
                        }}
                        className="h-4 w-4 rounded-full shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/admin/wilayah")}
                className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 transition-all hover:text-white"
              >
                Batalkan Perubahan
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {statusNote.show && (
            <motion.div
              initial={{
                x: statusNote.type === "error" ? -100 : 100,
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: statusNote.type === "error" ? -100 : 100,
                opacity: 0,
              }}
              className={`fixed ${statusNote.type === "error" ? "left-[320px]" : "right-12"
                } top-[45%] z-[350] w-72`}
            >
              <div className="rounded-[3rem] border border-slate-200 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div
                  className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${statusNote.type === "error"
                    ? "bg-rose-500 shadow-rose-200"
                    : "bg-emerald-500 shadow-emerald-200"
                    }`}
                >
                  {statusNote.type === "error" ? (
                    <XCircle size={28} />
                  ) : (
                    <CheckCircle2 size={28} />
                  )}
                </div>

                <h4
                  className={`mb-3 text-[10px] font-black uppercase tracking-widest ${statusNote.type === "error"
                    ? "text-rose-600"
                    : "text-emerald-600"
                    }`}
                >
                  {statusNote.type === "error" ? "Akses Ditolak" : "Berhasil"}
                </h4>

                <p className="mb-8 text-xs font-bold leading-relaxed text-slate-700">
                  {statusNote.message}
                </p>

                <button
                  onClick={() => setStatusNote({ ...statusNote, show: false })}
                  className={`w-full rounded-2xl py-4 text-[10px] font-black uppercase transition-all active:scale-95 ${statusNote.type === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                    }`}
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 shadow-2xl">
          <div className="shrink-0 px-10 pb-6 pt-8">
            <header className="flex items-center justify-between">
              <div>
                <Label
                  text="Sistem Pemantauan Program"
                  className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                />

                <h1 className="text-xl font-black uppercase text-gray-800">
                  Edit Data <span className="text-[#0AC4E0]">Wilayah</span>
                </h1>
              </div>

              <Button
                text="Kembali"
                icon={<ChevronLeft size={14} />}
                onClick={() => navigate("/admin/wilayah")}
                className="!rounded-full !border !border-slate-100 !bg-white !px-6 !py-2.5 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
              />
            </header>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden border-t border-gray-100 lg:grid-cols-[40%_60%]"
          >
            <div className="no-scrollbar overflow-y-auto px-10 py-7 pb-10">
              <div className="space-y-5">
                <div className="rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                      <Globe2 size={21} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Data Wilayah Provinsi
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Ubah provinsi berdasarkan data master Indonesia.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Pilih Provinsi"
                      required
                      className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />

                    <Dropdown
                      icon={MapPin}
                      value={formData.provinsi}
                      items={PROVINCE_OPTIONS}
                      onChange={(value) => setField("provinsi", value)}
                      className="!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                    <Label
                      text="Nama Provinsi"
                      className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />

                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#0AC4E0]" />

                      <span className="text-[11px] font-black uppercase text-gray-800">
                        {selectedProvince?.name || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                    <Label
                      text="Kode Wilayah"
                      className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />

                    <div className="flex items-center gap-2">
                      <Navigation size={15} className="text-[#0AC4E0]" />

                      <span className="text-[11px] font-black uppercase text-gray-800">
                        {selectedProvince?.code || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Klasifikasi Wilayah"
                    required
                    className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                  />

                  <Dropdown
                    icon={Layers}
                    value={formData.tipe_wilayah}
                    items={klasifikasiOptions}
                    onChange={(value) =>
                      setField("tipe_wilayah", normalizeKlasifikasi(value))
                    }
                    className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                  />
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                      <Map size={19} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        Informasi Geografis
                      </p>

                      <p className="text-[9px] font-bold text-gray-400">
                        Data otomatis mengikuti provinsi yang dipilih.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label
                        text="Letak Geografis"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <p className="text-[11px] font-bold leading-relaxed text-gray-600">
                        {selectedProvince?.letakGeografis || "—"}
                      </p>
                    </div>

                    <div>
                      <Label
                        text="Letak Astronomis"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <p className="text-[11px] font-bold leading-relaxed text-gray-600">
                        {selectedProvince?.letakAstronomis || "—"}
                      </p>
                    </div>

                    <div>
                      <Label
                        text="Luas Wilayah"
                        className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                      />

                      <p className="text-[13px] font-black text-gray-800">
                        {selectedProvince?.luasWilayah || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    text="Deskripsi Opsional"
                    className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                  />

                  <Textarea
                    value={formData.deskripsi}
                    onChange={(e) => setField("deskripsi", e.target.value)}
                    placeholder="Tambahkan deskripsi khusus jika diperlukan..."
                    className="!min-h-[110px] !rounded-xl !bg-gray-50/50 !p-4 !text-[11px] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-5 border-l border-gray-100 p-7">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    text="Province Map"
                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                  />

                  <h2 className="text-lg font-black uppercase text-gray-800">
                    Peta Provinsi Terpilih
                  </h2>
                </div>

                <div className="rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                  <Navigation size={12} className="mr-2 inline" />
                  Auto Focus
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm">
                <MapContainer
                  center={mapCenter}
                  zoom={6}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <ProvinceMapController province={selectedProvince} />

                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {selectedProvince && (
                    <Marker
                      position={[
                        selectedProvince.latitude,
                        selectedProvince.longitude,
                      ]}
                      icon={pinIcon}
                    >
                      <Popup>
                        <div className="text-[10px] font-black uppercase text-[#0AC4E0]">
                          {selectedProvince.name}
                        </div>

                        <div className="mt-1 text-[10px] font-bold text-gray-500">
                          {selectedProvince.region}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>

                <div className="pointer-events-none absolute bottom-5 left-5 z-[500] max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
                  <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Selected Province
                  </p>

                  <p className="text-xl font-black uppercase leading-none tracking-tight text-slate-800">
                    {selectedProvince?.name || "—"}
                  </p>

                  <p className="mt-2 text-[10px] font-bold leading-relaxed text-slate-400">
                    {selectedProvince?.region || "—"}
                  </p>

                  <p className="mt-3 font-mono text-[10px] font-black text-slate-500">
                    {Number(selectedProvince?.latitude).toFixed(6)},{" "}
                    {Number(selectedProvince?.longitude).toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                <Button
                  text="Batal"
                  icon={<ChevronLeft size={14} />}
                  onClick={() => navigate("/admin/wilayah")}
                  className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                />

                <Button
                  text={loading ? "Menyimpan..." : "Simpan Perubahan"}
                  icon={<Save size={15} />}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                />
              </div>
            </div>
          </form>
        </Card>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .leaflet-container { z-index: 1 !important; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </PageWrapper>
  );
};

export default EditWilayah;