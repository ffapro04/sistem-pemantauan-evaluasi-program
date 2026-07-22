/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
    Award,
    BarChart3,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Globe,
    GraduationCap,
    Image,
    Layers,
    Leaf,
    Loader2,
    Mail,
    MapPin,
    MapPinned,
    RefreshCcw,
    School,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
    UsersRound,
    Zap,
    ArrowUpRight,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import ResponsiveContainer from "../../components/charts/SafeResponsiveContainer";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import Dropdown from "../../components/Dropdown";
import { CHART_PALETTE, CHART_STATUS_COLORS } from "../../utils/chartPalette";
import { notify } from "../../utils/popup";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

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
const ROWS_PER_PAGE = 5;
const DASHBOARD_CHART_GROUP_LIMIT = 7;

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const normalizeValue = (value) => {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
};

const normalizeSearch = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ");
};

const isActiveValue = (value) => {
    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true" ||
        String(value).toLowerCase() === "aktif"
    );
};

const getAssetUrl = (logoUrl) => {
    if (!logoUrl) return "";

    const value = String(logoUrl);

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const getJurusanImageUrl = (imagePath) => {
    if (!imagePath) return "";

    const value = String(imagePath).trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
    if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

    return `${API_BASE_URL}/uploads/jurusan/${value}`;
};

const getTokenPayload = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};

const getUserId = (decoded) => {
    return decoded?.sub || decoded?.id_user || decoded?.id || null;
};

const getSekolahIdFromToken = (decoded) => {
    return (
        decoded?.id_sekolah ||
        decoded?.idSekolah ||
        decoded?.sekolah_id ||
        decoded?.schoolId ||
        decoded?.school_id ||
        decoded?.user?.id_sekolah ||
        decoded?.user?.sekolah_id ||
        decoded?.operator?.id_sekolah ||
        decoded?.kepala_sekolah?.id_sekolah ||
        decoded?.guru?.id_sekolah ||
        decoded?.sekolah?.id_sekolah ||
        decoded?.sekolah?.id ||
        decoded?.sekolah?.idSekolah ||
        decoded?.school?.id_sekolah ||
        decoded?.school?.id ||
        null
    );
};

const getSchoolName = (sekolah, user) => {
    return sekolah?.nama_sekolah || user?.nama_sekolah || user?.nama || "Sekolah";
};

const getWilayahObject = (sekolah) => {
    if (sekolah?.wilayah && typeof sekolah.wilayah === "object") {
        return sekolah.wilayah;
    }

    return null;
};

const getKabupatenText = (sekolah) => {
    const wilayah = getWilayahObject(sekolah);

    return (
        sekolah?.nama_kabupaten ||
        wilayah?.nama_wilayah ||
        sekolah?.nama_wilayah ||
        "Kabupaten/Kota belum tersedia"
    );
};

const getProvinsiText = (sekolah) => {
    const wilayah = getWilayahObject(sekolah);

    return (
        wilayah?.parent?.nama_wilayah ||
        wilayah?.parent_wilayah?.nama_wilayah ||
        sekolah?.nama_provinsi ||
        sekolah?.provinsi?.nama_wilayah ||
        sekolah?.provinsi?.nama_provinsi ||
        "Provinsi belum tersedia"
    );
};

const getTahunBinaan = (sekolah) => {
    return (
        sekolah?.tahun_binaan ||
        sekolah?.tahunBinaan ||
        sekolah?.tahun_awal_binaan ||
        sekolah?.wilayah?.tahun_awal_binaan ||
        "-"
    );
};

const getAddressText = (sekolah) => {
    return sekolah?.alamat || "Alamat belum diatur.";
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const getProgramId = (program) => {
    return program?.id_program || program?.id || null;
};

const getProgramTitle = (program) => {
    return program?.nama_program || program?.nama || program?.title || "-";
};

const getProgramCategory = (program) => {
    const value = normalizeValue(
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.sub_kategori ||
        program?.kategori_program ||
        program?.kategori ||
        program?.category ||
        program?.jenis ||
        program?.jenis_kategori ||
        "",
    );

    if (
        value.includes("NON_AKADEMIK") ||
        value.includes("NONAKADEMIK") ||
        value.includes("SENI") ||
        value.includes("BUDAYA") ||
        value.includes("KECAKAPAN") ||
        value.includes("HIDUP")
    ) {
        return "NON_AKADEMIK";
    }

    if (value.includes("AKADEMIK") || value.includes("KARAKTER")) return "AKADEMIK";

    return "LAINNYA";
};

const getProgramCategoryLabel = (value) => {
    if (value === "AKADEMIK") return "Akademik";
    if (value === "NON_AKADEMIK") return "Non Akademik";
    return "Kategori Lainnya";
};

const getProgramType = (program) => {
    const value = normalizeValue(
        program?.jenis_program ||
        program?.jenisProgram ||
        program?.tipe_program ||
        program?.tipeProgram ||
        program?.type_program ||
        program?.type ||
        "",
    );

    if (value.includes("PROJECT")) return "PROJECT";
    if (value.includes("REGULER")) return "REGULER";

    return "LAINNYA";
};

const getProgramTypeLabel = (value) => {
    if (value === "PROJECT") return "Project";
    if (value === "REGULER") return "Reguler";
    return "Lainnya";
};

const getProgramStatus = (program) => {
    return program?.status_program || program?.status || "Berjalan";
};

const getProgramYear = (program) => {
    const direct =
        program?.tahun ||
        program?.tahun_program ||
        program?.year ||
        program?.periode_tahun;

    if (direct) return String(direct);

    const dateValue =
        program?.tanggal_mulai ||
        program?.start_date ||
        program?.mulai ||
        program?.periode_mulai ||
        program?.created_at;

    if (!dateValue) return "-";

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "-" : String(date.getFullYear());
};

const isProgramFinished = (program) => {
    return normalizeSearch(getProgramStatus(program)).includes("selesai");
};

const getProgramStatusTone = (status) => {
    const value = normalizeValue(status);

    if (value.includes("SELESAI")) {
        return {
            color: COLORS.emerald,
            className: "border-emerald-100 bg-emerald-50 text-emerald-600",
        };
    }

    if (value.includes("EVALUASI")) {
        return {
            color: COLORS.violet,
            className: "border-violet-100 bg-violet-50 text-violet-600",
        };
    }

    if (value.includes("IMPLEMENTASI")) {
        return {
            color: COLORS.blue,
            className: "border-blue-100 bg-blue-50 text-blue-600",
        };
    }

    if (value.includes("SOSIALISASI")) {
        return {
            color: COLORS.amber,
            className: "border-amber-100 bg-amber-50 text-amber-600",
        };
    }

    if (value.includes("APPROVAL")) {
        return {
            color: COLORS.cyan,
            className: "border-cyan-100 bg-cyan-50 text-[#0AC4E0]",
        };
    }

    return {
        color: COLORS.slate,
        className: "border-slate-100 bg-slate-50 text-slate-500",
    };
};

const getProgramPeriod = (program) => {
    const start =
        program?.tanggal_mulai ||
        program?.start_date ||
        program?.mulai ||
        program?.periode_mulai;

    const end =
        program?.tanggal_selesai ||
        program?.end_date ||
        program?.selesai ||
        program?.periode_selesai;

    if (!start && !end) return program?.tahun || "-";

    return `${formatDate(start)} - ${formatDate(end)}`;
};

const getVendorName = (program) => {
    return (
        program?.vendor?.nama_vendor ||
        program?.vendors?.[0]?.nama_vendor ||
        program?.vendor_nama ||
        program?.nama_vendor ||
        "-"
    );
};

const getAoName = (program) => {
    return (
        program?.pengawas?.nama ||
        program?.ao?.nama ||
        program?.aos?.[0]?.nama ||
        program?.nama_pengawas ||
        program?.nama_ao ||
        "-"
    );
};

const getProgramCompositionLabel = (program) => {
    return `${getProgramTypeLabel(getProgramType(program))} ${getProgramCategoryLabel(
        getProgramCategory(program),
    )}`;
};

const getProgramCompositionColor = (program) => {
    const type = getProgramType(program);
    const category = getProgramCategory(program);

    if (type === "PROJECT" && category === "AKADEMIK") return COLORS.violet;
    if (type === "PROJECT" && category === "NON_AKADEMIK") return COLORS.pink;
    if (type === "REGULER" && category === "AKADEMIK") return COLORS.cyan;
    if (type === "REGULER" && category === "NON_AKADEMIK") return COLORS.emerald;

    return COLORS.slate;
};

const buildRows = (
    rows,
    getValue,
    fallback = "Lainnya",
    limit = DASHBOARD_CHART_GROUP_LIMIT,
) => {
    const counter = new Map();

    rows.forEach((item) => {
        const key = String(getValue(item) || fallback).trim() || fallback;

        if (!counter.has(key)) {
            counter.set(key, {
                name: key,
                total: 0,
                color: CHART_COLORS[counter.size % CHART_COLORS.length],
            });
        }

        counter.get(key).total += 1;
    });

    const sortedRows = Array.from(counter.values()).sort((a, b) => b.total - a.total);

    if (sortedRows.length <= limit) return sortedRows;

    const mainRows = sortedRows.slice(0, limit - 1);
    const otherTotal = sortedRows
        .slice(limit - 1)
        .reduce((total, row) => total + Number(row.total || 0), 0);

    return [
        ...mainRows,
        {
            name: "Lainnya",
            total: otherTotal,
            color: CHART_COLORS[(limit - 1) % CHART_COLORS.length],
        },
    ];
};

const renderPieLabel = ({ percent }) => {
    if (!percent || percent < 0.08) return "";
    return `${Math.round(percent * 100)}%`;
};

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

function ProgramMetricItem({ label, helper, value, icon, accentClass }) {
    return (
        <div className="group relative flex min-h-[126px] items-center gap-4 px-5 py-5 sm:px-6">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.055)] ${accentClass}`}
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {label}
                </p>

                <div className="mt-1 flex items-end gap-2">
                    <p className="text-3xl font-black leading-none tracking-[-0.07em] text-slate-950">
                        {value}
                    </p>
                    <span className="pb-0.5 text-[10px] font-bold text-slate-400">
                        program
                    </span>
                </div>

                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    {helper}
                </p>
            </div>

            <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-slate-100 sm:hidden" />
        </div>
    );
}

function ProgramPortfolioSummary({ stats }) {
    const totalPrograms = Math.max(
        Number(stats.akademik || 0) + Number(stats.nonAkademik || 0),
        Number(stats.reguler || 0) + Number(stats.project || 0),
        0,
    );

    return (
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)] ring-1 ring-slate-100/80">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Ringkasan Program
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950">
                        Komposisi Program Sekolah
                    </h2>
                </div>

                <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-2 shadow-[0_12px_30px_rgba(10,196,224,0.08)]">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Total
                    </span>
                    <span className="text-lg font-black leading-none text-slate-950">
                        {totalPrograms}
                    </span>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 [&>*:not(:last-child)]:border-slate-100 sm:[&>*:nth-child(odd)]:border-r xl:[&>*:not(:last-child)]:border-r">
                <ProgramMetricItem
                    label="Program Akademik"
                    helper="Kategori akademik"
                    value={stats.akademik}
                    icon={<BookOpen size={18} />}
                    accentClass="text-cyan-600"
                />

                <ProgramMetricItem
                    label="Program Non Akademik"
                    helper="Kategori non akademik"
                    value={stats.nonAkademik}
                    icon={<Sparkles size={18} />}
                    accentClass="text-violet-600"
                />

                <ProgramMetricItem
                    label="Program Reguler"
                    helper="Jenis reguler"
                    value={stats.reguler}
                    icon={<FolderOpen size={18} />}
                    accentClass="text-emerald-600"
                />

                <ProgramMetricItem
                    label="Program Project"
                    helper="Jenis project"
                    value={stats.project}
                    icon={<Target size={18} />}
                    accentClass="text-amber-600"
                />
            </div>
        </section>
    );
}

function ProgramStatusBadge({ status }) {
    const tone = getProgramStatusTone(status);

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${tone.className}`}
        >
            {status}
        </span>
    );
}

function StatusPill({ active }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${active
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                : "bg-red-50 text-red-600 ring-1 ring-red-100"
                }`}
        >
            {active ? "Aktif" : "Nonaktif"}
        </span>
    );
}

function EmptyProgramState() {
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                <FolderOpen size={24} />
            </div>

            <p className="mt-3 text-sm font-black text-slate-700">
                Program belum ditemukan
            </p>

            <p className="mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-400">
                Belum ada program sekolah yang sesuai dengan filter saat ini.
            </p>
        </div>
    );
}

function ProgramCompositionChart({ rows, total }) {
    if (!rows.length) return <EmptyProgramState />;

    return (
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative h-[320px] min-h-[320px] min-w-0 rounded-[1.25rem] border border-slate-100 bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={rows}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={116}
                            paddingAngle={2}
                            stroke="#ffffff"
                            strokeWidth={3}
                            labelLine={false}
                            label={renderPieLabel}
                        >
                            {rows.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Pie>

                        <RechartsTooltip
                            formatter={(value, name) => [
                                `${value} program`,
                                name,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="min-w-0 rounded-[1.25rem] border border-slate-100 bg-white p-5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Total Program
                        </p>
                        <p className="mt-1 text-3xl font-black leading-none tracking-[-0.06em] text-slate-950">
                            {total}
                        </p>
                    </div>
                    <span className="rounded-2xl bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Pie
                    </span>
                </div>

                <div className="mt-4 space-y-3">
                    {rows.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <p className="truncate text-[11px] font-black text-slate-700">
                                    {item.name}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-600 shadow-sm">
                                {item.total}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CredentialItem({ label, value, icon, tone }) {
    const toneClass = {
        cyan: "bg-cyan-100 text-cyan-700",
        blue: "bg-blue-100 text-blue-700",
        indigo: "bg-indigo-100 text-indigo-700",
        emerald: "bg-emerald-100 text-emerald-700",
        amber: "bg-amber-100 text-amber-700",
        slate: "bg-slate-100 text-slate-700",
    }[tone];

    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-black text-slate-800">
                    {value || "-"}
                </span>
            </div>

            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
            >
                {icon}
            </div>
        </div>
    );
}

function JurusanSelector({ jurusanList, selectedJurusanId, selectedJurusan, onChange }) {
    const jurusanItems = [
        {
            value: "",
            label: jurusanList.length ? "Pilih salah satu jurusan" : "Belum ada data jurusan",
        },
        ...jurusanList.map((jurusan) => ({
            value: String(jurusan.id_jurusan),
            label: jurusan.nama_jurusan,
        })),
    ];

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pilih Jurusan
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-black text-slate-800">
                        {selectedJurusan?.nama_jurusan || "Belum memilih jurusan"}
                    </span>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Layers size={15} />
                </div>
            </div>

            <div className="mt-4">
                <Dropdown
                    value={selectedJurusanId}
                    onChange={onChange}
                    items={jurusanItems}
                    placeholder={jurusanItems[0].label}
                    disabled={!jurusanList.length}
                />
            </div>

            {selectedJurusan && (
                <div className="mt-4 rounded-2xl border border-violet-100 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isActiveValue(selectedJurusan.status)
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                                }`}
                        >
                            {isActiveValue(selectedJurusan.status) ? "Aktif" : "Nonaktif"}
                        </span>
                    </div>

                    <h4 className="mt-3 text-base font-black leading-snug text-slate-900">
                        {selectedJurusan.nama_jurusan}
                    </h4>

                    <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                        {selectedJurusan.deskripsi ||
                            "Belum ada deskripsi jurusan. Tambahkan deskripsi melalui Master Jurusan."}
                    </p>
                </div>
            )}
        </div>
    );
}

function GeoItem({ icon, label, value, color }) {
    const toneClass = {
        blue: "bg-blue-50 text-blue-600",
        cyan: "bg-cyan-50 text-cyan-600",
        slate: "bg-slate-50 text-slate-600",
        amber: "bg-amber-50 text-amber-600",
    }[color];

    return (
        <div className="flex items-center gap-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:first:border-l-0 md:first:pl-0">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
                <span className="mt-0.5 block truncate text-xs font-black text-slate-800">
                    {value || "-"}
                </span>
            </div>
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
                {value || "-"}
            </p>
        </div>
    );
}

function ProgramSelectFilter({ value, onChange, items, label }) {
    return (
        <Dropdown
            value={value}
            onChange={onChange}
            items={items}
            placeholder={label}
            width="w-full"
        />
    );
}

function ProgramPagination({ page, totalPages, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChange(Math.max(1, page - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={14} />
            </button>
            <span className="rounded-xl bg-[#0AC4E0] px-4 py-2 text-[10px] font-black text-white">
                {page} / {totalPages}
            </span>
            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

function ProgramListTable({ programs }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(programs.length / ROWS_PER_PAGE));
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    const visible = programs.slice(startIndex, startIndex + ROWS_PER_PAGE);

    useEffect(() => {
        setPage(1);
    }, [programs]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    if (!programs.length) return <EmptyProgramState />;

    return (
        <div className="overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            {["No", "Program", "Kategori", "Periode", "Pelaksana", "Status"].map((head) => (
                                <th
                                    key={head}
                                    className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((program, index) => {
                            const category = getProgramCategory(program);
                            const type = getProgramType(program);
                            return (
                                <tr
                                    key={getProgramId(program) || `${startIndex}-${index}`}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/30"
                                >
                                    <td className="px-4 py-4 text-[10px] font-black text-slate-300">
                                        {String(startIndex + index + 1).padStart(2, "0")}
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="line-clamp-2 text-[12px] font-black leading-5 text-slate-950">
                                            {getProgramTitle(program)}
                                        </p>
                                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            PRG-{getProgramId(program) || "-"} Â· Tahun {getProgramYear(program)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                {getProgramCategoryLabel(category)}
                                            </span>
                                            <span className="rounded-full bg-slate-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                {getProgramTypeLabel(type)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-[11px] font-bold text-slate-600">
                                        {getProgramPeriod(program)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-[11px] font-black text-slate-700">
                                            {getVendorName(program)}
                                        </p>
                                        <p className="mt-1 text-[9px] font-bold text-slate-400">
                                            AO: {getAoName(program)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <ProgramStatusBadge status={getProgramStatus(program)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + ROWS_PER_PAGE, programs.length)} dari {programs.length} program
                </p>
                <ProgramPagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
        </div>
    );
}

function ProgramCard({ program }) {
    const category = getProgramCategory(program);
    const type = getProgramType(program);
    const status = getProgramStatus(program);

    return (
        <article className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-slate-200/70">
            <div
                className="h-2 w-full"
                style={{
                    background:
                        category === "AKADEMIK"
                            ? `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.blue})`
                            : `linear-gradient(90deg, ${COLORS.violet}, ${COLORS.pink})`,
                }}
            />

            <div className="p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                        className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white"
                        style={{
                            backgroundColor:
                                category === "AKADEMIK"
                                    ? COLORS.cyan
                                    : COLORS.violet,
                        }}
                    >
                        {getProgramCategoryLabel(category)}
                    </span>

                    <span
                        className="rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest"
                        style={{
                            borderColor:
                                type === "PROJECT" ? "#DDD6FE" : "#BBF7D0",
                            backgroundColor:
                                type === "PROJECT" ? "#F5F3FF" : "#F0FDF4",
                            color:
                                type === "PROJECT"
                                    ? COLORS.violet
                                    : COLORS.emerald,
                        }}
                    >
                        {getProgramTypeLabel(type)}
                    </span>

                    <ProgramStatusBadge status={status} />
                </div>

                <h3 className="line-clamp-2 min-h-[42px] text-[16px] font-black leading-snug tracking-[-0.03em] text-slate-900">
                    {getProgramTitle(program)}
                </h3>

                {program?.tahun && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Tahun {program.tahun}
                    </p>
                )}

                <div className="mt-4 space-y-2 rounded-[1.25rem] bg-slate-50 p-4">
                    <InfoRow label="Periode" value={getProgramPeriod(program)} />
                    <InfoRow label="AO" value={getAoName(program)} />
                    <InfoRow label="Vendor" value={getVendorName(program)} />

                    <InfoRow
                        label="KPI"
                        value={
                            program?.kpi_nama
                                ? `${program.kpi_nama} ${program.kpi_target || ""} ${program.kpi_satuan || ""}`
                                : "-"
                        }
                    />
                </div>

                <Link
                    to={`/sekolah/program/detail/${getProgramId(program)}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                >
                    Lihat Detail Program
                    <ArrowUpRight size={14} />
                </Link>
            </div>
        </article>
    );
}

export default function DashboardSekolah() {
    const [user, setUser] = useState(null);
    const [sekolah, setSekolah] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [guruList, setGuruList] = useState([]);
    const [loadingSekolah, setLoadingSekolah] = useState(false);
    const [loadingProgram, setLoadingProgram] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [yearFilter, setYearFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [jurusanList, setJurusanList] = useState([]);
    const [selectedJurusanId, setSelectedJurusanId] = useState("");
    const [activeJurusanIndex, setActiveJurusanIndex] = useState(0);
    const [loadingJurusan, setLoadingJurusan] = useState(false);
    const [editingJumlahSiswa, setEditingJumlahSiswa] = useState(false);
    const [jumlahSiswaDraft, setJumlahSiswaDraft] = useState("");
    const [savingJumlahSiswa, setSavingJumlahSiswa] = useState(false);
    const idSekolahAktif = useMemo(() => getSekolahIdFromToken(user), [user]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.warn("Gagal decode token:", error);
            }
        }
    }, []);

    const fetchSekolah = async () => {
        const idSekolah = Number(idSekolahAktif || 0);

        if (!idSekolah) return;

        try {
            setLoadingSekolah(true);

            const response = await axios.get(
                `${API_BASE_URL}/sekolah/${idSekolah}?_t=${Date.now()}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                },
            );

            setSekolah(response.data?.data || response.data);
        } catch (error) {
            console.warn("Gagal mengambil detail sekolah:", error);
            setSekolah(null);
        } finally {
            setLoadingSekolah(false);
        }
    };

    const fetchProgramSekolah = async () => {
        const idSekolah = Number(idSekolahAktif || 0);

        if (!idSekolah) return;

        try {
            setLoadingProgram(true);

            const response = await axios.get(
                `${API_BASE_URL}/program/sekolah/${idSekolah}?id_user=${getUserId(user) || ""}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );

            setPrograms(normalizeArray(response.data));
        } catch (error) {
            console.warn("Gagal mengambil program sekolah:", error);
            setPrograms([]);
        } finally {
            setLoadingProgram(false);
        }
    };

    const fetchGuruSekolah = async () => {
        const idSekolah = Number(idSekolahAktif || 0);

        if (!idSekolah) return;

        try {
            const response = await axios.get(
                `${API_BASE_URL}/assessment-guru/sekolah/${idSekolah}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );

            setGuruList(normalizeArray(response.data));
        } catch (error) {
            console.warn("Gagal mengambil guru sekolah:", error);
            setGuruList([]);
        }
    };

    const fetchJurusanSekolah = async () => {
        const idSekolah = Number(idSekolahAktif || 0);

        if (!idSekolah) return;

        try {
            setLoadingJurusan(true);

            const response = await axios.get(
                `${API_BASE_URL}/jurusan/sekolah/${idSekolah}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );

            const rows = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setJurusanList(rows);

            if (rows.length > 0) {
                setSelectedJurusanId(String(rows[0].id_jurusan));
            }
        } catch (error) {
            console.warn("Gagal mengambil jurusan sekolah:", error);
            setJurusanList([]);
            setSelectedJurusanId("");
        } finally {
            setLoadingJurusan(false);
        }
    };

    const refreshDashboard = async () => {
        if (!Number(idSekolahAktif || 0)) return;

        await Promise.all([
            fetchSekolah(),
            fetchProgramSekolah(),
            fetchGuruSekolah(),
            fetchJurusanSekolah(),
        ]);
    };

    useEffect(() => {
        refreshDashboard();
    }, [idSekolahAktif]);

    const roleId = Number(user?.id_role);
    const isGuru = roleId === 8;
    const isOperator = roleId === 5 || roleId === 9;
    const active = isActiveValue(sekolah?.status);

    const jenjang = String(
        sekolah?.jenjang ||
        user?.jenjang ||
        user?.sekolah?.jenjang ||
        user?.school?.jenjang ||
        "",
    ).toUpperCase();
    const isSmkSekolah = jenjang === "SMK" || jenjang.includes("SMK");

    useEffect(() => {
        if (!Number(idSekolahAktif || 0)) return;

        if (!isSmkSekolah) {
            setJurusanList([]);
            setSelectedJurusanId("");
            setActiveJurusanIndex(0);
            return;
        }

        fetchJurusanSekolah();
    }, [idSekolahAktif, isSmkSekolah]);

    useEffect(() => {
        if (jurusanList.length <= 1) return undefined;

        const timer = window.setInterval(() => {
            setActiveJurusanIndex((currentIndex) => (currentIndex + 1) % jurusanList.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [jurusanList.length]);

    useEffect(() => {
        if (!jurusanList.length) {
            setActiveJurusanIndex(0);
            return;
        }

        if (activeJurusanIndex >= jurusanList.length) {
            setActiveJurusanIndex(0);
        }
    }, [activeJurusanIndex, jurusanList.length]);

    const roleLabel = isGuru
        ? "Guru Assessment"
        : isOperator
            ? "Operator Sekolah"
            : "Sekolah";

    const schoolName = getSchoolName(sekolah, user);
    const logoUrl = getAssetUrl(
        sekolah?.logo_url ||
        sekolah?.logo ||
        sekolah?.logo_sekolah ||
        sekolah?.foto_logo,
    );

    const selectedJurusan = useMemo(() => {
        return jurusanList.find(
            (item) => String(item.id_jurusan) === String(selectedJurusanId),
        );
    }, [jurusanList, selectedJurusanId]);

    const selectedJurusanTeachers = useMemo(() => {
        if (!selectedJurusanId) return [];

        return guruList.filter((guru) => {
            const guruJurusanId =
                guru?.id_jurusan ||
                guru?.jurusan_data?.id_jurusan ||
                guru?.jurusan?.id_jurusan ||
                "";

            return String(guruJurusanId) === String(selectedJurusanId);
        });
    }, [guruList, selectedJurusanId]);

    const activeJurusanIndexSafe = jurusanList.length
        ? Math.min(activeJurusanIndex, jurusanList.length - 1)
        : 0;

    const activeJurusan = jurusanList[activeJurusanIndexSafe] || null;
    const activeJurusanImage = getJurusanImageUrl(
        activeJurusan?.gambar_jurusan ||
        activeJurusan?.gambar_jurusan_url ||
        activeJurusan?.image_url ||
        activeJurusan?.foto_jurusan ||
        activeJurusan?.thumbnail ||
        activeJurusan?.gambar ||
        activeJurusan?.foto,
    );

    const programStats = useMemo(() => {
        const stats = programs.reduce(
            (acc, program) => {
                const category = getProgramCategory(program);
                const type = getProgramType(program);
                const status = normalizeValue(getProgramStatus(program));

                if (category === "AKADEMIK") acc.akademik += 1;
                else if (category === "NON_AKADEMIK") acc.nonAkademik += 1;

                if (type === "PROJECT") acc.project += 1;
                else if (type === "REGULER") acc.reguler += 1;

                if (status.includes("SELESAI")) acc.done += 1;
                else acc.active += 1;

                return acc;
            },
            {
                akademik: 0,
                nonAkademik: 0,
                project: 0,
                reguler: 0,
                active: 0,
                done: 0,
            },
        );

        return {
            ...stats,
            total: programs.length,
            completed: stats.done,
        };
    }, [programs]);

    const yearOptions = useMemo(() => {
        const years = [...new Set(programs.map(getProgramYear).filter((year) => year && year !== "-"))]
            .sort((a, b) => Number(b) - Number(a));

        return [
            { value: "ALL", label: "Semua Tahun" },
            ...years.map((year) => ({ value: year, label: year })),
        ];
    }, [programs]);

    const filteredPrograms = useMemo(() => {
        const search = normalizeSearch(keyword);

        return programs.filter((program) => {
            const category = getProgramCategory(program);
            const type = getProgramType(program);
            const year = getProgramYear(program);

            const matchCategory =
                categoryFilter === "ALL" || category === categoryFilter;

            const matchType = typeFilter === "ALL" || type === typeFilter;
            const matchYear = yearFilter === "ALL" || String(year) === String(yearFilter);
            const matchStatus =
                statusFilter === "ALL" ||
                (statusFilter === "SELESAI"
                    ? isProgramFinished(program)
                    : !isProgramFinished(program));

            const matchSearch =
                !search ||
                normalizeSearch(
                    [
                        getProgramTitle(program),
                        program?.pilar_program,
                        program?.sub_kategori,
                        program?.kategori_program,
                        program?.kategori,
                        program?.jenis_program,
                        program?.tahun,
                        getProgramStatus(program),
                        getVendorName(program),
                        getAoName(program),
                    ]
                        .filter(Boolean)
                        .join(" "),
                ).includes(search);

            return matchCategory && matchType && matchYear && matchStatus && matchSearch;
        });
    }, [programs, categoryFilter, typeFilter, yearFilter, statusFilter, keyword]);

    const compositionRows = useMemo(() => {
        return buildRows(filteredPrograms, getProgramCompositionLabel).map((row) => {
            const sample = filteredPrograms.find(
                (program) => getProgramCompositionLabel(program) === row.name,
            );

            return {
                ...row,
                color: sample ? getProgramCompositionColor(sample) : row.color,
            };
        });
    }, [filteredPrograms]);

    const handleStartEditJumlahSiswa = () => {
        setJumlahSiswaDraft(String(sekolah?.jumlah_siswa ?? 0));
        setEditingJumlahSiswa(true);
    };

    const handleCancelEditJumlahSiswa = () => {
        if (savingJumlahSiswa) return;

        setJumlahSiswaDraft("");
        setEditingJumlahSiswa(false);
    };

    const handleSaveJumlahSiswa = async () => {
        const nextValue = Number(jumlahSiswaDraft);

        if (!Number.isInteger(nextValue) || nextValue < 0) {
            notify.warning("Jumlah siswa harus berupa angka minimal 0.");
            return;
        }

        const previousValue = Number(sekolah?.jumlah_siswa ?? 0);

        if (nextValue === previousValue) {
            setJumlahSiswaDraft("");
            setEditingJumlahSiswa(false);
            return;
        }

        try {
            setSavingJumlahSiswa(true);

            await axios.patch(
                `${API_BASE_URL}/sekolah/operator/jumlah-siswa`,
                { jumlah_siswa: nextValue },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );

            setSekolah((prev) => ({
                ...prev,
                jumlah_siswa: nextValue,
            }));

            setJumlahSiswaDraft("");
            setEditingJumlahSiswa(false);
        } catch (error) {
            console.error("Gagal update jumlah siswa:", error);
            notify.error(
                error?.response?.data?.message ||
                "Gagal memperbarui jumlah siswa.",
            );
        } finally {
            setSavingJumlahSiswa(false);
        }
    };

    const resetFilter = () => {
        setCategoryFilter("ALL");
        setTypeFilter("ALL");
        setYearFilter("ALL");
        setStatusFilter("ALL");
        setKeyword("");
    };

    const isLoading = loadingSekolah || loadingProgram || loadingJurusan;
    const showLegacySchoolOverview = false;

    return (
        <MasterPageShell
            title="Overview"
            highlight="Hub Kelembagaan"
            subtitle="Sistem Monitoring dan Evaluasi Mutu Pendidikan Indonesia"
        >
            <div className="relative h-full overflow-y-auto no-scrollbar bg-[#F8FBFF] selection:bg-cyan-500 selection:text-white">
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[420px] bg-gradient-to-b from-cyan-50 via-white to-[#F8FBFF]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,196,224,0.16),transparent_48%)]" />

                    <svg
                        className="absolute bottom-0 h-32 w-full translate-y-1 transform"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill="rgba(10,196,224,0.08)"
                            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        />
                        <path
                            fill="#F8FBFF"
                            d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,197.3C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                        />
                    </svg>
                </div>

                <div className="relative z-10 px-10 py-10">
                    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                Operator Sekolah Workspace
                            </p>

                            <h1 className="mt-1 text-[28px] font-black tracking-[-0.035em] text-slate-950">
                                Dashboard Profil Sekolah
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={refreshDashboard}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-white px-5 text-xs font-black uppercase tracking-widest text-[#0AC4E0] shadow-[0_12px_30px_rgba(10,196,224,0.10)] transition hover:border-cyan-200 hover:shadow-[0_16px_34px_rgba(10,196,224,0.16)]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={15} />
                            ) : (
                                <RefreshCcw size={15} />
                            )}
                            Refresh
                        </button>
                    </div>

                    <section className="mb-6 grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
                        <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-100 bg-white p-7 shadow-[0_28px_80px_rgba(15,23,42,0.09)] ring-1 ring-white">
                            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-100/55 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-28 left-12 h-52 w-52 rounded-full bg-sky-100/60 blur-3xl" />

                            <div className="relative grid gap-6 lg:grid-cols-[190px_1fr] lg:items-center">
                                <div className="flex justify-center lg:justify-start">
                                    <div className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] border border-cyan-100 bg-white shadow-[0_26px_54px_rgba(10,196,224,0.14)]">
                                        {logoUrl ? (
                                            <img
                                                src={logoUrl}
                                                alt={`Logo ${schoolName}`}
                                                className="max-h-32 max-w-[132px] object-contain"
                                            />
                                        ) : (
                                            <School size={58} className="text-[#0AC4E0]" />
                                        )}
                                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-100 bg-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#0AC4E0] shadow-[0_12px_28px_rgba(10,196,224,0.12)]">
                                            Logo Resmi
                                        </span>
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                            Profil Sekolah
                                        </span>
                                        <StatusPill active={active} />
                                    </div>

                                    <h2 className="mt-4 break-words text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 lg:text-5xl">
                                        {schoolName}
                                    </h2>

                                    <div className="mt-4 flex min-w-0 items-center gap-2 text-sm font-bold text-slate-500">
                                        <Mail size={16} className="shrink-0 text-[#0AC4E0]" />
                                        <span className="truncate">
                                            {sekolah?.email_login || user?.email || "Email belum tersedia"}
                                        </span>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-[1.4rem] border border-slate-100 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                NPSN
                                            </p>
                                            <p className="mt-2 text-base font-black text-slate-950">
                                                {sekolah?.npsn || "Belum tersedia"}
                                            </p>
                                        </div>
                                        <div className="rounded-[1.4rem] border border-slate-100 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                Jenjang
                                            </p>
                                            <p className="mt-2 text-base font-black text-slate-950">
                                                {jenjang || "Belum tersedia"}
                                            </p>
                                        </div>
                                        <div className="rounded-[1.4rem] border border-cyan-100 bg-cyan-50/70 p-4 shadow-[0_14px_32px_rgba(10,196,224,0.08)]">
                                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">
                                                Kategori Binaan
                                            </p>
                                            <p className="mt-2 text-base font-black text-slate-950">
                                                {sekolah?.akreditasi_internal ||
                                                    sekolah?.kategori_binaan ||
                                                    sekolah?.level_binaan ||
                                                    "Dasar"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                { label: "Total Program", value: programStats.total, helper: "Semua program", tone: "cyan" },
                                { label: "Akademik", value: programStats.akademik, helper: "Program akademik", tone: "emerald" },
                                { label: "Non Akademik", value: programStats.nonAkademik, helper: "Program karakter", tone: "violet" },
                                { label: "Selesai", value: programStats.completed, helper: "Progress selesai", tone: "sky" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="relative overflow-hidden rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-[0_22px_58px_rgba(15,23,42,0.07)]"
                                >
                                    <div className="absolute right-4 top-4 h-12 w-12 rounded-2xl bg-cyan-50" />
                                    <p className="relative text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                        {item.label}
                                    </p>
                                    <p className="relative mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                                        {item.value || 0}
                                    </p>
                                    <p className="relative mt-1 text-xs font-bold text-slate-500">
                                        {item.helper}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-10 grid items-stretch gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                        <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_26px_72px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
                            <div className="border-b border-slate-100 px-7 py-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                    Operasional Sekolah
                                </p>
                                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">
                                    Kapasitas, wilayah, dan kredensial.
                                </h3>
                            </div>

                            <div className="grid gap-0 sm:grid-cols-2">
                                <div className="border-b border-slate-100 p-6 sm:border-r">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        Total Pengajar
                                    </p>
                                    <div className="mt-3 flex items-end gap-2">
                                        <span className="text-5xl font-black tracking-[-0.06em] text-slate-950">
                                            {sekolah?.jumlah_guru || 0}
                                        </span>
                                        <span className="pb-2 text-xs font-black uppercase tracking-widest text-[#0AC4E0]">
                                            Guru
                                        </span>
                                    </div>
                                </div>

                                <div className="border-b border-slate-100 p-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        Siswa Aktif
                                    </p>
                                    <div className="mt-3 flex items-end gap-2">
                                        {editingJumlahSiswa ? (
                                            <input
                                                autoFocus
                                                type="number"
                                                min="0"
                                                value={jumlahSiswaDraft}
                                                disabled={savingJumlahSiswa}
                                                onChange={(event) => setJumlahSiswaDraft(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") {
                                                        event.preventDefault();
                                                        handleSaveJumlahSiswa();
                                                    }

                                                    if (event.key === "Escape") {
                                                        event.preventDefault();
                                                        handleCancelEditJumlahSiswa();
                                                    }
                                                }}
                                                onBlur={handleCancelEditJumlahSiswa}
                                                className="h-14 w-32 rounded-2xl border border-cyan-100 bg-white px-3 text-center text-4xl font-black tracking-[-0.06em] text-slate-950 outline-none transition focus:border-[#0AC4E0] focus:ring-4 focus:ring-cyan-100 disabled:cursor-wait disabled:opacity-70"
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleStartEditJumlahSiswa}
                                                className="rounded-2xl px-2 text-5xl font-black tracking-[-0.06em] text-slate-950 transition hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-95"
                                                title="Klik untuk mengubah jumlah siswa"
                                            >
                                                {sekolah?.jumlah_siswa || 0}
                                            </button>
                                        )}
                                        <span className="pb-2 text-xs font-black uppercase tracking-widest text-[#0AC4E0]">
                                            Siswa
                                        </span>
                                    </div>
                                </div>

                                {[
                                    ["Kabupaten/Kota", getKabupatenText(sekolah)],
                                    ["Provinsi", getProvinsiText(sekolah)],
                                    ["Akreditasi", sekolah?.akreditasi || "Belum Terakreditasi"],
                                    ["Tahun Binaan", getTahunBinaan(sekolah)],
                                    ["Sertifikat ISO", sekolah?.sertifikat_iso || "Belum"],
                                    ["Jumlah Jurusan", `${jurusanList.length} Jurusan`],
                                ].map(([label, value]) => (
                                    <div key={label} className="border-b border-slate-100 px-6 py-5 odd:sm:border-r">
                                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                            {label}
                                        </p>
                                        <p className="mt-2 text-sm font-black leading-6 text-slate-900">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                    Alamat Operasional
                                </p>
                                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                                    {getAddressText(sekolah)}
                                </p>
                            </div>
                        </div>

                        {jurusanList.length ? (
                            <div
                                key={activeJurusan?.id_jurusan || activeJurusanIndexSafe}
                                className="jurusan-carousel-card h-full overflow-hidden rounded-[2rem] border border-cyan-100 bg-white shadow-[0_22px_54px_rgba(10,196,224,0.12)] transition duration-500"
                            >
                                <div className="grid h-full min-h-[360px] lg:grid-cols-[1.05fr_1fr]">
                                    <div className="relative min-h-[260px] overflow-hidden bg-cyan-50/70 lg:min-h-0">
                                        {activeJurusanImage ? (
                                            <img
                                                src={activeJurusanImage}
                                                alt={activeJurusan?.nama_jurusan || "Gambar jurusan"}
                                                className="h-full min-h-[260px] w-full object-cover lg:min-h-0"
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-8 text-center lg:min-h-0">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-cyan-100 bg-white text-[#0AC4E0] shadow-[0_16px_34px_rgba(10,196,224,0.14)]">
                                                    <Image size={30} />
                                                </div>
                                                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#0AC4E0]">
                                                    Gambar Jurusan
                                                </p>
                                                <p className="mt-2 max-w-sm text-xs font-semibold leading-6 text-slate-500">
                                                    Belum ada gambar. Operator bisa mengisi gambar dari master jurusan.
                                                </p>
                                            </div>
                                        )}

                                        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                                            {String(activeJurusanIndexSafe + 1).padStart(2, "0")} / {String(jurusanList.length).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 flex-col justify-center p-7 lg:p-10">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">
                                                    Jurusan {String(activeJurusanIndexSafe + 1).padStart(2, "0")}
                                                </span>
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${isActiveValue(activeJurusan?.status)
                                                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                                        : "border-slate-100 bg-slate-50 text-slate-400"
                                                        }`}
                                                >
                                                    {isActiveValue(activeJurusan?.status) ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-[34px]">
                                                {activeJurusan?.nama_jurusan || "Nama jurusan belum tersedia"}
                                            </h3>
                                            <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-500">
                                                {activeJurusan?.deskripsi ||
                                                    "Caption jurusan belum diisi. Tambahkan deskripsi singkat di master jurusan agar dashboard sekolah terasa lebih informatif."}
                                            </p>
                                        </div>

                                        <div className="mt-7 flex flex-wrap items-center gap-2">
                                                {jurusanList.map((jurusan, index) => (
                                                    <button
                                                        key={jurusan.id_jurusan || jurusan.nama_jurusan || index}
                                                        type="button"
                                                        onClick={() => setActiveJurusanIndex(index)}
                                                        aria-label={`Tampilkan jurusan ${index + 1}`}
                                                        className={`h-2.5 rounded-full transition-all ${index === activeJurusanIndexSafe
                                                            ? "w-9 bg-[#0AC4E0]"
                                                            : "w-2.5 bg-slate-200 hover:bg-cyan-200"
                                                        }`}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[260px] items-center justify-center rounded-[2rem] border border-dashed border-cyan-100 bg-white p-6 text-center shadow-[0_20px_48px_rgba(10,196,224,0.08)]">
                                <div>
                                    <Layers size={34} className="mx-auto text-[#0AC4E0]" />
                                    <p className="mt-4 text-sm font-black text-slate-900">
                                        Belum ada jurusan.
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        Data jurusan akan tampil otomatis setelah diatur oleh operator sekolah.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {showLegacySchoolOverview && (
                    <section className="hidden">
                        <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
                            <div className="flex w-full shrink-0 flex-col items-center justify-center lg:w-40">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={`Logo ${schoolName}`}
                                        className="max-h-28 max-w-[140px] object-contain drop-shadow-[0_18px_24px_rgba(15,23,42,0.12)] sm:max-h-32 sm:max-w-[160px]"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-cyan-100 bg-white text-[#0AC4E0] shadow-[0_18px_38px_rgba(10,196,224,0.12)]">
                                        <School size={42} />
                                    </div>
                                )}

                                <span className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.18em] text-slate-300">
                                    Logo dikelola Admin
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 border-b border-cyan-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        <School size={12} />
                                        Profil Sekolah
                                    </span>

                                    <StatusPill active={active} />
                                </div>

                                <h1 className="mt-4 break-words text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                    {schoolName}
                                </h1>

                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                    <Mail size={16} className="shrink-0 text-[#0AC4E0]" />
                                    <span className="truncate">
                                        {sekolah?.email_login || user?.email || "Email belum tersedia"}
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.045)]">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                                            NPSN
                                        </p>
                                        <p className="mt-1 text-sm font-black text-slate-950">
                                            {sekolah?.npsn || "Belum tersedia"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.045)]">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                                            Jenjang
                                        </p>
                                        <p className="mt-1 text-sm font-black text-slate-950">
                                            {jenjang || "Belum tersedia"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(10,196,224,0.08)]">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">
                                            Kategori Binaan
                                        </p>
                                        <p className="mt-1 text-sm font-black text-slate-950">
                                            {sekolah?.akreditasi_internal ||
                                                sekolah?.kategori_binaan ||
                                                sekolah?.level_binaan ||
                                                "Dasar"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    )}

                    {showLegacySchoolOverview && (
                    <div className="hidden">
                        <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)] ring-1 ring-slate-100/80">
                            <div className="flex flex-col gap-4 border-b border-slate-100 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        Data Resmi Sekolah
                                    </p>
                                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900 sm:text-2xl">
                                        Identitas, Wilayah, dan Kredensial
                                    </h2>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        Ringkasan data utama sekolah berdasarkan master data terbaru.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Status Data
                                    </span>
                                    <StatusPill active={active} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
                                <div className="border-b border-slate-100 p-7 lg:border-b-0 lg:border-r">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-[#0AC4E0] shadow-[0_12px_26px_rgba(10,196,224,0.12)]">
                                            <UsersRound size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">
                                                Kapasitas Sumber Daya Manusia
                                            </h3>
                                            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                                                Jumlah guru dan siswa berdasarkan master sekolah.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.045)]">
                                        <div className="p-5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Total Pengajar
                                            </p>
                                            <div className="mt-2 flex items-end gap-2">
                                                <span className="text-3xl font-black tracking-[-0.05em] text-slate-900">
                                                    {sekolah?.jumlah_guru || 0}
                                                </span>
                                                <span className="pb-1 text-xs font-bold text-[#0AC4E0]">
                                                    Guru
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-l border-slate-100 p-5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Siswa Aktif
                                            </p>

                                            <div className="mt-2 flex items-end gap-2">
                                                {editingJumlahSiswa ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        min="0"
                                                        value={jumlahSiswaDraft}
                                                        disabled={savingJumlahSiswa}
                                                        onChange={(event) =>
                                                            setJumlahSiswaDraft(event.target.value)
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter") {
                                                                event.preventDefault();
                                                                handleSaveJumlahSiswa();
                                                            }

                                                            if (event.key === "Escape") {
                                                                event.preventDefault();
                                                                handleCancelEditJumlahSiswa();
                                                            }
                                                        }}
                                                        onBlur={handleCancelEditJumlahSiswa}
                                                        className="h-10 w-24 rounded-2xl border border-cyan-100 bg-white px-3 text-center text-3xl font-black tracking-[-0.05em] text-slate-900 outline-none transition focus:border-[#0AC4E0] focus:ring-4 focus:ring-cyan-100 disabled:cursor-wait disabled:opacity-70"
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleStartEditJumlahSiswa}
                                                        className="rounded-2xl px-2 text-3xl font-black tracking-[-0.05em] text-slate-900 transition hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-95"
                                                        title="Klik untuk mengubah jumlah siswa"
                                                    >
                                                        {sekolah?.jumlah_siswa || 0}
                                                    </button>
                                                )}

                                                <span className="pb-1 text-xs font-bold text-blue-600">
                                                    Siswa
                                                </span>
                                            </div>

                                            <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                                Klik angka, lalu tekan Enter
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 border-t border-slate-100 pt-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                            Wilayah dan Alamat
                                        </h3>

                                        <div className="mt-4 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <MapPinned size={16} className="mt-0.5 shrink-0 text-blue-500" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        Kabupaten/Kota
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                                        {getKabupatenText(sekolah)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Globe size={16} className="mt-0.5 shrink-0 text-cyan-500" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        Provinsi
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                                        {getProvinsiText(sekolah)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        Alamat Operasional
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                                        {getAddressText(sekolah)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-[#0AC4E0] shadow-[0_12px_26px_rgba(10,196,224,0.12)]">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">
                                                Sertifikasi dan Kualifikasi Mutu
                                            </h3>
                                            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                                                Kredensial utama serta jurusan yang tersedia di sekolah.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.04)] sm:grid-cols-3">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Akreditasi Nasional
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {sekolah?.akreditasi || "Belum Terakreditasi"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Level Binaan
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {sekolah?.akreditasi_internal || "Dasar"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Tahun Binaan
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {getTahunBinaan(sekolah)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Sertifikat ISO
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {sekolah?.sertifikat_iso || "Belum"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Jumlah Jurusan
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {jurusanList.length} Jurusan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Pilih Jurusan
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                    Lihat informasi jurusan yang terdaftar di sekolah.
                                                </p>
                                            </div>
                                            <Layers size={18} className="shrink-0 text-[#0AC4E0]" />
                                        </div>

                                        <div className="mt-4">
                                            <Dropdown
                                                value={selectedJurusanId}
                                                onChange={setSelectedJurusanId}
                                                items={[
                                                    {
                                                        value: "",
                                                        label: jurusanList.length
                                                            ? "Pilih salah satu jurusan"
                                                            : "Belum ada data jurusan",
                                                    },
                                                    ...jurusanList.map((jurusan) => ({
                                                        value: String(jurusan.id_jurusan),
                                                        label: jurusan.nama_jurusan,
                                                    })),
                                                ]}
                                                placeholder={
                                                    jurusanList.length
                                                        ? "Pilih salah satu jurusan"
                                                        : "Belum ada data jurusan"
                                                }
                                                disabled={!jurusanList.length}
                                            />
                                        </div>

                                        {selectedJurusan && (
                                            <div className="mt-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.045)]">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="text-sm font-black text-slate-900">
                                                        {selectedJurusan.nama_jurusan}
                                                    </h4>
                                                    <span
                                                        className={`border-b pb-1 text-[8px] font-black uppercase tracking-widest ${isActiveValue(selectedJurusan.status)
                                                            ? "border-emerald-200 text-emerald-600"
                                                            : "border-rose-200 text-rose-600"
                                                            }`}
                                                    >
                                                        {isActiveValue(selectedJurusan.status)
                                                            ? "Aktif"
                                                            : "Nonaktif"}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                                                    {selectedJurusan.deskripsi ||
                                                        "Belum ada deskripsi jurusan. Tambahkan deskripsi melalui Master Jurusan."}
                                                </p>

                                                <div className="mt-4 border-t border-slate-200/70 pt-4">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                            Guru Terhubung
                                                        </p>
                                                        <span className="border-b border-cyan-200 pb-1 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                            {selectedJurusanTeachers.length} Guru
                                                        </span>
                                                    </div>

                                                    {selectedJurusanTeachers.length ? (
                                                        <div className="grid gap-2">
                                                            {selectedJurusanTeachers.map((guru) => (
                                                                <div
                                                                    key={
                                                                        guru.id_guru_assessment ||
                                                                        guru.id_user ||
                                                                        guru.email_guru
                                                                    }
                                                                    className="flex flex-col gap-2 border-b border-slate-100 px-1 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-xs font-black text-slate-800">
                                                                            {guru.nama_guru || guru.nama || "Guru"}
                                                                        </p>
                                                                        <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                                                                            {guru.email_guru || guru.email || "-"}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-wider">
                                                                        <span className="text-cyan-600">
                                                                            {guru.mata_pelajaran || "Mapel belum diisi"}
                                                                        </span>
                                                                        <span className="text-amber-600">
                                                                            {guru.kelas_data?.nama_kelas ||
                                                                                guru.nama_kelas ||
                                                                                guru.kelas_wali ||
                                                                                "Kelas belum diisi"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-400">
                                                            Belum ada guru yang tersambung ke jurusan ini.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    )}

                    <section className="mb-10 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-white px-6 py-6">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                    Monitoring Program
                                </p>
                                <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-slate-900">
                                    Program di {schoolName}
                                </h2>
                                <p className="mt-1 max-w-3xl text-[12px] font-semibold leading-6 text-slate-400">
                                    Guru dapat memantau program sekolah melalui visual pie dan daftar ringkas tanpa akses ke detail transaksi program.
                                </p>
                            </div>

                            <div className="mt-5 grid gap-3 xl:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr_0.85fr_auto]">
                                <div className="relative min-w-0">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
                                    />
                                    <input
                                        value={keyword}
                                        onChange={(event) =>
                                            setKeyword(event.target.value)
                                        }
                                        placeholder="Cari program, tahun, status, AO, atau vendor..."
                                        className="h-11 w-full rounded-2xl border border-slate-100 bg-white pl-11 pr-4 text-[11px] font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                                    />
                                </div>

                                <ProgramSelectFilter
                                    label="Kategori"
                                    value={categoryFilter}
                                    onChange={setCategoryFilter}
                                    items={[
                                        { value: "ALL", label: "Semua Kategori" },
                                        { value: "AKADEMIK", label: "Akademik" },
                                        { value: "NON_AKADEMIK", label: "Non Akademik" },
                                    ]}
                                />

                                <ProgramSelectFilter
                                    label="Jenis"
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                    items={[
                                        { value: "ALL", label: "Semua Jenis" },
                                        { value: "PROJECT", label: "Project" },
                                        { value: "REGULER", label: "Reguler" },
                                    ]}
                                />

                                <ProgramSelectFilter
                                    label="Tahun"
                                    value={yearFilter}
                                    onChange={setYearFilter}
                                    items={yearOptions}
                                />

                                <ProgramSelectFilter
                                    label="Status"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    items={[
                                        { value: "ALL", label: "Semua Status" },
                                        { value: "BERJALAN", label: "Berjalan" },
                                        { value: "SELESAI", label: "Selesai" },
                                    ]}
                                />

                                <button
                                    type="button"
                                    onClick={resetFilter}
                                    className="h-11 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0] transition hover:bg-cyan-100"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            <ProgramCompositionChart
                                rows={compositionRows}
                                total={filteredPrograms.length}
                            />
                        </div>
                    </section>

                    <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-400">
                                <TrendingUp size={18} />
                            </div>

                            <div>
                                <h4 className="text-xs font-black tracking-wide">
                                    Pemberitahuan Sistem Pemantauan Terpadu
                                </h4>

                                <p className="mt-0.5 max-w-2xl text-[11px] font-normal leading-relaxed text-slate-400">
                                    Dashboard operator sekolah menampilkan profil resmi
                                    sekolah dan ringkasan program yang relevan. Informasi
                                    teknis internal, kode sistem, serta identitas database
                                    tidak ditampilkan kepada pengguna.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterPageShell>
    );
}

