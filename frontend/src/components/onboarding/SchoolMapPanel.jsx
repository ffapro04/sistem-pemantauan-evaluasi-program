/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import {
    GeoJSON,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
    ZoomControl,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    MapPin,
    RotateCcw,
    Search,
    School,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import OnboardingLeafletStyle from "./OnboardingLeafletStyle";
import indonesiaGeoJson from "../../assets/maps/indonesia-province-simple.json";

const INDONESIA_CENTER = [-2.5, 118];
const INDONESIA_BOUNDS = [
    [-11.2, 94.5],
    [6.5, 141.5],
];
const INDONESIA_MAX_BOUNDS = [
    [-13.0, 92.0],
    [8.2, 143.5],
];
const INDONESIA_GEOJSON_STYLE = {
    color: "#0AC4E0",
    weight: 1.25,
    opacity: 0.82,
    fillColor: "#0AC4E0",
    fillOpacity: 0.08,
};
const ITEMS_PER_PAGE = 5;

const PROVINCE_FALLBACKS = {
    aceh: [4.6951, 96.7494],
    "sumatera utara": [2.1154, 99.5451],
    "sumatera barat": [-0.7399, 100.8000],
    riau: [0.2933, 101.7068],
    "kepulauan riau": [3.9457, 108.1429],
    jambi: [-1.6101, 103.6131],
    "sumatera selatan": [-3.3194, 103.9144],
    "kepulauan bangka belitung": [-2.7411, 106.4406],
    bengkulu: [-3.5778, 102.3464],
    lampung: [-4.5586, 105.4068],
    banten: [-6.4058, 106.0640],
    jakarta: [-6.2088, 106.8456],
    "dki jakarta": [-6.2088, 106.8456],
    "jawa barat": [-6.9175, 107.6191],
    "jawa tengah": [-7.1509, 110.1403],
    yogyakarta: [-7.7956, 110.3695],
    "di yogyakarta": [-7.7956, 110.3695],
    "jawa timur": [-7.5361, 112.2384],
    bali: [-8.4095, 115.1889],
    "nusa tenggara barat": [-8.6529, 117.3616],
    "nusa tenggara timur": [-8.6574, 121.0794],
    "kalimantan barat": [-0.2788, 111.4753],
    "kalimantan tengah": [-1.6815, 113.3824],
    "kalimantan selatan": [-3.0926, 115.2838],
    "kalimantan timur": [0.5387, 116.4194],
    "kalimantan utara": [3.0731, 116.0414],
    "sulawesi utara": [0.6247, 123.9750],
    gorontalo: [0.6999, 122.4467],
    "sulawesi tengah": [-1.4300, 121.4456],
    "sulawesi barat": [-2.8441, 119.2321],
    "sulawesi selatan": [-3.6688, 119.9741],
    "sulawesi tenggara": [-4.1449, 122.1746],
    maluku: [-3.2385, 130.1453],
    "maluku utara": [1.5709, 127.8088],
    "papua barat": [-1.3361, 133.1747],
    "papua barat daya": [-1.1325, 131.2403],
    papua: [-4.2699, 138.0804],
    "papua tengah": [-3.4431, 136.3181],
    "papua pegunungan": [-4.0836, 138.9536],
    "papua selatan": [-7.7516, 139.3252],
};

const normalizeText = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/\b(?:provinsi|kabupaten|kab\.|kota administrasi|kota)\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

const getWilayahId = (item) =>
    item?.id_wilayah ?? item?.idWilayah ?? item?.id ?? null;

const getWilayahName = (item) =>
    item?.nama_wilayah || item?.namaWilayah || item?.nama || "Wilayah";

const getParentId = (item) =>
    item?.id_parent ?? item?.parent_id ?? item?.parent?.id_wilayah ?? item?.parent?.id ?? null;

const getSchoolId = (school) =>
    school?.id_sekolah ?? school?.idSekolah ?? school?.school_id ?? school?.id;

const getSchoolName = (school) =>
    school?.nama_sekolah || school?.namaSekolah || school?.school_name || school?.nama || "Sekolah";

const getSchoolNpsn = (school) => school?.npsn || school?.NPSN || "Belum tersedia";

const getSchoolLevel = (school) =>
    school?.jenjang || school?.tingkat || school?.level || "Belum tersedia";

const getSchoolAddress = (school) =>
    school?.alamat || school?.alamat_lengkap || school?.address || "Alamat belum tersedia";

const isProvince = (item) => {
    const type = String(item?.jenis_wilayah || item?.tipe_wilayah || item?.jenis || "").toUpperCase();
    return (
        type.includes("PROVINSI") ||
        (!getParentId(item) && !type.includes("KABUPATEN") && !type.includes("KOTA"))
    );
};

const isCounty = (item) => {
    const type = String(item?.jenis_wilayah || item?.tipe_wilayah || item?.jenis || "").toUpperCase();
    return type.includes("KABUPATEN") || type.includes("KOTA") || Boolean(getParentId(item));
};

const parseCoordinate = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed !== 0 ? parsed : null;
};

const getCoordinate = (item) => {
    const lat = parseCoordinate(item?.latitude ?? item?.lat);
    const lng = parseCoordinate(item?.longitude ?? item?.lng ?? item?.lon);
    return lat !== null && lng !== null ? [lat, lng] : null;
};

const getBoundsCenter = (item) => {
    const raw = item?.bounds;
    if (!Array.isArray(raw) || raw.length < 2) return null;

    const points = raw
        .flat(3)
        .filter((value) => Number.isFinite(Number(value)))
        .map(Number);

    if (points.length < 4) return null;

    const pairs = [];
    for (let index = 0; index + 1 < points.length; index += 2) {
        const lat = points[index];
        const lng = points[index + 1];
        if (lat >= -12 && lat <= 7 && lng >= 94 && lng <= 142) {
            pairs.push([lat, lng]);
        }
    }

    if (!pairs.length) return null;

    return [
        pairs.reduce((total, point) => total + point[0], 0) / pairs.length,
        pairs.reduce((total, point) => total + point[1], 0) / pairs.length,
    ];
};

const averageCoordinate = (items) => {
    const coordinates = items.map(getCoordinate).filter(Boolean);
    if (!coordinates.length) return null;

    return [
        coordinates.reduce((total, point) => total + point[0], 0) / coordinates.length,
        coordinates.reduce((total, point) => total + point[1], 0) / coordinates.length,
    ];
};

const deterministicOffset = (key, index) => {
    const seed = String(key || index)
        .split("")
        .reduce((total, character) => total + character.charCodeAt(0), 0);
    const angle = ((seed + index * 37) % 360) * (Math.PI / 180);
    const radius = 0.35 + ((seed % 7) * 0.05);
    return [Math.sin(angle) * radius, Math.cos(angle) * radius];
};

function flattenWilayah(wilayahList) {
    const result = [];
    const seen = new Set();

    const visit = (item, inheritedParentId = null) => {
        if (!item || typeof item !== "object") return;

        const id = getWilayahId(item);
        const key = id != null ? String(id) : `${getWilayahName(item)}-${inheritedParentId}`;

        if (!seen.has(key)) {
            seen.add(key);
            result.push({
                ...item,
                id_wilayah: id,
                id_parent: getParentId(item) ?? inheritedParentId,
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
            collection.forEach((child) => visit(child, id ?? inheritedParentId));
        });
    };

    normalizeArray(wilayahList).forEach((item) => visit(item));
    return result;
}

function buildLocationModel(wilayahList, schools) {
    const flattened = flattenWilayah(wilayahList);
    const provinceList = flattened.filter(isProvince);
    const countyList = flattened.filter((item) => !isProvince(item) && isCounty(item));

    const byId = new Map(
        flattened
            .filter((item) => getWilayahId(item) != null)
            .map((item) => [String(getWilayahId(item)), item]),
    );

    const provinceByName = new Map(
        provinceList.map((item) => [normalizeText(getWilayahName(item)), item]),
    );

    const countyByName = new Map(
        countyList.map((item) => [normalizeText(getWilayahName(item)), item]),
    );

    const groups = new Map();

    const ensureProvince = (province) => {
        if (!province) return null;
        const provinceId = getWilayahId(province);
        const name = getWilayahName(province);
        const key = provinceId != null ? String(provinceId) : `province:${normalizeText(name)}`;

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                id: provinceId ?? key,
                province,
                name,
                schools: [],
                counties: new Map(),
            });
        }

        return groups.get(key);
    };

    schools.forEach((school) => {
        const countyId =
            school?.id_kabupaten ??
            school?.kabupaten_id ??
            school?.id_kota ??
            school?.kota_id ??
            school?.kabupaten?.id_wilayah ??
            school?.kabupaten?.id ??
            null;

        const directWilayahId =
            school?.id_wilayah ?? school?.wilayah_id ?? school?.wilayah?.id_wilayah ?? null;

        let county = countyId != null ? byId.get(String(countyId)) : null;
        if (!county && directWilayahId != null) {
            const directWilayah = byId.get(String(directWilayahId));
            if (directWilayah && !isProvince(directWilayah)) county = directWilayah;
        }

        if (!county) {
            const countyName =
                school?.nama_kabupaten ||
                school?.kabupaten?.nama_wilayah ||
                school?.kabupaten?.nama ||
                school?.kabupaten ||
                school?.nama_kota;
            if (countyName) county = countyByName.get(normalizeText(countyName));
        }

        const provinceId =
            school?.id_provinsi ??
            school?.provinsi_id ??
            school?.provinsi?.id_wilayah ??
            county?.id_parent ??
            null;

        let province = provinceId != null ? byId.get(String(provinceId)) : null;
        if (!province && directWilayahId != null) {
            const directWilayah = byId.get(String(directWilayahId));
            if (directWilayah && isProvince(directWilayah)) province = directWilayah;
        }

        if (!province && county?.id_parent != null) {
            province = byId.get(String(county.id_parent));
        }

        if (!province) {
            const provinceName =
                school?.nama_provinsi ||
                school?.provinsi?.nama_wilayah ||
                school?.provinsi?.nama ||
                school?.provinsi ||
                county?.parent?.nama_wilayah;
            if (provinceName) province = provinceByName.get(normalizeText(provinceName));
        }

        if (!province && provinceList.length === 1) province = provinceList[0];
        if (!province) return;

        const provinceGroup = ensureProvince(province);
        provinceGroup.schools.push(school);

        const countyName =
            (county ? getWilayahName(county) : "") ||
            school?.nama_kabupaten ||
            school?.kabupaten?.nama_wilayah ||
            school?.kabupaten ||
            "Kabupaten/Kota Belum Dipetakan";

        const countyKey = county
            ? String(getWilayahId(county) ?? normalizeText(countyName))
            : `county:${normalizeText(countyName) || "unmapped"}`;

        if (!provinceGroup.counties.has(countyKey)) {
            provinceGroup.counties.set(countyKey, {
                key: countyKey,
                id: getWilayahId(county) ?? countyKey,
                county,
                name: countyName,
                schools: [],
            });
        }

        provinceGroup.counties.get(countyKey).schools.push(school);
    });

    provinceList.forEach((province) => {
        const group = ensureProvince(province);
        const provinceId = getWilayahId(province);

        countyList
            .filter((county) => String(getParentId(county)) === String(provinceId))
            .forEach((county) => {
                const countyId = getWilayahId(county);
                const countyKey = String(countyId ?? normalizeText(getWilayahName(county)));
                if (!group.counties.has(countyKey)) {
                    group.counties.set(countyKey, {
                        key: countyKey,
                        id: countyId ?? countyKey,
                        county,
                        name: getWilayahName(county),
                        schools: [],
                    });
                }
            });
    });

    const finalGroups = [...groups.values()]
        .map((group) => {
            const countyGroups = [...group.counties.values()]
                .filter((countyGroup) => countyGroup.schools.length > 0)
                .map((countyGroup, index) => {
                    const provinceFallback =
                        getCoordinate(group.province) ||
                        getBoundsCenter(group.province) ||
                        PROVINCE_FALLBACKS[normalizeText(group.name)] ||
                        INDONESIA_CENTER;

                    const offset = deterministicOffset(countyGroup.key, index);
                    const position =
                        getCoordinate(countyGroup.county) ||
                        getBoundsCenter(countyGroup.county) ||
                        averageCoordinate(countyGroup.schools) ||
                        [provinceFallback[0] + offset[0], provinceFallback[1] + offset[1]];

                    return {
                        ...countyGroup,
                        position,
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

            const position =
                getCoordinate(group.province) ||
                getBoundsCenter(group.province) ||
                averageCoordinate(countyGroups.map((item) => ({ latitude: item.position[0], longitude: item.position[1] }))) ||
                averageCoordinate(group.schools) ||
                PROVINCE_FALLBACKS[normalizeText(group.name)] ||
                INDONESIA_CENTER;

            return {
                ...group,
                counties: countyGroups,
                position,
            };
        })
        .filter((group) => group.schools.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    return finalGroups;
}

function createProvinceIcon(totalSchools, selected = false) {
    return L.divIcon({
        className: "onboarding-province-marker",
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:${selected ? "#B91C1C" : "#EF4444"};border:4px solid #fff;box-shadow:0 12px 30px rgba(15,23,42,.28)"><span style="transform:rotate(45deg);font:900 12px/1 Arial;color:#fff">${totalSchools}</span></div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 40],
        popupAnchor: [0, -38],
    });
}

function createCountyIcon(totalSchools, selected = false) {
    return L.divIcon({
        className: "onboarding-county-marker",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:14px;background:${selected ? "#0369A1" : "#0AC4E0"};border:3px solid #fff;box-shadow:0 10px 24px rgba(15,23,42,.22);font:900 11px/1 Arial;color:#fff">${totalSchools}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
}

function MapViewportController({ provinceGroup, countyGroup }) {
    const map = useMap();

    useEffect(() => {
        const applyViewport = () => {
            map.stop();
            map.invalidateSize({ pan: false });

            if (countyGroup) {
                const points = countyGroup.schools.map(getCoordinate).filter(Boolean);

                if (points.length >= 2) {
                    map.fitBounds(L.latLngBounds(points), {
                        padding: [55, 55],
                        maxZoom: 11,
                        animate: true,
                    });
                } else {
                    map.setView(countyGroup.position, 10, { animate: true });
                }
                return;
            }

            if (provinceGroup) {
                const points = [
                    ...provinceGroup.counties.map((item) => item.position),
                    ...provinceGroup.schools.map(getCoordinate).filter(Boolean),
                ];

                if (points.length >= 2) {
                    map.fitBounds(L.latLngBounds(points), {
                        padding: [65, 65],
                        maxZoom: 8,
                        animate: true,
                    });
                } else {
                    map.setView(provinceGroup.position, 7, { animate: true });
                }
                return;
            }

            map.fitBounds(INDONESIA_BOUNDS, {
                padding: [18, 18],
                animate: true,
            });
        };

        applyViewport();
        const timers = [80, 240, 520, 900].map((delay) =>
            window.setTimeout(applyViewport, delay),
        );
        window.addEventListener("resize", applyViewport);

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
            window.removeEventListener("resize", applyViewport);
        };
    }, [map, provinceGroup?.key, countyGroup?.key]);

    return null;
}

function CountyPopup({ countyGroup, onOpenSchool }) {
    const [keyword, setKeyword] = useState("");

    const visibleSchools = useMemo(() => {
        const normalizedKeyword = normalizeText(keyword);
        const filtered = countyGroup.schools.filter((school) => {
            if (!normalizedKeyword) return true;
            return normalizeText(
                `${getSchoolName(school)} ${getSchoolNpsn(school)} ${getSchoolLevel(school)} ${getSchoolAddress(school)}`,
            ).includes(normalizedKeyword);
        });

        return filtered.slice(0, 5);
    }, [countyGroup, keyword]);

    return (
        <div className="w-[280px] bg-white font-sans">
            <div className="border-b border-slate-100 px-4 py-4">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                    Kabupaten/Kota Binaan
                </p>
                <h4 className="mt-1 text-base font-black text-slate-950">
                    {countyGroup.name}
                </h4>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                    {countyGroup.schools.length} sekolah terhubung
                </p>
            </div>

            <div className="p-4">
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Cari sekolah atau NPSN..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[10px] font-bold text-slate-700 outline-none focus:border-cyan-300"
                    />
                </div>

                <div className="mt-3 space-y-2">
                    {visibleSchools.length ? (
                        visibleSchools.map((school) => (
                            <button
                                key={getSchoolId(school)}
                                type="button"
                                onClick={() => onOpenSchool(school)}
                                className="w-full rounded-xl border border-slate-100 bg-white px-3 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50"
                            >
                                <p className="line-clamp-1 text-[10px] font-black text-slate-800">
                                    {getSchoolName(school)}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-slate-400">
                                    {getSchoolLevel(school)} · NPSN {getSchoolNpsn(school)}
                                </p>
                            </button>
                        ))
                    ) : (
                        <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-[10px] font-bold text-slate-400">
                            Sekolah tidak ditemukan.
                        </p>
                    )}
                </div>

                {countyGroup.schools.length > 5 && !keyword && (
                    <p className="mt-3 text-center text-[9px] font-bold text-slate-400">
                        Menampilkan 5 dari {countyGroup.schools.length} sekolah
                    </p>
                )}
            </div>
        </div>
    );
}

function SchoolMap({
    provinceGroups,
    activeProvince,
    activeCounty,
    visibleProvinceGroups,
    visibleCountyGroups,
    onSelectProvince,
    onSelectCounty,
    onOpenSchool,
}) {
    return (
        <div className="relative h-[560px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 lg:h-[700px]">
            <MapContainer
                center={INDONESIA_CENTER}
                zoom={5}
                style={{ height: "100%", width: "100%", background: "#F1F5F9" }}
                zoomControl={false}
                maxBounds={INDONESIA_MAX_BOUNDS}
                maxBoundsViscosity={1}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GeoJSON
                    data={indonesiaGeoJson}
                    style={INDONESIA_GEOJSON_STYLE}
                    interactive={false}
                />

                <ZoomControl position="bottomright" />
                <MapViewportController
                    provinceGroup={activeProvince}
                    countyGroup={activeCounty}
                />

                {!activeProvince &&
                    visibleProvinceGroups.map((group) => (
                        <Marker
                            key={group.key}
                            position={group.position}
                            icon={createProvinceIcon(group.schools.length)}
                            eventHandlers={{ click: () => onSelectProvince(group) }}
                        >
                            <Popup>
                                <div className="w-[250px] bg-white p-5 font-sans">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">
                                        Provinsi Binaan
                                    </p>
                                    <h4 className="mt-2 text-lg font-black text-slate-950">
                                        {group.name}
                                    </h4>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-[8px] font-black uppercase text-slate-400">
                                                Kabupaten/Kota
                                            </p>
                                            <p className="mt-1 text-xl font-black text-slate-900">
                                                {group.counties.length}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-cyan-50 p-3">
                                            <p className="text-[8px] font-black uppercase text-cyan-500">
                                                Sekolah
                                            </p>
                                            <p className="mt-1 text-xl font-black text-cyan-600">
                                                {group.schools.length}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onSelectProvince(group)}
                                        className="mt-4 w-full rounded-xl bg-slate-950 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                                    >
                                        Fokuskan Provinsi
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {activeProvince &&
                    visibleCountyGroups.map((countyGroup) => (
                        <Marker
                            key={countyGroup.key}
                            position={countyGroup.position}
                            icon={createCountyIcon(
                                countyGroup.schools.length,
                                activeCounty?.key === countyGroup.key,
                            )}
                            eventHandlers={{ click: () => onSelectCounty(countyGroup) }}
                        >
                            <Tooltip direction="bottom" offset={[0, 18]} opacity={1} permanent>
                                <span className="text-[9px] font-black text-slate-700">
                                    {countyGroup.name}
                                </span>
                            </Tooltip>
                            <Popup maxWidth={320}>
                                <CountyPopup
                                    countyGroup={countyGroup}
                                    onOpenSchool={onOpenSchool}
                                />
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>

            <div className="absolute left-5 top-5 z-[1000] max-w-[calc(100%-40px)] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg sm:left-7 sm:top-7">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Tampilan Peta
                </p>
                <p className="mt-1 max-w-[300px] truncate text-sm font-black text-slate-900">
                    {activeCounty?.name || activeProvince?.name || "Seluruh Indonesia"}
                </p>
            </div>

            <div className="absolute bottom-5 left-5 z-[1000] flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:bottom-7 sm:left-7">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Provinsi
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#0AC4E0]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Kabupaten/Kota
                    </span>
                </div>
            </div>

            <OnboardingLeafletStyle />
        </div>
    );
}

function SchoolRegistry({
    schools,
    currentPage,
    totalPages,
    totalFiltered,
    onPageChange,
    onOpenSchool,
}) {
    return (
        <div className="flex min-h-[560px] flex-col rounded-[2rem] border border-slate-200 bg-white p-5 lg:min-h-[700px]">
            <div className="border-b border-slate-100 pb-5">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                    Registry Sekolah
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">
                    Sekolah Terhubung
                </h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                    {totalFiltered} sekolah sesuai area dan pencarian aktif.
                </p>
            </div>

            <div className="mt-5 flex-1 space-y-3">
                {schools.length ? (
                    schools.map((school) => (
                        <button
                            key={getSchoolId(school)}
                            type="button"
                            onClick={() => onOpenSchool(school)}
                            className="group w-full rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-cyan-200 hover:bg-cyan-50"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                                    <School size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-black leading-5 text-slate-900">
                                        {getSchoolName(school)}
                                    </p>
                                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                                        {getSchoolLevel(school)} · NPSN {getSchoolNpsn(school)}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-slate-400">
                                        {school?.nama_kabupaten || school?.kabupaten?.nama_wilayah || "Kabupaten belum dipetakan"}
                                    </p>
                                </div>
                                <MapPin
                                    size={16}
                                    className="mt-1 shrink-0 text-slate-300 transition group-hover:text-[#0AC4E0]"
                                />
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                        <School size={28} className="text-slate-300" />
                        <p className="mt-4 text-sm font-black text-slate-700">
                            Sekolah tidak ditemukan
                        </p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                            Ubah provinsi, kabupaten, atau kata kunci pencarian.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
                >
                    <ChevronLeft size={17} />
                </button>

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Halaman {currentPage}/{totalPages}
                </p>

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0AC4E0] text-white disabled:opacity-30"
                >
                    <ChevronRight size={17} />
                </button>
            </div>
        </div>
    );
}

function SchoolMapPanel({
    wilayahList = [],
    selectedWilayah,
    schools = [],
    totalSchools,
    onSelectWilayah,
    onResetFilter,
    onOpenSchool,
}) {
    const [selectedCountyKey, setSelectedCountyKey] = useState("");
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const provinceGroups = useMemo(
        () => buildLocationModel(wilayahList, schools),
        [wilayahList, schools],
    );

    const selectedProvinceKey = selectedWilayah
        ? String(getWilayahId(selectedWilayah) ?? `province:${normalizeText(getWilayahName(selectedWilayah))}`)
        : "";

    const activeProvince = useMemo(() => {
        if (!selectedProvinceKey) return null;
        return (
            provinceGroups.find(
                (group) =>
                    String(group.id) === selectedProvinceKey ||
                    String(group.key) === selectedProvinceKey ||
                    normalizeText(group.name) === normalizeText(getWilayahName(selectedWilayah)),
            ) || null
        );
    }, [provinceGroups, selectedProvinceKey, selectedWilayah]);

    const activeCounty = useMemo(() => {
        if (!activeProvince || !selectedCountyKey) return null;
        return (
            activeProvince.counties.find(
                (county) => String(county.key) === String(selectedCountyKey),
            ) || null
        );
    }, [activeProvince, selectedCountyKey]);

    useEffect(() => {
        setSelectedCountyKey("");
        setCurrentPage(1);
    }, [selectedProvinceKey]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCountyKey, keyword]);

    const normalizedKeyword = normalizeText(keyword);

    const visibleProvinceGroups = useMemo(() => {
        if (!normalizedKeyword) return provinceGroups;

        return provinceGroups.filter((group) =>
            normalizeText(
                `${group.name} ${group.counties.map((county) => county.name).join(" ")} ${group.schools
                    .map((school) => `${getSchoolName(school)} ${getSchoolNpsn(school)}`)
                    .join(" ")}`,
            ).includes(normalizedKeyword),
        );
    }, [provinceGroups, normalizedKeyword]);

    const visibleCountyGroups = useMemo(() => {
        if (!activeProvince) return [];

        return activeProvince.counties.filter((county) => {
            if (selectedCountyKey && String(county.key) !== String(selectedCountyKey)) {
                return false;
            }
            if (!normalizedKeyword) return true;

            return normalizeText(
                `${county.name} ${county.schools
                    .map(
                        (school) =>
                            `${getSchoolName(school)} ${getSchoolNpsn(school)} ${getSchoolLevel(school)}`,
                    )
                    .join(" ")}`,
            ).includes(normalizedKeyword);
        });
    }, [activeProvince, selectedCountyKey, normalizedKeyword]);

    const filteredSchools = useMemo(() => {
        let source = activeCounty?.schools || activeProvince?.schools || schools;

        if (normalizedKeyword) {
            source = source.filter((school) =>
                normalizeText(
                    `${getSchoolName(school)} ${getSchoolNpsn(school)} ${getSchoolLevel(school)} ${getSchoolAddress(school)} ${school?.nama_kabupaten || ""}`,
                ).includes(normalizedKeyword),
            );
        }

        return [...source].sort((a, b) => getSchoolName(a).localeCompare(getSchoolName(b)));
    }, [activeCounty, activeProvince, schools, normalizedKeyword]);

    const totalPages = Math.max(1, Math.ceil(filteredSchools.length / ITEMS_PER_PAGE));
    const paginatedSchools = filteredSchools.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const selectProvince = (group) => {
        setSelectedCountyKey("");
        setKeyword("");
        onSelectWilayah?.(group.province);
    };

    const resetMap = () => {
        setSelectedCountyKey("");
        setKeyword("");
        setCurrentPage(1);
        onResetFilter?.();
    };

    return (
        <section className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Monitoring Area
                    </p>
                    <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-[-0.05em] text-slate-950 sm:text-4xl">
                        Provinsi, Kabupaten, dan Sekolah dalam Satu Peta
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-500">
                        Marker merah menunjukkan provinsi binaan. Fokuskan provinsi untuk melihat marker kabupaten/kota dan sekolah yang terhubung di dalamnya.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Provinsi Binaan
                        </p>
                        <p className="mt-1 text-2xl font-black text-red-500">
                            {provinceGroups.length}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-600">
                            Sekolah Terpantau
                        </p>
                        <p className="mt-1 text-2xl font-black text-cyan-600">
                            {totalSchools ?? schools.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-[1.8rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_auto]">
                <select
                    value={selectedProvinceKey}
                    onChange={(event) => {
                        const group = provinceGroups.find(
                            (item) => String(item.id) === event.target.value || item.key === event.target.value,
                        );
                        if (group) selectProvince(group);
                        else resetMap();
                    }}
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 outline-none focus:border-cyan-300"
                >
                    <option value="">Semua Provinsi</option>
                    {provinceGroups.map((group) => (
                        <option key={group.key} value={String(group.id)}>
                            {group.name} ({group.schools.length})
                        </option>
                    ))}
                </select>

                <select
                    value={selectedCountyKey}
                    disabled={!activeProvince}
                    onChange={(event) => setSelectedCountyKey(event.target.value)}
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                >
                    <option value="">Semua Kabupaten/Kota</option>
                    {(activeProvince?.counties || []).map((county) => (
                        <option key={county.key} value={county.key}>
                            {county.name} ({county.schools.length})
                        </option>
                    ))}
                </select>

                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Cari provinsi, kabupaten, sekolah, NPSN..."
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-cyan-300"
                    />
                </div>

                <button
                    type="button"
                    onClick={resetMap}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
                >
                    {activeProvince ? <ArrowLeft size={15} /> : <RotateCcw size={15} />}
                    {activeProvince ? "Kembali ke Indonesia" : "Reset"}
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.42fr_0.58fr]">
                <SchoolMap
                    provinceGroups={provinceGroups}
                    activeProvince={activeProvince}
                    activeCounty={activeCounty}
                    visibleProvinceGroups={visibleProvinceGroups}
                    visibleCountyGroups={visibleCountyGroups}
                    onSelectProvince={selectProvince}
                    onSelectCounty={(county) => setSelectedCountyKey(county.key)}
                    onOpenSchool={onOpenSchool}
                />

                <SchoolRegistry
                    schools={paginatedSchools}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalFiltered={filteredSchools.length}
                    onPageChange={setCurrentPage}
                    onOpenSchool={onOpenSchool}
                />
            </div>
        </section>
    );
}

export default SchoolMapPanel;

