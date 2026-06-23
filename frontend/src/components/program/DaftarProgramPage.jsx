/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Filter,
    Loader2,
    MapPin,
    RefreshCcw,
    School,
    Search,
    Tag,
} from "lucide-react";
import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";

const API_BASE_URL = "";
const ROWS_PER_PAGE = 5;

const JENIS_OPTIONS = [
    { label: "Semua Jenis", value: "ALL" },
    { label: "Project", value: "PROJECT" },
    { label: "Reguler", value: "REGULER" },
];

const BIDANG_OPTIONS = [
    { label: "Semua Bidang", value: "ALL" },
    { label: "Akademik", value: "AKADEMIK" },
    { label: "Non Akademik", value: "NON_AKADEMIK" },
];

const PILAR_META = {
    AKADEMIK: {
        label: "Akademik",
        group: "AKADEMIK",
        className: "border-slate-300 bg-slate-100 text-slate-700",
    },
    KARAKTER: {
        label: "Karakter",
        group: "AKADEMIK",
        className: "border-slate-200 bg-slate-50 text-slate-500",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        group: "NON_AKADEMIK",
        className: "border-[#D8B898] bg-[#F8EFE7] text-[#9A6E48]",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        group: "NON_AKADEMIK",
        className: "border-[#A87955] bg-[#F4ECE6] text-[#7A4E2D]",
    },
};

const ALL_PILAR_OPTIONS = [
    { label: "Semua Pilar", value: "ALL" },
    ...Object.entries(PILAR_META).map(([value, meta]) => ({
        label: meta.label,
        value,
    })),
];

const STATUS_STYLE = {
    approval: "border-amber-100 bg-amber-50 text-amber-600",
    sosialisasi: "border-sky-100 bg-sky-50 text-sky-600",
    implementasi: "border-cyan-100 bg-cyan-50 text-[#0AC4E0]",
    evaluasi: "border-violet-100 bg-violet-50 text-violet-600",
    selesai: "border-emerald-100 bg-emerald-50 text-emerald-600",
    default: "border-slate-100 bg-slate-50 text-slate-500",
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    return [];
}

async function fetchSafe(endpointList, headers = {}) {
    for (const endpoint of endpointList) {
        try {
            const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
                headers,
            });
            return response.data;
        } catch (error) {
            console.warn("Endpoint gagal:", endpoint, error?.response?.data || error);
        }
    }
    return [];
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeJenisProgram(value) {
    const raw = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
    if (raw.includes("REGULER")) return "REGULER";
    return "PROJECT";
}

function getJenisProgramLabel(value) {
    const jenis = normalizeJenisProgram(value);
    if (jenis === "REGULER") return "Reguler";
    return "Project";
}

function normalizeBidang(value) {
    const raw = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
    if (raw.includes("NON")) return "NON_AKADEMIK";
    if (raw.includes("AKADEMIK")) return "AKADEMIK";
    return raw || "-";
}

function getBidangLabel(value) {
    const bidang = normalizeBidang(value);
    if (bidang === "AKADEMIK") return "Akademik";
    if (bidang === "NON_AKADEMIK") return "Non Akademik";
    return value || "-";
}

function normalizePilar(programOrValue) {
    const isObject =
        programOrValue && typeof programOrValue === "object";

    const rawValue = isObject
        ? programOrValue?.pilar_program ||
        programOrValue?.pilarProgram ||
        programOrValue?.pilar ||
        programOrValue?.sub_kategori ||
        programOrValue?.subKategori ||
        programOrValue?.kategori_pilar ||
        programOrValue?.kategoriPilar ||
        programOrValue?.raw?.pilar_program ||
        programOrValue?.raw?.pilar ||
        ""
        : programOrValue;

    const raw = String(rawValue || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_")
        .replaceAll("&", "DAN")
        .replace(/_+/g, "_");

    if (raw.includes("KARAKTER") || raw.includes("CHARACTER")) {
        return "KARAKTER";
    }

    if (
        raw.includes("SENI_BUDAYA") ||
        raw.includes("SENI_DAN_BUDAYA") ||
        raw === "SENI"
    ) {
        return "SENI_BUDAYA";
    }

    if (
        raw.includes("KECAKAPAN_HIDUP") ||
        raw.includes("LIFE_SKILL") ||
        raw.includes("LIFESKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }

    if (raw === "AKADEMIK" || raw === "ACADEMIC") {
        return "AKADEMIK";
    }

    if (isObject) {
        const bidang = normalizeBidang(
            programOrValue?.kategori ||
            programOrValue?.kategori_program ||
            programOrValue?.jenis ||
            "",
        );

        return bidang === "NON_AKADEMIK"
            ? "SENI_BUDAYA"
            : "AKADEMIK";
    }

    return "AKADEMIK";
}

function getPilarMeta(programOrValue) {
    const key = normalizePilar(programOrValue);
    return PILAR_META[key] || PILAR_META.AKADEMIK;
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

function getProgramStatus(program) {
    return program?.status_program || program?.status || "Approval";
}

function getStatusClass(status) {
    const key = normalizeText(status);
    return STATUS_STYLE[key] || STATUS_STYLE.default;
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
        school?.nama ||
        school?.name ||
        "-"
    );
}

function getSchoolWilayahName(school) {
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
        "-"
    );
}

function pushProgramSchoolId(ids, value) {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
        value.forEach((item) => pushProgramSchoolId(ids, item));
        return;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (trimmed.includes(",")) {
            trimmed
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => ids.push(item));
            return;
        }
        if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith("{") && trimmed.endsWith("}"))
        ) {
            try {
                pushProgramSchoolId(ids, JSON.parse(trimmed));
                return;
            } catch {
                ids.push(trimmed);
                return;
            }
        }
        ids.push(trimmed);
        return;
    }
    if (typeof value === "object") {
        pushProgramSchoolId(
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

function getProgramSchoolIds(program) {
    const ids = [];
    [
        program?.id_sekolah,
        program?.idSekolah,
        program?.sekolah_id,
        program?.school_id,
        program?.sekolah_ids,
        program?.target_sekolah_ids,
        program?.school_ids,
        program?.sekolah,
        program?.sekolahs,
        program?.schools,
        program?.target_sekolah,
    ].forEach((value) => pushProgramSchoolId(ids, value));
    return [...new Set(ids.map(String).filter(Boolean))];
}

function TableBadge({ children, className = "" }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${className}`}
        >
            {children}
        </span>
    );
}

function StatCard({ label, value, icon, helper }) {
    return (
        <div className="rounded-[1.35rem] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                {icon}
            </div>
            <p className="text-[28px] font-black leading-none tracking-[-0.06em] text-slate-900">
                {value}
            </p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            {helper && (
                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">
                    {helper}
                </p>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-[#0AC4E0]">
                <AlertCircle size={28} />
            </div>
            <h3 className="mt-5 text-[15px] font-black text-slate-800">
                Data program tidak ditemukan
            </h3>
            <p className="mt-2 max-w-md text-[12px] font-semibold leading-6 text-slate-400">
                Coba ubah kata kunci pencarian, jenis program, bidang, atau status yang sedang dipilih.
            </p>
        </div>
    );
}

export default function DaftarProgramPage({ lockedBidang = null }) {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [selectedJenis, setSelectedJenis] = useState("ALL");
    // Jika lockedBidang diberikan, kunci selectedBidang ke nilai tersebut
    const [selectedBidang, setSelectedBidang] = useState(lockedBidang || "ALL");
    const [selectedPilar, setSelectedPilar] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            const [programPayload, sekolahPayload] = await Promise.all([
                fetchSafe(["/program"], headers),
                fetchSafe(["/sekolah"], headers),
            ]);

            const programList = normalizeArray(programPayload)
                .filter((program) => getProgramId(program))
                .sort((a, b) => Number(getProgramId(b)) - Number(getProgramId(a)));

            const schoolList = normalizeArray(sekolahPayload).filter((school) =>
                getSchoolId(school),
            );

            setPrograms(programList);
            setSchools(schoolList);
        } catch (error) {
            console.error("Gagal memuat daftar program:", error);
            setPrograms([]);
            setSchools([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [
        searchValue,
        selectedJenis,
        selectedBidang,
        selectedPilar,
        selectedStatus,
    ]);

    const schoolMap = useMemo(() => {
        const map = new Map();
        schools.forEach((school) => {
            map.set(String(getSchoolId(school)), school);
        });
        return map;
    }, [schools]);

    const pilarOptions = useMemo(() => {
        const locked = normalizeBidang(lockedBidang);

        if (locked === "AKADEMIK") {
            return ALL_PILAR_OPTIONS.filter(
                (item) =>
                    item.value === "ALL" ||
                    PILAR_META[item.value]?.group === "AKADEMIK",
            );
        }

        if (locked === "NON_AKADEMIK") {
            return ALL_PILAR_OPTIONS.filter(
                (item) =>
                    item.value === "ALL" ||
                    PILAR_META[item.value]?.group === "NON_AKADEMIK",
            );
        }

        return ALL_PILAR_OPTIONS;
    }, [lockedBidang]);

    const enrichedPrograms = useMemo(() => {
        return programs.map((program) => {
            const schoolIds = getProgramSchoolIds(program);
            const relatedSchools = schoolIds
                .map((id) => schoolMap.get(String(id)))
                .filter(Boolean);
            const schoolNames =
                relatedSchools.length > 0
                    ? relatedSchools.map(getSchoolName).join(", ")
                    : "-";
            const wilayahNames =
                relatedSchools.length > 0
                    ? [
                        ...new Set(
                            relatedSchools
                                .map(getSchoolWilayahName)
                                .filter(Boolean),
                        ),
                    ].join(", ")
                    : "-";

            return {
                ...program,
                __schoolIds: schoolIds,
                __schools: relatedSchools,
                __schoolNames: schoolNames,
                __wilayahNames: wilayahNames,
                __jenis: normalizeJenisProgram(program?.jenis_program),
                __jenisLabel: getJenisProgramLabel(program?.jenis_program),
                __bidang: normalizeBidang(
                    program?.kategori ||
                    program?.kategori_program ||
                    program?.jenis,
                ),
                __bidangLabel: getBidangLabel(
                    program?.kategori ||
                    program?.kategori_program ||
                    program?.jenis,
                ),
                __pilar: normalizePilar(program),
                __pilarLabel: getPilarMeta(program).label,
                __pilarMeta: getPilarMeta(program),
                __status: getProgramStatus(program),
            };
        });
    }, [programs, schoolMap]);

    const statusOptions = useMemo(() => {
        const unique = [
            ...new Set(
                enrichedPrograms
                    .map((program) => program.__status)
                    .filter(Boolean),
            ),
        ];
        return [
            { label: "Semua Status", value: "ALL" },
            ...unique.map((status) => ({
                label: status,
                value: status,
            })),
        ];
    }, [enrichedPrograms]);

    const filteredPrograms = useMemo(() => {
        const keyword = normalizeText(searchValue);
        return enrichedPrograms.filter((program) => {
            if (selectedJenis !== "ALL" && program.__jenis !== selectedJenis) {
                return false;
            }
            if (selectedBidang !== "ALL" && program.__bidang !== selectedBidang) {
                return false;
            }
            if (selectedPilar !== "ALL" && program.__pilar !== selectedPilar) {
                return false;
            }
            if (selectedStatus !== "ALL" && program.__status !== selectedStatus) {
                return false;
            }
            if (!keyword) return true;
            return [
                getProgramName(program),
                program?.kode_program,
                program?.nomor_mou,
                program?.tahun,
                program.__jenisLabel,
                program.__bidangLabel,
                program.__pilarLabel,
                program.__status,
                program.__schoolNames,
                program.__wilayahNames,
                formatDate(program?.tanggal_mulai),
                formatDate(program?.tanggal_selesai),
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });
    }, [
        enrichedPrograms,
        searchValue,
        selectedJenis,
        selectedBidang,
        selectedPilar,
        selectedStatus,
    ]);

    const totalPage = Math.max(
        1,
        Math.ceil(filteredPrograms.length / ROWS_PER_PAGE),
    );
    const visibleRows = useMemo(() => {
        const start = (page - 1) * ROWS_PER_PAGE;
        return filteredPrograms.slice(start, start + ROWS_PER_PAGE);
    }, [filteredPrograms, page]);

    const currentStart =
        filteredPrograms.length > 0 ? (page - 1) * ROWS_PER_PAGE + 1 : 0;
    const currentEnd = Math.min(
        (page - 1) * ROWS_PER_PAGE + visibleRows.length,
        filteredPrograms.length,
    );

    const pageNumbers = useMemo(() => {
        if (totalPage <= 5) {
            return Array.from({ length: totalPage }, (_, index) => index + 1);
        }

        const first = Math.max(1, Math.min(page - 2, totalPage - 4));
        return Array.from({ length: 5 }, (_, index) => first + index);
    }, [page, totalPage]);

    const summary = useMemo(() => {
        const project = enrichedPrograms.filter(
            (item) => item.__jenis === "PROJECT",
        ).length;
        const reguler = enrichedPrograms.filter(
            (item) => item.__jenis === "REGULER",
        ).length;
        const selesai = enrichedPrograms.filter(
            (item) => normalizeText(item.__status) === "selesai",
        ).length;
        return {
            total: enrichedPrograms.length,
            project,
            reguler,
            selesai,
        };
    }, [enrichedPrograms]);

    if (loading) {
        return (
            <PageWrapper className="flex h-screen w-full overflow-hidden bg-[#F6F8FB] !p-0">
                <Sidebar />
                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                            Memuat daftar program...
                        </p>
                    </div>
                </main>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen w-full overflow-hidden bg-[#F6F8FB] !p-0 font-sans text-slate-800">
            <Sidebar />
            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 border-b border-slate-200 bg-white px-7 py-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                <ClipboardList size={13} /> Head Office
                            </div>
                            <h1 className="text-[28px] font-black tracking-[-0.04em] text-slate-950">
                                Daftar Program
                            </h1>
                            <p className="mt-1 max-w-2xl text-[12px] font-semibold leading-6 text-slate-400">
                                Tabel seluruh program yang berisi jenis program, nama
                                program, sekolah sasaran, wilayah, dan periode
                                pelaksanaan.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchData}
                            disabled={refreshing}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0AC4E0] px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_16px_34px_rgba(10,196,224,0.24)] transition hover:bg-cyan-500 disabled:opacity-60"
                        >
                            <RefreshCcw
                                size={15}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            {refreshing ? "Memuat..." : "Muat Ulang"}
                        </button>
                    </div>
                </header>

                <section className="simple-scroll flex-1 overflow-y-auto px-7 py-6">
                    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Total Program"
                            value={summary.total}
                            helper="Seluruh data program"
                            icon={<ClipboardList size={19} />}
                        />
                        <StatCard
                            label="Project"
                            value={summary.project}
                            helper="Jenis program project"
                            icon={<Tag size={19} />}
                        />
                        <StatCard
                            label="Reguler"
                            value={summary.reguler}
                            helper="Jenis program reguler"
                            icon={<CalendarDays size={19} />}
                        />
                        <StatCard
                            label="Selesai"
                            value={summary.selesai}
                            helper="Status program selesai"
                            icon={<CheckCircle2 size={19} />}
                        />
                    </div>

                    <div className="mb-5 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
                            <div className="relative md:col-span-2 xl:col-span-2">
                                <Search
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
                                />
                                <input
                                    value={searchValue}
                                    onChange={(event) =>
                                        setSearchValue(event.target.value)
                                    }
                                    placeholder="Cari program, pilar, sekolah, wilayah, MOU..."
                                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-[12px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0]/40 focus:bg-white"
                                />
                            </div>

                            <select
                                value={selectedJenis}
                                onChange={(event) =>
                                    setSelectedJenis(event.target.value)
                                }
                                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                            >
                                {JENIS_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            {!lockedBidang && (
                                <select
                                    value={selectedBidang}
                                    onChange={(event) => {
                                        setSelectedBidang(event.target.value);
                                        setSelectedPilar("ALL");
                                    }}
                                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                                >
                                    {BIDANG_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <select
                                value={selectedPilar}
                                onChange={(event) =>
                                    setSelectedPilar(event.target.value)
                                }
                                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                            >
                                {pilarOptions
                                    .filter(
                                        (item) =>
                                            item.value === "ALL" ||
                                            selectedBidang === "ALL" ||
                                            PILAR_META[item.value]?.group === selectedBidang,
                                    )
                                    .map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(event) =>
                                    setSelectedStatus(event.target.value)
                                }
                                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                            >
                                {statusOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center justify-end">
                                <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-4 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                    <Filter size={14} />
                                    {filteredPrograms.length} Data
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredPrograms.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                            <div className="overflow-x-auto">
                                <table className="min-w-[1280px] w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#0AC4E0] text-center text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                            <th className="w-[70px] px-4 py-4">No</th>
                                            <th className="px-4 py-4">Program</th>
                                            <th className="px-4 py-4">Jenis</th>
                                            <th className="px-4 py-4">Bidang</th>
                                            <th className="px-4 py-4">Pilar</th>
                                            <th className="px-4 py-4">Sekolah</th>
                                            <th className="px-4 py-4">Wilayah</th>
                                            <th className="px-4 py-4">
                                                Waktu Mulai
                                            </th>
                                            <th className="px-4 py-4">
                                                Waktu Selesai
                                            </th>
                                            <th className="px-4 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {visibleRows.map((program, index) => {
                                            const rowNumber =
                                                (page - 1) * ROWS_PER_PAGE +
                                                index +
                                                1;
                                            return (
                                                <tr
                                                    key={getProgramId(program)}
                                                    className="text-left transition hover:bg-cyan-50/35"
                                                >
                                                    <td className="px-4 py-4 text-center text-[12px] font-black text-slate-300">
                                                        {String(
                                                            rowNumber,
                                                        ).padStart(2, "0")}
                                                    </td>
                                                    <td className="max-w-[260px] px-4 py-4">
                                                        <p className="line-clamp-2 text-[13px] font-black leading-snug text-slate-900">
                                                            {getProgramName(
                                                                program,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                            {program?.kode_program ||
                                                                `PRG-${getProgramId(
                                                                    program,
                                                                ) || "-"
                                                                }`}
                                                            {program?.tahun
                                                                ? ` · ${program.tahun}`
                                                                : ""}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <TableBadge
                                                            className={
                                                                program.__jenis ===
                                                                    "REGULER"
                                                                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                                                    : "border-cyan-100 bg-cyan-50 text-[#0AC4E0]"
                                                            }
                                                        >
                                                            {
                                                                program.__jenisLabel
                                                            }
                                                        </TableBadge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <TableBadge className="border-slate-100 bg-slate-50 text-slate-500">
                                                            {program.__bidangLabel}
                                                        </TableBadge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <TableBadge
                                                            className={
                                                                program.__pilarMeta
                                                                    ?.className ||
                                                                PILAR_META.AKADEMIK
                                                                    .className
                                                            }
                                                        >
                                                            {program.__pilarLabel}
                                                        </TableBadge>
                                                    </td>
                                                    <td className="max-w-[280px] px-4 py-4">
                                                        <div className="flex items-start gap-2">
                                                            <School
                                                                size={15}
                                                                className="mt-0.5 shrink-0 text-[#0AC4E0]"
                                                            />
                                                            <span className="line-clamp-2 text-[12px] font-bold leading-5 text-slate-600">
                                                                {
                                                                    program.__schoolNames
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="max-w-[220px] px-4 py-4">
                                                        <div className="flex items-start gap-2">
                                                            <MapPin
                                                                size={15}
                                                                className="mt-0.5 shrink-0 text-[#0AC4E0]"
                                                            />
                                                            <span className="line-clamp-2 text-[12px] font-bold leading-5 text-slate-600">
                                                                {
                                                                    program.__wilayahNames
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                                                        {formatDate(
                                                            program?.tanggal_mulai,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                                                        {formatDate(
                                                            program?.tanggal_selesai,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <TableBadge
                                                            className={getStatusClass(
                                                                program.__status,
                                                            )}
                                                        >
                                                            {program.__status}
                                                        </TableBadge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Menampilkan {currentStart}-{currentEnd} dari{" "}
                                        {filteredPrograms.length} data program
                                    </p>
                                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-300">
                                        Maksimal {ROWS_PER_PAGE} data per halaman
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((prev) => Math.max(1, prev - 1))
                                        }
                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={15} /> Prev
                                    </button>

                                    {pageNumbers.map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => setPage(pageNumber)}
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-[10px] font-black transition ${page === pageNumber
                                                    ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-sm"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-cyan-200 hover:text-[#0AC4E0]"
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={page >= totalPage}
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.min(totalPage, prev + 1),
                                            )
                                        }
                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .simple-scroll::-webkit-scrollbar { width: 6px; }
                        .simple-scroll::-webkit-scrollbar-track { background: transparent; }
                        .simple-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.55); border-radius: 999px; }
                        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                    `,
                }}
            />
        </PageWrapper>
    );
}
