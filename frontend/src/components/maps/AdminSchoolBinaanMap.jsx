import { Fragment, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Building2,
  MapPin,
} from "lucide-react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import indonesiaGeoJson from "../../assets/maps/indonesia-province-simple.json";
import AppButton from "../ui/AppButton";

const INDONESIA_CENTER = [-2.5, 118];
const DEFAULT_ZOOM = 5;
const INDONESIA_MAX_BOUNDS = [
  [-13.5, 92],
  [8.5, 143.8],
];
const INDONESIA_GEOJSON_STYLE = {
  color: "#0AC4E0",
  weight: 1.25,
  opacity: 0.9,
  fillColor: "#0AC4E0",
  fillOpacity: 0.1,
};

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

function angka(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalisasiText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalisasiUpper(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll(".", "")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .replace(/^PROVINSI\s+/, "")
    .trim();
}

function nilaiTampil(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text && text !== "-" && text.toLowerCase() !== "undefined" && text.toLowerCase() !== "null") {
      return text;
    }
  }

  return "Belum Diisi";
}

function flattenWilayah(payload) {
  const result = [];
  const seen = new Set();

  const visit = (item, parentId = null) => {
    if (!item || typeof item !== "object") return;

    const id = item.id_wilayah ?? item.idWilayah ?? item.id;
    const key = id != null ? String(id) : `${item.nama_wilayah || item.nama}-${parentId}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...item,
        id_wilayah: id,
        id_parent:
          item.id_parent ??
          item.parent_id ??
          item.parent?.id_wilayah ??
          item.parent?.id ??
          parentId,
      });
    }

    [
      item.children,
      item.kabupaten,
      item.kabupaten_kota,
      item.kota,
      item.wilayah_anak,
      item.sub_wilayah,
    ].forEach((collection) => {
      if (!Array.isArray(collection)) return;
      collection.forEach((child) => visit(child, id ?? parentId));
    });
  };

  (Array.isArray(payload) ? payload : []).forEach((item) => visit(item));
  return result;
}

function jenisWilayah(wilayah = {}) {
  const jenis = normalisasiUpper(
    wilayah?.jenis_wilayah || wilayah?.tipe_wilayah || wilayah?.jenis || wilayah?.tipe,
  );

  if (jenis.includes("PROV")) return "PROVINSI";
  if (jenis.includes("KAB") || jenis.includes("KOTA")) return "KABUPATEN";
  return jenis;
}

function isProvinsi(wilayah) {
  return jenisWilayah(wilayah) === "PROVINSI";
}

function idWilayah(wilayah = {}) {
  return wilayah?.id_wilayah ?? wilayah?.id ?? wilayah?.idWilayah ?? null;
}

function parentIdWilayah(wilayah = {}) {
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

function namaWilayah(wilayah = {}) {
  return nilaiTampil(wilayah?.nama_wilayah, wilayah?.nama, wilayah?.name, wilayah?.label);
}

function keyProvinsi(value) {
  const raw = normalisasiUpper(value);
  const aliases = {
    "NANGGROE ACEH DARUSSALAM": "ACEH",
    "DAERAH KHUSUS IBUKOTA JAKARTA": "DKI JAKARTA",
    JAKARTA: "DKI JAKARTA",
    "DAERAH ISTIMEWA YOGYAKARTA": "DI YOGYAKARTA",
    "D I YOGYAKARTA": "DI YOGYAKARTA",
    DIY: "DI YOGYAKARTA",
    NTB: "NUSA TENGGARA BARAT",
    NTT: "NUSA TENGGARA TIMUR",
  };

  return aliases[raw] || raw;
}

function koordinatWilayah(wilayah = {}) {
  const lat =
    angka(wilayah?.latitude) ??
    angka(wilayah?.lat) ??
    angka(wilayah?.center_latitude) ??
    angka(wilayah?.center_lat);
  const lng =
    angka(wilayah?.longitude) ??
    angka(wilayah?.lng) ??
    angka(wilayah?.long) ??
    angka(wilayah?.center_longitude) ??
    angka(wilayah?.center_lng);

  if (lat !== null && lng !== null) return { lat, lng, source: "database" };
  return null;
}

function koordinatProvinsi(wilayah, name) {
  const direct = koordinatWilayah(wilayah);
  if (direct) return direct;

  const fallback = KOORDINAT_PROVINSI[keyProvinsi(name).replaceAll(" ", "_")];
  if (!fallback) return null;
  return { lat: fallback.lat, lng: fallback.lng, source: "fallback" };
}

function getSchoolId(school = {}) {
  return school?.id_sekolah ?? school?.id ?? school?.idSekolah ?? school?.school_id ?? null;
}

function getSchoolName(school = {}) {
  return nilaiTampil(school?.nama_sekolah, school?.namaSekolah, school?.school_name, school?.nama, school?.name, "Sekolah");
}

function getSchoolNpsn(school = {}) {
  return nilaiTampil(school?.npsn, school?.NPSN, school?.nomor_npsn, "-");
}

function getSchoolLevel(school = {}) {
  return nilaiTampil(school?.jenjang, school?.tingkat, school?.level, school?.bentuk_pendidikan, "Sekolah").toUpperCase();
}

function getSchoolLatLng(school = {}) {
  const lat =
    angka(school?.latitude) ??
    angka(school?.lat) ??
    angka(school?.koordinat_lat) ??
    angka(school?.wilayah?.latitude) ??
    angka(school?.wilayah?.lat);
  const lng =
    angka(school?.longitude) ??
    angka(school?.lng) ??
    angka(school?.long) ??
    angka(school?.koordinat_lng) ??
    angka(school?.wilayah?.longitude) ??
    angka(school?.wilayah?.lng);

  if (lat !== null && lng !== null) return { lat, lng };
  return null;
}

function buildWilayahMap(wilayahList) {
  const map = new Map();
  wilayahList.forEach((wilayah) => {
    const id = idWilayah(wilayah);
    if (id) map.set(String(id), wilayah);
  });
  return map;
}

function findProvinceFromWilayah(wilayah, wilayahMap) {
  if (!wilayah) return null;
  if (isProvinsi(wilayah)) return wilayah;

  let current = wilayah;
  const seen = new Set();

  while (current && !isProvinsi(current)) {
    const currentId = idWilayah(current);
    if (currentId && seen.has(String(currentId))) break;
    if (currentId) seen.add(String(currentId));

    const parentObject = current?.parent || current?.provinsi;
    if (parentObject && typeof parentObject === "object") {
      if (isProvinsi(parentObject)) return parentObject;
      current = parentObject;
      continue;
    }

    const parentId = parentIdWilayah(current);
    if (!parentId) break;
    current = wilayahMap.get(String(parentId)) || null;
  }

  return current && isProvinsi(current) ? current : null;
}

function getSchoolKabupaten(school, wilayahMap) {
  const direct = nilaiTampil(
    school?.kabupaten?.nama_wilayah,
    school?.kabupaten?.nama,
    school?.nama_kabupaten,
    typeof school?.kabupaten === "string" ? school.kabupaten : null,
    school?.nama_kota,
  );

  if (direct !== "Belum Diisi") return direct;

  const id = school?.id_kabupaten ?? school?.kabupaten_id ?? school?.id_wilayah ?? school?.wilayah_id;
  const wilayah = id ? wilayahMap.get(String(id)) : school?.wilayah;
  if (wilayah && !isProvinsi(wilayah)) return namaWilayah(wilayah);

  return "Belum Dipetakan";
}

function getSchoolProvince(school, wilayahMap) {
  const direct = nilaiTampil(
    school?.provinsi?.nama_wilayah,
    school?.provinsi?.nama,
    school?.nama_provinsi,
    typeof school?.provinsi === "string" ? school.provinsi : null,
  );

  if (direct !== "Belum Diisi") return direct;

  const provinceId = school?.id_provinsi ?? school?.provinsi_id;
  const province = provinceId ? wilayahMap.get(String(provinceId)) : null;
  if (province && isProvinsi(province)) return namaWilayah(province);

  const kabupatenId = school?.id_kabupaten ?? school?.kabupaten_id ?? school?.id_wilayah ?? school?.wilayah_id;
  const wilayah = kabupatenId ? wilayahMap.get(String(kabupatenId)) : school?.wilayah;
  const parent = findProvinceFromWilayah(wilayah, wilayahMap);
  if (parent) return namaWilayah(parent);

  return "Belum Dipetakan";
}

function buildProvinceMarkers(wilayahList, schools, wilayahMap) {
  const provinceByKey = new Map();

  wilayahList.filter(isProvinsi).forEach((wilayah) => {
    const name = namaWilayah(wilayah);
    if (name !== "Belum Diisi") provinceByKey.set(keyProvinsi(name), wilayah);
  });

  const map = new Map();

  schools.forEach((school) => {
    const provinceName = getSchoolProvince(school, wilayahMap);
    const provinceKey = keyProvinsi(provinceName);
    if (!provinceKey || provinceKey.includes("BELUM")) return;

    const provinceWilayah = provinceByKey.get(provinceKey) || null;
    if (!map.has(provinceKey)) {
      map.set(provinceKey, {
        key: provinceKey,
        name: provinceName,
        wilayah: provinceWilayah,
        schools: [],
        kabupatenSet: new Set(),
      });
    }

    const item = map.get(provinceKey);
    item.schools.push(school);
    const kabupaten = getSchoolKabupaten(school, wilayahMap);
    if (kabupaten && !normalisasiText(kabupaten).includes("belum")) item.kabupatenSet.add(kabupaten);
  });

  return Array.from(map.values())
    .map((item) => {
      const coordinate = koordinatProvinsi(item.wilayah, item.name);
      if (!coordinate) return null;

      return {
        ...item,
        id: idWilayah(item.wilayah) ?? item.key,
        latitude: coordinate.lat,
        longitude: coordinate.lng,
        totalSekolah: item.schools.length,
        totalKabupaten: item.kabupatenSet.size,
        kabupatenList: Array.from(item.kabupatenSet).sort((a, b) => a.localeCompare(b, "id")),
        wilayah: item.wilayah || {
          id_wilayah: item.key,
          nama_wilayah: item.name,
          jenis_wilayah: "PROVINSI",
          latitude: coordinate.lat,
          longitude: coordinate.lng,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.totalSekolah - a.totalSekolah || a.name.localeCompare(b.name, "id"));
}

function averageLatLng(schools) {
  const points = schools.map(getSchoolLatLng).filter(Boolean);
  if (!points.length) return null;

  return {
    lat: points.reduce((total, point) => total + point.lat, 0) / points.length,
    lng: points.reduce((total, point) => total + point.lng, 0) / points.length,
  };
}

function buildCountyMarkers(province, wilayahMap) {
  if (!province) return [];

  const provinceKey = keyProvinsi(province.name);
  const groups = new Map();

  province.schools.forEach((school) => {
    const name = getSchoolKabupaten(school, wilayahMap);
    const key = normalisasiText(name || "Belum Dipetakan");
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name,
        provinceName: province.name,
        schools: [],
      });
    }

    groups.get(key).schools.push(school);
  });

  const wilayahValues = Array.from(wilayahMap.values());

  return Array.from(groups.values()).map((group, index) => {
    const wilayah = wilayahValues.find((item) => {
      if (isProvinsi(item)) return false;
      const sameName = normalisasiText(namaWilayah(item)) === normalisasiText(group.name);
      const parent = findProvinceFromWilayah(item, wilayahMap);
      return sameName && keyProvinsi(namaWilayah(parent)) === provinceKey;
    });
    const direct = koordinatWilayah(wilayah);
    const average = averageLatLng(group.schools);
    const base = direct || average || { lat: province.latitude, lng: province.longitude };

    return {
      ...group,
      wilayah,
      latitude: base.lat + (direct || average ? 0 : ((index % 5) - 2) * 0.08),
      longitude: base.lng + (direct || average ? 0 : ((index % 7) - 3) * 0.08),
      totalSekolah: group.schools.length,
      coordinateSource: direct ? "database" : average ? "school" : "province",
    };
  });
}

function createProvinceMarkerIcon(totalSchools = 0) {
  return L.divIcon({
    className: "admin-province-marker-wrapper",
    html: `
      <div class="admin-province-marker">
        <div class="admin-province-marker__pin">
          <span class="admin-province-marker__hole"></span>
        </div>
        <span class="admin-province-marker__count">${Number(totalSchools || 0)}</span>
      </div>
    `,
    iconSize: [58, 72],
    iconAnchor: [29, 66],
    popupAnchor: [0, -60],
  });
}

function createKabupatenMarkerIcon(name, totalSchools = 0, active = false) {
  const safeName = String(name || "Kabupaten").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  return L.divIcon({
    className: "admin-kabupaten-marker-wrapper",
    html: `
      <div class="admin-kabupaten-marker ${active ? "is-active" : ""}">
        <div class="admin-kabupaten-marker__dot">
          <span>${Number(totalSchools || 0)}</span>
        </div>
        <span class="admin-kabupaten-marker__label">${safeName}</span>
      </div>
    `,
    iconSize: [168, 58],
    iconAnchor: [84, 34],
    popupAnchor: [0, -34],
  });
}

function MapViewport({ selectedProvince, provinceMarkers, countyMarkers }) {
  const map = useMap();
  const focusKey = `${selectedProvince?.key || "indonesia"}-${countyMarkers.length}-${provinceMarkers.length}`;

  useEffect(() => {
    const apply = () => {
      map.invalidateSize({ pan: false });

      const source = selectedProvince ? countyMarkers : provinceMarkers;
      const points = source.map((item) => [item.latitude, item.longitude]);

      if (points.length > 1) {
        map.fitBounds(points, {
          paddingTopLeft: [58, 58],
          paddingBottomRight: [58, 58],
          maxZoom: selectedProvince ? 9 : 5,
          animate: false,
        });
        return;
      }

      if (points.length === 1) {
        map.setView(points[0], selectedProvince ? 8 : DEFAULT_ZOOM, { animate: false });
        return;
      }

      map.setView(INDONESIA_CENTER, DEFAULT_ZOOM, { animate: false });
    };

    apply();
    const timers = [120, 360, 760].map((delay) => window.setTimeout(apply, delay));
    window.addEventListener("resize", apply);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", apply);
    };
  }, [map, focusKey, selectedProvince, provinceMarkers, countyMarkers]);

  return null;
}

MapViewport.propTypes = {
  selectedProvince: PropTypes.object,
  provinceMarkers: PropTypes.array.isRequired,
  countyMarkers: PropTypes.array.isRequired,
};

export default function AdminSchoolBinaanMap({
  wilayahList = [],
  schools = [],
  selectedWilayah = null,
  onSelectWilayah,
  onResetFilter,
  onOpenSchool,
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedCountyKey, setSelectedCountyKey] = useState("");
  const flatWilayah = useMemo(() => flattenWilayah(wilayahList), [wilayahList]);
  const wilayahMap = useMemo(() => buildWilayahMap(flatWilayah), [flatWilayah]);
  const provinceMarkers = useMemo(
    () => buildProvinceMarkers(flatWilayah, schools, wilayahMap),
    [flatWilayah, schools, wilayahMap],
  );
  const selectedProvinceSource = useMemo(() => {
    if (!selectedWilayah) return null;
    return findProvinceFromWilayah(selectedWilayah, wilayahMap) || selectedWilayah;
  }, [selectedWilayah, wilayahMap]);
  const selectedProvinceKey = selectedProvinceSource ? keyProvinsi(namaWilayah(selectedProvinceSource)) : "";
  const selectedProvince = useMemo(() => {
    if (!selectedProvinceKey) return null;
    return provinceMarkers.find((province) => province.key === selectedProvinceKey) || null;
  }, [provinceMarkers, selectedProvinceKey]);
  const countyMarkers = useMemo(
    () => buildCountyMarkers(selectedProvince, wilayahMap),
    [selectedProvince, wilayahMap],
  );

  useEffect(() => {
    setSelectedCountyKey("");
    setKeyword("");
  }, [selectedProvinceKey]);

  const normalizedKeyword = normalisasiText(keyword);
  const filteredProvinceMarkers = useMemo(() => {
    if (!normalizedKeyword) return provinceMarkers;
    return provinceMarkers.filter((province) =>
      normalisasiText(
        `${province.name} ${province.kabupatenList.join(" ")} ${province.schools.map(getSchoolName).join(" ")}`,
      ).includes(normalizedKeyword),
    );
  }, [provinceMarkers, normalizedKeyword]);

  const filteredCountyMarkers = useMemo(() => {
    const source = selectedCountyKey
      ? countyMarkers.filter((county) => county.key === selectedCountyKey)
      : countyMarkers;

    if (!normalizedKeyword) return source;

    return source.filter((county) =>
      normalisasiText(
        `${county.name} ${county.schools.map((school) => `${getSchoolName(school)} ${getSchoolNpsn(school)} ${getSchoolLevel(school)}`).join(" ")}`,
      ).includes(normalizedKeyword),
    );
  }, [countyMarkers, normalizedKeyword, selectedCountyKey]);

  const totalKabupaten = provinceMarkers.reduce((total, province) => total + province.totalKabupaten, 0);
  const totalSekolah = provinceMarkers.reduce((total, province) => total + province.totalSekolah, 0);
  const resultCount = selectedProvince ? filteredCountyMarkers.length : filteredProvinceMarkers.length;
  const resultLabel = selectedProvince ? "kabupaten" : "provinsi";
  const pilihCounty = (county) => {
    if (!county) return;
    setSelectedCountyKey(county.key);
    onSelectWilayah?.({
      ...(county.wilayah || {}),
      nama_wilayah: county.name,
      nama: county.name,
      jenis_wilayah: "KABUPATEN",
      _parent_province_name: county.provinceName,
      _selected_kabupaten_key: county.key,
    });
  };

  return (
    <div className="admin-binaan-map space-y-4">
      <style>{`
        .admin-province-marker-wrapper,
        .admin-kabupaten-marker-wrapper { border: 0 !important; background: transparent !important; }
        .admin-province-marker { position: relative; width: 58px; height: 72px; filter: drop-shadow(0 10px 14px rgba(15,23,42,.2)); transform-origin: 50% 90%; transition: transform 180ms ease; }
        .admin-province-marker:hover { transform: scale(1.12); }
        .admin-province-marker__pin { position: absolute; left: 11px; top: 5px; width: 36px; height: 36px; border: 3px solid #fff; border-radius: 50% 50% 50% 0; background: #ef0018; transform: rotate(-45deg); box-shadow: 0 6px 18px rgba(239,0,24,.35); }
        .admin-province-marker__hole { position: absolute; left: 50%; top: 50%; width: 13px; height: 13px; border-radius: 999px; background: #fff; transform: translate(-50%, -50%); }
        .admin-province-marker__count { position: absolute; right: 0; top: 0; display: flex; min-width: 24px; height: 24px; align-items: center; justify-content: center; border: 2px solid #fff; border-radius: 999px; background: #0f172a; padding: 0 6px; font-size: 9px; font-weight: 900; color: #fff; line-height: 1; }
        .admin-kabupaten-marker { position: relative; display: flex; width: 168px; min-height: 46px; align-items: center; justify-content: center; transform-origin: 50% 70%; transition: transform 180ms ease; }
        .admin-kabupaten-marker:hover, .admin-kabupaten-marker.is-active { z-index: 4; transform: scale(1.08); }
        .admin-kabupaten-marker__dot { position: absolute; left: 50%; top: 0; display: flex; width: 31px; height: 31px; align-items: center; justify-content: center; border: 3px solid #fff; border-radius: 999px; background: #0ac4e0; color: #fff; box-shadow: 0 7px 18px rgba(10,196,224,.36); transform: translateX(-50%); }
        .admin-kabupaten-marker.is-active .admin-kabupaten-marker__dot { background: #0899B0; box-shadow: 0 9px 22px rgba(8,153,176,.42); }
        .admin-kabupaten-marker__dot span { font-size: 9px; font-weight: 900; line-height: 1; }
        .admin-kabupaten-marker__label { position: absolute; left: 50%; top: 29px; max-width: 158px; overflow: hidden; border: 1px solid rgba(226,232,240,.95); border-radius: 999px; background: rgba(255,255,255,.96); padding: 4px 9px; font-size: 8px; font-weight: 900; color: #475569; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; box-shadow: 0 6px 16px rgba(15,23,42,.12); transform: translateX(-50%); }
        .admin-kabupaten-marker.is-active .admin-kabupaten-marker__label { border-color: rgba(10,196,224,.4); background: #083344; color: #fff; }
        .admin-map-action-pulse { animation: adminMapActionPulse 1.45s ease-in-out infinite; }
        @keyframes adminMapActionPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(10,196,224,.3); transform: translateY(0); }
          50% { box-shadow: 0 0 0 8px rgba(10,196,224,0); transform: translateY(-1px); }
        }
      `}</style>

      <div className="relative h-[560px] overflow-hidden rounded-3xl border border-cyan-100 bg-slate-200 shadow-sm">
        <MapContainer
          center={INDONESIA_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={4}
          maxZoom={14}
          maxBounds={INDONESIA_MAX_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom
          className="h-full w-full"
        >
          <MapViewport
            selectedProvince={selectedProvince}
            provinceMarkers={filteredProvinceMarkers}
            countyMarkers={filteredCountyMarkers}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={indonesiaGeoJson} style={INDONESIA_GEOJSON_STYLE} interactive={false} />

          {!selectedProvince &&
            filteredProvinceMarkers.map((province) => {
              const position = [province.latitude, province.longitude];
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
                    eventHandlers={{ click: () => onSelectWilayah?.(province.wilayah) }}
                  />
                  <Marker
                    position={position}
                    icon={createProvinceMarkerIcon(province.totalSekolah)}
                    eventHandlers={{ click: () => onSelectWilayah?.(province.wilayah) }}
                  >
                    <Popup>
                      <div className="min-w-[245px]">
                        <p className="text-[15px] font-black text-slate-900">{province.name}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Provinsi Binaan</p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[8px] font-black uppercase text-slate-400">Kabupaten</p>
                            <p className="mt-1 text-lg font-black text-slate-800">{province.totalKabupaten}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[8px] font-black uppercase text-slate-400">Sekolah</p>
                            <p className="mt-1 text-lg font-black text-slate-800">{province.totalSekolah}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectWilayah?.(province.wilayah)}
                          className="admin-map-action-pulse mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#0AC4E0] px-3 text-[9px] font-black uppercase tracking-widest text-white"
                        >
                          Lihat Program Wilayah Ini
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}

          {selectedProvince &&
            filteredCountyMarkers.map((county) => {
              const position = [county.latitude, county.longitude];
              const active = selectedCountyKey === county.key;

              return (
                <Fragment key={county.key}>
                  <CircleMarker
                    center={position}
                    radius={active ? 18 : 11}
                    pathOptions={{
                      color: active ? "#0899B0" : "#0AC4E0",
                      fillColor: "#0AC4E0",
                      fillOpacity: active ? 0.24 : 0.1,
                      weight: active ? 3 : 2,
                    }}
                    eventHandlers={{ click: () => pilihCounty(county) }}
                  />
                  <Marker
                    position={position}
                    icon={createKabupatenMarkerIcon(county.name, county.totalSekolah, active)}
                    eventHandlers={{ click: () => pilihCounty(county) }}
                  >
                    <Popup minWidth={285} maxWidth={330}>
                      <div className="w-[285px]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                            <Building2 size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="break-words text-[14px] font-black text-slate-900">{county.name}</p>
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {county.provinceName} - {county.totalSekolah} sekolah
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 max-h-[190px] space-y-1.5 overflow-y-auto pr-1">
                          {county.schools.slice(0, 6).map((school) => (
                            <button
                              key={getSchoolId(school) || getSchoolName(school)}
                              type="button"
                              onClick={() => onOpenSchool?.(school)}
                              className="block w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-left transition hover:border-cyan-100 hover:bg-cyan-50"
                            >
                              <p className="break-words text-[10px] font-black text-slate-800">{getSchoolName(school)}</p>
                              <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                                {getSchoolLevel(school)} - NPSN {getSchoolNpsn(school)}
                              </p>
                            </button>
                          ))}
                        </div>

                        {county.schools.length > 6 && (
                          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                            Menampilkan 6 dari {county.schools.length} sekolah
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => pilihCounty(county)}
                          className="admin-map-action-pulse mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#0AC4E0] px-3 text-[9px] font-black uppercase tracking-widest text-white"
                        >
                          Lihat Program Wilayah Ini
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
            <span className={`h-3 w-3 rounded-full ${selectedProvince ? "bg-cyan-500" : "bg-red-500"}`} />
            {selectedProvince ? "Pilih Kabupaten" : "Pilih Provinsi"}
          </div>
        </div>

        {selectedProvince && (
          <AppButton
            text="Seluruh Indonesia"
            onClick={onResetFilter}
            variant="secondary"
            size="sm"
            className="!absolute !right-4 !top-4 !z-[500] !h-9 !rounded-xl !border !border-white/70 !bg-white/90 !px-4 !text-[9px] !tracking-widest !text-[#0AC4E0] shadow-sm backdrop-blur hover:!bg-cyan-50"
          />
        )}

      </div>
    </div>
  );
}

AdminSchoolBinaanMap.propTypes = {
  wilayahList: PropTypes.array,
  schools: PropTypes.array,
  selectedWilayah: PropTypes.object,
  onSelectWilayah: PropTypes.func,
  onResetFilter: PropTypes.func,
  onOpenSchool: PropTypes.func,
};
