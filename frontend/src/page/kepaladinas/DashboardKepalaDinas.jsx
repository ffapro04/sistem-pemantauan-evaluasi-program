/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Award,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    FileText,
    FolderKanban,
    Globe,
    GraduationCap,
    Hash,
    Layers,
    LayoutDashboard,
    Loader2,
    MapPin,
    MapPinned,
    Navigation,
    RefreshCcw,
    School,
    Search,
    ShieldCheck,
    Target,
    TrendingUp,
    UsersRound,
    X,
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
import Input from "../../components/Input";
import Button from "../../components/Button";
import { CHART_PALETTE, CHART_STATUS_COLORS } from "../../utils/chartPalette";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const COLORS = {
    cyan: CHART_STATUS_COLORS.info,
    blue: CHART_STATUS_COLORS.info,
    sky: CHART_STATUS_COLORS.info,
    violet: CHART_STATUS_COLORS.deep,
    pink: CHART_STATUS_COLORS.purple,
    amber: CHART_STATUS_COLORS.warning,
    emerald: CHART_STATUS_COLORS.success,
    orange: CHART_STATUS_COLORS.orange,
    red: CHART_STATUS_COLORS.danger,
    slate: CHART_STATUS_COLORS.deep,
};

const CHART_COLORS = CHART_PALETTE;

const FILTER_KATEGORI = [
    { label: "Semua", value: "SEMUA" },
    { label: "Akademik", value: "AKADEMIK" },
    { label: "Non Akademik", value: "NON_AKADEMIK" },
];

const STATUS_CLASS = {
    selesai: "border-emerald-100 bg-emerald-50 text-emerald-600",
    aktif: "border-cyan-100 bg-cyan-50 text-[#0AC4E0]",
    approval: "border-amber-100 bg-amber-50 text-amber-600",
    warning: "border-amber-100 bg-amber-50 text-amber-600",
    review: "border-sky-100 bg-sky-50 text-sky-600",
    revisi: "border-red-100 bg-red-50 text-red-500",
    default: "border-slate-100 bg-slate-50 text-slate-500",
};

const KADIN_INDONESIA_CENTER = [-2.5, 118];
const KADIN_INDONESIA_ZOOM = 5;
const KADIN_ROWS_PER_PAGE = 5;

const KADIN_PILLAR_META = {
    AKADEMIK: {
        label: "Akademik",
        color: "#2563EB",
        soft: "#EFF6FF",
        chartKey: "akademik",
    },
    KARAKTER: {
        label: "Karakter",
        color: "#8B5CF6",
        soft: "#F5F3FF",
        chartKey: "karakter",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        color: "#F97316",
        soft: "#FFF7ED",
        chartKey: "seniBudaya",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        color: "#10B981",
        soft: "#ECFDF5",
        chartKey: "kecakapanHidup",
    },
};

const KADIN_PROVINCE_FALLBACKS = {
    ACEH: [4.6951, 96.7494],
    "SUMATERA UTARA": [2.1154, 99.5451],
    "SUMATERA BARAT": [-0.7399, 100.8],
    RIAU: [0.2933, 101.7068],
    "KEPULAUAN RIAU": [3.9457, 108.1429],
    JAMBI: [-1.6101, 103.6131],
    "SUMATERA SELATAN": [-3.3194, 103.9144],
    BENGKULU: [-3.5778, 102.3464],
    LAMPUNG: [-4.5586, 105.4068],
    "KEPULAUAN BANGKA BELITUNG": [-2.7411, 106.4406],
    BANTEN: [-6.4058, 106.064],
    "DKI JAKARTA": [-6.2088, 106.8456],
    "JAWA BARAT": [-6.9175, 107.6191],
    "JAWA TENGAH": [-7.151, 110.1403],
    "DI YOGYAKARTA": [-7.7956, 110.3695],
    "DAERAH ISTIMEWA YOGYAKARTA": [-7.7956, 110.3695],
    "JAWA TIMUR": [-7.5361, 112.2384],
    BALI: [-8.3405, 115.092],
    "NUSA TENGGARA BARAT": [-8.6529, 117.3616],
    "NUSA TENGGARA TIMUR": [-8.6574, 121.0794],
    "KALIMANTAN BARAT": [-0.2788, 111.4753],
    "KALIMANTAN TENGAH": [-1.6815, 113.3824],
    "KALIMANTAN SELATAN": [-3.0926, 115.2838],
    "KALIMANTAN TIMUR": [0.5387, 116.4194],
    "KALIMANTAN UTARA": [3.0731, 116.0414],
    "SULAWESI UTARA": [0.6247, 123.975],
    GORONTALO: [0.6999, 122.4467],
    "SULAWESI TENGAH": [-1.43, 121.4456],
    "SULAWESI BARAT": [-2.8441, 119.2321],
    "SULAWESI SELATAN": [-3.6688, 119.9741],
    "SULAWESI TENGGARA": [-4.1449, 122.1746],
    MALUKU: [-3.2385, 130.1453],
    "MALUKU UTARA": [1.5709, 127.8088],
    "PAPUA BARAT": [-1.3361, 133.1747],
    "PAPUA BARAT DAYA": [-1.1423, 131.8546],
    PAPUA: [-4.2699, 138.0804],
    "PAPUA SELATAN": [-6.5, 140],
    "PAPUA TENGAH": [-3.725, 136.5],
    "PAPUA PEGUNUNGAN": [-4, 138.8],
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.assessment)) return payload.assessment;
    if (Array.isArray(payload?.assessments)) return payload.assessments;
    if (Array.isArray(payload?.wilayah)) return payload.wilayah;
    if (Array.isArray(payload?.regions)) return payload.regions;
    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function unwrapPayload(payload) {
    if (!payload || Array.isArray(payload)) return payload;

    if (payload?.data && !Array.isArray(payload.data)) return payload.data;
    if (payload?.result && !Array.isArray(payload.result)) return payload.result;
    if (payload?.payload && !Array.isArray(payload.payload)) return payload.payload;

    return payload;
}

function findValueByKeys(payload, keys = []) {
    if (!payload || keys.length === 0) return null;

    const normalizedKeys = new Set(keys.map((key) => String(key).toLowerCase()));
    const queue = [payload];
    const seen = new WeakSet();

    while (queue.length > 0) {
        const current = queue.shift();

        if (!current || typeof current !== "object") continue;
        if (seen.has(current)) continue;
        seen.add(current);

        if (!Array.isArray(current)) {
            for (const [key, value] of Object.entries(current)) {
                if (
                    normalizedKeys.has(String(key).toLowerCase()) &&
                    value !== null &&
                    value !== undefined
                ) {
                    return value;
                }
            }
        }

        const values = Array.isArray(current) ? current : Object.values(current);
        values.forEach((value) => {
            if (value && typeof value === "object") queue.push(value);
        });
    }

    return null;
}

function findArrayByKeys(payload, keys = []) {
    if (!payload || keys.length === 0) return [];

    const normalizedKeys = new Set(keys.map((key) => String(key).toLowerCase()));
    const queue = [payload];
    const seen = new WeakSet();

    while (queue.length > 0) {
        const current = queue.shift();

        if (!current || typeof current !== "object") continue;
        if (seen.has(current)) continue;
        seen.add(current);

        if (!Array.isArray(current)) {
            for (const [key, value] of Object.entries(current)) {
                if (
                    normalizedKeys.has(String(key).toLowerCase()) &&
                    Array.isArray(value)
                ) {
                    return value;
                }
            }
        }

        const values = Array.isArray(current) ? current : Object.values(current);
        values.forEach((value) => {
            if (value && typeof value === "object") queue.push(value);
        });
    }

    return [];
}

function flattenWilayahTree(payload) {
    const normalizedRoots = normalizeArray(payload);
    const roots =
        normalizedRoots.length > 0
            ? normalizedRoots
            : payload && typeof payload === "object"
                ? [unwrapPayload(payload)]
                : [];
    const result = [];
    const seenObjects = new WeakSet();

    const childKeys = new Set([
        "children",
        "child",
        "childrens",
        "kabupaten",
        "kabupatens",
        "kabupaten_kota",
        "kabupatenKota",
        "kota",
        "wilayah_anak",
        "wilayahAnak",
        "sub_wilayah",
        "subWilayah",
        "items",
        "nodes",
    ]);

    const walk = (value, inheritedParent = null) => {
        if (!value || typeof value !== "object") return;
        if (seenObjects.has(value)) return;
        seenObjects.add(value);

        if (Array.isArray(value)) {
            value.forEach((item) => walk(item, inheritedParent));
            return;
        }

        const looksLikeWilayah = Boolean(
            value?.id_wilayah ||
            value?.wilayah_id ||
            value?.kode_wilayah ||
            value?.nama_wilayah ||
            value?.jenis_wilayah ||
            value?.tipe_wilayah,
        );

        const current = looksLikeWilayah
            ? {
                ...value,
                id_parent:
                    value?.id_parent ??
                    value?.parent_id ??
                    value?.id_induk ??
                    inheritedParent ??
                    null,
            }
            : null;

        if (current) result.push(current);

        const currentId = current?.id_wilayah ?? current?.id ?? inheritedParent;

        Object.entries(value).forEach(([key, child]) => {
            if (childKeys.has(key) || Array.isArray(child)) {
                walk(child, currentId);
            }
        });
    };

    walk(roots);

    const map = new Map();
    result.forEach((item, index) => {
        const key = String(
            item?.id_wilayah ||
            item?.id ||
            `${cleanText(item?.nama_wilayah || item?.nama)}-${item?.id_parent || index}`,
        );

        map.set(key, { ...(map.get(key) || {}), ...item });
    });

    return Array.from(map.values());
}

function mergeRecordsByIdentity(base = [], extra = [], getIdentity) {
    const map = new Map();

    [...base, ...extra].forEach((item, index) => {
        if (!item || typeof item !== "object") return;

        const rawIdentity = getIdentity?.(item);
        const fallbackIdentity =
            item?.email ||
            item?.nama ||
            item?.name ||
            item?.nama_sekolah ||
            item?.nama_program ||
            `row-${index}`;
        const key = String(rawIdentity || fallbackIdentity);
        const previous = map.get(key) || {};
        const merged = { ...previous, ...item };

        // Program/assessment yang diambil dari endpoint per sekolah dapat muncul
        // beberapa kali. Relasi sekolahnya harus digabung, bukan ditimpa.
        if (previous?.__school_ids || item?.__school_ids) {
            merged.__school_ids = [
                ...new Set([
                    ...(Array.isArray(previous?.__school_ids)
                        ? previous.__school_ids
                        : []),
                    ...(Array.isArray(item?.__school_ids) ? item.__school_ids : []),
                ].map(String).filter(Boolean)),
            ];
        }

        map.set(key, merged);
    });

    return Array.from(map.values());
}

async function mapWithConcurrency(items = [], limit = 6, mapper) {
    const source = Array.isArray(items) ? items : [];
    if (source.length === 0) return [];

    const results = new Array(source.length);
    let cursor = 0;

    const worker = async () => {
        while (cursor < source.length) {
            const index = cursor;
            cursor += 1;

            try {
                results[index] = await mapper(source[index], index);
            } catch {
                results[index] = source[index];
            }
        }
    };

    await Promise.all(
        Array.from({ length: Math.min(limit, source.length) }, () => worker()),
    );

    return results;
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

async function fetchSafe(endpointList, headers = {}) {
    for (const endpoint of endpointList) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
            const payload = await safeJson(response);

            if (!response.ok) {
                console.warn("Endpoint gagal:", endpoint, payload);
                continue;
            }

            return payload;
        } catch (error) {
            console.warn("Endpoint error:", endpoint, error);
        }
    }

    return [];
}

function getTokenPayload() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

function getCurrentUserIdFromToken() {
    const payload = getTokenPayload();
    return payload?.sub || payload?.id_user || payload?.id || null;
}

function getStoredUserProfile() {
    const keys = [
        "user",
        "currentUser",
        "authUser",
        "userData",
        "profile",
        "loginUser",
    ];

    for (const key of keys) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            const parsed = JSON.parse(raw);
            const value = parsed?.user || parsed?.data || parsed?.result || parsed;

            if (value && typeof value === "object" && !Array.isArray(value)) {
                return value;
            }
        } catch {
            // Abaikan key localStorage yang bukan JSON valid.
        }
    }

    return {};
}

function mergeUserSources(...sources) {
    return sources.reduce((result, source) => {
        if (!source || typeof source !== "object" || Array.isArray(source)) {
            return result;
        }

        const next = { ...result, ...source };

        const mergedWilayah = [
            ...(Array.isArray(result?.wilayah)
                ? result.wilayah
                : result?.wilayah
                    ? [result.wilayah]
                    : []),
            ...(Array.isArray(source?.wilayah)
                ? source.wilayah
                : source?.wilayah
                    ? [source.wilayah]
                    : []),
        ].filter(Boolean);

        if (mergedWilayah.length > 0) {
            next.wilayah = mergeRecordsByIdentity(
                [],
                mergedWilayah,
                getWilayahId,
            );
        }

        const mergedKabupatenTugas = [
            ...(Array.isArray(result?.kabupaten_tugas)
                ? result.kabupaten_tugas
                : []),
            ...(Array.isArray(source?.kabupaten_tugas)
                ? source.kabupaten_tugas
                : []),
        ].filter(Boolean);

        if (mergedKabupatenTugas.length > 0) {
            next.kabupaten_tugas = mergeRecordsByIdentity(
                [],
                mergedKabupatenTugas,
                (item) =>
                    item?.id_kabupaten ||
                    item?.id_wilayah ||
                    item?.kode_kabupaten ||
                    item?.nama_kabupaten,
            );
        }

        return next;
    }, {});
}

function compactNumber(value) {
    return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function cleanText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("\\", "/")
        .replaceAll(">", "/")
        .replace(/\s*\/\s*/g, "/")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanLeafName(value) {
    const raw = String(value || "").trim();

    if (!raw) return "Wilayah tidak diketahui";

    if (raw.includes("/")) {
        return raw.split("/").filter(Boolean).pop() || raw;
    }

    return raw;
}

function getWilayahName(wilayah) {
    const target = Array.isArray(wilayah) ? wilayah[0] : wilayah;

    if (!target) return "Belum ada wilayah";

    if (typeof target === "string") return cleanLeafName(target);

    return cleanLeafName(
        target?.nama_wilayah ||
        target?.namaWilayah ||
        target?.nama ||
        target?.name ||
        target?.region ||
        "Belum ada wilayah",
    );
}

function getWilayahFullName(wilayah) {
    const target = Array.isArray(wilayah) ? wilayah[0] : wilayah;

    if (!target) return "";
    if (typeof target === "string") return target;

    return (
        target?.nama_wilayah ||
        target?.namaWilayah ||
        target?.nama ||
        target?.name ||
        target?.region ||
        ""
    );
}

function getWilayahId(wilayah) {
    const target = Array.isArray(wilayah) ? wilayah[0] : wilayah;

    return (
        target?.id_wilayah ??
        target?.idWilayah ??
        target?.wilayah_id ??
        target?.id ??
        null
    );
}

function getUserWilayahIds(user) {
    return [
        user?.id_wilayah,
        user?.wilayah_id,
        user?.idWilayah,
        user?.wilayah?.id_wilayah,
        user?.wilayah?.id,
        user?.wilayah?.wilayah_id,
        user?.data?.id_wilayah,
        user?.data?.wilayah_id,
        user?.data?.wilayah?.id_wilayah,
        user?.data?.wilayah?.id,
    ]
        .filter(Boolean)
        .map(String);
}

function resolveKepalaDinasWilayah(currentUser, wilayahList = [], tokenPayload = {}) {
    const normalizeWilayah = (value) => {
        if (!value) return null;
        if (Array.isArray(value)) return value[0] || null;
        if (typeof value === "object") return value;
        if (typeof value === "string") return { nama_wilayah: value };
        return null;
    };

    const isProvinsiLike = (value) => {
        if (!value) return false;

        const jenis = String(
            value?.jenis_wilayah ||
            value?.tipe_wilayah ||
            value?.jenis ||
            value?.tipe ||
            "",
        ).toUpperCase();

        return jenis.includes("PROV") || getWilayahParentId(value) === null;
    };

    const lookup = buildWilayahLookup(wilayahList);

    const directWilayah = normalizeWilayah(
        currentUser?.wilayah || currentUser?.data?.wilayah || tokenPayload?.wilayah,
    );

    if (directWilayah) {
        const resolved = resolveWilayahByReference(directWilayah, lookup) || directWilayah;

        if (isProvinsiLike(resolved)) return resolved;

        const parent = resolveWilayahByReference(getWilayahParentId(resolved), lookup);
        if (parent) return parent;
    }

    const wilayahIds = [
        ...getUserWilayahIds(currentUser),
        ...getUserWilayahIds(tokenPayload),
    ];

    if (wilayahIds.length > 0) {
        const found = wilayahList.find((wilayah) => {
            const itemId = getWilayahId(wilayah);
            return itemId && wilayahIds.includes(String(itemId));
        });

        if (found) {
            if (isProvinsiLike(found)) return found;

            const parent = resolveWilayahByReference(getWilayahParentId(found), lookup);
            if (parent) return parent;
        }
    }

    const currentUserId = String(
        currentUser?.id_user ||
        currentUser?.id ||
        currentUser?.user_id ||
        tokenPayload?.sub ||
        tokenPayload?.id_user ||
        tokenPayload?.id ||
        "",
    );

    if (currentUserId) {
        const assignedWilayah = wilayahList.find((wilayah) => {
            const assignedUserId =
                wilayah?.id_user ??
                wilayah?.user_id ??
                wilayah?.user?.id_user ??
                wilayah?.user?.id ??
                wilayah?.user?.user_id ??
                null;

            return assignedUserId !== null && String(assignedUserId) === currentUserId;
        });

        if (assignedWilayah) {
            if (isProvinsiLike(assignedWilayah)) return assignedWilayah;

            const parent = resolveWilayahByReference(
                getWilayahParentId(assignedWilayah),
                lookup,
            );
            if (parent) return parent;
        }
    }

    const kabupatenTugas = [
        ...(Array.isArray(currentUser?.kabupaten_tugas)
            ? currentUser.kabupaten_tugas
            : []),
        ...(Array.isArray(tokenPayload?.kabupaten_tugas)
            ? tokenPayload.kabupaten_tugas
            : []),
    ];

    for (const tugas of kabupatenTugas) {
        const provinsiReference =
            tugas?.id_provinsi ||
            tugas?.provinsi_id ||
            tugas?.nama_provinsi ||
            tugas?.provinsi;

        const provinsi = resolveWilayahByReference(provinsiReference, lookup);
        if (provinsi) return provinsi;
    }

    return null;
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
    return (
        school?.nama_sekolah ||
        school?.namaSekolah ||
        school?.school_name ||
        school?.nama ||
        school?.name ||
        "Nama sekolah belum diisi"
    );
}

function getSchoolJenjang(school) {
    return (
        school?.jenjang ||
        school?.jenis_sekolah ||
        school?.jenisSekolah ||
        school?.tingkat ||
        school?.bentuk_pendidikan ||
        school?.bentukPendidikan ||
        school?.level ||
        "Belum Diisi"
    );
}

function getSchoolAddress(school) {
    return (
        school?.alamat_lengkap ||
        school?.alamatLengkap ||
        school?.alamat ||
        school?.alamat_sekolah ||
        school?.alamatSekolah ||
        school?.address ||
        school?.lokasi ||
        school?.domisili ||
        "Belum Diisi"
    );
}

function getSchoolYear(school) {
    return (
        school?.tahun_binaan ||
        school?.tahunBinaan ||
        school?.tahun_awal_binaan ||
        school?.tahunAwalBinaan ||
        school?.wilayah?.tahun_awal_binaan ||
        school?.wilayah?.tahunAwalBinaan ||
        "Belum Diisi"
    );
}

function getSchoolWilayahFullName(school) {
    const wilayah = school?.wilayah || {};

    return (
        wilayah?.nama_wilayah ||
        wilayah?.namaWilayah ||
        wilayah?.nama ||
        wilayah?.name ||
        school?.nama_wilayah ||
        school?.namaWilayah ||
        school?.wilayah_nama ||
        school?.region ||
        (typeof school?.wilayah === "string" ? school.wilayah : "") ||
        ""
    );
}

function getSchoolWilayahName(school) {
    return cleanLeafName(getSchoolWilayahFullName(school));
}

function getSchoolProvinceName(school) {
    return (
        school?.wilayah?.parent?.nama_wilayah ||
        school?.wilayah?.parent_wilayah?.nama_wilayah ||
        school?.provinsi?.nama_wilayah ||
        school?.nama_provinsi ||
        "Provinsi belum tersedia"
    );
}

function getSchoolWilayahIds(school) {
    const wilayah = school?.wilayah || {};

    return [
        school?.id_wilayah,
        school?.idWilayah,
        school?.wilayah_id,
        school?.id_parent,
        school?.parent_id,
        wilayah?.id_wilayah,
        wilayah?.idWilayah,
        wilayah?.wilayah_id,
        wilayah?.id,
        wilayah?.id_parent,
        wilayah?.parent_id,
        wilayah?.parent?.id_wilayah,
        wilayah?.parent?.id,
        wilayah?.induk?.id_wilayah,
        wilayah?.induk?.id,
        wilayah?.wilayah_induk?.id_wilayah,
        wilayah?.wilayah_induk?.id,
    ]
        .filter(Boolean)
        .map(String);
}

function getWilayahParentId(wilayah) {
    return (
        wilayah?.id_parent ??
        wilayah?.parent_id ??
        wilayah?.id_induk ??
        wilayah?.parent?.id_wilayah ??
        wilayah?.parent?.id ??
        null
    );
}

function buildWilayahLookup(wilayahList = []) {
    const idMap = new Map();
    const nameMap = new Map();

    wilayahList.forEach((wilayah) => {
        const id = getWilayahId(wilayah);
        const name = cleanText(getWilayahFullName(wilayah) || getWilayahName(wilayah));

        if (id) idMap.set(String(id), wilayah);
        if (name) nameMap.set(name, wilayah);
    });

    return { idMap, nameMap };
}

function resolveWilayahByReference(value, lookup) {
    if (!value) return null;

    if (typeof value === "object") {
        const id = getWilayahId(value);
        const fromId = id ? lookup.idMap.get(String(id)) : null;
        const name = cleanText(getWilayahFullName(value) || getWilayahName(value));
        const fromName = name ? lookup.nameMap.get(name) : null;

        return { ...(fromId || fromName || {}), ...value };
    }

    const text = String(value).trim();
    if (!text) return null;

    return lookup.idMap.get(text) || lookup.nameMap.get(cleanText(text)) || null;
}

function enrichSchoolWilayah(school, wilayahList = []) {
    const lookup = buildWilayahLookup(wilayahList);

    const wilayahId =
        school?.id_wilayah ??
        school?.idWilayah ??
        school?.wilayah_id ??
        school?.wilayah?.id_wilayah ??
        school?.wilayah?.id;

    const kabupatenId =
        school?.id_kabupaten ??
        school?.kabupaten_id ??
        school?.idKabupaten ??
        school?.kabupaten?.id_wilayah ??
        school?.kabupaten?.id;

    const provinsiId =
        school?.id_provinsi ??
        school?.provinsi_id ??
        school?.idProvinsi ??
        school?.provinsi?.id_wilayah ??
        school?.provinsi?.id;

    const directWilayah =
        resolveWilayahByReference(school?.wilayah, lookup) ||
        resolveWilayahByReference(wilayahId, lookup);

    let kabupaten =
        resolveWilayahByReference(school?.kabupaten, lookup) ||
        resolveWilayahByReference(kabupatenId, lookup);

    if (!kabupaten && directWilayah && !String(
        directWilayah?.jenis_wilayah || directWilayah?.tipe_wilayah || "",
    ).toUpperCase().includes("PROV")) {
        kabupaten = directWilayah;
    }

    if (!kabupaten) {
        const kabupatenName = cleanText(
            school?.nama_kabupaten || school?.kabupaten || school?.nama_wilayah,
        );
        if (kabupatenName) kabupaten = lookup.nameMap.get(kabupatenName) || null;
    }

    let provinsi =
        resolveWilayahByReference(school?.provinsi, lookup) ||
        resolveWilayahByReference(provinsiId, lookup);

    if (!provinsi && directWilayah) {
        if (String(
            directWilayah?.jenis_wilayah || directWilayah?.tipe_wilayah || "",
        ).toUpperCase().includes("PROV")) {
            provinsi = directWilayah;
        } else {
            provinsi = resolveWilayahByReference(getWilayahParentId(directWilayah), lookup);
        }
    }

    if (!provinsi && kabupaten) {
        provinsi = resolveWilayahByReference(getWilayahParentId(kabupaten), lookup);
    }

    if (!provinsi) {
        const provinceName = cleanText(school?.nama_provinsi || school?.provinsi);
        if (provinceName) provinsi = lookup.nameMap.get(provinceName) || null;
    }

    const mergedWilayah = {
        ...(directWilayah || kabupaten || {}),
        ...(typeof school?.wilayah === "object" ? school.wilayah : {}),
    };

    return {
        ...school,
        wilayah: Object.keys(mergedWilayah).length ? mergedWilayah : school?.wilayah,
        kabupaten: {
            ...(kabupaten || {}),
            ...(typeof school?.kabupaten === "object" ? school.kabupaten : {}),
        },
        provinsi: {
            ...(provinsi || {}),
            ...(typeof school?.provinsi === "object" ? school.provinsi : {}),
        },
        id_kabupaten:
            school?.id_kabupaten ?? getWilayahId(kabupaten) ?? school?.kabupaten_id ?? null,
        id_provinsi:
            school?.id_provinsi ?? getWilayahId(provinsi) ?? school?.provinsi_id ?? null,
        nama_kabupaten:
            school?.nama_kabupaten || getWilayahName(kabupaten) || "Belum Diisi",
        nama_provinsi:
            school?.nama_provinsi || getWilayahName(provinsi) || "Belum Diisi",
    };
}

function schoolBelongsToWilayah(school, wilayah) {
    if (!wilayah) return false;

    const targetId = getWilayahId(wilayah);

    if (targetId) {
        const schoolWilayahIds = getSchoolWilayahIds(school);

        if (schoolWilayahIds.includes(String(targetId))) {
            return true;
        }
    }

    const targetFullName = cleanText(getWilayahFullName(wilayah));
    const targetLeafName = cleanText(getWilayahName(wilayah));
    const schoolFullName = cleanText(getSchoolWilayahFullName(school));
    const schoolLeafName = cleanText(getSchoolWilayahName(school));
    const schoolProvinceName = cleanText(getSchoolProvinceName(school));

    if (!targetFullName && !targetLeafName) return false;
    if (!schoolFullName && !schoolLeafName && !schoolProvinceName) return false;

    return (
        schoolFullName === targetFullName ||
        schoolFullName === targetLeafName ||
        schoolLeafName === targetFullName ||
        schoolLeafName === targetLeafName ||
        schoolProvinceName === targetFullName ||
        schoolProvinceName === targetLeafName ||
        schoolFullName.includes(targetFullName) ||
        schoolFullName.includes(targetLeafName) ||
        schoolProvinceName.includes(targetFullName) ||
        targetFullName.includes(schoolFullName)
    );
}

function normalizeCategory(value) {
    const normalized = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (
        normalized.includes("SENI_BUDAYA") ||
        normalized.includes("SENI_DAN_BUDAYA") ||
        normalized.includes("KECAKAPAN_HIDUP") ||
        normalized.includes("LIFE_SKILL") ||
        normalized.includes("NON_AKADEMIK") ||
        normalized.includes("NONAKADEMIK") ||
        normalized.includes("NON_ACADEMIC")
    ) {
        return "NON_AKADEMIK";
    }

    if (
        normalized === "KARAKTER" ||
        normalized.includes("CHARACTER") ||
        normalized.includes("AKADEMIK") ||
        normalized.includes("ACADEMIC")
    ) {
        return "AKADEMIK";
    }

    return normalized || "TANPA_KATEGORI";
}

function getProgramCategoryValue(program) {
    return (
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.pilar ||
        program?.sub_kategori ||
        program?.subKategori ||
        program?.kategori_pilar ||
        program?.kategori ||
        program?.kategori_program ||
        program?.jenis ||
        program?.tipe ||
        program?.category ||
        ""
    );
}

function getCategoryLabel(value) {
    const category = normalizeCategory(value);

    if (category === "AKADEMIK") return "Akademik";
    if (category === "NON_AKADEMIK") return "Non Akademik";

    return "Tanpa Kategori";
}

function itemMatchesCategory(item, activeFilter) {
    if (activeFilter === "SEMUA") return true;

    return normalizeCategory(getProgramCategoryValue(item)) === activeFilter;
}

function pushFlexibleIds(ids, value) {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
        value.forEach((item) => pushFlexibleIds(ids, item));
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
                pushFlexibleIds(ids, JSON.parse(trimmed));
                return;
            } catch {
                ids.push(trimmed);
                return;
            }
        }

        if (trimmed.includes(",")) {
            trimmed
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => ids.push(item));
            return;
        }

        ids.push(trimmed);
        return;
    }

    if (typeof value === "object") {
        pushFlexibleIds(
            ids,
            value?.id_sekolah ??
            value?.idSekolah ??
            value?.sekolah_id ??
            value?.school_id ??
            value?.id,
        );
        return;
    }

    ids.push(value);
}

function collectSchoolIdsFromProgram(program) {
    const ids = [];

    [
        program?.id_sekolah,
        program?.idSekolah,
        program?.sekolah_id,
        program?.school_id,
        program?.target_sekolah_ids,
        program?.targetSchoolIds,
        program?.targetSekolahIds,
        program?.sekolah_ids,
        program?.id_sekolahs,
        program?.school_ids,
        program?.sekolah,
        program?.sekolahs,
        program?.schools,
        program?.target_sekolah,
        program?.__school_ids,
    ].forEach((value) => pushFlexibleIds(ids, value));

    return [...new Set(ids.map(String).filter(Boolean))];
}

function collectSchoolNamesFromProgram(program) {
    const values = [
        program?.nama_sekolah,
        program?.daftar_sekolah,
        program?.school_name,
        program?.target_school_names,
        program?.targetSchoolNames,
        program?.nama_target_sekolah,
        program?.target_sekolah_nama,
        program?.sekolah,
        program?.sekolahs,
        program?.schools,
        program?.target_sekolah,
    ];

    const names = [];

    values.forEach((value) => {
        if (!value) return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (typeof item === "string") names.push(item);
                else if (item && typeof item === "object") {
                    names.push(getSchoolName(item));
                }
            });
            return;
        }

        if (typeof value === "object") {
            names.push(getSchoolName(value));
            return;
        }

        String(value)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => names.push(item));
    });

    return [...new Set(names.map(cleanText).filter(Boolean))];
}

function enrichProgramSchoolLinks(program, schools = []) {
    const idSet = new Set(collectSchoolIdsFromProgram(program).map(String));
    const nameSet = new Set(collectSchoolNamesFromProgram(program));

    schools.forEach((school) => {
        const schoolId = getSchoolId(school);
        const schoolName = cleanText(getSchoolName(school));

        if (schoolId && nameSet.has(schoolName)) idSet.add(String(schoolId));
    });

    return {
        ...program,
        __school_ids: [...idSet],
    };
}

function getProgramId(program) {
    return program?.id_program ?? program?.id ?? null;
}

function getProgramName(program) {
    return (
        program?.nama_program ||
        program?.nama ||
        program?.title ||
        "Program Tanpa Nama"
    );
}

function getProgramYear(program) {
    return program?.tahun || program?.tahun_program || program?.year || "Belum Diisi";
}

function getProgramKpi(program) {
    if (!program?.kpi_nama && !program?.kpi_target) return "Belum Diisi";

    return `${program?.kpi_nama || "KPI"}${program?.kpi_target
        ? ` (${program.kpi_target}${program?.kpi_satuan || ""})`
        : ""
        }`;
}

function getProgramRawStatus(program) {
    return (
        program?.status_program ||
        program?.status ||
        program?.fase_status ||
        program?.status_program_berjalan ||
        "Berjalan"
    );
}

function getProgramTime(program) {
    const value =
        program?.updated_at ||
        program?.created_at ||
        program?.tanggal_mulai ||
        program?.start_date ||
        program?.tanggal;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getRequirementStatus(requirement) {
    const status = String(requirement?.status || "").toUpperCase();

    if (status === "APPROVED") return "APPROVED";
    if (status === "WAITING_AO") return "WAITING_AO";
    if (status === "WAITING_HO") return "WAITING_HO";
    if (status === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (status === "REJECTED_AO") return "REJECTED_AO";
    if (status === "REJECTED_HO") return "REJECTED_HO";
    if (status === "REJECTED") return "REJECTED";

    if (requirement?.file_path || requirement?.nama_file || requirement?.file_url) {
        return "WAITING_AO";
    }

    return "WAITING_UPLOAD";
}

function getAllRequirements(program) {
    const periods = getArray(program?.fases);

    return periods.flatMap((period) => {
        const openingRequirements = getArray(
            period.termin,
            period.termins,
            period.t_termin,
        ).flatMap((termin) =>
            getArray(
                termin.persyaratan,
                termin.persyaratan_termin,
                termin.requirements,
                termin.t_persyaratan_termin,
            ),
        );

        const activityRequirements = getArray(
            period.kegiatans,
            period.kegiatan,
            period.t_kegiatans,
        ).flatMap((activity) =>
            getArray(
                activity.persyaratan,
                activity.persyaratan_kegiatan,
                activity.requirements,
                activity.t_persyaratan_kegiatan,
            ),
        );

        return [...openingRequirements, ...activityRequirements];
    });
}

function getProgramProgress(program) {
    const requirements = getAllRequirements(program);
    const total = requirements.length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;
    const waitingAo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_AO",
    ).length;
    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;
    const rejected = requirements.filter((item) =>
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
            getRequirementStatus(item),
        ),
    ).length;
    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    return {
        total,
        approved,
        waitingAo,
        waitingHo,
        rejected,
        waitingUpload,
        percentage: total ? Math.round((approved / total) * 100) : 0,
    };
}

function getProgramDisplayStatus(program) {
    const progress = getProgramProgress(program);

    if (progress.total > 0) {
        if (progress.percentage >= 100) return "Selesai";
        if (progress.rejected > 0) return "Perlu Revisi";
        if (progress.waitingAo > 0) return "Review AO";
        if (progress.waitingHo > 0) return "Keputusan HO";
        if (progress.waitingUpload > 0) return "Perlu Upload";
    }

    const raw = getProgramRawStatus(program);

    if (String(raw || "").toLowerCase().includes("approval")) return "Approval";

    return raw || "Berjalan";
}

function getStatusClass(status) {
    const text = String(status || "").toLowerCase();

    if (
        text.includes("selesai") ||
        text.includes("done") ||
        text.includes("completed") ||
        text.includes("approved")
    ) {
        return STATUS_CLASS.selesai;
    }

    if (text.includes("review ao")) return STATUS_CLASS.review;

    if (
        text.includes("approval") ||
        text.includes("keputusan") ||
        text.includes("upload") ||
        text.includes("menunggu") ||
        text.includes("waiting")
    ) {
        return STATUS_CLASS.warning;
    }

    if (
        text.includes("revisi") ||
        text.includes("reject") ||
        text.includes("ditolak")
    ) {
        return STATUS_CLASS.revisi;
    }

    if (
        text.includes("aktif") ||
        text.includes("berjalan") ||
        text.includes("implementasi") ||
        text.includes("sosialisasi") ||
        text.includes("evaluasi")
    ) {
        return STATUS_CLASS.aktif;
    }

    return STATUS_CLASS.default;
}

function formatDate(value) {
    if (!value) return "Belum Diisi";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Belum Diisi";

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCoordinate(value) {
    if (value === null || value === undefined || value === "") return "Belum Diisi";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return "Belum Diisi";

    return numberValue.toFixed(6);
}


function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${getStatusClass(status)}`}
        >
            {status || "Belum Diisi"}
        </span>
    );
}

function FilterButton({ active, label, onClick, color }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition ${active
                ? "text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                : "border-slate-100 bg-white text-slate-400 hover:border-cyan-100 hover:text-[#0AC4E0]"
                }`}
            style={{
                backgroundColor: active ? color : undefined,
                borderColor: active ? color : undefined,
            }}
        >
            {label}
        </button>
    );
}

function StatCard({ label, value, helper, icon, color }) {
    return (
        <div
            className="relative overflow-hidden rounded-[1.45rem] border border-slate-100 bg-white px-5 py-4 shadow-[0_14px_38px_rgba(15,23,42,0.04)]"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10"
                style={{ backgroundColor: color }}
            />

            <div className="relative flex items-center justify-between gap-4">
                <div>
                    <p
                        className="text-[9px] font-black uppercase tracking-[0.18em]"
                        style={{ color }}
                    >
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-black leading-none text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${color}16`, color }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, desc }) {
    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                {icon}
            </div>

            <p className="mt-3 text-sm font-black text-slate-700">{title}</p>

            <p className="mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-400">
                {desc}
            </p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <p className="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className="line-clamp-2 text-right text-[11px] font-bold leading-5 text-slate-700">
                {value || "Belum Diisi"}
            </p>
        </div>
    );
}

function MiniInfoCard({ label, value, icon, tone = "cyan" }) {
    const toneClass = {
        cyan: "bg-cyan-50 text-cyan-600",
        blue: "bg-blue-50 text-blue-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        slate: "bg-slate-50 text-slate-600",
    }[tone];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
                {icon}
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className="mt-1 line-clamp-2 text-sm font-black leading-snug text-slate-800">
                {value || "Belum Diisi"}
            </p>
        </div>
    );
}

function ProgramCompactCard({ program }) {
    const status = getProgramDisplayStatus(program);
    const progress = getProgramProgress(program);

    return (
        <article className="rounded-[1.35rem] border border-slate-100 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Tahun {getProgramYear(program)} ·{" "}
                        {getCategoryLabel(getProgramCategoryValue(program))}
                    </p>

                    <h4 className="mt-1 line-clamp-2 text-[14px] font-black leading-snug text-slate-900">
                        {getProgramName(program)}
                    </h4>
                </div>

                <StatusBadge status={status} />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <InfoRow
                    label="Kode"
                    value={program?.kode_program || `PRG-${getProgramId(program) || "Belum Diisi"}`}
                />
                <div className="mt-2">
                    <InfoRow label="KPI" value={getProgramKpi(program)} />
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Progress Bukti
                    </span>
                    <span className="text-[11px] font-black text-[#0AC4E0]">
                        {progress.percentage}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-[#0AC4E0]"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>
        </article>
    );
}

function SchoolCard({ school, programs = [], onClick }) {
    const selesai = programs.filter(
        (program) => getProgramDisplayStatus(program) === "Selesai",
    ).length;
    const berjalan = programs.length - selesai;

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter") onClick();
            }}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-slate-200/70"
        >
            <div className="h-2 w-full bg-gradient-to-r from-[#0AC4E0] to-[#2563EB]" />

            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                            <School size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                                NPSN {school?.npsn || "Belum Diisi"} · {getSchoolJenjang(school)}
                            </p>

                            <h3 className="mt-1 line-clamp-2 min-h-[40px] text-[16px] font-black leading-snug tracking-[-0.03em] text-slate-900">
                                {getSchoolName(school)}
                            </h3>

                            <p className="mt-1 line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {getSchoolWilayahName(school)}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                        <p className="text-[20px] font-black leading-none">{programs.length}</p>
                        <p className="mt-1 text-[6px] font-black uppercase tracking-widest text-white/60">
                            Program
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Selesai
                        </p>
                        <p className="mt-1 text-lg font-black text-emerald-600">
                            {selesai}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Berjalan
                        </p>
                        <p className="mt-1 text-lg font-black text-amber-600">
                            {berjalan}
                        </p>
                    </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
                    <InfoRow label="Tahun Binaan" value={getSchoolYear(school)} />
                    <div className="mt-2">
                        <InfoRow label="Alamat" value={getSchoolAddress(school)} />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClick();
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                >
                    Lihat Detail Sekolah
                    <Navigation size={14} />
                </button>
            </div>
        </article>
    );
}

function RegionalProfileCard({ wilayah, schools, programs, currentUser }) {
    if (!wilayah) {
        return (
            <section className="overflow-hidden rounded-[2.5rem] border border-red-100 bg-white p-6 shadow-xl shadow-red-100/40">
                <EmptyState
                    icon={<AlertTriangle size={25} />}
                    title="Wilayah Belum Terhubung"
                    desc="Akun Kepala Dinas belum memiliki id_wilayah atau relasi wilayah. Cek data user Kepala Dinas di Master Kepala Dinas/User."
                />
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-xl shadow-slate-200/40">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-600">
                    <MapPinned size={14} />
                    <span>Profil Wilayah Kepala Dinas</span>
                </div>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Regional Monitoring Provinsi
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 p-7 text-white">
                    <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-500/20 blur-2xl" />

                    <div className="relative">
                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                            <Building2 size={18} />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">
                            Dinas Pendidikan · Otoritas Wilayah
                        </p>

                        <h3 className="mt-3 text-3xl font-black leading-tight tracking-[-0.06em]">
                            {getWilayahName(wilayah)}
                        </h3>

                        <p className="mt-3 max-w-2xl text-xs font-semibold leading-6 text-slate-300">
                            Dashboard ini menampilkan sekolah dan program yang berada di bawah wilayah penugasan Kepala Dinas yang sedang login.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    Sekolah
                                </p>
                                <p className="mt-1 text-xl font-black text-cyan-200">
                                    {schools.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    Program
                                </p>
                                <p className="mt-1 text-xl font-black text-white">
                                    {programs.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    SD/SMP/SMK
                                </p>
                                <p className="mt-1 text-xl font-black text-white">
                                    {[...new Set(schools.map(getSchoolJenjang).filter(Boolean))].length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-xl font-black text-emerald-300">
                                    Aktif
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <MiniInfoCard
                        label="Kepala Dinas Login"
                        value={currentUser?.nama || currentUser?.name || currentUser?.email || "Belum Diisi"}
                        icon={<ShieldCheck size={17} />}
                        tone="cyan"
                    />

                    <MiniInfoCard
                        label="Kabupaten/Kota Terpantau"
                        value={`${new Set(schools.map(getSchoolWilayahName).filter(Boolean)).size} wilayah`}
                        icon={<MapPinned size={17} />}
                        tone="blue"
                    />

                    <MiniInfoCard
                        label="Tipe Wilayah"
                        value={wilayah?.tipe_wilayah || wilayah?.jenis_wilayah || wilayah?.tipe || "Belum Diisi"}
                        icon={<Globe size={17} />}
                        tone="violet"
                    />
                </div>
            </div>
        </section>
    );
}

function SchoolDetailModal({ school, programs, onClose }) {
    if (!school) return null;

    const selesai = programs.filter(
        (program) => getProgramDisplayStatus(program) === "Selesai",
    ).length;
    const berjalan = programs.length - selesai;

    return (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 px-5 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-[2.2rem] border border-slate-100 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.28)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white px-6 py-5">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Detail Sekolah Wilayah Kepala Dinas
                        </p>

                        <h2 className="mt-1 text-[26px] font-black tracking-[-0.05em] text-slate-950">
                            {getSchoolName(school)}
                        </h2>

                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                            {getSchoolWilayahName(school)} · {getSchoolJenjang(school)} ·{" "}
                            {programs.length} program
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[74vh] overflow-y-auto p-6">
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            label="Jumlah Program"
                            value={programs.length}
                            helper="total terhubung"
                            icon={<FolderKanban size={20} />}
                            color={COLORS.cyan}
                        />
                        <StatCard
                            label="Program Berjalan"
                            value={berjalan}
                            helper="belum selesai"
                            icon={<Clock3 size={20} />}
                            color={COLORS.amber}
                        />
                        <StatCard
                            label="Program Selesai"
                            value={selesai}
                            helper="progress selesai"
                            icon={<CheckCircle2 size={20} />}
                            color={COLORS.emerald}
                        />
                        <StatCard
                            label="Guru"
                            value={school?.jumlah_guru || 0}
                            helper="data master"
                            icon={<UsersRound size={20} />}
                            color={COLORS.blue}
                        />
                        <StatCard
                            label="Siswa"
                            value={school?.jumlah_siswa || 0}
                            helper="data master"
                            icon={<GraduationCap size={20} />}
                            color={COLORS.violet}
                        />
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5 lg:col-span-5">
                            <h3 className="text-sm font-black text-slate-900">
                                Identitas Sekolah
                            </h3>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <MiniInfoCard
                                    label="NPSN"
                                    value={school?.npsn || "Belum Diisi"}
                                    icon={<Hash size={16} />}
                                    tone="cyan"
                                />
                                <MiniInfoCard
                                    label="Jenjang"
                                    value={getSchoolJenjang(school)}
                                    icon={<School size={16} />}
                                    tone="blue"
                                />
                                <MiniInfoCard
                                    label="Akreditasi"
                                    value={school?.akreditasi || "Belum Terakreditasi"}
                                    icon={<Award size={16} />}
                                    tone="emerald"
                                />
                                <MiniInfoCard
                                    label="Tahun Binaan"
                                    value={getSchoolYear(school)}
                                    icon={<CalendarDays size={16} />}
                                    tone="violet"
                                />
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 lg:col-span-7">
                            <h3 className="text-sm font-black text-slate-900">
                                Lokasi & Wilayah
                            </h3>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                <MiniInfoCard
                                    label="Kabupaten/Kota"
                                    value={getSchoolWilayahName(school)}
                                    icon={<MapPinned size={16} />}
                                    tone="cyan"
                                />
                                <MiniInfoCard
                                    label="Provinsi"
                                    value={getSchoolProvinceName(school)}
                                    icon={<Globe size={16} />}
                                    tone="blue"
                                />
                                <MiniInfoCard
                                    label="Koordinat"
                                    value={`${formatCoordinate(school?.latitude)}, ${formatCoordinate(school?.longitude)}`}
                                    icon={<Navigation size={16} />}
                                    tone="amber"
                                />
                                <MiniInfoCard
                                    label="Status"
                                    value={school?.status === false ? "Nonaktif" : "Aktif"}
                                    icon={<ShieldCheck size={16} />}
                                    tone="emerald"
                                />
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Alamat Operasional
                                </p>
                                <p className="mt-2 text-sm font-bold leading-7 text-slate-700">
                                    {getSchoolAddress(school)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
                        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                            <h3 className="text-sm font-black text-slate-900">
                                Program Sekolah
                            </h3>
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                Program yang terhubung dengan sekolah ini.
                            </p>
                        </div>

                        <div className="p-5">
                            {programs.length === 0 ? (
                                <EmptyState
                                    icon={<FolderKanban size={25} />}
                                    title="Belum Ada Program"
                                    desc="Sekolah ini belum memiliki program yang terhubung."
                                />
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {programs.map((program, index) => (
                                        <ProgramCompactCard
                                            key={`${getProgramId(program) || getProgramName(program)}-${index}`}
                                            program={program}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function getAssessmentId(item) {
    return item?.id_assessment ?? item?.assessment_id ?? item?.id ?? null;
}

function getAssessmentName(item) {
    return (
        item?.nama_assessment ||
        item?.nama ||
        item?.title ||
        item?.judul ||
        "Assessment Tanpa Nama"
    );
}

function getAssessmentTime(item) {
    const value =
        item?.updated_at ||
        item?.created_at ||
        item?.sent_at ||
        item?.tenggat ||
        item?.deadline ||
        item?.tanggal;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getAssessmentStatus(item) {
    return (
        item?.status_assessment ||
        item?.status ||
        item?.status_pengisian ||
        (item?.sent_at ? "Terkirim" : null) ||
        (item?.aktif === false || item?.is_active === false ? "Nonaktif" : null) ||
        "Draft"
    );
}

function getKadinRawPillar(item) {
    return (
        item?.pilar_program ||
        item?.pilarProgram ||
        item?.pilar ||
        item?.sub_kategori ||
        item?.subKategori ||
        item?.kategori_pilar ||
        item?.kategoriPilar ||
        item?.bidang_program ||
        item?.program?.pilar_program ||
        item?.program?.pilar ||
        item?.assessment?.pilar ||
        ""
    );
}

function getKadinRawCategory(item) {
    return (
        item?.kategori ||
        item?.kategori_program ||
        item?.kategori_assessment ||
        item?.jenis_assessment ||
        item?.jenis ||
        item?.category ||
        ""
    );
}

function getKadinPillarKey(item) {
    const pillar = String(getKadinRawPillar(item) || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (pillar.includes("KARAKTER") || pillar.includes("CHARACTER")) {
        return "KARAKTER";
    }

    if (
        pillar.includes("SENI_BUDAYA") ||
        pillar.includes("SENI_DAN_BUDAYA") ||
        pillar === "SENI"
    ) {
        return "SENI_BUDAYA";
    }

    if (
        pillar.includes("KECAKAPAN_HIDUP") ||
        pillar.includes("LIFE_SKILL") ||
        pillar.includes("LIFESKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }

    if (pillar.includes("AKADEMIK") || pillar.includes("ACADEMIC")) {
        return "AKADEMIK";
    }

    const category = String(getKadinRawCategory(item) || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (category.includes("KARAKTER")) return "KARAKTER";
    if (category.includes("SENI_BUDAYA")) return "SENI_BUDAYA";
    if (category.includes("KECAKAPAN_HIDUP")) return "KECAKAPAN_HIDUP";
    if (category.includes("NON_AKADEMIK") || category.includes("NONAKADEMIK")) {
        return "SENI_BUDAYA";
    }

    return "AKADEMIK";
}

function getKadinProgramType(item) {
    const value = String(
        item?.jenis_program ||
        item?.jenisProgram ||
        item?.tipe_program ||
        item?.type_program ||
        item?.tipe ||
        "",
    )
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (value.includes("PROJECT")) return "PROJECT";
    if (value.includes("REGULER")) return "REGULER";
    return "LAINNYA";
}

function getKadinProgressBucket(item, type) {
    const status = String(
        type === "PROGRAM" ? getProgramDisplayStatus(item) : getAssessmentStatus(item),
    ).toLowerCase();

    const percentage = Number(
        item?.persentase ||
        item?.progress ||
        item?.completion_rate ||
        item?.percentage ||
        0,
    );

    if (percentage >= 100) return "SELESAI";

    if (
        status.includes("selesai") ||
        status.includes("completed") ||
        status.includes("sudah lengkap") ||
        status.includes("sudah dilengkapi")
    ) {
        return "SELESAI";
    }

    return "PROSES";
}

function flattenKadinSearchValue(value, seen = new WeakSet()) {
    if (value === null || value === undefined) return "";

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => flattenKadinSearchValue(item, seen)).join(" ");
    }

    if (typeof value === "object") {
        if (seen.has(value)) return "";
        seen.add(value);

        return Object.values(value)
            .map((item) => flattenKadinSearchValue(item, seen))
            .join(" ");
    }

    return "";
}

function resolveKadinTargets(item, schools = []) {
    const idSet = new Set(collectSchoolIdsFromProgram(item).map(String));
    const nameSet = new Set(collectSchoolNamesFromProgram(item));
    const result = [];

    schools.forEach((school) => {
        const schoolId = getSchoolId(school);
        const normalizedName = cleanText(getSchoolName(school));

        if (
            (schoolId && idSet.has(String(schoolId))) ||
            (normalizedName && nameSet.has(normalizedName))
        ) {
            result.push(school);
        }
    });

    return result;
}

function getKadinItemTitle(item, type) {
    return type === "PROGRAM" ? getProgramName(item) : getAssessmentName(item);
}

function getKadinItemCode(item, type) {
    if (type === "PROGRAM") {
        return (
            item?.kode_program ||
            item?.nomor_mou ||
            `PRG-${getProgramId(item) || "Belum Diisi"}`
        );
    }

    return (
        item?.kode_assessment ||
        item?.kode ||
        `ASM-${getAssessmentId(item) || "Belum Diisi"}`
    );
}

function getKadinItemStatus(item, type) {
    return type === "PROGRAM"
        ? getProgramDisplayStatus(item)
        : getAssessmentStatus(item);
}

function getKadinItemDate(item, type) {
    return (
        item?.created_at ||
        item?.createdAt ||
        item?.sent_at ||
        (type === "ASSESSMENT" ? item?.tenggat || item?.deadline : item?.tanggal_mulai) ||
        null
    );
}

function getKadinMapNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function isKadinCoordinateValid(coordinate) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) return false;
    const [lat, lng] = coordinate;

    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -12 &&
        lat <= 7.5 &&
        lng >= 94 &&
        lng <= 142
    );
}

function getKadinRegionType(region) {
    const value = String(
        region?.jenis_wilayah ||
        region?.tipe_wilayah ||
        region?.jenis ||
        region?.tipe ||
        "",
    ).toUpperCase();

    if (value.includes("PROV")) return "PROVINSI";
    if (value.includes("KAB") || value.includes("KOTA")) return "KABUPATEN";
    return "";
}

function getKadinRegionCoordinate(region) {
    const lat = getKadinMapNumber(
        region?.latitude ?? region?.lat ?? region?.center_latitude,
    );
    const lng = getKadinMapNumber(
        region?.longitude ?? region?.lng ?? region?.long ?? region?.center_longitude,
    );

    const coordinate = [lat, lng];
    return isKadinCoordinateValid(coordinate) ? coordinate : null;
}

function parseKadinBounds(raw) {
    if (!raw) return null;

    let value = raw;

    if (typeof value === "string") {
        try {
            value = JSON.parse(value);
        } catch {
            return null;
        }
    }

    const normalizePair = (pair) => {
        if (!Array.isArray(pair) || pair.length < 2) return null;
        const lat = getKadinMapNumber(pair[0]);
        const lng = getKadinMapNumber(pair[1]);
        const coordinate = [lat, lng];
        return isKadinCoordinateValid(coordinate) ? coordinate : null;
    };

    if (Array.isArray(value) && value.length >= 2) {
        const first = normalizePair(value[0]);
        const second = normalizePair(value[1]);

        if (first && second) return [first, second];
    }

    const south = getKadinMapNumber(
        value?.south ?? value?.minLat ?? value?.min_lat ?? value?.southWest?.lat,
    );
    const west = getKadinMapNumber(
        value?.west ?? value?.minLng ?? value?.min_lng ?? value?.southWest?.lng,
    );
    const north = getKadinMapNumber(
        value?.north ?? value?.maxLat ?? value?.max_lat ?? value?.northEast?.lat,
    );
    const east = getKadinMapNumber(
        value?.east ?? value?.maxLng ?? value?.max_lng ?? value?.northEast?.lng,
    );

    const first = [south, west];
    const second = [north, east];

    return isKadinCoordinateValid(first) && isKadinCoordinateValid(second)
        ? [first, second]
        : null;
}

function averageKadinCoordinate(values = []) {
    const coordinates = values.filter(isKadinCoordinateValid);
    if (!coordinates.length) return null;

    return [
        coordinates.reduce((total, item) => total + item[0], 0) / coordinates.length,
        coordinates.reduce((total, item) => total + item[1], 0) / coordinates.length,
    ];
}

function getKadinSchoolCoordinate(school) {
    const coordinate = [
        getKadinMapNumber(
            school?.latitude ??
            school?.lat ??
            school?.wilayah?.latitude ??
            school?.kabupaten?.latitude,
        ),
        getKadinMapNumber(
            school?.longitude ??
            school?.lng ??
            school?.long ??
            school?.wilayah?.longitude ??
            school?.kabupaten?.longitude,
        ),
    ];

    return isKadinCoordinateValid(coordinate) ? coordinate : null;
}

function deterministicKadinOffset(key, index = 0) {
    const source = String(key || index);
    let hash = 0;

    for (let cursor = 0; cursor < source.length; cursor += 1) {
        hash = (hash * 31 + source.charCodeAt(cursor)) % 100000;
    }

    const angle = ((hash % 360) * Math.PI) / 180;
    const radius = 0.25 + ((hash % 5) * 0.07);

    return [Math.sin(angle) * radius, Math.cos(angle) * radius];
}

function buildKadinProvinceMapData(wilayah, wilayahList = [], schools = []) {
    if (!wilayah || schools.length === 0) return null;

    const lookup = buildWilayahLookup(wilayahList);
    const directType = getKadinRegionType(wilayah);
    let province =
        directType === "PROVINSI"
            ? wilayah
            : resolveWilayahByReference(getWilayahParentId(wilayah), lookup);

    if (!province) {
        const firstSchoolProvince = schools[0]?.provinsi;
        province =
            resolveWilayahByReference(firstSchoolProvince, lookup) ||
            firstSchoolProvince ||
            wilayah;
    }

    const provinceName =
        getWilayahName(province) ||
        getSchoolProvinceName(schools[0]) ||
        "Provinsi Kepala Dinas";
    const provinceKey = cleanText(provinceName);
    const districtMap = new Map();

    schools.forEach((school) => {
        const directDistrict =
            resolveWilayahByReference(school?.kabupaten, lookup) ||
            resolveWilayahByReference(school?.id_kabupaten, lookup) ||
            resolveWilayahByReference(school?.wilayah, lookup);

        const districtName =
            school?.nama_kabupaten ||
            getWilayahName(directDistrict) ||
            getSchoolWilayahName(school) ||
            "Kabupaten Belum Dipetakan";
        const districtKey = cleanText(districtName);

        if (!districtMap.has(districtKey)) {
            districtMap.set(districtKey, {
                key: districtKey,
                name: districtName,
                region:
                    directDistrict && getKadinRegionType(directDistrict) !== "PROVINSI"
                        ? directDistrict
                        : null,
                provinceName,
                schools: [],
            });
        }

        districtMap.get(districtKey).schools.push({
            ...school,
            __mapCoordinate: getKadinSchoolCoordinate(school),
        });
    });

    const districts = [...districtMap.values()];
    const provinceMasterCoordinate = getKadinRegionCoordinate(province);
    const provinceBounds = parseKadinBounds(
        province?.bounds ?? province?.batas_wilayah ?? province?.boundary,
    );
    const schoolAverage = averageKadinCoordinate(
        schools.map(getKadinSchoolCoordinate),
    );
    const districtMasterAverage = averageKadinCoordinate(
        districts.map((item) => getKadinRegionCoordinate(item.region)),
    );
    const fallback =
        KADIN_PROVINCE_FALLBACKS[
        String(provinceName)
            .toUpperCase()
            .replace(/\bPROVINSI\b/g, "")
            .trim()
        ] || null;

    const center =
        provinceMasterCoordinate ||
        districtMasterAverage ||
        schoolAverage ||
        fallback ||
        KADIN_INDONESIA_CENTER;

    const mappedDistricts = districts
        .map((district, index) => {
            const masterCoordinate = getKadinRegionCoordinate(district.region);
            const schoolCoordinate = averageKadinCoordinate(
                district.schools.map((school) => school.__mapCoordinate),
            );
            let coordinate = masterCoordinate || schoolCoordinate;
            let approximate = false;

            if (!coordinate) {
                const [latOffset, lngOffset] = deterministicKadinOffset(
                    `${provinceKey}-${district.key}`,
                    index,
                );
                coordinate = [center[0] + latOffset, center[1] + lngOffset];
                approximate = true;
            }

            return {
                ...district,
                coordinate,
                approximate,
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const points = [
        ...mappedDistricts.map((item) => item.coordinate),
        ...schools.map(getKadinSchoolCoordinate),
    ].filter(isKadinCoordinateValid);

    let computedBounds = provinceBounds;

    if (!computedBounds && points.length >= 2) {
        const latitudes = points.map((item) => item[0]);
        const longitudes = points.map((item) => item[1]);

        computedBounds = [
            [Math.min(...latitudes), Math.min(...longitudes)],
            [Math.max(...latitudes), Math.max(...longitudes)],
        ];
    }

    return {
        key: provinceKey,
        name: provinceName,
        region: province,
        center,
        bounds: computedBounds,
        schools,
        districts: mappedDistricts,
    };
}

function makeKadinProvinceIcon(total) {
    return L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:44px;height:56px;">
                <div style="
                    position:absolute;left:8px;top:3px;width:30px;height:30px;
                    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                    background:#EF4444;border:3px solid #FFFFFF;
                    box-shadow:0 12px 28px rgba(15,23,42,.28);
                ">
                    <div style="
                        position:absolute;left:8px;top:8px;width:8px;height:8px;
                        border-radius:999px;background:#FFFFFF;
                    "></div>
                </div>
                <div style="
                    position:absolute;right:-4px;top:-4px;min-width:22px;height:22px;
                    padding:0 5px;border-radius:999px;background:#0F172A;color:#FFFFFF;
                    font-size:10px;line-height:22px;font-weight:900;text-align:center;
                    border:2px solid #FFFFFF;
                ">${total}</div>
            </div>
        `,
        iconSize: [46, 56],
        iconAnchor: [23, 51],
        popupAnchor: [0, -46],
    });
}

function makeKadinDistrictIcon(total, active = false) {
    return L.divIcon({
        className: "",
        html: `
            <div style="
                display:flex;align-items:center;justify-content:center;
                min-width:34px;height:34px;padding:0 9px;
                border-radius:14px 14px 14px 4px;
                background:${active ? "#0F172A" : "#2563EB"};
                color:#FFFFFF;border:3px solid #FFFFFF;
                box-shadow:0 10px 24px rgba(15,23,42,.24);
                font-size:11px;font-weight:900;
            ">${total}</div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 39],
        popupAnchor: [0, -35],
    });
}

function KadinMapViewport({ request }) {
    const map = useMap();

    useEffect(() => {
        if (!request) return undefined;

        const timer = window.setTimeout(() => {
            map.stop();
            map.invalidateSize();

            if (request.bounds?.length >= 2) {
                map.fitBounds(request.bounds, {
                    padding: [42, 42],
                    maxZoom: request.maxZoom ?? 9,
                    animate: true,
                    duration: 0.55,
                });
            } else if (request.center) {
                map.setView(request.center, request.zoom ?? 7, {
                    animate: true,
                });
            }
        }, 90);

        return () => window.clearTimeout(timer);
    }, [map, request]);

    return null;
}

function KadinDistrictPopup({ district }) {
    const [search, setSearch] = useState("");

    const filteredSchools = useMemo(() => {
        const keyword = cleanText(search);
        if (!keyword) return district.schools;

        return district.schools.filter((school) =>
            cleanText(
                `${getSchoolName(school)} ${school?.npsn || ""} ${getSchoolJenjang(
                    school,
                )}`,
            ).includes(keyword),
        );
    }, [district.schools, search]);

    return (
        <div className="w-[270px]">
            <div className="border-b border-slate-100 pb-3">
                <p className="text-[14px] font-black text-slate-900">
                    {district.name}
                </p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {district.provinceName}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                    {district.schools.length} Sekolah Binaan
                </span>
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

            <div className="mt-3 max-h-[200px] space-y-2 overflow-y-auto pr-1">
                {filteredSchools.slice(0, 5).map((school) => (
                    <div
                        key={getSchoolId(school) || getSchoolName(school)}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                        <p className="text-[11px] font-black leading-4 text-slate-800">
                            {getSchoolName(school)}
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-slate-400">
                            {getSchoolJenjang(school)} · NPSN {school?.npsn || "Belum Diisi"}
                        </p>
                    </div>
                ))}

                {filteredSchools.length === 0 && (
                    <p className="py-5 text-center text-[10px] font-bold text-slate-400">
                        Sekolah tidak ditemukan.
                    </p>
                )}
            </div>

            {filteredSchools.length > 5 && (
                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    +{filteredSchools.length - 5} sekolah lainnya
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

function KadinProvinceMap({ wilayah, wilayahList, schools }) {
    const mapData = useMemo(
        () => buildKadinProvinceMapData(wilayah, wilayahList, schools),
        [wilayah, wilayahList, schools],
    );
    const [focused, setFocused] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");
    const [search, setSearch] = useState("");
    const [viewport, setViewport] = useState({
        center: KADIN_INDONESIA_CENTER,
        zoom: KADIN_INDONESIA_ZOOM,
        nonce: 0,
    });

    useEffect(() => {
        setFocused(false);
        setSelectedDistrict("ALL");
        setSearch("");
        setViewport({
            center: KADIN_INDONESIA_CENTER,
            zoom: KADIN_INDONESIA_ZOOM,
            nonce: Date.now(),
        });
    }, [mapData?.key]);

    const filteredDistricts = useMemo(() => {
        if (!mapData || !focused) return [];

        const keyword = cleanText(search);

        return mapData.districts.filter((district) => {
            if (selectedDistrict !== "ALL" && district.key !== selectedDistrict) {
                return false;
            }

            if (!keyword) return true;

            return cleanText(
                `${district.name} ${district.schools
                    .map(
                        (school) =>
                            `${getSchoolName(school)} ${school?.npsn || ""} ${getSchoolJenjang(
                                school,
                            )}`,
                    )
                    .join(" ")}`,
            ).includes(keyword);
        });
    }, [focused, mapData, search, selectedDistrict]);

    const focusProvince = () => {
        if (!mapData) return;

        setFocused(true);
        setSelectedDistrict("ALL");
        setViewport({
            bounds: mapData.bounds,
            center: mapData.center,
            zoom: mapData.districts.length <= 1 ? 9 : 7,
            maxZoom: 9,
            nonce: Date.now(),
        });
    };

    const focusDistrict = (districtKey) => {
        setSelectedDistrict(districtKey);

        if (!mapData) return;
        if (districtKey === "ALL") {
            focusProvince();
            return;
        }

        const district = mapData.districts.find((item) => item.key === districtKey);
        if (!district) return;

        const schoolCoordinates = district.schools
            .map((school) => school.__mapCoordinate)
            .filter(isKadinCoordinateValid);

        let bounds = null;

        if (schoolCoordinates.length >= 2) {
            const latitudes = schoolCoordinates.map((item) => item[0]);
            const longitudes = schoolCoordinates.map((item) => item[1]);
            bounds = [
                [Math.min(...latitudes), Math.min(...longitudes)],
                [Math.max(...latitudes), Math.max(...longitudes)],
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
        setFocused(false);
        setSelectedDistrict("ALL");
        setSearch("");
        setViewport({
            center: KADIN_INDONESIA_CENTER,
            zoom: KADIN_INDONESIA_ZOOM,
            nonce: Date.now(),
        });
    };

    if (!mapData) {
        return (
            <section className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-6">
                <EmptyState
                    icon={<MapPinned size={25} />}
                    title="Peta Wilayah Belum Tersedia"
                    desc="Data sekolah atau relasi provinsi Kepala Dinas belum dapat dibaca."
                />
            </section>
        );
    }

    return (
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                        <MapPinned size={14} />
                        Peta Wilayah Kepala Dinas
                    </div>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                        Persebaran Sekolah di {mapData.name}
                    </h2>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        Hanya provinsi pada akun Kepala Dinas yang ditampilkan. Fokuskan provinsi untuk membuka marker kabupaten dan sekolah binaan.
                    </p>
                </div>

                {focused && (
                    <button
                        type="button"
                        onClick={resetMap}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-5 text-[10px] font-black uppercase tracking-widest text-cyan-700 transition hover:bg-cyan-100"
                    >
                        Kembali ke Marker Provinsi
                    </button>
                )}
            </div>

            <div className="grid gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 md:grid-cols-2">
                <select
                    value={selectedDistrict}
                    disabled={!focused}
                    onChange={(event) => focusDistrict(event.target.value)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-700 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="ALL">Semua Kabupaten/Kota</option>
                    {mapData.districts.map((district) => (
                        <option key={district.key} value={district.key}>
                            {district.name}
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
                        placeholder="Cari kabupaten, sekolah, jenjang, atau NPSN..."
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                    />
                </div>
            </div>

            <div className="relative h-[540px]">
                <MapContainer
                    center={KADIN_INDONESIA_CENTER}
                    zoom={KADIN_INDONESIA_ZOOM}
                    minZoom={4}
                    scrollWheelZoom
                    className="h-full w-full"
                >
                    <KadinMapViewport request={viewport} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {!focused && (
                        <Marker
                            position={mapData.center}
                            icon={makeKadinProvinceIcon(mapData.schools.length)}
                        >
                            <Popup>
                                <div className="w-[250px]">
                                    <p className="text-[14px] font-black text-slate-900">
                                        {mapData.name}
                                    </p>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-rose-50 p-3">
                                            <p className="text-[8px] font-black uppercase tracking-wider text-rose-500">
                                                Kabupaten
                                            </p>
                                            <p className="mt-1 text-xl font-black text-rose-700">
                                                {mapData.districts.length}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-cyan-50 p-3">
                                            <p className="text-[8px] font-black uppercase tracking-wider text-cyan-600">
                                                Sekolah
                                            </p>
                                            <p className="mt-1 text-xl font-black text-cyan-800">
                                                {mapData.schools.length}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={focusProvince}
                                        className="mt-3 h-10 w-full rounded-xl bg-[#0AC4E0] text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-cyan-500"
                                    >
                                        Fokuskan Provinsi
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {focused &&
                        filteredDistricts.map((district) => (
                            <Marker
                                key={district.key}
                                position={district.coordinate}
                                icon={makeKadinDistrictIcon(
                                    district.schools.length,
                                    selectedDistrict === district.key,
                                )}
                            >
                                <Popup>
                                    <KadinDistrictPopup district={district} />
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>

                <div className="pointer-events-none absolute bottom-5 left-5 z-[500] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Tampilan Aktif
                    </p>
                    <p className="mt-1 text-[12px] font-black text-slate-800">
                        {focused
                            ? `${mapData.name} · ${filteredDistricts.length} kabupaten`
                            : `${mapData.name} · marker provinsi`}
                    </p>
                </div>
            </div>
        </section>
    );
}

function KadinAnalyticsEmpty({ title, description }) {
    return (
        <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <BarChart3 size={24} />
            </div>
            <h3 className="mt-4 text-sm font-black text-slate-700">{title}</h3>
            <p className="mt-2 max-w-sm text-[11px] font-semibold leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

function KadinPillarBadge({ pillarKey }) {
    const meta = KADIN_PILLAR_META[pillarKey] || KADIN_PILLAR_META.AKADEMIK;

    return (
        <span
            className="inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide"
            style={{
                color: meta.color,
                backgroundColor: meta.soft,
                borderColor: `${meta.color}35`,
            }}
        >
            {meta.label}
        </span>
    );
}

function KadinAnalyticsTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
            {label && (
                <p className="mb-2 max-w-[260px] text-[11px] font-black text-slate-800">
                    {label}
                </p>
            )}

            <div className="space-y-1.5">
                {payload
                    .filter((item) => Number(item?.value || 0) > 0)
                    .map((item) => (
                        <div
                            key={item.dataKey || item.name}
                            className="flex items-center justify-between gap-6 text-[10px] font-bold"
                        >
                            <span className="flex items-center gap-2 text-slate-500">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color || item.fill }}
                                />
                                {item.name}
                            </span>
                            <span className="font-black text-slate-800">
                                {item.value}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}

function KadinCoverageChart({ rows, visiblePillars, chartType }) {
    if (!rows.length) {
        return (
            <KadinAnalyticsEmpty
                title="Data diagram belum tersedia"
                description="Ubah filter atau pastikan data memiliki relasi sekolah dan pilar."
            />
        );
    }

    const pieRows = visiblePillars
        .map((pillarKey) => {
            const meta = KADIN_PILLAR_META[pillarKey];

            return {
                key: pillarKey,
                name: meta.label,
                value: rows.reduce(
                    (total, row) => total + Number(row?.[meta.chartKey] || 0),
                    0,
                ),
                color: meta.color,
            };
        })
        .filter((item) => item.value > 0);

    if (chartType === "PIE") {
        const total = pieRows.reduce((sum, item) => sum + item.value, 0);

        if (!pieRows.length) {
            return (
                <KadinAnalyticsEmpty
                    title="Komposisi pilar belum tersedia"
                    description="Pilar belum tersimpan pada data yang sesuai filter."
                />
            );
        }

        return (
            <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-3">
                    {pieRows.map((item) => (
                        <span
                            key={item.key}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name} ({item.value})
                        </span>
                    ))}
                </div>

                <div className="relative h-[390px] min-h-[340px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieRows}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={78}
                                outerRadius={128}
                                paddingAngle={4}
                                stroke="#FFFFFF"
                                strokeWidth={4}
                            >
                                {pieRows.map((item) => (
                                    <Cell key={item.key} fill={item.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<KadinAnalyticsTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                        <span className="text-4xl font-black leading-none text-slate-800">
                            {total}
                        </span>
                        <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Total Data
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const chartHeight = Math.max(360, rows.length * 58);

    return (
        <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-3">
                {visiblePillars.map((pillarKey) => {
                    const meta = KADIN_PILLAR_META[pillarKey];

                    return (
                        <span
                            key={pillarKey}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                            />
                            {meta.label}
                        </span>
                    );
                })}
            </div>

            <div className="max-h-[430px] min-w-0 overflow-y-auto pr-2">
                <div style={{ height: chartHeight, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={rows}
                            layout="vertical"
                            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#E2E8F0"
                            />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 800 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={125}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#64748B", fontWeight: 800 }}
                            />
                            <Tooltip content={<KadinAnalyticsTooltip />} />

                            {visiblePillars.map((pillarKey) => {
                                const meta = KADIN_PILLAR_META[pillarKey];

                                return (
                                    <Bar
                                        key={pillarKey}
                                        dataKey={meta.chartKey}
                                        name={meta.label}
                                        stackId="total"
                                        fill={meta.color}
                                        barSize={24}
                                        radius={
                                            pillarKey === visiblePillars[visiblePillars.length - 1]
                                                ? [0, 8, 8, 0]
                                                : 0
                                        }
                                    />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function KadinAnalyticsSection({
    type,
    items,
    schools,
    provinceName,
}) {
    const [search, setSearch] = useState("");
    const [pillarFilter, setPillarFilter] = useState("ALL");
    const [districtFilter, setDistrictFilter] = useState("ALL");
    const [groupBy, setGroupBy] = useState("SEKOLAH");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [progressFilter, setProgressFilter] = useState("ALL");
    const [chartType, setChartType] = useState("BAR");
    const [page, setPage] = useState(1);

    const districtOptions = useMemo(
        () =>
            [...new Set(schools.map(getSchoolWilayahName).filter(Boolean))].sort(
                (a, b) => a.localeCompare(b),
            ),
        [schools],
    );

    const enrichedRows = useMemo(
        () =>
            items.map((item) => ({
                item,
                targets: resolveKadinTargets(item, schools),
                pillarKey: getKadinPillarKey(item),
                status: getKadinItemStatus(item, type),
                progress: getKadinProgressBucket(item, type),
            })),
        [items, schools, type],
    );

    const filteredRows = useMemo(() => {
        const keyword = cleanText(search);

        return enrichedRows.filter((row) => {
            if (pillarFilter !== "ALL" && row.pillarKey !== pillarFilter) {
                return false;
            }

            if (
                districtFilter !== "ALL" &&
                !row.targets.some(
                    (school) => getSchoolWilayahName(school) === districtFilter,
                )
            ) {
                return false;
            }

            if (
                type === "PROGRAM" &&
                typeFilter !== "ALL" &&
                getKadinProgramType(row.item) !== typeFilter
            ) {
                return false;
            }

            if (progressFilter !== "ALL" && row.progress !== progressFilter) {
                return false;
            }

            if (!keyword) return true;

            const targetText = row.targets
                .map(
                    (school) =>
                        `${getSchoolName(school)} ${school?.npsn || ""} ${getSchoolWilayahName(
                            school,
                        )}`,
                )
                .join(" ");

            return cleanText(
                `${getKadinItemTitle(row.item, type)} ${getKadinItemCode(
                    row.item,
                    type,
                )} ${row.status} ${targetText} ${flattenKadinSearchValue(row.item)}`,
            ).includes(keyword);
        });
    }, [
        districtFilter,
        enrichedRows,
        pillarFilter,
        progressFilter,
        search,
        type,
        typeFilter,
    ]);

    const chartRows = useMemo(() => {
        const map = new Map();

        filteredRows.forEach((row) => {
            const targetGroups =
                groupBy === "KABUPATEN"
                    ? [...new Set(row.targets.map(getSchoolWilayahName))]
                    : row.targets.map(getSchoolName);

            targetGroups.filter(Boolean).forEach((name) => {
                if (!map.has(name)) {
                    map.set(name, {
                        name,
                        akademik: 0,
                        karakter: 0,
                        seniBudaya: 0,
                        kecakapanHidup: 0,
                    });
                }

                const target = map.get(name);
                const meta = KADIN_PILLAR_META[row.pillarKey];
                target[meta.chartKey] += 1;
            });
        });

        return [...map.values()]
            .map((row) => ({
                ...row,
                total:
                    row.akademik +
                    row.karakter +
                    row.seniBudaya +
                    row.kecakapanHidup,
            }))
            .filter((row) => row.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [filteredRows, groupBy]);

    const visiblePillars =
        pillarFilter === "ALL"
            ? Object.keys(KADIN_PILLAR_META)
            : [pillarFilter];

    useEffect(() => {
        setPage(1);
    }, [
        search,
        pillarFilter,
        districtFilter,
        groupBy,
        typeFilter,
        progressFilter,
    ]);

    const totalPages = Math.max(
        Math.ceil(filteredRows.length / KADIN_ROWS_PER_PAGE),
        1,
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const startIndex = (page - 1) * KADIN_ROWS_PER_PAGE;
    const currentRows = filteredRows.slice(
        startIndex,
        startIndex + KADIN_ROWS_PER_PAGE,
    );
    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const first = Math.max(1, Math.min(page - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => first + index);
    }, [page, totalPages]);

    const title = type === "PROGRAM" ? "Analitik Program Wilayah" : "Analitik Assessment Wilayah";
    const subtitle =
        type === "PROGRAM"
            ? `Program pada sekolah binaan di ${provinceName}.`
            : `Assessment yang menargetkan sekolah binaan di ${provinceName}.`;

    return (
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                    {type === "PROGRAM" ? <FolderKanban size={14} /> : <ClipboardList size={14} />}
                    {type === "PROGRAM" ? "Program Regional" : "Assessment Regional"}
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{title}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">{subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="relative min-w-[230px] flex-1">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={`Cari ${type === "PROGRAM" ? "program" : "assessment"}, sekolah, atau kabupaten...`}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:border-cyan-400"
                    />
                </div>

                <select
                    value={pillarFilter}
                    onChange={(event) => setPillarFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Pilar</option>
                    {Object.entries(KADIN_PILLAR_META).map(([key, meta]) => (
                        <option key={key} value={key}>
                            {meta.label}
                        </option>
                    ))}
                </select>

                <select
                    value={districtFilter}
                    onChange={(event) => setDistrictFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Kabupaten</option>
                    {districtOptions.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>

                <select
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="SEKOLAH">Per Sekolah</option>
                    <option value="KABUPATEN">Per Kabupaten</option>
                </select>

                {type === "PROGRAM" && (
                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                    >
                        <option value="ALL">Semua Jenis</option>
                        <option value="REGULER">Reguler</option>
                        <option value="PROJECT">Project</option>
                    </select>
                )}

                <select
                    value={progressFilter}
                    onChange={(event) => setProgressFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="PROSES">Dalam Proses</option>
                    <option value="SELESAI">Selesai</option>
                </select>
            </div>

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="min-w-0 border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Diagram {groupBy === "SEKOLAH" ? "Per Sekolah" : "Per Kabupaten"}
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-slate-600">
                                {chartRows.length} kelompok dari {filteredRows.length} data terfilter
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                            <button
                                type="button"
                                onClick={() => setChartType("BAR")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "BAR"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <BarChart3 size={14} /> Batang
                            </button>

                            <button
                                type="button"
                                onClick={() => setChartType("PIE")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "PIE"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <Layers size={14} /> Pie
                            </button>
                        </div>
                    </div>

                    <KadinCoverageChart
                        rows={chartRows}
                        visiblePillars={visiblePillars}
                        chartType={chartType}
                    />
                </div>

                <div className="flex min-w-0 flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Menampilkan {filteredRows.length === 0 ? 0 : startIndex + 1}-
                            {Math.min(startIndex + currentRows.length, filteredRows.length)} dari {filteredRows.length}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">
                            Halaman {page}/{totalPages}
                        </p>
                    </div>

                    {currentRows.length === 0 ? (
                        <KadinAnalyticsEmpty
                            title={`${type === "PROGRAM" ? "Program" : "Assessment"} tidak ditemukan`}
                            description="Ubah filter atau kata kunci pencarian."
                        />
                    ) : (
                        <div className="flex-1 divide-y divide-slate-100">
                            {currentRows.map((row, index) => {
                                const item = row.item;
                                const meta = KADIN_PILLAR_META[row.pillarKey];
                                const firstTarget = row.targets[0];
                                const id =
                                    type === "PROGRAM"
                                        ? getProgramId(item)
                                        : getAssessmentId(item);

                                return (
                                    <div
                                        key={`${type}-${id || startIndex + index}`}
                                        className="relative flex items-center justify-between gap-4 overflow-hidden px-4 py-4"
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 w-1"
                                            style={{ backgroundColor: meta.color }}
                                        />

                                        <div className="min-w-0 flex-1 pl-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="max-w-[350px] truncate text-[12px] font-black text-slate-800">
                                                    {getKadinItemTitle(item, type)}
                                                </p>
                                                <KadinPillarBadge pillarKey={row.pillarKey} />
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                                {getKadinItemCode(item, type)} ·{" "}
                                                {formatDate(getKadinItemDate(item, type))}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="max-w-[270px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                    {firstTarget
                                                        ? getSchoolName(firstTarget)
                                                        : "Sekolah belum terbaca"}
                                                </span>

                                                {row.targets.length > 1 && (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                                        +{row.targets.length - 1} sekolah
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-[10px] font-semibold text-slate-400">
                                                {type === "PROGRAM"
                                                    ? `${getKadinProgramType(item) === "PROJECT" ? "Project" : getKadinProgramType(item) === "REGULER" ? "Reguler" : "Lainnya"} · Tahun ${getProgramYear(item)}`
                                                    : `Tenggat ${formatDate(item?.tenggat || item?.deadline)} · ${row.targets.length} sekolah`}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.progress === "SELESAI"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {row.progress === "SELESAI"
                                                    ? "Selesai"
                                                    : "Dalam Proses"}
                                            </span>

                                            <span className="max-w-[130px] truncate text-[9px] font-bold uppercase tracking-wide text-slate-300">
                                                {row.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Maksimal {KADIN_ROWS_PER_PAGE} data per halaman
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 disabled:opacity-40"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {pageNumbers.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    className={`h-9 min-w-9 rounded-xl border px-2 text-[10px] font-black ${page === pageNumber
                                            ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
                                            : "border-slate-200 bg-white text-slate-500"
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() =>
                                    setPage((current) => Math.min(current + 1, totalPages))
                                }
                                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 disabled:opacity-40"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function normalizeKadinJenjang(value) {
    const raw = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll(" ", "");

    if (raw.includes("SMK") || raw.includes("SMA/K")) return "SMK";
    if (raw.includes("SMP")) return "SMP";
    if (raw.includes("SD")) return "SD";
    return "LAINNYA";
}

function getPaginationNumbers(page, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const first = Math.max(1, Math.min(page - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => first + index);
}

function DashboardPagination({ page, totalPages, onChange }) {
    const numbers = useMemo(
        () => getPaginationNumbers(page, totalPages),
        [page, totalPages],
    );

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChange(Math.max(1, page - 1))}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 transition hover:border-cyan-200 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-35"
            >
                <ChevronLeft size={14} /> Prev
            </button>

            {numbers.map((number) => (
                <button
                    key={number}
                    type="button"
                    onClick={() => onChange(number)}
                    className={`h-9 min-w-9 rounded-xl px-2 text-[10px] font-black transition ${number === page
                            ? "bg-[#0AC4E0] text-white shadow-lg shadow-cyan-500/20"
                            : "border border-slate-200 bg-white text-slate-400 hover:border-cyan-200 hover:text-cyan-600"
                        }`}
                >
                    {number}
                </button>
            ))}

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 transition hover:border-cyan-200 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-35"
            >
                Next <ChevronRight size={14} />
            </button>
        </div>
    );
}

function DashboardSectionHeader({ eyebrow, title, description, icon }) {
    return (
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                        {icon}
                        <span>{eyebrow}</span>
                    </div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">
                        {title}
                    </h2>
                    <p className="mt-1 max-w-3xl text-xs font-semibold leading-6 text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SchoolCoverageChart({ rows, jenjangFilter, chartType }) {
    if (rows.length === 0) {
        return (
            <KadinAnalyticsEmpty
                title="Data diagram sekolah belum tersedia"
                description="Ubah filter atau pastikan sekolah sudah memiliki relasi kabupaten di provinsi Kepala Dinas."
            />
        );
    }

    const series =
        jenjangFilter === "ALL"
            ? [
                { key: "sd", label: "SD", color: COLORS.cyan },
                { key: "smp", label: "SMP", color: COLORS.blue },
                { key: "smk", label: "SMK", color: COLORS.violet },
            ]
            : [
                {
                    key: jenjangFilter.toLowerCase(),
                    label: jenjangFilter,
                    color:
                        jenjangFilter === "SD"
                            ? COLORS.cyan
                            : jenjangFilter === "SMP"
                                ? COLORS.blue
                                : COLORS.violet,
                },
            ];

    if (chartType === "PIE") {
        const pieData = series
            .map((item) => ({
                name: item.label,
                value: rows.reduce((total, row) => total + Number(row[item.key] || 0), 0),
                color: item.color,
            }))
            .filter((item) => item.value > 0);

        if (pieData.length === 0) {
            return (
                <KadinAnalyticsEmpty
                    title="Data diagram sekolah belum tersedia"
                    description="Tidak ada sekolah pada jenjang yang dipilih."
                />
            );
        }

        return (
            <div className="h-[330px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="48%"
                            innerRadius={58}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {pieData.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                <div className="-mt-5 flex flex-wrap justify-center gap-3">
                    {pieData.map((item) => (
                        <span
                            key={item.name}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name}: {item.value}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[360px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={rows}
                    margin={{ top: 12, right: 18, left: -18, bottom: 78 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={95}
                        tick={{ fontSize: 9, fontWeight: 700, fill: "#64748B" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: "#94A3B8" }} />
                    <Tooltip />
                    {series.map((item) => (
                        <Bar
                            key={item.key}
                            dataKey={item.key}
                            name={item.label}
                            fill={item.color}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={34}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function KadinSchoolAnalyticsSection({ schools, programsBySchool, provinceName }) {
    const [search, setSearch] = useState("");
    const [jenjangFilter, setJenjangFilter] = useState("ALL");
    const [districtFilter, setDistrictFilter] = useState("ALL");
    const [chartType, setChartType] = useState("BAR");
    const [page, setPage] = useState(1);

    const districtOptions = useMemo(
        () =>
            [...new Set(schools.map(getSchoolWilayahName).filter(Boolean))].sort(
                (a, b) => a.localeCompare(b),
            ),
        [schools],
    );

    const filteredSchools = useMemo(() => {
        const keyword = cleanText(search);

        return schools.filter((school) => {
            const jenjang = normalizeKadinJenjang(getSchoolJenjang(school));
            const district = getSchoolWilayahName(school);

            if (jenjangFilter !== "ALL" && jenjang !== jenjangFilter) return false;
            if (districtFilter !== "ALL" && district !== districtFilter) return false;

            if (!keyword) return true;

            return cleanText(
                `${getSchoolName(school)} ${school?.npsn || ""} ${getSchoolJenjang(
                    school,
                )} ${district} ${getSchoolAddress(school)} ${getSchoolProvinceName(
                    school,
                )}`,
            ).includes(keyword);
        });
    }, [districtFilter, jenjangFilter, schools, search]);

    const chartRows = useMemo(() => {
        const grouped = new Map();

        filteredSchools.forEach((school) => {
            const district = getSchoolWilayahName(school) || "Kabupaten Belum Terbaca";
            const jenjang = normalizeKadinJenjang(getSchoolJenjang(school));

            if (!grouped.has(district)) {
                grouped.set(district, {
                    name: district,
                    sd: 0,
                    smp: 0,
                    smk: 0,
                    total: 0,
                });
            }

            const target = grouped.get(district);
            if (["SD", "SMP", "SMK"].includes(jenjang)) {
                target[jenjang.toLowerCase()] += 1;
            }
            target.total += 1;
        });

        return [...grouped.values()].sort((a, b) => b.total - a.total);
    }, [filteredSchools]);

    useEffect(() => {
        setPage(1);
    }, [search, jenjangFilter, districtFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSchools.length / KADIN_ROWS_PER_PAGE),
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const startIndex = (page - 1) * KADIN_ROWS_PER_PAGE;
    const currentRows = filteredSchools.slice(
        startIndex,
        startIndex + KADIN_ROWS_PER_PAGE,
    );

    return (
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <DashboardSectionHeader
                eyebrow="Data Sekolah Regional"
                title="Diagram dan Daftar Sekolah"
                description={`Hanya menampilkan sekolah SD, SMP, dan SMK yang berada di provinsi ${provinceName}. Diagram dikelompokkan per kabupaten/kota.`}
                icon={<School size={14} />}
            />

            <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-white px-5 py-4">
                <div className="relative min-w-[240px] flex-1">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari sekolah, NPSN, kabupaten, atau alamat..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:border-cyan-400"
                    />
                </div>

                <select
                    value={jenjangFilter}
                    onChange={(event) => setJenjangFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Jenjang</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMK">SMK</option>
                </select>

                <select
                    value={districtFilter}
                    onChange={(event) => setDistrictFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Kabupaten</option>
                    {districtOptions.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex min-w-0 flex-col border-b border-slate-100 xl:border-b-0 xl:border-r">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Menampilkan {filteredSchools.length === 0 ? 0 : startIndex + 1}-
                            {Math.min(startIndex + currentRows.length, filteredSchools.length)} dari {filteredSchools.length}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">
                            Halaman {page}/{totalPages}
                        </p>
                    </div>

                    {currentRows.length === 0 ? (
                        <KadinAnalyticsEmpty
                            title="Sekolah tidak ditemukan"
                            description="Ubah filter atau kata kunci pencarian."
                        />
                    ) : (
                        <div className="flex-1 divide-y divide-slate-100">
                            {currentRows.map((school) => {
                                const schoolPrograms =
                                    programsBySchool.get(String(getSchoolId(school))) || [];

                                return (
                                    <article
                                        key={getSchoolId(school) || getSchoolName(school)}
                                        className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                            <School size={19} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="max-w-[330px] truncate text-[12px] font-black text-slate-800">
                                                    {getSchoolName(school)}
                                                </h3>
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-600">
                                                    {normalizeKadinJenjang(getSchoolJenjang(school))}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                                NPSN {school?.npsn || "Belum tersedia"}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="max-w-[260px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                    {getSchoolWilayahName(school)}
                                                </span>
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-600">
                                                    {schoolPrograms.length} program
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Maksimal {KADIN_ROWS_PER_PAGE} sekolah per halaman
                        </p>
                        <DashboardPagination
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}
                        />
                    </div>
                </div>

                <div className="min-w-0 p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Diagram Per Kabupaten/Kota
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-slate-600">
                                {chartRows.length} kabupaten dari {filteredSchools.length} sekolah terfilter
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                            <button
                                type="button"
                                onClick={() => setChartType("BAR")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "BAR"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <BarChart3 size={14} /> Batang
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartType("PIE")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "PIE"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <Layers size={14} /> Pie
                            </button>
                        </div>
                    </div>

                    <SchoolCoverageChart
                        rows={chartRows}
                        jenjangFilter={jenjangFilter}
                        chartType={chartType}
                    />
                </div>
            </div>
        </section>
    );
}

function KadinProgramOnlySection({ programs, schools, provinceName }) {
    const [search, setSearch] = useState("");
    const [jenjangFilter, setJenjangFilter] = useState("ALL");
    const [pillarFilter, setPillarFilter] = useState("ALL");
    const [districtFilter, setDistrictFilter] = useState("ALL");
    const [groupBy, setGroupBy] = useState("SEKOLAH");
    const [progressFilter, setProgressFilter] = useState("ALL");
    const [chartType, setChartType] = useState("BAR");
    const [page, setPage] = useState(1);

    const districtOptions = useMemo(
        () =>
            [...new Set(schools.map(getSchoolWilayahName).filter(Boolean))].sort(
                (a, b) => a.localeCompare(b),
            ),
        [schools],
    );

    const enrichedRows = useMemo(
        () =>
            programs
                .map((item) => ({
                    item,
                    targets: resolveKadinTargets(item, schools),
                    pillarKey: getKadinPillarKey(item),
                    status: getKadinItemStatus(item, "PROGRAM"),
                    progress: getKadinProgressBucket(item, "PROGRAM"),
                }))
                .filter((row) => row.targets.length > 0),
        [programs, schools],
    );

    const filteredRows = useMemo(() => {
        const keyword = cleanText(search);

        return enrichedRows
            .map((row) => {
                const visibleTargets = row.targets.filter((school) => {
                    const jenjang = normalizeKadinJenjang(getSchoolJenjang(school));
                    const district = getSchoolWilayahName(school);

                    if (jenjangFilter !== "ALL" && jenjang !== jenjangFilter) {
                        return false;
                    }
                    if (districtFilter !== "ALL" && district !== districtFilter) {
                        return false;
                    }
                    return true;
                });

                return { ...row, visibleTargets };
            })
            .filter((row) => {
                if (row.visibleTargets.length === 0) return false;
                if (pillarFilter !== "ALL" && row.pillarKey !== pillarFilter) {
                    return false;
                }
                if (progressFilter !== "ALL" && row.progress !== progressFilter) {
                    return false;
                }

                if (!keyword) return true;

                const targetText = row.visibleTargets
                    .map(
                        (school) =>
                            `${getSchoolName(school)} ${school?.npsn || ""} ${getSchoolWilayahName(
                                school,
                            )} ${getSchoolJenjang(school)}`,
                    )
                    .join(" ");

                return cleanText(
                    `${getProgramName(row.item)} ${getKadinItemCode(
                        row.item,
                        "PROGRAM",
                    )} ${row.status} ${targetText} ${flattenKadinSearchValue(row.item)}`,
                ).includes(keyword);
            });
    }, [
        districtFilter,
        enrichedRows,
        jenjangFilter,
        pillarFilter,
        progressFilter,
        search,
    ]);

    const chartRows = useMemo(() => {
        const grouped = new Map();

        filteredRows.forEach((row) => {
            const targetGroups =
                groupBy === "KABUPATEN"
                    ? [...new Set(row.visibleTargets.map(getSchoolWilayahName))]
                    : row.visibleTargets.map(getSchoolName);

            targetGroups.filter(Boolean).forEach((name) => {
                if (!grouped.has(name)) {
                    grouped.set(name, {
                        name,
                        akademik: 0,
                        karakter: 0,
                        seniBudaya: 0,
                        kecakapanHidup: 0,
                    });
                }

                const target = grouped.get(name);
                const meta = KADIN_PILLAR_META[row.pillarKey];
                target[meta.chartKey] += 1;
            });
        });

        return [...grouped.values()]
            .map((row) => ({
                ...row,
                total:
                    row.akademik +
                    row.karakter +
                    row.seniBudaya +
                    row.kecakapanHidup,
            }))
            .filter((row) => row.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [filteredRows, groupBy]);

    const visiblePillars =
        pillarFilter === "ALL"
            ? Object.keys(KADIN_PILLAR_META)
            : [pillarFilter];

    useEffect(() => {
        setPage(1);
    }, [
        search,
        jenjangFilter,
        pillarFilter,
        districtFilter,
        groupBy,
        progressFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRows.length / KADIN_ROWS_PER_PAGE),
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const startIndex = (page - 1) * KADIN_ROWS_PER_PAGE;
    const currentRows = filteredRows.slice(
        startIndex,
        startIndex + KADIN_ROWS_PER_PAGE,
    );

    return (
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <DashboardSectionHeader
                eyebrow="Program Regional"
                title="Diagram dan Daftar Program"
                description={`Program yang tampil wajib terhubung ke sekolah di provinsi ${provinceName}. Filter tersedia berdasarkan jenjang, kabupaten, status proses, dan empat pilar pembinaan.`}
                icon={<FolderKanban size={14} />}
            />

            <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-white px-5 py-4">
                <div className="relative min-w-[240px] flex-1">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari program, kode, sekolah, atau kabupaten..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:border-cyan-400"
                    />
                </div>

                <select
                    value={jenjangFilter}
                    onChange={(event) => setJenjangFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Jenjang</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMK">SMK</option>
                </select>

                <select
                    value={pillarFilter}
                    onChange={(event) => setPillarFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Pilar</option>
                    {Object.entries(KADIN_PILLAR_META).map(([key, meta]) => (
                        <option key={key} value={key}>
                            {meta.label}
                        </option>
                    ))}
                </select>

                <select
                    value={districtFilter}
                    onChange={(event) => setDistrictFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Kabupaten</option>
                    {districtOptions.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>

                <select
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="SEKOLAH">Kelompok Per Sekolah</option>
                    <option value="KABUPATEN">Kelompok Per Kabupaten</option>
                </select>

                <select
                    value={progressFilter}
                    onChange={(event) => setProgressFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 outline-none focus:border-cyan-400"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="PROSES">Sedang Berjalan</option>
                    <option value="SELESAI">Selesai</option>
                </select>
            </div>

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="flex min-w-0 flex-col border-b border-slate-100 xl:border-b-0 xl:border-r">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Menampilkan {filteredRows.length === 0 ? 0 : startIndex + 1}-
                            {Math.min(startIndex + currentRows.length, filteredRows.length)} dari {filteredRows.length}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">
                            Halaman {page}/{totalPages}
                        </p>
                    </div>

                    {currentRows.length === 0 ? (
                        <KadinAnalyticsEmpty
                            title="Program tidak ditemukan"
                            description="Ubah filter atau kata kunci pencarian."
                        />
                    ) : (
                        <div className="flex-1 divide-y divide-slate-100">
                            {currentRows.map((row, index) => {
                                const item = row.item;
                                const firstTarget = row.visibleTargets[0];

                                return (
                                    <article
                                        key={getProgramId(item) || `${getProgramName(item)}-${index}`}
                                        className="relative flex items-center justify-between gap-4 overflow-hidden px-5 py-4 transition hover:bg-slate-50"
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 w-1"
                                            style={{
                                                backgroundColor:
                                                    KADIN_PILLAR_META[row.pillarKey].color,
                                            }}
                                        />

                                        <div className="min-w-0 flex-1 pl-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="max-w-[350px] truncate text-[12px] font-black text-slate-800">
                                                    {getProgramName(item)}
                                                </h3>
                                                <KadinPillarBadge pillarKey={row.pillarKey} />
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                                {getKadinItemCode(item, "PROGRAM")} · Tahun {getProgramYear(item)}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="max-w-[260px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                    {firstTarget
                                                        ? getSchoolName(firstTarget)
                                                        : "Sekolah belum terbaca"}
                                                </span>
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-600">
                                                    {firstTarget
                                                        ? normalizeKadinJenjang(
                                                            getSchoolJenjang(firstTarget),
                                                        )
                                                        : "-"}
                                                </span>
                                                {row.visibleTargets.length > 1 && (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                                        +{row.visibleTargets.length - 1} sekolah
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-[10px] font-semibold text-slate-400">
                                                {firstTarget
                                                    ? getSchoolWilayahName(firstTarget)
                                                    : "Kabupaten belum terbaca"}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.progress === "SELESAI"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {row.progress === "SELESAI"
                                                    ? "Selesai"
                                                    : "Sedang Berjalan"}
                                            </span>
                                            <span className="max-w-[130px] truncate text-[9px] font-bold uppercase tracking-wide text-slate-300">
                                                {row.status}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Maksimal {KADIN_ROWS_PER_PAGE} program per halaman
                        </p>
                        <DashboardPagination
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}
                        />
                    </div>
                </div>

                <div className="min-w-0 p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Diagram {groupBy === "SEKOLAH" ? "Per Sekolah" : "Per Kabupaten"}
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-slate-600">
                                {chartRows.length} kelompok dari {filteredRows.length} program terfilter
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                            <button
                                type="button"
                                onClick={() => setChartType("BAR")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "BAR"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <BarChart3 size={14} /> Batang
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartType("PIE")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "PIE"
                                        ? "bg-[#0AC4E0] text-white"
                                        : "text-slate-400 hover:bg-slate-50"
                                    }`}
                            >
                                <Layers size={14} /> Pie
                            </button>
                        </div>
                    </div>

                    <KadinCoverageChart
                        rows={chartRows}
                        visiblePillars={visiblePillars}
                        chartType={chartType}
                    />
                </div>
            </div>
        </section>
    );
}

export default function DashboardKepalaDinas() {
    const [currentUser, setCurrentUser] = useState(null);
    const [wilayah, setWilayah] = useState(null);
    const [wilayahList, setWilayahList] = useState([]);
    const [schools, setSchools] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState("");

    const fetchProgramDetail = async (program, headers) => {
        const id = getProgramId(program);
        if (!id) return program;

        try {
            const response = await fetch(`${API_BASE_URL}/program/${id}`, { headers });
            const payload = await safeJson(response);
            if (!response.ok) return program;

            const detail = payload?.data || payload?.result || payload || {};
            return {
                ...program,
                ...(detail && typeof detail === "object" ? detail : {}),
            };
        } catch {
            return program;
        }
    };

    const fetchSchoolDetail = async (school, headers) => {
        const id = getSchoolId(school);
        if (!id) return school;

        try {
            const response = await fetch(`${API_BASE_URL}/sekolah/${id}`, { headers });
            const payload = await safeJson(response);
            if (!response.ok) return school;

            const detail = payload?.data || payload?.result || payload || {};
            return {
                ...school,
                ...(detail && typeof detail === "object" ? detail : {}),
            };
        } catch {
            return school;
        }
    };

    const fetchDashboard = async () => {
        setRefreshing(true);
        setLoadError("");

        try {
            const token = localStorage.getItem("token");
            const tokenPayload = getTokenPayload() || {};
            const currentUserId = getCurrentUserIdFromToken();

            if (!token || !currentUserId) {
                throw new Error("Token atau ID user tidak ditemukan. Silakan login ulang.");
            }

            const headers = { Authorization: `Bearer ${token}` };

            const [
                userPayload,
                usersPayload,
                wilayahTreePayload,
                wilayahFlatPayload,
                wilayahProvinsiPayload,
                sekolahPayload,
                programPayload,
            ] = await Promise.all([
                fetchSafe(
                    [`/users/${currentUserId}`, "/users/me", "/auth/profile"],
                    headers,
                ),
                fetchSafe(["/users"], headers),
                fetchSafe(["/wilayah/tree"], headers),
                fetchSafe(["/wilayah"], headers),
                fetchSafe(["/wilayah/provinsi", "/wilayah/reference/provinsi"], headers),
                fetchSafe(["/sekolah"], headers),
                fetchSafe(["/program"], headers),
            ]);

            const userDetail = Array.isArray(userPayload)
                ? {}
                : unwrapPayload(userPayload) || {};

            const userFromList =
                normalizeArray(usersPayload).find(
                    (item) =>
                        String(
                            item?.id_user ||
                            item?.id ||
                            item?.user_id ||
                            "",
                        ) === String(currentUserId),
                ) || {};

            const storedUser = getStoredUserProfile();

            const user = mergeUserSources(
                storedUser,
                tokenPayload,
                userFromList,
                userDetail,
            );

            const wilayahList = mergeRecordsByIdentity(
                mergeRecordsByIdentity(
                    flattenWilayahTree(wilayahTreePayload),
                    flattenWilayahTree(wilayahFlatPayload),
                    getWilayahId,
                ),
                flattenWilayahTree(wilayahProvinsiPayload),
                getWilayahId,
            );

            const currentWilayah = resolveKepalaDinasWilayah(
                user,
                wilayahList,
                tokenPayload,
            );

            if (!currentWilayah) {
                console.error("KADIN WILAYAH RESOLUTION FAILED:", {
                    currentUserId,
                    tokenPayload,
                    storedUser,
                    userFromList,
                    userDetail,
                    mergedUser: user,
                    wilayahCount: wilayahList.length,
                });

                throw new Error(
                    `Provinsi akun Kepala Dinas belum terbaca untuk user ID ${currentUserId}. Edit akun pada Master Kepala Dinas, pilih provinsi, simpan, lalu login ulang.`,
                );
            }

            const masterSchools = normalizeArray(sekolahPayload)
                .filter((school) => getSchoolId(school))
                .map((school) => enrichSchoolWilayah(school, wilayahList));

            const scopedSchoolSummaries = masterSchools.filter((school) =>
                schoolBelongsToWilayah(school, currentWilayah),
            );

            const detailedSchools = await mapWithConcurrency(
                scopedSchoolSummaries,
                6,
                (school) => fetchSchoolDetail(school, headers),
            );

            const visibleSchools = detailedSchools
                .map((school) => enrichSchoolWilayah(school, wilayahList))
                .filter(
                    (school) =>
                        getSchoolId(school) &&
                        schoolBelongsToWilayah(school, currentWilayah),
                )
                .sort((a, b) => getSchoolName(a).localeCompare(getSchoolName(b)));

            const visibleSchoolIdSet = new Set(
                visibleSchools
                    .map((school) => getSchoolId(school))
                    .filter(Boolean)
                    .map(String),
            );

            const programGroupsBySchool = await mapWithConcurrency(
                visibleSchools,
                5,
                async (school) => {
                    const schoolId = getSchoolId(school);
                    if (!schoolId) return [];

                    const payload = await fetchSafe(
                        [
                            `/program/sekolah/${schoolId}?id_user=${currentUserId}`,
                            `/program/sekolah/${schoolId}`,
                        ],
                        headers,
                    );

                    return normalizeArray(payload).map((program) => ({
                        ...program,
                        __school_ids: [
                            ...new Set(
                                [
                                    ...collectSchoolIdsFromProgram(program),
                                    String(schoolId),
                                ]
                                    .map(String)
                                    .filter(Boolean),
                            ),
                        ],
                    }));
                },
            );

            const programsFromSchools = programGroupsBySchool.flat();
            const masterPrograms = normalizeArray(programPayload);
            const combinedPrograms = mergeRecordsByIdentity(
                masterPrograms,
                programsFromSchools,
                getProgramId,
            )
                .filter((program) => getProgramId(program))
                .sort((a, b) => getProgramTime(b) - getProgramTime(a));

            const detailedPrograms = await mapWithConcurrency(
                combinedPrograms,
                6,
                (program) => fetchProgramDetail(program, headers),
            );

            const visiblePrograms = detailedPrograms
                .map((program) => enrichProgramSchoolLinks(program, visibleSchools))
                .filter((program) => {
                    const linkedSchoolIds = collectSchoolIdsFromProgram(program);
                    return linkedSchoolIds.some((schoolId) =>
                        visibleSchoolIdSet.has(String(schoolId)),
                    );
                })
                .sort((a, b) => getProgramTime(b) - getProgramTime(a));

            setCurrentUser(user);
            setWilayah(currentWilayah);
            setWilayahList(wilayahList);
            setSchools(visibleSchools);
            setPrograms(visiblePrograms);
        } catch (error) {
            console.error("Dashboard Kepala Dinas Error:", error);
            setLoadError(error?.message || "Gagal memuat Dashboard Kepala Dinas.");
            setCurrentUser(null);
            setWilayah(null);
            setWilayahList([]);
            setSchools([]);
            setPrograms([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const programsBySchool = useMemo(() => {
        const map = new Map();

        schools.forEach((school) => {
            const schoolId = getSchoolId(school);
            if (schoolId) map.set(String(schoolId), []);
        });

        programs.forEach((program) => {
            collectSchoolIdsFromProgram(program).forEach((schoolId) => {
                const key = String(schoolId);
                if (map.has(key)) map.get(key).push(program);
            });
        });

        map.forEach((value, key) => {
            map.set(
                key,
                [...value].sort((a, b) => getProgramTime(b) - getProgramTime(a)),
            );
        });

        return map;
    }, [schools, programs]);

    const runningPrograms = useMemo(
        () =>
            programs.filter(
                (program) => getKadinProgressBucket(program, "PROGRAM") === "PROSES",
            ).length,
        [programs],
    );

    const completedPrograms = useMemo(
        () =>
            programs.filter(
                (program) => getKadinProgressBucket(program, "PROGRAM") === "SELESAI",
            ).length,
        [programs],
    );

    if (loading) {
        return (
            <PageWrapper className="flex h-screen w-full overflow-hidden bg-white !p-0">
                <Sidebar />
                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
                            Memuat Dashboard Kepala Dinas...
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
                    background-color: #F8FAFC;
                    font-family: 'Poppins', sans-serif;
                }

                .kadin-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .kadin-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .kadin-scroll::-webkit-scrollbar-thumb {
                    background: rgba(10, 196, 224, 0.35);
                    border-radius: 999px;
                }

                .leaflet-container,
                .leaflet-pane,
                .leaflet-top,
                .leaflet-bottom {
                    z-index: 0 !important;
                }
            `}</style>

            <PageWrapper className="flex min-h-screen w-full bg-slate-50 !p-0">
                <Sidebar />

                <main className="kadin-scroll h-screen flex-1 overflow-y-auto bg-slate-50">
                    <header className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-500 px-8 py-9 text-white lg:px-10">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative w-full">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
                                        Kepala Dinas Workspace
                                    </p>
                                    <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                                        Monitoring Sekolah & Program Regional
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-xs font-semibold leading-6 text-blue-100/80">
                                        Data dibatasi otomatis berdasarkan provinsi penugasan akun Kepala Dinas. Assessment tidak ditampilkan pada halaman ini.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchDashboard}
                                    disabled={refreshing}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCcw
                                        className={refreshing ? "animate-spin" : ""}
                                        size={15}
                                    />
                                    {refreshing ? "Memuat..." : "Refresh Data"}
                                </button>
                            </div>

                            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    {
                                        label: "Provinsi",
                                        value: getWilayahName(wilayah),
                                        icon: <MapPin size={16} />,
                                    },
                                    {
                                        label: "Sekolah",
                                        value: compactNumber(schools.length),
                                        icon: <School size={16} />,
                                    },
                                    {
                                        label: "Sedang Berjalan",
                                        value: compactNumber(runningPrograms),
                                        icon: <Clock3 size={16} />,
                                    },
                                    {
                                        label: "Selesai",
                                        value: compactNumber(completedPrograms),
                                        icon: <CheckCircle2 size={16} />,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                                    >
                                        <div className="flex items-center gap-2 text-cyan-100">
                                            {item.icon}
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {item.label}
                                            </span>
                                        </div>
                                        <p className="mt-2 truncate text-xl font-black text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </header>

                    <div className="w-full px-5 py-7 sm:px-6 lg:px-8">
                        {loadError && (
                            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-600">
                                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">
                                        Data belum dapat ditampilkan
                                    </p>
                                    <p className="mt-1 text-xs font-semibold leading-6 text-red-500">
                                        {loadError}
                                    </p>
                                </div>
                            </div>
                        )}

                        <KadinProvinceMap
                            wilayah={wilayah}
                            wilayahList={wilayahList}
                            schools={schools}
                        />

                        <KadinSchoolAnalyticsSection
                            schools={schools}
                            programsBySchool={programsBySchool}
                            provinceName={getWilayahName(wilayah)}
                        />

                        <KadinProgramOnlySection
                            programs={programs}
                            schools={schools}
                            provinceName={getWilayahName(wilayah)}
                        />

                        <div className="rounded-3xl bg-slate-900 p-6 text-white">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-400">
                                    <ShieldCheck size={19} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider">
                                        Pembatasan Data Aktif
                                    </h3>
                                    <p className="mt-1 max-w-4xl text-[11px] font-semibold leading-6 text-slate-400">
                                        Program hanya dimasukkan ketika memiliki relasi langsung dengan minimal satu sekolah yang berada di provinsi {getWilayahName(
                                            wilayah,
                                        )}. Data dari provinsi lain tidak ikut dihitung maupun ditampilkan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </PageWrapper>
        </>
    );
}

