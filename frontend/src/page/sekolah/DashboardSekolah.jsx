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
    ChevronDown,
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
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
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
        decoded?.sekolah_id ||
        decoded?.school_id ||
        decoded?.sekolah?.id_sekolah ||
        decoded?.sekolah?.id ||
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

const buildRows = (rows, getValue, fallback = "Lainnya") => {
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

    return Array.from(counter.values()).sort((a, b) => b.total - a.total);
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
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClass}`}
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
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Ringkasan Program
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950">
                        Komposisi Program Sekolah
                    </h2>
                </div>

                <div className="inline-flex w-fit items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-4 py-2">
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
                    accentClass="bg-cyan-50 text-cyan-600"
                />

                <ProgramMetricItem
                    label="Program Non Akademik"
                    helper="Kategori non akademik"
                    value={stats.nonAkademik}
                    icon={<Sparkles size={18} />}
                    accentClass="bg-violet-50 text-violet-600"
                />

                <ProgramMetricItem
                    label="Program Reguler"
                    helper="Jenis reguler"
                    value={stats.reguler}
                    icon={<FolderOpen size={18} />}
                    accentClass="bg-emerald-50 text-emerald-600"
                />

                <ProgramMetricItem
                    label="Program Project"
                    helper="Jenis project"
                    value={stats.project}
                    icon={<Target size={18} />}
                    accentClass="bg-amber-50 text-amber-600"
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="relative h-[300px] rounded-[1.6rem] border border-slate-100 bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={rows}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={72}
                            outerRadius={112}
                            paddingAngle={4}
                            stroke="#ffffff"
                            strokeWidth={4}
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

                <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <span className="text-[36px] font-black leading-none tracking-[-0.08em] text-slate-800">
                        {total}
                    </span>

                    <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Program
                    </span>
                </div>
            </div>

            <div className="h-[300px] rounded-[1.6rem] border border-slate-100 bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={rows}
                        layout="vertical"
                        margin={{ top: 12, right: 24, left: 10, bottom: 12 }}
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
                            tick={{
                                fontSize: 11,
                                fontWeight: 800,
                                fill: "#94A3B8",
                            }}
                        />

                        <YAxis
                            type="category"
                            dataKey="name"
                            width={150}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontWeight: 900,
                                fill: "#64748B",
                            }}
                        />

                        <RechartsTooltip />

                        <Bar dataKey="total" radius={[0, 12, 12, 0]} barSize={24}>
                            {rows.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
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

            <div className="relative mt-4">
                <select
                    value={selectedJurusanId}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-11 w-full appearance-none rounded-2xl border border-slate-100 bg-white px-4 pr-10 text-xs font-black uppercase tracking-wide text-slate-700 outline-none transition focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                >
                    <option value="">
                        {jurusanList.length
                            ? "Pilih salah satu jurusan"
                            : "Belum ada data jurusan"}
                    </option>

                    {jurusanList.map((jurusan) => (
                        <option key={jurusan.id_jurusan} value={jurusan.id_jurusan}>
                            {jurusan.nama_jurusan}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
    const [loadingSekolah, setLoadingSekolah] = useState(false);
    const [loadingProgram, setLoadingProgram] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [jurusanList, setJurusanList] = useState([]);
    const [selectedJurusanId, setSelectedJurusanId] = useState("");
    const [loadingJurusan, setLoadingJurusan] = useState(false);
    const [editingJumlahSiswa, setEditingJumlahSiswa] = useState(false);
    const [jumlahSiswaDraft, setJumlahSiswaDraft] = useState("");
    const [savingJumlahSiswa, setSavingJumlahSiswa] = useState(false);

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
        const idSekolah = getSekolahIdFromToken(user);

        console.log("ID SEKOLAH DARI TOKEN:", idSekolah);

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

            const dataSekolah = response.data?.data || response.data;

            console.log("DATA SEKOLAH DASHBOARD:", dataSekolah);
            console.log("TAHUN BINAAN DASHBOARD:", dataSekolah?.tahun_binaan);

            setSekolah(dataSekolah);
        } catch (error) {
            console.warn("Gagal mengambil detail sekolah:", error);
            setSekolah(null);
        } finally {
            setLoadingSekolah(false);
        }
    };

    const fetchProgramSekolah = async () => {
        const idSekolah = getSekolahIdFromToken(user);

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

    const fetchJurusanSekolah = async () => {
        const idSekolah = getSekolahIdFromToken(user);

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
        await Promise.all([
            fetchSekolah(),
            fetchProgramSekolah(),
            fetchJurusanSekolah(),
        ]);
    };

    useEffect(() => {
        refreshDashboard();
    }, [user?.id_sekolah, user?.sekolah_id, user?.school_id]);

    const roleId = Number(user?.id_role);
    const isGuru = roleId === 8;
    const isOperator = roleId === 9;
    const active = isActiveValue(sekolah?.status);

    const jenjang = String(
        sekolah?.jenjang ||
        user?.jenjang ||
        user?.sekolah?.jenjang ||
        user?.school?.jenjang ||
        "",
    ).toUpperCase();

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

    const programStats = useMemo(() => {
        return programs.reduce(
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
    }, [programs]);

    const filteredPrograms = useMemo(() => {
        const search = normalizeSearch(keyword);

        return programs.filter((program) => {
            const category = getProgramCategory(program);
            const type = getProgramType(program);

            const matchCategory =
                categoryFilter === "ALL" || category === categoryFilter;

            const matchType = typeFilter === "ALL" || type === typeFilter;

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

            return matchCategory && matchType && matchSearch;
        });
    }, [programs, categoryFilter, typeFilter, keyword]);

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
            alert("Jumlah siswa harus berupa angka minimal 0.");
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
            alert(
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
        setKeyword("");
    };

    const isLoading = loadingSekolah || loadingProgram || loadingJurusan;

    return (
        <MasterPageShell
            title="Overview"
            highlight="Hub Kelembagaan"
            subtitle="Sistem Monitoring dan Evaluasi Mutu Pendidikan Indonesia"
        >
            <div className="relative h-full overflow-y-auto no-scrollbar bg-slate-50 selection:bg-cyan-500 selection:text-white">
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[520px] bg-gradient-to-b from-blue-950 via-blue-900 to-cyan-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.4),transparent_50%)]" />

                    <svg
                        className="absolute bottom-0 h-32 w-full translate-y-1 transform"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill="rgba(6,182,212,0.2)"
                            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        />
                        <path
                            fill="#f8fafc"
                            d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,197.3C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                        />
                    </svg>
                </div>

                <div className="relative z-10 px-10 py-10">
                    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
                                Operator Sekolah Workspace
                            </p>

                            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">
                                Dashboard Profil Sekolah
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={refreshDashboard}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-xs font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white hover:text-slate-900"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={15} />
                            ) : (
                                <RefreshCcw size={15} />
                            )}
                            Refresh
                        </button>
                    </div>

                    <section className="mb-12 overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-6 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-8">
                        <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
                            <div className="flex w-full shrink-0 flex-col items-center justify-center lg:w-40">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={`Logo ${schoolName}`}
                                        className="max-h-32 max-w-[150px] object-contain drop-shadow-[0_18px_24px_rgba(15,23,42,0.28)] sm:max-h-36 sm:max-w-[170px]"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-100 shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
                                        <School size={42} />
                                    </div>
                                )}

                                <span className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/70">
                                    Logo dikelola Admin
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100 ring-1 ring-cyan-300/25">
                                        <School size={13} />
                                        Profil Sekolah
                                    </span>

                                    <StatusPill active={active} />
                                </div>

                                <h1 className="mt-4 break-words text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                                    {schoolName}
                                </h1>

                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-100/85">
                                    <Mail size={16} className="shrink-0 text-cyan-300" />
                                    <span className="truncate">
                                        {sekolah?.email_login || user?.email || "Email belum tersedia"}
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-200/70">
                                            NPSN
                                        </p>
                                        <p className="mt-1 text-sm font-black text-white">
                                            {sekolah?.npsn || "Belum tersedia"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-200/70">
                                            Jenjang
                                        </p>
                                        <p className="mt-1 text-sm font-black text-white">
                                            {jenjang || "Belum tersedia"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-3">
                                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/75">
                                            Kategori Binaan
                                        </p>
                                        <p className="mt-1 text-sm font-black text-cyan-100">
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

                    <ProgramPortfolioSummary stats={programStats} />

                    <div className="mb-10">
                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
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
                                <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
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

                                    <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
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

                                    <div className="mt-6 border-t border-slate-100 pt-5">
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

                                <div className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

                                    <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
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

                                    <div className="mt-6 border-t border-slate-100 pt-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Pilih Jurusan
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                    Lihat informasi jurusan yang terdaftar di sekolah.
                                                </p>
                                            </div>
                                            <Layers size={18} className="shrink-0 text-violet-500" />
                                        </div>

                                        <div className="relative mt-4">
                                            <select
                                                value={selectedJurusanId}
                                                onChange={(event) =>
                                                    setSelectedJurusanId(event.target.value)
                                                }
                                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                                            >
                                                <option value="">
                                                    {jurusanList.length
                                                        ? "Pilih salah satu jurusan"
                                                        : "Belum ada data jurusan"}
                                                </option>

                                                {jurusanList.map((jurusan) => (
                                                    <option
                                                        key={jurusan.id_jurusan}
                                                        value={jurusan.id_jurusan}
                                                    >
                                                        {jurusan.nama_jurusan}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown
                                                size={16}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>

                                        {selectedJurusan && (
                                            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="text-sm font-black text-slate-900">
                                                        {selectedJurusan.nama_jurusan}
                                                    </h4>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isActiveValue(selectedJurusan.status)
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-rose-50 text-rose-600"
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="mb-10 overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-xl shadow-slate-200/40">
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-600">
                                    <BarChart3 size={14} />
                                    <span>Portfolio Program Sekolah</span>
                                </div>

                                <h2 className="mt-1 text-2xl font-black text-slate-900">
                                    Program Akademik & Non Akademik
                                </h2>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                    Dashboard ini tidak menampilkan assessment.
                                    Fokus utama halaman adalah profil sekolah dan
                                    program yang berjalan.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <FilterButton
                                    active={categoryFilter === "ALL"}
                                    label="Semua Kategori"
                                    onClick={() => setCategoryFilter("ALL")}
                                    color={COLORS.cyan}
                                />

                                <FilterButton
                                    active={categoryFilter === "AKADEMIK"}
                                    label="Akademik"
                                    onClick={() => setCategoryFilter("AKADEMIK")}
                                    color={COLORS.blue}
                                />

                                <FilterButton
                                    active={categoryFilter === "NON_AKADEMIK"}
                                    label="Non Akademik"
                                    onClick={() =>
                                        setCategoryFilter("NON_AKADEMIK")
                                    }
                                    color={COLORS.violet}
                                />

                                <div className="mx-1 hidden h-8 w-px bg-slate-200 xl:block" />

                                <FilterButton
                                    active={typeFilter === "ALL"}
                                    label="Semua Jenis"
                                    onClick={() => setTypeFilter("ALL")}
                                    color={COLORS.cyan}
                                />

                                <FilterButton
                                    active={typeFilter === "REGULER"}
                                    label="Reguler"
                                    onClick={() => setTypeFilter("REGULER")}
                                    color={COLORS.emerald}
                                />

                                <FilterButton
                                    active={typeFilter === "PROJECT"}
                                    label="Project"
                                    onClick={() => setTypeFilter("PROJECT")}
                                    color={COLORS.amber}
                                />
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative w-full lg:max-w-md">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                                    />

                                    <input
                                        value={keyword}
                                        onChange={(event) =>
                                            setKeyword(event.target.value)
                                        }
                                        placeholder="Cari nama program, tahun, status, AO, atau vendor..."
                                        className="h-11 w-full rounded-2xl border border-slate-100 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {filteredPrograms.length} program tampil
                                    </span>

                                    {(categoryFilter !== "ALL" ||
                                        typeFilter !== "ALL" ||
                                        keyword) && (
                                        <button
                                            type="button"
                                            onClick={resetFilter}
                                            className="rounded-full bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-500 transition hover:bg-red-100"
                                        >
                                            Reset Filter
                                        </button>
                                        )}
                                </div>
                            </div>

                            <ProgramCompositionChart
                                rows={compositionRows}
                                total={filteredPrograms.length}
                            />

                            {filteredPrograms.length === 0 ? (
                                <EmptyProgramState />
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                                    {filteredPrograms.map((program) => (
                                        <ProgramCard
                                            key={getProgramId(program)}
                                            program={program}
                                        />
                                    ))}
                                </div>
                            )}
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

