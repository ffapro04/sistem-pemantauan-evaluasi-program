/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Factory,
    Layers3,
    Loader2,
    MapPinned,
    RefreshCcw,
    Search,
    School,
    Sparkles,
    TrendingUp,
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
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "../../components/Sidebar";
import PageWrapper from "../../components/PageWrapper";
import Dropdown from "../../components/Dropdown";
import { CHART_STATUS_COLORS } from "../../utils/chartPalette";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const INDONESIA_CENTER = [-2.5, 118];
const INDONESIA_ZOOM = 5;
const ROWS_PER_PAGE = 5;

const COLORS = {
    cyan: CHART_STATUS_COLORS.info,
    cyanDark: CHART_STATUS_COLORS.deep,
    navy: "#0F172A",
    slate: "#334155",
    grey: "#94A3B8",
    coksu: CHART_STATUS_COLORS.orange,
    brown: CHART_STATUS_COLORS.deep,
    green: CHART_STATUS_COLORS.success,
    emerald: CHART_STATUS_COLORS.success,
    amber: CHART_STATUS_COLORS.warning,
    orange: CHART_STATUS_COLORS.orange,
    violet: CHART_STATUS_COLORS.deep,
    rose: CHART_STATUS_COLORS.pink,
    red: CHART_STATUS_COLORS.danger,
    blue: CHART_STATUS_COLORS.info,
    sky: CHART_STATUS_COLORS.info,
    white: "#FFFFFF",
};

const PILLAR_META = {
    AKADEMIK: {
        label: "Akademik",
        color: COLORS.sky,
        soft: "border-sky-200 bg-sky-50 text-sky-700",
    },
    KARAKTER: {
        label: "Karakter",
        color: COLORS.violet,
        soft: "border-violet-200 bg-violet-50 text-violet-700",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        color: COLORS.orange,
        soft: "border-orange-200 bg-orange-50 text-orange-700",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        color: COLORS.emerald,
        soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
};

const PILLAR_OPTIONS = [
    { value: "ALL", label: "Semua Pilar" },
    ...Object.entries(PILLAR_META).map(([value, item]) => ({
        value,
        label: item.label,
    })),
];

const PROGRAM_TYPE_OPTIONS = [
    { value: "ALL", label: "Semua Jenis" },
    { value: "REGULER", label: "Reguler" },
    { value: "PROJECT", label: "Project" },
];

const PROGRAM_STATUS_OPTIONS = [
    { value: "ALL", label: "Semua Status" },
    { value: "PROSES", label: "Dalam Proses" },
    { value: "SELESAI", label: "Selesai" },
];

const VENDOR_CATEGORY_OPTIONS = [
    { value: "ALL", label: "Semua Vendor" },
    { value: "AKADEMIK", label: "Akademik" },
    { value: "NON_AKADEMIK", label: "Non Akademik" },
];

const PROVINCE_FALLBACKS = {
    ACEH: [4.6951, 96.7494],
    "SUMATERA UTARA": [2.1154, 99.5451],
    "SUMATERA BARAT": [-0.7399, 100.8000],
    RIAU: [0.2933, 101.7068],
    "KEPULAUAN RIAU": [3.9457, 108.1429],
    JAMBI: [-1.6101, 103.6131],
    "SUMATERA SELATAN": [-3.3194, 103.9144],
    BENGKULU: [-3.5778, 102.3464],
    LAMPUNG: [-4.5586, 105.4068],
    "KEPULAUAN BANGKA BELITUNG": [-2.7411, 106.4406],
    BANTEN: [-6.4058, 106.0640],
    "DKI JAKARTA": [-6.2088, 106.8456],
    "JAWA BARAT": [-6.9175, 107.6191],
    "JAWA TENGAH": [-7.1510, 110.1403],
    "DI YOGYAKARTA": [-7.7956, 110.3695],
    "DAERAH ISTIMEWA YOGYAKARTA": [-7.7956, 110.3695],
    "JAWA TIMUR": [-7.5361, 112.2384],
    BALI: [-8.3405, 115.0920],
    "NUSA TENGGARA BARAT": [-8.6529, 117.3616],
    "NUSA TENGGARA TIMUR": [-8.6574, 121.0794],
    "KALIMANTAN BARAT": [-0.2788, 111.4753],
    "KALIMANTAN TENGAH": [-1.6815, 113.3824],
    "KALIMANTAN SELATAN": [-3.0926, 115.2838],
    "KALIMANTAN TIMUR": [0.5387, 116.4194],
    "KALIMANTAN UTARA": [3.0731, 116.0414],
    "SULAWESI UTARA": [0.6247, 123.9750],
    GORONTALO: [0.6999, 122.4467],
    "SULAWESI TENGAH": [-1.4300, 121.4456],
    "SULAWESI BARAT": [-2.8441, 119.2321],
    "SULAWESI SELATAN": [-3.6688, 119.9741],
    "SULAWESI TENGGARA": [-4.1449, 122.1746],
    MALUKU: [-3.2385, 130.1453],
    "MALUKU UTARA": [1.5709, 127.8088],
    "PAPUA BARAT": [-1.3361, 133.1747],
    "PAPUA BARAT DAYA": [-1.1423, 131.8546],
    PAPUA: [-4.2699, 138.0804],
    "PAPUA SELATAN": [-6.5000, 140.0000],
    "PAPUA TENGAH": [-3.7250, 136.5000],
    "PAPUA PEGUNUNGAN": [-4.0000, 138.8000],
};

function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function normalizeKey(value) {
    return String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/\bPROVINSI\b/g, "")
        .replace(/\bKABUPATEN\b/g, "")
        .replace(/\bKAB\.\b/g, "")
        .replace(/\bKOTA\b/g, "")
        .replace(/[._/-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function safeText(...values) {
    for (const value of values) {
        if (value === 0) return "0";
        if (value === false) return "Tidak";
        if (value === true) return "Ya";

        const text = String(value ?? "").trim();
        if (
            text &&
            text !== "-" &&
            text !== "-" &&
            text.toLowerCase() !== "null" &&
            text.toLowerCase() !== "undefined"
        ) {
            return text;
        }
    }

    return "Belum Diisi";
}

function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;

    const candidates = [
        payload?.data,
        payload?.result,
        payload?.items,
        payload?.rows,
        payload?.wilayah,
        payload?.sekolah,
        payload?.schools,
        payload?.vendor,
        payload?.vendors,
        payload?.program,
        payload?.programs,
    ];

    return candidates.find(Array.isArray) || [];
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

async function fetchFirst(endpointList, headers = {}) {
    for (const endpoint of endpointList) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12000);

        try {
            const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
            url.searchParams.set("_ts", Date.now().toString());
            const response = await fetch(url.toString(), {
                headers: {
                    ...headers,
                    "Cache-Control": "no-store",
                    Pragma: "no-cache",
                },
                signal: controller.signal,
            });

            if (!response.ok) continue;

            return await safeJson(response);
        } catch {
            // mencoba endpoint berikutnya
        } finally {
            window.clearTimeout(timeout);
        }
    }

    return [];
}

function flattenWilayahTree(payload) {
    const roots = normalizeArray(payload);
    const result = [];
    const visited = new Set();

    const walk = (item, parent = null) => {
        if (!item || typeof item !== "object") return;

        const id = item?.id_wilayah ?? item?.id ?? item?.kode_wilayah ?? item?.kode;
        const key = String(id ?? `${item?.nama_wilayah}-${result.length}`);

        if (visited.has(key)) return;
        visited.add(key);

        const normalized = {
            ...item,
            id_parent:
                item?.id_parent ??
                item?.parent_id ??
                item?.parent?.id_wilayah ??
                item?.parent?.id ??
                parent?.id_wilayah ??
                parent?.id ??
                null,
            parent: item?.parent || parent || null,
        };

        result.push(normalized);

        const childCollections = [
            item?.children,
            item?.childrens,
            item?.kabupaten,
            item?.kabupatens,
            item?.kabupaten_kota,
            item?.kabupatenKota,
            item?.wilayah_anak,
            item?.wilayahAnak,
            item?.items,
        ];

        childCollections.forEach((collection) => {
            if (Array.isArray(collection)) {
                collection.forEach((child) => walk(child, normalized));
            }
        });
    };

    roots.forEach((root) => walk(root));
    return result;
}

function getRegionId(region) {
    return (
        region?.id_wilayah ??
        region?.id ??
        region?.wilayah_id ??
        region?.kode_wilayah ??
        null
    );
}

function getParentId(region) {
    return (
        region?.id_parent ??
        region?.parent_id ??
        region?.id_provinsi ??
        region?.parent?.id_wilayah ??
        region?.parent?.id ??
        null
    );
}

function getRegionName(region) {
    return safeText(
        region?.nama_wilayah,
        region?.nama,
        region?.name,
        region?.nama_kabupaten,
        region?.nama_provinsi,
    );
}

function getRegionType(region) {
    const raw = String(
        region?.jenis_wilayah ??
        region?.tipe_wilayah ??
        region?.jenis ??
        region?.tipe ??
        "",
    ).toUpperCase();

    if (raw.includes("PROV")) return "PROVINSI";
    if (raw.includes("KAB") || raw.includes("KOTA")) return "KABUPATEN";

    return getParentId(region) ? "KABUPATEN" : "PROVINSI";
}

function getRegionArea(region) {
    return safeText(
        region?.area_wilayah,
        region?.areaWilayah,
        region?.nama_area,
        region?.area_binaan,
        region?.area,
    );
}

function parseBounds(boundsValue) {
    if (!boundsValue) return null;

    let value = boundsValue;

    if (typeof value === "string") {
        try {
            value = JSON.parse(value);
        } catch {
            return null;
        }
    }

    let south;
    let west;
    let north;
    let east;

    if (Array.isArray(value) && value.length >= 2) {
        if (Array.isArray(value[0]) && Array.isArray(value[1])) {
            south = numberValue(value[0][0]);
            west = numberValue(value[0][1]);
            north = numberValue(value[1][0]);
            east = numberValue(value[1][1]);
        } else if (value.length >= 4) {
            [south, west, north, east] = value.map(numberValue);
        }
    } else if (typeof value === "object") {
        south = numberValue(
            value?.south ?? value?.minLat ?? value?.southWest?.lat ?? value?._southWest?.lat,
        );
        west = numberValue(
            value?.west ?? value?.minLng ?? value?.southWest?.lng ?? value?._southWest?.lng,
        );
        north = numberValue(
            value?.north ?? value?.maxLat ?? value?.northEast?.lat ?? value?._northEast?.lat,
        );
        east = numberValue(
            value?.east ?? value?.maxLng ?? value?.northEast?.lng ?? value?._northEast?.lng,
        );
    }

    if ([south, west, north, east].some((item) => item === null)) return null;
    if (south < -12 || north > 7.5 || west < 94 || east > 142) return null;
    if (south >= north || west >= east) return null;

    return [
        [south, west],
        [north, east],
    ];
}

function getRegionCoordinate(region) {
    const lat = numberValue(
        region?.latitude ??
        region?.lat ??
        region?.koordinat?.latitude ??
        region?.koordinat?.lat,
    );
    const lng = numberValue(
        region?.longitude ??
        region?.lng ??
        region?.long ??
        region?.koordinat?.longitude ??
        region?.koordinat?.lng,
    );

    if (
        lat !== null &&
        lng !== null &&
        lat >= -12 &&
        lat <= 7.5 &&
        lng >= 94 &&
        lng <= 142
    ) {
        return [lat, lng];
    }

    const bounds = parseBounds(region?.bounds ?? region?.batas_wilayah);
    if (bounds) {
        return [
            (bounds[0][0] + bounds[1][0]) / 2,
            (bounds[0][1] + bounds[1][1]) / 2,
        ];
    }

    return null;
}

function buildRegionIndex(regions) {
    const byId = new Map();
    const byName = new Map();
    const provinces = [];
    const districts = [];

    regions.forEach((region) => {
        const id = getRegionId(region);
        const nameKey = normalizeKey(getRegionName(region));

        if (id !== null && id !== undefined) byId.set(String(id), region);
        if (nameKey) byName.set(nameKey, region);

        if (getRegionType(region) === "PROVINSI") provinces.push(region);
        else districts.push(region);
    });

    return { byId, byName, provinces, districts };
}

function getSchoolId(school) {
    return (
        school?.id_sekolah ??
        school?.idSekolah ??
        school?.sekolah_id ??
        school?.school_id ??
        school?.id ??
        null
    );
}

function getSchoolName(school) {
    return safeText(
        school?.nama_sekolah,
        school?.namaSekolah,
        school?.school_name,
        school?.nama,
        school?.name,
    );
}

function getSchoolLevel(school) {
    return safeText(
        school?.jenjang,
        school?.tingkat,
        school?.jenis_sekolah,
        school?.bentuk_pendidikan,
    ).toUpperCase();
}

function getSchoolNpsn(school) {
    return safeText(school?.npsn, school?.NPSN);
}

function getSchoolCoordinate(school) {
    const lat = numberValue(
        school?.latitude ??
        school?.lat ??
        school?.wilayah?.latitude ??
        school?.kabupaten?.latitude,
    );
    const lng = numberValue(
        school?.longitude ??
        school?.lng ??
        school?.long ??
        school?.wilayah?.longitude ??
        school?.kabupaten?.longitude,
    );

    if (
        lat !== null &&
        lng !== null &&
        lat >= -12 &&
        lat <= 7.5 &&
        lng >= 94 &&
        lng <= 142
    ) {
        return [lat, lng];
    }

    return null;
}

function resolveSchoolDistrict(school, regionIndex) {
    const directIds = [
        school?.id_kabupaten,
        school?.kabupaten_id,
        school?.id_kota,
        school?.kota_id,
        school?.id_wilayah,
        school?.wilayah_id,
        school?.wilayah?.id_wilayah,
        school?.wilayah?.id,
        school?.kabupaten?.id_wilayah,
        school?.kabupaten?.id,
    ].filter((item) => item !== null && item !== undefined && item !== "");

    for (const id of directIds) {
        const region = regionIndex.byId.get(String(id));
        if (region && getRegionType(region) === "KABUPATEN") return region;
    }

    const directNames = [
        school?.nama_kabupaten,
        school?.kabupaten,
        school?.nama_kota,
        school?.kota,
        school?.wilayah?.nama_wilayah,
        school?.wilayah?.nama,
        school?.kabupaten?.nama_wilayah,
        school?.kabupaten?.nama,
    ];

    for (const name of directNames) {
        const key = normalizeKey(typeof name === "object" ? getRegionName(name) : name);
        if (!key) continue;

        const exact = regionIndex.byName.get(key);
        if (exact && getRegionType(exact) === "KABUPATEN") return exact;

        const fuzzy = regionIndex.districts.find((region) => {
            const regionKey = normalizeKey(getRegionName(region));
            return regionKey === key || regionKey.includes(key) || key.includes(regionKey);
        });

        if (fuzzy) return fuzzy;
    }

    return null;
}

function resolveProvinceFromDistrict(district, regionIndex) {
    if (!district) return null;

    const parentId = getParentId(district);
    if (parentId !== null && parentId !== undefined) {
        const parent = regionIndex.byId.get(String(parentId));
        if (parent) return parent;
    }

    const direct = district?.parent || district?.provinsi;
    if (direct && typeof direct === "object") return direct;

    const provinceName = safeText(
        district?.nama_provinsi,
        typeof district?.provinsi === "string" ? district?.provinsi : "",
    );

    const key = normalizeKey(provinceName);
    if (key && provinceName !== "Belum Diisi") {
        return (
            regionIndex.byName.get(key) ||
            regionIndex.provinces.find(
                (province) => normalizeKey(getRegionName(province)) === key,
            ) ||
            null
        );
    }

    return null;
}

function resolveSchoolProvince(school, district, regionIndex) {
    const directIds = [
        school?.id_provinsi,
        school?.provinsi_id,
        school?.provinsi?.id_wilayah,
        school?.provinsi?.id,
    ].filter((item) => item !== null && item !== undefined && item !== "");

    for (const id of directIds) {
        const region = regionIndex.byId.get(String(id));
        if (region && getRegionType(region) === "PROVINSI") return region;
    }

    const fromDistrict = resolveProvinceFromDistrict(district, regionIndex);
    if (fromDistrict) return fromDistrict;

    const directNames = [
        school?.nama_provinsi,
        school?.provinsi,
        school?.wilayah?.nama_provinsi,
        school?.kabupaten?.nama_provinsi,
    ];

    for (const name of directNames) {
        const rawName = typeof name === "object" ? getRegionName(name) : name;
        const key = normalizeKey(rawName);
        if (!key) continue;

        const exact = regionIndex.byName.get(key);
        if (exact && getRegionType(exact) === "PROVINSI") return exact;

        const fuzzy = regionIndex.provinces.find((region) => {
            const regionKey = normalizeKey(getRegionName(region));
            return regionKey === key || regionKey.includes(key) || key.includes(regionKey);
        });

        if (fuzzy) return fuzzy;
    }

    return null;
}

function enrichSchools(schools, regionIndex) {
    return schools.map((school) => {
        const district = resolveSchoolDistrict(school, regionIndex);
        const province = resolveSchoolProvince(school, district, regionIndex);
        const coordinate =
            getSchoolCoordinate(school) ||
            getRegionCoordinate(district) ||
            getRegionCoordinate(province);

        return {
            ...school,
            __district: district,
            __province: province,
            __districtName: district
                ? getRegionName(district)
                : safeText(school?.nama_kabupaten, school?.kabupaten),
            __provinceName: province
                ? getRegionName(province)
                : safeText(school?.nama_provinsi, school?.provinsi),
            __areaName: getRegionArea(district) || safeText(
                school?.area_wilayah,
                school?.areaWilayah,
                school?.area_binaan,
                school?.area,
            ),
            __coordinate: coordinate,
        };
    });
}

function getProvinceFallback(name) {
    const key = normalizeKey(name);
    return PROVINCE_FALLBACKS[key] || null;
}

function averageCoordinate(items, getter) {
    const coordinates = items.map(getter).filter(Boolean);
    if (!coordinates.length) return null;

    return [
        coordinates.reduce((sum, item) => sum + item[0], 0) / coordinates.length,
        coordinates.reduce((sum, item) => sum + item[1], 0) / coordinates.length,
    ];
}

function deterministicOffset(key, index = 0) {
    const text = String(key || index);
    let hash = 0;

    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) % 100000;
    }

    const angle = ((hash % 360) * Math.PI) / 180;
    const radius = 0.3 + ((hash % 6) * 0.08);

    return [Math.sin(angle) * radius, Math.cos(angle) * radius];
}

function buildMapData(enrichedSchools, regionIndex) {
    const provinceMap = new Map();

    enrichedSchools.forEach((school) => {
        const provinceName = safeText(school?.__provinceName);
        const districtName = safeText(school?.__districtName);
        const provinceKey = normalizeKey(provinceName);
        const districtKey = normalizeKey(districtName);

        if (
            provinceName === "Belum Diisi" ||
            districtName === "Belum Diisi" ||
            !provinceKey ||
            !districtKey
        ) {
            return;
        }

        if (!provinceMap.has(provinceKey)) {
            provinceMap.set(provinceKey, {
                key: provinceKey,
                name: provinceName,
                region: school?.__province || null,
                schools: [],
                districts: new Map(),
            });
        }

        const province = provinceMap.get(provinceKey);
        province.schools.push(school);

        if (!province.districts.has(districtKey)) {
            province.districts.set(districtKey, {
                key: districtKey,
                name: districtName,
                region: school?.__district || null,
                provinceKey,
                provinceName,
                schools: [],
            });
        }

        province.districts.get(districtKey).schools.push(school);
    });

    return [...provinceMap.values()]
        .map((province) => {
            const districts = [...province.districts.values()];

            const masterCoordinate = getRegionCoordinate(province.region);
            const schoolCoordinate = averageCoordinate(
                province.schools,
                (school) => school.__coordinate,
            );
            const districtCoordinate = averageCoordinate(
                districts,
                (district) => getRegionCoordinate(district.region),
            );

            const center =
                masterCoordinate ||
                districtCoordinate ||
                schoolCoordinate ||
                getProvinceFallback(province.name);

            if (!center) return null;

            const districtMarkers = districts.map((district, index) => {
                const master = getRegionCoordinate(district.region);
                const schoolAverage = averageCoordinate(
                    district.schools,
                    (school) => school.__coordinate,
                );

                let coordinate = master || schoolAverage;
                let approximate = false;

                if (!coordinate) {
                    const [offsetLat, offsetLng] = deterministicOffset(
                        `${province.key}-${district.key}`,
                        index,
                    );

                    coordinate = [center[0] + offsetLat, center[1] + offsetLng];
                    approximate = true;
                }

                return {
                    ...district,
                    coordinate,
                    approximate,
                };
            });

            return {
                ...province,
                center,
                bounds: parseBounds(
                    province.region?.bounds ?? province.region?.batas_wilayah,
                ),
                districts: districtMarkers.sort((a, b) =>
                    a.name.localeCompare(b.name),
                ),
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
}

function collectProgramSchoolIds(program) {
    const values = [
        program?.id_sekolah,
        program?.sekolah_id,
        program?.school_id,
        program?.sekolah_ids,
        program?.school_ids,
        program?.target_sekolah_ids,
        program?.sekolah,
        program?.sekolahs,
        program?.schools,
    ];

    const result = [];

    const pushValue = (value) => {
        if (value === null || value === undefined || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(pushValue);
            return;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();

            if (!trimmed) return;

            if (
                (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
                (trimmed.startsWith("{") && trimmed.endsWith("}"))
            ) {
                try {
                    pushValue(JSON.parse(trimmed));
                    return;
                } catch {
                    // lanjut sebagai teks biasa
                }
            }

            if (trimmed.includes(",")) {
                trimmed.split(",").forEach(pushValue);
                return;
            }

            result.push(trimmed);
            return;
        }

        if (typeof value === "object") {
            pushValue(
                value?.id_sekolah ??
                value?.id ??
                value?.sekolah_id ??
                value?.school_id,
            );
            return;
        }

        result.push(String(value));
    };

    values.forEach(pushValue);

    return [...new Set(result.map(String).filter(Boolean))];
}

function normalizeProgramType(value) {
    const raw = String(value ?? "")
        .toUpperCase()
        .replace(/[-\s]+/g, "_");

    return raw.includes("REGULER") ? "REGULER" : "PROJECT";
}

function normalizeProgramPillar(program) {
    const raw = [
        program?.pilar_program,
        program?.pilarProgram,
        program?.pilar,
        program?.sub_kategori,
        program?.subKategori,
        program?.kategori_pilar,
        program?.kategori,
        program?.kategori_program,
        program?.bidang,
        program?.jenis,
    ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase()
        .replace(/[-\s]+/g, "_");

    if (raw.includes("KARAKTER") || raw.includes("CHARACTER")) return "KARAKTER";
    if (raw.includes("SENI") || raw.includes("BUDAYA")) return "SENI_BUDAYA";
    if (
        raw.includes("KECAKAPAN") ||
        raw.includes("LIFE_SKILL") ||
        raw.includes("LIFESKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }
    if (raw.includes("AKADEMIK") || raw.includes("ACADEMIC")) return "AKADEMIK";

    return "AKADEMIK";
}

function getProgramName(program) {
    return safeText(program?.nama_program, program?.nama, program?.title);
}

function getProgramStatus(program) {
    return safeText(
        program?.status_program,
        program?.status,
        program?.fase,
        program?.tahap,
        "Approval",
    );
}

function getProgramCode(program) {
    return safeText(
        program?.kode_program,
        program?.nomor_program,
        program?.kode,
        `PRG-${program?.id_program ?? program?.id ?? ""}`,
    );
}

function isProgramFinished(program) {
    return normalizeText(getProgramStatus(program)).includes("selesai");
}

function formatDate(value) {
    if (!value) return "Belum Diisi";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return safeText(value);

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getVendorId(vendor) {
    return vendor?.id_vendor ?? vendor?.vendor_id ?? vendor?.id ?? null;
}

function getVendorName(vendor) {
    return safeText(
        vendor?.nama_vendor,
        vendor?.nama_perusahaan,
        vendor?.nama,
        vendor?.name,
    );
}

function normalizeVendorCategory(vendor) {
    const raw = [
        vendor?._resolved_category,
        vendor?.pilar,
        vendor?.kategori,
        vendor?.kategori_vendor,
        vendor?.jenis_vendor,
        vendor?.jenis,
        vendor?.bidang,
        vendor?.spesialisasi,
    ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase()
        .replace(/[-\s]+/g, "_");

    if (
        raw.includes("NON_AKADEMIK") ||
        raw.includes("NONAKADEMIK") ||
        raw.includes("NON")
    ) {
        return "NON_AKADEMIK";
    }

    return "AKADEMIK";
}

function getVendorContact(vendor) {
    return safeText(
        vendor?.kontak,
        vendor?.nomor_kontak,
        vendor?.no_telp,
        vendor?.telepon,
        vendor?.phone,
        vendor?.no_hp,
        vendor?.email,
        vendor?.email_vendor,
    );
}

function getVendorEmail(vendor) {
    return safeText(
        vendor?.email,
        vendor?.email_vendor,
        vendor?.email_login,
        vendor?.user?.email,
        vendor?.akun?.email,
    );
}

function getVendorAddress(vendor) {
    return safeText(
        vendor?.alamat,
        vendor?.alamat_vendor,
        vendor?.alamat_operasional,
        vendor?.alamat_lengkap,
        vendor?.address,
        vendor?.lokasi,
        vendor?.domisili,
    );
}

function getVendorResponsiblePerson(vendor) {
    return safeText(
        vendor?.pj_1,
        vendor?.pj1,
        vendor?.pj_utama,
        vendor?.nama_pj_utama,
        vendor?.penanggung_jawab_utama,
        vendor?.nama_penanggung_jawab_utama,
        vendor?.nama_pic,
        vendor?.pic,
        vendor?.penanggung_jawab,
        vendor?.nama_penanggung_jawab,
        vendor?.pj_1_nama,
        vendor?.nama_pj1,
    );
}

function getVendorMainContact(vendor) {
    return safeText(
        vendor?.telp_pj_1,
        vendor?.telpPj1,
        vendor?.kontak_pj_1,
        vendor?.kontak_pj1,
        vendor?.kontak_pj_utama,
        vendor?.telepon_pj_1,
        vendor?.no_telp_pj_1,
        vendor?.kontak,
        vendor?.nomor_kontak,
        vendor?.no_telp,
        vendor?.telepon,
        vendor?.phone,
        vendor?.no_hp,
    );
}

function getVendorStatusLabel(vendor) {
    const raw =
        vendor?.status ??
        vendor?.status_vendor ??
        vendor?.status_kemitraan ??
        vendor?.aktif ??
        vendor?.is_active ??
        vendor?.isActive;

    if (typeof raw === "boolean") return raw ? "Bermitra" : "Tidak Bermitra";
    if (raw === 1 || raw === "1") return "Bermitra";
    if (raw === 0 || raw === "0") return "Tidak Bermitra";

    const normalized = normalizeText(raw);
    if (!normalized) return "Belum Diisi";
    if (
        normalized.includes("tidak") ||
        normalized.includes("nonaktif") ||
        normalized.includes("inactive") ||
        normalized.includes("berhenti")
    ) {
        return "Tidak Bermitra";
    }
    if (
        normalized.includes("bermitra") ||
        normalized.includes("aktif") ||
        normalized.includes("active")
    ) {
        return "Bermitra";
    }

    return safeText(raw);
}

function getVendorSpecialization(vendor) {
    return safeText(
        vendor?.spesialisasi,
        vendor?.layanan,
        vendor?.jenis_layanan,
        vendor?.bidang,
        vendor?.kategori,
    );
}

function getStatusLabel(item) {
    const raw =
        item?.status ??
        item?.status_data ??
        item?.aktif ??
        item?.is_active ??
        item?.isActive;

    if (typeof raw === "boolean") return raw ? "Aktif" : "Nonaktif";

    const text = safeText(raw, "Aktif");
    return text;
}

function statusClass(value) {
    const raw = normalizeText(value);

    if (raw.includes("selesai") || raw.includes("aktif")) {
        return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (
        raw.includes("approval") ||
        raw.includes("siap") ||
        raw.includes("draft")
    ) {
        return "border-amber-100 bg-amber-50 text-amber-700";
    }

    if (raw.includes("non") || raw.includes("batal")) {
        return "border-rose-100 bg-rose-50 text-rose-700";
    }

    return "border-cyan-100 bg-cyan-50 text-cyan-700";
}

function flattenSearchValue(value, seen = new WeakSet()) {
    if (value === null || value === undefined) return "";

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
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

function makeProvinceIcon(total) {
    return L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:40px;height:52px;">
                <div style="
                    position:absolute;
                    left:8px;
                    top:2px;
                    width:28px;
                    height:28px;
                    border-radius:50% 50% 50% 0;
                    transform:rotate(-45deg);
                    background:#EF4444;
                    border:3px solid #FFFFFF;
                    box-shadow:0 10px 24px rgba(15,23,42,.28);
                ">
                    <div style="
                        position:absolute;
                        left:7px;
                        top:7px;
                        width:8px;
                        height:8px;
                        border-radius:999px;
                        background:#FFFFFF;
                    "></div>
                </div>
                <div style="
                    position:absolute;
                    right:-3px;
                    top:-5px;
                    min-width:21px;
                    height:21px;
                    padding:0 5px;
                    border-radius:999px;
                    background:#0F172A;
                    color:#FFFFFF;
                    font-size:10px;
                    line-height:21px;
                    font-weight:900;
                    text-align:center;
                    border:2px solid #FFFFFF;
                ">${total}</div>
            </div>
        `,
        iconSize: [44, 54],
        iconAnchor: [22, 50],
        popupAnchor: [0, -46],
    });
}

function makeDistrictIcon(total, active = false) {
    return L.divIcon({
        className: "",
        html: `
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    min-width:32px;
                    height:32px;
                    padding:0 8px;
                    border-radius:13px 13px 13px 3px;
                    background:${active ? "#0F172A" : "#2563EB"};
                    color:#FFFFFF;
                    border:3px solid #FFFFFF;
                    box-shadow:0 10px 24px rgba(15,23,42,.24);
                    font-size:11px;
                    font-weight:900;
                ">${total}</div>
            </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 38],
        popupAnchor: [0, -34],
    });
}

function MapViewport({ request }) {
    const map = useMap();

    useEffect(() => {
        if (!request) return;

        const timer = window.setTimeout(() => {
            map.stop();
            map.invalidateSize();

            if (request.bounds?.length >= 2) {
                map.fitBounds(request.bounds, {
                    padding: [40, 40],
                    maxZoom: request.maxZoom ?? 9,
                    animate: true,
                    duration: 0.6,
                });
            } else if (request.center) {
                map.setView(request.center, request.zoom ?? INDONESIA_ZOOM, {
                    animate: true,
                });
            }
        }, 80);

        return () => window.clearTimeout(timer);
    }, [map, request]);

    return null;
}

function DistrictPopup({ district }) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const keyword = normalizeText(search);

        if (!keyword) return district.schools;

        return district.schools.filter((school) =>
            normalizeText(
                `${getSchoolName(school)} ${getSchoolNpsn(school)} ${getSchoolLevel(
                    school,
                )}`,
            ).includes(keyword),
        );
    }, [district.schools, search]);

    return (
        <div className="w-[260px]">
            <div className="border-b border-slate-100 pb-3">
                <p className="text-[13px] font-black text-slate-900">
                    {district.name}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {district.provinceName}
                </p>
                <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                    {district.schools.length} Sekolah Binaan
                </div>
            </div>

            <div className="relative mt-3">
                <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari sekolah atau NPSN..."
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                />
            </div>

            <div className="mt-3 max-h-[190px] space-y-2 overflow-y-auto pr-1">
                {filtered.slice(0, 5).map((school) => (
                    <div
                        key={getSchoolId(school) ?? getSchoolName(school)}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                        <p className="text-[11px] font-black leading-4 text-slate-800">
                            {getSchoolName(school)}
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-slate-400">
                            {getSchoolLevel(school)} · NPSN {getSchoolNpsn(school)}
                        </p>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <p className="py-5 text-center text-[10px] font-bold text-slate-400">
                        Sekolah tidak ditemukan.
                    </p>
                )}
            </div>

            {filtered.length > 5 && (
                <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    +{filtered.length - 5} sekolah lainnya
                </p>
            )}

            {district.approximate && (
                <p className="mt-3 text-[9px] font-bold text-amber-600">
                    Posisi marker memakai titik perkiraan wilayah.
                </p>
            )}
        </div>
    );
}

function ExecutiveMap({ mapData }) {
    const [selectedProvince, setSelectedProvince] = useState("ALL");
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");
    const [search, setSearch] = useState("");
    const [viewport, setViewport] = useState({
        center: INDONESIA_CENTER,
        zoom: INDONESIA_ZOOM,
        nonce: 0,
    });

    const activeProvince = useMemo(
        () => mapData.find((item) => item.key === selectedProvince) || null,
        [mapData, selectedProvince],
    );

    const provinceOptions = useMemo(
        () =>
            mapData.map((item) => ({
                value: item.key,
                label: item.name,
            })),
        [mapData],
    );

    const districtOptions = useMemo(
        () =>
            (activeProvince?.districts || []).map((item) => ({
                value: item.key,
                label: item.name,
            })),
        [activeProvince],
    );

    const filteredProvinceMarkers = useMemo(() => {
        const keyword = normalizeText(search);

        if (!keyword) return mapData;

        return mapData.filter((province) =>
            normalizeText(
                `${province.name} ${province.districts
                    .map((district) => district.name)
                    .join(" ")} ${province.schools
                        .map((school) => `${getSchoolName(school)} ${getSchoolNpsn(school)}`)
                        .join(" ")}`,
            ).includes(keyword),
        );
    }, [mapData, search]);

    const filteredDistrictMarkers = useMemo(() => {
        if (!activeProvince) return [];

        const keyword = normalizeText(search);

        return activeProvince.districts.filter((district) => {
            if (selectedDistrict !== "ALL" && district.key !== selectedDistrict) {
                return false;
            }

            if (!keyword) return true;

            return normalizeText(
                `${district.name} ${district.schools
                    .map((school) => `${getSchoolName(school)} ${getSchoolNpsn(school)}`)
                    .join(" ")}`,
            ).includes(keyword);
        });
    }, [activeProvince, search, selectedDistrict]);

    const focusProvince = (province) => {
        setSelectedProvince(province.key);
        setSelectedDistrict("ALL");

        const districtCoordinates = province.districts
            .map((district) => district.coordinate)
            .filter(Boolean);
        const schoolCoordinates = province.schools
            .map((school) => school.__coordinate)
            .filter(Boolean);
        const points = [...districtCoordinates, ...schoolCoordinates];

        let bounds = province.bounds;

        if (!bounds && points.length >= 2) {
            const lats = points.map((item) => item[0]);
            const lngs = points.map((item) => item[1]);
            bounds = [
                [Math.min(...lats), Math.min(...lngs)],
                [Math.max(...lats), Math.max(...lngs)],
            ];
        }

        setViewport({
            bounds,
            center: province.center,
            zoom: points.length <= 1 ? 8 : 7,
            maxZoom: 9,
            nonce: Date.now(),
        });
    };

    const handleProvinceFilter = (value) => {
        if (value === "ALL") {
            setSelectedProvince("ALL");
            setSelectedDistrict("ALL");
            setViewport({
                center: INDONESIA_CENTER,
                zoom: INDONESIA_ZOOM,
                nonce: Date.now(),
            });
            return;
        }

        const province = mapData.find((item) => item.key === value);
        if (province) focusProvince(province);
    };

    const handleDistrictFilter = (value) => {
        setSelectedDistrict(value);

        if (value === "ALL" || !activeProvince) {
            if (activeProvince) focusProvince(activeProvince);
            return;
        }

        const district = activeProvince.districts.find(
            (item) => item.key === value,
        );

        if (!district) return;

        const schoolCoordinates = district.schools
            .map((school) => school.__coordinate)
            .filter(Boolean);

        let bounds = null;

        if (schoolCoordinates.length >= 2) {
            const lats = schoolCoordinates.map((item) => item[0]);
            const lngs = schoolCoordinates.map((item) => item[1]);

            bounds = [
                [Math.min(...lats), Math.min(...lngs)],
                [Math.max(...lats), Math.max(...lngs)],
            ];
        }

        setViewport({
            bounds,
            center: district.coordinate,
            zoom: schoolCoordinates.length <= 1 ? 10 : 9,
            maxZoom: 11,
            nonce: Date.now(),
        });
    };

    const resetMap = () => {
        setSelectedProvince("ALL");
        setSelectedDistrict("ALL");
        setSearch("");
        setViewport({
            center: INDONESIA_CENTER,
            zoom: INDONESIA_ZOOM,
            nonce: Date.now(),
        });
    };

    return (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-700">
                        <MapPinned size={13} />
                        National Coverage
                    </div>
                    <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em] text-slate-950">
                        Persebaran Sekolah Binaan
                    </h2>
                    <p className="mt-1 max-w-3xl text-[12px] font-semibold leading-6 text-slate-400">
                        Marker merah mewakili provinsi binaan. Fokuskan provinsi untuk
                        membuka marker kabupaten dan daftar sekolah di dalamnya.
                    </p>
                </div>

                {selectedProvince !== "ALL" && (
                    <button
                        type="button"
                        onClick={resetMap}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-5 text-[10px] font-black uppercase tracking-widest text-cyan-700 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-100"
                    >
                        Kembali ke Marker Provinsi
                    </button>
                )}
            </div>

            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4 md:grid-cols-3">
                <select
                    value={selectedProvince}
                    onChange={(event) => handleProvinceFilter(event.target.value)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-700 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Provinsi</option>
                    {provinceOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedDistrict}
                    disabled={!activeProvince}
                    onChange={(event) => handleDistrictFilter(event.target.value)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-700 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="ALL">Semua Kabupaten/Kota</option>
                    {districtOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>

                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={
                            activeProvince
                                ? "Cari kabupaten, sekolah, atau NPSN..."
                                : "Cari provinsi, kabupaten, sekolah..."
                        }
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                    />
                </div>
            </div>

            <div className="relative h-[540px]">
                <MapContainer
                    center={INDONESIA_CENTER}
                    zoom={INDONESIA_ZOOM}
                    minZoom={4}
                    scrollWheelZoom
                    className="h-full w-full"
                >
                    <MapViewport request={viewport} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {!activeProvince &&
                        filteredProvinceMarkers.map((province) => (
                            <Marker
                                key={province.key}
                                position={province.center}
                                icon={makeProvinceIcon(province.schools.length)}
                            >
                                <Popup>
                                    <div className="w-[250px]">
                                        <p className="text-[14px] font-black text-slate-900">
                                            {province.name}
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-rose-50 p-3">
                                                <p className="text-[8px] font-black uppercase tracking-wider text-rose-500">
                                                    Kabupaten
                                                </p>
                                                <p className="mt-1 text-xl font-black text-rose-700">
                                                    {province.districts.length}
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-cyan-50 p-3">
                                                <p className="text-[8px] font-black uppercase tracking-wider text-cyan-600">
                                                    Sekolah
                                                </p>
                                                <p className="mt-1 text-xl font-black text-cyan-800">
                                                    {province.schools.length}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => focusProvince(province)}
                                            className="mt-3 h-10 w-full rounded-xl bg-[#0AC4E0] text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-cyan-500"
                                        >
                                            Fokuskan Provinsi
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                    {activeProvince &&
                        filteredDistrictMarkers.map((district) => (
                            <Marker
                                key={district.key}
                                position={district.coordinate}
                                icon={makeDistrictIcon(
                                    district.schools.length,
                                    selectedDistrict === district.key,
                                )}
                            >
                                <Popup>
                                    <DistrictPopup district={district} />
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>

                <div className="pointer-events-none absolute bottom-5 left-5 z-[500] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Tampilan Aktif
                    </p>
                    <p className="mt-1 text-[12px] font-black text-slate-800">
                        {activeProvince
                            ? `${activeProvince.name} · ${filteredDistrictMarkers.length} kabupaten`
                            : `${filteredProvinceMarkers.length} provinsi binaan`}
                    </p>
                </div>
            </div>
        </section>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
            {label && (
                <p className="mb-2 max-w-[220px] text-[10px] font-black text-slate-800">
                    {label}
                </p>
            )}
            {payload.map((item) => (
                <div
                    key={item.name}
                    className="flex items-center justify-between gap-8 text-[11px]"
                >
                    <span className="font-bold text-slate-500">{item.name}</span>
                    <span className="font-black text-slate-900">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ value }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusClass(
                value,
            )}`}
        >
            {safeText(value)}
        </span>
    );
}

function PillarBadge({ value }) {
    const meta = PILLAR_META[value] || PILLAR_META.AKADEMIK;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${meta.soft}`}
        >
            <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: meta.color }}
            />
            {meta.label}
        </span>
    );
}

function StatCard({ icon, value, label, helper, accent = COLORS.cyan }) {
    return (
        <div
            className="relative rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            style={{ borderTopWidth: 4, borderTopColor: accent }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-3 text-[34px] font-black leading-none tracking-[-0.06em] text-slate-800">
                        {value}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-400">
                        {helper}
                    </p>
                </div>
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                        color: accent,
                        backgroundColor: `${accent}10`,
                        borderColor: `${accent}30`,
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onChange }) {
    const pages = [];

    for (let value = 1; value <= totalPages; value += 1) {
        if (
            value === 1 ||
            value === totalPages ||
            Math.abs(value - page) <= 1
        ) {
            pages.push(value);
        }
    }

    const compact = pages.reduce((acc, value, index) => {
        if (index > 0 && value - pages[index - 1] > 1) acc.push("ellipsis");
        acc.push(value);
        return acc;
    }, []);

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChange(Math.max(1, page - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
                <ChevronLeft size={15} />
            </button>

            {compact.map((item, index) =>
                item === "ellipsis" ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-[10px] font-black text-slate-300"
                    >
                        "¦
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        className={`h-9 min-w-9 rounded-xl px-3 text-[10px] font-black transition ${item === page
                            ? "bg-[#0AC4E0] text-white"
                            : "border border-slate-200 bg-white text-slate-500 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
                            }`}
                    >
                        {item}
                    </button>
                ),
            )}

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
                <ChevronRight size={15} />
            </button>
        </div>
    );
}

function DataTable({
    data,
    columns,
    searchPlaceholder,
    emptyText,
    getSearchText,
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const keyword = normalizeText(search);

        if (!keyword) return data;

        return data.filter((item) =>
            normalizeText(
                `${flattenSearchValue(item)} ${typeof getSearchText === "function" ? getSearchText(item) : ""
                }`,
            ).includes(keyword),
        );
    }, [data, getSearchText, search]);

    useEffect(() => {
        setPage(1);
    }, [search, data]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / ROWS_PER_PAGE),
    );
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    const visible = filtered.slice(
        startIndex,
        startIndex + ROWS_PER_PAGE,
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    return (
        <div className="flex min-h-[430px] flex-col">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[330px]">
                    <Search
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
                    />
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    {filtered.length} Data
                </span>
            </div>

            {visible.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <ClipboardList size={22} />
                    </div>
                    <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {emptyText}
                    </p>
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((item, index) => (
                                <tr
                                    key={
                                        item?.id_program ??
                                        item?.id_vendor ??
                                        item?.id ??
                                        `${startIndex}-${index}`
                                    }
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/30"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-4 align-top"
                                        >
                                            {column.render(item, startIndex + index)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Menampilkan {filtered.length ? startIndex + 1 : 0}-
                    {Math.min(startIndex + ROWS_PER_PAGE, filtered.length)} dari{" "}
                    {filtered.length}
                </p>
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                />
            </div>
        </div>
    );
}

function AnalyticsSection({
    eyebrow,
    title,
    subtitle,
    filters,
    chart,
    table,
}) {
    return (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-white px-6 py-6">
                <div className="flex items-start gap-4">
                    <span className="mt-1 h-12 w-1 shrink-0 rounded-full bg-[#0AC4E0]" />
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-700">
                            {eyebrow}
                        </p>
                        <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-slate-800">
                            {title}
                        </h2>
                        <p className="mt-1 max-w-3xl text-[12px] font-semibold leading-6 text-slate-400">
                            {subtitle}
                        </p>
                    </div>
                </div>
                {filters && <div className="mt-5">{filters}</div>}
            </div>

            <div className="grid xl:grid-cols-[0.95fr_1.35fr]">
                <div className="min-w-0 border-b border-slate-100 bg-white p-5 xl:border-b-0 xl:border-r">
                    {chart}
                </div>
                <div className="min-w-0 bg-white">{table}</div>
            </div>
        </section>
    );
}

export default function DashboardPengurus() {
    const [regions, setRegions] = useState([]);
    const [schools, setSchools] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [programSearch, setProgramSearch] = useState("");
    const [programArea, setProgramArea] = useState("ALL");
    const [programPillar, setProgramPillar] = useState("ALL");
    const [programType, setProgramType] = useState("ALL");
    const [programStatus, setProgramStatus] = useState("ALL");
    const [programChartMode, setProgramChartMode] = useState("PIE");

    const [vendorCategory, setVendorCategory] = useState("ALL");

    const fetchDashboard = async () => {
        setRefreshing(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token
                ? {
                    Authorization: `Bearer ${token}`,
                    "Cache-Control": "no-store",
                    Pragma: "no-cache",
                }
                : {
                    "Cache-Control": "no-store",
                    Pragma: "no-cache",
                };

            const [
                wilayahTreePayload,
                wilayahPayload,
                schoolPayload,
                vendorPayload,
                programPayload,
            ] = await Promise.all([
                fetchFirst(["/wilayah/tree"], headers),
                fetchFirst(["/wilayah"], headers),
                fetchFirst(["/sekolah"], headers),
                fetchFirst(["/vendor"], headers),
                fetchFirst(["/program"], headers),
            ]);

            const flattenedTree = flattenWilayahTree(wilayahTreePayload);
            const flatWilayah = flattenWilayahTree(wilayahPayload);

            const mergedRegions = new Map();
            [...flatWilayah, ...flattenedTree].forEach((region) => {
                const key = String(
                    getRegionId(region) ??
                    `${getRegionName(region)}-${getRegionType(region)}`,
                );
                mergedRegions.set(key, {
                    ...(mergedRegions.get(key) || {}),
                    ...region,
                });
            });

            setRegions([...mergedRegions.values()]);
            setSchools(normalizeArray(schoolPayload));
            setVendors(normalizeArray(vendorPayload));
            setPrograms(normalizeArray(programPayload));
        } catch (error) {
            console.error("Dashboard Pengurus Error:", error);
            setRegions([]);
            setSchools([]);
            setVendors([]);
            setPrograms([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const regionIndex = useMemo(
        () => buildRegionIndex(regions),
        [regions],
    );

    const enrichedSchools = useMemo(
        () => enrichSchools(schools, regionIndex),
        [regionIndex, schools],
    );

    const mapData = useMemo(
        () => buildMapData(enrichedSchools, regionIndex),
        [enrichedSchools, regionIndex],
    );

    const schoolMap = useMemo(() => {
        const map = new Map();

        enrichedSchools.forEach((school) => {
            const id = getSchoolId(school);
            if (id !== null && id !== undefined) {
                map.set(String(id), school);
            }
        });

        return map;
    }, [enrichedSchools]);

    const enrichedPrograms = useMemo(() => {
        return programs.map((program) => {
            const schoolIds = collectProgramSchoolIds(program);
            const relatedSchools = schoolIds
                .map((id) => schoolMap.get(String(id)))
                .filter(Boolean);

            return {
                ...program,
                __pillar: normalizeProgramPillar(program),
                __type: normalizeProgramType(
                    program?.jenis_program ??
                    program?.tipe_program ??
                    program?.kategori_jenis,
                ),
                __status: getProgramStatus(program),
                __schools: relatedSchools,
                __schoolNames: relatedSchools.length
                    ? relatedSchools.map(getSchoolName).join(", ")
                    : safeText(
                        program?.nama_sekolah,
                        program?.sekolah?.nama_sekolah,
                    ),
                __provinceNames: relatedSchools.length
                    ? [
                        ...new Set(
                            relatedSchools.map(
                                (school) => school.__provinceName,
                            ),
                        ),
                    ].join(", ")
                    : safeText(program?.nama_provinsi),
                __districtNames: relatedSchools.length
                    ? [
                        ...new Set(
                            relatedSchools.map(
                                (school) => school.__districtName,
                            ),
                        ),
                    ].join(", ")
                    : safeText(program?.nama_kabupaten),
                __areaNames: relatedSchools.length
                    ? [
                        ...new Set(
                            relatedSchools
                                .map((school) => school.__areaName)
                                .filter(Boolean),
                        ),
                    ].join(", ")
                    : safeText(
                        program?.area_wilayah,
                        program?.areaWilayah,
                        program?.area_binaan,
                        program?.area,
                    ),
            };
        });
    }, [programs, schoolMap]);

    const programAreaOptions = useMemo(() => {
        const areas = [
            ...new Set(
                enrichedPrograms
                    .flatMap((program) =>
                        String(program.__areaNames || "")
                            .split(",")
                            .map((area) => area.trim())
                            .filter(Boolean),
                    ),
            ),
        ].sort((a, b) => a.localeCompare(b));

        return [
            { value: "ALL", label: "Semua Area Binaan" },
            ...areas.map((area) => ({
                value: area,
                label: area,
            })),
        ];
    }, [enrichedPrograms]);

    useEffect(() => {
        const exists = programAreaOptions.some(
            (item) => String(item.value) === String(programArea),
        );
        if (!exists) setProgramArea("ALL");
    }, [programArea, programAreaOptions]);

    const filteredPrograms = useMemo(() => {
        const keyword = normalizeText(programSearch);

        return enrichedPrograms
            .filter((program) => {
                if (programArea === "ALL") return true;
                return String(program.__areaNames || "")
                    .split(",")
                    .map((area) => area.trim())
                    .some((area) => area === programArea);
            })
            .filter(
                (program) =>
                    programPillar === "ALL" ||
                    program.__pillar === programPillar,
            )
            .filter(
                (program) =>
                    programType === "ALL" ||
                    program.__type === programType,
            )
            .filter((program) => {
                if (programStatus === "ALL") return true;
                if (programStatus === "SELESAI") {
                    return isProgramFinished(program);
                }
                return !isProgramFinished(program);
            })
            .filter((program) => {
                if (!keyword) return true;

                return normalizeText(
                    `${flattenSearchValue(program)} ${getProgramName(
                        program,
                    )} ${program.__schoolNames} ${program.__districtNames} ${program.__provinceNames
                    } ${program.__areaNames} ${PILLAR_META[program.__pillar]?.label || ""}`,
                ).includes(keyword);
            })
            .sort(
                (a, b) =>
                    Number(b?.id_program ?? b?.id ?? 0) -
                    Number(a?.id_program ?? a?.id ?? 0),
            );
    }, [
        enrichedPrograms,
        programArea,
        programPillar,
        programSearch,
        programStatus,
        programType,
    ]);

    const programChartData = useMemo(() => {
        return Object.entries(PILLAR_META).map(([value, meta]) => ({
            name: meta.label,
            value: filteredPrograms.filter(
                (program) => program.__pillar === value,
            ).length,
            color: meta.color,
        }));
    }, [filteredPrograms]);

    const filteredVendors = useMemo(() => {
        return vendors
            .filter(
                (vendor) =>
                    vendorCategory === "ALL" ||
                    normalizeVendorCategory(vendor) === vendorCategory,
            )
            .sort((a, b) =>
                getVendorName(a).localeCompare(getVendorName(b)),
            );
    }, [vendorCategory, vendors]);

    const vendorChartData = useMemo(() => {
        const academic = filteredVendors.filter(
            (vendor) => normalizeVendorCategory(vendor) === "AKADEMIK",
        ).length;
        const nonAcademic = filteredVendors.filter(
            (vendor) => normalizeVendorCategory(vendor) === "NON_AKADEMIK",
        ).length;

        return [
            {
                name: "Akademik",
                value: academic,
                color: COLORS.blue,
            },
            {
                name: "Non Akademik",
                value: nonAcademic,
                color: COLORS.orange,
            },
        ];
    }, [filteredVendors]);

    const totalDistricts = useMemo(
        () =>
            new Set(
                enrichedSchools
                    .map((school) => normalizeKey(school.__districtName))
                    .filter(Boolean),
            ).size,
        [enrichedSchools],
    );

    const completedPrograms = useMemo(
        () => enrichedPrograms.filter(isProgramFinished).length,
        [enrichedPrograms],
    );

    if (loading) {
        return (
            <PageWrapper className="flex h-screen w-full overflow-hidden bg-[#F4F6F8] !p-0">
                <Sidebar />
                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                            Menyiapkan Executive Dashboard
                        </p>
                    </div>
                </main>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen w-full overflow-hidden bg-[#F6F9FC] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="executive-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
                <header className="border-b border-slate-200 bg-white px-6 py-7 lg:px-10">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-700">
                                <Sparkles size={13} />
                                Board Executive View
                            </div>
                            <h1 className="mt-4 text-[32px] font-black tracking-[-0.055em] text-slate-800 lg:text-[40px]">
                                Dashboard Pengurus
                            </h1>
                            <p className="mt-2 max-w-3xl text-[12px] font-semibold leading-6 text-slate-500">
                                Ringkasan nasional sekolah binaan, portofolio program
                                berdasarkan empat pilar, serta kesiapan mitra vendor
                                untuk kebutuhan pengambilan keputusan.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchDashboard}
                            disabled={refreshing}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-cyan-500 disabled:opacity-60"
                        >
                            <RefreshCcw
                                size={15}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            {refreshing ? "Memuat Data" : "Perbarui Dashboard"}
                        </button>
                    </div>
                </header>

                <div className="space-y-6 px-5 py-6 lg:px-8 lg:py-8">
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                        <StatCard
                            label="Sekolah Binaan"
                            value={enrichedSchools.length}
                            helper="Seluruh sekolah aktif terdaftar"
                            accent={COLORS.cyan}
                            icon={<School size={20} />}
                        />
                        <StatCard
                            label="Provinsi"
                            value={mapData.length}
                            helper="Provinsi dengan sekolah binaan"
                            accent={COLORS.red}
                            icon={<MapPinned size={20} />}
                        />
                        <StatCard
                            label="Kabupaten"
                            value={totalDistricts}
                            helper="Kabupaten/kota terpetakan"
                            accent={COLORS.blue}
                            icon={<Building2 size={20} />}
                        />
                        <StatCard
                            label="Program"
                            value={enrichedPrograms.length}
                            helper="Portofolio seluruh pilar"
                            accent={COLORS.violet}
                            icon={<ClipboardList size={20} />}
                        />
                        <StatCard
                            label="Program Selesai"
                            value={completedPrograms}
                            helper="Program berstatus selesai"
                            accent={COLORS.green}
                            icon={<CheckCircle2 size={20} />}
                        />
                        <StatCard
                            label="Vendor"
                            value={vendors.length}
                            helper="Mitra pelaksana program"
                            accent={COLORS.orange}
                            icon={<Factory size={20} />}
                        />
                    </section>

                    <ExecutiveMap mapData={mapData} />

                    <AnalyticsSection
                        eyebrow="Strategic Program Portfolio"
                        title="Portofolio Program Empat Pilar"
                        subtitle="Komposisi program dibagi menjadi Akademik, Karakter, Seni Budaya, dan Kecakapan Hidup. Seluruh filter memengaruhi diagram dan daftar program."
                        filters={
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                                <div className="relative xl:col-span-2">
                                    <Search
                                        size={14}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600"
                                    />
                                    <input
                                        value={programSearch}
                                        onChange={(event) =>
                                            setProgramSearch(event.target.value)
                                        }
                                        placeholder="Cari program, sekolah, wilayah, atau tahun..."
                                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[11px] font-bold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                    />
                                </div>

                                <Dropdown
                                    value={programArea}
                                    items={programAreaOptions}
                                    onChange={setProgramArea}
                                    placeholder="Semua Area Binaan"
                                    width="w-full"
                                />

                                <select
                                    value={programPillar}
                                    onChange={(event) =>
                                        setProgramPillar(event.target.value)
                                    }
                                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                >
                                    {PILLAR_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={programType}
                                    onChange={(event) =>
                                        setProgramType(event.target.value)
                                    }
                                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                >
                                    {PROGRAM_TYPE_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={programStatus}
                                    onChange={(event) =>
                                        setProgramStatus(event.target.value)
                                    }
                                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                >
                                    {PROGRAM_STATUS_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        }
                        chart={
                            <div>
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                            Komposisi Pilar
                                        </p>
                                        <p className="mt-1 text-[12px] font-black text-slate-800">
                                            {filteredPrograms.length} program sesuai filter
                                        </p>
                                    </div>
                                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setProgramChartMode("PIE")}
                                            className={`rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-wider ${programChartMode === "PIE"
                                                ? "bg-[#0AC4E0] text-white"
                                                : "text-slate-500 hover:bg-white hover:text-cyan-700"
                                                }`}
                                        >
                                            Pie
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProgramChartMode("BAR")}
                                            className={`rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-wider ${programChartMode === "BAR"
                                                ? "bg-[#0AC4E0] text-white"
                                                : "text-slate-500 hover:bg-white hover:text-cyan-700"
                                                }`}
                                        >
                                            Batang
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[330px] min-w-0">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                        minWidth={0}
                                        minHeight={0}
                                    >
                                        {programChartMode === "PIE" ? (
                                            <PieChart>
                                                <Pie
                                                    data={programChartData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={66}
                                                    outerRadius={112}
                                                    paddingAngle={4}
                                                    stroke="#FFFFFF"
                                                    strokeWidth={4}
                                                >
                                                    {programChartData.map((item) => (
                                                        <Cell
                                                            key={item.name}
                                                            fill={item.color}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<ChartTooltip />} />
                                            </PieChart>
                                        ) : (
                                            <BarChart
                                                data={programChartData}
                                                margin={{
                                                    top: 20,
                                                    right: 16,
                                                    left: -10,
                                                    bottom: 8,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#E8EEF5"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{
                                                        fontSize: 9,
                                                        fontWeight: 800,
                                                        fill: "#64748B",
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        fill: "#94A3B8",
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Bar
                                                    dataKey="value"
                                                    name="Program"
                                                    radius={[9, 9, 0, 0]}
                                                    barSize={42}
                                                >
                                                    {programChartData.map((item) => (
                                                        <Cell
                                                            key={item.name}
                                                            fill={item.color}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {programChartData.map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between rounded-xl border px-3 py-2 shadow-sm"
                                            style={{
                                                borderColor: `${item.color}30`,
                                                backgroundColor: `${item.color}10`,
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                                    {item.name}
                                                </span>
                                            </span>
                                            <span className="text-[11px] font-black text-slate-900">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        table={
                            <DataTable
                                data={filteredPrograms}
                                searchPlaceholder="Cari detail program pada daftar..."
                                emptyText="Program tidak ditemukan"
                                getSearchText={(program) =>
                                    `${getProgramName(program)} ${getProgramCode(
                                        program,
                                    )} ${program.__schoolNames} ${program.__districtNames
                                    } ${program.__provinceNames} ${PILLAR_META[program.__pillar]?.label || ""
                                    } ${program.__areaNames} ${program.__type} ${program.__status}`
                                }
                                columns={[
                                    {
                                        key: "program",
                                        label: "Program",
                                        render: (program) => (
                                            <div>
                                                <p className="max-w-[250px] text-[12px] font-black leading-5 text-slate-900">
                                                    {getProgramName(program)}
                                                </p>
                                                <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                    {getProgramCode(program)} · Tahun{" "}
                                                    {safeText(program?.tahun)}
                                                </p>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "pilar",
                                        label: "Pilar",
                                        render: (program) => (
                                            <PillarBadge value={program.__pillar} />
                                        ),
                                    },
                                    {
                                        key: "jenis",
                                        label: "Jenis",
                                        render: (program) => (
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                                {program.__type === "REGULER"
                                                    ? "Reguler"
                                                    : "Project"}
                                            </p>
                                        ),
                                    },
                                    {
                                        key: "sekolah",
                                        label: "Sekolah & Wilayah",
                                        render: (program) => (
                                            <div>
                                                <p className="max-w-[260px] text-[11px] font-black leading-4 text-slate-700">
                                                    {program.__schoolNames}
                                                </p>
                                                <p className="mt-1 max-w-[260px] text-[9px] font-bold leading-4 text-slate-400">
                                                    {program.__districtNames} ·{" "}
                                                    {program.__provinceNames}
                                                </p>
                                                <p className="mt-1 max-w-[260px] text-[9px] font-black uppercase tracking-wider text-[#0AC4E0]">
                                                    {program.__areaNames || "Area belum ditentukan"}
                                                </p>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "periode",
                                        label: "Periode",
                                        render: (program) => (
                                            <p className="text-[10px] font-bold leading-4 text-slate-500">
                                                {formatDate(
                                                    program?.tanggal_mulai ??
                                                    program?.waktu_mulai,
                                                )}
                                                <br />
                                                {formatDate(
                                                    program?.tanggal_selesai ??
                                                    program?.waktu_selesai,
                                                )}
                                            </p>
                                        ),
                                    },
                                    {
                                        key: "status",
                                        label: "Status",
                                        render: (program) => (
                                            <StatusBadge value={program.__status} />
                                        ),
                                    },
                                ]}
                            />
                        }
                    />

                    <AnalyticsSection
                        eyebrow="Partner Readiness"
                        title="Portofolio Vendor"
                        subtitle="Seluruh atribut vendor dibaca dari response backend tanpa placeholder strip. Data kosong ditandai jelas sebagai Belum Diisi agar kualitas master data mudah dipantau."
                        filters={
                            <div className="flex flex-wrap gap-2">
                                {VENDOR_CATEGORY_OPTIONS.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() =>
                                            setVendorCategory(item.value)
                                        }
                                        className={`rounded-xl border px-4 py-2 text-[9px] font-black uppercase tracking-wider transition ${vendorCategory === item.value
                                            ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        }
                        chart={
                            <div>
                                <div className="mb-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                        Komposisi Vendor
                                    </p>
                                    <p className="mt-1 text-[12px] font-black text-slate-800">
                                        {filteredVendors.length} vendor sesuai filter
                                    </p>
                                </div>

                                <div className="h-[330px] min-w-0">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                        minWidth={0}
                                        minHeight={0}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={vendorChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={68}
                                                outerRadius={112}
                                                paddingAngle={5}
                                                stroke="#FFFFFF"
                                                strokeWidth={4}
                                            >
                                                {vendorChartData.map((item) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={item.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {vendorChartData.map((item) => (
                                        <div
                                            key={item.name}
                                            className="rounded-xl border px-4 py-3 shadow-sm"
                                            style={{
                                                borderColor: `${item.color}30`,
                                                backgroundColor: `${item.color}10`,
                                            }}
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                {item.name}
                                            </p>
                                            <p
                                                className="mt-2 text-2xl font-black"
                                                style={{ color: item.color }}
                                            >
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        table={
                            <DataTable
                                data={filteredVendors}
                                searchPlaceholder="Cari nama, alamat, status, atau PJ utama..."
                                emptyText="Vendor tidak ditemukan"
                                getSearchText={(vendor) =>
                                    `${getVendorName(vendor)} ${getVendorAddress(
                                        vendor,
                                    )} ${getVendorResponsiblePerson(
                                        vendor,
                                    )} ${getVendorMainContact(
                                        vendor,
                                    )} ${getVendorEmail(
                                        vendor,
                                    )} ${getVendorSpecialization(
                                        vendor,
                                    )} ${normalizeVendorCategory(
                                        vendor,
                                    )} ${getVendorStatusLabel(vendor)}`
                                }
                                columns={[
                                    {
                                        key: "vendor",
                                        label: "Nama Vendor",
                                        render: (vendor) => (
                                            <div>
                                                <p className="max-w-[230px] text-[12px] font-black leading-5 text-slate-900">
                                                    {getVendorName(vendor)}
                                                </p>
                                                <p className="mt-1 text-[9px] font-bold text-slate-400">
                                                    {getVendorEmail(vendor)}
                                                </p>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "alamat",
                                        label: "Alamat",
                                        render: (vendor) => (
                                            <p className="max-w-[260px] text-[10px] font-bold leading-5 text-slate-600">
                                                {getVendorAddress(vendor)}
                                            </p>
                                        ),
                                    },
                                    {
                                        key: "pj_utama",
                                        label: "PJ Utama",
                                        render: (vendor) => (
                                            <div className="max-w-[190px]">
                                                <p className="text-[10px] font-black leading-4 text-slate-700">
                                                    {getVendorResponsiblePerson(vendor)}
                                                </p>
                                                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                                                    {getVendorMainContact(vendor)}
                                                </p>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "status",
                                        label: "Status",
                                        render: (vendor) => (
                                            <StatusBadge
                                                value={getVendorStatusLabel(vendor)}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        }
                    />
                </div>
            </main>

            <style>{`
                .executive-scroll::-webkit-scrollbar { width: 7px; }
                .executive-scroll::-webkit-scrollbar-track { background: transparent; }
                .executive-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.45);
                    border-radius: 999px;
                }
                .leaflet-container {
                    font-family: 'Poppins', sans-serif;
                    background: #e2e8f0;
                }
            `}</style>
        </PageWrapper>
    );
}

