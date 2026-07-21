/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Plus,
    Filter,
    School,
    ArrowRight,
    Database,
    LayoutGrid,
    CheckCircle2,
    Clock3,
    MapPin,
    Layers3,
    Activity,
    RefreshCw,
    Search as SearchIcon,
    BarChart3,
    X,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Dropdown,
    Button,
    Search,
} from "../common";

import {
    filterSchoolsByHoAccess,
    canHoAccessProgram,
} from "../../utils/hoAccess";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

const getAssetUrl = (value) => {
    const raw = String(value || "").trim();

    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/uploads/")) return `${API_BASE_URL}${raw}`;
    if (raw.startsWith("uploads/")) return `${API_BASE_URL}/${raw}`;

    return raw;
};

const STATUS_LIST = [
    "Approval",
    "Sosialisasi",
    "Implementasi",
    "Evaluasi",
    "Selesai",
];

const STATUS_STYLE = {
    Approval: "border-amber-100 bg-amber-50 text-amber-600",
    Sosialisasi: "border-violet-100 bg-violet-50 text-violet-600",
    Implementasi: "border-cyan-100 bg-cyan-50 text-cyan-600",
    Evaluasi: "border-blue-100 bg-blue-50 text-blue-600",
    Selesai: "border-emerald-100 bg-emerald-50 text-emerald-600",
};

const PILAR_OPTIONS = {
    AKADEMIK: [
        { label: "Semua Pilar", value: "SEMUA" },
        { label: "Akademik", value: "AKADEMIK" },
        { label: "Karakter", value: "KARAKTER" },
        { label: "Belum Ditentukan", value: "BELUM_DITENTUKAN" },
    ],
    NON_AKADEMIK: [
        { label: "Semua Pilar", value: "SEMUA" },
        { label: "Seni Budaya", value: "SENI_BUDAYA" },
        { label: "Kecakapan Hidup", value: "KECAKAPAN_HIDUP" },
        { label: "Belum Ditentukan", value: "BELUM_DITENTUKAN" },
    ],
};

const PILAR_META = {
    AKADEMIK: {
        label: "Akademik",
        className: "border-cyan-100 bg-cyan-50 text-cyan-700",
    },
    KARAKTER: {
        label: "Karakter",
        className: "border-violet-100 bg-violet-50 text-violet-700",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        className: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    BELUM_DITENTUKAN: {
        label: "Belum Ditentukan",
        className: "border-slate-200 bg-slate-50 text-slate-500",
    },
};

const PROVINCE_COORDINATES = {
    aceh: [4.6951, 96.7494],
    "sumatera utara": [2.1154, 99.5451],
    "sumatra utara": [2.1154, 99.5451],
    "sumatera barat": [-0.7399, 100.8000],
    "sumatra barat": [-0.7399, 100.8000],
    riau: [0.2933, 101.7068],
    "kepulauan riau": [3.9457, 108.1429],
    jambi: [-1.4852, 102.4381],
    "sumatera selatan": [-3.3194, 103.9144],
    "sumatra selatan": [-3.3194, 103.9144],
    bengkulu: [-3.5778, 102.3464],
    lampung: [-4.5586, 105.4068],
    "bangka belitung": [-2.7411, 106.4406],
    banten: [-6.4058, 106.0640],
    jakarta: [-6.2088, 106.8456],
    "dki jakarta": [-6.2088, 106.8456],
    "jawa barat": [-6.9147, 107.6098],
    "jawa tengah": [-7.1500, 110.1403],
    yogyakarta: [-7.8754, 110.4262],
    "di yogyakarta": [-7.8754, 110.4262],
    "daerah istimewa yogyakarta": [-7.8754, 110.4262],
    "jawa timur": [-7.5361, 112.2384],
    bali: [-8.4095, 115.1889],
    "nusa tenggara barat": [-8.6529, 117.3616],
    ntb: [-8.6529, 117.3616],
    "nusa tenggara timur": [-8.6574, 121.0794],
    ntt: [-8.6574, 121.0794],
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
    papua: [-4.2699, 138.0804],
    "papua barat": [-1.3361, 133.1747],
    "papua barat daya": [-0.8762, 131.2558],
    "papua tengah": [-3.9530, 136.5656],
    "papua pegunungan": [-4.0000, 138.7500],
    "papua selatan": [-6.3140, 139.9500],
};

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;

    return [];
};

const isActiveValue = (value) =>
    value === true || value === "true" || Number(value) === 1;

const cleanWilayahName = (value) => {
    const raw = String(value || "").trim();

    if (!raw) return "Wilayah Tidak Diketahui";

    if (raw.includes("/")) {
        return raw.split("/").filter(Boolean).pop() || raw;
    }

    return raw;
};

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\b(provinsi|province|prov\.?|daerah|khusus)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

const normalizeCategory = (value) =>
    String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

const getProgramPilar = (program) => {
    const value = normalizeCategory(
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.pilar ||
        "",
    );

    return PILAR_META[value] ? value : "BELUM_DITENTUKAN";
};

const getPilarMeta = (programOrValue) => {
    const key =
        typeof programOrValue === "string"
            ? normalizeCategory(programOrValue)
            : getProgramPilar(programOrValue);

    return PILAR_META[key] || PILAR_META.BELUM_DITENTUKAN;
};

const getPilarOptions = (kategori) => {
    const category = normalizeCategory(kategori);

    if (category === "NON_AKADEMIK" || category === "NONAKADEMIK") {
        return PILAR_OPTIONS.NON_AKADEMIK;
    }

    return PILAR_OPTIONS.AKADEMIK;
};

const isSameCategory = (program, kategori) => {
    const programCategory = normalizeCategory(
        program?.kategori ||
        program?.kategori_program ||
        program?.jenis ||
        program?.tipe ||
        program?.category,
    );

    const targetCategory = normalizeCategory(kategori);

    if (!programCategory) return true;

    if (targetCategory === "NON_AKADEMIK") {
        return (
            programCategory === "NON_AKADEMIK" ||
            programCategory === "NONAKADEMIK" ||
            programCategory === "NON_ACADEMIC"
        );
    }

    return programCategory === targetCategory;
};

const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(String(value).replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
};

const isValidLatLng = (lat, lng) =>
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

const getCoordinateFromObject = (item) => {
    if (!item || typeof item !== "object") return null;

    const coordinateText =
        item?.koordinat ||
        item?.coordinate ||
        item?.coordinates ||
        item?.latlng ||
        item?.lat_lng ||
        "";

    if (typeof coordinateText === "string" && coordinateText.includes(",")) {
        const [rawLat, rawLng] = coordinateText.split(",").map((value) => value.trim());
        const lat = toNumber(rawLat);
        const lng = toNumber(rawLng);

        if (isValidLatLng(lat, lng)) return [lat, lng];
    }

    const lat =
        toNumber(item?.latitude) ??
        toNumber(item?.lat) ??
        toNumber(item?.koordinat_lat) ??
        toNumber(item?.koordinatLatitude) ??
        toNumber(item?.latitude_sekolah) ??
        toNumber(item?.lat_sekolah) ??
        toNumber(item?.wilayah_latitude) ??
        toNumber(item?.wilayah_lat);

    const lng =
        toNumber(item?.longitude) ??
        toNumber(item?.lng) ??
        toNumber(item?.long) ??
        toNumber(item?.koordinat_lng) ??
        toNumber(item?.koordinat_long) ??
        toNumber(item?.koordinatLongitude) ??
        toNumber(item?.longitude_sekolah) ??
        toNumber(item?.lng_sekolah) ??
        toNumber(item?.wilayah_longitude) ??
        toNumber(item?.wilayah_lng);

    if (isValidLatLng(lat, lng)) return [lat, lng];

    return null;
};

const getFallbackCoordinate = (regionName, index = 0) => {
    const key = normalizeText(regionName)
        .replace("ibu kota", "")
        .replace("dki", "jakarta")
        .trim();

    if (PROVINCE_COORDINATES[key]) return PROVINCE_COORDINATES[key];

    const matchedKey = Object.keys(PROVINCE_COORDINATES).find(
        (provinceKey) => key.includes(provinceKey) || provinceKey.includes(key),
    );

    if (matchedKey) return PROVINCE_COORDINATES[matchedKey];

    const offsetLat = (index % 4) * 0.55;
    const offsetLng = Math.floor(index / 4) * 0.75;

    return [-2.5489 + offsetLat, 118.0149 + offsetLng];
};

const getSchoolId = (school) => school?.id_sekolah ?? school?.id;

const getSchoolName = (school) =>
    school?.nama_sekolah || school?.nama || "Sekolah Tanpa Nama";

const toTitleCase = (value) =>
    String(value || "")
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

const getProvinceDisplayName = (key) => {
    const displayMap = {
        aceh: "Aceh",
        "sumatera utara": "Sumatera Utara",
        "sumatra utara": "Sumatera Utara",
        "sumatera barat": "Sumatera Barat",
        "sumatra barat": "Sumatera Barat",
        riau: "Riau",
        "kepulauan riau": "Kepulauan Riau",
        jambi: "Jambi",
        "sumatera selatan": "Sumatera Selatan",
        "sumatra selatan": "Sumatera Selatan",
        bengkulu: "Bengkulu",
        lampung: "Lampung",
        "bangka belitung": "Bangka Belitung",
        banten: "Banten",
        jakarta: "DKI Jakarta",
        "dki jakarta": "DKI Jakarta",
        "jawa barat": "Jawa Barat",
        "jawa tengah": "Jawa Tengah",
        yogyakarta: "DI Yogyakarta",
        "di yogyakarta": "DI Yogyakarta",
        "daerah istimewa yogyakarta": "DI Yogyakarta",
        "jawa timur": "Jawa Timur",
        bali: "Bali",
        "nusa tenggara barat": "Nusa Tenggara Barat",
        ntb: "Nusa Tenggara Barat",
        "nusa tenggara timur": "Nusa Tenggara Timur",
        ntt: "Nusa Tenggara Timur",
        "kalimantan barat": "Kalimantan Barat",
        "kalimantan tengah": "Kalimantan Tengah",
        "kalimantan selatan": "Kalimantan Selatan",
        "kalimantan timur": "Kalimantan Timur",
        "kalimantan utara": "Kalimantan Utara",
        "sulawesi utara": "Sulawesi Utara",
        gorontalo: "Gorontalo",
        "sulawesi tengah": "Sulawesi Tengah",
        "sulawesi barat": "Sulawesi Barat",
        "sulawesi selatan": "Sulawesi Selatan",
        "sulawesi tenggara": "Sulawesi Tenggara",
        "maluku utara": "Maluku Utara",
        maluku: "Maluku",
        "papua barat daya": "Papua Barat Daya",
        "papua barat": "Papua Barat",
        "papua tengah": "Papua Tengah",
        "papua pegunungan": "Papua Pegunungan",
        "papua selatan": "Papua Selatan",
        papua: "Papua",
    };

    return displayMap[key] || toTitleCase(key);
};

const normalizeProvinceName = (value) => {
    const raw = String(value || "").trim();

    if (!raw) return "";

    const normalized = normalizeText(raw)
        .replaceAll(">", "/")
        .replaceAll("-", " ")
        .replace(/\s*\/\s*/g, "/")
        .trim();

    const parts = normalized
        .split("/")
        .map((item) => normalizeText(item))
        .filter(Boolean);

    const candidates = [normalized, ...parts];

    const provinceKey = Object.keys(PROVINCE_COORDINATES)
        .sort((a, b) => b.length - a.length)
        .find((key) =>
            candidates.some(
                (candidate) =>
                    candidate === key ||
                    candidate.includes(key) ||
                    key.includes(candidate),
            ),
        );

    if (provinceKey) {
        return getProvinceDisplayName(provinceKey);
    }

    return cleanWilayahName(raw);
};

const getSchoolProvinceCandidate = (school) => {
    const wilayah = school?.wilayah;

    const candidates = [
        school?.provinsi,
        school?.province,
        school?.nama_provinsi,
        school?.namaProvinsi,
        school?.wilayah_provinsi,

        school?.provinsi?.nama_provinsi,
        school?.provinsi?.nama_wilayah,
        school?.provinsi?.nama,

        wilayah?.provinsi,
        wilayah?.province,
        wilayah?.nama_provinsi,
        wilayah?.namaProvinsi,

        wilayah?.parent?.nama_wilayah,
        wilayah?.parent?.nama,
        wilayah?.induk?.nama_wilayah,
        wilayah?.induk?.nama,
        wilayah?.wilayah_induk?.nama_wilayah,
        wilayah?.wilayah_induk?.nama,

        school?.path_wilayah,
        school?.wilayah_path,
        school?.full_wilayah,
        school?.alamat_wilayah,

        wilayah?.path,
        wilayah?.path_wilayah,
        wilayah?.full_path,
        wilayah?.full_wilayah,

        school?.nama_wilayah,
        school?.namaWilayah,
        school?.region,

        wilayah?.nama_wilayah,
        wilayah?.namaWilayah,

        typeof wilayah === "string" ? wilayah : "",
    ];

    return candidates.find((item) => String(item || "").trim()) || "";
};

const getSchoolRegion = (school) => {
    const candidate = getSchoolProvinceCandidate(school);

    if (!candidate) return "Wilayah Tidak Diketahui";

    return normalizeProvinceName(candidate);
};
const getSchoolCoordinate = (school) =>
    getCoordinateFromObject(school) || getCoordinateFromObject(school?.wilayah);

const getSchoolLogo = (school) =>
    getAssetUrl(
        school?.logo_sekolah ||
        school?.logoSekolah ||
        school?.logo_url ||
        school?.logoUrl ||
        school?.logo ||
        school?.foto_sekolah ||
        school?.fotoSekolah ||
        "",
    );

const getProgramId = (program) => program?.id_program ?? program?.id;

const getProgramName = (program) =>
    program?.nama_program || program?.nama || program?.title || "Program";

const getProgramStatus = (program) => {
    const raw =
        program?.status_program ||
        program?.status ||
        program?.fase_aktif?.nama_fase ||
        program?.faseAktif?.nama_fase ||
        program?.fase ||
        "Approval";

    const normalized = String(raw).trim();

    const matched = STATUS_LIST.find(
        (item) => item.toLowerCase() === normalized.toLowerCase(),
    );

    return matched || normalized || "Approval";
};

const getProgramTime = (program) => {
    const value =
        program?.updated_at ||
        program?.created_at ||
        program?.tanggal_mulai ||
        program?.start_date ||
        program?.tanggal;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const getCurrentHoIdFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        return payload?.sub || payload?.id_user || payload?.id || null;
    } catch {
        return null;
    }
};

const collectProgramSchoolIds = (program) => {
    const ids = [];

    if (program?.id_sekolah) ids.push(Number(program.id_sekolah));
    if (program?.sekolah_id) ids.push(Number(program.sekolah_id));
    if (program?.school_id) ids.push(Number(program.school_id));

    if (program?.sekolah?.id_sekolah) {
        ids.push(Number(program.sekolah.id_sekolah));
    }

    if (program?.sekolah?.id) {
        ids.push(Number(program.sekolah.id));
    }

    if (program?.school?.id_sekolah) {
        ids.push(Number(program.school.id_sekolah));
    }

    if (program?.school?.id) {
        ids.push(Number(program.school.id));
    }

    if (Array.isArray(program?.target_sekolah_ids)) {
        program.target_sekolah_ids.forEach((id) => ids.push(Number(id)));
    }

    if (Array.isArray(program?.sekolah_ids)) {
        program.sekolah_ids.forEach((id) => ids.push(Number(id)));
    }

    if (Array.isArray(program?.school_ids)) {
        program.school_ids.forEach((id) => ids.push(Number(id)));
    }

    if (Array.isArray(program?.sekolahs)) {
        program.sekolahs.forEach((school) => {
            if (school?.id_sekolah) ids.push(Number(school.id_sekolah));
            if (school?.id) ids.push(Number(school.id));
        });
    }

    if (Array.isArray(program?.schools)) {
        program.schools.forEach((school) => {
            if (school?.id_sekolah) ids.push(Number(school.id_sekolah));
            if (school?.id) ids.push(Number(school.id));
        });
    }

    if (Array.isArray(program?.target_sekolah)) {
        program.target_sekolah.forEach((school) => {
            if (school?.id_sekolah) ids.push(Number(school.id_sekolah));
            if (school?.id) ids.push(Number(school.id));
        });
    }

    return [...new Set(ids.filter((id) => !Number.isNaN(id)))];
};

const buildRegionIcon = (group) => {
    const totalProgram = Number(group.total_program || 0);
    const hasProgram = totalProgram > 0;

    return L.divIcon({
        className: "program-region-marker-wrap",
        html: `
            <div class="program-region-marker ${hasProgram ? "is-active" : "is-muted"}">
                <span>${totalProgram}</span>
            </div>
        `,
        iconSize: [50, 58],
        iconAnchor: [25, 52],
        popupAnchor: [0, -46],
    });
};

function ReadProgramPage({
    kategori = "AKADEMIK",
    titleHighlight = "Akademik",
    createPath = "/ho/program/akademik/create",
    listPathPrefix = "/ho/program/akademik/list",
    detailButtonText = "Lihat Program",
}) {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [drawerSearch, setDrawerSearch] = useState("");
    const [filterWilayah, setFilterWilayah] = useState("Semua");
    const [filterPilar, setFilterPilar] = useState("SEMUA");
    const [selectedRegionName, setSelectedRegionName] = useState("");
    const [page, setPage] = useState(1);
    const [programs, setPrograms] = useState([]);
    const [sekolahs, setSekolahs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const hoId = getCurrentHoIdFromToken();

            const [resSekolah, resProgram, resHo] = await Promise.all([
                fetch(`${API_BASE_URL}/sekolah`, { headers }),
                fetch(`${API_BASE_URL}/program?kategori=${kategori}`, {
                    headers,
                }),
                hoId
                    ? fetch(`${API_BASE_URL}/users/${hoId}`, { headers })
                    : Promise.resolve(null),
            ]);

            const dataSekolah = await resSekolah.json().catch(() => []);
            const dataProgram = await resProgram.json().catch(() => []);
            const dataHo = resHo ? await resHo.json().catch(() => ({})) : null;

            if (!resSekolah.ok || !resProgram.ok) {
                throw new Error(
                    dataSekolah?.message ||
                    dataProgram?.message ||
                    "Gagal memuat data program",
                );
            }

            const currentHo = dataHo?.data || dataHo || null;

            const allSekolahList = normalizeArray(dataSekolah)
                .filter((school) => getSchoolId(school))
                .filter((school) => isActiveValue(school?.status ?? true))
                .sort((a, b) => getSchoolName(a).localeCompare(getSchoolName(b)));

            const sekolahList = filterSchoolsByHoAccess(
                allSekolahList,
                currentHo,
            );

            const programList = normalizeArray(dataProgram)
                .filter((program) => getProgramId(program))
                .filter((program) => isSameCategory(program, kategori))
                .filter((program) =>
                    canHoAccessProgram(currentHo, program, allSekolahList),
                )
                .sort((a, b) => getProgramTime(b) - getProgramTime(a));

            setSekolahs(sekolahList);
            setPrograms(programList);
        } catch (error) {
            console.error("Gagal memuat data program:", error);
            toast.error(error.message || "Gagal memuat data program");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [kategori]);

    useEffect(() => {
        setFilterPilar("SEMUA");
    }, [kategori]);

    const pilarOptions = useMemo(
        () => getPilarOptions(kategori),
        [kategori],
    );

    const wilayahOptions = useMemo(() => {
        const uniqueWilayahs = [
            ...new Set(sekolahs.map(getSchoolRegion).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b));

        return [
            { label: "Seluruh Wilayah", value: "Semua" },
            ...uniqueWilayahs.map((wilayah) => ({
                label: wilayah.toUpperCase(),
                value: wilayah,
            })),
        ];
    }, [sekolahs]);

    const visiblePrograms = useMemo(() => {
        if (filterPilar === "SEMUA") return programs;

        return programs.filter(
            (program) => getProgramPilar(program) === filterPilar,
        );
    }, [programs, filterPilar]);

    const programBySchoolId = useMemo(() => {
        const map = new Map();

        sekolahs.forEach((school) => {
            const schoolId = String(getSchoolId(school));
            map.set(schoolId, []);
        });

        visiblePrograms.forEach((program) => {
            const schoolIds = collectProgramSchoolIds(program);

            schoolIds.forEach((schoolId) => {
                const key = String(schoolId);

                if (!map.has(key)) {
                    map.set(key, []);
                }

                map.get(key).push(program);
            });
        });

        return map;
    }, [visiblePrograms, sekolahs]);

    const mappedSchools = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return sekolahs
            .filter((sekolah) => {
                const schoolId = String(getSchoolId(sekolah));
                const matchedPrograms = programBySchoolId.get(schoolId) || [];
                const wilayah = getSchoolRegion(sekolah);

                const matchWilayah =
                    filterWilayah === "Semua" || wilayah === filterWilayah;

                const matchPilar =
                    filterPilar === "SEMUA" || matchedPrograms.length > 0;

                const programSearchText = matchedPrograms
                    .map((program) =>
                        [
                            getProgramName(program),
                            getPilarMeta(program).label,
                            program?.jenis_program,
                        ].join(" "),
                    )
                    .join(" ");

                const searchTarget = [
                    getSchoolName(sekolah),
                    sekolah?.npsn,
                    sekolah?.jenjang,
                    wilayah,
                    programSearchText,
                ]
                    .join(" ")
                    .toLowerCase();

                return (
                    matchWilayah &&
                    matchPilar &&
                    searchTarget.includes(keyword)
                );
            })
            .map((sekolah) => {
                const schoolId = String(getSchoolId(sekolah));
                const matchedPrograms = programBySchoolId.get(schoolId) || [];
                const sortedPrograms = [...matchedPrograms].sort(
                    (a, b) => getProgramTime(b) - getProgramTime(a),
                );
                const latestProgram = sortedPrograms[0] || null;

                const statusCount = STATUS_LIST.reduce((result, status) => {
                    result[status] = matchedPrograms.filter(
                        (program) => getProgramStatus(program) === status,
                    ).length;

                    return result;
                }, {});

                return {
                    ...sekolah,
                    id_sekolah: getSchoolId(sekolah),
                    nama_sekolah: getSchoolName(sekolah),
                    logo_sekolah: getSchoolLogo(sekolah),
                    wilayah_name: getSchoolRegion(sekolah),
                    coordinate: getSchoolCoordinate(sekolah),
                    total_program: matchedPrograms.length,
                    status_count: statusCount,
                    programs: sortedPrograms,
                    latest_program: latestProgram
                        ? getProgramName(latestProgram)
                        : "-",
                    latest_pilar: latestProgram
                        ? getPilarMeta(latestProgram).label
                        : "Belum Ditentukan",
                    latest_pilar_key: latestProgram
                        ? getProgramPilar(latestProgram)
                        : "BELUM_DITENTUKAN",
                };
            });
    }, [
        sekolahs,
        programBySchoolId,
        filterWilayah,
        filterPilar,
        search,
    ]);

    const regionGroups = useMemo(() => {
        const map = new Map();

        mappedSchools.forEach((school) => {
            const regionName = school.wilayah_name || "Wilayah Tidak Diketahui";

            if (!map.has(regionName)) {
                map.set(regionName, {
                    name: regionName,
                    schools: [],
                    total_program: 0,
                    status_count: STATUS_LIST.reduce((result, status) => {
                        result[status] = 0;
                        return result;
                    }, {}),
                });
            }

            const group = map.get(regionName);

            group.schools.push(school);
            group.total_program += Number(school.total_program || 0);

            STATUS_LIST.forEach((status) => {
                group.status_count[status] += Number(school.status_count?.[status] || 0);
            });
        });

        return Array.from(map.values())
            .map((group, index) => {
                return {
                    ...group,
                    coordinate: getFallbackCoordinate(group.name, index),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [mappedSchools]);

    const selectedRegion = useMemo(() => {
        if (!selectedRegionName) return null;

        return regionGroups.find((group) => group.name === selectedRegionName) || null;
    }, [selectedRegionName, regionGroups]);

    const selectedRegionSchools = useMemo(() => {
        if (!selectedRegion) return [];

        const keyword = drawerSearch.trim().toLowerCase();

        return selectedRegion.schools.filter((school) => {
            const searchTarget = [
                school.nama_sekolah,
                school.npsn,
                school.jenjang,
                school.latest_program,
                school.latest_pilar,
            ]
                .join(" ")
                .toLowerCase();

            return searchTarget.includes(keyword);
        });
    }, [selectedRegion, drawerSearch]);

    const readPanelSchools = useMemo(() => {
        return [...mappedSchools].sort((a, b) => {
            const programDiff = Number(b.total_program || 0) - Number(a.total_program || 0);

            if (programDiff !== 0) return programDiff;

            return String(a.nama_sekolah || "").localeCompare(
                String(b.nama_sekolah || ""),
            );
        });
    }, [mappedSchools]);

    const limit = 5;
    const totalPages = Math.ceil(readPanelSchools.length / limit) || 1;
    const start = (page - 1) * limit;
    const currentSchools = readPanelSchools.slice(start, start + limit);

    useEffect(() => {
        setPage(1);
    }, [search, filterWilayah, filterPilar, kategori]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        if (!selectedRegionName) return;

        const stillExists = regionGroups.some(
            (group) => group.name === selectedRegionName,
        );

        if (!stillExists) {
            setSelectedRegionName("");
            setDrawerSearch("");
        }
    }, [regionGroups, selectedRegionName]);

    const totalSelesai = visiblePrograms.filter(
        (program) => getProgramStatus(program) === "Selesai",
    ).length;

    const totalApproval = visiblePrograms.filter(
        (program) => getProgramStatus(program) === "Approval",
    ).length;

    const activeSchoolCount = useMemo(() => {
        return mappedSchools.filter((school) => Number(school.total_program) > 0)
            .length;
    }, [mappedSchools]);

    const handleSelectRegion = (group) => {
        setSelectedRegionName(group.name);
        setDrawerSearch("");
    };

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-900">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-6 py-6 lg:px-8">
                <section className="shrink-0">
                    <div className="overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
                        <div className="flex flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="h-14 w-1.5 shrink-0 rounded-full bg-[#0AC4E0]" />

                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                            Monitoring Program
                                        </span>

                                        <span className="h-1 w-1 rounded-full bg-slate-300" />

                                        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                                            {titleHighlight}
                                        </span>

                                        {totalApproval > 0 && (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-slate-300" />

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                                    <Clock3 size={11} />
                                                    {totalApproval} Approval
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h1 className="text-[28px] font-black leading-none tracking-[-0.055em] text-slate-950">
                                        Program{" "}
                                        <span className="text-[#0AC4E0]">
                                            {titleHighlight}
                                        </span>
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 xl:items-end">
                                <div className="flex flex-wrap items-center gap-2">
                                    <MetricPill
                                        label="Sekolah"
                                        value={mappedSchools.length}
                                        icon={<School size={14} />}
                                    />

                                    <MetricPill
                                        label="Berprogram"
                                        value={activeSchoolCount}
                                        icon={<Activity size={14} />}
                                        variant="info"
                                    />

                                    <MetricPill
                                        label="Program"
                                        value={visiblePrograms.length}
                                        icon={<Database size={14} />}
                                    />

                                    <MetricPill
                                        label="Selesai"
                                        value={totalSelesai}
                                        icon={<CheckCircle2 size={14} />}
                                        variant="success"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={fetchData}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-white hover:text-[#0AC4E0] active:scale-95"
                                        title="Refresh Data"
                                    >
                                        <RefreshCw size={15} />
                                    </button>

                                    <Button
                                        text="Inisiasi Program"
                                        icon={<Plus size={15} />}
                                        onClick={() => navigate(createPath)}
                                        className="!rounded-xl !bg-[#0AC4E0] !px-5 !py-2.5 !text-[9px] !font-black !uppercase !tracking-widest !text-white shadow-md shadow-cyan-100 hover:!bg-cyan-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_230px_250px]">
                                <div className="relative">
                                    <Search
                                        placeholder="Cari sekolah, program, pilar, NPSN, jenjang, atau wilayah..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />

                                    <SearchIcon
                                        size={15}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                                    />
                                </div>

                                <div className="relative z-20 flex h-[48px] items-center rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
                                    <Filter
                                        size={15}
                                        className="mr-3 shrink-0 text-slate-400"
                                    />

                                    <Dropdown
                                        items={pilarOptions}
                                        value={filterPilar}
                                        onChange={(value) => setFilterPilar(value)}
                                        className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                    />
                                </div>

                                <div className="relative z-10 flex h-[48px] items-center rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
                                    <Filter
                                        size={15}
                                        className="mr-3 shrink-0 text-slate-400"
                                    />

                                    <Dropdown
                                        items={wilayahOptions}
                                        value={filterWilayah}
                                        onChange={(value) => setFilterWilayah(value)}
                                        className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative min-h-0 flex-1 overflow-hidden py-5">
                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#0AC4E0]">
                                        Memuat Data
                                    </p>
                                </div>
                            </div>
                        ) : regionGroups.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                                <LayoutGrid
                                    size={64}
                                    className="mb-4 text-slate-300"
                                />

                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Data Tidak Ditemukan
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="shrink-0 border-b border-slate-100 bg-white px-6 py-5">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                                Ringkasan Monitoring
                                            </p>
                                            <h2 className="mt-1 text-[24px] font-black leading-tight text-slate-950">
                                                Pilih sekolah untuk melihat daftar program dan progress detail.
                                            </h2>
                                            <p className="mt-2 text-[13px] font-semibold text-slate-500">
                                                Data mengikuti filter pencarian, pilar, dan wilayah pada bagian atas.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:w-[560px]">
                                            {STATUS_LIST.map((status) => (
                                                <StatusSummary
                                                    key={status}
                                                    status={status}
                                                    value={visiblePrograms.filter((program) => getProgramStatus(program) === status).length}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="program-panel-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentSchools.map((school) => (
                                            <ProgramWideCard
                                                key={school.id_sekolah}
                                                school={school}
                                                onOpen={() => navigate(`${listPathPrefix}/${school.id_sekolah}`)}
                                                detailButtonText={detailButtonText}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Menampilkan {currentSchools.length} dari {readPanelSchools.length} sekolah
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                                            disabled={page <= 1}
                                            className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Prev
                                        </button>

                                        <span className="rounded-xl bg-[#0AC4E0] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                                            {page} / {totalPages}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                            disabled={page >= totalPages}
                                            className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .leaflet-container {
                            font-family: inherit;
                            background: #EAF3FF;
                        }

                        .leaflet-control-attribution {
                            font-size: 9px;
                            font-weight: 700;
                            color: #64748B;
                        }

                        .program-region-marker-wrap {
                            background: transparent;
                            border: none;
                        }

                        .program-region-marker {
                            position: relative;
                            width: 46px;
                            height: 46px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 999px 999px 999px 10px;
                            border: 3px solid #FFFFFF;
                            box-shadow: 0 18px 38px rgba(15, 23, 42, 0.28);
                            font-size: 13px;
                            font-weight: 950;
                            letter-spacing: -0.04em;
                            transform: rotate(-45deg);
                        }

                        .program-region-marker span {
                            display: flex;
                            height: 28px;
                            min-width: 28px;
                            align-items: center;
                            justify-content: center;
                            border-radius: 999px;
                            background: rgba(255,255,255,0.16);
                            transform: rotate(45deg);
                        }

                        .program-region-marker::after {
                            content: "";
                            position: absolute;
                            inset: 8px;
                            border-radius: 999px;
                            border: 1px solid rgba(255,255,255,0.28);
                        }

                        .program-region-marker.is-active {
                            background: linear-gradient(135deg, #0F172A 0%, #111827 55%, #0AC4E0 145%);
                            color: #FFFFFF;
                        }

                        .program-region-marker.is-muted {
                            background: #CBD5E1;
                            color: #FFFFFF;
                        }

                        .program-map-tooltip {
                            border: 1px solid #E2E8F0;
                            border-radius: 16px;
                            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
                            padding: 8px 10px;
                        }

                        .program-map-tooltip::before {
                            display: none;
                        }

                        .program-panel-scroll::-webkit-scrollbar {
                            width: 6px;
                        }

                        .program-panel-scroll::-webkit-scrollbar-track {
                            background: transparent;
                        }

                        .program-panel-scroll::-webkit-scrollbar-thumb {
                            background: #CBD5E1;
                            border-radius: 999px;
                        }

                        .program-title-clamp,
                        .program-text-clamp {
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }

                        .program-title-clamp {
                            -webkit-line-clamp: 2;
                        }

                        .program-text-clamp {
                            -webkit-line-clamp: 1;
                        }
                    `,
                }}
            />
        </PageWrapper>
    );
}

function MetricPill({ label, value, icon, variant = "primary" }) {
    const variantClass = {
        primary: "bg-cyan-50 text-[#0AC4E0]",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        info: "bg-blue-50 text-blue-600",
    };

    return (
        <div className="flex h-12 min-w-[116px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 shadow-sm">
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${variantClass[variant]}`}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 text-[18px] font-black leading-none tracking-[-0.055em] text-slate-950">
                    {value}
                </p>
            </div>
        </div>
    );
}

function ProgramReadPanel({
    schools,
    search,
    wilayah,
    pilarLabel,
    onOpenSchool,
    detailButtonText,
}) {
    return (
        <aside className="absolute bottom-5 right-5 top-5 z-[650] hidden w-[430px] max-w-[calc(100%-40px)] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur xl:flex">
            <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Hasil Pencarian
                        </p>

                        <h2 className="mt-1 text-[22px] font-black leading-tight tracking-[-0.045em] text-slate-950">
                            Daftar Program
                        </h2>

                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {schools.length} sekolah tampil "- {pilarLabel}
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                        <BarChart3 size={18} />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                            Wilayah
                        </p>
                        <p className="program-text-clamp mt-1 text-[10px] font-black uppercase text-slate-700">
                            {wilayah === "Semua" ? "Seluruh Wilayah" : wilayah}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                            Keyword
                        </p>
                        <p className="program-text-clamp mt-1 text-[10px] font-black text-slate-700">
                            {search?.trim() || "Semua Data"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="program-panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {schools.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <LayoutGrid size={48} className="mb-3 text-slate-200" />

                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Program tidak ditemukan
                        </p>
                    </div>
                ) : (
                    schools.map((school) => (
                        <ProgramReadCard
                            key={school.id_sekolah}
                            school={school}
                            onOpen={() => onOpenSchool(school.id_sekolah)}
                            detailButtonText={detailButtonText}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

function ProgramReadCard({ school, onOpen, detailButtonText }) {
    const hasProgram = Number(school.total_program || 0) > 0;
    const programs = Array.isArray(school.programs) ? school.programs.slice(0, 2) : [];

    return (
        <article className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-[#0AC4E0]/30 hover:shadow-md">
            <div className="flex items-start gap-3">
                <SchoolLogo
                    src={school.logo_sekolah}
                    name={school.nama_sekolah}
                    size="lg"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-slate-500">
                            {school.jenjang || "-"}
                        </span>

                        <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#0AC4E0]">
                            {school.wilayah_name || "Wilayah"}
                        </span>
                    </div>

                    <h3 className="program-title-clamp mt-2 text-[14px] font-black leading-snug tracking-[-0.03em] text-slate-950">
                        {school.nama_sekolah || "-"}
                    </h3>

                    <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        NPSN: {school.npsn || "-"}
                    </p>
                </div>

                <div className={`shrink-0 rounded-2xl px-3 py-2 text-center text-white ${hasProgram ? "bg-slate-950" : "bg-slate-300"}`}>
                    <p className="text-[16px] font-black leading-none">
                        {school.total_program || 0}
                    </p>
                    <p className="mt-1 text-[6px] font-black uppercase tracking-widest text-white/60">
                        Program
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {programs.length > 0 ? (
                    programs.map((program) => {
                        const status = getProgramStatus(program);
                        const pilar = getPilarMeta(program);

                        return (
                            <div
                                key={getProgramId(program)}
                                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="program-text-clamp text-[11px] font-black text-slate-800">
                                            {getProgramName(program)}
                                        </p>

                                        <span className={`mt-2 inline-flex rounded-lg border px-2 py-1 text-[7px] font-black uppercase tracking-widest ${pilar.className}`}>
                                            Pilar {pilar.label}
                                        </span>
                                    </div>

                                    <span className={`shrink-0 rounded-lg border px-2 py-1 text-[7px] font-black uppercase tracking-widest ${STATUS_STYLE[status] || STATUS_STYLE.Approval}`}>
                                        {status}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold text-slate-400">
                            Belum ada program pada filter ini.
                        </p>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-[#0AC4E0]/30 hover:bg-cyan-50"
            >
                <span className="flex min-w-0 items-center gap-2 pr-3 text-[9px] font-black uppercase tracking-widest text-slate-700">
                    <Layers3 size={13} className="shrink-0 text-[#0AC4E0]" />

                    <span className="program-text-clamp">
                        {detailButtonText}
                    </span>
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-[#0AC4E0] hover:text-white">
                    <ArrowRight size={14} />
                </span>
            </button>
        </article>
    );
}

function StatusSummary({ status, value }) {
    return (
        <div className={`flex h-[72px] flex-col items-center justify-center rounded-2xl border px-3 text-center ${STATUS_STYLE[status] || STATUS_STYLE.Approval}`}>
            <p className="text-[20px] font-black leading-none">
                {value}
            </p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-widest">
                {status}
            </p>
        </div>
    );
}

function ProgramWideCard({ school, onOpen, detailButtonText }) {
    const hasProgram = Number(school.total_program || 0) > 0;
    const programs = Array.isArray(school.programs) ? school.programs.slice(0, 3) : [];

    return (
        <article className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-[#0AC4E0]/30 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] xl:items-stretch">
                <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                    <SchoolLogo
                        src={school.logo_sekolah}
                        name={school.nama_sekolah}
                        size="lg"
                    />

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                {school.jenjang || "-"}
                            </span>
                            <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                {school.wilayah_name || "Wilayah"}
                            </span>
                        </div>

                        <h3 className="program-title-clamp mt-2 text-[16px] font-black leading-snug text-slate-950">
                            {school.nama_sekolah || "-"}
                        </h3>

                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            NPSN: {school.npsn || "-"}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-white px-3 py-3">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Program Terbaru
                            </p>
                            <span className={`inline-flex h-7 min-w-[84px] shrink-0 items-center justify-center rounded-lg px-2.5 text-[9px] font-black uppercase tracking-widest text-white ${hasProgram ? "bg-[#0AC4E0]" : "bg-slate-300"}`}>
                                {school.total_program || 0} Program
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onOpen}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_10px_22px_rgba(10,196,224,0.18)] transition hover:bg-cyan-500"
                        >
                            {detailButtonText}
                            <ArrowRight size={13} />
                        </button>
                    </div>

                    {programs.length > 0 ? (
                        <div className="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-3">
                            {programs.map((program) => {
                                const status = getProgramStatus(program);
                                const pilar = getPilarMeta(program);

                                return (
                                    <div
                                        key={getProgramId(program)}
                                        className="flex min-h-[92px] min-w-0 flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
                                    >
                                        <p className="program-title-clamp text-[12px] font-black leading-snug text-slate-800">
                                            {getProgramName(program)}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <span className={`inline-flex h-6 items-center rounded-lg border px-2 text-[7px] font-black uppercase tracking-widest ${pilar.className}`}>
                                                {pilar.label}
                                            </span>
                                            <span className={`inline-flex h-6 items-center rounded-lg border px-2 text-[7px] font-black uppercase tracking-widest ${STATUS_STYLE[status] || STATUS_STYLE.Approval}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-[12px] font-bold text-slate-400">
                                Belum ada program pada filter ini.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </article>
    );
}

function MapLegend({ regionCount, schoolCount, programCount, pilarLabel }) {
    return (
        <div className="absolute left-5 top-5 z-[500] rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-[0_14px_35px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                    <MapPinned size={17} />
                </div>

                <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Marker Wilayah
                    </p>

                    <p className="mt-1 text-[11px] font-black text-slate-800">
                        {regionCount} wilayah "- {schoolCount} sekolah "- {programCount} program
                    </p>

                    <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Angka marker = jumlah program "- {pilarLabel}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RegionSchoolPanel({
    region,
    schools,
    search,
    onSearch,
    onClose,
    onOpenSchool,
    detailButtonText,
}) {
    return (
        <aside className="absolute bottom-5 right-5 top-5 z-[1000] flex w-[420px] max-w-[calc(100%-40px)] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Wilayah Terpilih
                        </p>

                        <h2 className="mt-1 text-[22px] font-black leading-tight tracking-[-0.045em] text-slate-950">
                            {region.name}
                        </h2>

                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {region.schools.length} Sekolah "- {region.total_program} Program
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        title="Tutup"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                    {STATUS_LIST.map((status) => (
                        <StatusMini
                            key={status}
                            status={status}
                            value={region.status_count?.[status] || 0}
                        />
                    ))}
                </div>

                <div className="relative mt-4">
                    <Search
                        placeholder="Cari sekolah di wilayah ini..."
                        value={search}
                        onChange={(event) => onSearch(event.target.value)}
                    />

                    <SearchIcon
                        size={15}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                </div>
            </div>

            <div className="program-panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {schools.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <LayoutGrid size={48} className="mb-3 text-slate-200" />

                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Sekolah tidak ditemukan
                        </p>
                    </div>
                ) : (
                    schools.map((school) => (
                        <RegionSchoolCard
                            key={school.id_sekolah}
                            school={school}
                            onOpen={() => onOpenSchool(school.id_sekolah)}
                            detailButtonText={detailButtonText}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

function SchoolLogo({ src, name, size = "md" }) {
    const sizeClass = size === "lg" ? "h-14 w-14 rounded-[1.25rem]" : "h-12 w-12 rounded-2xl";
    const iconSize = size === "lg" ? 24 : 22;

    return (
        <div className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-slate-50 text-[#0AC4E0]`}>
            {src ? (
                <img
                    src={src}
                    alt={name || "Logo Sekolah"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <School size={iconSize} />
            )}
        </div>
    );
}

function RegionSchoolCard({ school, onOpen, detailButtonText }) {
    const hasProgram = Number(school.total_program || 0) > 0;
    const pilar = getPilarMeta(
        school.latest_pilar_key || "BELUM_DITENTUKAN",
    );

    return (
        <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-[#0AC4E0]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <SchoolLogo
                        src={school.logo_sekolah}
                        name={school.nama_sekolah}
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                            NPSN: {school.npsn || "-"}
                        </p>

                        <h3 className="program-title-clamp mt-1 text-[14px] font-black leading-snug tracking-[-0.03em] text-slate-950">
                            {school.nama_sekolah || "-"}
                        </h3>
                    </div>
                </div>

                <div
                    className={`shrink-0 rounded-2xl px-3 py-2 text-center text-white ${hasProgram ? "bg-slate-950" : "bg-slate-300"
                        }`}
                >
                    <p className="text-[15px] font-black leading-none">
                        {school.total_program}
                    </p>

                    <p className="mt-1 text-[6px] font-black uppercase tracking-widest text-white/60">
                        Program
                    </p>
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2">
                    <MapPin size={13} className="text-[#0AC4E0]" />

                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Program Terbaru
                    </p>
                </div>

                <p
                    className={`program-text-clamp text-[11px] font-bold ${hasProgram ? "text-slate-700" : "text-slate-300"
                        }`}
                >
                    {school.latest_program}
                </p>

                {hasProgram && (
                    <span
                        className={`mt-2 inline-flex rounded-lg border px-2 py-1 text-[7px] font-black uppercase tracking-widest ${pilar.className}`}
                    >
                        Pilar {pilar.label}
                    </span>
                )}
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1.5">
                {STATUS_LIST.map((status) => (
                    <StatusMini
                        key={status}
                        status={status}
                        value={school.status_count?.[status] || 0}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-[#0AC4E0]/30 hover:bg-cyan-50"
            >
                <span className="flex min-w-0 items-center gap-2 pr-3 text-[9px] font-black uppercase tracking-widest text-slate-700">
                    <Layers3 size={13} className="shrink-0 text-[#0AC4E0]" />

                    <span className="program-text-clamp">
                        {detailButtonText}
                    </span>
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-[#0AC4E0] hover:text-white">
                    <ArrowRight size={14} />
                </span>
            </button>
        </div>
    );
}

function StatusMini({ status, value }) {
    return (
        <div
            className={`rounded-xl border px-1.5 py-2 text-center ${STATUS_STYLE[status]}`}
        >
            <p className="text-[11px] font-black leading-none">{value}</p>

            <p className="program-text-clamp mt-1 text-[5.5px] font-black uppercase leading-tight tracking-widest">
                {status}
            </p>
        </div>
    );
}

export default ReadProgramPage;
