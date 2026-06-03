/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Edit3,
  Layers,
  Globe2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlignLeft,
  Navigation,
  Map,
  Ruler,
  Compass,
  LocateFixed,
  Database,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../../../../components/Sidebar";
import PageWrapper from "../../../../components/PageWrapper";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Label from "../../../../components/Label";

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
    "Wilayah Tidak Diketahui";

  return {
    ...item,
    id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
    kode_wilayah:
      item?.kode_wilayah || item?.kodeWilayah || item?.kode_provinsi || "—",
    nama_wilayah: namaWilayah,
    tipe_wilayah: normalizeKlasifikasi(
      item?.tipe_wilayah || item?.keterangan || item?.jenis_wilayah,
    ),
    jenis_wilayah: item?.jenis_wilayah || "PROVINSI",
    deskripsi: item?.deskripsi || "",
    luas_wilayah: item?.luas_wilayah || item?.luasWilayah || "—",
    letak_geografis:
      item?.letak_geografis || item?.letakGeografis || "Belum tersedia.",
    letak_astronomis:
      item?.letak_astronomis || item?.letakAstronomis || "Belum tersedia.",
    latitude: item?.latitude ?? item?.lat ?? null,
    longitude: item?.longitude ?? item?.lng ?? item?.lon ?? null,
    bounds: parseBounds(item?.bounds),
    status: item?.status ?? true,
  };
};

function ProvinceMapController({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    if (data.bounds) {
      map.fitBounds(data.bounds, {
        padding: [45, 45],
        animate: true,
        duration: 1,
      });

      return;
    }

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], 8, {
        animate: true,
        duration: 1,
      });
    }
  }, [data, map]);

  return null;
}

const DetailInfoCard = ({ icon, label, value, accent = "blue" }) => {
  const accentClass =
    accent === "purple"
      ? "text-purple-600 bg-purple-50"
      : accent === "emerald"
        ? "text-emerald-600 bg-emerald-50"
        : "text-[#0AC4E0] bg-[#0AC4E0]/10";

  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClass}`}
        >
          {icon}
        </div>

        <Label
          text={label}
          className="!m-0 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
        />
      </div>

      <p className="text-[12px] font-bold leading-relaxed text-gray-700">
        {value || "—"}
      </p>
    </div>
  );
};

const DetailWilayah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusNote, setStatusNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:3000/wilayah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(normalizeWilayah(res.data));
      } catch (err) {
        Swal.fire("Error", "Gagal mengambil detail wilayah", "error");
        navigate("/admin/wilayah");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  const klasifikasi = normalizeKlasifikasi(data?.tipe_wilayah);
  const isIndependent = klasifikasi === "Independent";

  const lat = Number(data?.latitude);
  const lng = Number(data?.longitude);
  const isValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const mapCenter = useMemo(() => {
    if (isValidCoords) return [lat, lng];
    return [-2.548926, 118.0148634];
  }, [isValidCoords, lat, lng]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
      </div>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
      <Sidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
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
                } top-[45%] z-[250] w-72`}
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
                  {statusNote.type === "error" ? "Sistem Alert" : "Berhasil"}
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
                  Detail Data <span className="text-[#0AC4E0]">Wilayah</span>
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

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden border-t border-gray-100 lg:grid-cols-[42%_58%]">
            <div className="no-scrollbar overflow-y-auto px-10 py-7">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                  <MapPin size={28} />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                      <Globe2 size={10} />
                      {data?.jenis_wilayah || "PROVINSI"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isIndependent
                        ? "border-purple-100 bg-purple-50 text-purple-600"
                        : "border-[#0AC4E0]/10 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                        }`}
                    >
                      <Layers size={10} />
                      {klasifikasi}
                    </span>
                  </div>

                  <h2 className="truncate text-3xl font-black uppercase leading-none tracking-tighter text-gray-900">
                    {data?.nama_wilayah || "—"}
                  </h2>

                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Kode Wilayah: {data?.kode_wilayah || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <DetailInfoCard
                    icon={<Database size={18} />}
                    label="Nama Provinsi"
                    value={data?.nama_wilayah}
                  />

                  <DetailInfoCard
                    icon={<Layers size={18} />}
                    label="Klasifikasi Wilayah"
                    value={klasifikasi}
                    accent={isIndependent ? "purple" : "blue"}
                  />
                </div>

                <DetailInfoCard
                  icon={<Compass size={18} />}
                  label="Letak Geografis"
                  value={data?.letak_geografis}
                />

                <DetailInfoCard
                  icon={<LocateFixed size={18} />}
                  label="Letak Astronomis"
                  value={data?.letak_astronomis}
                />

                <DetailInfoCard
                  icon={<Ruler size={18} />}
                  label="Luas Wilayah"
                  value={data?.luas_wilayah}
                  accent="emerald"
                />

                <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                      <AlignLeft size={18} />
                    </div>

                    <Label
                      text="Deskripsi Opsional"
                      className="!m-0 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                    />
                  </div>

                  <p className="text-[12px] font-bold leading-relaxed text-gray-600">
                    {data?.deskripsi ||
                      "Belum ada deskripsi khusus untuk wilayah ini."}
                  </p>
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
                    Peta Wilayah Provinsi
                  </h2>
                </div>

                <div className="rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                  <Navigation size={12} className="mr-2 inline" />
                  Auto Focus
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm">
                {isValidCoords ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={6}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                  >
                    <ProvinceMapController data={data} />

                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker position={[lat, lng]} icon={pinIcon}>
                      <Popup>
                        <div className="text-[10px] font-black uppercase text-[#0AC4E0]">
                          {data?.nama_wilayah}
                        </div>

                        <div className="mt-1 text-[10px] font-bold text-gray-500">
                          {data?.kode_wilayah || "Kode wilayah belum tersedia"}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-gray-300">
                      <MapPin size={46} strokeWidth={1.5} />

                      <p className="mt-4 text-[10px] font-black uppercase tracking-widest">
                        Koordinat belum tersedia
                      </p>

                      <p className="mt-2 text-[10px] font-bold text-gray-300">
                        Edit wilayah untuk menambahkan titik lokasi.
                      </p>
                  </div>
                )}

                {isValidCoords && (
                  <div className="pointer-events-none absolute bottom-5 left-5 z-[500] max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Selected Province
                    </p>

                    <p className="text-xl font-black uppercase leading-none tracking-tight text-slate-800">
                      {data?.nama_wilayah || "—"}
                    </p>

                    <p className="mt-2 text-[10px] font-bold leading-relaxed text-slate-400">
                      {data?.luas_wilayah || "Luas wilayah belum tersedia"}
                    </p>

                    <p className="mt-3 font-mono text-[10px] font-black text-slate-500">
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                <Button
                  text="Kembali"
                  icon={<ChevronLeft size={14} />}
                  onClick={() => navigate("/admin/wilayah")}
                  className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                />

                <Button
                  text="Edit Data"
                  icon={<Edit3 size={15} />}
                  onClick={() => navigate(`/admin/wilayah/edit/${id}`)}
                  className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                />
              </div>
            </div>
          </div>
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

export default DetailWilayah;