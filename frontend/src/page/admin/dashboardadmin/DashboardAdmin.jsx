/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  Factory,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  School,
  UserCog,
  UsersRound,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const INDONESIA_CENTER = [-2.5, 118];
const DEFAULT_ZOOM = 5;
const PROVINCE_ZOOM = 7;
const SCHOOL_ZOOM = 12;
const ITEMS_PER_PAGE = 5;

const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function createProvinceMarkerIcon(totalSchools = 0, active = false) {
  const safeTotal = Number.isFinite(Number(totalSchools))
    ? Number(totalSchools)
    : 0;

  return L.divIcon({
    className: "admin-province-marker-wrapper",
    html: `
      <div class="admin-province-marker ${active ? "is-active" : ""}">
        <div class="admin-province-marker__pin">
          <span class="admin-province-marker__hole"></span>
        </div>
        <span class="admin-province-marker__count">${safeTotal}</span>
      </div>
    `,
    iconSize: [58, 72],
    iconAnchor: [29, 66],
    popupAnchor: [0, -60],
  });
}

function escapeMarkerText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createKabupatenMarkerIcon(name, totalSchools = 0, active = false) {
  const safeTotal = Number.isFinite(Number(totalSchools))
    ? Number(totalSchools)
    : 0;
  const safeName = escapeMarkerText(name || "Kabupaten");

  return L.divIcon({
    className: "admin-kabupaten-marker-wrapper",
    html: `
      <div class="admin-kabupaten-marker ${active ? "is-active" : ""}">
        <div class="admin-kabupaten-marker__dot">
          <span>${safeTotal}</span>
        </div>
        <span class="admin-kabupaten-marker__label">${safeName}</span>
      </div>
    `,
    iconSize: [168, 58],
    iconAnchor: [84, 34],
    popupAnchor: [0, -34],
  });
}

const WARNA = {
  cyan: "#0AC4E0",
  cyanTua: "#0891B2",
  biru: "#3B82F6",
  ungu: "#8B5CF6",
  pink: "#EC4899",
  merah: "#EF4444",
  amber: "#F59E0B",
  hijau: "#10B981",
  emerald: "#059669",
  indigo: "#6366F1",
  orange: "#F97316",
  slate: "#64748B",
};

const ROLE_LABEL = {
  1: "Admin",
  2: "Pengurus",
  3: "Head Office",
  4: "Area Officer",
  5: "Operator Sekolah",
  6: "Vendor",
  7: "Kepala Dinas",
  8: "Guru Assessment",
  9: "Operator Sekolah (Legacy)",
};

const ROLE_COLOR = {
  1: WARNA.slate,
  2: WARNA.cyan,
  3: WARNA.biru,
  4: WARNA.ungu,
  5: WARNA.hijau,
  6: WARNA.orange,
  7: WARNA.pink,
  8: WARNA.indigo,
  9: WARNA.amber,
};

const WARNA_DIAGRAM = [
  WARNA.cyan,
  WARNA.biru,
  WARNA.ungu,
  WARNA.pink,
  WARNA.hijau,
  WARNA.amber,
  WARNA.orange,
  WARNA.indigo,
  WARNA.merah,
  WARNA.slate,
];

const STATUS_FILTERS = [
  { label: "Semua", value: "SEMUA" },
  { label: "Aktif", value: "AKTIF" },
  { label: "Nonaktif", value: "NONAKTIF" },
];

const ROLE_FILTERS = [
  { label: "Semua Role", value: "SEMUA" },
  { label: "Admin", value: 1 },
  { label: "Pengurus", value: 2 },
  { label: "Head Office", value: 3 },
  { label: "Area Officer", value: 4 },
  { label: "Operator Sekolah", value: 5 },
  { label: "Vendor", value: 6 },
  { label: "Kepala Dinas", value: 7 },
  { label: "Guru Assessment", value: 8 },
  { label: "Operator Sekolah (Legacy)", value: 9 },
];

const HO_FILTERS = [
  { label: "Semua HO", value: "SEMUA", color: WARNA.slate },
  { label: "Akademik", value: "AKADEMIK", color: WARNA.biru },
  { label: "Non Akademik", value: "NON_AKADEMIK", color: WARNA.pink },
  { label: "Akademik SD/SMP", value: "AKADEMIK_SD_SMP", color: WARNA.hijau },
  { label: "Akademik SMK", value: "AKADEMIK_SMK", color: WARNA.ungu },
  { label: "Tanpa Keterangan", value: "TANPA", color: WARNA.amber },
];

const VENDOR_FILTERS = [
  { label: "Semua Vendor", value: "SEMUA", color: WARNA.slate },
  { label: "Akademik", value: "AKADEMIK", color: WARNA.biru },
  { label: "Non Akademik", value: "NON_AKADEMIK", color: WARNA.pink },
  { label: "Belum Diisi", value: "BELUM_DIISI", color: WARNA.amber },
];

const ASSIGNMENT_FILTERS = [
  { label: "Semua", value: "SEMUA", color: WARNA.slate },
  { label: "Sudah Dipetakan", value: "DIPETAKAN", color: WARNA.hijau },
  { label: "Belum Dipetakan", value: "BELUM_DIPETAKAN", color: WARNA.amber },
];

const OPERATOR_FILTERS = [
  { label: "Semua Sekolah", value: "SEMUA", color: WARNA.slate },
  { label: "Sudah Ada Operator", value: "SUDAH", color: WARNA.hijau },
  { label: "Belum Ada Operator", value: "BELUM", color: WARNA.amber },
];

const KOORDINAT_FALLBACK = [
  { keyword: "GUNUNGKIDUL", lat: -7.9646, lng: 110.6038 },
  { keyword: "BANTUL", lat: -7.8754, lng: 110.3253 },
  { keyword: "YOGYAKARTA", lat: -7.7956, lng: 110.3695 },
  { keyword: "DIY", lat: -7.7956, lng: 110.3695 },
  { keyword: "KUPANG", lat: -10.1772, lng: 123.607 },
  { keyword: "ROTE", lat: -10.7386, lng: 123.1239 },
  { keyword: "MANGGARAI", lat: -8.6207, lng: 120.4593 },
  { keyword: "SUMBA", lat: -9.6548, lng: 120.2641 },
  { keyword: "NUSA TENGGARA TIMUR", lat: -10.1772, lng: 123.607 },
  { keyword: "NTT", lat: -10.1772, lng: 123.607 },
  { keyword: "BOGOR", lat: -6.5971, lng: 106.806 },
  { keyword: "MAJALENGKA", lat: -6.8364, lng: 108.2277 },
  { keyword: "JAWA BARAT", lat: -6.9175, lng: 107.6191 },
  { keyword: "JABAR", lat: -6.9175, lng: 107.6191 },
  { keyword: "SERANG", lat: -6.1201, lng: 106.1503 },
  { keyword: "TANGERANG", lat: -6.1783, lng: 106.6319 },
  { keyword: "LEBAK", lat: -6.5636, lng: 106.2522 },
  { keyword: "BANTEN", lat: -6.4058, lng: 106.064 },
  { keyword: "LAMPUNG", lat: -5.45, lng: 105.2667 },
  { keyword: "PACITAN", lat: -8.2046, lng: 111.0871 },
  { keyword: "JAWA TIMUR", lat: -7.5361, lng: 112.2384 },
  { keyword: "KAPUAS", lat: -3.0091, lng: 114.3876 },
  { keyword: "BARITO", lat: -0.9587, lng: 114.9022 },
  { keyword: "KALIMANTAN TENGAH", lat: -1.6815, lng: 113.3824 },
  { keyword: "KUTAI BARAT", lat: -0.1378, lng: 115.094 },
  { keyword: "PENAJAM", lat: -1.2917, lng: 116.5137 },
  { keyword: "PPU", lat: -1.2917, lng: 116.5137 },
  { keyword: "KALIMANTAN TIMUR", lat: 0.5387, lng: 116.4194 },
  { keyword: "SERAM", lat: -3.1272, lng: 128.4008 },
  { keyword: "MALUKU", lat: -3.2385, lng: 130.1453 },
];

const KOORDINAT_PROVINSI = {
  ACEH: { lat: 4.6951, lng: 96.7494 },
  SUMATERA_UTARA: { lat: 2.1154, lng: 99.5451 },
  SUMATERA_BARAT: { lat: -0.7399, lng: 100.8 },
  RIAU: { lat: 0.2933, lng: 101.7068 },
  KEPULAUAN_RIAU: { lat: 3.9457, lng: 108.1429 },
  JAMBI: { lat: -1.6101, lng: 103.6131 },
  SUMATERA_SELATAN: { lat: -3.3194, lng: 103.9144 },
  KEPULAUAN_BANGKA_BELITUNG: { lat: -2.7411, lng: 106.4406 },
  BENGKULU: { lat: -3.7928, lng: 102.2608 },
  LAMPUNG: { lat: -4.5586, lng: 105.4068 },
  DKI_JAKARTA: { lat: -6.2088, lng: 106.8456 },
  BANTEN: { lat: -6.4058, lng: 106.064 },
  JAWA_BARAT: { lat: -6.9175, lng: 107.6191 },
  JAWA_TENGAH: { lat: -7.151, lng: 110.1403 },
  DI_YOGYAKARTA: { lat: -7.7956, lng: 110.3695 },
  JAWA_TIMUR: { lat: -7.5361, lng: 112.2384 },
  BALI: { lat: -8.3405, lng: 115.092 },
  NUSA_TENGGARA_BARAT: { lat: -8.6529, lng: 117.3616 },
  NUSA_TENGGARA_TIMUR: { lat: -8.6574, lng: 121.0794 },
  KALIMANTAN_BARAT: { lat: -0.2788, lng: 111.4753 },
  KALIMANTAN_TENGAH: { lat: -1.6815, lng: 113.3824 },
  KALIMANTAN_SELATAN: { lat: -3.0926, lng: 115.2838 },
  KALIMANTAN_TIMUR: { lat: 0.5387, lng: 116.4194 },
  KALIMANTAN_UTARA: { lat: 3.0731, lng: 116.0414 },
  SULAWESI_UTARA: { lat: 0.6247, lng: 123.975 },
  GORONTALO: { lat: 0.6999, lng: 122.4467 },
  SULAWESI_TENGAH: { lat: -1.43, lng: 121.4456 },
  SULAWESI_BARAT: { lat: -2.8441, lng: 119.2321 },
  SULAWESI_SELATAN: { lat: -3.6688, lng: 119.9741 },
  SULAWESI_TENGGARA: { lat: -4.1449, lng: 122.1746 },
  MALUKU: { lat: -3.2385, lng: 130.1453 },
  MALUKU_UTARA: { lat: 1.5709, lng: 127.8088 },
  PAPUA_BARAT: { lat: -1.3361, lng: 133.1747 },
  PAPUA_BARAT_DAYA: { lat: -1.1326, lng: 131.31 },
  PAPUA: { lat: -4.2699, lng: 138.0804 },
  PAPUA_SELATAN: { lat: -7.4761, lng: 139.89 },
  PAPUA_TENGAH: { lat: -3.6818, lng: 136.0321 },
  PAPUA_PEGUNUNGAN: { lat: -4.0836, lng: 138.945 },
};

function ambilArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.user)) return payload.user;
  if (Array.isArray(payload?.wilayah)) return payload.wilayah;
  if (Array.isArray(payload?.sekolah)) return payload.sekolah;
  if (Array.isArray(payload?.vendor)) return payload.vendor;
  if (Array.isArray(payload?.vendors)) return payload.vendors;
  if (Array.isArray(payload?.agenda)) return payload.agenda;
  if (Array.isArray(payload?.agendas)) return payload.agendas;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function ambilDataDenganFallback(endpointList, headers = {}) {
  for (const endpoint of endpointList) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      if (!response.ok) continue;

      const payload = await safeJson(response);
      return ambilArray(payload);
    } catch {
      // lanjut endpoint berikutnya
    }
  }

  return [];
}

function angka(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nilaiTampil(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      const text = value.trim();
      if (text && text !== "-" && text !== "-") return text;
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return "Belum Diisi";
}

function ambilEmail(item = {}) {
  return nilaiTampil(
    item?.email,
    item?.email_user,
    item?.email_login,
    item?.alamat_email,
    item?.kontak_email,
    item?.user?.email,
    item?.akun?.email,
  );
}

function ambilKontak(item = {}) {
  return nilaiTampil(
    item?.kontak,
    item?.no_telp,
    item?.nomor_telepon,
    item?.telepon,
    item?.phone,
    item?.whatsapp,
    item?.no_hp,
    item?.kontak_pj1,
    item?.kontak_pj,
    item?.email,
  );
}

function ambilJabatan(item = {}) {
  return nilaiTampil(
    item?.jabatan,
    item?.posisi,
    item?.position,
    item?.jenis,
    item?.sub_jenis,
    item?.subJenis,
    item?.bidang,
    item?.fokus_bidang,
  );
}

function ambilNpsn(sekolah = {}) {
  return nilaiTampil(
    sekolah?.npsn,
    sekolah?.NPSN,
    sekolah?.nomor_npsn,
    sekolah?.kode_sekolah,
  );
}

function normalisasiText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalisasiUpper(value) {
  return String(value || "").trim().toUpperCase();
}

function potongLabel(value, max = 24) {
  const text = String(value || "Belum Diisi");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function ambilTanggal(item) {
  return (
    item?.created_at ||
    item?.createdAt ||
    item?.updated_at ||
    item?.updatedAt ||
    item?.tanggal ||
    item?.tanggal_agenda ||
    item?.waktu_mulai ||
    null
  );
}

function ambilIdRole(user = {}) {
  return Number(
    user?.id_role ??
    user?.role_id ??
    user?.idRole ??
    user?.role?.id_role ??
    user?.role?.id ??
    0,
  );
}

function ambilNamaRole(user = {}) {
  const idRole = ambilIdRole(user);

  return nilaiTampil(
    user?.role?.nama_role,
    user?.role?.nama,
    user?.nama_role,
    user?.role_name,
    ROLE_LABEL[idRole],
    typeof user?.role === "string" ? user.role : null,
    "Tanpa Role",
  );
}

function ambilNamaUser(user = {}) {
  return nilaiTampil(
    user?.nama,
    user?.nama_lengkap,
    user?.full_name,
    user?.name,
    user?.username,
    user?.email,
  );
}

function ambilIdSekolah(sekolah) {
  return (
    sekolah?.id_sekolah ??
    sekolah?.idSekolah ??
    sekolah?.sekolah_id ??
    sekolah?.school_id ??
    sekolah?.id ??
    null
  );
}

function ambilNamaSekolah(sekolah = {}) {
  return nilaiTampil(
    sekolah?.nama_sekolah,
    sekolah?.namaSekolah,
    sekolah?.school_name,
    sekolah?.sekolah,
    sekolah?.nama,
    sekolah?.name,
  );
}

function ambilNamaVendor(vendor = {}) {
  return nilaiTampil(
    vendor?.nama_vendor,
    vendor?.namaVendor,
    vendor?.vendor_name,
    vendor?.nama_badan_usaha,
    vendor?.nama,
    vendor?.name,
  );
}

function ambilNamaWilayah(item = {}) {
  const directStringValues = [
    item?.nama_wilayah_penugasan,
    item?.nama_wilayah_binaan,
    item?.nama_wilayah_tugas,
    item?.nama_wilayah_kerja,
    item?.nama_area_penugasan,
    item?.nama_area,
    item?.nama_wilayah,
    item?.nama_kabupaten,
    item?.nama_provinsi,
    typeof item?.wilayah_penugasan === "string"
      ? item.wilayah_penugasan
      : null,
    typeof item?.wilayah_binaan === "string"
      ? item.wilayah_binaan
      : null,
    typeof item?.wilayah_tugas === "string" ? item.wilayah_tugas : null,
    typeof item?.wilayah_kerja === "string" ? item.wilayah_kerja : null,
    typeof item?.kabupaten === "string" ? item.kabupaten : null,
    typeof item?.provinsi === "string" ? item.provinsi : null,
    typeof item?.area === "string" ? item.area : null,
    item?.alamat_wilayah,
    item?.region,
    item?.region_name,
    item?.location,
  ];

  return nilaiTampil(
    item?.wilayah_penugasan?.nama_wilayah,
    item?.wilayahPenugasan?.nama_wilayah,
    item?.wilayah_binaan?.nama_wilayah,
    item?.wilayahBinaan?.nama_wilayah,
    item?.wilayah_tugas?.nama_wilayah,
    item?.wilayahTugas?.nama_wilayah,
    item?.wilayah_kerja?.nama_wilayah,
    item?.wilayahKerja?.nama_wilayah,
    item?.area_penugasan?.nama_wilayah,
    item?.areaPenugasan?.nama_wilayah,
    item?.area?.nama_wilayah,
    item?.wilayah?.nama_wilayah,
    item?.wilayah_penugasan?.nama,
    item?.wilayahPenugasan?.nama,
    item?.wilayah_binaan?.nama,
    item?.wilayahBinaan?.nama,
    item?.wilayah_tugas?.nama,
    item?.wilayahTugas?.nama,
    item?.wilayah_kerja?.nama,
    item?.wilayahKerja?.nama,
    item?.area_penugasan?.nama,
    item?.areaPenugasan?.nama,
    item?.area?.nama,
    item?.wilayah?.nama,
    ...directStringValues,
    "Belum Dipetakan",
  );
}

function ambilIdWilayah(item) {
  return (
    item?.id_wilayah_penugasan ||
    item?.id_wilayah_binaan ||
    item?.id_wilayah_tugas ||
    item?.id_wilayah_kerja ||
    item?.wilayah_penugasan_id ||
    item?.wilayah_binaan_id ||
    item?.wilayah_tugas_id ||
    item?.wilayah_kerja_id ||
    (typeof item?.wilayah_penugasan !== "object" ? item?.wilayah_penugasan : null) ||
    (typeof item?.wilayah_binaan !== "object" ? item?.wilayah_binaan : null) ||
    (typeof item?.wilayah_tugas !== "object" ? item?.wilayah_tugas : null) ||
    (typeof item?.wilayah_kerja !== "object" ? item?.wilayah_kerja : null) ||
    item?.id_area_penugasan ||
    item?.area_penugasan_id ||
    item?.id_area ||
    item?.area_id ||
    item?.id_wilayah ||
    item?.wilayah_id ||
    item?.id_kabupaten ||
    item?.id_provinsi ||
    item?.wilayah_penugasan?.id_wilayah ||
    item?.wilayahPenugasan?.id_wilayah ||
    item?.wilayah_binaan?.id_wilayah ||
    item?.wilayahBinaan?.id_wilayah ||
    item?.wilayah_tugas?.id_wilayah ||
    item?.wilayahTugas?.id_wilayah ||
    item?.wilayah_kerja?.id_wilayah ||
    item?.wilayahKerja?.id_wilayah ||
    item?.area_penugasan?.id_wilayah ||
    item?.areaPenugasan?.id_wilayah ||
    item?.area?.id_wilayah ||
    item?.wilayah?.id_wilayah ||
    item?.wilayah_penugasan?.id ||
    item?.wilayahPenugasan?.id ||
    item?.wilayah_binaan?.id ||
    item?.wilayahBinaan?.id ||
    item?.wilayah_tugas?.id ||
    item?.wilayahTugas?.id ||
    item?.wilayah_kerja?.id ||
    item?.wilayahKerja?.id ||
    item?.area_penugasan?.id ||
    item?.areaPenugasan?.id ||
    item?.area?.id ||
    item?.wilayah?.id ||
    null
  );
}

function nilaiArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function ambilIdDariWilayahObject(value) {
  if (!value || typeof value !== "object") return null;

  return (
    value?.id_wilayah ||
    value?.id ||
    value?.wilayah_id ||
    value?.id_area ||
    value?.area_id ||
    null
  );
}

function ambilNamaDariWilayahObject(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (typeof value !== "object") return null;

  return (
    value?.nama_wilayah ||
    value?.nama ||
    value?.name ||
    value?.label ||
    value?.nama_area ||
    value?.area ||
    value?.kabupaten ||
    value?.provinsi ||
    null
  );
}

function collectWilayahIds(item = {}) {
  const rawValues = [
    item?.id_wilayah_penugasan,
    item?.id_wilayah_binaan,
    item?.id_wilayah_tugas,
    item?.id_wilayah_kerja,
    item?.wilayah_penugasan_id,
    item?.wilayah_binaan_id,
    item?.wilayah_tugas_id,
    item?.wilayah_kerja_id,
    item?.id_wilayah,
    item?.wilayah_id,
    item?.id_area_penugasan,
    item?.area_penugasan_id,
    item?.id_area,
    item?.area_id,
    item?.id_kabupaten,
    item?.id_provinsi,
    item?.wilayah_ids,
    item?.id_wilayahs,
    item?.wilayah_penugasan_ids,
    item?.wilayah_binaan_ids,
    item?.wilayah_tugas_ids,
    item?.wilayah_kerja_ids,
    item?.assigned_wilayah_ids,
    item?.assigned_area_ids,
    item?.area_ids,
    item?.wilayah?.id_wilayah,
    item?.wilayah?.id,
    item?.wilayah_penugasan,
    item?.wilayahPenugasan,
    item?.wilayah_binaan,
    item?.wilayahBinaan,
    item?.wilayah_tugas,
    item?.wilayahTugas,
    item?.wilayah_kerja,
    item?.wilayahKerja,
    item?.area_penugasan,
    item?.areaPenugasan,
    item?.area,
    item?.areas,
    item?.wilayahs,
    item?.wilayah_list,
    item?.wilayahList,
    item?.penugasan_wilayah,
    item?.penugasanWilayah,
  ];

  const ids = [];

  rawValues.forEach((value) => {
    nilaiArray(value).forEach((entry) => {
      if (!entry) return;

      if (typeof entry === "object") {
        const id = ambilIdDariWilayahObject(entry);
        if (id) ids.push(String(id));
        return;
      }

      const text = String(entry).trim();
      if (/^\d+$/.test(text)) ids.push(text);
    });
  });

  return [...new Set(ids)];
}

function collectWilayahNames(item = {}) {
  const rawValues = [
    item?.wilayah_penugasan,
    item?.wilayahPenugasan,
    item?.wilayah_binaan,
    item?.wilayahBinaan,
    item?.wilayah_tugas,
    item?.wilayahTugas,
    item?.wilayah_kerja,
    item?.wilayahKerja,
    item?.area_penugasan,
    item?.areaPenugasan,
    item?.area,
    item?.areas,
    item?.wilayahs,
    item?.wilayah_list,
    item?.wilayahList,
    item?.penugasan_wilayah,
    item?.penugasanWilayah,
    item?.wilayah,
    item?.nama_wilayah_penugasan,
    item?.nama_wilayah_binaan,
    item?.nama_wilayah_tugas,
    item?.nama_wilayah_kerja,
    item?.nama_area_penugasan,
    item?.nama_area,
    item?.nama_wilayah,
    item?.nama_kabupaten,
    item?.nama_provinsi,
    item?.kabupaten,
    item?.provinsi,
  ];

  const names = [];

  rawValues.forEach((value) => {
    nilaiArray(value).forEach((entry) => {
      if (!entry) return;

      const name = ambilNamaDariWilayahObject(entry);
      if (!name) return;

      const text = String(name).trim();
      if (!text || /^\d+$/.test(text)) return;
      names.push(text);
    });
  });

  return [...new Set(names)];
}

function ambilIdentityUser(user) {
  return String(
    user?.id_user ||
    user?.id ||
    user?.email ||
    user?.nama ||
    Math.random(),
  );
}

function mergeUsersWithRoleData(baseUsers = [], roleDataGroups = []) {
  const map = new Map();

  baseUsers.forEach((user) => {
    map.set(ambilIdentityUser(user), user);
  });

  roleDataGroups.forEach(({ roleId, data }) => {
    data.forEach((item) => {
      const normalized = { ...item, id_role: Number(item?.id_role || roleId) };
      const key = ambilIdentityUser(normalized);
      map.set(key, { ...(map.get(key) || {}), ...normalized });
    });
  });

  return Array.from(map.values());
}

function ambilIdentityVendor(vendor) {
  return String(
    vendor?.id_vendor ||
    vendor?.vendor_id ||
    vendor?.id ||
    normalisasiText(ambilNamaVendor(vendor)) ||
    Math.random(),
  );
}

function sameVendorSet(a = [], b = []) {
  if (!a.length || !b.length) return false;
  if (a.length !== b.length) return false;

  const aSet = new Set(a.map(ambilIdentityVendor));
  return b.every((item) => aSet.has(ambilIdentityVendor(item)));
}

function mergeVendorsWithCategoryHints(base = [], akademik = [], nonAkademik = []) {
  const map = new Map();
  const baseList = base || [];

  const useAkademikHint = akademik.length > 0 && (baseList.length === 0 || !sameVendorSet(akademik, baseList));
  const useNonAkademikHint = nonAkademik.length > 0 && (baseList.length === 0 || !sameVendorSet(nonAkademik, baseList));

  baseList.forEach((vendor) => {
    map.set(ambilIdentityVendor(vendor), vendor);
  });

  if (useAkademikHint) {
    akademik.forEach((vendor) => {
      const key = ambilIdentityVendor(vendor);
      map.set(key, {
        ...(map.get(key) || {}),
        ...vendor,
        _resolved_category: "AKADEMIK",
      });
    });
  }

  if (useNonAkademikHint) {
    nonAkademik.forEach((vendor) => {
      const key = ambilIdentityVendor(vendor);
      map.set(key, {
        ...(map.get(key) || {}),
        ...vendor,
        _resolved_category: "NON_AKADEMIK",
      });
    });
  }

  return Array.from(map.values());
}

function ambilIdentityProgram(program) {
  return String(
    program?.id_program ||
    program?.program_id ||
    program?.id ||
    program?.nama_program ||
    program?.nama ||
    Math.random(),
  );
}

function mergeProgramsWithCategoryHints(base = [], akademik = [], nonAkademik = []) {
  const map = new Map();

  base.forEach((program) => {
    map.set(ambilIdentityProgram(program), program);
  });

  akademik.forEach((program) => {
    const key = ambilIdentityProgram(program);
    map.set(key, {
      ...(map.get(key) || {}),
      ...program,
      _resolved_program_category: "AKADEMIK",
    });
  });

  nonAkademik.forEach((program) => {
    const key = ambilIdentityProgram(program);
    map.set(key, {
      ...(map.get(key) || {}),
      ...program,
      _resolved_program_category: "NON_AKADEMIK",
    });
  });

  return Array.from(map.values());
}

function ambilJenjangSekolah(sekolah = {}) {
  return nilaiTampil(
    sekolah?.jenjang,
    sekolah?.tingkat,
    sekolah?.level,
    sekolah?.jenis_sekolah,
    sekolah?.bentuk_pendidikan,
    sekolah?.school_level,
  ).toUpperCase();
}

function ambilJenisWilayah(wilayah) {
  const jenis = String(
    wilayah?.jenis_wilayah ||
    wilayah?.tipe_wilayah ||
    wilayah?.jenis ||
    wilayah?.tipe ||
    "",
  ).toUpperCase();

  if (jenis.includes("PROV")) return "Provinsi";
  if (jenis.includes("KAB")) return "Kabupaten/Kota";
  if (jenis.includes("KOTA")) return "Kabupaten/Kota";
  return jenis || "Tanpa Jenis";
}

function isProvinsi(wilayah) {
  return ambilJenisWilayah(wilayah) === "Provinsi";
}

function ambilStatus(item = {}) {
  return (
    item?.status ??
    item?.status_user ??
    item?.status_data ??
    item?.status_aktif ??
    item?.aktif ??
    item?.is_active ??
    item?.isActive ??
    null
  );
}

function isDataAktif(item) {
  const status = ambilStatus(item);

  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;

  const text = String(status ?? "").trim().toLowerCase();
  if (!text) return true;
  if (text === "1") return true;
  if (text === "0") return false;

  if (
    text.includes("non") ||
    text.includes("inactive") ||
    text.includes("tidak") ||
    text.includes("disabled") ||
    text.includes("false")
  ) {
    return false;
  }

  return true;
}

function sesuaiFilterStatus(item, filterAktif) {
  if (filterAktif === "SEMUA") return true;
  if (filterAktif === "AKTIF") return isDataAktif(item);
  if (filterAktif === "NONAKTIF") return !isDataAktif(item);
  return true;
}

function statusLabel(item) {
  return isDataAktif(item) ? "Aktif" : "Nonaktif";
}

function warnaStatus(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("aktif") && !text.includes("non")) return WARNA.hijau;
  if (text.includes("selesai")) return WARNA.cyanTua;
  if (text.includes("berjalan")) return WARNA.cyan;
  if (text.includes("jadwal") || text.includes("agenda")) return WARNA.amber;
  if (text.includes("non") || text.includes("batal")) return WARNA.merah;
  return WARNA.slate;
}

function getHOCategory(user) {
  const jenis = String(user?.jenis || user?.bidang || "").toLowerCase();
  const subJenis = String(user?.sub_jenis || user?.subJenis || "").toLowerCase();
  const jabatan = String(user?.jabatan || "").toLowerCase();
  const merged = `${jenis} ${subJenis} ${jabatan}`;

  if (merged.includes("non")) return "NON_AKADEMIK";
  if (merged.includes("smk")) return "AKADEMIK_SMK";
  if (merged.includes("sd") || merged.includes("smp")) return "AKADEMIK_SD_SMP";
  if (merged.includes("akademik")) return "AKADEMIK";
  return "TANPA";
}

function tampilHOCategory(value) {
  if (value === "NON_AKADEMIK") return "Non Akademik";
  if (value === "AKADEMIK_SMK") return "Akademik SMK";
  if (value === "AKADEMIK_SD_SMP") return "Akademik SD/SMP";
  if (value === "AKADEMIK") return "Akademik";
  return "Tanpa Keterangan";
}

function matchHOFilter(user, filter) {
  const category = getHOCategory(user);
  if (filter === "SEMUA") return true;
  if (filter === "AKADEMIK") return category.includes("AKADEMIK") && category !== "NON_AKADEMIK";
  return category === filter;
}

function normalisasiKategoriVendor(value) {
  const hasil = String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (hasil.includes("NON")) return "NON_AKADEMIK";
  if (hasil.includes("AKADEMIK")) return "AKADEMIK";
  return "BELUM_DIISI";
}

function getVendorCategory(vendor) {
  if (vendor?._resolved_category) return vendor._resolved_category;

  const raw =
    vendor?.kategori ||
    vendor?.kategori_vendor ||
    vendor?.kategori_program ||
    vendor?.jenis ||
    vendor?.jenis_vendor ||
    vendor?.tipe ||
    vendor?.tipe_vendor ||
    vendor?.bidang ||
    vendor?.spesialisasi ||
    vendor?.layanan ||
    vendor?.jenis_layanan ||
    "";
  return normalisasiKategoriVendor(raw);
}

function ambilIdVendor(vendor) {
  return vendor?.id_vendor || vendor?.vendor_id || vendor?.id || null;
}

function ambilKategoriProgram(program) {
  if (program?._resolved_program_category) return program._resolved_program_category;

  return normalisasiKategoriVendor(
    program?.kategori ||
    program?.kategori_program ||
    program?.jenis ||
    program?.tipe ||
    "",
  );
}

function programMemakaiVendor(program, vendor) {
  const idVendor = ambilIdVendor(vendor);
  const namaVendor = normalisasiText(ambilNamaVendor(vendor));

  const ids = [
    program?.id_vendor,
    program?.vendor_id,
    program?.vendor?.id_vendor,
    program?.vendor?.id,
    ...nilaiArray(program?.vendor_ids),
    ...nilaiArray(program?.vendorIds),
    ...nilaiArray(program?.id_vendors),
    ...nilaiArray(program?.vendors).map((item) => item?.id_vendor || item?.id || item),
  ]
    .filter(Boolean)
    .map(String);

  if (idVendor && ids.includes(String(idVendor))) return true;

  const namaProgramVendorList = [
    program?.vendor?.nama_vendor,
    program?.vendor?.nama,
    program?.nama_vendor,
    program?.vendor_name,
    ...nilaiArray(program?.vendors).map((item) => item?.nama_vendor || item?.nama || item?.name || item),
  ]
    .map(normalisasiText)
    .filter(Boolean);

  return Boolean(namaVendor && namaProgramVendorList.includes(namaVendor));
}

function inferVendorCategoryFromPrograms(vendor, programs = []) {
  const direct = getVendorCategory({ ...vendor, _resolved_category: null });
  if (direct !== "BELUM_DIISI") return direct;

  const matchedProgram = programs.find((program) => programMemakaiVendor(program, vendor));
  const inferred = matchedProgram ? ambilKategoriProgram(matchedProgram) : "BELUM_DIISI";

  return inferred || "BELUM_DIISI";
}

function tampilVendorCategory(value) {
  if (value === "AKADEMIK") return "Akademik";
  if (value === "NON_AKADEMIK") return "Non Akademik";
  return "Belum Diisi";
}

function kelompokkanData(data, ambilKey) {
  const map = {};

  data.forEach((item) => {
    const key = String(ambilKey(item) || "Tidak Diketahui").trim();
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, value], index) => ({
      name,
      value,
      color: WARNA_DIAGRAM[index % WARNA_DIAGRAM.length],
    }))
    .sort((a, b) => b.value - a.value);
}

function warnaKategori(name) {
  const text = normalisasiUpper(name);

  if (text.includes("SD/SMP")) return WARNA.hijau;
  if (text.includes("SMK")) return WARNA.ungu;
  if (text.includes("NON AKADEMIK")) return WARNA.pink;
  if (text === "AKADEMIK" || text.includes("AKADEMIK")) return WARNA.biru;
  if (text.includes("SUDAH")) return WARNA.hijau;
  if (text.includes("BELUM")) return WARNA.amber;
  if (text.includes("SD")) return WARNA.hijau;
  if (text.includes("SMP")) return WARNA.biru;
  if (text.includes("SMK")) return WARNA.ungu;
  if (text.includes("TANPA")) return WARNA.amber;

  return null;
}

function warnaDataKonsisten(data) {
  return data.map((item, index) => ({
    ...item,
    color: warnaKategori(item.name) || item.color || WARNA_DIAGRAM[index % WARNA_DIAGRAM.length],
  }));
}

function cocokSearch(item, keyword, fields = []) {
  if (!keyword) return true;

  const fieldText = fields
    .map((field) => {
      try {
        if (typeof field === "function") return field(item);
        return item?.[field];
      } catch {
        return "";
      }
    })
    .join(" ");

  const rawText = flattenSearchValue(item);

  return normalisasiText(`${rawText} ${fieldText}`).includes(
    normalisasiText(keyword),
  );
}

function buatWilayahMap(wilayahList) {
  const map = new Map();

  wilayahList.forEach((item) => {
    const id = item?.id_wilayah || item?.id;
    if (id) map.set(String(id), item);
  });

  return map;
}

function ambilNamaWilayahById(id, wilayahMap) {
  if (!id) return null;
  const wilayah = wilayahMap.get(String(id));
  return wilayah?.nama_wilayah || wilayah?.nama || null;
}

function resolveNamaWilayahUser(user, wilayahMap) {
  const ids = collectWilayahIds(user);
  const namesFromIds = ids
    .map((id) => ambilNamaWilayahById(id, wilayahMap))
    .filter(Boolean);

  const directNames = collectWilayahNames(user);

  const names = [...new Set([...namesFromIds, ...directNames])].filter(
    (name) => name && name !== "-",
  );

  if (names.length > 0) return names.join(", ");

  const id = ambilIdWilayah(user);
  const dariMap = ambilNamaWilayahById(id, wilayahMap);
  const direct = ambilNamaWilayah(user);

  return dariMap || (direct !== "-" ? direct : "Belum Dipetakan");
}

function resolveNamaWilayahSekolah(sekolah, wilayahMap) {
  const kabupaten = ambilKabupatenSekolah(sekolah, wilayahMap);
  if (kabupaten && kabupaten !== "Belum Dipetakan") return kabupaten;

  const id = ambilIdWilayah(sekolah);
  const dariMap = ambilNamaWilayahById(id, wilayahMap);
  const direct = ambilNamaWilayah(sekolah);

  return nilaiTampil(dariMap, direct, "Belum Dipetakan");
}

function ambilParentIdWilayah(wilayah = {}) {
  return (
    wilayah?.id_parent ??
    wilayah?.parent_id ??
    wilayah?.id_provinsi ??
    wilayah?.provinsi_id ??
    wilayah?.parent?.id_wilayah ??
    wilayah?.parent?.id ??
    wilayah?.provinsi?.id_wilayah ??
    wilayah?.provinsi?.id ??
    null
  );
}

function cariProvinsiInduk(wilayah, wilayahMap) {
  if (!wilayah) return null;
  if (isProvinsi(wilayah)) return wilayah;

  const visited = new Set();
  let current = wilayah;

  while (current && !isProvinsi(current)) {
    const currentId = current?.id_wilayah ?? current?.id;
    if (currentId) {
      const key = String(currentId);
      if (visited.has(key)) break;
      visited.add(key);
    }

    const parentObject = current?.parent || current?.provinsi;
    if (parentObject && typeof parentObject === "object") {
      if (isProvinsi(parentObject)) return parentObject;
      current = parentObject;
      continue;
    }

    const parentId = ambilParentIdWilayah(current);
    if (!parentId) break;

    current = wilayahMap.get(String(parentId)) || null;
  }

  return current && isProvinsi(current) ? current : null;
}

function ambilProvinsiDariWilayah(wilayah, wilayahMap) {
  const induk = cariProvinsiInduk(wilayah, wilayahMap);
  if (induk) {
    return nilaiTampil(induk?.nama_wilayah, induk?.nama);
  }

  return nilaiTampil(
    wilayah?.provinsi?.nama_wilayah,
    wilayah?.provinsi?.nama,
    wilayah?.parent?.nama_wilayah,
    wilayah?.parent?.nama,
    wilayah?.nama_provinsi,
    typeof wilayah?.provinsi === "string" ? wilayah.provinsi : null,
  );
}

function ambilIdKabupatenSekolah(sekolah = {}) {
  return (
    sekolah?.id_kabupaten ??
    sekolah?.kabupaten_id ??
    sekolah?.id_kota ??
    sekolah?.kota_id ??
    sekolah?.kabupaten?.id_wilayah ??
    sekolah?.kabupaten?.id ??
    null
  );
}

function ambilIdProvinsiSekolah(sekolah = {}) {
  return (
    sekolah?.id_provinsi ??
    sekolah?.provinsi_id ??
    sekolah?.provinsi?.id_wilayah ??
    sekolah?.provinsi?.id ??
    null
  );
}

function ambilProvinsiSekolah(sekolah, wilayahMap) {
  const directProvinsiId = ambilIdProvinsiSekolah(sekolah);
  const directProvinsi = directProvinsiId
    ? wilayahMap.get(String(directProvinsiId))
    : null;

  if (directProvinsi && isProvinsi(directProvinsi)) {
    return nilaiTampil(directProvinsi?.nama_wilayah, directProvinsi?.nama);
  }

  const kabupatenId = ambilIdKabupatenSekolah(sekolah);
  const wilayahKabupaten = kabupatenId
    ? wilayahMap.get(String(kabupatenId))
    : null;

  const wilayahUtama =
    sekolah?.wilayah ||
    wilayahKabupaten ||
    wilayahMap.get(String(ambilIdWilayah(sekolah))) ||
    null;

  if (wilayahUtama) {
    if (isProvinsi(wilayahUtama)) {
      return nilaiTampil(wilayahUtama?.nama_wilayah, wilayahUtama?.nama);
    }

    const provinsi = ambilProvinsiDariWilayah(wilayahUtama, wilayahMap);
    if (provinsi && provinsi !== "Belum Diisi") return provinsi;
  }

  return nilaiTampil(
    sekolah?.provinsi?.nama_wilayah,
    sekolah?.provinsi?.nama,
    sekolah?.nama_provinsi,
    typeof sekolah?.provinsi === "string" ? sekolah.provinsi : null,
    "Belum Dipetakan",
  );
}

function ambilKabupatenSekolah(sekolah, wilayahMap) {
  const directKabupatenId = ambilIdKabupatenSekolah(sekolah);
  const directKabupaten = directKabupatenId
    ? wilayahMap.get(String(directKabupatenId))
    : null;

  if (directKabupaten && !isProvinsi(directKabupaten)) {
    return nilaiTampil(directKabupaten?.nama_wilayah, directKabupaten?.nama);
  }

  const directName = nilaiTampil(
    sekolah?.kabupaten?.nama_wilayah,
    sekolah?.kabupaten?.nama,
    sekolah?.nama_kabupaten,
    typeof sekolah?.kabupaten === "string" ? sekolah.kabupaten : null,
    sekolah?.nama_kota,
  );

  if (directName !== "Belum Diisi") return directName;

  const wilayahUtama =
    sekolah?.wilayah ||
    wilayahMap.get(String(ambilIdWilayah(sekolah))) ||
    null;

  if (wilayahUtama && !isProvinsi(wilayahUtama)) {
    return nilaiTampil(wilayahUtama?.nama_wilayah, wilayahUtama?.nama);
  }

  return "Belum Dipetakan";
}

function isSekolahMasukWilayah(sekolah, selectedWilayah, wilayahMap) {
  if (!selectedWilayah) return true;

  const selectedId = selectedWilayah?.id_wilayah || selectedWilayah?.id;
  const selectedName = selectedWilayah?.nama_wilayah || selectedWilayah?.nama;

  if (!selectedId && !selectedName) return true;

  const sekolahWilayahId = ambilIdWilayah(sekolah);
  if (String(sekolahWilayahId) === String(selectedId)) return true;

  if (isProvinsi(selectedWilayah)) {
    const provinsiSekolah = ambilProvinsiSekolah(sekolah, wilayahMap);
    return normalisasiText(provinsiSekolah) === normalisasiText(selectedName);
  }

  const kabupatenSekolah = ambilKabupatenSekolah(sekolah, wilayahMap);
  return normalisasiText(kabupatenSekolah) === normalisasiText(selectedName);
}

function buildProvinsiKabupatenBinaanChart(wilayahList, schools, wilayahMap) {
  const mapProvinsi = {};

  wilayahList
    .filter((item) => isProvinsi(item))
    .forEach((provinsi) => {
      const nama = provinsi?.nama_wilayah || provinsi?.nama || "Tanpa Provinsi";
      mapProvinsi[nama] = {
        name: nama,
        kabupatenSet: new Set(),
        sekolah: 0,
      };
    });

  schools.forEach((sekolah) => {
    const provinsi = ambilProvinsiSekolah(sekolah, wilayahMap);
    const kabupaten = ambilKabupatenSekolah(sekolah, wilayahMap);

    if (!mapProvinsi[provinsi]) {
      mapProvinsi[provinsi] = {
        name: provinsi,
        kabupatenSet: new Set(),
        sekolah: 0,
      };
    }

    if (kabupaten && kabupaten !== "-") {
      mapProvinsi[provinsi].kabupatenSet.add(kabupaten);
    }

    mapProvinsi[provinsi].sekolah += 1;
  });

  return Object.values(mapProvinsi)
    .map((item, index) => ({
      name: item.name,
      value: item.kabupatenSet.size,
      sekolah: item.sekolah,
      color: WARNA_DIAGRAM[index % WARNA_DIAGRAM.length],
    }))
    .filter((item) => item.value > 0 || item.sekolah > 0)
    .sort((a, b) => b.value - a.value || b.sekolah - a.sekolah);
}


function kunciNamaProvinsi(value) {
  const raw = normalisasiUpper(value)
    .replaceAll(".", "")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .replace(/^PROVINSI\s+/, "")
    .trim();

  const aliases = {
    "NANGGROE ACEH DARUSSALAM": "ACEH",
    "DAERAH KHUSUS IBUKOTA JAKARTA": "DKI JAKARTA",
    JAKARTA: "DKI JAKARTA",
    "DAERAH ISTIMEWA YOGYAKARTA": "DI YOGYAKARTA",
    "D I YOGYAKARTA": "DI YOGYAKARTA",
    DIY: "DI YOGYAKARTA",
    NTB: "NUSA TENGGARA BARAT",
    NTT: "NUSA TENGGARA TIMUR",
    KALBAR: "KALIMANTAN BARAT",
    KALTENG: "KALIMANTAN TENGAH",
    KALSEL: "KALIMANTAN SELATAN",
    KALTIM: "KALIMANTAN TIMUR",
    KALTARA: "KALIMANTAN UTARA",
    SULUT: "SULAWESI UTARA",
    SULTENG: "SULAWESI TENGAH",
    SULSEL: "SULAWESI SELATAN",
    SULTRA: "SULAWESI TENGGARA",
    SULBAR: "SULAWESI BARAT",
  };

  return aliases[raw] || raw;
}

function ambilKoordinatProvinsi(provinsi, namaProvinsi) {
  const directLatitude =
    angka(provinsi?.latitude) ??
    angka(provinsi?.lat) ??
    angka(provinsi?.center_latitude) ??
    angka(provinsi?.center_lat);

  const directLongitude =
    angka(provinsi?.longitude) ??
    angka(provinsi?.lng) ??
    angka(provinsi?.long) ??
    angka(provinsi?.center_longitude) ??
    angka(provinsi?.center_lng);

  if (directLatitude !== null && directLongitude !== null) {
    return {
      latitude: directLatitude,
      longitude: directLongitude,
      source: "database",
    };
  }

  const key = kunciNamaProvinsi(namaProvinsi).replaceAll(" ", "_");
  const fallback = KOORDINAT_PROVINSI[key];

  if (!fallback) return null;

  return {
    latitude: fallback.lat,
    longitude: fallback.lng,
    source: "fallback",
  };
}

function buildProvinsiMarkerData(wilayahList, schools, wilayahMap) {
  const provinceRecords = wilayahList.filter((item) => isProvinsi(item));
  const provinceByName = new Map();

  provinceRecords.forEach((provinsi) => {
    const name = nilaiTampil(provinsi?.nama_wilayah, provinsi?.nama);
    if (name !== "Belum Diisi") {
      provinceByName.set(kunciNamaProvinsi(name), provinsi);
    }
  });

  const summaryMap = new Map();

  schools.forEach((school) => {
    const provinceName = ambilProvinsiSekolah(school, wilayahMap);
    const provinceKey = kunciNamaProvinsi(provinceName);

    if (
      !provinceKey ||
      provinceKey === "BELUM DIPETAKAN" ||
      provinceKey === "BELUM DIISI"
    ) {
      return;
    }

    const provinceRecord = provinceByName.get(provinceKey) || null;
    const kabupaten = ambilKabupatenSekolah(school, wilayahMap);

    if (!summaryMap.has(provinceKey)) {
      summaryMap.set(provinceKey, {
        key: provinceKey,
        name:
          nilaiTampil(
            provinceRecord?.nama_wilayah,
            provinceRecord?.nama,
            provinceName,
          ) || provinceName,
        wilayah: provinceRecord,
        kabupatenSet: new Set(),
        schools: [],
      });
    }

    const summary = summaryMap.get(provinceKey);
    summary.schools.push(school);

    if (
      kabupaten &&
      kabupaten !== "Belum Dipetakan" &&
      kabupaten !== "Belum Diisi"
    ) {
      summary.kabupatenSet.add(kabupaten);
    }
  });

  return Array.from(summaryMap.values())
    .map((summary, index) => {
      const coordinate = ambilKoordinatProvinsi(
        summary.wilayah,
        summary.name,
      );

      if (!coordinate) return null;

      const wilayah =
        summary.wilayah ||
        {
          nama_wilayah: summary.name,
          jenis_wilayah: "PROVINSI",
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        };

      return {
        ...summary,
        id:
          wilayah?.id_wilayah ??
          wilayah?.id ??
          summary.key,
        wilayah: {
          ...wilayah,
          nama_wilayah: nilaiTampil(
            wilayah?.nama_wilayah,
            wilayah?.nama,
            summary.name,
          ),
          jenis_wilayah: "PROVINSI",
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        },
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        coordinateSource: coordinate.source,
        totalSekolah: summary.schools.length,
        totalKabupaten: summary.kabupatenSet.size,
        kabupatenList: Array.from(summary.kabupatenSet).sort((a, b) =>
          String(a).localeCompare(String(b), "id"),
        ),
        color: WARNA.merah,
        order: index,
      };
    })
    .filter(Boolean)
    .filter((item) => item.totalSekolah > 0)
    .sort(
      (a, b) =>
        b.totalSekolah - a.totalSekolah ||
        b.totalKabupaten - a.totalKabupaten ||
        a.name.localeCompare(b.name, "id"),
    );
}

function ambilKoordinatFallback(text, index = 0) {
  const sumber = normalisasiUpper(text);
  const found = KOORDINAT_FALLBACK.find((item) =>
    sumber.includes(item.keyword),
  );

  if (!found) return null;

  const jitterLat = ((index % 7) - 3) * 0.012;
  const jitterLng = ((index % 5) - 2) * 0.012;

  return {
    latitude: found.lat + jitterLat,
    longitude: found.lng + jitterLng,
  };
}

function normalisasiWilayahUntukMap(wilayah) {
  return {
    ...wilayah,
    jenis_wilayah:
      wilayah?.jenis_wilayah ||
      wilayah?.tipe_wilayah ||
      wilayah?.jenis ||
      wilayah?.tipe ||
      "KABUPATEN",
  };
}

function normalisasiSekolahUntukMap(sekolah, index, wilayahMap) {
  const latitude =
    angka(sekolah?.latitude) ??
    angka(sekolah?.lat) ??
    angka(sekolah?.wilayah?.latitude) ??
    angka(sekolah?.wilayah?.lat);

  const longitude =
    angka(sekolah?.longitude) ??
    angka(sekolah?.lng) ??
    angka(sekolah?.long) ??
    angka(sekolah?.wilayah?.longitude) ??
    angka(sekolah?.wilayah?.lng) ??
    angka(sekolah?.wilayah?.long);

  if (latitude !== null && longitude !== null) {
    return {
      ...sekolah,
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
    };
  }

  const namaWilayah = resolveNamaWilayahSekolah(sekolah, wilayahMap);
  const provinsi = ambilProvinsiSekolah(sekolah, wilayahMap);
  const kabupaten = ambilKabupatenSekolah(sekolah, wilayahMap);

  const regionalFallback =
    ambilKoordinatFallback(
      `${ambilNamaSekolah(sekolah)} ${namaWilayah} ${kabupaten} ${provinsi}`,
      index,
    ) || ambilKoordinatProvinsi(null, provinsi);

  if (!regionalFallback) return sekolah;

  const jitterLat = ((index % 9) - 4) * 0.025;
  const jitterLng = ((index % 7) - 3) * 0.025;
  const fallbackLatitude = regionalFallback.latitude + jitterLat;
  const fallbackLongitude = regionalFallback.longitude + jitterLng;

  return {
    ...sekolah,
    latitude: fallbackLatitude,
    longitude: fallbackLongitude,
    lat: fallbackLatitude,
    lng: fallbackLongitude,
    koordinat_fallback: true,
  };
}

function TooltipDiagram({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
      {label && (
        <p className="mb-2 max-w-[240px] text-[10px] font-black uppercase tracking-widest text-slate-700">
          {label}
        </p>
      )}

      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    item?.payload?.color || item.color || item.fill,
                }}
              />
              <span className="text-[11px] font-bold text-slate-500">
                {item.name}
              </span>
            </div>

            <span className="text-[11px] font-black text-slate-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  subtitle,
  right,
  children,
  className = "",
  bodyClassName = "",
  hidden = false,
}) {
  if (hidden) return null;

  return (
    <section
      className={`overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || right) && (
        <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-slate-100 px-5">
          <div className="min-w-0">
            {title && (
              <h2 className="break-words whitespace-normal text-[16px] font-black tracking-tight text-slate-700">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-0.5 break-words whitespace-normal text-[11px] font-bold text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

function KartuAngka({ label, value, icon, active = false, helper, color }) {
  return (
    <div
      className="relative min-h-[112px] border-r border-slate-100 border-t-[3px] bg-white px-5 py-5 transition"
      style={{ borderTopColor: active ? color || WARNA.cyan : "transparent" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words whitespace-normal text-[11px] font-black text-slate-500">
            {label}
          </p>

          <h3 className="mt-2 text-[34px] font-black leading-none tracking-[-0.06em] text-slate-700">
            {value}
          </h3>

          {helper && (
            <p className="mt-2 break-words whitespace-normal text-[10px] font-bold text-slate-400">
              {helper}
            </p>
          )}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50"
          style={{ color: color || WARNA.cyan }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterButtonGroup({ options, value, onChange, dark = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => {
        const active = String(value) === String(item.value);
        const color = item.color || WARNA.cyan;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${active
              ? "text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]"
              }`}
            style={
              active
                ? {
                  backgroundColor: color,
                  borderColor: color,
                }
                : undefined
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: active ? "#ffffff" : color }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyChart({ icon, text }) {
  return (
    <div className="flex h-full min-h-[230px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
        {icon || <Database size={24} />}
      </div>

      <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
        {text}
      </p>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white"
      style={{ backgroundColor: warnaStatus(status) }}
    >
      {status || "Belum Diisi"}
    </span>
  );
}

function ChartBox({ children, height = "h-[280px]" }) {
  return (
    <div className={`${height} min-h-[240px] w-full min-w-0 overflow-hidden`}>
      {children}
    </div>
  );
}

function PieWithLegend({ data, emptyText, icon }) {
  if (!data || data.length === 0) {
    return <EmptyChart icon={icon} text={emptyText} />;
  }

  return (
    <div className="grid min-h-[285px] grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_190px]">
      <ChartBox height="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={104}
              paddingAngle={4}
              stroke="#ffffff"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color || WARNA_DIAGRAM[index % WARNA_DIAGRAM.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<TooltipDiagram />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartBox>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    item.color || WARNA_DIAGRAM[index % WARNA_DIAGRAM.length],
                }}
              />
              <span className="break-words whitespace-normal text-[10px] font-black uppercase text-slate-500">
                {item.name}
              </span>
            </span>

            <span className="text-[10px] font-black text-slate-700">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnBarMaster({ data, emptyText, icon, barName = "Total" }) {
  if (!data || data.length === 0) {
    return <EmptyChart icon={icon} text={emptyText} />;
  }

  return (
    <ChartBox height="h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={8}
          margin={{ top: 16, right: 20, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{
              fill: "#64748B",
              fontSize: 10,
              fontWeight: 800,
            }}
            axisLine={{ stroke: "#CBD5E1" }}
            tickLine={false}
            tickFormatter={(value) => potongLabel(value, 16)}
          />
          <YAxis
            allowDecimals={false}
            tick={{
              fill: "#94A3B8",
              fontSize: 11,
              fontWeight: 700,
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TooltipDiagram />} />
          <Bar dataKey="value" name={barName} radius={[6, 6, 0, 0]} barSize={34}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color || WARNA_DIAGRAM[index % WARNA_DIAGRAM.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

function flattenSearchValue(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => flattenSearchValue(item, seen)).join(" ");
  }

  if (typeof value === "object") {
    if (seen.has(value)) return "";
    seen.add(value);

    return Object.values(value)
      .map((item) => flattenSearchValue(item, seen))
      .join(" ");
  }

  return "";
}

function TableMini({
  columns,
  data,
  emptyText,
  maxHeight = "max-h-[330px]",
  itemsPerPage = 5,
  searchPlaceholder = "Cari data pada list ini...",
  getSearchText,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);

  const sourceData = Array.isArray(data) ? data : [];
  const normalizedSearch = normalisasiText(tableSearch);

  const filteredData = useMemo(() => {
    if (!normalizedSearch) return sourceData;

    return sourceData.filter((item) => {
      let customText = "";

      try {
        customText =
          typeof getSearchText === "function" ? getSearchText(item) : "";
      } catch {
        customText = "";
      }

      const rawText = flattenSearchValue(item);
      const columnText = columns
        .map((column) => {
          if (typeof column.searchValue === "function") {
            try {
              return column.searchValue(item);
            } catch {
              return "";
            }
          }

          return item?.[column.key];
        })
        .join(" ");

      return normalisasiText(`${rawText} ${columnText} ${customText}`).includes(
        normalizedSearch,
      );
    });
  }, [columns, getSearchText, normalizedSearch, sourceData]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage),
  );

  useEffect(() => {
    setTablePage(1);
  }, [normalizedSearch, sourceData]);

  useEffect(() => {
    if (tablePage > totalPages) {
      setTablePage(totalPages);
    }
  }, [tablePage, totalPages]);

  const startIndex = (tablePage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const startNumber = filteredData.length === 0 ? 0 : startIndex + 1;
  const endNumber = Math.min(startIndex + itemsPerPage, filteredData.length);

  return (
    <div className="flex min-h-[330px] flex-col">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[290px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
          />
          <input
            type="text"
            value={tableSearch}
            onChange={(event) => setTableSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[11px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:bg-white focus:ring-1 focus:ring-[#0AC4E0]/20"
          />
        </div>

        <div className="shrink-0 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
          {filteredData.length} Data
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <EmptyChart
            icon={<ClipboardList size={24} />}
            text={
              normalizedSearch
                ? "Data tidak ditemukan"
                : emptyText || "Belum ada data"
            }
          />
        </div>
      ) : (
        <>
          <div className={`min-h-0 flex-1 ${maxHeight} overflow-auto`}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-100 bg-slate-50">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={
                      item?.id ||
                      item?.id_user ||
                      item?.id_vendor ||
                      item?.id_sekolah ||
                      item?.email ||
                      startIndex + index
                    }
                    className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        {column.render(item, startIndex + index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Menampilkan {startNumber}-{endNumber} dari {filteredData.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTablePage((page) => Math.max(1, page - 1))}
                disabled={tablePage <= 1}
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>

              <span className="min-w-[82px] text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                {tablePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setTablePage((page) => Math.min(totalPages, page + 1))
                }
                disabled={tablePage >= totalPages}
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function ChartTableSection({
  title,
  subtitle,
  icon,
  chartTitle,
  tableTitle,
  chart,
  filters,
  table,
  hidden = false,
}) {
  if (hidden) return null;

  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      right={icon}
      className="min-h-[430px]"
      bodyClassName="p-5"
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-md border border-slate-100 bg-white p-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {chartTitle}
            </p>
          </div>

          {chart}
        </div>

        <div className="rounded-md border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {tableTitle}
            </p>

            {filters && <div className="mt-3">{filters}</div>}
          </div>

          {table}
        </div>
      </div>
    </DashboardPanel>
  );
}

function AssignmentStatus(user, wilayahMap) {
  return resolveNamaWilayahUser(user, wilayahMap) === "Belum Dipetakan"
    ? "BELUM_DIPETAKAN"
    : "DIPETAKAN";
}

function OperatorCoverageCard({ totalSekolah, sudah, belum }) {
  const persen = totalSekolah ? Math.round((sudah / totalSekolah) * 100) : 0;

  return (
    <div className="flex min-h-[330px] flex-col justify-center rounded-md border border-cyan-100 bg-cyan-50/70 p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
        <GraduationCap size={21} />
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">
        Coverage Operator
      </p>

      <h3 className="mt-3 text-[20px] font-black leading-tight text-slate-900">
        {persen}% sekolah sudah punya operator
      </h3>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[#0AC4E0] transition-all"
          style={{ width: `${persen}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-cyan-100 bg-white p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Sudah Ada
          </p>
          <p className="mt-2 text-2xl font-black text-slate-800">{sudah}</p>
        </div>

        <div className="rounded-md border border-cyan-100 bg-white p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Belum Ada
          </p>
          <p className="mt-2 text-2xl font-black text-slate-800">{belum}</p>
        </div>
      </div>
    </div>
  );
}

function SchoolExplorerSummary({
  selectedWilayah,
  totalSchools,
  totalProvinsi,
  totalKabupaten,
  jenjangData,
}) {
  return (
    <aside className="rounded-md border border-slate-100 bg-slate-50/70 p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Ringkasan Filter Sekolah
      </p>

      <h3 className="mt-2 text-[18px] font-black text-slate-900">
        {selectedWilayah
          ? selectedWilayah?.nama_wilayah || selectedWilayah?.nama
          : "Semua Wilayah Binaan"}
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-white p-3">
          <p className="text-[8px] font-black uppercase text-slate-400">
            Provinsi
          </p>
          <p className="mt-1 text-xl font-black text-slate-800">
            {totalProvinsi}
          </p>
        </div>

        <div className="rounded-md bg-white p-3">
          <p className="text-[8px] font-black uppercase text-slate-400">
            Kabupaten
          </p>
          <p className="mt-1 text-xl font-black text-slate-800">
            {totalKabupaten}
          </p>
        </div>

        <div className="rounded-md bg-white p-3">
          <p className="text-[8px] font-black uppercase text-slate-400">
            Sekolah
          </p>
          <p className="mt-1 text-xl font-black text-slate-800">
            {totalSchools}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <PieWithLegend
          data={jenjangData}
          emptyText="Belum ada komposisi jenjang"
          icon={<School size={24} />}
        />
      </div>
    </aside>
  );
}


function parseWilayahBounds(rawBounds) {
  if (!rawBounds) return null;

  let bounds = rawBounds;

  if (typeof bounds === "string") {
    try {
      bounds = JSON.parse(bounds);
    } catch {
      return null;
    }
  }

  if (
    Array.isArray(bounds) &&
    bounds.length === 2 &&
    Array.isArray(bounds[0]) &&
    Array.isArray(bounds[1])
  ) {
    const south = angka(bounds[0][0]);
    const west = angka(bounds[0][1]);
    const north = angka(bounds[1][0]);
    const east = angka(bounds[1][1]);

    if ([south, west, north, east].every((value) => value !== null)) {
      return [
        [Math.min(south, north), Math.min(west, east)],
        [Math.max(south, north), Math.max(west, east)],
      ];
    }
  }

  if (!bounds || typeof bounds !== "object") return null;

  const south =
    angka(bounds?.south) ??
    angka(bounds?.min_lat) ??
    angka(bounds?.minLat) ??
    angka(bounds?.southWest?.lat) ??
    angka(bounds?.southwest?.lat);

  const north =
    angka(bounds?.north) ??
    angka(bounds?.max_lat) ??
    angka(bounds?.maxLat) ??
    angka(bounds?.northEast?.lat) ??
    angka(bounds?.northeast?.lat);

  const west =
    angka(bounds?.west) ??
    angka(bounds?.min_lng) ??
    angka(bounds?.minLng) ??
    angka(bounds?.min_longitude) ??
    angka(bounds?.southWest?.lng) ??
    angka(bounds?.southWest?.longitude) ??
    angka(bounds?.southwest?.lng);

  const east =
    angka(bounds?.east) ??
    angka(bounds?.max_lng) ??
    angka(bounds?.maxLng) ??
    angka(bounds?.max_longitude) ??
    angka(bounds?.northEast?.lng) ??
    angka(bounds?.northEast?.longitude) ??
    angka(bounds?.northeast?.lng);

  if ([south, west, north, east].every((value) => value !== null)) {
    return [
      [Math.min(south, north), Math.min(west, east)],
      [Math.max(south, north), Math.max(west, east)],
    ];
  }

  return null;
}

function ambilKoordinatWilayah(wilayah) {
  if (!wilayah) return null;

  const latitude =
    angka(wilayah?.latitude) ??
    angka(wilayah?.lat) ??
    angka(wilayah?.center_latitude) ??
    angka(wilayah?.center_lat);

  const longitude =
    angka(wilayah?.longitude) ??
    angka(wilayah?.lng) ??
    angka(wilayah?.long) ??
    angka(wilayah?.center_longitude) ??
    angka(wilayah?.center_lng);

  if (latitude !== null && longitude !== null) {
    return {
      latitude,
      longitude,
      source: "database",
    };
  }

  const bounds = parseWilayahBounds(wilayah?.bounds);
  if (bounds) {
    return {
      latitude: (bounds[0][0] + bounds[1][0]) / 2,
      longitude: (bounds[0][1] + bounds[1][1]) / 2,
      source: "bounds",
    };
  }

  return null;
}

function resolveKabupatenRecord(
  school,
  kabupatenName,
  provinceName,
  wilayahMap,
) {
  const directKabupatenId = ambilIdKabupatenSekolah(school);

  if (directKabupatenId) {
    const direct = wilayahMap.get(String(directKabupatenId));
    if (direct && !isProvinsi(direct)) return direct;
  }

  const schoolWilayahId = ambilIdWilayah(school);
  if (schoolWilayahId) {
    const directWilayah = wilayahMap.get(String(schoolWilayahId));
    if (directWilayah && !isProvinsi(directWilayah)) return directWilayah;
  }

  const normalizedKabupaten = normalisasiText(kabupatenName);
  const normalizedProvince = normalisasiText(provinceName);

  for (const wilayah of wilayahMap.values()) {
    if (!wilayah || isProvinsi(wilayah)) continue;

    const name = nilaiTampil(wilayah?.nama_wilayah, wilayah?.nama);
    if (normalisasiText(name) !== normalizedKabupaten) continue;

    const parentProvince = ambilProvinsiDariWilayah(wilayah, wilayahMap);
    if (
      !normalizedProvince ||
      normalisasiText(parentProvince) === normalizedProvince
    ) {
      return wilayah;
    }
  }

  return null;
}


const INDONESIA_BOUNDS = [
  [-11.6, 94.0],
  [6.7, 141.7],
];

function isValidIndonesiaCoordinate(latitude, longitude) {
  const lat = angka(latitude);
  const lng = angka(longitude);

  return (
    lat !== null &&
    lng !== null &&
    lat >= INDONESIA_BOUNDS[0][0] &&
    lat <= INDONESIA_BOUNDS[1][0] &&
    lng >= INDONESIA_BOUNDS[0][1] &&
    lng <= INDONESIA_BOUNDS[1][1]
  );
}

function normalizeSafeBounds(rawBounds, center = null) {
  const bounds = parseWilayahBounds(rawBounds);
  if (!bounds) return null;

  const [[south, west], [north, east]] = bounds;
  if (
    !isValidIndonesiaCoordinate(south, west) ||
    !isValidIndonesiaCoordinate(north, east)
  ) {
    return null;
  }

  const latSpan = north - south;
  const lngSpan = east - west;

  // Menolak bounds rusak/terlalu luas yang biasanya membuat peta lari ke laut.
  if (latSpan <= 0 || lngSpan <= 0 || latSpan > 13 || lngSpan > 20) {
    return null;
  }

  if (Array.isArray(center) && center.length === 2) {
    const centerLat = angka(center[0]);
    const centerLng = angka(center[1]);

    if (isValidIndonesiaCoordinate(centerLat, centerLng)) {
      const paddingLat = Math.max(latSpan * 0.35, 0.75);
      const paddingLng = Math.max(lngSpan * 0.35, 0.75);
      const centerStillRelated =
        centerLat >= south - paddingLat &&
        centerLat <= north + paddingLat &&
        centerLng >= west - paddingLng &&
        centerLng <= east + paddingLng;

      if (!centerStillRelated) return null;
    }
  }

  return bounds;
}

function wilayahIdentity(wilayah = {}) {
  const id = wilayah?.id_wilayah ?? wilayah?.id ?? null;
  const name = nilaiTampil(wilayah?.nama_wilayah, wilayah?.nama, "");

  return {
    id: id === null || id === undefined ? "" : String(id),
    name,
    key: normalisasiUpper(name),
  };
}

function getProvinceRecordFromSummary(selectedProvince, wilayahMap) {
  if (!selectedProvince) return null;

  const direct = selectedProvince?.wilayah;
  if (direct && isProvinsi(direct)) return direct;

  const selectedId =
    selectedProvince?.id ??
    selectedProvince?.id_wilayah ??
    selectedProvince?.wilayah?.id_wilayah ??
    selectedProvince?.wilayah?.id;

  if (selectedId) {
    const byId = wilayahMap.get(String(selectedId));
    if (byId && isProvinsi(byId)) return byId;
  }

  const selectedKey = kunciNamaProvinsi(selectedProvince?.name || "");

  for (const wilayah of wilayahMap.values()) {
    if (!wilayah || !isProvinsi(wilayah)) continue;
    const name = nilaiTampil(wilayah?.nama_wilayah, wilayah?.nama, "");
    if (kunciNamaProvinsi(name) === selectedKey) return wilayah;
  }

  return null;
}

function getKabupatenRecordsForProvince(selectedProvince, wilayahMap) {
  if (!selectedProvince) return [];

  const provinceRecord = getProvinceRecordFromSummary(
    selectedProvince,
    wilayahMap,
  );
  const provinceIdentity = wilayahIdentity(provinceRecord || {});
  const provinceKey = kunciNamaProvinsi(
    selectedProvince?.name || provinceIdentity.name || "",
  );

  return Array.from(wilayahMap.values()).filter((wilayah) => {
    if (!wilayah || isProvinsi(wilayah)) return false;

    const jenis = ambilJenisWilayah(wilayah);
    if (jenis !== "Kabupaten/Kota") return false;

    const parentId = ambilParentIdWilayah(wilayah);
    if (
      provinceIdentity.id &&
      parentId !== null &&
      parentId !== undefined &&
      String(parentId) === provinceIdentity.id
    ) {
      return true;
    }

    const parentProvinceName = ambilProvinsiDariWilayah(
      wilayah,
      wilayahMap,
    );

    return (
      provinceKey &&
      kunciNamaProvinsi(parentProvinceName) === provinceKey
    );
  });
}

function buildBoundsFromPoints(points, minimumPadding = 0.22) {
  const validPoints = points.filter(([latitude, longitude]) =>
    isValidIndonesiaCoordinate(latitude, longitude),
  );

  if (validPoints.length === 0) return null;

  const latitudes = validPoints.map(([latitude]) => Number(latitude));
  const longitudes = validPoints.map(([, longitude]) => Number(longitude));
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);

  if (validPoints.length === 1) {
    return [
      [south - 0.75, west - 0.95],
      [north + 0.75, east + 0.95],
    ];
  }

  const latPadding = Math.max((north - south) * 0.18, minimumPadding);
  const lngPadding = Math.max((east - west) * 0.18, minimumPadding);

  return [
    [south - latPadding, west - lngPadding],
    [north + latPadding, east + lngPadding],
  ];
}


function buildKabupatenMarkerData(selectedProvince, wilayahMap) {
  if (!selectedProvince?.schools?.length) return [];

  const provinceRecord = getProvinceRecordFromSummary(
    selectedProvince,
    wilayahMap,
  );
  const provinceCenter = [
    angka(selectedProvince?.latitude),
    angka(selectedProvince?.longitude),
  ];
  const provinceBounds = normalizeSafeBounds(
    provinceRecord?.bounds || selectedProvince?.bounds,
    provinceCenter,
  );

  const kabupatenRecords = getKabupatenRecordsForProvince(
    selectedProvince,
    wilayahMap,
  );
  const recordsById = new Map();
  const recordsByName = new Map();

  kabupatenRecords.forEach((record) => {
    const identity = wilayahIdentity(record);
    if (identity.id) recordsById.set(identity.id, record);
    if (identity.key) recordsByName.set(identity.key, record);
  });

  const groups = new Map();

  selectedProvince.schools.forEach((school) => {
    const directKabupatenId = ambilIdKabupatenSekolah(school);
    const schoolWilayahId = ambilIdWilayah(school);

    let kabupatenRecord = directKabupatenId
      ? recordsById.get(String(directKabupatenId)) ||
      wilayahMap.get(String(directKabupatenId)) ||
      null
      : null;

    if (!kabupatenRecord && schoolWilayahId) {
      const possibleRecord = wilayahMap.get(String(schoolWilayahId));
      if (possibleRecord && !isProvinsi(possibleRecord)) {
        kabupatenRecord = possibleRecord;
      }
    }

    const resolvedKabupatenName = ambilKabupatenSekolah(
      school,
      wilayahMap,
    );

    if (!kabupatenRecord && resolvedKabupatenName) {
      kabupatenRecord =
        recordsByName.get(normalisasiUpper(resolvedKabupatenName)) ||
        null;
    }

    const kabupatenName = nilaiTampil(
      kabupatenRecord?.nama_wilayah,
      kabupatenRecord?.nama,
      resolvedKabupatenName,
      "Belum Dipetakan",
    );

    if (
      !kabupatenName ||
      kabupatenName === "Belum Dipetakan" ||
      kabupatenName === "Belum Diisi"
    ) {
      return;
    }

    const recordId = kabupatenRecord?.id_wilayah ?? kabupatenRecord?.id;
    const key = recordId
      ? `ID:${recordId}`
      : `NAME:${normalisasiUpper(kabupatenName)}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: kabupatenName,
        provinceName: selectedProvince.name,
        wilayah: kabupatenRecord,
        schools: [],
      });
    }

    const group = groups.get(key);
    group.schools.push(school);

    if (!group.wilayah && kabupatenRecord) {
      group.wilayah = kabupatenRecord;
    }
  });

  const groupsArray = Array.from(groups.values());

  return groupsArray
    .map((group, index) => {
      const directCoordinate = ambilKoordinatWilayah(group.wilayah);
      const safeDirectCoordinate =
        directCoordinate &&
          isValidIndonesiaCoordinate(
            directCoordinate.latitude,
            directCoordinate.longitude,
          )
          ? directCoordinate
          : null;

      const schoolCoordinates = group.schools
        .map((school) => ({
          latitude: angka(school?.latitude ?? school?.lat),
          longitude: angka(
            school?.longitude ?? school?.lng ?? school?.long,
          ),
        }))
        .filter((coordinate) =>
          isValidIndonesiaCoordinate(
            coordinate.latitude,
            coordinate.longitude,
          ),
        );

      const averageCoordinate =
        schoolCoordinates.length > 0
          ? {
            latitude:
              schoolCoordinates.reduce(
                (total, coordinate) => total + coordinate.latitude,
                0,
              ) / schoolCoordinates.length,
            longitude:
              schoolCoordinates.reduce(
                (total, coordinate) => total + coordinate.longitude,
                0,
              ) / schoolCoordinates.length,
            source: "school-average",
          }
          : null;

      const namedFallback = ambilKoordinatFallback(
        `${group.name} ${group.provinceName}`,
        index,
      );
      const safeNamedFallback =
        namedFallback &&
          isValidIndonesiaCoordinate(
            namedFallback.latitude,
            namedFallback.longitude,
          )
          ? { ...namedFallback, source: "regional-fallback" }
          : null;

      let insideProvinceFallback = null;

      if (provinceBounds) {
        const [[south, west], [north, east]] = provinceBounds;
        const rowFraction = ((index * 37) % 83 + 8) / 100;
        const columnFraction = ((index * 53) % 79 + 10) / 100;

        insideProvinceFallback = {
          latitude: south + (north - south) * rowFraction,
          longitude: west + (east - west) * columnFraction,
          source: "province-bounds-estimate",
        };
      } else if (
        isValidIndonesiaCoordinate(
          provinceCenter[0],
          provinceCenter[1],
        )
      ) {
        const angle = (index / Math.max(groupsArray.length, 1)) * Math.PI * 2;
        const radius = 0.28 + (index % 3) * 0.06;

        insideProvinceFallback = {
          latitude: provinceCenter[0] + Math.sin(angle) * radius,
          longitude: provinceCenter[1] + Math.cos(angle) * radius,
          source: "province-center-estimate",
        };
      }

      const coordinate =
        safeDirectCoordinate ||
        averageCoordinate ||
        safeNamedFallback ||
        insideProvinceFallback;

      if (
        !coordinate ||
        !isValidIndonesiaCoordinate(
          coordinate.latitude,
          coordinate.longitude,
        )
      ) {
        return null;
      }

      return {
        ...group,
        id:
          group.wilayah?.id_wilayah ??
          group.wilayah?.id ??
          group.key,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        coordinateSource: coordinate.source,
        totalSekolah: group.schools.length,
        schools: [...group.schools].sort((a, b) =>
          ambilNamaSekolah(a).localeCompare(
            ambilNamaSekolah(b),
            "id",
          ),
        ),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.totalSekolah - a.totalSekolah ||
        a.name.localeCompare(b.name, "id"),
    );
}


function resolveProvinceFocusBounds(
  selectedProvince,
  kabupatenMarkers,
  wilayahMap,
) {
  if (!selectedProvince) return null;

  const center = [
    angka(selectedProvince.latitude),
    angka(selectedProvince.longitude),
  ];
  const provinceRecord = getProvinceRecordFromSummary(
    selectedProvince,
    wilayahMap,
  );

  const storedBounds = normalizeSafeBounds(
    provinceRecord?.bounds ||
    selectedProvince?.wilayah?.bounds ||
    selectedProvince?.bounds,
    center,
  );

  if (storedBounds) return storedBounds;

  const childKabupatenPoints = getKabupatenRecordsForProvince(
    selectedProvince,
    wilayahMap,
  )
    .map((wilayah) => ambilKoordinatWilayah(wilayah))
    .filter(Boolean)
    .map((coordinate) => [
      coordinate.latitude,
      coordinate.longitude,
    ]);

  const markerPoints = kabupatenMarkers.map((kabupaten) => [
    kabupaten.latitude,
    kabupaten.longitude,
  ]);

  const schoolPoints = (selectedProvince.schools || []).map((school) => [
    angka(school?.latitude ?? school?.lat),
    angka(school?.longitude ?? school?.lng ?? school?.long),
  ]);

  const calculatedBounds = buildBoundsFromPoints([
    ...childKabupatenPoints,
    ...markerPoints,
    ...schoolPoints,
  ]);

  if (calculatedBounds) return calculatedBounds;

  if (!isValidIndonesiaCoordinate(center[0], center[1])) {
    return null;
  }

  return [
    [center[0] - 1.15, center[1] - 1.55],
    [center[0] + 1.15, center[1] + 1.55],
  ];
}


function MapViewportController({
  center,
  zoom,
  bounds,
  focusKey,
}) {
  const map = useMap();
  const boundsKey = JSON.stringify(bounds || null);
  const centerKey = JSON.stringify(center || null);

  useEffect(() => {
    let timeoutId;

    const applyViewport = () => {
      map.stop();
      map.invalidateSize({ pan: false });

      if (bounds && Array.isArray(bounds) && bounds.length === 2) {
        map.fitBounds(bounds, {
          paddingTopLeft: [54, 54],
          paddingBottomRight: [54, 54],
          maxZoom: 9,
          animate: false,
        });
        return;
      }

      if (!Array.isArray(center) || center.length !== 2) return;
      if (!isValidIndonesiaCoordinate(center[0], center[1])) return;

      map.setView(center, zoom || DEFAULT_ZOOM, {
        animate: false,
      });
    };

    // Memberi waktu container Leaflet menyelesaikan ukuran setelah panel/filter berubah.
    timeoutId = window.setTimeout(applyViewport, 80);

    return () => window.clearTimeout(timeoutId);
  }, [boundsKey, centerKey, zoom, focusKey, map]);

  return null;
}

function CompactSchoolLeafletMap({
  schools,
  wilayahMap,
  provinceMarkers,
  selectedWilayah,
  mapCenter,
  zoom,
  onSelectProvinsi,
  onResetFilter,
}) {
  const [mapSearch, setMapSearch] = useState("");
  const [selectedKabupatenKey, setSelectedKabupatenKey] =
    useState("");
  const [kabupatenSchoolSearch, setKabupatenSchoolSearch] =
    useState({});

  const normalizedSearch = normalisasiText(mapSearch);
  const selectedProvinceKey = kunciNamaProvinsi(
    selectedWilayah?.nama_wilayah ||
    selectedWilayah?.nama ||
    "",
  );

  useEffect(() => {
    setSelectedKabupatenKey("");
    setKabupatenSchoolSearch({});
    setMapSearch("");
  }, [selectedProvinceKey]);

  const filteredProvinceMarkers = useMemo(() => {
    if (!normalizedSearch) return provinceMarkers;

    return provinceMarkers.filter((province) => {
      const schoolText = province.schools
        .map(
          (school) =>
            `${ambilNamaSekolah(school)} ${ambilNpsn(
              school,
            )} ${ambilKabupatenSekolah(school, wilayahMap)}`,
        )
        .join(" ");

      return normalisasiText(
        `${province.name} ${province.kabupatenList.join(
          " ",
        )} ${schoolText}`,
      ).includes(normalizedSearch);
    });
  }, [normalizedSearch, provinceMarkers, wilayahMap]);

  const selectedProvinceData = useMemo(() => {
    if (!selectedProvinceKey) return null;

    return (
      provinceMarkers.find(
        (province) => province.key === selectedProvinceKey,
      ) || null
    );
  }, [provinceMarkers, selectedProvinceKey]);

  const kabupatenMarkers = useMemo(
    () =>
      buildKabupatenMarkerData(
        selectedProvinceData,
        wilayahMap,
      ),
    [selectedProvinceData, wilayahMap],
  );

  const filteredKabupatenMarkers = useMemo(() => {
    if (!normalizedSearch) return kabupatenMarkers;

    return kabupatenMarkers.filter((kabupaten) => {
      const schoolsText = kabupaten.schools
        .map(
          (school) =>
            `${ambilNamaSekolah(school)} ${ambilNpsn(
              school,
            )} ${ambilJenjangSekolah(school)}`,
        )
        .join(" ");

      return normalisasiText(
        `${kabupaten.name} ${kabupaten.provinceName} ${schoolsText}`,
      ).includes(normalizedSearch);
    });
  }, [kabupatenMarkers, normalizedSearch]);

  const provinceFocusBounds = useMemo(
    () =>
      resolveProvinceFocusBounds(
        selectedProvinceData,
        kabupatenMarkers,
        wilayahMap,
      ),
    [selectedProvinceData, kabupatenMarkers, wilayahMap],
  );

  const totalKabupaten = useMemo(() => {
    const set = new Set();

    provinceMarkers.forEach((province) => {
      province.kabupatenList.forEach((kabupaten) =>
        set.add(kabupaten),
      );
    });

    return set.size;
  }, [provinceMarkers]);

  const totalSchools = useMemo(
    () =>
      provinceMarkers.reduce(
        (total, province) => total + province.totalSekolah,
        0,
      ),
    [provinceMarkers],
  );

  const selectedLabel =
    selectedProvinceData?.name ||
    selectedWilayah?.nama_wilayah ||
    selectedWilayah?.nama ||
    "Seluruh Indonesia";

  const mapResultCount = selectedProvinceData
    ? filteredKabupatenMarkers.length
    : filteredProvinceMarkers.length;

  const mapResultLabel = selectedProvinceData
    ? "kabupaten"
    : "provinsi";

  const mappedSchoolCount = selectedProvinceData
    ? kabupatenMarkers.reduce(
      (total, kabupaten) => total + kabupaten.totalSekolah,
      0,
    )
    : 0;
  const unmappedSchoolCount = selectedProvinceData
    ? Math.max(
      selectedProvinceData.totalSekolah - mappedSchoolCount,
      0,
    )
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
              Peta Indonesia Binaan
            </p>

            <h3 className="mt-1 break-words text-[20px] font-black text-slate-800">
              {selectedLabel}
            </h3>

            <p className="mt-1 text-[11px] font-bold leading-5 text-slate-400">
              {!selectedProvinceData
                ? "Klik marker merah provinsi untuk menampilkan seluruh kabupaten yang mempunyai sekolah binaan."
                : "Peta otomatis menyesuaikan batas provinsi. Marker biru mewakili kabupaten yang mempunyai sekolah binaan dan menampilkan detail sekolah saat diklik."}
            </p>
          </div>

          <button
            type="button"
            onClick={onResetFilter}
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-[10px] font-black uppercase tracking-widest transition ${!selectedWilayah
              ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
              : "border-slate-200 bg-white text-slate-500 hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
              }`}
          >
            <MapPin size={14} />
            Seluruh Indonesia
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Provinsi Binaan
            </p>
            <p className="mt-1 text-[22px] font-black text-slate-800">
              {selectedProvinceData ? 1 : provinceMarkers.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Kabupaten Binaan
            </p>
            <p className="mt-1 text-[22px] font-black text-slate-800">
              {selectedProvinceData?.totalKabupaten ??
                totalKabupaten}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Sekolah Binaan
            </p>
            <p className="mt-1 text-[22px] font-black text-slate-800">
              {selectedProvinceData?.totalSekolah ??
                totalSchools}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
          />

          <input
            value={mapSearch}
            onChange={(event) =>
              setMapSearch(event.target.value)
            }
            placeholder={
              selectedProvinceData
                ? "Cari kabupaten, sekolah, NPSN, atau jenjang..."
                : "Cari provinsi, kabupaten, sekolah, atau NPSN..."
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[12px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:bg-white focus:ring-1 focus:ring-[#0AC4E0]"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {mapResultCount} {mapResultLabel} ditemukan
          </p>

          {mapSearch && (
            <button
              type="button"
              onClick={() => setMapSearch("")}
              className="text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {!selectedProvinceData &&
            filteredProvinceMarkers.map((province) => (
              <button
                key={province.key}
                type="button"
                onClick={() => onSelectProvinsi(province)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                {province.name} · {province.totalSekolah}
              </button>
            ))}

          {selectedProvinceData &&
            filteredKabupatenMarkers.map((kabupaten) => {
              const active =
                kabupaten.key === selectedKabupatenKey;

              return (
                <button
                  key={kabupaten.key}
                  type="button"
                  onClick={() =>
                    setSelectedKabupatenKey(kabupaten.key)
                  }
                  className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${active
                    ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                    }`}
                >
                  {kabupaten.name} · {kabupaten.totalSekolah}
                </button>
              );
            })}

          {mapResultCount === 0 && (
            <div className="flex min-h-[42px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
              <p className="text-[10px] font-bold text-slate-400">
                Data wilayah atau sekolah tidak ditemukan.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedProvinceData && unmappedSchoolCount > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-bold leading-5 text-amber-700">
            {unmappedSchoolCount} sekolah belum dapat dimasukkan ke marker
            kabupaten karena relasi kabupatennya belum terbaca. Sekolah lain
            tetap ditampilkan sesuai kabupaten yang tersimpan.
          </p>
        </div>
      )}

      <div className="relative h-[540px] overflow-hidden rounded-3xl border border-slate-100 bg-slate-200 shadow-sm">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          minZoom={4}
          maxZoom={14}
          maxBounds={INDONESIA_BOUNDS}
          scrollWheelZoom
          className="h-full w-full"
        >
          <MapViewportController
            center={mapCenter}
            zoom={zoom}
            bounds={
              selectedProvinceData
                ? provinceFocusBounds
                : null
            }
            focusKey={`${selectedProvinceData?.key || "INDONESIA"
              }:${selectedWilayah?._focus_nonce || 0}`}
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!selectedProvinceData &&
            filteredProvinceMarkers.map((province) => {
              const position = [
                province.latitude,
                province.longitude,
              ];

              return (
                <Fragment key={province.key}>
                  <CircleMarker
                    center={position}
                    radius={14}
                    pathOptions={{
                      color: "#EF4444",
                      fillColor: "#EF4444",
                      fillOpacity: 0.12,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () =>
                        onSelectProvinsi(province),
                    }}
                  />

                  <Marker
                    position={position}
                    icon={createProvinceMarkerIcon(
                      province.totalSekolah,
                      false,
                    )}
                    eventHandlers={{
                      click: () =>
                        onSelectProvinsi(province),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[260px]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <MapPin size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-[15px] font-black text-slate-800">
                              {province.name}
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Provinsi Binaan
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[8px] font-black uppercase text-slate-400">
                              Kabupaten
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-800">
                              {province.totalKabupaten}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[8px] font-black uppercase text-slate-400">
                              Sekolah
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-800">
                              {province.totalSekolah}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onSelectProvinsi(province)
                          }
                          className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#0AC4E0] px-3 text-[9px] font-black uppercase tracking-widest text-white"
                        >
                          Fokuskan Provinsi
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}

          {selectedProvinceData &&
            filteredKabupatenMarkers.map((kabupaten) => {
              const position = [
                kabupaten.latitude,
                kabupaten.longitude,
              ];
              const active =
                selectedKabupatenKey === kabupaten.key;
              const popupSearch = normalisasiText(
                kabupatenSchoolSearch[kabupaten.key] || "",
              );
              const filteredSchools = kabupaten.schools.filter(
                (school) =>
                  !popupSearch ||
                  normalisasiText(
                    `${ambilNamaSekolah(
                      school,
                    )} ${ambilNpsn(
                      school,
                    )} ${ambilJenjangSekolah(
                      school,
                    )}`,
                  ).includes(popupSearch),
              );

              return (
                <Fragment key={kabupaten.key}>
                  <CircleMarker
                    center={position}
                    radius={active ? 18 : 11}
                    pathOptions={{
                      color: active
                        ? "#0891B2"
                        : "#0AC4E0",
                      fillColor: "#0AC4E0",
                      fillOpacity: active ? 0.24 : 0.1,
                      weight: active ? 3 : 2,
                    }}
                    eventHandlers={{
                      click: () =>
                        setSelectedKabupatenKey(
                          kabupaten.key,
                        ),
                    }}
                  />

                  <Marker
                    position={position}
                    icon={createKabupatenMarkerIcon(
                      kabupaten.name,
                      kabupaten.totalSekolah,
                      active,
                    )}
                    eventHandlers={{
                      click: () =>
                        setSelectedKabupatenKey(
                          kabupaten.key,
                        ),
                    }}
                  >
                    <Popup minWidth={285} maxWidth={320}>
                      <div className="w-[280px]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                            <Building2 size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-[14px] font-black text-slate-800">
                              {kabupaten.name}
                            </p>
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {kabupaten.provinceName} ·{" "}
                              {kabupaten.totalSekolah} sekolah
                            </p>
                          </div>
                        </div>

                        <div className="relative mt-3">
                          <Search
                            size={12}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
                          />
                          <input
                            value={
                              kabupatenSchoolSearch[
                              kabupaten.key
                              ] || ""
                            }
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            onChange={(event) =>
                              setKabupatenSchoolSearch(
                                (previous) => ({
                                  ...previous,
                                  [kabupaten.key]:
                                    event.target.value,
                                }),
                              )
                            }
                            placeholder="Cari sekolah atau NPSN..."
                            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:bg-white"
                          />
                        </div>

                        <div className="mt-3 max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
                          {filteredSchools
                            .slice(0, 5)
                            .map((school) => (
                              <div
                                key={
                                  ambilIdSekolah(school) ||
                                  ambilNamaSekolah(school)
                                }
                                className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
                              >
                                <p className="break-words text-[10px] font-black text-slate-700">
                                  {ambilNamaSekolah(school)}
                                </p>
                                <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                                  {ambilJenjangSekolah(
                                    school,
                                  )}{" "}
                                  · NPSN{" "}
                                  {ambilNpsn(school)}
                                </p>
                              </div>
                            ))}

                          {filteredSchools.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center">
                              <p className="text-[9px] font-bold text-slate-400">
                                Sekolah tidak ditemukan.
                              </p>
                            </div>
                          )}
                        </div>

                        {filteredSchools.length > 5 && (
                          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                            Menampilkan 5 dari{" "}
                            {filteredSchools.length} sekolah
                          </p>
                        )}

                        {kabupaten.coordinateSource !==
                          "database" && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[8px] font-bold leading-4 text-amber-600">
                              Titik kabupaten memakai koordinat
                              alternatif karena koordinat master
                              belum tersedia.
                            </p>
                          )}
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          {!selectedProvinceData ? (
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Provinsi Binaan
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
              <span className="h-3 w-3 rounded-full bg-cyan-500" />
              Kabupaten Binaan
            </div>
          )}
        </div>

        {!selectedProvinceData &&
          provinceMarkers.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/75">
              <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 text-center shadow-sm">
                <MapPin
                  className="mx-auto text-[#0AC4E0]"
                  size={26}
                />
                <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Marker provinsi belum tersedia
                </p>
                <p className="mt-1 max-w-sm text-[10px] font-bold leading-5 text-slate-400">
                  Pastikan sekolah terhubung dengan kabupaten dan
                  provinsi pada master wilayah.
                </p>
              </div>
            </div>
          )}

        {selectedProvinceData &&
          kabupatenMarkers.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/75">
              <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 text-center shadow-sm">
                <Building2
                  className="mx-auto text-[#0AC4E0]"
                  size={26}
                />
                <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Kabupaten belum terpetakan
                </p>
                <p className="mt-1 max-w-sm text-[10px] font-bold leading-5 text-slate-400">
                  Sekolah pada provinsi ini belum memiliki relasi
                  kabupaten yang dapat dibaca.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  const [users, setUsers] = useState([]);
  const [wilayah, setWilayah] = useState([]);
  const [schools, setSchools] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [agendas, setAgendas] = useState([]);

  const [activeFilter, setActiveFilter] = useState("SEMUA");
  const [searchValue, setSearchValue] = useState("");

  const [roleExplorerFilter, setRoleExplorerFilter] = useState("SEMUA");
  const [hoFilter, setHoFilter] = useState("SEMUA");
  const [aoFilter, setAoFilter] = useState("SEMUA");
  const [kadinFilter, setKadinFilter] = useState("SEMUA");
  const [vendorFilter, setVendorFilter] = useState("SEMUA");
  const [operatorFilter, setOperatorFilter] = useState("SEMUA");
  const [userTableRoleFilter, setUserTableRoleFilter] = useState("SEMUA");

  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [mapCenter, setMapCenter] = useState(INDONESIA_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [
        userData,
        aoData,
        kepalaDinasData,
        wilayahData,
        schoolData,
        vendorData,
        vendorAkademikData,
        vendorNonAkademikData,
        programData,
        programAkademikData,
        programNonAkademikData,
        agendaData,
      ] = await Promise.all([
        ambilDataDenganFallback(["/users"], headers),
        ambilDataDenganFallback(["/users/ao"], headers),
        ambilDataDenganFallback(["/kepala-dinas", "/kadin"], headers),
        ambilDataDenganFallback(["/wilayah"], headers),
        ambilDataDenganFallback(["/sekolah"], headers),
        ambilDataDenganFallback(["/vendor"], headers),
        ambilDataDenganFallback([
          "/vendor?kategori=AKADEMIK",
          "/vendor?kategori=akademik",
          "/vendor?jenis=AKADEMIK",
          "/vendor?jenis=akademik",
        ], headers),
        ambilDataDenganFallback([
          "/vendor?kategori=NON_AKADEMIK",
          "/vendor?kategori=non-akademik",
          "/vendor?kategori=non akademik",
          "/vendor?jenis=NON_AKADEMIK",
          "/vendor?jenis=non-akademik",
          "/vendor?jenis=non akademik",
        ], headers),
        ambilDataDenganFallback(["/program"], headers),
        ambilDataDenganFallback([
          "/program?kategori=AKADEMIK",
          "/program?kategori=akademik",
        ], headers),
        ambilDataDenganFallback([
          "/program?kategori=NON_AKADEMIK",
          "/program?kategori=non-akademik",
          "/program?kategori=non akademik",
        ], headers),
        ambilDataDenganFallback(["/admin-agenda"], headers),
      ]);

      const mergedUsers = mergeUsersWithRoleData(userData, [
        { roleId: 4, data: aoData },
        { roleId: 7, data: kepalaDinasData },
      ]);

      const mergedVendors = mergeVendorsWithCategoryHints(
        vendorData,
        vendorAkademikData,
        vendorNonAkademikData,
      );

      const mergedPrograms = mergeProgramsWithCategoryHints(
        programData,
        programAkademikData,
        programNonAkademikData,
      );

      setUsers(mergedUsers);
      setWilayah(wilayahData);
      setSchools(schoolData);
      setVendors(mergedVendors);
      setPrograms(mergedPrograms);
      setAgendas(agendaData);
    } catch (error) {
      console.error("Dashboard Admin Error:", error);
      alert(error.message || "Gagal memuat Dashboard Admin");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWilayah, searchValue, activeFilter]);

  const keyword = normalisasiText(searchValue);
  const sectionKeyword = "";

  const sectionMatches = (...terms) => {
    if (!sectionKeyword) return true;

    return terms
      .flat()
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(sectionKeyword);
  };

  const visibleSectionCount = [
    sectionMatches("Komposisi Akun Sistem per Role", "akun sistem", "role", "user"),
    sectionMatches("Data Head Office", "head office", "ho", "akademik", "non akademik"),
    sectionMatches("Data Area Officer", "area officer", "ao", "wilayah penugasan"),
    sectionMatches("Data Kepala Dinas", "kepala dinas", "kadin", "dinas", "wilayah"),
    sectionMatches("Eksplorasi Sekolah Binaan", "sekolah", "map", "peta", "wilayah", "kabupaten", "provinsi"),
    sectionMatches("Coverage Kabupaten Binaan per Provinsi", "coverage", "kabupaten", "provinsi", "wilayah binaan"),
    sectionMatches("Data Vendor", "vendor", "akademik", "non akademik"),
    sectionMatches("Coverage Operator Sekolah", "operator sekolah", "operator", "sekolah"),
    sectionMatches("Data User Terbaru", "user terbaru", "akun", "role"),
  ].filter(Boolean).length;

  const wilayahMap = useMemo(() => buatWilayahMap(wilayah), [wilayah]);

  const wilayahForMap = useMemo(() => {
    return wilayah
      .filter((item) => sesuaiFilterStatus(item, activeFilter))
      .map(normalisasiWilayahUntukMap);
  }, [wilayah, activeFilter]);

  const allSchoolsWithMap = useMemo(() => {
    return schools.map((sekolah, index) =>
      normalisasiSekolahUntukMap(sekolah, index, wilayahMap),
    );
  }, [schools, wilayahMap]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((item) => sesuaiFilterStatus(item, activeFilter))
      .filter((item) =>
        cocokSearch(item, keyword, [
          "nama",
          "email",
          "jabatan",
          "jenis",
          "sub_jenis",
          ambilNamaRole,
          (user) => resolveNamaWilayahUser(user, wilayahMap),
        ]),
      );
  }, [users, activeFilter, keyword, wilayahMap]);

  const filteredWilayah = useMemo(() => {
    return wilayahForMap.filter((item) =>
      cocokSearch(item, keyword, [
        "nama_wilayah",
        "nama",
        "kode_wilayah",
        "jenis",
        "jenis_wilayah",
        ambilJenisWilayah,
      ]),
    );
  }, [wilayahForMap, keyword]);

  const filteredSchools = useMemo(() => {
    return allSchoolsWithMap
      .filter((item) => sesuaiFilterStatus(item, activeFilter))
      .filter((item) =>
        cocokSearch(item, keyword, [
          "nama_sekolah",
          "nama",
          "npsn",
          "jenjang",
          "alamat",
          (sekolah) => resolveNamaWilayahSekolah(sekolah, wilayahMap),
          (sekolah) => ambilProvinsiSekolah(sekolah, wilayahMap),
          (sekolah) => ambilKabupatenSekolah(sekolah, wilayahMap),
        ]),
      );
  }, [allSchoolsWithMap, activeFilter, keyword, wilayahMap]);

  const vendorsWithCategory = useMemo(() => {
    return vendors.map((vendor) => ({
      ...vendor,
      _resolved_category: inferVendorCategoryFromPrograms(vendor, programs),
    }));
  }, [vendors, programs]);

  const filteredVendors = useMemo(() => {
    return vendorsWithCategory
      .filter((item) => sesuaiFilterStatus(item, activeFilter))
      .filter((item) =>
        cocokSearch(item, keyword, [
          "nama_vendor",
          "nama",
          "email",
          "kategori",
          "kategori_vendor",
          "jenis",
          "jenis_vendor",
          "kontak",
          getVendorCategory,
        ]),
      );
  }, [vendorsWithCategory, activeFilter, keyword]);

  const filteredAgendas = useMemo(() => {
    return agendas.filter((item) =>
      cocokSearch(item, keyword, [
        "judul",
        "title",
        "nama_agenda",
        "agenda",
        "status",
        "deskripsi",
        "keterangan",
      ]),
    );
  }, [agendas, keyword]);

  const pengurus = useMemo(
    () => filteredUsers.filter((item) => ambilIdRole(item) === 2),
    [filteredUsers],
  );

  const headOffice = useMemo(
    () => filteredUsers.filter((item) => ambilIdRole(item) === 3),
    [filteredUsers],
  );

  const areaOfficer = useMemo(
    () => filteredUsers.filter((item) => ambilIdRole(item) === 4),
    [filteredUsers],
  );

  const kepalaDinas = useMemo(
    () => filteredUsers.filter((item) => ambilIdRole(item) === 7),
    [filteredUsers],
  );

  const operatorSekolah = useMemo(
    () =>
      filteredUsers.filter((item) => {
        const roleId = ambilIdRole(item);
        const jabatan = normalisasiText(ambilJabatan(item));

        return (
          roleId === 5 ||
          roleId === 9 ||
          jabatan.includes("operator sekolah")
        );
      }),
    [filteredUsers],
  );

  const sekolahDenganOperatorIds = useMemo(() => {
    const ids = new Set();

    operatorSekolah.forEach((operator) => {
      const id =
        operator?.id_sekolah ||
        operator?.sekolah_id ||
        operator?.school_id ||
        operator?.sekolah?.id_sekolah ||
        operator?.sekolah?.id;

      if (id) ids.add(String(id));
    });

    return ids;
  }, [operatorSekolah]);

  const sekolahDenganOperator = useMemo(() => {
    return filteredSchools.filter((sekolah) =>
      sekolahDenganOperatorIds.has(String(ambilIdSekolah(sekolah))),
    );
  }, [filteredSchools, sekolahDenganOperatorIds]);

  const sekolahBelumOperator = useMemo(() => {
    return filteredSchools.filter(
      (sekolah) =>
        !sekolahDenganOperatorIds.has(String(ambilIdSekolah(sekolah))),
    );
  }, [filteredSchools, sekolahDenganOperatorIds]);

  const roleExplorerUsers = useMemo(() => {
    if (roleExplorerFilter === "SEMUA") return filteredUsers;
    return filteredUsers.filter(
      (user) => Number(ambilIdRole(user)) === Number(roleExplorerFilter),
    );
  }, [filteredUsers, roleExplorerFilter]);

  const roleExplorerChart = useMemo(() => {
    const roleYangDitampilkan = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return roleYangDitampilkan
      .map((idRole) => ({
        name: ROLE_LABEL[idRole],
        value: roleExplorerUsers.filter((user) => ambilIdRole(user) === idRole)
          .length,
        color: ROLE_COLOR[idRole],
      }))
      .filter((item) => item.value > 0);
  }, [roleExplorerUsers]);

  const hoTableData = useMemo(() => {
    return headOffice.filter((user) => matchHOFilter(user, hoFilter));
  }, [headOffice, hoFilter]);

  const hoChartData = useMemo(() => {
    return warnaDataKonsisten(
      kelompokkanData(hoTableData, (item) =>
        tampilHOCategory(getHOCategory(item)),
      ),
    );
  }, [hoTableData]);

  const aoTableData = useMemo(() => {
    return areaOfficer.filter((item) => {
      if (aoFilter === "SEMUA") return true;
      return AssignmentStatus(item, wilayahMap) === aoFilter;
    });
  }, [areaOfficer, aoFilter, wilayahMap]);

  const aoChartData = useMemo(() => {
    return warnaDataKonsisten(
      kelompokkanData(aoTableData, (item) => {
        const status = AssignmentStatus(item, wilayahMap);
        return status === "DIPETAKAN" ? "Sudah Dipetakan" : "Belum Dipetakan";
      }),
    );
  }, [aoTableData, wilayahMap]);

  const kadinTableData = useMemo(() => {
    return kepalaDinas.filter((item) => {
      if (kadinFilter === "SEMUA") return true;
      return AssignmentStatus(item, wilayahMap) === kadinFilter;
    });
  }, [kepalaDinas, kadinFilter, wilayahMap]);

  const kadinChartData = useMemo(() => {
    return warnaDataKonsisten(
      kelompokkanData(kadinTableData, (item) => {
        const status = AssignmentStatus(item, wilayahMap);
        return status === "DIPETAKAN" ? "Sudah Dipetakan" : "Belum Dipetakan";
      }),
    );
  }, [kadinTableData, wilayahMap]);

  const vendorTableData = useMemo(() => {
    return filteredVendors.filter((vendor) => {
      if (vendorFilter === "SEMUA") return true;
      return getVendorCategory(vendor) === vendorFilter;
    });
  }, [filteredVendors, vendorFilter]);

  const vendorChartData = useMemo(() => {
    return warnaDataKonsisten(
      kelompokkanData(vendorTableData, (vendor) =>
        tampilVendorCategory(getVendorCategory(vendor)),
      ),
    );
  }, [vendorTableData]);

  const operatorTableSchools = useMemo(() => {
    if (operatorFilter === "SUDAH") return sekolahDenganOperator;
    if (operatorFilter === "BELUM") return sekolahBelumOperator;
    return filteredSchools;
  }, [operatorFilter, sekolahDenganOperator, sekolahBelumOperator, filteredSchools]);

  const userTableData = useMemo(() => {
    return filteredUsers
      .filter((user) => {
        if (userTableRoleFilter === "SEMUA") return true;
        return Number(ambilIdRole(user)) === Number(userTableRoleFilter);
      })
      .sort((a, b) => {
        const aDate = new Date(ambilTanggal(a) || 0).getTime();
        const bDate = new Date(ambilTanggal(b) || 0).getTime();
        return bDate - aDate;
      });
  }, [filteredUsers, userTableRoleFilter]);

  const schoolExplorerList = useMemo(() => {
    return filteredSchools.filter((sekolah) =>
      isSekolahMasukWilayah(sekolah, selectedWilayah, wilayahMap),
    );
  }, [filteredSchools, selectedWilayah, wilayahMap]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(schoolExplorerList.length / ITEMS_PER_PAGE));
  }, [schoolExplorerList]);

  const currentSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return schoolExplorerList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [schoolExplorerList, currentPage]);

  const schoolExplorerJenjang = useMemo(() => {
    return warnaDataKonsisten(
      kelompokkanData(schoolExplorerList, ambilJenjangSekolah),
    );
  }, [schoolExplorerList]);

  const explorerStats = useMemo(() => {
    const provinsiSet = new Set();
    const kabupatenSet = new Set();

    schoolExplorerList.forEach((sekolah) => {
      provinsiSet.add(ambilProvinsiSekolah(sekolah, wilayahMap));
      kabupatenSet.add(ambilKabupatenSekolah(sekolah, wilayahMap));
    });

    return {
      totalProvinsi: provinsiSet.size,
      totalKabupaten: kabupatenSet.size,
      totalSekolah: schoolExplorerList.length,
    };
  }, [schoolExplorerList, wilayahMap]);

  const provinceMapMarkers = useMemo(() => {
    return buildProvinsiMarkerData(
      filteredWilayah,
      filteredSchools,
      wilayahMap,
    );
  }, [filteredWilayah, filteredSchools, wilayahMap]);

  const diagramWilayahCoverageProvinsi = useMemo(() => {
    return provinceMapMarkers.map((province, index) => ({
      name: province.name,
      value: province.totalKabupaten,
      sekolah: province.totalSekolah,
      color: WARNA_DIAGRAM[index % WARNA_DIAGRAM.length],
    }));
  }, [provinceMapMarkers]);

  const ringkasan = useMemo(() => {
    return {
      pengurus: pengurus.length,
      ho: headOffice.length,
      ao: areaOfficer.length,
      wilayah: filteredWilayah.length,
      sekolah: filteredSchools.length,
      operator: operatorSekolah.length,
      vendor: filteredVendors.length,
      kadin: kepalaDinas.length,
      agenda: filteredAgendas.length,
      totalUser: filteredUsers.length,
    };
  }, [
    pengurus,
    headOffice,
    areaOfficer,
    filteredWilayah,
    filteredSchools,
    operatorSekolah,
    filteredVendors,
    kepalaDinas,
    filteredAgendas,
    filteredUsers,
  ]);

  const selectProvinsi = (province) => {
    if (!province) return;

    const selectedProvince = {
      ...(province?.wilayah || {}),
      nama_wilayah: province?.name,
      jenis_wilayah: "PROVINSI",
      latitude: province?.latitude,
      longitude: province?.longitude,
      _province_summary: province,
      _focus_nonce: Date.now(),
    };

    setSelectedWilayah(selectedProvince);
    setMapCenter([province.latitude, province.longitude]);
    setZoom(PROVINCE_ZOOM);
    setCurrentPage(1);
  };

  const resetFilterMap = () => {
    setSelectedWilayah(null);
    setMapCenter(INDONESIA_CENTER);
    setZoom(DEFAULT_ZOOM);
    setCurrentPage(1);
  };

  const openSchoolModal = () => { };

  if (loading) {
    return (
      <PageWrapper className="flex h-screen w-full overflow-hidden bg-white !p-0">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
              Memuat Dashboard Admin...
            </p>
          </div>
        </main>
      </PageWrapper>
    );
  }

  return (
    <>
      <style>{`
        html, body {
          background-color: #F1F5F9;
          font-family: 'Poppins', sans-serif;
        }

        .admin-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .admin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .admin-scroll::-webkit-scrollbar-thumb {
          background: rgba(10, 196, 224, 0.35);
          border-radius: 999px;
        }

        .recharts-wrapper text {
          font-family: 'Poppins', sans-serif !important;
          font-size: 11px;
          font-weight: 700;
        }

        .leaflet-container {
          font-family: 'Poppins', sans-serif;
        }

        .admin-province-marker-wrapper {
          border: 0 !important;
          background: transparent !important;
        }

        .admin-province-marker {
          position: relative;
          width: 58px;
          height: 72px;
          filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.2));
          transform-origin: 50% 90%;
          transition: transform 180ms ease;
        }

        .admin-province-marker:hover,
        .admin-province-marker.is-active {
          transform: scale(1.12);
        }

        .admin-province-marker.is-active {
          filter: drop-shadow(0 12px 18px rgba(239, 68, 68, 0.36));
        }

        .admin-province-marker__pin {
          position: absolute;
          left: 11px;
          top: 5px;
          width: 36px;
          height: 36px;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          background: #ef0018;
          transform: rotate(-45deg);
          box-shadow: 0 6px 18px rgba(239, 0, 24, 0.35);
        }

        .admin-province-marker__hole {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 13px;
          height: 13px;
          border-radius: 999px;
          background: #ffffff;
          transform: translate(-50%, -50%);
        }

        .admin-province-marker__count {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          min-width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #0f172a;
          padding: 0 6px;
          font-size: 9px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
        }

        .admin-kabupaten-marker-wrapper {
          border: 0 !important;
          background: transparent !important;
        }

        .admin-kabupaten-marker {
          position: relative;
          display: flex;
          width: 168px;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          transform-origin: 50% 70%;
          transition: transform 180ms ease;
        }

        .admin-kabupaten-marker:hover,
        .admin-kabupaten-marker.is-active {
          z-index: 4;
          transform: scale(1.08);
        }

        .admin-kabupaten-marker__dot {
          position: absolute;
          left: 50%;
          top: 0;
          display: flex;
          width: 31px;
          height: 31px;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          border-radius: 999px;
          background: #0ac4e0;
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(10, 196, 224, 0.36);
          transform: translateX(-50%);
        }

        .admin-kabupaten-marker.is-active .admin-kabupaten-marker__dot {
          background: #0891b2;
          box-shadow: 0 9px 22px rgba(8, 145, 178, 0.42);
        }

        .admin-kabupaten-marker__dot span {
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
        }

        .admin-kabupaten-marker__label {
          position: absolute;
          left: 50%;
          top: 29px;
          max-width: 158px;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.96);
          padding: 4px 9px;
          font-size: 8px;
          font-weight: 900;
          color: #475569;
          line-height: 1.15;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
          transform: translateX(-50%);
        }

        .admin-kabupaten-marker.is-active .admin-kabupaten-marker__label {
          border-color: rgba(10, 196, 224, 0.4);
          background: #083344;
          color: #ffffff;
        }

        .admin-compact-map .leaflet-container {
          height: 220px !important;
          min-height: 220px !important;
        }

        .admin-compact-map [class*="h-[520px]"],
        .admin-compact-map [class*="h-[500px]"],
        .admin-compact-map [class*="h-[480px]"],
        .admin-compact-map [class*="h-[460px]"] {
          height: 220px !important;
          min-height: 220px !important;
        }
      `}</style>

      <PageWrapper className="flex min-h-screen w-full bg-slate-100 !p-0">
        <Sidebar />

        <main className="admin-scroll h-screen flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5">
            <DashboardPanel className="rounded-md" bodyClassName="p-0">
              <header className="flex flex-col gap-5 border-b border-slate-100 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-sm">
                    <LayoutDashboard size={24} />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Dashboard Admin
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Master Data Control Center
                      </span>
                    </div>

                    <h1 className="text-[24px] font-black tracking-tight text-slate-800">
                      Pusat Kontrol Data Master
                    </h1>

                    <p className="mt-1 max-w-2xl text-[12px] font-semibold leading-5 text-slate-400">
                      Seluruh data master, filter, pencarian, dan peta sekolah
                      binaan terhubung langsung dengan data backend.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative flex h-10 min-w-[300px] items-center">
                    <Search
                      size={15}
                      className="absolute left-3.5 text-[#0AC4E0]"
                    />
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Cari seluruh data: nama, email, sekolah, wilayah, vendor..."
                      className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-[12px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={refreshing}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500 active:scale-95 disabled:opacity-60"
                  >
                    <RefreshCcw
                      size={14}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    {refreshing ? "Memuat" : "Refresh"}
                  </button>
                </div>
              </header>

              <div className="border-b border-slate-100 px-6 py-4">
                <FilterButtonGroup
                  options={STATUS_FILTERS}
                  value={activeFilter}
                  onChange={setActiveFilter}
                />
              </div>

              <section className="grid grid-cols-1 border-b border-slate-100 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <KartuAngka
                  active
                  color={ROLE_COLOR[2]}
                  label="Pengurus"
                  value={ringkasan.pengurus}
                  helper="User pengurus"
                  icon={<UsersRound size={18} />}
                />
                <KartuAngka
                  color={ROLE_COLOR[3]}
                  label="Head Office"
                  value={ringkasan.ho}
                  helper="HO akademik/non-akademik"
                  icon={<Building2 size={18} />}
                />
                <KartuAngka
                  color={ROLE_COLOR[4]}
                  label="Area Officer"
                  value={ringkasan.ao}
                  helper="AO wilayah binaan"
                  icon={<UserCog size={18} />}
                />
                <KartuAngka
                  color={WARNA.pink}
                  label="Wilayah"
                  value={ringkasan.wilayah}
                  helper="Provinsi/kabupaten"
                  icon={<MapPin size={18} />}
                />
                <KartuAngka
                  color={ROLE_COLOR[5]}
                  label="Sekolah"
                  value={ringkasan.sekolah}
                  helper="Sekolah terdaftar"
                  icon={<School size={18} />}
                />
                <KartuAngka
                  color={ROLE_COLOR[9]}
                  label="Operator Sekolah"
                  value={ringkasan.operator}
                  helper={`${sekolahDenganOperator.length} sekolah tercakup`}
                  icon={<GraduationCap size={18} />}
                />
                <KartuAngka
                  color={WARNA.orange}
                  label="Vendor"
                  value={ringkasan.vendor}
                  helper="Mitra program"
                  icon={<Factory size={18} />}
                />
                <KartuAngka
                  color={ROLE_COLOR[7]}
                  label="Kepala Dinas"
                  value={ringkasan.kadin}
                  helper="User wilayah dinas"
                  icon={<Landmark size={18} />}
                />
                <KartuAngka
                  color={WARNA.amber}
                  label="Agenda"
                  value={ringkasan.agenda}
                  helper="Agenda admin"
                  icon={<CalendarDays size={18} />}
                />
                <KartuAngka
                  color={WARNA.slate}
                  label="Total User"
                  value={ringkasan.totalUser}
                  helper="Akun sistem terbaca"
                  icon={<Database size={18} />}
                />
              </section>
            </DashboardPanel>

            {sectionKeyword && visibleSectionCount === 0 && (
              <DashboardPanel
                title="Section Tidak Ditemukan"
                subtitle="Coba kata kunci lain seperti Head Office, Vendor, Sekolah, Operator, Area Officer, atau Kepala Dinas."
                className="min-h-[180px]"
                bodyClassName="p-6"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
                  <Search size={28} className="text-[#0AC4E0]" />
                  <p className="mt-3 text-[12px] font-black uppercase tracking-widest text-slate-500">
                    Tidak ada diagram yang cocok dengan pencarian
                  </p>
                </div>
              </DashboardPanel>
            )}

            <ChartTableSection
              hidden={!sectionMatches("Komposisi Akun Sistem per Role", "akun sistem", "role", "user")}
              title="Komposisi Akun Sistem per Role"
              subtitle="Chart kiri dan tabel kanan saling terhubung lewat filter role."
              icon={<UsersRound size={18} className="text-[#0AC4E0]" />}
              chartTitle="Chart Role"
              tableTitle="List User Role"
              filters={
                <FilterButtonGroup
                  options={ROLE_FILTERS}
                  value={roleExplorerFilter}
                  onChange={setRoleExplorerFilter}
                  dark
                />
              }
              chart={
                <ColumnBarMaster
                  data={roleExplorerChart}
                  emptyText="Belum ada data role"
                  icon={<UsersRound size={24} />}
                  barName="User"
                />
              }
              table={
                <TableMini
                  data={roleExplorerUsers}
                  getSearchText={(user) =>
                    `${ambilNamaUser(user)} ${user?.email || ""} ${ambilNamaRole(user)} ${statusLabel(user)}`
                  }
                  searchPlaceholder="Cari nama, email, role, atau status..."
                  emptyText="Belum ada user pada role ini"
                  columns={[
                    {
                      key: "user",
                      label: "User",
                      render: (user) => (
                        <div>
                          <p className="max-w-[260px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaUser(user)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilEmail(user)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "role",
                      label: "Role",
                      render: (user) => {
                        const idRole = ambilIdRole(user);
                        return (
                          <span
                            className="inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white"
                            style={{
                              backgroundColor:
                                ROLE_COLOR[idRole] || WARNA.slate,
                            }}
                          >
                            {ambilNamaRole(user)}
                          </span>
                        );
                      },
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (user) => <StatusPill status={statusLabel(user)} />,
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Data Head Office", "head office", "ho", "akademik", "non akademik")}
              title="Data Head Office"
              subtitle="Filter jenis HO di kanan akan ikut mengubah chart di kiri."
              icon={<Building2 size={18} className="text-[#0AC4E0]" />}
              chartTitle="Komposisi HO"
              tableTitle="List Head Office"
              filters={
                <FilterButtonGroup
                  options={HO_FILTERS}
                  value={hoFilter}
                  onChange={setHoFilter}
                  dark
                />
              }
              chart={
                <PieWithLegend
                  data={hoChartData}
                  emptyText="Belum ada data Head Office"
                  icon={<Building2 size={24} />}
                />
              }
              table={
                <TableMini
                  data={hoTableData}
                  getSearchText={(user) =>
                    `${ambilNamaUser(user)} ${user?.email || ""} ${tampilHOCategory(getHOCategory(user))} ${statusLabel(user)}`
                  }
                  searchPlaceholder="Cari nama, email, jenis HO, atau status..."
                  emptyText="Belum ada Head Office sesuai filter"
                  columns={[
                    {
                      key: "nama",
                      label: "Nama",
                      render: (user) => (
                        <div>
                          <p className="max-w-[250px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaUser(user)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilEmail(user)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "jenis",
                      label: "Jenis",
                      render: (user) => (
                        <p className="max-w-[160px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {tampilHOCategory(getHOCategory(user))}
                        </p>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (user) => <StatusPill status={statusLabel(user)} />,
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Data Area Officer", "area officer", "ao", "wilayah penugasan")}
              title="Data Area Officer"
              subtitle="Fokus pada kelengkapan pemetaan wilayah AO."
              icon={<UserCog size={18} className="text-[#0AC4E0]" />}
              chartTitle="Status Pemetaan AO"
              tableTitle="List Area Officer"
              filters={
                <FilterButtonGroup
                  options={ASSIGNMENT_FILTERS}
                  value={aoFilter}
                  onChange={setAoFilter}
                  dark
                />
              }
              chart={
                <PieWithLegend
                  data={aoChartData}
                  emptyText="Belum ada Area Officer"
                  icon={<UserCog size={24} />}
                />
              }
              table={
                <TableMini
                  data={aoTableData}
                  getSearchText={(user) =>
                    `${ambilNamaUser(user)} ${user?.email || ""} ${resolveNamaWilayahUser(user, wilayahMap)} ${statusLabel(user)}`
                  }
                  searchPlaceholder="Cari nama, email, wilayah, atau status..."
                  emptyText="Belum ada AO sesuai filter"
                  columns={[
                    {
                      key: "nama",
                      label: "Nama",
                      render: (user) => (
                        <div>
                          <p className="max-w-[180px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaUser(user)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilEmail(user)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "wilayah",
                      label: "Wilayah",
                      render: (user) => (
                        <p className="max-w-[140px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {resolveNamaWilayahUser(user, wilayahMap)}
                        </p>
                      ),
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Data Kepala Dinas", "kepala dinas", "kadin", "dinas", "wilayah")}
              title="Data Kepala Dinas"
              subtitle="Fokus pada kelengkapan pemetaan wilayah Kepala Dinas."
              icon={<Landmark size={18} className="text-[#0AC4E0]" />}
              chartTitle="Status Pemetaan Kadin"
              tableTitle="List Kepala Dinas"
              filters={
                <FilterButtonGroup
                  options={ASSIGNMENT_FILTERS}
                  value={kadinFilter}
                  onChange={setKadinFilter}
                  dark
                />
              }
              chart={
                <PieWithLegend
                  data={kadinChartData}
                  emptyText="Belum ada Kepala Dinas"
                  icon={<Landmark size={24} />}
                />
              }
              table={
                <TableMini
                  data={kadinTableData}
                  getSearchText={(user) =>
                    `${ambilNamaUser(user)} ${user?.email || ""} ${resolveNamaWilayahUser(user, wilayahMap)} ${statusLabel(user)}`
                  }
                  searchPlaceholder="Cari nama, email, wilayah, atau status..."
                  emptyText="Belum ada Kepala Dinas sesuai filter"
                  columns={[
                    {
                      key: "nama",
                      label: "Nama",
                      render: (user) => (
                        <div>
                          <p className="max-w-[180px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaUser(user)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilEmail(user)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "wilayah",
                      label: "Wilayah",
                      render: (user) => (
                        <p className="max-w-[140px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {resolveNamaWilayahUser(user, wilayahMap)}
                        </p>
                      ),
                    },
                  ]}
                />
              }
            />

            <DashboardPanel
              hidden={!sectionMatches("Eksplorasi Sekolah Binaan", "sekolah", "map", "peta", "wilayah", "kabupaten", "provinsi")}
              title="Eksplorasi Sekolah Binaan"
              subtitle="Satu peta Indonesia dengan marker provinsi. Setelah difokuskan, peta menampilkan marker kabupaten beserta sekolah binaannya."
              right={<MapPin size={18} className="text-[#0AC4E0]" />}
              className="min-h-[660px]"
              bodyClassName="p-5"
            >
              <CompactSchoolLeafletMap
                schools={schoolExplorerList}
                wilayahMap={wilayahMap}
                provinceMarkers={provinceMapMarkers}
                selectedWilayah={selectedWilayah}
                mapCenter={mapCenter}
                zoom={zoom}
                onSelectProvinsi={selectProvinsi}
                onResetFilter={resetFilterMap}
              />
            </DashboardPanel>

            <ChartTableSection
              title="Detail Sekolah Binaan Terpilih"
              subtitle="Chart kiri dan tabel kanan mengikuti pilihan wilayah pada peta."
              icon={<School size={18} className="text-[#0AC4E0]" />}
              chartTitle="Komposisi Jenjang"
              tableTitle="List Sekolah pada Wilayah Terpilih"
              chart={
                <PieWithLegend
                  data={schoolExplorerJenjang}
                  emptyText="Belum ada sekolah pada wilayah ini"
                  icon={<School size={24} />}
                />
              }
              table={
                <TableMini
                  data={schoolExplorerList}
                  getSearchText={(sekolah) =>
                    `${ambilNamaSekolah(sekolah)} ${ambilJenjangSekolah(sekolah)} ${sekolah?.npsn || ""} ${ambilKabupatenSekolah(sekolah, wilayahMap)} ${ambilProvinsiSekolah(sekolah, wilayahMap)} ${statusLabel(sekolah)}`
                  }
                  searchPlaceholder="Cari sekolah, NPSN, jenjang, atau wilayah..."
                  emptyText="Belum ada sekolah pada wilayah ini"
                  columns={[
                    {
                      key: "sekolah",
                      label: "Sekolah",
                      render: (sekolah) => (
                        <div>
                          <p className="max-w-[260px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaSekolah(sekolah)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilJenjangSekolah(sekolah)} · NPSN {ambilNpsn(sekolah)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "wilayah",
                      label: "Kabupaten",
                      render: (sekolah) => (
                        <p className="max-w-[180px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {ambilKabupatenSekolah(sekolah, wilayahMap)}
                        </p>
                      ),
                    },
                    {
                      key: "provinsi",
                      label: "Provinsi",
                      render: (sekolah) => (
                        <p className="max-w-[180px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {ambilProvinsiSekolah(sekolah, wilayahMap)}
                        </p>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (sekolah) => <StatusPill status={statusLabel(sekolah)} />,
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Coverage Kabupaten Binaan per Provinsi", "coverage", "kabupaten", "provinsi", "wilayah binaan")}
              title="Coverage Kabupaten Binaan per Provinsi"
              subtitle="Chart kiri menunjukkan jumlah kabupaten binaan; tabel kanan menunjukkan detail provinsi dan sekolah."
              icon={<MapPin size={18} className="text-[#0AC4E0]" />}
              chartTitle="Kabupaten Binaan"
              tableTitle="Detail Provinsi Binaan"
              chart={
                <ColumnBarMaster
                  data={diagramWilayahCoverageProvinsi}
                  emptyText="Belum ada coverage wilayah"
                  icon={<MapPin size={24} />}
                  barName="Kabupaten"
                />
              }
              table={
                <TableMini
                  data={diagramWilayahCoverageProvinsi}
                  getSearchText={(item) =>
                    `${item?.name || ""} ${item?.value || ""} ${item?.sekolah || ""}`
                  }
                  searchPlaceholder="Cari provinsi atau jumlah coverage..."
                  emptyText="Belum ada data provinsi binaan"
                  columns={[
                    {
                      key: "provinsi",
                      label: "Provinsi",
                      render: (item) => (
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="max-w-[220px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {item.name}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "kabupaten",
                      label: "Kabupaten",
                      render: (item) => (
                        <p className="text-[11px] font-bold text-slate-500">
                          {item.value}
                        </p>
                      ),
                    },
                    {
                      key: "sekolah",
                      label: "Sekolah",
                      render: (item) => (
                        <p className="text-[11px] font-bold text-slate-500">
                          {item.sekolah}
                        </p>
                      ),
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Data Vendor", "vendor", "akademik", "non akademik")}
              title="Data Vendor"
              subtitle="Filter kategori vendor di kanan akan ikut mengubah chart di kiri."
              icon={<Factory size={18} className="text-[#0AC4E0]" />}
              chartTitle="Komposisi Vendor"
              tableTitle="List Vendor"
              filters={
                <FilterButtonGroup
                  options={VENDOR_FILTERS}
                  value={vendorFilter}
                  onChange={setVendorFilter}
                  dark
                />
              }
              chart={
                <PieWithLegend
                  data={vendorChartData}
                  emptyText="Belum ada vendor sesuai filter"
                  icon={<Factory size={24} />}
                />
              }
              table={
                <TableMini
                  data={vendorTableData}
                  getSearchText={(vendor) =>
                    `${ambilNamaVendor(vendor)} ${vendor?.kontak || ""} ${vendor?.email || ""} ${tampilVendorCategory(getVendorCategory(vendor))} ${statusLabel(vendor)}`
                  }
                  searchPlaceholder="Cari vendor, kontak, kategori, atau status..."
                  emptyText="Belum ada vendor sesuai filter"
                  columns={[
                    {
                      key: "nama",
                      label: "Vendor",
                      render: (vendor) => (
                        <div>
                          <p className="max-w-[250px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaVendor(vendor)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilKontak(vendor)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "kategori",
                      label: "Kategori",
                      render: (vendor) => (
                        <p className="max-w-[160px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                          {tampilVendorCategory(getVendorCategory(vendor))}
                        </p>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (vendor) => (
                        <StatusPill status={statusLabel(vendor)} />
                      ),
                    },
                  ]}
                />
              }
            />

            <ChartTableSection
              hidden={!sectionMatches("Coverage Operator Sekolah", "operator sekolah", "operator", "sekolah")}
              title="Coverage Operator Sekolah"
              subtitle="Kiri menampilkan coverage, kanan menampilkan daftar sekolah berdasarkan filter."
              icon={<GraduationCap size={18} className="text-[#0AC4E0]" />}
              chartTitle="Coverage Operator"
              tableTitle="List Sekolah"
              filters={
                <FilterButtonGroup
                  options={OPERATOR_FILTERS}
                  value={operatorFilter}
                  onChange={setOperatorFilter}
                  dark
                />
              }
              chart={
                <OperatorCoverageCard
                  totalSekolah={filteredSchools.length}
                  sudah={sekolahDenganOperator.length}
                  belum={sekolahBelumOperator.length}
                />
              }
              table={
                <TableMini
                  data={operatorTableSchools}
                  getSearchText={(sekolah) => {
                    const hasOperator = sekolahDenganOperatorIds.has(
                      String(ambilIdSekolah(sekolah)),
                    );

                    return `${ambilNamaSekolah(sekolah)} ${ambilJenjangSekolah(sekolah)} ${resolveNamaWilayahSekolah(sekolah, wilayahMap)} ${hasOperator ? "Sudah Ada Operator" : "Belum Ada Operator"}`;
                  }}
                  searchPlaceholder="Cari sekolah, jenjang, wilayah, atau operator..."
                  emptyText="Belum ada sekolah sesuai filter"
                  columns={[
                    {
                      key: "sekolah",
                      label: "Sekolah",
                      render: (sekolah) => (
                        <div>
                          <p className="max-w-[250px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                            {ambilNamaSekolah(sekolah)}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {ambilJenjangSekolah(sekolah)} · {resolveNamaWilayahSekolah(sekolah, wilayahMap)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "operator",
                      label: "Operator",
                      render: (sekolah) => {
                        const hasOperator = sekolahDenganOperatorIds.has(
                          String(ambilIdSekolah(sekolah)),
                        );

                        return (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${hasOperator
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                              }`}
                          >
                            {hasOperator ? "Sudah Ada" : "Belum Ada"}
                          </span>
                        );
                      },
                    },
                  ]}
                />
              }
            />

            <DashboardPanel
              hidden={!sectionMatches("Data User Terbaru", "user terbaru", "akun", "role")}
              title="Data User Terbaru"
              subtitle="Tabel akun sistem terbaru. Gunakan filter role untuk melihat data spesifik."
              className="min-h-[330px]"
              bodyClassName="p-0"
              right={<UsersRound size={18} className="text-[#0AC4E0]" />}
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <FilterButtonGroup
                  options={ROLE_FILTERS}
                  value={userTableRoleFilter}
                  onChange={setUserTableRoleFilter}
                  dark
                />
              </div>

              <TableMini
                data={userTableData}
                getSearchText={(user) =>
                  `${ambilNamaUser(user)} ${user?.email || ""} ${ambilNamaRole(user)} ${user?.jabatan || ""} ${user?.jenis || ""} ${user?.sub_jenis || ""} ${resolveNamaWilayahUser(user, wilayahMap)} ${statusLabel(user)}`
                }
                searchPlaceholder="Cari nama, email, role, jabatan, wilayah, atau status..."
                emptyText="Belum ada user terbaru"
                maxHeight="max-h-[420px]"
                columns={[
                  {
                    key: "user",
                    label: "User",
                    render: (user) => (
                      <div>
                        <p className="max-w-[320px] break-words whitespace-normal text-[12px] font-black text-slate-700">
                          {ambilNamaUser(user)}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          {ambilEmail(user)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "role",
                    label: "Role",
                    render: (user) => {
                      const idRole = ambilIdRole(user);

                      return (
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white"
                          style={{
                            backgroundColor: ROLE_COLOR[idRole] || WARNA.slate,
                          }}
                        >
                          {ambilNamaRole(user)}
                        </span>
                      );
                    },
                  },
                  {
                    key: "jabatan",
                    label: "Jabatan",
                    render: (user) => (
                      <p className="max-w-[180px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                        {ambilJabatan(user)}
                      </p>
                    ),
                  },
                  {
                    key: "wilayah",
                    label: "Wilayah",
                    render: (user) => (
                      <p className="max-w-[180px] break-words whitespace-normal text-[11px] font-bold text-slate-500">
                        {resolveNamaWilayahUser(user, wilayahMap)}
                      </p>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (user) => <StatusPill status={statusLabel(user)} />,
                  },
                ]}
              />
            </DashboardPanel>
          </div>
        </main>
      </PageWrapper>
    </>
  );
}

